#!/bin/bash
# ============================================
# KnowFlow 启动脚本
# 用法:
#   ./start.sh <mode> [service]
#   mode: dev | local
#   service: backend | frontend | frontend-local | full (default: full)
#
# 模式说明:
#   dev    - 开发模式，使用 Docker
#   local  - 本地模式，不使用 Docker
#
# 服务说明:
#   backend       - 仅后端
#   frontend      - 仅前端 (Docker)
#   frontend-local - 仅前端 (本地，不通过 Docker)
#   full          - 全部服务
#
# 示例:
#   ./start.sh dev backend         # 开发模式，仅后端 (Docker)
#   ./start.sh dev frontend        # 开发模式，仅前端 (Docker)
#   ./start.sh dev frontend-local  # 开发模式，仅前端 (本地)
#   ./start.sh dev full            # 开发模式，前后端都启动 (Docker)
#   ./start.sh local frontend      # 本地模式，仅前端
#   ./start.sh local full          # 本地模式，前后端都本地启动
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

usage() {
    echo "用法：$0 <mode> [service]"
    echo "  mode:    dev | local"
    echo "  service: backend | frontend | frontend-local | full (默认：full)"
    echo ""
    echo "模式说明:"
    echo "  dev    - 开发模式，使用 Docker"
    echo "  local  - 本地模式，不使用 Docker"
    echo ""
    echo "服务说明:"
    echo "  backend       - 仅后端"
    echo "  frontend      - 仅前端 (模式对应方式：dev 用 Docker，local 用本地)"
    echo "  frontend-local - 仅前端 (始终本地启动，忽略模式)"
    echo "  full          - 全部服务"
    echo ""
    echo "示例:"
    echo "  $0 dev backend         # 开发模式，仅后端 (Docker)"
    echo "  $0 dev frontend        # 开发模式，仅前端 (Docker)"
    echo "  $0 dev frontend-local  # 开发模式，仅前端 (本地)"
    echo "  $0 dev full            # 开发模式，前后端都启动 (Docker)"
    echo "  $0 local frontend      # 本地模式，仅前端"
    echo "  $0 local full          # 本地模式，前后端都本地启动"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

MODE="$1"
SERVICE="${2:-full}"

stop_docker_services() {
    echo "停止已有 Docker 服务..."
    docker compose -p knowflow -f "$DOCKER_DIR/docker-compose.base.yml" down 2>/dev/null || true
    echo "✓ Docker 服务已停止"
}

start_frontend_local() {
    echo "检查前端依赖..."
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo "安装前端依赖..."
        cd "$FRONTEND_DIR" && npm install
    fi
    echo "启动本地前端服务..."
    cd "$FRONTEND_DIR" && npm run dev
}

start_backend_local() {
    echo "检查后端依赖..."
    if [ ! -d "$BACKEND_DIR/__pycache__" ]; then
        echo "后端环境检查通过..."
    fi
    echo "启动本地后端服务..."
    cd "$BACKEND_DIR" && python main.py &
    echo "✓ 本地后端已启动 (http://localhost:3000)"
}

load_env() {
    if [ -f "$PROJECT_ROOT/.env" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
    fi
}

# ============================================
# 主逻辑
# ============================================

case "$MODE" in
    dev)
        # Docker 开发模式
        COMPOSE_COMMAND="docker compose"
        COMPOSE_FILES="-f $DOCKER_DIR/docker-compose.base.yml"

        case "$SERVICE" in
            backend)
                COMPOSE_FILES="$COMPOSE_FILES -f $DOCKER_DIR/docker-compose.backend.yml"
                ;;
            frontend)
                COMPOSE_FILES="$COMPOSE_FILES -f $DOCKER_DIR/docker-compose.frontend.yml"
                ;;
            frontend-local)
                # frontend-local 在 dev 模式下也本地启动
                cd "$DOCKER_DIR"
                load_env
                stop_docker_services

                echo ""
                echo "========================================"
                echo "KnowFlow 启动"
                echo "========================================"
                echo "模式：$MODE"
                echo "服务：$SERVICE (本地运行)"
                echo "========================================"

                load_env
                start_frontend_local

                echo ""
                echo "✓ 启动完成"
                echo "========================================"
                exit 0
                ;;
            full)
                COMPOSE_FILES="$COMPOSE_FILES -f $DOCKER_DIR/docker-compose.backend.yml -f $DOCKER_DIR/docker-compose.frontend.yml"
                ;;
            *)
                echo "未知服务：$SERVICE"
                usage
                ;;
        esac

        # Docker 模式：停止旧服务并启动新服务
        cd "$DOCKER_DIR"
        load_env
        stop_docker_services

        echo ""
        echo "========================================"
        echo "KnowFlow 启动 (Docker)"
        echo "========================================"
        echo "模式：$MODE"
        echo "服务：$SERVICE"
        echo "命令：$COMPOSE_COMMAND"
        echo "========================================"

        $COMPOSE_COMMAND -p knowflow $COMPOSE_FILES up --build -d

        echo ""
        echo "✓ 启动完成"
        echo "========================================"
        ;;

    local)
        # 本地开发模式（不使用 Docker）
        case "$SERVICE" in
            backend)
                load_env
                start_backend_local
                ;;
            frontend)
                load_env
                start_frontend_local
                ;;
            frontend-local)
                load_env
                start_frontend_local
                ;;
            full)
                load_env
                echo "启动本地后端..."
                start_backend_local
                sleep 2
                echo "启动本地前端..."
                start_frontend_local
                ;;
            *)
                echo "未知服务：$SERVICE"
                usage
                ;;
        esac

        echo ""
        echo "========================================"
        echo "KnowFlow 启动 (本地模式)"
        echo "========================================"
        echo "模式：$MODE"
        echo "服务：$SERVICE"
        echo "========================================"
        echo "✓ 启动完成"
        echo "========================================"
        ;;

    *)
        echo "未知模式：$MODE"
        usage
        ;;
esac
