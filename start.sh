#!/usr/bin/env bash

# =============================================================================
# WebowoROS — Secure Docker Startup Script
# =============================================================================
# Wszystko działa W KONTENERACH. Nie potrzeba pnpm/npm/Node na hoście.
# Wymaga tylko: Docker + docker compose
# =============================================================================

set -euo pipefail

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/infra/docker/docker-compose.yml"

# ─── Funkcje pomocnicze ─────────────────────────────────────────────────────

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_banner() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║                                                              ║${NC}"
  echo -e "${CYAN}║           🚀  WebowoROS — Docker Startup Script              ║${NC}"
  echo -e "${CYAN}║                                                              ║${NC}"
  echo -e "${CYAN}║     Wszystko działa w kontenerach — nie potrzeba Node      ║${NC}"
  echo -e "${CYAN}║                                                              ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

generate_secret() {
  openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64
}

prompt_value() {
  local prompt="$1"
  local default="${2:-}"
  local secret="${3:-false}"
  local value

  if [ "$secret" = "true" ]; then
    if [ -n "$default" ]; then
      read -rsp "$prompt [$default]: " value
      echo ""
      value="${value:-$default}"
    else
      read -rsp "$prompt: " value
      echo ""
    fi
  else
    if [ -n "$default" ]; then
      read -rp "$prompt [$default]: " value
      value="${value:-$default}"
    else
      read -rp "$prompt: " value
    fi
  fi
  echo "$value"
}

# ─── Sprawdzenie Docker ─────────────────────────────────────────────────────

check_docker() {
  log_info "Sprawdzanie Docker..."

  if ! command -v docker &> /dev/null; then
    log_error "Docker nie jest zainstalowany"
    echo "  Zainstaluj: https://docs.docker.com/get-docker/"
    exit 1
  fi

  if ! docker info &> /dev/null; then
    log_error "Docker daemon nie działa"
    echo "  Uruchom: sudo systemctl start docker"
    exit 1
  fi

  if ! docker compose version &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "docker compose nie jest zainstalowany"
    echo "  Zainstaluj: https://docs.docker.com/compose/install/"
    exit 1
  fi

  log_ok "Docker gotowy"
}

# ─── Konfiguracja .env ──────────────────────────────────────────────────────

