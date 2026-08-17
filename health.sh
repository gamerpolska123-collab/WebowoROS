#!/bin/bash
# =============================================================================
# WebowoROS — Health Check Script
# Quick diagnostic of all services
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE="${SCRIPT_DIR}/infra/docker/docker-compose.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local name=$1
    local container=$2
    local port=$3
    local url=$4

    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo -e "${GREEN}●${NC} ${name} — running"

        # Check port
        if [ -n "$port" ]; then
            if nc -z localhost "$port" 2>/dev/null; then
                echo -e "  ${GREEN}✓${NC} Port ${port} open"
            else
                echo -e "  ${RED}✗${NC} Port ${port} closed"
            fi
        fi

        # Check HTTP if URL provided
        if [ -n "$url" ]; then
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
            if [ "$STATUS" = "200" ] || [ "$STATUS" = "301" ] || [ "$STATUS" = "302" ]; then
                echo -e "  ${GREEN}✓${NC} HTTP ${STATUS}"
            else
                echo -e "  ${YELLOW}!${NC} HTTP ${STATUS}"
            fi
        fi
    else
        echo -e "${RED}○${NC} ${name} — stopped"
    fi
    echo ""
}

echo "═══════════════════════════════════════════════════════════════"
echo "  WebowoROS — Health Check"
echo "═══════════════════════════════════════════════════════════════"
echo ""

check_service "PostgreSQL" "ros-postgres" "5432" ""
check_service "Redis" "ros-redis" "6379" ""
check_service "API" "ros-api" "4000" "http://localhost:4000/v1/health"
check_service "Web" "ros-web" "3000" "http://localhost:3000"
check_service "Dashboard" "ros-dashboard" "3001" "http://localhost:3001"
check_service "Printer" "ros-printer" "5000" ""

echo "═══════════════════════════════════════════════════════════════"
echo "  System Resources"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "Docker containers:"
docker ps --format '  {{.Names}}: {{.Status}}' | grep ros- || echo "  No running containers"

echo ""
echo "Disk usage:"
df -h . | tail -1 | awk '{print "  " $5 " used (" $3 "/" $2 ")"}'

echo ""
echo "Memory:"
free -h | grep Mem | awk '{print "  " $3 "/" $2 " used"}'

echo ""
echo "═══════════════════════════════════════════════════════════════"
