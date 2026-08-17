#!/bin/bash
# =============================================================================
# ⚠️  WSZYSTKO DZIAŁA W KONTENERACH DOCKER — NIE uruchamiaj nic lokalnie!
# =============================================================================
# WebowoROS — Restaurant Order System
# Skrypt zarządzania środowiskiem Docker (dev / prod / staging)
# =============================================================================
# ⚠️  WSZYSTKO DZIAŁA W KONTENERACH DOCKER — NIE uruchamiaj nic lokalnie!
# =============================================================================

set -e

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Ścieżki
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DEV="${SCRIPT_DIR}/infra/docker/docker-compose.yml"
COMPOSE_PROD="${SCRIPT_DIR}/infra/docker/docker-compose.prod.yml"
COMPOSE_SWARM="${SCRIPT_DIR}/infra/docker/docker-compose.swarm.yml"
ENV_FILE="${SCRIPT_DIR}/.env"
ENV_EXAMPLE="${SCRIPT_DIR}/.env.example"

# Funkcja pomocnicza — logowanie
log_info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}   $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_err()   { echo -e "${RED}[ERR]${NC}  $1"; }
log_step()  { echo -e "${CYAN}➜${NC} $1"; }

# Funkcja — sprawdź czy Docker działa
check_docker() {
  if ! command -v docker &> /dev/null; then
    log_err "Docker nie jest zainstalowany. Zainstaluj Docker: https://docs.docker.com/get-docker/"
    exit 1
  fi
  if ! command -v docker compose &> /dev/null; then
    log_err "Docker Compose nie jest zainstalowany. Zainstaluj Docker Compose."
    exit 1
  fi
  if ! docker info &> /dev/null; then
    log_err "Docker daemon nie działa. Uruchom Docker: sudo systemctl start docker"
    exit 1
  fi
  log_ok "Docker i Docker Compose są gotowe"
}

# Funkcja — sprawdź .env
setup_env() {
  if [ ! -f "$ENV_FILE" ]; then
    log_warn "Brak pliku .env — kopiowanie z .env.example"
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    log_warn "🔴 KONIECZNIE EDYTUJ $ENV_FILE i ZMIEŃ WSZYSTKIE SEKRETY PRZED PRODUKCJĄ!"
    log_warn "   Szczególnie: JWT_SECRET, DB_PASSWORD, REDIS_PASSWORD"
  else
    log_ok ".env istnieje"
  fi
}

# Funkcja — status kontenerów
status() {
  log_step "Status kontenerów"
  docker compose -f "$COMPOSE_DEV" ps
  echo
  log_info "Użycie zasobów:"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || log_warn "Brak uruchomionych kontenerów"
}

# Funkcja — logi
logs() {
  local service="${1:-}"
  if [ -n "$service" ]; then
    log_step "Logi serwisu: $service"
    docker compose -f "$COMPOSE_DEV" logs -f "$service"
  else
    log_step "Logi wszystkich serwisów (Ctrl+C aby wyjść)"
    docker compose -f "$COMPOSE_DEV" logs -f
  fi
}

# Funkcja — dev (development)
dev() {
  log_step "Uruchamianie środowiska DEVELOPMENT"
  check_docker
  setup_env
  log_info "Budowanie i uruchamianie serwisów dev..."
  docker compose -f "$COMPOSE_DEV" up --build -d
  echo
  log_ok "Środowisko dev gotowe!"
  log_info "  Web (klient):      http://localhost:3000"
  log_info "  Dashboard (admin): http://localhost:3001"
  log_info "  API:               http://localhost:4000/v1"
  log_info "  Swagger Docs:      http://localhost:4000/api-docs"
  log_info "  WebSocket:         ws://localhost:4001"
  log_info "  PostgreSQL:        localhost:5432"
  log_info "  Redis:             localhost:6379"
  echo
  log_warn "Aby zatrzymać: ./start.sh stop"
  log_warn "Aby zobaczyć logi: ./start.sh logs [serwis]"
}

