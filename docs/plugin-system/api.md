# 插件 API

---

## 获取插件清单

```http
GET /api/v1/plugins/manifests
```

**响应示例**：

```json
[
  {
    "name": "rating",
    "version": "1.0.0",
    "description": "为知识项添加星级评分功能",
    "author": "KnowFlow",
    "frontend_entry": "frontend.tsx",
    "path": "/path/to/plugins/rating"
  }
]
```

---

## 获取插件前端代码

```http
GET /api/v1/plugins/{plugin_name}/frontend
```

**响应示例**：

```json
{
  "code": "// 插件前端代码..."
}
```

**错误响应**：
- `404`: 插件或前端代码不存在

---

## 插件路由

插件注册的路由自动挂载到：

```
/api/v1/plugins/{plugin_name}/*
```

---

## 相关文档

- [后端开发](./backend-dev.md)
- [前端开发](./frontend-dev.md)
