# 内置 Key

系统初始化时自动创建的预定义 Key。

---

## 核心内置 Key

| Key 名称 | 数据类型 | 描述 | 分类 | 必填 |
|---------|---------|------|------|------|
| `name` | string | 知识项名称 | basic_category | 是 |
| `file_path` | string | 文件路径或 URL | basic_category | 是 |
| `file_type` | string | 文件类型（MIME 类型） | basic_category | 否 |
| `created_at` | string | 创建时间 | time_category | 否 |

---

## 插件提供的 Key

插件可以注册自定义 Key：

| Key 名称 | 数据类型 | 描述 | 分类 | 插件 |
|---------|---------|------|------|------|
| `rating` | number | 星级评分（1-5） | basic_category | rating |

---

## 内置 Key 约束

- 内置 Key 不可删除
- 内置 Key 的 `name` 和 `value_type` 不可修改
- 内置 Key 可以修改 `title`、`description` 等属性

---

## 相关文档

- [分类管理](./categories.md)
- [存储结构](./storage.md)
