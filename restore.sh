#!/bin/bash
# =============================================================================
# WebowoROS — Restore Script
# Restores PostgreSQL database from backup
# Usage: ./restore.sh backups/daily/db_20240115_120000.sql.gz
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_FILE="${1}"

if [ -z "${BACKUP_FILE}" ]; then
    echo "❌ Usage: ./restore.sh <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    find "${SCRIPT_DIR}/backups" -name "*.sql.gz" | sort
    exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
echo "  WebowoROS Restore"
echo "  File: ${BACKUP_FILE}"
echo "═══════════════════════════════════════════════════════════════"

# Stop API to avoid conflicts
echo "🛑 Stopping API service..."
docker compose -f "${SCRIPT_DIR}/infra/docker/docker-compose.yml" stop api

# Restore database
echo "📦 Restoring database..."
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    zcat "${BACKUP_FILE}" | docker exec -i ros-postgres psql -U postgres -d weboworos 2>/dev/null ||     zcat "${BACKUP_FILE}" | docker exec -i ros-postgres psql -U ros_user -d restaurant_db
else
    cat "${BACKUP_FILE}" | docker exec -i ros-postgres psql -U postgres -d weboworos 2>/dev/null ||     cat "${BACKUP_FILE}" | docker exec -i ros-postgres psql -U ros_user -d restaurant_db
fi

# Restart API
echo "🚀 Restarting API service..."
docker compose -f "${SCRIPT_DIR}/infra/docker/docker-compose.yml" start api

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ Restore completed!"
echo "═══════════════════════════════════════════════════════════════"