# Funkcja — prod (production)
prod() {
  log_step "Uruchamianie środowiska PRODUCTION"
  check_docker
  if [ ! -f "$ENV_FILE" ]; then
    log_err "Brak .env — skopiuj .env.example i skonfiguruj produkcyjne wartości!"
    exit 1
  fi
  log_info "Budowanie obrazów produkcyjnych..."
  docker compose -f "$COMPOSE_PROD" build
  log_info "Uruchamianie serwisów produkcyjnych..."
  docker compose -f "$COMPOSE_PROD" up -d
  echo
  log_ok "Środowisko produkcyjne gotowe!"
}

# Funkcja — stop
stop() {
  log_step "Zatrzymywanie serwisów"
  docker compose -f "$COMPOSE_DEV" down
  docker compose -f "$COMPOSE_PROD" down 2>/dev/null || true
  log_ok "Wszystkie serwisy zatrzymane"
}

# Funkcja — restart
restart() {
  log_step "Restart serwisów"
  stop
  dev
}

# Funkcja — clean (usuń wolumeny)
clean() {
  log_warn "To USUNIE wszystkie dane (baza danych, Redis, uploady)!"
  read -p "Czy na pewno? (tak/NIE): " confirm
  if [ "$confirm" = "tak" ]; then
    docker compose -f "$COMPOSE_DEV" down -v
    docker compose -f "$COMPOSE_PROD" down -v 2>/dev/null || true
    docker system prune -f
    log_ok "Wszystkie dane i wolumeny usunięte"
  else
    log_info "Anulowano"
  fi
}

# Funkcja — shell (wejdź do kontenera)
shell() {
  local service="${1:-api}"
  log_step "Wejście do kontenera: $service"
  docker compose -f "$COMPOSE_DEV" exec "$service" sh
}

# Funkcja — db (operacje na bazie danych)
db() {
  local cmd="${1:-status}"
  case "$cmd" in
    migrate)
      log_step "Migracje Prisma"
      docker compose -f "$COMPOSE_DEV" exec api sh -c "npx prisma migrate dev --name auto"
      ;;
    generate)
      log_step "Generowanie Prisma Client"
      docker compose -f "$COMPOSE_DEV" exec api sh -c "npx prisma generate"
      ;;
    seed)
      log_step "Seed bazy danych"
      docker compose -f "$COMPOSE_DEV" exec api sh -c "npx tsx prisma/seed.ts && npx tsx prisma/seed-upsell.ts"
      ;;
    studio)
      log_step "Prisma Studio (otwiera się w przeglądarce)"
      docker compose -f "$COMPOSE_DEV" exec api sh -c "npx prisma studio --port 5555" &
      log_info "Prisma Studio: http://localhost:5555"
      ;;
    reset)
      log_warn "To USUNIE WSZYSTKIE DANE z bazy!"
      read -p "Czy na pewno? (tak/NIE): " confirm
      if [ "$confirm" = "tak" ]; then
        docker compose -f "$COMPOSE_DEV" exec api sh -c "npx prisma migrate reset --force"
        log_ok "Baza danych zresetowana i zseedowana"
      fi
      ;;
    *)
      log_info "Dostępne komendy db: migrate, generate, seed, studio, reset"
      ;;
  esac
}

# Funkcja — test (testy)
test() {
  local target="${1:-all}"
  case "$target" in
    api)
      log_step "Testy API (E2E)"
      docker compose -f "$COMPOSE_DEV" exec api sh -c "npm run test:e2e"
      ;;
    web)
      log_step "Testy Web (Jest)"
      docker compose -f "$COMPOSE_DEV" exec web sh -c "npm test"
      ;;
    dashboard)
      log_step "Testy Dashboard (Jest)"
      docker compose -f "$COMPOSE_DEV" exec dashboard sh -c "npm test"
      ;;
    all)
      log_step "Wszystkie testy"
      docker compose -f "$COMPOSE_DEV" exec api sh -c "npm run test:e2e"
      docker compose -f "$COMPOSE_DEV" exec web sh -c "npm test"
      docker compose -f "$COMPOSE_DEV" exec dashboard sh -c "npm test"
      ;;
    *)
      log_info "Dostępne targety: api, web, dashboard, all"
      ;;
  esac
}

