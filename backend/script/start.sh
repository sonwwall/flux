#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$BACKEND_DIR/.." && pwd)"

export GOCACHE="${GOCACHE:-$ROOT_DIR/.gocache}"
export APP_ADDR="${FLUX_APP_ADDR:-127.0.0.1:8080}"
export DB_DSN="${DB_DSN:-flux:flux_pass@tcp(127.0.0.1:3306)/flux_blog?charset=utf8mb4&parseTime=True&loc=Local}"

mkdir -p "$GOCACHE"

cd "$BACKEND_DIR"

echo "starting flux backend on ${APP_ADDR}"
echo "using database DSN: ${DB_DSN}"

exec go run ./cmd/server
