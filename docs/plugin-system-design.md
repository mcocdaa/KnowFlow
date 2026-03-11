# 插件系统设计

KnowFlow 插件系统支持动态扩展功能。

---

## 系统概述

插件系统允许开发者为 KnowFlow 添加自定义功能，支持动态加载/卸载、前后端分离、Key 注册等特性。

### 核心能力

| 能力 | 说明 |
|------|------|
| 注册 Key | 插件可以定义自定义 Key |
| 后端 API | 插件可以注册自定义 FastAPI 路由 |
| 前端组件 | 插件可以提供 React 组件 |
| 生命周期 | 支持 `on_load` 和 `on_unload` 钩子 |

---

## 详细文档

| 文档 | 说明 |
|------|------|
| [系统概述](./plugin-system/overview.md) | 插件系统设计目标 |
| [目录结构](./plugin-system/structure.md) | 插件目录和配置文件 |
| [后端开发](./plugin-system/backend-dev.md) | 后端插件开发指南 |
| [前端开发](./plugin-system/frontend-dev.md) | 前端插件开发指南 |
| [插件 API](./plugin-system/api.md) | 插件相关 API |
| [示例插件](./plugin-system/example.md) | 星级评分插件示例 |

---

## 快速开始

### 创建新插件

1. 在 `plugins/` 目录下创建插件文件夹
2. 创建 `plugin.yaml` 配置文件
3. 创建后端入口文件（如需要）
4. 创建前端组件文件（如需要）
5. 在 `plugins.yaml` 中启用插件
6. 在前端注册插件组件

### 插件目录结构

```
plugins/
├── plugins.yaml           # 插件启用配置
└── my-plugin/
    ├── plugin.yaml        # 插件元数据
    ├── backend.py         # 后端入口
    └── frontend.tsx       # 前端入口
```

---

## 相关文档

- [Key 系统设计](./key-system-design.md)
- [前端组件文档](./frontend/components.md)
