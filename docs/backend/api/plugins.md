# 插件系统接口

---

## 获取插件清单

```http
GET /api/v1/plugins/manifests
```

**响应示例**:

```json
[
  {
    "name": "rating",
    "version": "1.0.0",
    "description": "星级评分插件",
    "author": "KnowFlow Team",
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

**路径参数**:
- `plugin_name`: 插件名称

**响应示例**:

```json
{
  "code": "// 插件前端代码..."
}
```

**错误响应**:
- `404`: 插件或前端代码不存在

---

## 插件路由

插件注册的路由自动挂载到：

```
/api/v1/plugins/{plugin_name}/*
```

具体路由由插件后端入口文件定义。
