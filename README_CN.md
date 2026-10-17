<div align="center">

# KnowFlow

支持动态 Key-Value 分面属性、多级分类目录与混合 AI 语义检索的知识库系统。

[![Family: *Flow](https://img.shields.io/badge/Family-*Flow-8A2BE2.svg)](https://github.com/mcocdaa)
[![CI](https://github.com/mcocdaa/KnowFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/mcocdaa/KnowFlow/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/mcocdaa/KnowFlow?display_name=tag&sort=semver)](https://github.com/mcocdaa/KnowFlow/releases)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-blue.svg)](compose.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md) · [简体中文](README_CN.md)

<img src="docs/assets/demo_knowflow.gif" alt="KnowFlow Demo" width="840">

</div>

## ✨ 核心特性

- **三栏式知识工作台** — 集成分类目录树、分面筛选胶囊（Facet Filter Chips）与安全净化的 Markdown/代码/多媒体实时预览。
- **动态 Key-Value 属性模型** — 支持 `string`、`number`、`date`、`boolean`、`array` 等动态类型（如 `rating`、`tags` 及自定义分面属性），可按全局或分类维度绑定。
- **混合关键词与向量 AI 语义检索** — 结合高速关键词/分面过滤与 `/api/v1/ai/search` 语义检索（内置 `fastembed` `bge-small-zh-v1.5` 本地毫秒级向量检索，可选豆包大模型重排与自动打标签）。
- **热插拔插件扩展** — 支持运行时动态加载/卸载插件与路由扩展（内置 `rating` 星级评分、`knowflow_openclaw` 采集导入插件）。
- **Web 与 Electron 桌面端双栖支持** — 支持容器化 Web 部署（React 19 + FastAPI + MongoDB 7）及跨平台 Electron 桌面客户端打包。

## 🚀 快速开始

### 方式一：Docker Compose（推荐，一行命令启动）

```bash
git clone --recurse-submodules https://github.com/mcocdaa/KnowFlow.git
cd KnowFlow
cp .env.example .env && docker compose up -d --build
```

| 服务 | 访问地址 |
| :--- | :--- |
| **WebUI 前端** | `http://localhost:8002` |
| **Backend 健康检查** | `http://localhost:3002/api/v1/health` |

### 方式二：本地开发模式

环境要求：Python 3.11+、Node.js 22.12+、MongoDB 7（可通过 `docker run -d --name knowflow-mongo -p 27017:27017 mongo:7` 启动）：

```bash
cp .env.example .env
./scripts/start.sh local full
```

- **前端开发服务**：`http://localhost:5177`（自动代理 `/api` 至后端）
- **后端 API 服务**：`http://localhost:3000`

## 🤖 AI 与 API 接口

KnowFlow 提供标准 RESTful JSON 接口，便于自动化脚本、数据管道与 AI Agent 无头调用：

```bash
# 1. 创建携带动态 Key-Value 分面属性的知识项
curl -s -X POST http://localhost:3002/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "RAG 架构设计笔记",
    "category": "AI 工程",
    "attributes": {
      "name": "RAG 架构设计笔记",
      "rating": 5,
      "tags": ["RAG", "VectorSearch"]
    }
  }'

# 2. 获取/查询知识项列表
curl -s "http://localhost:3002/api/v1/items"

# 3. 混合 AI 语义检索
curl -s -X POST http://localhost:3002/api/v1/ai/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "检索增强生成与向量嵌入索引",
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "RAG 架构设计笔记",
        "attributes": {"tags": ["RAG", "VectorSearch"], "rating": 5}
      }
    ]
  }'
```

> 注：单资源 CRUD 与分页检索同时挂载于 `/api/v1/item` 与 `/api/v1/item/search`。

## ⚙️ 配置与目录结构

### 环境变量（`.env`）

| 变量名 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `FRONTEND_PORT` | Docker 前端主机映射端口 | `8002` |
| `BACKEND_PORT` | Docker 后端主机映射端口 | `3002` |
| `MONGODB_URL` | MongoDB 连接地址 | `mongodb://mongodb:27017` |
| `MONGODB_DB_NAME` | MongoDB 数据库名称 | `knowflow` |
| `DOUBAO_API_KEY` | 豆包大模型 API Key（可选，留空时自动使用本地 `fastembed` 向量推理） | *（空）* |

### 目录结构

```text
KnowFlow/
├── backend/          # FastAPI 后端（api/v1、managers、插件加载器、pytest 测试集）
├── frontend/         # React 19 + TypeScript + Vite + Ant Design 前端（Web 与 Electron）
├── plugins/          # 热插拔扩展插件目录（rating、knowflow_openclaw）
├── docker/           # 分层 Docker Compose 编排配置
├── compose.yaml      # 一键启动 Docker Compose 入口
├── scripts/          # 本地开发启停脚本（start.sh / stop.sh）
└── docs/             # 架构设计、API 文档与演示动图资源
```

### 测试与校验

```bash
cd backend && uv run --frozen pytest -q
cd frontend && npm run lint && npx vitest run && npm run build
```

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。
