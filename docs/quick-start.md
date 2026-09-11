---
title: 快速开始
description: 5 分钟启动 KnowFlow
keywords: [快速开始, docker, compose, 本地开发]
version: "2.0"
---

# 快速开始指南

本指南帮助你在 5 分钟内启动 KnowFlow。

## 环境要求

| 方式 | 依赖 |
|------|------|
| Docker 部署（推荐） | Docker 20+、Docker Compose 2.20+ |
| 本地开发 | Python 3.11+、Node.js 20.19+、MongoDB 7 |

---

## 方式一：Docker 一键部署（推荐）

```bash
# 1. 克隆项目（插件目录是 submodule，需要 --recurse-submodules）
git clone --recurse-submodules https://github.com/mcocdaa/KnowFlow.git
cd KnowFlow

# 2. 生成配置文件，按需修改端口 / 填写 DOUBAO_API_KEY
cp .env.example .env
vim .env

# 3. 启动
docker compose up -d --build
```

启动完成后：

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:8002 |
| 后端健康检查 | http://localhost:3002/api/v1/health |

```bash
# 验证
curl http://localhost:3002/api/v1/health
# 预期响应: {"code":0,"message":"ok","data":{"status":"ok"}}

# 停止
docker compose down
```

端口由 `.env` 的 `FRONTEND_PORT` / `BACKEND_PORT` 控制。AI Key 可写入 `.env` 的 `DOUBAO_API_KEY`，或放到 `secrets/doubao_api_key.txt`（优先级更高）；不配置时 AI 功能自动降级。

---

## 方式二：本地开发（不用 Docker）

```bash
# 1. 克隆项目
git clone --recurse-submodules https://github.com/mcocdaa/KnowFlow.git
cd KnowFlow

# 2. 生成配置
cp .env.example .env

# 3. 启动 MongoDB（已有本地 MongoDB 可跳过）
docker run -d --name knowflow-mongo -p 27017:27017 -v knowflow-mongo:/data/db mongo:7

# 4. 后端 + 前端一起启动
./scripts/start.sh local full
```

- 前端 http://localhost:5177 （Vite 代理 `/api` 到后端）
- 后端 http://localhost:3000

也可只启动单个服务：

```bash
./scripts/start.sh local backend
./scripts/start.sh local frontend
```

---

## 开始使用

1. 打开浏览器访问前端地址（Docker：`http://localhost:8002`，本地：`http://localhost:5177`）
2. 拖拽文件到上传区域，或点击"添加知识记录"
3. 在左侧导航栏管理 Key 分类
4. 使用搜索框快速检索知识项

---

## 常见问题

### 后端无法连接数据库

检查 MongoDB 是否运行：

```bash
docker ps | grep mongo
curl http://localhost:27017
```

### 前端无法连接后端

确认后端健康检查通过：

```bash
curl http://localhost:3000/api/v1/health
```

### 端口被占用

修改 `.env` 中的 `BACKEND_PORT` / `FRONTEND_PORT` 后重新启动。

### 克隆时提示插件目录为空

submodule 未拉取，执行：

```bash
git submodule update --init --recursive
```

---

## 下一步

- [项目概述](./summary.md) - 了解项目功能
- [后端 API](./backend/api.md) - 查看接口文档
- [后端部署](./backend/deployment.md) - 测试与生产部署
- [插件开发](./plugin-system-design.md) - 开发自定义插件