# Funkcja — e2e (Playwright E2E tests inside Docker)
e2e() {
  local mode="${1:-headless}"
  COMPOSE_TEST="${SCRIPT_DIR}/infra/docker/docker-compose.test.yml"

  case "$mode" in
    headless)
      log_step "Playwright E2E tests (headless, inside Docker container)"
      docker compose -f "$COMPOSE_DEV" -f "$COMPOSE_TEST" run --rm e2e
      ;;
    ui)
      log_step "Playwright E2E tests with UI mode (inside Docker container)"
      log_warn "UI mode opens a browser inside the container. Use VNC or X11 forwarding."
      docker compose -f "$COMPOSE_DEV" -f "$COMPOSE_TEST" run --rm e2e         sh -c "npx playwright test --ui --host=0.0.0.0 --port=9323"
      ;;
    report)
      log_step "Extracting Playwright HTML report from container"
      docker compose -f "$COMPOSE_DEV" -f "$COMPOSE_TEST" run --rm e2e         sh -c "npx playwright test --reporter=html && cp -r /app/e2e-report /tmp/report"
      docker cp "$(docker compose -f $COMPOSE_DEV -f $COMPOSE_TEST ps -q e2e | head -1):/tmp/report" ./e2e-report 2>/dev/null ||         log_warn "Report extraction requires running tests first: ./start.sh e2e"
      ;;
    debug)
      log_step "Playwright E2E debug mode (inside Docker container)"
      docker compose -f "$COMPOSE_DEV" -f "$COMPOSE_TEST" run --rm e2e         sh -c "npx playwright test --debug"
      ;;
    *)
      log_info "Dostępne tryby: headless, ui, report, debug"
      log_info "  headless — uruchom testy w tle (domyślnie)"
      log_info "  ui       — tryb interaktywny z podglądem"
      log_info "  report   — wygeneruj i pobierz raport HTML"
      log_info "  debug    — debugowanie krok po kroku"
      ;;
  esac
}

# Funkcja — health (szybki diagnostyka)
health() {
  "${SCRIPT_DIR}/health.sh"
}

# Funkcja — backup (backup bazy danych)
backup() {
  local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
  log_step "Tworzenie backupu bazy danych: $backup_file"
  docker compose -f "$COMPOSE_DEV" exec db pg_dump -U ros_user restaurant_db > "$backup_file"
  log_ok "Backup zapisany: $backup_file"
}

# Funkcja — restore (przywrócenie bazy)
restore() {
  local backup_file="$1"
  if [ -z "$backup_file" ]; then
    log_err "Podaj nazwę pliku backupu: ./start.sh restore backup_20240101_120000.sql"
    exit 1
  fi
  if [ ! -f "$backup_file" ]; then
    log_err "Plik nie istnieje: $backup_file"
    exit 1
  fi
  log_warn "To NAPISZE ISTNIEJĄCE DANE w bazie!"
  read -p "Czy na pewno? (tak/NIE): " confirm
  if [ "$confirm" = "tak" ]; then
    docker compose -f "$COMPOSE_DEV" exec -T db psql -U ros_user restaurant_db < "$backup_file"
    log_ok "Baza przywrócona z: $backup_file"
  fi
}

# Funkcja — deploy (Docker Swarm)
deploy() {
  log_step "Deploy do Docker Swarm"
  if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "active"; then
    log_err "Docker Swarm nie jest aktywny. Zainicjalizuj: docker swarm init"
    exit 1
  fi
  docker stack deploy -c "$COMPOSE_SWARM" webowo-ros
  log_ok "Stack wdrożony: webowo-ros"
}

