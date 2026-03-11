# 分类管理接口

---

## 获取所有分类

```http
GET /api/v1/categories
```

**响应示例**:

```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "inner_category",
    "title": "内置 Key",
    "parent_name": null,
    "is_builtin": true
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "name": "basic_category",
    "title": "基础属性",
    "parent_name": "inner_category",
    "is_builtin": true
  }
]
```

---

## 获取单个分类

```http
GET /api/v1/categories/{category_id}
```

**路径参数**:
- `category_id`: 分类 ID

**响应**: 单个分类对象

**错误响应**:
- `404`: 分类不存在

---

## 创建分类

```http
POST /api/v1/categories
Content-Type: application/json

{
  "name": "custom_category",
  "title": "自定义分类",
  "parent_name": null,
  "is_builtin": false
}
```

**请求体字段**:
- `name`: 分类唯一标识名称（必需）
- `title`: 分类显示标题（必需）
- `parent_name`: 父分类名称（可选）
- `is_builtin`: 是否为内置分类（默认 false）

**响应**: 新创建的分类对象

**错误响应**:
- `400`: 参数无效或分类已存在

---

## 更新分类

```http
PUT /api/v1/categories/{category_id}
Content-Type: application/json

{
  "title": "新标题"
}
```

**路径参数**:
- `category_id`: 分类 ID

**响应**: 更新后的分类对象

**错误响应**:
- `400`: 参数无效或尝试修改内置分类

---

## 删除分类

```http
DELETE /api/v1/categories/{category_id}
```

**路径参数**:
- `category_id`: 分类 ID

**响应**:

```json
{
  "message": "Category deleted successfully"
}
```

**错误响应**:
- `400`: 无法删除内置分类或存在子分类
