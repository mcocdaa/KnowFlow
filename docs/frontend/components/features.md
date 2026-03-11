# 功能组件

---

## KeyManager（Key 管理组件）

**文件**: `frontend/src/components/KeyManager.tsx`

### 功能

管理 Key 分类和 Key 定义。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `visible` | boolean | 弹窗可见性 |
| `onClose` | function | 关闭弹窗回调 |

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

---

## AIAssistant（AI 助手组件）

**文件**: `frontend/src/components/AIAssistant.tsx`

### 功能

提供 AI 语义检索和自动打标签功能。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `visible` | boolean | 弹窗可见性 |
| `onClose` | function | 关闭弹窗回调 |

### 功能

1. **语义检索 Tab**
   - 输入自然语言查询
   - 调用 AI API
   - 显示搜索结果

2. **自动打标签 Tab**
   - 为选中的文件自动生成标签（预留功能）

---

## MediaPreview（媒体预览组件）

**文件**: `frontend/src/components/MediaPreview.tsx`

### 功能

预览图片和视频文件。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `visible` | boolean | 弹窗可见性 |
| `onClose` | function | 关闭弹窗回调 |
| `mediaUrl` | string | 媒体文件 URL |
| `mediaType` | 'image' \| 'video' | 媒体类型 |

---

## DynamicKeyForm（动态 Key 表单组件）

**文件**: `frontend/src/components/DynamicKeyForm.tsx`

### 功能

根据 Key 定义动态生成表单。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `mode` | 'edit' \| 'add' | 表单模式 |
| `initialValues` | object | 初始值 |
| `itemId` | string | 知识项 ID（编辑模式） |
| `onSubmit` | function | 提交回调 |

### 功能

根据 Key 定义中的配置动态生成表单字段：

- `is_visible`: 是否显示
- `value_type`: 数据类型，决定表单控件类型
- `is_required`: 是否必填
- `default_value`: 默认值
