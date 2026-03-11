# Key 系统概述

KnowFlow 的 Key 系统是一个灵活的动态属性定义系统，允许用户为知识项定义任意类型的属性。

---

## 核心特性

| 特性 | 说明 |
|------|------|
| 动态定义 | 用户可以创建自定义 Key，无需修改数据库 Schema |
| 类型支持 | 支持 string, number, boolean, array, object 五种数据类型 |
| 分类管理 | Key 可以按分类组织，支持层级结构 |
| 插件扩展 | 插件可以注册自定义 Key |
| 缓存优化 | Key 定义查询结果缓存 300 秒 |

---

## 数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `string` | 字符串 | `"示例文本"` |
| `number` | 数字 | `123`, `3.14` |
| `boolean` | 布尔值 | `true`, `false` |
| `array` | 数组 | `["a", "b", "c"]` |
| `object` | 对象 | `{"key": "value"}` |

---

## 相关文档

| 文档 | 说明 |
|------|------|
| [内置 Key](./builtin-keys.md) | 系统预定义的 Key |
| [分类管理](./categories.md) | Key 分类层级结构 |
| [存储结构](./storage.md) | MongoDB 存储结构 |
| [前端表单](./frontend-form.md) | 动态表单生成 |
