#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  WebowoROS — Advanced Unified Management Console
#  Restaurant Order System | One script to rule them all
#  v2.0 — Interactive & Automated
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail
shopt -s checkwinsize

# ─── Version ─────────────────────────────────────────────────────────────────
readonly VERSION="2.0.0"

# ─── Paths ───────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="webowo-ros"
COMPOSE_DEV="${SCRIPT_DIR}/infra/docker/docker-compose.yml"
COMPOSE_PROD="${SCRIPT_DIR}/infra/docker/docker-compose.prod.yml"
COMPOSE_SWARM="${SCRIPT_DIR}/infra/docker/docker-compose.swarm.yml"
COMPOSE_TEST="${SCRIPT_DIR}/infra/docker/docker-compose.test.yml"
ENV_FILE="${SCRIPT_DIR}/.env"
ENV_EXAMPLE="${SCRIPT_DIR}/.env.example"
LOG_DIR="${SCRIPT_DIR}/.webowo/logs"
CONFIG_FILE="${SCRIPT_DIR}/.webowo/config"

# ─── Colors & Styles ─────────────────────────────────────────────────────────
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[1;33m'
C_BLUE='\033[0;34m'
C_CYAN='\033[0;36m'
C_MAGENTA='\033[0;35m'
C_WHITE='\033[1;37m'
C_DIM='\033[2m'
C_BOLD='\033[1m'
C_RESET='\033[0m'

# ─── Unicode Box Drawing ─────────────────────────────────────────────────────
B_TL='┌'; B_TR='┐'; B_BL='└'; B_BR='┘'
B_H='─'; B_V='│'; B_L='├'; B_R='┤'; B_T='┬'; B_B='┴'; B_C='┼'

# ─── Logging ─────────────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/webowo-$(date +%Y%m%d).log"

_log() {
  local level="$1"; local msg="$2"; local color="$3"
  local timestamp; timestamp=$(date '+%H:%M:%S')
  echo -e "${color}[${timestamp}] [${level}]${C_RESET} $msg"
  echo "[${timestamp}] [${level}] $msg" >> "$LOG_FILE"
}
log_info()  { _log "INFO"  "$1" "$C_BLUE"; }
log_ok()    { _log "OK"    "$1" "$C_GREEN"; }
log_warn()  { _log "WARN"  "$1" "$C_YELLOW"; }
log_err()   { _log "ERR"   "$1" "$C_RED"; }
log_step()  { _log "STEP"  "$1" "$C_CYAN"; }
log_debug() { _log "DEBUG" "$1" "$C_MAGENTA"; }

# ─── UI Helpers ──────────────────────────────────────────────────────────────
hr() { printf '%*s\n' "${COLUMNS:-80}" '' | tr ' ' '─'; }
box_top()    { echo -e "${C_CYAN}${B_TL}$(printf '%*s' "$((COLUMNS-2))" '' | tr ' ' '─')${B_TR}${C_RESET}"; }
box_mid()    { echo -e "${C_CYAN}${B_L}$(printf '%*s' "$((COLUMNS-2))" '' | tr ' ' '─')${B_R}${C_RESET}"; }
box_bot()    { echo -e "${C_CYAN}${B_BL}$(printf '%*s' "$((COLUMNS-2))" '' | tr ' ' '─')${B_BR}${C_RESET}"; }
box_line()   { local text="$1"; local pad=$(( (COLUMNS - 2 - ${#text}) / 2 )); echo -e "${C_CYAN}${B_V}${C_RESET}$(printf '%*s' "$pad" '')${C_WHITE}${text}${C_RESET}$(printf '%*s' "$((COLUMNS - 2 - pad - ${#text}))" '')${C_CYAN}${B_V}${C_RESET}"; }

spinner() {
  local pid=$1; local delay=0.1; local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  while kill -0 "$pid" 2>/dev/null; do
    for i in $(seq 0 ${#spin}); do
      printf "\r${C_CYAN}%s${C_RESET} %s" "${spin:$i:1}" "$2"
      sleep $delay
    done
  done
  printf "\r%*s\r" "$((${#2}+2))" ""
}

progress_bar() {
  local current=$1; local total=$2; local width=40
  local filled=$(( current * width / total ))
  local empty=$(( width - filled ))
  printf "${C_DIM}[${C_GREEN}"
  printf '%*s' "$filled" '' | tr ' ' '█'
  printf "${C_DIM}"
  printf '%*s' "$empty" '' | tr ' ' '░'
  printf "${C_DIM}]${C_RESET} %3d%%\n" "$(( current * 100 / total ))"
}

# ─── Banner ──────────────────────────────────────────────────────────────────
banner() {
  clear 2>/dev/null || true
  local w=${COLUMNS:-80}
  echo
  echo -e "${C_CYAN}"
  echo '    _      __      __       ___  ____  _____ '
  echo '   | | /| / /___  / /____  / _ \/ __ \/ ___/ '
  echo '   | |/ |/ / __ \/ __/ _ \/ , _/ /_/ / (_ /  '
  echo '   |__/|__/\___/_/  \___/_/|_|\____/\___/   '
  echo -e "${C_RESET}"
  local ver="v${VERSION}"
  local pad=$(( (w - 34 - ${#ver}) / 2 ))
  printf "%*s${C_DIM}Restaurant Order System${C_RESET} ${C_YELLOW}%s${C_RESET}\n" "$pad" '' "$ver"
  echo
}

# ─── Auto-detect LAN IP ──────────────────────────────────────────────────────
detect_lan_ip() {
  local ip
  ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  [ -z "$ip" ] && ip=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
  [ -z "$ip" ] && ip=$(ip addr show 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | head -1 | awk '{print $2}' | cut -d/ -f1)
  [ -z "$ip" ] && ip="localhost"
  echo "$ip"
}

LAN_IP="$(detect_lan_ip)"

# ─── Docker Checks ───────────────────────────────────────────────────────────
check_docker() {
  log_step "Sprawdzanie Docker..."
  if ! command -v docker &>/dev/null; then
    log_err "Docker nie jest zainstalowany."
    echo -e "  ${C_DIM}curl -fsSL https://get.docker.com | sh${C_RESET}"
    echo -e "  ${C_DIM}sudo usermod -aG docker \$USER && newgrp docker${C_RESET}"
    return 1
  fi
  if ! docker info &>/dev/null; then
    log_err "Docker daemon nie działa."
    echo -e "  ${C_DIM}sudo systemctl start docker${C_RESET}"
    return 1
  fi
  if ! docker compose version &>/dev/null && ! docker-compose --version &>/dev/null; then
    log_err "Docker Compose nie jest zainstalowany."
    return 1
  fi
  log_ok "Docker i Docker Compose gotowe"
  return 0
}

# ─── Port Check ──────────────────────────────────────────────────────────────
check_ports() {
  log_step "Sprawdzanie portów..."
  local ports=(3000 3001 4000 4001 5432 6379)
  local busy=()
  for p in "${ports[@]}"; do
    if ss -tlnp 2>/dev/null | grep -q ":${p} " || netstat -tlnp 2>/dev/null | grep -q ":${p} "; then
      busy+=("$p")
    fi
  done
  if [ ${#busy[@]} -gt 0 ]; then
    log_warn "Zajęte porty: ${busy[*]}"
    log_info "Zatrzymuję istniejące kontenery..."
    docker compose -f "$COMPOSE_DEV" down 2>/dev/null || true
    sleep 2
  fi
  log_ok "Porty wolne"
}

# ─── .env Wizard ─────────────────────────────────────────────────────────────
env_wizard() {
  if [ -f "$ENV_FILE" ]; then
    local current_ip
    current_ip=$(grep -oP 'NEXT_PUBLIC_API_URL=http://\K[^/:]+' "$ENV_FILE" 2>/dev/null || echo "")
    if [ "$current_ip" != "$LAN_IP" ] && [ "$LAN_IP" != "localhost" ] && [ -n "$current_ip" ]; then
      log_warn "Wykryto zmianę IP: ${current_ip} → ${LAN_IP}"
      sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://${LAN_IP}:4000/v1|" "$ENV_FILE"
      sed -i "s|NEXT_PUBLIC_WS_URL=.*|NEXT_PUBLIC_WS_URL=ws://${LAN_IP}:4001|" "$ENV_FILE"
      sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://${LAN_IP}:3000,http://${LAN_IP}:3001|" "$ENV_FILE"
      log_ok ".env zaktualizowany"
    fi
    return 0
  fi

  log_warn "Brak pliku .env"
  if [ -f "$ENV_EXAMPLE" ]; then
    log_info "Kopiowanie z .env.example..."
    cp "$ENV_EXAMPLE" "$ENV_FILE"
  else
    log_step "Kreator konfiguracji .env"
    echo
    read -rp "  Nazwa bazy [restaurant_db]: " db_name
    db_name=${db_name:-restaurant_db}
    read -rp "  Użytkownik DB [ros_user]: " db_user
    db_user=${db_user:-ros_user}
    read -rsp "  Hasło DB [ros_pass]: " db_pass
    db_pass=${db_pass:-ros_pass}
    echo
    read -rsp "  JWT Secret (pozostaw puste dla auto-generacji): " jwt_secret
    [ -z "$jwt_secret" ] && jwt_secret="$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 64)"
    echo
    read -rp "  Tryb [development]: " node_env
    node_env=${node_env:-development}

    cat > "$ENV_FILE" <<EOF
NODE_ENV=${node_env}
DATABASE_URL=postgresql://${db_user}:${db_pass}@db:5432/${db_name}
REDIS_URL=redis://redis:6379
JWT_SECRET=${jwt_secret}
API_PORT=4000
WS_PORT=4001
WEB_PORT=3000
DASHBOARD_PORT=3001
NEXT_PUBLIC_API_URL=http://${LAN_IP}:4000/v1
NEXT_PUBLIC_WS_URL=ws://${LAN_IP}:4001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://${LAN_IP}:3000,http://${LAN_IP}:3001
EOF
  fi
  log_ok ".env gotowy"
}

# ─── Wait for Service ────────────────────────────────────────────────────────
wait_for() {
  local service="$1"; local check_cmd="$2"; local max="${3:-60}"
  local i=0
  log_info "Czekam na ${service}..."
  while [ $i -lt $max ]; do
    if eval "$check_cmd" &>/dev/null; then
      log_ok "${service} gotowy (${i}s)"
      return 0
    fi
    i=$((i+1))
    printf "\r  ${C_DIM}⏳ %d/%d s${C_RESET}" "$i" "$max"
    sleep 1
  done
  echo
  log_err "${service} nie wystartował w ${max}s"
  return 1
}

# ─── Interactive Menu ────────────────────────────────────────────────────────
show_menu() {
  banner
  box_top
  box_line "  GŁÓWNE MENU  "
  box_mid
  box_line "  [1]  🚀  Start systemu (dev)"
  box_line "  [2]  🛑  Zatrzymaj system"
  box_line "  [3]  🔄  Restart systemu"
  box_line "  [4]  📊  Status i zasoby"
  box_line "  [5]  📜  Logi (wybierz serwis)"
  box_line "  [6]  🐚  Wejdź do kontenera"
  box_line "  [7]  🗄️   Baza danych"
  box_line "  [8]  🧪  Testy"
  box_line "  [9]  💊  Diagnostyka i naprawa"
  box_line "  [10] ⚙️   Instalacja / Rebuild"
  box_line "  [11] 🧹  Wyczyść wszystko"
  box_line "  [12] 🌐  Informacje sieciowe"
  box_line "  [0]  ❌  Wyjście"
  box_bot
  echo
}

# ─── Service Selector ───────────────────────────────────────────────────────
pick_service() {
  echo -e "${C_CYAN}Dostępne serwisy:${C_RESET}"
  echo "  1) api        2) web        3) dashboard"
  echo "  4) db         5) redis      6) postgres"
  read -rp "Wybierz serwis [1-6]: " choice
  case $choice in
    1) echo "api";;
    2) echo "web";;
    3) echo "dashboard";;
    4|6) echo "db";;
    5) echo "redis";;
    *) echo "api";;
  esac
}

# ═══════════════════════════════════════════════════════════════════════════════
#  COMMANDS
# ═══════════════════════════════════════════════════════════════════════════════

cmd_install() {
  banner
  log_step "Instalacja WebowoROS"
  check_docker || return 1
  env_wizard
  check_ports
  log_info "Budowanie obrazów (to potrwa 5-15 min)..."
  docker compose -f "$COMPOSE_DEV" build --no-cache &
  local pid=$!
  spinner $pid "Budowanie obrazów Docker..."
  wait $pid
  log_ok "Instalacja zakończona!"
  echo
  log_info "Uruchom: ./webowo.sh start"
}

cmd_start() {
  banner
  log_step "Start WebowoROS"
  check_docker || return 1
  env_wizard
  check_ports

  log_info "Uruchamianie kontenerów..."
  docker compose -f "$COMPOSE_DEV" up --build -d &
  local pid=$!
  spinner $pid "Uruchamianie kontenerów..."
  wait $pid

  wait_for "PostgreSQL" "docker compose -f $COMPOSE_DEV exec -T postgres pg_isready -U ros_user" 30 || true
  wait_for "Redis" "docker compose -f $COMPOSE_DEV exec -T redis redis-cli ping" 15 || true
  wait_for "API" "curl -sf http://${LAN_IP}:4000/v1/health" 60 || {
    log_err "API nie odpowiada. Sprawdź logi: ./webowo.sh logs api"
    return 1
  }

  echo
  box_top
  box_line "  ✅ SYSTEM GOTOWY  "
  box_mid
  box_line "  🌐  Web:        http://${LAN_IP}:3000"
  box_line "  🔧  Dashboard:  http://${LAN_IP}:3001"
  box_line "  📡  API:        http://${LAN_IP}:4000/v1"
  box_line "  📖  Swagger:    http://${LAN_IP}:4000/v1/docs"
  box_line "  🔌  WebSocket:  ws://${LAN_IP}:4001"
  box_bot
  echo
}

cmd_stop() {
  log_step "Zatrzymywanie..."
  docker compose -f "$COMPOSE_DEV" down 2>/dev/null || true
  docker compose -f "$COMPOSE_PROD" down 2>/dev/null || true
  log_ok "Zatrzymane"
}

cmd_restart() {
  cmd_stop
  cmd_start
}

cmd_status() {
  banner
  log_step "Status kontenerów"
  docker compose -f "$COMPOSE_DEV" ps 2>/dev/null || log_warn "Brak kontenerów"
  echo
  log_step "Zużycie zasobów"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || true
}

cmd_logs() {
  local svc="${1:-}"
  if [ -z "$svc" ]; then
    svc=$(pick_service)
  fi
  log_step "Logi: $svc (Ctrl+C aby wyjść)"
  docker compose -f "$COMPOSE_DEV" logs -f --tail=100 "$svc"
}

cmd_shell() {
  local svc="${1:-}"
  if [ -z "$svc" ]; then
    svc=$(pick_service)
  fi
  log_step "Wejście do: $svc"
  docker compose -f "$COMPOSE_DEV" exec "$svc" sh
}

cmd_db_menu() {
  banner
  box_top
  box_line "  BAZA DANYCH  "
  box_mid
  box_line "  [1]  🚀  Migracje (prisma migrate dev)"
  box_line "  [2]  🔄  Generuj Prisma Client"
  box_line "  [3]  🌱  Seed danych testowych"
  box_line "  [4]  🗄️   Prisma Studio"
  box_line "  [5]  💾  Backup bazy"
  box_line "  [6]  📥  Przywróć z backupu"
  box_line "  [7]  ⚠️   RESET bazy (USUWA DANE!)"
  box_line "  [0]  Powrót"
  box_bot
  read -rp "Wybierz: " choice
  case $choice in
    1) docker compose -f "$COMPOSE_DEV" exec api sh -c "npx prisma migrate dev --name auto" ;;
    2) docker compose -f "$COMPOSE_DEV" exec api sh -c "npx prisma generate" ;;
    3) docker compose -f "$COMPOSE_DEV" exec api sh -c "npx tsx prisma/seed.ts && npx tsx prisma/seed-upsell.ts" ;;
    4)
      docker compose -f "$COMPOSE_DEV" exec api sh -c "npx prisma studio --port 5555" &
      log_ok "Prisma Studio: http://${LAN_IP}:5555"
      ;;
    5)
      local bf="backup_$(date +%Y%m%d_%H%M%S).sql"
      docker compose -f "$COMPOSE_DEV" exec db pg_dump -U ros_user restaurant_db > "$bf"
      log_ok "Backup: $bf"
      ;;
    6)
      read -rp "Nazwa pliku .sql: " bf
      [ -f "$bf" ] && docker compose -f "$COMPOSE_DEV" exec -T db psql -U ros_user restaurant_db < "$bf" && log_ok "Przywrócono" || log_err "Brak pliku"
      ;;
    7)
      log_warn "To USUNIE WSZYSTKIE DANE!"
      read -rp "Wpisz 'tak' aby potwierdzić: " conf
      [ "$conf" = "tak" ] && docker compose -f "$COMPOSE_DEV" exec api sh -c "npx prisma migrate reset --force" && log_ok "Zresetowano"
      ;;
  esac
}

cmd_test() {
  banner
  box_top
  box_line "  TESTY  "
  box_mid
  box_line "  [1]  API E2E"
  box_line "  [2]  Web (Jest)"
  box_line "  [3]  Dashboard (Jest)"
  box_line "  [4]  Wszystkie"
  box_line "  [0]  Powrót"
  box_bot
  read -rp "Wybierz: " c
  case $c in
    1) docker compose -f "$COMPOSE_DEV" exec api sh -c "npm run test:e2e" ;;
    2) docker compose -f "$COMPOSE_DEV" exec web sh -c "npm test" ;;
    3) docker compose -f "$COMPOSE_DEV" exec dashboard sh -c "npm test" ;;
    4)
      docker compose -f "$COMPOSE_DEV" exec api sh -c "npm run test:e2e"
      docker compose -f "$COMPOSE_DEV" exec web sh -c "npm test"
      docker compose -f "$COMPOSE_DEV" exec dashboard sh -c "npm test"
      ;;
  esac
}