setup_env_files() {
  log_info "Konfiguracja plików środowiskowych (.env)..."
  echo ""

  # ── API .env ────────────────────────────────────────────────────────────
  local api_env="$SCRIPT_DIR/apps/api/.env"

  if [ -f "$api_env" ]; then
    log_warn "apps/api/.env już istnieje"
    read -rp "  Czy chcesz nadpisać? [t/N]: " overwrite
    if [[ "${overwrite,,}" == "t" || "${overwrite,,}" == "tak" ]]; then
      rm -f "$api_env"
    fi
  fi

  if [ ! -f "$api_env" ]; then
    echo -e "${CYAN}─── Konfiguracja API (apps/api/.env) ───${NC}"
    echo ""

    local jwt_secret
    jwt_secret=$(prompt_value "JWT_SECRET (min. 32 znaki)" "" "true")
    if [ -z "$jwt_secret" ] || [ "${#jwt_secret}" -lt 32 ]; then
      jwt_secret=$(generate_secret)
      echo "  Wygenerowano losowy JWT_SECRET: ${jwt_secret:0:16}..."
    fi

    local cors_origins
    cors_origins=$(prompt_value "CORS_ORIGINS" "http://localhost:3000,http://localhost:3001")

    local sentry_dsn
    sentry_dsn=$(prompt_value "SENTRY_DSN (opcjonalnie)" "")

    local plausible_domain
    plausible_domain=$(prompt_value "NEXT_PUBLIC_PLAUSIBLE_DOMAIN (opcjonalnie)" "")

    cat > "$api_env" <<EOF
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://ros_user:ros_password@postgres:5432/restaurant_db
REDIS_URL=redis://redis:6379
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGINS=$cors_origins
UPLOAD_BASE_URL=/uploads/products
${sentry_dsn:+# SENTRY_DSN=$sentry_dsn}
PRINTER_SERVICE_URL=http://printer-service:5000
EOF

    chmod 600 "$api_env"
    log_ok "Utworzono apps/api/.env"
    echo ""
  fi

  # ── Web .env ────────────────────────────────────────────────────────────
  local web_env="$SCRIPT_DIR/apps/web/.env"
  if [ ! -f "$web_env" ]; then
    echo -e "${CYAN}─── Konfiguracja Web (apps/web/.env) ───${NC}"
    echo ""

    local web_api_url
    web_api_url=$(prompt_value "NEXT_PUBLIC_API_URL" "http://api:4000/v1")
    local web_ws_url
    web_ws_url=$(prompt_value "NEXT_PUBLIC_WS_URL" "ws://api:4001")
    local web_sentry_dsn
    web_sentry_dsn=$(prompt_value "NEXT_PUBLIC_SENTRY_DSN (opcjonalnie)" "")
    local web_plausible
    web_plausible=$(prompt_value "NEXT_PUBLIC_PLAUSIBLE_DOMAIN (opcjonalnie)" "")

    cat > "$web_env" <<EOF
NEXT_PUBLIC_API_URL=$web_api_url
NEXT_PUBLIC_WS_URL=$web_ws_url
${web_sentry_dsn:+# NEXT_PUBLIC_SENTRY_DSN=$web_sentry_dsn}
${web_plausible:+# NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$web_plausible}
EOF

    log_ok "Utworzono apps/web/.env"
    echo ""
  fi

  # ── Dashboard .env ──────────────────────────────────────────────────────
  local dash_env="$SCRIPT_DIR/apps/dashboard/.env"
  if [ ! -f "$dash_env" ]; then
    echo -e "${CYAN}─── Konfiguracja Dashboard (apps/dashboard/.env) ───${NC}"
    echo ""

    local dash_api_url
    dash_api_url=$(prompt_value "NEXT_PUBLIC_API_URL" "http://api:4000/v1")
    local dash_ws_url
    dash_ws_url=$(prompt_value "NEXT_PUBLIC_WS_URL" "ws://api:4001")
    local dash_sentry_dsn
    dash_sentry_dsn=$(prompt_value "NEXT_PUBLIC_SENTRY_DSN (opcjonalnie)" "")

    # Pobierz JWT_SECRET z API .env
    local api_jwt_secret=""
    if [ -f "$api_env" ]; then
      api_jwt_secret=$(grep "^JWT_SECRET=" "$api_env" | cut -d'=' -f2- || true)
    fi

    local dash_jwt_secret
    dash_jwt_secret=$(prompt_value "JWT_SECRET (musi być taki sam jak w API)" "${api_jwt_secret:-}")

    cat > "$dash_env" <<EOF
NEXT_PUBLIC_API_URL=$dash_api_url
NEXT_PUBLIC_WS_URL=$dash_ws_url
JWT_SECRET=$dash_jwt_secret
${dash_sentry_dsn:+# NEXT_PUBLIC_SENTRY_DSN=$dash_sentry_dsn}
EOF

    log_ok "Utworzono apps/dashboard/.env"
    echo ""
  fi

  # ── Root .env (dla docker compose) ──────────────────────────────────────
  local root_env="$SCRIPT_DIR/.env"
  if [ ! -f "$root_env" ]; then
    log_info "Tworzenie głównego .env dla docker compose..."
    local root_jwt_secret=""
    if [ -f "$api_env" ]; then
      root_jwt_secret=$(grep "^JWT_SECRET=" "$api_env" | cut -d'=' -f2- || true)
    fi
    cat > "$root_env" <<EOF
JWT_SECRET=${root_jwt_secret:-$(generate_secret)}
EOF
    log_ok "Utworzono .env (root)"
    echo ""
  fi
}

# ─── Docker Compose ─────────────────────────────────────────────────────────

start_docker() {
  log_info "Uruchamianie Docker Compose..."

  if [ -f "$SCRIPT_DIR/pnpm-lock.yaml" ]; then
    log_info "Wykryto pnpm-lock.yaml — kontenery użyją pnpm wewnątrz"
  fi

  cd "$SCRIPT_DIR/infra/docker"

  # Zbuduj obrazy
  log_info "Budowanie obrazów Docker..."
  docker compose -f "$COMPOSE_FILE" build

  # Uruchom kontenery
  log_info "Uruchamianie kontenerów..."
  docker compose -f "$COMPOSE_FILE" up -d

  log_ok "Kontenery uruchomione"
}

# ─── Czekanie na serwisy ────────────────────────────────────────────────────

wait_for_services() {
  log_info "Oczekiwanie na gotowość serwisów..."
  echo ""

  local max_attempts=30
  local attempt=0

  # PostgreSQL
  echo -n "  PostgreSQL..."
  while [ $attempt -lt $max_attempts ]; do
    if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U ros_user -d restaurant_db &>/dev/null; then
      echo -e " ${GREEN}OK${NC}"
      break
    fi
    echo -n "."
    sleep 1
    attempt=$((attempt + 1))
  done
  if [ $attempt -eq $max_attempts ]; then
    log_error "PostgreSQL timeout"
    exit 1
  fi

  # Redis
  attempt=0
  echo -n "  Redis..."
  while [ $attempt -lt $max_attempts ]; do
    if docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping | grep -q "PONG"; then
      echo -e " ${GREEN}OK${NC}"
      break
    fi
    echo -n "."
    sleep 1
    attempt=$((attempt + 1))
  done
  if [ $attempt -eq $max_attempts ]; then
    log_error "Redis timeout"
    exit 1
  fi

  echo ""
}

# ─── Migracje i seed (W KONTENERZE) ─────────────────────────────────────────

setup_database() {
  log_info "Migracje bazy danych (w kontenerze API)..."
  docker compose -f "$COMPOSE_FILE" exec -T api sh -c "cd /app/apps/api && npx prisma migrate deploy"
  log_ok "Migracje wykonane"

  log_info "Generowanie Prisma Client (w kontenerze API)..."
  docker compose -f "$COMPOSE_FILE" exec -T api sh -c "cd /app/apps/api && npx prisma generate"
  log_ok "Prisma Client wygenerowany"

  read -rp "Czy chcesz wypełnić bazę przykładowymi danymi (seed)? [t/N]: " seed
  if [[ "${seed,,}" == "t" || "${seed,,}" == "tak" ]]; then
    log_info "Seed danych (w kontenerze API)..."
    docker compose -f "$COMPOSE_FILE" exec -T api sh -c "cd /app/apps/api && npx ts-node prisma/seed.ts"
    docker compose -f "$COMPOSE_FILE" exec -T api sh -c "cd /app/apps/api && npx ts-node prisma/seed-upsell.ts" 2>/dev/null || true
    log_ok "Seed zakończony"
  fi
}

# ─── Podsumowanie ───────────────────────────────────────────────────────────

print_summary() {
  echo ""
  echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✅ WebowoROS uruchomiony pomyślnie!${NC}"
  echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  ${CYAN}🌐 Web (klient):${NC}     http://localhost:3000"
  echo -e "  ${CYAN}🔧 Dashboard:${NC}        http://localhost:3001"
  echo -e "  ${CYAN}📡 API:${NC}              http://localhost:4000/v1"
  echo -e "  ${CYAN}📖 Swagger Docs:${NC}     http://localhost:4000/v1/docs"
  echo -e "  ${CYAN}📊 Prometheus:${NC}       http://localhost:4000/v1/metrics"
  echo -e "  ${CYAN}💓 Health Check:${NC}     http://localhost:4000/v1/health"
  echo ""
  echo -e "  ${YELLOW}Przydatne komendy:${NC}"
  echo -e "    docker compose -f infra/docker/docker-compose.yml logs -f api"
  echo -e "    docker compose -f infra/docker/docker-compose.yml logs -f web"
  echo -e "    docker compose -f infra/docker/docker-compose.yml down"
  echo ""
  echo -e "  ${YELLOW}Logowanie (default seed):${NC}"
  echo -e "    Email:    admin@weboworos.pl"
  echo -e "    Password: Admin123!"
  echo ""
}

# ─── Główna funkcja ─────────────────────────────────────────────────────────

main() {
  print_banner
  check_docker
  setup_env_files
  start_docker
  wait_for_services
  setup_database
  print_summary
}

if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
  main "$@"
fi
