# Key 定义管理接口

---

## 获取所有 Key 定义

```http
GET /api/v1/keys
```

**响应示例**:

```json
[
  {
    "id": "507f1f77bcf86cd799439014",
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
]
```

---

## 获取单个 Key 定义

```http
GET /api/v1/keys/{key_name}
```

**路径参数**:
- `key_name`: Key 名称

**响应**: 单个 Key 定义对象

**错误响应**:
- `404`: Key 不存在

---

## 创建 Key 定义

```http
POST /api/v1/keys
Content-Type: application/json

{
  "name": "custom_key",
  "title": "自定义属性",
  "value_type": "string",
  "default_value": "",
  "description": "用户自定义属性",
  "category_name": "custom_category",
  "is_required": false,
  "is_visible": true,
  "plugin_name": "builtin"
}
```

**请求体字段**:
- `name`: Key 唯一标识名称（必需）
- `title`: 显示标题（必需）
- `value_type`: 数据类型（必需）
- `category_name`: 所属分类名称（必需）

**响应**: 新创建的 Key 定义对象

**错误响应**:
- `400`: 参数无效或 Key 已存在

---

## 更新 Key 定义

```http
PUT /api/v1/keys/{key_name}
Content-Type: application/json

{
  "title": "新标题",
  "description": "新描述"
}
```

**路径参数**:
- `key_name`: Key 名称

**响应**: 更新后的 Key 定义对象

**错误响应**:
- `400`: 参数无效或尝试修改内置 Key

---

## 删除 Key 定义

```http
DELETE /api/v1/keys/{key_name}
```

**路径参数**:
- `key_name`: Key 名称

**响应**:

```json
{
  "message": "Key deleted successfully"
}
```

**错误响应**:
- `400`: 无法删除内置 Key
