# KnowFlow

**KnowFlow** 是一个知识管理系统，旨在帮助用户高效管理、检索和组织各类知识资源。系统采用前后端分离架构，支持文件导入、动态属性管理、插件扩展和 AI 语义检索等功能。

## 主要功能

- 📁 **知识项管理**：支持拖拽上传、自动提取文件元数据、完整的 CRUD 操作
- 🏷️ **Key-Value 系统**：动态属性管理，支持多种数据类型和分类层级
- 🔍 **智能搜索**：关键词搜索、多维度排序、AI 语义检索
- 🔌 **插件系统**：动态加载/卸载插件，支持知识源导入、检索、可视化等扩展
- ⭐ **星级评分**：内置评分插件，支持对知识项进行星级评价
- 🤖 **AI 集成**：集成豆包 AI 进行语义理解检索
- 🖥️ **跨平台**：基于 Electron 构建，支持 Windows、macOS 和 Linux

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Vite | 7.3.1 | 构建工具 |
| Ant Design | 6.3.1 | UI 组件库 |
| Redux Toolkit | 2.11.2 | 状态管理 |
| Styled Components | 6.3.11 | CSS-in-JS 样式 |
| Vitest | 4.0.18 | 测试框架 |
| Electron | 40.7.0 | 桌面应用 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.8+ | 运行环境 |
| FastAPI | - | Web 框架 |
| Uvicorn | - | ASGI 服务器 |
| MongoDB | 4.4+ | 数据库 |
| motor | - | MongoDB 异步驱动 |
| Docker | - | 容器化部署 |

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端应用                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   React     │  │   Redux     │  │ Ant Design  │         │
│  │   组件层    │  │  状态管理   │  │   UI 组件   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   插件系统   │  │  API 服务   │  │  Electron   │         │
│  │  动态加载    │  │  HTTP 通信  │  │  桌面应用   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        后端服务                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   FastAPI   │  │  路由层     │  │  业务逻辑   │         │
│  │  Web 框架   │  │  api/v1/    │  │  managers/  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  插件加载器  │  │  Key 缓存   │  │  AI 集成    │         │
│  │ plugin_loader│  │  300s TTL   │  │  豆包 API   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└───────────────────────────┬─────────────────────────────────┘
                            │ motor (异步驱动)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       MongoDB 数据库                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   items     │  │ categories  │  │    keys     │         │
│  │  知识项     │  │   分类      │  │  Key 定义   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 快速开始

### 环境要求

| 依赖 | 版本要求 |
|------|---------|
| Node.js | 18+ |
| Docker | 20+ |
| Docker Compose | 2+ |

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/knowflow.git
   cd knowflow
   ```

2. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   ```

3. **启动后端服务（Docker 方式）**
   ```bash
   cd ../backend
   docker-compose up -d
   ```
   后端服务将在 `http://localhost:3000` 启动，MongoDB 数据库在 `27017` 端口运行

4. **验证后端服务**
   ```bash
   curl http://localhost:3000/api/v1/health
   # 预期响应: {"status": "ok"}
   ```

5. **启动前端开发服务器**
   ```bash
   cd ../frontend
   npm run dev
   ```
   前端服务将在 `http://localhost:5173` 启动

6. **启动 Electron 应用**（可选）
   ```bash
   npm run electron:dev
   ```

## 项目结构

```
KnowFlow/
├── backend/                    # 后端代码
│   ├── main.py                 # 应用入口
│   ├── api/                    # API 路由
│   ├── managers/               # 业务逻辑
│   ├── core/                   # 核心模块
│   ├── config/                 # 配置
│   ├── utils/                  # 工具函数
│   ├── test/                   # 测试用例
│   ├── data/                   # 数据目录
│   ├── Dockerfile              # Docker 镜像构建文件
│   └── docker-compose.yml      # Docker Compose 配置
├── frontend/                   # 前端代码
│   ├── src/
│   │   ├── components/         # 组件
│   │   ├── store/              # Redux 状态
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── services/           # API 服务
│   │   ├── plugins/            # 插件系统
│   │   ├── theme/              # 主题配置
│   │   └── types/              # 类型定义
│   ├── electron/               # Electron 主进程
│   └── tests/                  # 测试用例
├── docs/                       # 文档目录
│   ├── backend/                # 后端文档
│   ├── frontend/               # 前端文档
│   ├── architecture.md         # 架构设计
│   ├── key-system-design.md    # Key 系统设计
│   └── plugin-system-design.md # 插件系统设计
└── plugins/                    # 插件目录
```

## API 文档

### 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **CORS**: 已启用跨域支持

### 主要接口

| 模块 | 接口 | 方法 | 说明 |
|------|------|------|------|
| 健康检查 | `/health` | GET | 服务状态检查 |
| 知识项 | `/item` | GET/POST | 列表/创建 |
| 知识项 | `/item/{id}` | GET/PUT/DELETE | 详情/更新/删除 |
| 文件上传 | `/upload` | POST | 文件上传 |
| 分类 | `/categories` | GET/POST | 列表/创建 |
| 分类 | `/categories/{id}` | GET/PUT/DELETE | 详情/更新/删除 |
| Key | `/keys` | GET/POST | 列表/创建 |
| Key | `/keys/{name}` | GET/PUT/DELETE | 详情/更新/删除 |
| 插件 | `/plugins/manifests` | GET | 插件清单 |
| 插件 | `/plugins/{name}/frontend` | GET | 插件前端代码 |

详细 API 文档请查看 [docs/backend/api.md](docs/backend/api.md)

## 部署说明

### Docker 常用命令

```bash
# 启动后端服务
cd backend
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

### 构建前端

```bash
cd frontend
npm run build
```

构建产物输出到 `frontend/dist/` 目录

### 构建 Electron 应用

```bash
cd frontend
npm run electron:build
```

打包产物输出到 `frontend/dist/electron/` 目录

| 平台 | 输出格式 |
|------|----------|
| Windows | NSIS, Portable |
| macOS | DMG |
| Linux | DEB, RPM, AppImage |

## 测试

### 后端测试

```bash
cd backend
pytest -v
```

### 前端测试

```bash
cd frontend
npm run test
```

## 文档

更多详细文档请查看 [docs](docs/index.md) 目录：

| 文档 | 说明 |
|------|------|
| [快速开始](docs/quick-start.md) | 5 分钟启动项目 |
| [项目概述](docs/summary.md) | 功能和技术架构 |
| [架构设计](docs/architecture.md) | 技术选型、模块划分 |
| [后端概述](docs/backend/overview.md) | 后端技术栈和结构 |
| [前端概述](docs/frontend/overview.md) | 前端技术栈和结构 |
| [插件开发](docs/plugin-system-design.md) | 插件系统设计 |
| [Key 系统](docs/key-system-design.md) | 动态属性系统 |

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目链接：[https://github.com/yourusername/knowflow](https://github.com/yourusername/knowflow)
- 问题反馈：[Issues](https://github.com/yourusername/knowflow/issues)

---

**KnowFlow - 让知识流动起来** 🚀
