# 数据存储方案

KnowFlow 使用 MongoDB 作为主存储，适合动态 Key-Value 结构。

---

## 数据库选择理由

- **文档型数据库**: 适合动态 Key-Value 结构
- **灵活的 Schema**: 无需预定义字段
- **高性能读写**: 支持索引和聚合

---

## 集合结构

### items（知识项）

存储知识项及其属性。

```json
{
  "_id": ObjectId("..."),
  "name": "示例文档",
  "file_path": "./data/uploads/example.pdf",
  "file_type": "application/pdf",
  "created_at": ISODate("2026-03-07T10:00:00Z"),
  "updated_at": ISODate("2026-03-07T10:00:00Z")
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | ObjectId | 唯一标识 |
| `name` | string | 知识项名称 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |
| 动态属性 | various | Key-Value 系统定义的属性 |

---

### categories（分类）

存储分类定义，支持层级结构。

```json
{
  "_id": ObjectId("..."),
  "name": "basic_category",
  "title": "基础属性",
  "parent_name": "inner_category",
  "is_builtin": true
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | ObjectId | 唯一标识 |
| `name` | string | 分类唯一标识名称 |
| `title` | string | 显示标题 |
| `parent_name` | string | 父分类名称 |
| `is_builtin` | boolean | 是否为内置分类 |

---

### keys（Key 定义）

存储 Key 定义，定义知识项的属性结构。

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
  "plugin_name": "builtin"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | ObjectId | 唯一标识 |
| `name` | string | Key 唯一标识名称 |
| `title` | string | 显示标题 |
| `value_type` | string | 数据类型 |
| `category_name` | string | 所属分类名称 |
| `is_required` | boolean | 是否必填 |
| `is_visible` | boolean | 是否可见 |

---

## 索引策略

| 集合 | 字段 | 索引类型 |
|------|------|---------|
| items | name | 普通索引 |
| categories | name | 唯一索引 |
| keys | name | 唯一索引 |

---

## 相关文档

- [数据库结构详细文档](../backend/database.md)
- [Key 系统设计](../key-system-design.md)
