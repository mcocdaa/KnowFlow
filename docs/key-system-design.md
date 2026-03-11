# Key 系统设计

KnowFlow 的 Key 系统是一个灵活的动态属性定义系统。

---

## 系统概述

Key 系统允许用户为知识项定义任意类型的属性，Key 定义存储在数据库中，知识项通过 Key-Value 对存储属性值。

### 核心特性

- **动态定义**: 创建自定义 Key，无需修改 Schema
- **类型支持**: string, number, boolean, array, object
- **分类管理**: 层级分类结构
- **插件扩展**: 插件可注册自定义 Key
- **缓存优化**: 300 秒 TTL 缓存

---

## 详细文档

| 文档 | 说明 |
|------|------|
| [系统概述](./key-system/overview.md) | Key 系统核心特性 |
| [内置 Key](./key-system/builtin-keys.md) | 系统预定义的 Key |
| [分类管理](./key-system/categories.md) | Key 分类层级结构 |
| [存储结构](./key-system/storage.md) | MongoDB 存储结构 |
| [前端表单](./key-system/frontend-form.md) | 动态表单生成 |

---

## 快速参考

### 数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `string` | 字符串 | `"示例文本"` |
| `number` | 数字 | `123` |
| `boolean` | 布尔值 | `true` |
| `array` | 数组 | `["a", "b"]` |
| `object` | 对象 | `{"key": "value"}` |

### 分类结构

```
├── inner_category (内置 Key)
│   ├── basic_category (基础属性)
│   └── time_category (时间属性)
└── custom_category (自定义 Key)
```

---

## 相关文档

- [数据库结构](./backend/database.md)
- [API 接口 - Key 管理](./backend/api.md)
