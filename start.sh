#!/bin/bash
# ============================================
# WebowoROS — Docker-First Startup Script
# ============================================
# Wszystko działa w kontenerach. Host nie potrzebuje Node.js, npm, pnpm.
# Wymagania: Docker + Docker Compose

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}"
cat <<'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🍕  WebowoROS  —  Restaurant Order System           ║
║                                                              ║
║              100% Docker — host nie potrzebuje niczego        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check prerequisites
echo -e "${YELLOW}🔍 Sprawdzam wymagania...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker nie jest zainstalowany.${NC}"
    echo -e "   Instalacja: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose nie jest zainstalowany.${NC}"
    echo -e "   Instalacja: https://docs.docker.com/compose/install/"
    exit 1
fi

DOCKER_COMPOSE="docker compose"
if ! docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${GREEN}✅ Docker i Docker Compose gotowe${NC}"

# Generate JWT_SECRET if not set
if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}🔐 Generuję bezpieczny JWT_SECRET...${NC}"
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 48 /dev/urandom | base64)
    echo -e "${GREEN}✅ JWT_SECRET wygenerowany${NC}"
else
    echo -e "${GREEN}✅ Używam istniejącego JWT_SECRET${NC}"
fi

# Create .env if missing
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📄 Tworzę .env...${NC}"
    cp .env.example .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
    echo -e "${GREEN}✅ .env utworzony${NC}"
else
    echo -e "${GREEN}✅ .env już istnieje${NC}"
fi

# Mode selection
echo ""
echo -e "${BLUE}Wybierz tryb uruchomienia:${NC}"
echo ""
echo -e "  ${GREEN}1)${NC} 🐳  Development — Docker Compose (hot-reload, pełne logi)"
echo -e "  ${GREEN}2)${NC} 🐳  Production  — Docker Compose Prod (optymalizowane)"
echo -e "  ${GREEN}3)${NC} 🧹  Czyszczenie  — usuń wszystko i zacznij od nowa"
echo ""
read -p "Wybór [1-3]: " MODE

case $MODE in
    1)
        echo ""
        echo -e "${BLUE}🚀 Uruchamiam Development stack...${NC}"
        echo -e "${YELLOW}   Budowanie obrazów (pierwsze uruchomienie może potrwać 2-5 min)...${NC}"
        echo ""

        cd infra/docker
        $DOCKER_COMPOSE up -d --build

        echo ""
        echo -e "${GREEN}✅ Kontenery zostały uruchomione!${NC}"
        echo ""
        echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║  🎉 WebowoROS działa!                                        ║${NC}"
        echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
        echo -e "${CYAN}║  🌐 Strona klienta:  http://localhost:3000                   ║${NC}"
        echo -e "${CYAN}║  🔧 Dashboard:       http://localhost:3001                   ║${NC}"
        echo -e "${CYAN}║  📡 API:             http://localhost:4000/v1                ║${NC}"
        echo -e "${CYAN}║  📖 API Docs:        http://localhost:4000/v1/docs           ║${NC}"
        echo -e "${CYAN}║  📊 Metrics:         http://localhost:4000/v1/metrics        ║${NC}"
        echo -e "${CYAN}║  🔌 WebSocket:       ws://localhost:4001                     ║${NC}"
        echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Domyślne dane logowania do dashboardu:${NC}"
        echo -e "  Email:    admin@example.com"
        echo -e "  Hasło:    Admin123!"
        echo -e "${RED}⚠️  ZMIEŃ hasło natychmiast po pierwszym logowaniu!${NC}"
        echo ""
        echo -e "${YELLOW}Przydatne komendy:${NC}"
        echo -e "  Logi API:       ${CYAN}docker logs -f ros-api${NC}"
        echo -e "  Logi Web:       ${CYAN}docker logs -f ros-web${NC}"
        echo -e "  Status:         ${CYAN}docker ps${NC}"
        echo -e "  Zatrzymaj:      ${CYAN}cd infra/docker && docker compose down${NC}"
        ;;

    2)
        echo ""
        echo -e "${BLUE}🚀 Uruchamiam Production stack...${NC}"
        if [ ! -f ".env" ] || [ -z "$(grep JWT_SECRET .env | cut -d= -f2)" ]; then
            echo -e "${RED}❌ Ustaw JWT_SECRET w .env przed uruchomieniem produkcji!${NC}"
            exit 1
        fi
        cd infra/docker
        cp docker-compose.prod.yml docker-compose.yml
        $DOCKER_COMPOSE up -d --build
        echo -e "${GREEN}✅ Production stack uruchomiony${NC}"
        ;;

    3)
        echo -e "${YELLOW}🧹 Czyszczę wszystko...${NC}"
        cd infra/docker
        $DOCKER_COMPOSE down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Wyczyszczone. Uruchom ponownie żeby zbudować od nowa.${NC}"
        ;;

    *)
        echo -e "${RED}❌ Nieprawidłowy wybór${NC}"
        exit 1
        ;;
esac
