# 数据库结构文档

## 概述

后端使用 JSON 文件 (`db.json`) 作为数据存储，包含三个主要数据集合：

- `knowledgeItems`: 知识项列表
- `categories`: 分类列表
- `keyDefinitions`: Key 定义列表

## 数据结构

### 1. knowledgeItems (知识项)

```json
{
  "id": "1",
  "title": "知识项标题",
  "content": "知识项内容",
  "filePath": "./uploads/file.txt",
  "fileType": "text/plain",
  "createdAt": "2026-03-06T10:18:07.189037",
  "keyValues": [
    {
      "keyId": "1",
      "value": "./uploads/file.txt"
    },
    {
      "keyId": "3",
      "value": 0
    }
  ]
}
```

**字段说明**:
- `id`: 知识项唯一标识（字符串）
- `title`: 标题（可选）
- `content`: 内容（可选）
- `filePath`: 文件路径（可选，旧数据字段）
- `fileType`: 文件类型（可选，旧数据字段）
- `createdAt`: 创建时间（ISO 格式）
- `keyValues`: Key-Value 数组，存储属性值

### 2. categories (分类)

```json
{
  "id": "1",
  "name": "内置 Key",
  "parentId": null,
  "isBuiltin": true
}
```

**字段说明**:
- `id`: 分类唯一标识
- `name`: 分类名称
- `parentId`: 父分类 ID（null 表示根分类）
- `isBuiltin`: 是否为内置分类

### 3. keyDefinitions (Key 定义)

```json
{
  "id": "1",
  "name": "file_path",
  "categoryId": "2",
  "isBuiltin": true,
  "dataType": "string",
  "isRequired": false,
  "isReadOnly": true,
  "isVisibleOnImport": false,
  "isVisibleOnEdit": true,
  "defaultValue": null,
  "script": "",
  "description": "文件路径（系统分配）"
}
```

**字段说明**:
- `id`: Key 唯一标识
- `name`: Key 名称
- `categoryId`: 所属分类 ID
- `isBuiltin`: 是否为内置 Key
- `dataType`: 数据类型 (`string`, `number`, `boolean`)
- `isRequired`: 是否必填
- `isReadOnly`: 是否只读
- `isVisibleOnImport`: 导入时是否可见
- `isVisibleOnEdit`: 编辑时是否可见
- `defaultValue`: 默认值
- `script`: 脚本（预留字段）
- `description`: 描述

## 内置数据

### 默认分类

- 内置 Key (id: "1")
  - 基础属性 (id: "2")
  - 统计属性 (id: "3")
  - 评价属性 (id: "4")
  - 时间属性 (id: "5")
  - 媒体属性 (id: "6")
  - 文献属性 (id: "7")
- 自定义 Key (id: "8")

### 默认 Key 定义

| id | name | category | dataType | description |
|----|------|----------|----------|-------------|
| 1 | file_path | 基础属性 | string | 文件路径（系统分配） |
| 2 | file_type | 基础属性 | string | 文件类型（系统分配） |
| 3 | click_count | 统计属性 | number | 点击次数（只读） |
| 10 | star_rating | 统计属性 | number | 星级评分 |
| 11 | file_name | 基础属性 | string | 文件名 |
| 12 | is_link_only | 基础属性 | boolean | 非转存文件（仅保存路径） |

## 数据操作

### 加载数据

```python
def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return default_data
```

### 保存数据

```python
def save_db(db_data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db_data, f, ensure_ascii=False, indent=2)
```
