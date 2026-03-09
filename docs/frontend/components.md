# 组件文档

## Layout（主布局组件）

**文件**: [frontend/src/components/Layout.tsx](../../frontend/src/components/Layout.tsx)

### 功能

主布局组件，包含整个应用的 UI 框架。

### Props

无

### 主要功能

1. **Header**
   - Logo 展示
   - AI 助手按钮

2. **Sider（侧边栏）**
   - Key 管理入口
   - 分类菜单（树形结构）
   - 点击 Key 自动添加到搜索框

3. **Content（主内容区）**
   - 三个 Tab：推荐、全部、搜索
   - 搜索框（支持 `key:pattern` 语法）
   - 文件上传区（支持拖拽）
   - 知识项列表
   - 右侧详情抽屉

4. **Modal（弹窗）**
   - Key 管理弹窗
   - AI 助手弹窗
   - 媒体预览弹窗
   - 编辑文件参数弹窗

### 主要状态

| 状态 | 类型 | 说明 |
|------|------|------|
| `keyManagerVisible` | boolean | Key 管理弹窗可见性 |
| `aiAssistantVisible` | boolean | AI 助手弹窗可见性 |
| `mediaPreviewVisible` | boolean | 媒体预览弹窗可见性 |
| `searchValue` | string | 搜索框内容 |
| `activeTab` | 'recommend' \| 'all' \| 'search' | 当前选中的 Tab |
| `selectedItemId` | string \| null | 选中的知识项 ID |
| `editFormVisible` | boolean | 编辑表单可见性 |

### 主要方法

| 方法 | 说明 |
|------|------|
| `loadData()` | 从后端加载数据 |
| `handleSearch()` | 处理搜索 |
| `handleItemClick()` | 处理知识项点击 |
| `handleFileUpload()` | 处理文件上传 |
| `handleEditItem()` | 处理编辑知识项 |
| `handleDeleteItem()` | 处理删除知识项 |
| `openFileLocation()` | 打开文件所在文件夹 |
| `handleMediaPreview()` | 处理媒体预览 |

---

## LayoutParts 子组件

Layout 组件拆分为多个子组件，位于 `frontend/src/components/LayoutParts/` 目录下。

### SearchSection（搜索区域组件）

**文件**: [frontend/src/components/LayoutParts/SearchSection.tsx](../../frontend/src/components/LayoutParts/SearchSection.tsx)

### 功能

提供搜索框、排序选择器、分类筛选等功能。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `searchQuery` | string | 是 | 搜索关键词 |
| `onSearchChange` | (value: string) => void | 是 | 搜索框内容变化回调 |
| `onSearch` | (value: string) => void | 是 | 执行搜索回调 |
| `activeTab` | string | 是 | 当前选中的 Tab |
| `sortBy` | string | 是 | 排序方式 |
| `onSortByChange` | (value: string) => void | 是 | 排序方式变化回调 |
| `searchKey` | string | 是 | 搜索字段 |
| `onSearchKeyChange` | (value: string) => void | 是 | 搜索字段变化回调 |
| `categories` | any[] | 是 | 分类列表 |
| `selectedCategory` | string | 是 | 选中的分类 |
| `onCategoryChange` | (value: string) => void | 是 | 分类变化回调 |
| `definitionList` | any[] | 是 | Key 定义列表 |

### 排序选项

- `clickCount`: 按点击次数排序
- `recent`: 按最近添加排序
- `rating`: 按评分排序

---

### FileCard（文件卡片组件）

**文件**: [frontend/src/components/LayoutParts/FileCard.tsx](../../frontend/src/components/LayoutParts/FileCard.tsx)

### 功能

展示单个知识项的卡片，包含文件图标、路径、点击次数、评分等信息。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `item` | KnowledgeItem | 是 | 知识项数据 |
| `isSelected` | boolean | 是 | 是否选中 |
| `onSelect` | (item: KnowledgeItem) => void | 是 | 选中回调 |
| `onDelete` | (id: string) => void | 是 | 删除回调 |
| `getFileIcon` | (fileType?: string) => ReactNode | 是 | 获取文件图标的函数 |

### 显示内容

- 文件图标（根据文件类型）
- 文件路径
- 点击次数
- 评分（星级）
- 删除按钮（带确认弹窗）

---

### DetailDrawer（详情抽屉组件）

**文件**: [frontend/src/components/LayoutParts/DetailDrawer.tsx](../../frontend/src/components/LayoutParts/DetailDrawer.tsx)

### 功能

右侧抽屉，展示知识项的详细信息，包括基本信息、知识属性和操作按钮。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `visible` | boolean | 是 | 抽屉可见性 |
| `onClose` | () => void | 是 | 关闭回调 |
| `selectedItem` | KnowledgeItem \| null | 是 | 选中的知识项 |
| `onOpenFileLocation` | (path: string) => void | 是 | 打开文件所在文件夹回调 |
| `onEditItem` | (item: KnowledgeItem) => void | 是 | 编辑回调 |
| `onDeleteItem` | (id: string) => void | 是 | 删除回调 |
| `onMediaPreview` | (url: string, type: string) => void | 是 | 媒体预览回调 |
| `getFileIcon` | (fileType?: string) => ReactNode | 是 | 获取文件图标的函数 |
| `formatDate` | (dateString: string) => string | 是 | 日期格式化函数 |
| `definitionList` | any[] | 是 | Key 定义列表 |

