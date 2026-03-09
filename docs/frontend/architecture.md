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
| `clearKnowledgeItems` | 清空所有知识项 |
| `addKnowledgeItem` | 添加知识项 |
| `updateKnowledgeItem` | 更新知识项 |
| `deleteKnowledgeItem` | 删除知识项 |
| `incrementClickCount` | 增加点击次数 |
| `setStarRating` | 设置星级评分 |
| `setSearchResults` | 设置搜索结果 |
| `selectItem` | 选中知识项 |

### keySlice (Key 定义状态)

**文件**: [frontend/src/store/keySlice.ts](../../frontend/src/store/keySlice.ts)

#### 状态结构

```typescript
interface KeyState {
  categories: KeyCategory[];
  definitions: KeyDefinition[];
}
```

#### Action 类型

| Action | 说明 |
|--------|------|
| `addCategory` | 添加分类 |
| `updateCategory` | 更新分类 |
| `deleteCategory` | 删除分类（级联删除子分类） |
| `setCategories` | 设置分类列表 |
| `addKeyDefinition` | 添加 Key 定义 |
| `updateKeyDefinition` | 更新 Key 定义 |
| `deleteKeyDefinition` | 删除 Key 定义 |
| `setDefinitions` | 设置 Key 定义列表 |

## 数据流

### 数据加载流程

1. `Layout` 组件挂载
2. 调用 `loadData()` 函数
3. 依次请求后端 API：
   - `GET /api/knowledge` → 加载知识项
   - `GET /api/categories` → 加载分类
   - `GET /api/keys` → 加载 Key 定义
4. 通过 dispatch 更新 Redux store

### 用户交互流程

以"点击知识项"为例：

1. 用户点击知识项卡片
2. 触发 `handleItemClick(itemId)`
3. dispatch `selectItem(itemId)` 更新选中状态
4. 从当前项的 keyValues 中获取 click_count
5. 更新 keyValues 中的 click_count 值
6. 调用 `PUT /api/knowledge/{id}` 更新后端
7. dispatch `incrementClickCount(itemId)` 更新前端状态
8. 右侧抽屉显示知识项详情

## 组件层次

```
App.tsx
└── Provider (Redux Store)
    └── Layout.tsx
        ├── Header
        │   ├── Logo
        │   └── AI 助手按钮
        ├── Sider (侧边栏)
        │   └── Menu (分类菜单)
        └── Content
            ├── Tabs (推荐/全部/高级搜索)
            ├── SearchSection (搜索区域)
            │   ├── StyledSearch (搜索框)
            │   ├── Select (排序选择器)
            │   ├── Select (分类筛选)
            │   └── Select (搜索字段)
            ├── UploadSection (上传区域)
            │   ├── Upload.Dragger (拖拽上传)
            │   └── Button (添加知识记录)
            ├── FileCard[] (文件卡片列表)
            │   ├── 文件图标
            │   ├── 文件路径
            │   ├── 点击次数/评分
            │   └── 删除按钮
            └── DetailDrawer (详情抽屉)
                ├── 文件图标和路径
                ├── DetailCard (基本信息)
                │   ├── 点击次数
                │   ├── 评分
                │   └── 添加时间
                ├── DetailCard (知识属性)
                │   └── KeyValueItem[] (动态属性)
                └── ActionButtons (操作按钮)
                    ├── 打开所在文件夹
                    ├── 编辑参数
                    ├── 删除文件
                    └── 预览 (媒体文件)
```

## API 通信

### 基础配置

- 后端地址: `http://localhost:3000`
- 通信方式: `fetch` API

### API 调用示例

**加载知识项**:
```typescript
const response = await fetch('http://localhost:3000/api/knowledge');
const data = await response.json();
```

**上传文件**:
```typescript
const formData = new FormData();
formData.append('file', file);
const response = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData,
});
```

**更新知识项**:
```typescript
const response = await fetch(`http://localhost:3000/api/knowledge/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedItem),
});
```

## 搜索语法

支持 `key:pattern; key:pattern` 格式的搜索语法。

### 示例

| 搜索语句 | 说明 |
|----------|------|
| `file_name:test` | 搜索文件名包含 "test" 的项 |
| `star_rating:5` | 搜索星级为 5 的项 |
| `click_count` | 搜索有点击次数的项 |
| `file_type:image; star_rating:3` | 搜索图片类型且星级为 3 的项 |

### 搜索流程

1. 解析搜索语句，按 `;` 分割为多个 term
2. 对每个 term 按 `:` 分割为 key 和 pattern
3. 查找对应的 Key 定义
4. 在知识项的 keyValues 中匹配
5. 应用排序（按点击次数或星级）
6. 更新搜索结果
