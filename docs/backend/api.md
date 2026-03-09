# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **CORS**: 已启用跨域支持，允许所有来源

## 接口列表

### 1. 健康检查

检查后端服务是否正常运行。

```http
GET /api/health
```

**响应示例**:
```json
{
  "status": "ok"
}
```

---

### 2. 知识项管理

#### 获取所有知识项

```http
GET /api/knowledge
```

**响应**: 知识项数组，包含自动数据迁移（将旧格式数据迁移到 keyValues）。

**响应示例**:
```json
[
  {
    "id": "1",
    "title": "Test Item",
    "createdAt": "2026-03-06T10:18:07.189037",
    "keyValues": [
      {
        "keyId": "1",
        "value": "./uploads/test.txt"
      },
      {
        "keyId": "3",
        "value": 0
      }
    ]
  }
]
```

#### 添加知识项

```http
POST /api/knowledge
Content-Type: application/json

{
  "title": "新知识项",
  "content": "内容",
  "keyValues": [...]
}
```

**响应**: 新创建的知识项对象。

#### 更新知识项

```http
PUT /api/knowledge/{id}
Content-Type: application/json

{
  "title": "更新后的标题"
}
```

**路径参数**:
- `id`: 知识项 ID

**响应**: 更新后的知识项对象。

#### 获取单个知识项

```http
GET /api/knowledge/{id}
```

**路径参数**:
- `id`: 知识项 ID

**响应**: 单个知识项对象。

**错误响应**:
- `404`: 知识项不存在

#### 删除知识项

```http
DELETE /api/knowledge/{id}
```

**路径参数**:
- `id`: 知识项 ID

**响应**:
```json
{
  "message": "Item deleted successfully"
}
```

**错误响应**:
- `404`: 知识项不存在

---

### 3. 文件上传

```http
POST /api/upload
Content-Type: multipart/form-data

file: [文件二进制数据]
```

**响应**: 自动创建的知识项对象，包含文件路径、类型等信息。

---

### 4. 分类管理

#### 获取所有分类

```http
GET /api/categories
```

**响应**: 分类数组。

---

### 5. Key 定义管理

#### 获取所有 Key 定义

```http
GET /api/keys
```

**响应**: Key 定义数组。

---

### 6. AI 检索

```http
POST /api/ai/search
Content-Type: application/json

{
  "query": "搜索关键词"
}
```

**响应**: 
- 成功时返回豆包 AI 的响应
- 失败时降级为本地关键词匹配，返回匹配的知识项数组

---

## 数据迁移

获取知识项接口 (`GET /api/knowledge`) 会自动执行以下数据迁移：

- `starRating` → `keyValues` 中的 `keyId: "10"`
- `clickCount` → `keyValues` 中的 `keyId: "3"`
- `filePath` → `keyValues` 中的 `keyId: "1"`
- `fileType` → `keyValues` 中的 `keyId: "2"`
