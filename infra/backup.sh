#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F_%H%M)
DUMP_DIR=${DUMP_DIR:-/backups}
RETENTION=${RETENTION:-30}
DB_USER=${DB_USER:-nias}
DB_NAME=${DB_NAME:-nias}

mkdir -p "$DUMP_DIR"
docker compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$DUMP_DIR/nias_$STAMP.sql.gz"
find "$DUMP_DIR" -name 'nias_*.sql.gz' -mtime +"$RETENTION" -delete