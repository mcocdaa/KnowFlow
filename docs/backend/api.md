# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **CORS**: 已启用跨域支持

---

## 接口模块

| 模块 | 说明 | 文档 |
|------|------|------|
| 健康检查 | 服务状态检查 | [health.md](./api/health.md) |
| 知识项管理 | 知识项 CRUD | [items.md](./api/items.md) |
| 文件上传 | 文件上传处理 | [upload.md](./api/upload.md) |
| 分类管理 | 分类 CRUD | [categories.md](./api/categories.md) |
| Key 管理 | Key 定义 CRUD | [keys.md](./api/keys.md) |
| 插件系统 | 插件相关接口 | [plugins.md](./api/plugins.md) |

---

## 快速参考

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数无效 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

### 数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `string` | 字符串 | `"hello"` |
| `number` | 数字 | `123` |
| `boolean` | 布尔值 | `true` |
| `array` | 数组 | `["a", "b"]` |
| `object` | 对象 | `{"key": "value"}` |

---

## 相关文档

- [后端概述](./overview.md)
- [数据库结构](./database.md)
