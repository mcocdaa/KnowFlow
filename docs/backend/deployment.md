# 部署与测试文档

## 环境要求

- **Python**: 3.8+
- **MongoDB**: 4.4+
- **pip**: Python 包管理器

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
| `httpx` | HTTP 客户端（用于 AI API） |
| `python-multipart` | 文件上传支持 |
| `motor` | MongoDB 异步驱动 |
| `pymongo` | MongoDB 同步驱动（用于工具） |
| `pyyaml` | YAML 配置解析 |
| `python-dotenv` | 环境变量加载 |
| `pytest` | 测试框架 |
| `pytest-asyncio` | 异步测试支持 |
| `pytest-mock` | Mock 支持 |

---

## 本地开发

### 1. 启动 MongoDB

```bash
# 使用 Docker 启动 MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# 或使用本地安装的 MongoDB
mongod --dbpath /path/to/data
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# API 配置
API_VERSION=v1

# 数据目录
DATA_DIR=./data
UPLOAD_DIR=./data/uploads

# MongoDB 配置
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=knowflow
DB_RETRY_COUNT=3

# CORS 配置
CORS_ORIGINS=*

# 插件目录
PLUGINS_DIR=./plugins
```

### 3. 配置 AI API Key（可选）

创建 `.secrets/doubao_api_key` 文件：

```bash
mkdir -p .secrets
echo "your-api-key-here" > .secrets/doubao_api_key
```

### 4. 启动服务

```bash
# 方式一：直接运行
python main.py

# 方式二：使用 uvicorn（支持热重载）
uvicorn main:app --host 0.0.0.0 --port 3000 --reload
```

服务将在 `http://0.0.0.0:3000` 启动。

### 5. 验证服务

```bash
# 健康检查
curl http://localhost:3000/api/v1/health

# 预期响应
{"status": "ok"}
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

# 插件加载器测试
pytest test/test_plugin_loader.py -v

# 插件 API 测试
pytest test/test_rating_plugin_api.py -v
```

### 测试覆盖范围

| 测试文件 | 测试内容 |
|----------|----------|
| `test_db_manager.py` | 数据库连接、CRUD 操作、重试机制 |
| `test_item_manager.py` | 知识项 CRUD、数据类型转换 |
| `test_category_manager.py` | 分类 CRUD、层级关系、约束验证 |
| `test_key_manager.py` | Key 定义 CRUD、缓存机制 |
| `test_plugin_loader.py` | 插件加载、Key 注册、路由注册 |
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

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 创建必要目录
RUN mkdir -p data/uploads .secrets

EXPOSE 3000

CMD ["python", "main.py"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URL=mongodb://mongo:27017
      - MONGODB_DB_NAME=knowflow
    volumes:
      - ./data:/app/data
      - ./.secrets:/app/.secrets
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

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
   - 使用 `.secrets` 目录或环境变量存储敏感信息
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
