# KnowFlow

[![CI](https://github.com/mcocdaa/KnowFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/mcocdaa/KnowFlow/actions/workflows/ci.yml)

KnowFlow 是一个知识管理系统：文件导入、动态 Key-Value 属性、分类层级、插件扩展与 AI 语义检索。

## 功能特性

- **知识项管理**：拖拽上传、自动提取文件元数据、完整 CRUD
- **Key-Value 系统**：动态属性、多种数据类型、分类层级
- **搜索**：关键词搜索、多维度排序、AI 语义检索（可选）
- **插件系统**：动态加载/卸载插件（星级评分、OpenClaw 导入等）
- **跨平台**：Web 应用 + Electron 桌面端

技术栈：React 19 + TypeScript + Vite + Ant Design；FastAPI + MongoDB（Python 3.11）。

## 快速开始（Docker，推荐）

环境要求：Docker 20+、Docker Compose 2.20+。

```bash
git clone --recurse-submodules https://github.com/mcocdaa/KnowFlow.git
cd KnowFlow

cp .env.example .env
vim .env                      # 可选：修改端口、填写 DOUBAO_API_KEY

docker compose up -d --build
```

启动后：

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:8002 |
| 后端 | http://localhost:3002/api/v1/health |

端口由 `.env` 中的 `FRONTEND_PORT` / `BACKEND_PORT` 控制。AI Key 可写入 `.env` 的 `DOUBAO_API_KEY`，或放到 `secrets/doubao_api_key.txt`（优先级更高，不会提交到 Git）；留空时 AI 功能自动降级，不影响其他功能。

常用命令：

```bash
docker compose ps            # 查看状态
docker compose logs -f       # 查看日志
docker compose down          # 停止服务
docker compose up -d --build # 更新代码后重建
```

### 使用 docker run（不用 Compose）

镜像由 CI 发布到 GHCR（`:main` 跟随主分支，也支持 `vX.Y.Z` 版本标签）：

```bash
docker network create knowflow

docker run -d --name knowflow-mongo --network knowflow \
  -v knowflow-mongo:/data/db mongo:7

docker run -d --name knowflow-backend --network knowflow -p 3000:3000 \
  -e MONGODB_URL=mongodb://knowflow-mongo:27017 \
  -v "$PWD/plugins:/app/plugins:ro" \
  -v knowflow-data:/app/data \
  ghcr.io/mcocdaa/knowflow-backend:main

docker run -d --name knowflow-frontend --network knowflow -p 8000:8000 \
  ghcr.io/mcocdaa/knowflow-frontend:main
```

前端 http://localhost:8000 ，后端 http://localhost:3000/api/v1/health 。

## 本地开发（不用 Docker）

环境要求：Python 3.11+、Node.js 20.19+、MongoDB 7（或 Docker 启动）。

```bash
cp .env.example .env

# 启动 MongoDB（已有本地 MongoDB 可跳过）
docker run -d --name knowflow-mongo -p 27017:27017 -v knowflow-mongo:/data/db mongo:7

./scripts/start.sh local full
```

- 前端 http://localhost:5177 （Vite 代理 `/api` 到后端）
- 后端 http://localhost:3000

也可只启动单个服务：`./scripts/start.sh local backend` 或 `./scripts/start.sh local frontend`；停止脚本见 `scripts/stop.sh`。

## 配置说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `BACKEND_PORT` | Docker 后端主机端口 | 3002 |
| `FRONTEND_PORT` | Docker 前端主机端口 | 8002 |
| `DOUBAO_API_KEY` | 豆包 AI Key（可选） | 空（AI 降级） |
| `MONGODB_URL` | MongoDB 连接串 | Docker `mongodb://mongodb:27017`，本地 `localhost:27017` |
| `MONGODB_DB_NAME` | 数据库名 | knowflow |

完整配置见 [.env.example](.env.example)。

## 项目结构

```
KnowFlow/
├── backend/          # FastAPI 后端（api/、managers/、插件加载、测试）
├── frontend/         # React + Vite 前端（Web 与 Electron）
├── docker/           # 分层 docker compose 文件
├── compose.yaml      # 一键启动入口（include docker/）
├── plugins/          # 插件目录（rating、knowflow_openclaw）
├── scripts/          # start.sh / stop.sh
├── docs/             # 项目文档
└── secrets/          # 敏感配置（不提交）
```

## 测试

```bash
# 后端单元测试
cd backend && pytest -q

# 真实 API 回归检查（需后端已启动，见 --help）
cd backend && python test/e2e_api_check.py

# 前端检查与构建
cd frontend && npm run lint && npx vitest run && npm run build
```

## 文档

| 文档 | 说明 |
|------|------|
| [快速开始](docs/quick-start.md) | 5 分钟上手 |
| [项目概述](docs/summary.md) | 功能与技术架构 |
| [架构设计](docs/architecture.md) | 模块划分与数据流 |
| [后端文档](docs/backend/README.md) | API、数据库、部署 |
| [前端文档](docs/frontend/index.md) | 架构、组件与部署 |
| [插件开发](docs/plugin-system-design.md) | 插件系统设计 |

## 许可证

[MIT](LICENSE)
