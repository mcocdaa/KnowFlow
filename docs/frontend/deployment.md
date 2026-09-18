---
title: 前端部署
version: 1.0
keywords: [部署, 构建, 测试, Electron, Docker]
description: 前端开发构建测试与部署
---

# 前端部署

## 环境要求

- Node.js 22.12+
- npm（仓库使用 `package-lock.json`，推荐 `npm ci`）

依赖安装：

```bash
cd frontend
npm ci        # 或 npm install
```

## 本地开发

推荐使用仓库脚本统一启动前后端（见 [快速开始](../quick-start.md)）：

```bash
./scripts/start.sh local full      # 后端 + 前端
./scripts/start.sh local frontend  # 仅前端
```

脚本会把 `VITE_API_BASE_URL` 置空并设置 `VITE_PROXY_TARGET`，让前端走相对路径 `/api/v1`，由 Vite 代理到本地后端。开发地址：

| 服务 | 地址 |
|------|------|
| 前端（Vite） | http://localhost:5177 |
| 后端 | http://localhost:3000 |

也可以在前端目录直接启动：

```bash
cd frontend
npm run dev
```

开发端口与 `/api` 代理配置见 [frontend/vite.config.ts](../../frontend/vite.config.ts)。

### Electron 开发模式

```bash
npm run electron:dev     # electron .
```

## 构建

### Web 构建

```bash
npm run build            # tsc -b && vite build
```

产物输出到 `frontend/dist/`。生产构建会向 `index.html` 注入 CSP `meta` 标签（适配 Electron `file://` 场景），并按 `react-vendor` / `antd` / `icons` 手动拆包。

### 预览构建结果

```bash
npm run preview
```

### Electron 打包

```bash
npm run electron:build   # electron-builder
```

产物输出到 `frontend/dist/electron/`。`package.json` 中的打包目标：

| 平台 | 输出格式 |
|------|----------|
| Windows | NSIS、Portable |
| macOS | DMG |
| Linux | DEB、RPM、AppImage |

## 测试

```bash
npm run test             # vitest（watch 模式）
npx vitest run           # 单次运行，CI 使用
```

- **Vitest**：测试运行器，配置见 [frontend/vitest.config.ts](../../frontend/vitest.config.ts)（jsdom 环境、`globals: true`、`setupFiles: ./tests/setup.ts`、`testTimeout: 15000`）。
- **@testing-library/react / jest-dom / user-event**：组件渲染与断言。
- **jsdom**：DOM 环境，`tests/setup.ts` 补齐 `ResizeObserver`、`matchMedia`、`requestAnimationFrame`。

测试位于 `frontend/tests/`，按 `pages/`、`components/`、`hooks/`、`store/`、`services/`、`plugins/` 分层，另有 `App.test.tsx`、`routing.test.tsx`、`no-emoji-icons.test.ts`。当前共 **20 个测试文件、114 个用例**。`renderWithProviders` 负责复刻生产 Provider 链并以 `motion: false` 稳定断言，详见[前端架构](./architecture.md#测试体系)。

## Lint 与类型检查

```bash
npm run lint             # eslint .
npm run build            # tsc -b 会执行类型检查
```

配置文件：

- [frontend/vite.config.ts](../../frontend/vite.config.ts)：Vite 构建、开发端口、代理、拆包
- [frontend/vitest.config.ts](../../frontend/vitest.config.ts)：Vitest 测试
- [frontend/eslint.config.js](../../frontend/eslint.config.js)：ESLint
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`：TypeScript

## Docker 部署

前端镜像由两层构成：`node:22-alpine` 构建 `dist/`，再由 `nginx:alpine` 托管，容器内固定监听 `8000`。相关文件：[frontend/Dockerfile](../../frontend/Dockerfile)、[frontend/nginx.conf](../../frontend/nginx.conf)、[docker/docker-compose.frontend.yml](../../docker/docker-compose.frontend.yml)。

### Compose（推荐）

```bash
cp .env.example .env
vim .env                 # 按需修改 FRONTEND_PORT / BACKEND_PORT，可填 DOUBAO_API_KEY
docker compose up -d --build
```

`.env.example` 默认主机端口：

| 服务 | 主机端口 | 容器端口 |
|------|----------|----------|
| 前端 | `FRONTEND_PORT=8002` | 8000 |
| 后端 | `BACKEND_PORT=3002` | 3000 |

访问前端 `http://localhost:8002`，后端健康检查 `http://localhost:3002/api/v1/health`。前端容器通过 nginx 将 `/api/v1` 代理到后端，属于同源请求。

### docker run（不用 Compose）

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

前端 `http://localhost:8000`，后端 `http://localhost:3000/api/v1/health`。

## 构建期环境变量

前端实际读取的变量：

| 变量 | 使用位置 | 说明 |
|------|----------|------|
| `VITE_API_BASE_URL` | `src/services/api.ts`、`vite.config.ts` | API 基础地址；为空时回落到相对路径 `/api/v1`。Docker 构建时通过 nginx 同源代理，无需设置。 |
| `VITE_PROXY_TARGET` | `vite.config.ts` | 仅本地开发使用，指定 `/api` 代理目标；由 `scripts/start.sh` 注入，未设置时回落到 `VITE_API_BASE_URL` 或 `http://localhost:3000`。 |

Electron 运行时还可以通过 `window.knowflow?.apiBase` 覆盖 API 地址（优先级最高）。`.env.example` 中的 `VITE_APP_TITLE`、`VITE_API_TIMEOUT`、`VITE_ENABLE_*` 等键当前未被前端代码读取。

## 故障排查

### 前端无法连接后端

- 确认后端已启动：`curl http://localhost:3000/api/v1/health`
- 本地开发确认 `/api` 代理生效（检查 `VITE_PROXY_TARGET`）
- Docker 部署确认 nginx 代理与后端容器在同一网络

### 依赖安装失败

- 删除 `node_modules` 与 `package-lock.json` 后重新安装
- 确认 Node.js 版本满足 22.12+

### 测试失败

- 确认 `tests/setup.ts` 的 jsdom 垫片生效
- antd 渲染较重，超时问题可调整 `vitest.config.ts` 的 `testTimeout`

## 项目脚本

| 脚本 | 命令 | 说明 |
|------|------|------|
| `dev` | `vite` | 启动开发服务器（端口 5177） |
| `build` | `tsc -b && vite build` | 构建生产版本 |
| `lint` | `eslint .` | 运行代码检查 |
| `preview` | `vite preview` | 预览构建结果 |
| `test` | `vitest` | 运行测试 |
| `electron:dev` | `electron .` | 启动 Electron 开发模式 |
| `electron:build` | `electron-builder` | 打包 Electron 应用 |
