# 部署与测试文档

## 环境要求

- **Python**: 3.11+
- **MongoDB**: 7（本地开发）或 Docker

## 依赖安装

```bash
cd backend
pip install -r requirements.txt
```

**依赖列表**:
| 包名 | 用途 |
|------|------|
| `fastapi` | Web 框架 |
| `uvicorn` | ASGI 服务器 |
| `httpx` | HTTP 客户端（测试与 AI API） |
| `python-multipart` | 文件上传支持 |
| `pymongo` | MongoDB 驱动 |
| `pyyaml` | YAML 配置解析 |
| `python-dotenv` | 环境变量加载 |
| `pytest` / `pytest-asyncio` | 测试框架与异步测试支持 |

---

## 本地开发

推荐在项目根目录执行（配置项见 `.env.example`）：

```bash
# 1. 生成配置
cp .env.example .env

# 2. 启动 MongoDB（已有本地 MongoDB 可跳过）
docker run -d --name knowflow-mongo -p 27017:27017 -v knowflow-mongo:/data/db mongo:7

# 3. 启动后端（前端：./scripts/start.sh local frontend）
./scripts/start.sh local backend
```

后端在 `http://localhost:3000` 启动。验证服务：

```bash
curl http://localhost:3000/api/v1/health
# 预期响应
{"code":0,"message":"ok","data":{"status":"ok"}}
```

### 配置 AI API Key（可选）

Key 留空时 AI 功能自动降级，不影响其他功能。二选一：

```bash
# 方式一：写入根目录 .env 的 DOUBAO_API_KEY
# 方式二：使用 secrets 文件（优先级更高，不会提交到 Git）
cp secrets/doubao_api_key.txt.example secrets/doubao_api_key.txt
vim secrets/doubao_api_key.txt
```

### 直接运行（调试用）

```bash
cd backend
pip install -r requirements.txt
python main.py
# 或使用 uvicorn（支持热重载）
uvicorn main:app --host 0.0.0.0 --port 3000 --reload
```

---

## 测试

### 运行所有测试

```bash
cd backend
pytest -v
```

### 运行特定测试文件

```bash
# 数据库管理器测试
pytest test/test_db_manager.py -v

# 知识项管理器测试
pytest test/test_item_manager.py -v

# 分类管理器测试
pytest test/test_category_manager.py -v

# Key 管理器测试
pytest test/test_key_manager.py -v

# 插件后端测试
pytest test/test_rating_plugin.py -v

# 插件 API 测试
pytest test/test_rating_plugin_api.py -v
```

### 真实环境 API 回归检查

后端启动后，可运行端到端脚本对真实接口做逐功能检查（健康检查、插件、分类/Key/知识项 CRUD、搜索、上传、评分与 OpenClaw 插件、AI 降级、必填校验、删除）：

```bash
cd backend
python test/e2e_api_check.py                              # 默认 http://localhost:3000/api/v1，结束后清理测试数据
python test/e2e_api_check.py --keep                       # 保留测试数据（便于 UI 查看）
python test/e2e_api_check.py --base http://localhost:5177/api/v1   # 经前端 dev server 代理检查
```

退出码 0 表示全部通过；失败项会打印功能名。测试数据统一使用 `E2E` 前缀，可重复运行。

### 测试覆盖范围

| 测试文件 | 测试内容 |
|----------|----------|
| `test_db_manager.py` | 数据库连接、CRUD 操作、重试机制 |
| `test_item_manager.py` | 知识项 CRUD、数据类型转换 |
| `test_category_manager.py` | 分类 CRUD、层级关系、约束验证 |
| `test_key_manager.py` | Key 定义 CRUD、缓存机制 |
| `test_rating_plugin.py` | 插件后端逻辑测试 |
| `test_rating_plugin_api.py` | 插件 API 端点测试 |

### 测试配置

`pytest.ini`:

```ini
[pytest]
asyncio_mode = auto
testpaths = test
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

---

## Docker 部署

### 一键全栈（推荐）

```bash
cp .env.example .env
vim .env                          # 按需修改端口 / 填写 DOUBAO_API_KEY
docker compose up -d --build      # 在项目根目录执行
```

- 前端：`http://localhost:8002`（nginx 托管并代理 `/api` 到后端）
- 后端：`http://localhost:3002`（端口由 `.env` 的 `BACKEND_PORT`/`FRONTEND_PORT` 控制）

相关文件：

| 文件 | 说明 |
|------|------|
| `compose.yaml` | 根目录一键入口（include 分层文件） |
| `docker/docker-compose.base.yml` | MongoDB + 后端 |
| `docker/docker-compose.frontend.yml` | 仅前端 |
| `docker/docker-compose.full.yml` | 全栈（后端端口 + 前端） |
| `backend/Dockerfile`、`frontend/Dockerfile` | 镜像构建 |

### 分模式启动

```bash
./scripts/start.sh dev full       # Docker 启动前后端
./scripts/start.sh dev backend    # 仅后端
./scripts/stop.sh                 # 停止
```

### 使用预构建镜像

CI 会把镜像推送到 GHCR（`ghcr.io/mcocdaa/knowflow-backend`、`ghcr.io/mcocdaa/knowflow-frontend`），可用 `docker run` 直接运行，详见根目录 [README](../../README.md)。

---

## 生产部署

### 使用 Gunicorn + Uvicorn Workers

```bash
pip install gunicorn

# 启动 4 个 worker 进程
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:3000
```

### 环境变量配置

生产环境建议配置：

```env
# MongoDB（使用副本集或 Atlas）
MONGODB_URL=mongodb://user:password@host:27017/?replicaSet=rs0
MONGODB_DB_NAME=knowflow_prod

# CORS（限制允许的来源）
CORS_ORIGINS=https://your-domain.com

# 数据库重试
DB_RETRY_COUNT=5
```

### 安全建议

1. **API Key 安全**
   - 不要将 API Key 提交到版本控制
   - 使用 `secrets/` 目录（已加入 .gitignore）或环境变量存储敏感信息
   - 生产环境使用密钥管理服务

2. **CORS 配置**
   - 生产环境限制 `allow_origins`
   - 不要使用 `*` 允许所有来源

3. **文件上传**
   - 添加文件大小限制
   - 验证文件类型
   - 使用独立的存储服务（如 S3）

4. **数据库安全**
   - 启用 MongoDB 认证
   - 使用 TLS 连接
   - 定期备份

---

## 监控与日志

### 日志配置

FastAPI 默认使用 Python logging，可通过配置文件自定义：

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### 健康检查端点

```http
GET /api/v1/health
```

可用于 Kubernetes 探针或负载均衡器健康检查。

---

## 故障排查

### 常见问题

1. **数据库连接失败**
   - 检查 MongoDB 是否运行
   - 验证 `MONGODB_URL` 配置
   - 检查网络连接和防火墙

2. **插件加载失败**
   - 检查 `plugins.yaml` 中插件是否启用
   - 验证 `plugin.yaml` 文件格式
   - 检查后端入口文件是否存在

3. **文件上传失败**
   - 检查 `UPLOAD_DIR` 目录权限
   - 验证磁盘空间
   - 检查请求体大小限制

### 调试模式

```bash
# 启用调试日志
export LOG_LEVEL=DEBUG
uvicorn main:app --host 0.0.0.0 --port 3000 --reload --log-level debug
```
