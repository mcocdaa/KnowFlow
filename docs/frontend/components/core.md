# 核心组件

---

## App（根组件）

**文件**: `frontend/src/App.tsx`

### 功能

应用根组件，提供 Ant Design 主题配置和 Redux Store。

### 结构

```tsx
<ConfigProvider theme={antdTheme} locale={zhCN}>
  <AntdApp>
    <Provider store={store}>
      <Layout />
    </Provider>
  </AntdApp>
</ConfigProvider>
```

### 初始化

组件在模块加载时调用 `initializePlugins()` 初始化插件系统。

---

## Layout（主布局组件）

**文件**: `frontend/src/components/Layout.tsx`

### 功能

主布局组件，包含整个应用的 UI 框架。

### 主要功能

1. **Header**: Logo 展示、AI 助手按钮
2. **Sider**: Key 管理入口、分类菜单
3. **Content**: Tab 切换、搜索框、文件上传区、知识项列表
4. **Modal**: 各种弹窗

### 主要状态

| 状态 | 类型 | 说明 |
|------|------|------|
| `keyManagerVisible` | boolean | Key 管理弹窗可见性 |
| `aiAssistantVisible` | boolean | AI 助手弹窗可见性 |
| `mediaPreviewVisible` | boolean | 媒体预览弹窗可见性 |
| `searchQuery` | string | 搜索框内容 |
| `activeTab` | string | 当前选中的 Tab |
| `selectedItemId` | string \| null | 选中的知识项 ID |

### 使用的 Hooks

- `useInitialData()`: 初始化数据加载
- `useKnowledgeItems()`: 知识项操作

---

## 相关文档

- [布局子组件](./layout-parts.md)
- [功能组件](./features.md)
- [插件组件](./plugins.md)