cmd_health() {
  banner
  log_step "Diagnostyka systemu"
  echo
  local services=(api web dashboard db redis)
  for svc in "${services[@]}"; do
    local status
    status=$(docker compose -f "$COMPOSE_DEV" ps -q "$svc" 2>/dev/null | head -1)
    if [ -n "$status" ] && docker inspect -f '{{.State.Status}}' "$status" 2>/dev/null | grep -q "running"; then
      echo -e "  ${C_GREEN}✓${C_RESET} ${svc} — running"
    else
      echo -e "  ${C_RED}✗${C_RESET} ${svc} — stopped"
    fi
  done
  echo
  log_step "Testy połączeń"
  curl -sf "http://${LAN_IP}:4000/v1/health" &>/dev/null && echo -e "  ${C_GREEN}✓${C_RESET} API /v1/health" || echo -e "  ${C_RED}✗${C_RESET} API /v1/health"
  curl -sf "http://${LAN_IP}:3000" &>/dev/null && echo -e "  ${C_GREEN}✓${C_RESET} Web :3000" || echo -e "  ${C_RED}✗${C_RESET} Web :3000"
  curl -sf "http://${LAN_IP}:3001" &>/dev/null && echo -e "  ${C_GREEN}✓${C_RESET} Dashboard :3001" || echo -e "  ${C_RED}✗${C_RESET} Dashboard :3001"
  echo
  log_step "Informacje sieciowe"
  echo -e "  ${C_DIM}LAN IP:${C_RESET}   ${LAN_IP}"
  echo -e "  ${C_DIM}Docker:${C_RESET} $(docker --version 2>/dev/null || echo 'brak')"
  echo -e "  ${C_DIM}Compose:${C_RESET} $(docker compose version 2>/dev/null | head -1 || echo 'brak')"
  echo
  read -rp "Naciśnij Enter aby kontynuować..."
}

