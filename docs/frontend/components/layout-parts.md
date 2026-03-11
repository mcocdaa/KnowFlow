# 布局子组件

Layout 组件拆分为多个子组件，位于 `frontend/src/components/LayoutParts/` 目录。

---

## SearchSection（搜索区域组件）

**文件**: `frontend/src/components/LayoutParts/SearchSection.tsx`

### 功能

提供搜索框、排序选择器、分类筛选等功能。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `searchQuery` | string | 搜索关键词 |
| `onSearchChange` | function | 搜索框内容变化回调 |
| `onSearch` | function | 执行搜索回调 |
| `activeTab` | string | 当前选中的 Tab |
| `sortBy` | string | 排序方式 |
| `onSortByChange` | function | 排序方式变化回调 |

### 排序选项

- `recent`: 按最近添加排序

---

## FileCard（文件卡片组件）

**文件**: `frontend/src/components/LayoutParts/FileCard.tsx`

### 功能

展示单个知识项的卡片。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `item` | KnowledgeItem | 知识项数据 |
| `isSelected` | boolean | 是否选中 |
| `onSelect` | function | 选中回调 |
| `onDelete` | function | 删除回调 |
| `getFileIcon` | function | 获取文件图标的函数 |

### 显示内容

- 文件图标（根据文件类型）
- 文件路径
- 删除按钮（带确认弹窗）

---

## DetailDrawer（详情抽屉组件）

**文件**: `frontend/src/components/LayoutParts/DetailDrawer.tsx`

### 功能

右侧抽屉，展示知识项的详细信息。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `visible` | boolean | 抽屉可见性 |
| `onClose` | function | 关闭回调 |
| `selectedItem` | KnowledgeItem \| null | 选中的知识项 |
| `onOpenFileLocation` | function | 打开文件所在文件夹回调 |
| `onEditItem` | function | 编辑回调 |
| `onDeleteItem` | function | 删除回调 |
| `onMediaPreview` | function | 媒体预览回调 |

### 显示内容

- 文件图标和路径
- 知识属性：根据 Key 定义动态展示
- 操作按钮：打开文件夹、编辑参数、删除、预览

---

## UploadSection（上传区域组件）

**文件**: `frontend/src/components/LayoutParts/UploadSection.tsx`

### 功能

提供文件拖拽上传区域和添加知识记录按钮。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `onFileUpload` | function | 文件上传回调 |
| `onShowAddForm` | function | 显示添加表单回调 |

### 功能

- 支持拖拽上传文件
- 支持点击选择文件上传
- 提供添加知识记录按钮
