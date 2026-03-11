# 前端动态表单

前端根据 Key 定义动态生成表单控件。

---

## 表单控件映射

| value_type | 表单控件 |
|-----------|---------|
| string | Input |
| number | InputNumber |
| boolean | Switch |
| array | Select (多选) |
| object | JSON 编辑器 |

---

## DynamicKeyForm 组件

```tsx
<DynamicKeyForm
  mode="edit"              // 'edit' | 'add'
  initialValues={values}   // 初始值
  itemId={itemId}          // 知识项 ID
  onSubmit={handleSubmit}  // 提交回调
/>
```

---

## 表单字段控制

根据 Key 定义控制表单字段：

| 属性 | 说明 |
|------|------|
| `is_visible` | 是否显示该字段 |
| `is_required` | 是否必填 |
| `default_value` | 默认值 |
| `value_type` | 控件类型 |

---

## 插件组件渲染

对于插件提供的 Key，使用 PluginRenderer 渲染：

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

---

## 相关文档

- [前端组件文档](../frontend/components.md)
- [插件系统设计](../plugin-system-design.md)
