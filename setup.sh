#!/bin/bash
# =============================================================================
# WebowoROS — First Time Setup Script
# Run this once after cloning/unzipping the repository
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo "═══════════════════════════════════════════════════════════════"
echo "  WebowoROS — First Time Setup"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check Docker
log_info "Checking Docker..."
if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Install Docker first:"
    echo "  curl -fsSL https://get.docker.com | sh"
    exit 1
fi
if ! command -v docker compose &> /dev/null; then
    log_error "Docker Compose not found."
    exit 1
fi
log_success "Docker OK"

# Check Node.js (optional, for local dev tools)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        log_success "Node.js $(node -v) OK"
    else
        log_warn "Node.js $(node -v) — version 20+ recommended"
    fi
else
    log_warn "Node.js not found (optional, all dev tools run in Docker)"
fi

# Create .env from example
if [ ! -f "${SCRIPT_DIR}/.env" ]; then
    log_info "Creating .env from .env.example..."
    cp "${SCRIPT_DIR}/.env.example" "${SCRIPT_DIR}/.env"
    log_success ".env created"
    log_warn "IMPORTANT: Edit .env and change SECRETS before production!"
    echo ""
    echo "  nano ${SCRIPT_DIR}/.env"
    echo ""
else
    log_warn ".env already exists — skipping"
fi

# Create uploads directory
mkdir -p "${SCRIPT_DIR}/uploads"
log_success "Uploads directory created"

# Create backups directory
mkdir -p "${SCRIPT_DIR}/backups"
log_success "Backups directory created"

# Build Docker images
log_info "Building Docker images (this may take 5-10 minutes)..."
docker compose -f "${SCRIPT_DIR}/infra/docker/docker-compose.yml" build --no-cache
log_success "Docker images built"

# Generate Prisma client
log_info "Generating Prisma client..."
docker compose -f "${SCRIPT_DIR}/infra/docker/docker-compose.yml" run --rm api sh -c "cd /app/apps/api && npx prisma generate"
log_success "Prisma client generated"

# Start services
log_info "Starting services..."
"${SCRIPT_DIR}/start.sh" dev

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ Setup complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Services starting... Check logs with:"
echo "  ./start.sh logs"
echo ""
echo "Default access:"
echo "  Web:       http://localhost:3000"
echo "  Dashboard: http://localhost:3001"
echo "  API:       http://localhost:4000/v1"
echo "  Swagger:   http://localhost:4000/api-docs"
echo ""
echo "For network access (laptop/phone):"
echo "  ./start.sh network"
echo "  # Edit .env: NETWORK_HOST=<your-pi-ip>"
echo "  ./start.sh restart"
echo ""
