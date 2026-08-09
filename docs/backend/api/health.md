# 健康检查接口

检查后端服务是否正常运行。

---

## 检查服务状态

```http
GET /api/v1/health
```

**响应示例**（外层统一 envelope，`data` 如下）:

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "status": "ok"
  }
}
```

---

## 用途

- 服务启动验证
- Kubernetes 探针
- 负载均衡器健康检查
