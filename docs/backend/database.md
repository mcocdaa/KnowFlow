# 数据库结构文档

## 概述

后端使用 **MongoDB** 作为数据存储，通过异步驱动 `motor` 进行数据库操作。

### 数据库配置

```python
MONGODB_URL = "mongodb://localhost:27017"
MONGODB_DB_NAME = "knowflow"
```

### 数据库集合

| 集合名称 | 说明 |
|----------|------|
| `items` | 知识项 |
| `categories` | 分类定义 |
| `keys` | Key 定义 |

---

## 集合结构

### 1. items（知识项）

存储知识项及其属性。

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "示例文档",
  "file_path": "./data/uploads/example.pdf",
  "file_type": "application/pdf",
  "created_at": ISODate("2026-03-07T10:00:00Z"),
  "updated_at": ISODate("2026-03-07T10:00:00Z")
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | MongoDB 自动生成的唯一标识 |
| `name` | string | 否 | 知识项名称 |
| `created_at` | datetime | 是 | 创建时间 |
| `updated_at` | datetime | 是 | 更新时间 |
| `file_path` | string | 否 | 文件路径（Key 属性） |
| `file_type` | string | 否 | 文件类型（Key 属性） |
| ... | ... | 否 | 其他动态 Key 属性 |

**索引**:
- `name`: 普通索引

**动态属性**:
知识项支持动态 Key-Value 属性，属性名由 `keys` 集合定义。所有属性值以字符串形式存储，读取时根据 Key 定义的 `value_type` 进行类型转换。

---

### 2. categories（分类）

存储分类定义，支持层级结构。

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "basic_category",
  "title": "基础属性",
  "parent_name": "inner_category",
  "is_builtin": true
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | MongoDB 自动生成的唯一标识 |
| `name` | string | 是 | 分类唯一标识名称 |
| `title` | string | 是 | 分类显示标题 |
| `parent_name` | string | 否 | 父分类名称（null 表示根分类） |
| `is_builtin` | boolean | 否 | 是否为内置分类（默认 false） |

**索引**:
- `name`: 唯一索引

**约束**:
- `name` 必须唯一
- 内置分类（`is_builtin: true`）不可修改和删除
- 存在子分类的分类不可删除

---

### 3. keys（Key 定义）

存储 Key 定义，定义知识项的属性结构。

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
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

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 是 | MongoDB 自动生成的唯一标识 |
| `name` | string | 是 | Key 唯一标识名称 |
| `title` | string | 是 | 显示标题 |
| `value_type` | string | 是 | 数据类型：`string`, `number`, `boolean`, `array`, `object` |
| `default_value` | string | 否 | 默认值 |
| `description` | string | 否 | 描述 |
| `category_name` | string | 是 | 所属分类名称 |
| `is_required` | boolean | 否 | 是否必填（默认 false） |
| `is_visible` | boolean | 否 | 是否可见（默认 true） |
| `plugin_name` | string | 否 | 所属插件名称 |
| `delete_with_plugin` | boolean | 否 | 删除插件时是否删除此 Key（默认 true） |
| `is_public` | boolean | 否 | 是否公开（默认 true） |
| `is_private` | boolean | 否 | 是否私有（默认 false） |
| `created_at` | string | 否 | 创建时间 |
| `updated_at` | string | 否 | 更新时间 |

**索引**:
- `name`: 唯一索引

**约束**:
- `name` 必须唯一
- `category_name` 必须指向存在的分类
- 内置 Key（`is_builtin: true`）不可修改和删除

---

## 默认数据

### 默认分类

系统初始化时会自动创建以下分类：

| name | title | parent_name | is_builtin |
|------|-------|-------------|------------|
| `inner_category` | 内置 Key | null | true |
| `basic_category` | 基础属性 | inner_category | true |
| `time_category` | 时间属性 | inner_category | true |
| `custom_category` | 自定义 Key | null | false |

### 默认 Key 定义

| name | title | value_type | category_name | is_required |
|------|-------|------------|---------------|-------------|
| `name` | 名称 | string | basic_category | true |
| `file_path` | 文件路径 | string | basic_category | true |
| `file_type` | 文件类型 | string | basic_category | false |
| `created_at` | 创建时间 | string | time_category | false |

---

## 数据库操作

### DBManager 类

数据库操作通过 `DBManager` 类封装，提供以下方法：

```python
from managers.db_manager import db_manager

# 初始化连接
await db_manager.initialize()

# 插入单个文档
item_id = await db_manager.insert_one("items", {"name": "test"})

# 查询单个文档
item = await db_manager.find_one("items", {"_id": ObjectId(item_id)})

# 查询多个文档
items = await db_manager.find("items", {"name": "test"})

# 更新文档
count = await db_manager.update_one("items", {"_id": ObjectId(item_id)}, {"$set": {"name": "new"}})

# 删除文档
count = await db_manager.delete_one("items", {"_id": ObjectId(item_id)})

# 统计文档数量
count = await db_manager.count_documents("items")

# 关闭连接
await db_manager.close()
```

### 重试机制

数据库操作支持自动重试：

```python
@retry_on_connection_error
async def find_one(self, collection: str, query: Dict[str, Any]):
    ...
```

- 重试次数由 `DB_RETRY_COUNT` 配置（默认 3 次）
- 每次重试间隔递增（1s, 2s, 3s...）
- 重试前会尝试重新连接数据库

---

## 数据迁移

系统启动时会自动初始化默认数据：

1. 检查 `categories` 集合是否为空
2. 如果为空，从 `data/default/categories.yaml` 加载默认分类
3. 检查 `keys` 集合是否为空
4. 如果为空，从 `data/default/keys.yaml` 加载默认 Key 定义

---

## 缓存机制

Key 定义查询结果会被缓存以提高性能：

```python
class KeyManager:
    def __init__(self):
        self._cache: Optional[List[Dict[str, Any]]] = None
        self._cache_time: Optional[datetime] = None
        self._cache_ttl = 300  # 缓存过期时间（秒）
```

- 缓存有效期：300 秒（5 分钟）
- 写操作（create, update, delete）会自动失效缓存
- 缓存过期后自动重新加载
