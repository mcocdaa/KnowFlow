# 前端架构

## 状态管理

使用 Redux Toolkit 进行状态管理，包含两个主要的 slice。

### Store 配置

**文件**: [frontend/src/store/index.ts](../../frontend/src/store/index.ts)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import keyReducer from './keySlice';
import knowledgeReducer from './knowledgeSlice';

export const store = configureStore({
  reducer: {
    key: keyReducer,
    knowledge: knowledgeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### knowledgeSlice (知识项状态)

**文件**: [frontend/src/store/knowledgeSlice.ts](../../frontend/src/store/knowledgeSlice.ts)

#### 状态结构

```typescript
interface KnowledgeState {
  items: KnowledgeItem[];
  searchResults: KnowledgeItem[];
  selectedItem: KnowledgeItem | null;
}
```

#### Action 类型

| Action | 说明 |
|--------|------|
| `setItems` | 设置知识项列表 |
| `clearKnowledgeItems` | 清空所有知识项 |
| `addKnowledgeItem` | 添加知识项 |
| `updateKnowledgeItem` | 更新知识项 |
| `deleteKnowledgeItem` | 删除知识项 |
| `setSearchResults` | 设置搜索结果 |
| `selectItem` | 选中知识项 |

### keySlice (Key 定义状态)

**文件**: [frontend/src/store/keySlice.ts](../../frontend/src/store/keySlice.ts)

#### 状态结构

```typescript
interface KeyState {
  categories: CategoryDefinition[];
  definitions: Record<string, KeyDefinition>;
  definitionList: KeyDefinition[];
}
```

#### Action 类型

| Action | 说明 |
|--------|------|
| `setCategories` | 设置分类列表 |
| `setDefinitions` | 设置 Key 定义列表 |

## 自定义 Hooks

**文件**: [frontend/src/hooks/useKnowledge.ts](../../frontend/src/hooks/useKnowledge.ts)

### useInitialData

初始化数据加载 Hook，在组件挂载时自动加载知识项、分类和 Key 定义。

```typescript
export const useInitialData = () => {
  // 自动加载 items, categories, keys
  // 错误处理并显示提示消息
};
```

### useKnowledgeItems

知识项操作 Hook，提供完整的 CRUD 操作和搜索功能。

#### 返回值

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `items` | KnowledgeItem[] | 知识项列表 |
| `searchResults` | KnowledgeItem[] | 搜索结果 |
| `selectedItem` | KnowledgeItem \| null | 选中的知识项 |
| `selectedItemId` | string \| null | 选中的知识项 ID |
| `handleItemClick` | (item: KnowledgeItem) => void | 处理知识项点击 |
| `handleSearch` | (value: string, sortBy: string) => void | 处理搜索 |
| `handleKeyClick` | (keyName: string) => void | 处理 Key 点击筛选 |
| `handleDeleteItem` | (itemId: string) => Promise<void> | 删除知识项 |
| `handleUpdateItem` | (item: KnowledgeItem) => Promise<KnowledgeItem> | 更新知识项 |
| `handleUploadFile` | (file: File, values: Record<string, unknown>) => Promise<KnowledgeItem> | 上传文件 |
| `handleCreateItem` | (values: Record<string, unknown>) => Promise<KnowledgeItem> | 创建知识项 |
| `getSortedItems` | (sortBy: string) => KnowledgeItem[] | 获取排序后的列表 |
| `getDefaultFormValues` | () => Record<string, unknown> | 获取表单默认值 |

## API 服务层

**文件**: [frontend/src/services/api.ts](../../frontend/src/services/api.ts)

### 数据转换

`transformItemData` 函数负责将后端返回的数据格式转换为前端使用的格式：

```typescript
export const transformItemData = (itemWrapper: ItemWrapper): KnowledgeItem => ({
  id: itemWrapper.item?.id || itemWrapper.id || '',
  name: itemWrapper.item?.name || itemWrapper.name || itemWrapper.attributes?.name || '',
  keyValues: (itemWrapper.attributes || itemWrapper.keyValues || {}) as Record<string, unknown>,
  createdAt: itemWrapper.item?.created_at || itemWrapper.attributes?.created_at || '',
});
```

### API 方法

| 方法 | 说明 |
|------|------|
| `api.fetchItems()` | 获取知识项列表 |
| `api.fetchCategories()` | 获取分类列表 |
| `api.fetchKeys()` | 获取 Key 定义列表 |
| `api.updateItem(item)` | 更新知识项 |
| `api.deleteItem(id)` | 删除知识项 |
| `api.uploadFile(file, keyValues)` | 上传文件 |
| `api.createItem(name, keyValues)` | 创建知识项 |

## 插件系统

### 插件加载器

**文件**: [frontend/src/plugins/loader.tsx](../../frontend/src/plugins/loader.tsx)

#### 核心接口

```typescript
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  frontend_entry: string;
  path: string;
}

export interface PluginComponentProps {
  value: unknown;
  itemId: string;
  keyDefinition: {
    name: string;
    title: string;
    value_type: string;
  };
  onUpdate: (value: unknown) => void;
  readOnly?: boolean;
}
```

#### 核心函数

| 函数 | 说明 |
|------|------|
| `registerPluginComponent(name, component)` | 注册插件组件 |
| `getPluginComponent(name)` | 获取插件组件 |
| `hasPluginComponent(name)` | 检查插件组件是否存在 |
| `fetchPluginManifests()` | 从后端获取插件清单 |

#### PluginRenderer 组件

用于渲染插件组件的包装器：

```tsx
<PluginRenderer
  pluginName="rating"
  value={value}
  itemId={itemId}
  keyDefinition={keyDefinition}
  onUpdate={onUpdate}
  readOnly={readOnly}
/>
```

### 插件入口

**文件**: [frontend/src/plugins/index.tsx](../../frontend/src/plugins/index.tsx)

`initializePlugins()` 函数在应用启动时注册内置插件组件：

- `rating`: 星级评分插件

## 数据流

### 数据加载流程

1. `App` 组件挂载，调用 `initializePlugins()` 初始化插件
2. `Layout` 组件挂载，调用 `useInitialData()` Hook
3. Hook 内部并行请求后端 API：
   - `GET /api/v1/item` → 加载知识项
   - `GET /api/v1/categories` → 加载分类
   - `GET /api/v1/keys` → 加载 Key 定义
4. 通过 dispatch 更新 Redux store

### 用户交互流程

以"点击知识项"为例：

1. 用户点击知识项卡片
2. 触发 `handleItemClick(item)`
3. dispatch `selectItem(item.id)` 更新选中状态
4. 右侧抽屉显示知识项详情

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
                │   │   ├── Logo
                │   │   └── AI 助手按钮
                │   ├── AntLayout
                │   │   ├── StyledSider (侧边栏)
                │   │   │   └── StyledMenu (分类菜单)
                │   │   └── Content
                │   │       ├── StyledTabs (推荐/全部/搜索)
                │   │       ├── SearchSection (搜索区域)
                │   │       ├── UploadSection (上传区域)
                │   │       ├── ResultsSection (结果列表)
                │   │       │   └── FileCard[] (文件卡片)
                │   │       └── DetailDrawer (详情抽屉)
                │   └── Modal (编辑表单弹窗)
                ├── KeyManager (Key 管理弹窗)
                ├── AIAssistant (AI 助手弹窗)
                └── MediaPreview (媒体预览弹窗)
```

## 类型定义

**文件**: [frontend/src/types/index.ts](../../frontend/src/types/index.ts)

### 核心类型

```typescript
export type ValueType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface KeyDefinition {
  name: string;
  title: string;
  value_type: ValueType;
  default_value: any;
  description: string;
  category_name: string;
  is_required: boolean;
  is_visible: boolean;
  plugin_name: string;
  delete_with_plugin: boolean;
  is_public: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryDefinition {
  name: string;
  title: string;
  parent_name: string | null;
  is_builtin: boolean;
}

export interface KnowledgeItem {
  id: string;
  name: string;
  keyValues: Record<string, unknown>;
  createdAt?: string;
}
```

## 主题系统

**文件**: [frontend/src/theme/index.ts](../../frontend/src/theme/index.ts)

### 设计令牌

主题系统导出以下设计令牌：

- `COLORS`: 颜色规范
- `SPACING`: 间距规范
- `BORDER_RADIUS`: 圆角规范
- `FONT_SIZES`: 字体大小
- `FONT_WEIGHTS`: 字体粗细
- `SHADOWS`: 阴影规范
- `TRANSITIONS`: 过渡动画

### Ant Design 主题配置

`antdTheme` 对象配置了 Ant Design 组件的主题定制，包括：

- 品牌色、背景色、文字色
- 边框、状态色
- 圆角、阴影
- 字体、间距
- 各组件的特定样式覆盖

## 搜索功能

### 搜索流程

1. 用户输入搜索关键词
2. 触发 `handleSearch(value, sortBy)`
3. 过滤知识项列表：
   - 匹配 `name` 字段
   - 匹配 `keyValues.file_path` 字段
4. 应用排序（按最近添加）
5. dispatch `setSearchResults(results)` 更新搜索结果

### Key 点击筛选

点击侧边栏的 Key 时：

1. 触发 `handleKeyClick(keyName)`
2. 过滤包含该 Key 值的知识项
3. 更新搜索结果并切换到搜索 Tab
