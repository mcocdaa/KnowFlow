# 插件组件

---

## StarRating（星级评分插件）

**文件**: `frontend/src/plugins/components/StarRating.tsx`

### 功能

提供星级评分功能，支持 1-5 星评分。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `value` | number | 当前评分值 |
| `itemId` | string | 知识项 ID |
| `onUpdate` | function | 更新回调 |
| `readOnly` | boolean | 是否只读 |

### 功能

- 显示星级评分
- 支持点击修改评分
- 支持只读模式

---

## PluginRenderer（插件渲染器）

**文件**: `frontend/src/plugins/loader.tsx`

### 功能

渲染插件组件的包装器，处理插件加载状态和错误回退。

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `pluginName` | string | 插件名称 |
| `value` | unknown | 当前值 |
| `itemId` | string | 知识项 ID |
| `keyDefinition` | object | Key 定义 |
| `onUpdate` | function | 更新回调 |
| `readOnly` | boolean | 是否只读 |

### 行为

- 如果插件组件存在，渲染插件组件
- 如果插件组件不存在，显示原始值文本
- 加载中显示加载提示

---

## 相关文档

- [插件系统设计](../plugin-system-design.md)
- [前端开发](../frontend-dev.md)
