# 知识项管理接口

---

## 获取所有知识项

```http
GET /api/v1/item
```

**响应示例**:

```json
[
  {
    "item": {
      "id": "507f1f77bcf86cd799439011",
      "name": "示例文档",
      "created_at": "2026-03-07T10:00:00",
      "updated_at": "2026-03-07T10:00:00"
    },
    "attributes": {
      "name": "示例文档",
      "file_path": "./data/uploads/example.pdf",
      "file_type": "application/pdf"
    },
    "key_info": {
      "name": {
        "name": "name",
        "title": "名称",
        "value_type": "string",
        "is_required": true
      }
    }
  }
]
```

---

## 获取单个知识项

```http
GET /api/v1/item/{item_id}
```

**路径参数**:
- `item_id`: 知识项 ID（MongoDB ObjectId 字符串）

**响应示例**:

```json
{
  "item": {
    "id": "507f1f77bcf86cd799439011",
    "name": "示例文档"
  },
  "attributes": {
    "name": "示例文档",
    "file_path": "./data/uploads/example.pdf"
  },
  "key_info": {
    "name": { "name": "name", "title": "名称", "value_type": "string" }
  }
}
```

**错误响应**:
- `404`: 知识项不存在

---

## 创建知识项

```http
POST /api/v1/item
Content-Type: application/json

{
  "name": "新知识项",
  "keyValues": {
    "name": "文档名称",
    "file_path": "./data/uploads/file.pdf",
    "file_type": "application/pdf"
  }
}
```

**请求体字段**:
- `name`: 知识项名称（可选）
- `keyValues`: Key-Value 属性对象（可选）

**响应**: 新创建的知识项对象

**错误响应**:
- `400`: 请求参数无效

---

## 更新知识项

```http
PUT /api/v1/item/{item_id}
Content-Type: application/json

{
  "name": "更新后的名称",
  "keyValues": {
    "name": "新名称"
  }
}
```

**路径参数**:
- `item_id`: 知识项 ID

**响应**: 更新后的知识项对象

**错误响应**:
- `404`: 知识项不存在
- `400`: 请求参数无效

---

## 删除知识项

```http
DELETE /api/v1/item/{item_id}
```

**路径参数**:
- `item_id`: 知识项 ID

**响应**:

```json
{
  "message": "Item deleted successfully"
}
```

**错误响应**:
- `404`: 知识项不存在
