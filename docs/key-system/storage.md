# Key 存储结构

Key 定义存储在 MongoDB 的 `keys` 集合中。

---

## keys 集合结构

```json
{
  "_id": ObjectId("..."),
  "name": "name",
  "title": "名称",
  "value_type": "string",
  "default_value": "",
  "description": "项目名称",
  "category_name": "basic_category",
  "is_required": true,
  "is_visible": true,
  "plugin_name": "builtin",
  "delete_with_plugin": false,
  "is_public": true,
  "is_private": false,
  "created_at": "2026-01-01",
  "updated_at": "2026-01-01"
}
```

---

## 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | MongoDB 唯一标识 |
| `name` | string | 是 | Key 唯一标识名称 |
| `title` | string | 是 | 显示标题 |
| `value_type` | string | 是 | 数据类型 |
| `default_value` | any | 否 | 默认值 |
| `description` | string | 否 | 描述 |
| `category_name` | string | 是 | 所属分类名称 |
| `is_required` | boolean | 否 | 是否必填 |
| `is_visible` | boolean | 否 | 是否可见 |
| `plugin_name` | string | 否 | 所属插件名称 |
| `delete_with_plugin` | boolean | 否 | 删除插件时是否删除此 Key |
| `is_public` | boolean | 否 | 是否公开 |
| `is_private` | boolean | 否 | 是否私有 |

---

## 数据类型转换

Key-Value 系统支持自动类型转换：

| value_type | 存储格式 | 返回格式 |
|-----------|---------|---------|
| string | 原样 | 原样 |
| number | 数字字符串 | `int()` 或 `float()` |
| boolean | "true"/"false" | `bool()` |
| array | JSON 字符串 | `json.loads()` |
| object | JSON 字符串 | `json.loads()` |

---

## 缓存机制

Key 定义查询结果会被缓存：

- 缓存有效期：300 秒（5 分钟）
- 写操作自动失效缓存
- 缓存过期后自动重新加载

---

## 相关文档

- [数据库结构](../backend/database.md)
- [Key 系统概述](./overview.md)
