# 部署与测试文档

## 环境要求

- Python 3.8+
- pip 包管理器

## 依赖安装

```bash
cd backend
pip install -r requirements.txt
```

**依赖列表**:
- `fastapi`: Web 框架
- `uvicorn`: ASGI 服务器
- `httpx`: HTTP 客户端（用于 AI API）
- `python-multipart`: 文件上传支持

## 本地开发

### 启动服务

```bash
cd backend
python app.py
```

服务将在 `http://0.0.0.0:3000` 启动。

### 使用 uvicorn 直接启动

```bash
uvicorn app:app --host 0.0.0.0 --port 3000 --reload
```

`--reload` 选项启用热重载，代码修改后自动重启。

## 配置

### AI 服务配置

在 [app.py](../../backend/app.py) 中配置豆包 AI：

```python
AI_CONFIG = {
    "doubao": {
        "api_key": "your-api-key-here",
        "base_url": "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
        "model": "ep-20260304151850-xqxr9"
    }
}
```

### 路径配置

```python
UPLOAD_DIR = "./uploads"  # 文件上传目录
DB_FILE = "./db.json"     # 数据库文件
```

## 测试

### 运行测试

```bash
cd backend
pytest test/test_app.py -v
```

### 测试覆盖范围

测试用例位于 `backend/test/test_app.py`，包含：

1. **健康检查测试** (`test_health_check`)
   - 验证 `/api/health` 端点返回正确响应

2. **获取知识项测试** (`test_get_knowledge`)
   - 验证 `/api/knowledge` 返回列表

3. **添加知识项测试** (`test_add_knowledge`)
   - 验证 POST `/api/knowledge` 创建新项

4. **获取分类测试** (`test_get_categories`)
   - 验证 `/api/categories` 返回分类列表

5. **获取 Key 定义测试** (`test_get_keys`)
   - 验证 `/api/keys` 返回 Key 定义列表

6. **AI 搜索测试** (`test_ai_search`)
   - 验证 `/api/ai/search` 端点响应

7. **文件上传测试** (`test_upload_file`)
   - 验证文件上传和知识项创建

### 测试环境

测试使用 pytest 框架，包含以下特性：

- 自动保存和恢复原始 `db.json`
- 测试前清理测试环境
- 测试后清理临时文件

## 生产部署

### 使用 Gunicorn + Uvicorn Workers

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:3000
```

### Docker 部署示例

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3000

CMD ["python", "app.py"]
```

## 注意事项

1. **数据备份**: 定期备份 `db.json` 和 `uploads/` 目录
2. **CORS 配置**: 生产环境建议限制 `allow_origins`
3. **API Key 安全**: 不要将 API Key 提交到版本控制
4. **文件大小限制**: 考虑添加文件上传大小限制