### 显示内容

- 文件图标和路径
- 基本信息：点击次数、评分、添加时间
- 知识属性：根据 Key 定义动态展示
- 操作按钮：打开文件夹、编辑参数、删除、预览（媒体文件）

---

### UploadSection（上传区域组件）

**文件**: [frontend/src/components/LayoutParts/UploadSection.tsx](../../frontend/src/components/LayoutParts/UploadSection.tsx)

### 功能

提供文件拖拽上传区域和添加知识记录按钮。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `onFileUpload` | (file: File) => void | 是 | 文件上传回调 |
| `onShowAddForm` | () => void | 是 | 显示添加表单回调 |

### 功能

- 支持拖拽上传文件
- 支持点击选择文件上传
- 提供添加知识记录按钮

---

## KeyManager（Key 管理组件）

**文件**: [frontend/src/components/KeyManager.tsx](../../frontend/src/components/KeyManager.tsx)

### 功能

管理 Key 分类和 Key 定义。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `visible` | boolean | 是 | 弹窗可见性 |
| `onClose` | () =&gt; void | 是 | 关闭弹窗回调 |

### 功能

1. **Key 列表 Tab**
   - 查看所有 Key 定义
   - 创建新 Key
   - 编辑 Key
   - 删除 Key（内置 Key 不可删除）

2. **分类列表 Tab**
   - 查看所有分类
   - 创建新分类
   - 删除分类（内置分类不可删除）

### Key 创建表单字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | Key 名称 |
| `categoryId` | string | 所属分类 |
| `script` | string | 小脚本（预留） |
| `description` | string | 描述 |
| `dataType` | string | 数据类型（string/number/boolean/date/timestamp） |
| `isRequired` | boolean | 是否必填 |
| `isReadOnly` | boolean | 是否只读 |
| `isVisibleOnImport` | boolean | 导入时可见 |
| `isVisibleOnEdit` | boolean | 编辑时可见 |
| `defaultValue` | string | 默认值 |

---

## AIAssistant（AI 助手组件）

**文件**: [frontend/src/components/AIAssistant.tsx](../../frontend/src/components/AIAssistant.tsx)

### 功能

提供 AI 语义检索和自动打标签功能。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `visible` | boolean | 是 | 弹窗可见性 |
| `onClose` | () =&gt; void | 是 | 关闭弹窗回调 |

### 功能

1. **语义检索 Tab**
   - 输入自然语言查询
   - 调用 `/api/ai/search` API
   - 显示搜索结果

2. **自动打标签 Tab**
   - 为选中的文件自动生成标签（预留功能）
   - 调用 `/api/ai/auto-tag` API

---

## MediaPreview（媒体预览组件）

**文件**: [frontend/src/components/MediaPreview.tsx](../../frontend/src/components/MediaPreview.tsx)

### 功能

预览图片和视频文件。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `visible` | boolean | 是 | 弹窗可见性 |
| `onClose` | () =&gt; void | 是 | 关闭弹窗回调 |
| `mediaUrl` | string | 是 | 媒体文件 URL |
| `mediaType` | 'image' \| 'video' | 是 | 媒体类型 |

---

## DynamicKeyForm（动态 Key 表单组件）

**文件**: [frontend/src/components/DynamicKeyForm.tsx](../../frontend/src/components/DynamicKeyForm.tsx)

### 功能

根据 Key 定义动态生成表单。

### Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mode` | 'edit' \| 'import' | 是 | 表单模式 |
| `initialValues` | Record&lt;string, any&gt; | 否 | 初始值 |
| `onSubmit` | (values: Record&lt;string, any&gt;) =&gt; void | 是 | 提交回调 |

### 功能

根据 Key 定义中的配置：
- `isVisibleOnImport`: 导入时是否显示
- `isVisibleOnEdit`: 编辑时是否显示
- `dataType`: 数据类型，决定表单控件类型
- `isRequired`: 是否必填
- `defaultValue`: 默认值

动态生成表单字段。

---

## App（根组件）

**文件**: [frontend/src/App.tsx](../../frontend/src/App.tsx)

### 功能

应用根组件，提供 Redux Store。

### Props

无

### 结构

```tsx
&lt;Provider store={store}&gt;
  &lt;Layout /&gt;
&lt;/Provider&gt;
```

---

## 样式组件

使用 Styled Components 定义的样式组件：

| 组件 | 说明 |
|------|------|
| `StyledLayout` | 主布局容器 |
| `StyledHeader` | 头部 |
| `StyledSider` | 侧边栏 |
| `StyledMenu` | 菜单 |
| `StyledContent` | 内容区 |
| `StyledTabs` | Tab 组件 |
| `StyledSearch` | 搜索框 |
| `FileCard` | 文件卡片 |
| `DetailCard` | 详情卡片 |
| `PrimaryButton` | 主要按钮 |
| `GlobalStyle` | 全局样式 |
