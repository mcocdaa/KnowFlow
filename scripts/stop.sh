#!/bin/bash
# ============================================
# Docker 服务停止脚本
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "========================================"
echo "停止 Docker 服务"
echo "========================================"

cd "$DOCKER_DIR"

docker compose -f docker-compose.base.yml \
               -f docker-compose.backend.yml \
               -f docker-compose.frontend.yml \
               down

echo "✅ 服务已停止"
