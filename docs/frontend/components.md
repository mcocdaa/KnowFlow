# 组件文档

前端组件采用 React + TypeScript 开发，使用 Ant Design 作为 UI 组件库。

---

## 组件分类

| 分类 | 说明 | 文档 |
|------|------|------|
| 核心组件 | App、Layout 等核心组件 | [core.md](./components/core.md) |
| 布局子组件 | SearchSection、FileCard 等 | [layout-parts.md](./components/layout-parts.md) |
| 功能组件 | KeyManager、AIAssistant 等 | [features.md](./components/features.md) |
| 插件组件 | StarRating、PluginRenderer | [plugins.md](./components/plugins.md) |

---

## 组件层次

```
App.tsx
└── ConfigProvider (Ant Design 主题)
    └── AntdApp (Ant Design 上下文)
        └── Provider (Redux Store)
            └── Layout.tsx
                ├── GlobalStyle (全局样式)
                ├── StyledLayout
                │   ├── StyledHeader
                │   ├── AntLayout
                │   │   ├── StyledSider (侧边栏)
                │   │   └── Content
                │   │       ├── StyledTabs
                │   │       ├── SearchSection
                │   │       ├── UploadSection
                │   │       ├── ResultsSection
                │   │       │   └── FileCard[]
                │   │       └── DetailDrawer
                │   └── Modal
                ├── KeyManager
                ├── AIAssistant
                └── MediaPreview
```

---

## 相关文档

- [前端概述](./overview.md)
- [前端架构](./architecture.md)
