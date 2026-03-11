# KnowFlow 前端文档

本目录包含 KnowFlow 前端的完整文档。

## 文档目录

| 文档 | 说明 |
|------|------|
| [overview.md](./overview.md) | 前端概述：技术栈、目录结构、核心功能 |
| [architecture.md](./architecture.md) | 前端架构：Redux Store、数据流、状态管理、插件系统 |
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
- API 服务: [frontend/src/services/api.ts](../../frontend/src/services/api.ts)
- 自定义 Hooks: [frontend/src/hooks/](../../frontend/src/hooks/)
- 插件系统: [frontend/src/plugins/](../../frontend/src/plugins/)
- 主题配置: [frontend/src/theme/index.ts](../../frontend/src/theme/index.ts)

## 核心特性

- **React 19**: 使用最新版本的 React 框架
- **Redux Toolkit**: 简化的状态管理
- **Ant Design 6**: 现代化 UI 组件库
- **Vite 7**: 快速的开发构建工具
- **TypeScript**: 完整的类型支持
- **插件系统**: 可扩展的插件架构
- **Electron**: 支持桌面应用打包

## 相关文档

- [插件系统设计](../plugin-system-design.md)
- [Key 系统设计](../key-system-design.md)
- [系统架构](../architecture.md)
