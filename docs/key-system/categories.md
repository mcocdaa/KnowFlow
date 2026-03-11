# Key 分类管理

Key 通过分类进行组织，支持层级结构。

---

## 分类结构

```
├── inner_category (内置 Key)
│   ├── basic_category (基础属性)
│   │   ├── name
│   │   ├── file_path
│   │   ├── file_type
│   │   └── rating (插件)
│   └── time_category (时间属性)
│       └── created_at
└── custom_category (自定义 Key)
```

---

## 默认分类

| name | title | parent_name | is_builtin |
|------|-------|-------------|------------|
| `inner_category` | 内置 Key | null | true |
| `basic_category` | 基础属性 | inner_category | true |
| `time_category` | 时间属性 | inner_category | true |
| `custom_category` | 自定义 Key | null | false |

---

## 分类管理功能

### 创建分类

```http
POST /api/v1/categories
Content-Type: application/json

{
  "name": "custom_category",
  "title": "自定义分类",
  "parent_name": null
}
```

### 删除分类

- 自定义分类可删除
- 内置分类（`is_builtin: true`）不可删除
- 存在子分类的分类不可删除

---

## 分类约束

- 分类名称必须唯一
- 内置分类不可修改和删除
- 存在子分类的分类不可删除

---

## 相关文档

- [内置 Key](./builtin-keys.md)
- [API 接口 - 分类管理](../backend/api.md)