cmd_clean() {
  banner
  log_warn "To USUNIE WSZYSTKIE DANE, OBRAZY I WOLUMENY!"
  read -rp "Wpisz 'kasuj' aby potwierdzić: " conf
  if [ "$conf" = "kasuj" ]; then
    cmd_stop
    docker compose -f "$COMPOSE_DEV" down -v 2>/dev/null || true
    docker system prune -af --volumes 2>/dev/null || true
    rm -rf "${SCRIPT_DIR}/.webowo"
    log_ok "Wszystko wyczyszczone"
  else
    log_info "Anulowano"
  fi
}

cmd_network() {
  banner
  log_step "Informacje sieciowe"
  echo
  echo -e "  ${C_CYAN}Adresy dostępowe:${C_RESET}"
  echo -e "    🌐  Web:        ${C_GREEN}http://${LAN_IP}:3000${C_RESET}"
  echo -e "    🔧  Dashboard:  ${C_GREEN}http://${LAN_IP}:3001${C_RESET}"
  echo -e "    📡  API:        ${C_GREEN}http://${LAN_IP}:4000/v1${C_RESET}"
  echo -e "    📖  Swagger:    ${C_GREEN}http://${LAN_IP}:4000/v1/docs${C_RESET}"
  echo -e "    🔌  WebSocket:  ${C_GREEN}ws://${LAN_IP}:4001${C_RESET}"
  echo
  echo -e "  ${C_CYAN}Z tego urządzenia (Raspberry):${C_RESET}"
  echo -e "    http://localhost:3000  |  http://localhost:3001"
  echo
  read -rp "Naciśnij Enter aby kontynuować..."
}

