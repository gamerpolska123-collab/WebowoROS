#!/bin/bash
# =============================================================================
# WebowoROS — Backup Script
# Backs up PostgreSQL database and uploads directory
# Usage: ./backup.sh [daily|weekly|manual]
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_TYPE="${1:-manual}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${SCRIPT_DIR}/backups/${BACKUP_TYPE}"
RETENTION_DAYS=30

echo "═══════════════════════════════════════════════════════════════"
echo "  WebowoROS Backup — ${BACKUP_TYPE}"
echo "  Timestamp: ${TIMESTAMP}"
echo "═══════════════════════════════════════════════════════════════"

mkdir -p "${BACKUP_DIR}"

# Database backup
echo "📦 Backing up PostgreSQL database..."
docker exec ros-postgres pg_dump -U postgres -d weboworos --clean --if-exists > "${BACKUP_DIR}/db_${TIMESTAMP}.sql" 2>/dev/null || docker exec ros-postgres pg_dump -U ros_user -d restaurant_db --clean --if-exists > "${BACKUP_DIR}/db_${TIMESTAMP}.sql"

gzip "${BACKUP_DIR}/db_${TIMESTAMP}.sql"
echo "✅ Database backup: ${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"

# Uploads backup (if exists)
if [ -d "${SCRIPT_DIR}/uploads" ]; then
    echo "📁 Backing up uploads..."
    tar -czf "${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz" -C "${SCRIPT_DIR}" uploads/
    echo "✅ Uploads backup: ${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz"
fi

# Environment backup
echo "🔑 Backing up environment..."
cp "${SCRIPT_DIR}/.env" "${BACKUP_DIR}/env_${TIMESTAMP}.backup" 2>/dev/null || echo "⚠️ No .env file found"

# Cleanup old backups
echo "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -name "*.backup" -mtime +${RETENTION_DAYS} -delete

# List backups
echo ""
echo "📋 Current backups:"
ls -lh "${BACKUP_DIR}" | tail -n +2

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ Backup completed!"
echo "  Location: ${BACKUP_DIR}"
echo "═══════════════════════════════════════════════════════════════"
