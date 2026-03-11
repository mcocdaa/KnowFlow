# 文件上传接口

---

## 上传文件

```http
POST /api/v1/upload
Content-Type: multipart/form-data

file: [文件二进制数据]
data: {"name": "文件名", "keyValues": {...}}
```

**请求参数**:
- `file`: 上传的文件（必需）
- `data`: JSON 字符串，包含知识项元数据（必需）

**响应**: 新创建的知识项对象

---

## 说明

- 自动生成唯一文件名
- 自动填充 `file_path` 和 `file_type` 属性
- 验证必填 Key

**错误响应**:
- `400`: JSON 解析失败或缺少必填字段