# ═══════════════════════════════════════════════════════════════════════════════
#  INTERACTIVE MODE
# ═══════════════════════════════════════════════════════════════════════════════

interactive_mode() {
  while true; do
    show_menu
    read -rp "Wybierz opcję [0-12]: " choice
    case $choice in
      1) cmd_start ;;
      2) cmd_stop ;;
      3) cmd_restart ;;
      4) cmd_status; read -rp "Naciśnij Enter..." ;;
      5) cmd_logs ;;
      6) cmd_shell ;;
      7) cmd_db_menu ;;
      8) cmd_test ;;
      9) cmd_health ;;
      10) cmd_install ;;
      11) cmd_clean ;;
      12) cmd_network ;;
      0) echo -e "\n${C_GREEN}Do zobaczenia! 👋${C_RESET}\n"; exit 0 ;;
      *) log_err "Nieprawidłowy wybór"; sleep 1 ;;
    esac
  done
}

# ═══════════════════════════════════════════════════════════════════════════════
#  CLI MODE
# ═══════════════════════════════════════════════════════════════════════════════

cmd_help() {
  banner
  echo -e "${BOLD}Użycie:${C_RESET} ./webowo.sh <komenda> [opcje]"
  echo
  echo -e "${C_CYAN}Komendy:${C_RESET}"
  echo "  install       — pierwsza instalacja"
  echo "  start         — start dev + czekaj na gotowość"
  echo "  stop          — zatrzymaj wszystko"
  echo "  restart       — restart"
  echo "  status        — status kontenerów"
  echo "  logs [svc]    — logi serwisu"
  echo "  shell [svc]   — shell w kontenerze"
  echo "  db            — menu bazy danych"
  echo "  test          — menu testów"
  echo "  health        — diagnostyka"
  echo "  clean         — wyczyść WSZYSTKO"
  echo "  network       — info sieciowe"
  echo "  menu          — tryb interaktywny (domyślny)"
  echo
  echo -e "${C_DIM}Bez argumentów uruchamia tryb interaktywny.${C_RESET}"
}

# ═══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════════

main() {
  local cmd="${1:-menu}"
  shift 2>/dev/null || true

  case "$cmd" in
    install)       cmd_install "$@" ;;
    start|up|dev)  cmd_start "$@" ;;
    stop|down)     cmd_stop "$@" ;;
    restart)       cmd_restart "$@" ;;
    status|ps)     cmd_status "$@" ;;
    logs)          cmd_logs "$@" ;;
    shell|exec)    cmd_shell "$@" ;;
    db)            cmd_db_menu "$@" ;;
    test)          cmd_test "$@" ;;
    health|diag)   cmd_health "$@" ;;
    clean|purge)   cmd_clean "$@" ;;
    network|info)  cmd_network "$@" ;;
    menu|""|-i)    interactive_mode ;;
    help|--help|-h) cmd_help "$@" ;;
    *)
      log_err "Nieznana komenda: $cmd"
      echo
      cmd_help
      exit 1
      ;;
  esac
}

main "$@"