# Funkcja — network (pokaż IP i status sieci)
network() {
  log_step "Konfiguracja sieci lokalnej"
  echo
  log_info "Adresy IP Raspberry Pi w sieci lokalnej:"
  ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print "  " $2}' | cut -d/ -f1
  echo
  log_info "Aby uzyskać dostęp z laptopa/telefonu w tej samej sieci:"
  echo "  1. Znajdź IP powyżej (np. 192.168.1.50)"
  echo "  2. Edytuj .env: NETWORK_HOST=192.168.1.50"
  echo "  3. Zrestartuj: ./start.sh restart"
  echo
  log_info "Dostępne adresy po konfiguracji:"
  echo "  Web (klient):      http://192.168.1.50:3000"
  echo "  Dashboard (admin): http://192.168.1.50:3001"
  echo "  API:               http://192.168.1.50:4000/v1"
  echo "  Swagger:           http://192.168.1.50:4000/api-docs"
  echo
  log_info "Status Docker networks:"
  docker network ls | grep ros-net || log_warn "Sieć ros-net nie istnieje — uruchom ./start.sh dev"
}

# Funkcja — help
help() {
  cat << EOF
${CYAN}WebowoROS — Restaurant Order System${NC}
${CYAN}Skrypt zarządzania środowiskiem Docker${NC}

${GREEN}UŻYCIE:${NC} ./start.sh [KOMENDA] [OPCJE]

${YELLOW}Główne komendy:${NC}
  dev              Uruchom środowisko development (docker-compose.yml)
  prod             Uruchom środowisko produkcyjne (docker-compose.prod.yml)
  stop             Zatrzymaj wszystkie serwisy
  restart          Zrestartuj serwisy dev
  status           Pokaż status i zużycie zasobów kontenerów
  logs [serwis]    Pokaż logi (opcjonalnie konkretnego serwisu)

${YELLOW}Zarządzanie danymi:${NC}
  clean            Usuń wszystkie dane, wolumeny i obrazy (⚠️ nieodwracalne)
  db [komenda]     Operacje na bazie danych:
                   migrate, generate, seed, studio, reset
  backup           Stwórz backup bazy danych (PostgreSQL dump)
  restore [plik]   Przywróć bazę danych z backupu

${YELLOW}Development:${NC}
  shell [serwis]   Wejdź do shell kontenera (domyślnie: api)
  test [target]    Uruchom testy: api, web, dashboard, all
  e2e [tryb]       Playwright E2E tests (WSZYSTKO w kontenerze Docker):
                   headless, ui, report, debug

${YELLOW}Deployment:${NC}
  deploy           Wdróż stack do Docker Swarm

${YELLOW}Przykłady:${NC}
  ./start.sh dev                    # Start dev
  ./start.sh logs api               # Logi API
  ./start.sh shell web              # Shell w kontenerze web
  ./start.sh db seed                # Seed bazy danych
  ./start.sh test all               # Wszystkie testy (w kontenerach)
  ./start.sh e2e                    # Playwright E2E (w kontenerze)
  ./start.sh e2e report             # Raport HTML z testów E2E
  ./start.sh network                # Pokaż IP i konfigurację sieci
  ./start.sh backup                 # Kopia zapasowa bazy
  ./start.sh restore backups/...    # Przywróć bazę

EOF
}

# Główna logika — parsowanie argumentów
case "${1:-help}" in
  dev)      dev ;;
  prod)     prod ;;
  stop)     stop ;;
  restart)  restart ;;
  status)   status ;;
  logs)     logs "$2" ;;
  clean)    clean ;;
  shell)    shell "$2" ;;
  db)       db "$2" ;;
  test)     test "$2" ;;
  e2e)      e2e "$2" ;;
  network)  network ;;
  health)   health ;;
  backup)   backup "$2" ;;
  restore)  restore "$2" ;;
  backup)   backup ;;
  restore)  restore "$2" ;;
  deploy)   deploy ;;
  help|*)   help ;;
esac
