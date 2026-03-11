# KnowFlow 文档

知识管理系统 - 高效管理、检索和组织各类知识资源

---

## 快速开始

| 场景 | 文档 |
|------|------|
| 首次使用 | [快速开始指南](./quick-start.md) |
| 了解项目 | [项目概述](./summary.md) |

---

## 按角色查找

| 角色 | 推荐文档 |
|------|---------|
| 前端开发者 | [前端概述](./frontend/overview.md) → [组件文档](./frontend/components.md) |
| 后端开发者 | [后端概述](./backend/overview.md) → [API 文档](./backend/api.md) |
| 运维人员 | [后端部署](./backend/deployment.md) → [前端部署](./frontend/deployment.md) |
| 插件开发者 | [插件系统设计](./plugin-system-design.md) |

---

## 按主题查找

### 系统设计

| 文档 | 说明 |
|------|------|
| [架构设计](./architecture.md) | 技术选型、模块划分、数据流 |
| [Key 系统设计](./key-system-design.md) | 动态属性系统 |
| [插件系统设计](./plugin-system-design.md) | 插件开发指南 |

### 后端开发

| 文档 | 说明 |
|------|------|
| [后端概述](./backend/overview.md) | 技术栈、目录结构、核心功能 |
| [API 接口](./backend/api.md) | 所有接口详细说明 |
| [数据库结构](./backend/database.md) | MongoDB 集合结构 |
| [部署测试](./backend/deployment.md) | 环境搭建、Docker 部署 |

### 前端开发

| 文档 | 说明 |
|------|------|
| [前端概述](./frontend/overview.md) | 技术栈、目录结构、设计系统 |
| [前端架构](./frontend/architecture.md) | Redux Store、数据流 |
| [组件文档](./frontend/components.md) | 主要组件说明 |
| [前端部署](./frontend/deployment.md) | 构建、测试、Electron 打包 |

---

## 文档目录

```
docs/
├── index.md                    # 本文件（文档索引）
├── quick-start.md              # 快速开始指南
├── summary.md                  # 项目概述
│
├── architecture/               # 架构设计
│   ├── tech-stack.md           # 技术栈
│   ├── modules.md              # 模块划分
│   ├── data-storage.md         # 数据存储
│   └── flows.md                # 关键流程
│
├── key-system/                 # Key 系统
│   ├── overview.md             # 系统概述
│   ├── builtin-keys.md         # 内置 Key
│   ├── categories.md           # 分类管理
│   ├── storage.md              # 存储结构
│   └── frontend-form.md        # 前端表单
│
├── plugin-system/              # 插件系统
│   ├── overview.md             # 系统概述
│   ├── structure.md            # 目录结构
│   ├── backend-dev.md          # 后端开发
│   ├── frontend-dev.md         # 前端开发
│   ├── api.md                  # 插件 API
│   └── example.md              # 示例插件
│
├── backend/                    # 后端文档
│   ├── overview.md             # 后端概述
│   ├── api.md                  # API 索引
│   ├── api/                    # API 详细文档
│   │   ├── health.md           # 健康检查
│   │   ├── items.md            # 知识项管理
│   │   ├── upload.md           # 文件上传
│   │   ├── categories.md       # 分类管理
│   │   ├── keys.md             # Key 管理
│   │   └── plugins.md          # 插件接口
│   ├── database.md             # 数据库结构
│   └── deployment.md           # 部署与测试
│
└── frontend/                   # 前端文档
    ├── overview.md             # 前端概述
    ├── architecture.md         # 前端架构
    ├── components.md           # 组件索引
    ├── components/             # 组件详细文档
    │   ├── core.md             # 核心组件
    │   ├── layout-parts.md     # 布局子组件
    │   ├── features.md         # 功能组件
    │   └── plugins.md          # 插件组件
    └── deployment.md           # 部署文档
```
