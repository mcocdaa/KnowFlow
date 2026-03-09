# KnowFlow 前端文档

本目录包含 KnowFlow 前端的完整文档。

## 文档目录

| 文档 | 说明 |
|------|------|
| [overview.md](./overview.md) | 前端概述：技术栈、目录结构、核心功能 |
| [architecture.md](./architecture.md) | 前端架构：Redux Store、数据流、状态管理 |
| [components.md](./components.md) | 组件文档：主要组件说明 |
| [deployment.md](./deployment.md) | 部署文档：环境搭建、构建、测试 |

## 快速开始

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

服务将在 `http://localhost:5173` 启动。

## 前端代码位置

- 主入口: [frontend/src/main.tsx](../../frontend/src/main.tsx)
- 根组件: [frontend/src/App.tsx](../../frontend/src/App.tsx)
- 主布局: [frontend/src/components/Layout.tsx](../../frontend/src/components/Layout.tsx)
- 状态管理: [frontend/src/store/](../../frontend/src/store/)
