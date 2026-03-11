# KnowFlow 后端概述

## 技术栈

- **Web 框架**: FastAPI (Python 3.8+)
- **服务器**: Uvicorn (ASGI 服务器)
- **数据库**: MongoDB (异步驱动 motor)
- **HTTP 客户端**: httpx (用于 AI API 调用)
- **文件上传**: python-multipart
- **配置管理**: python-dotenv, PyYAML
- **测试框架**: pytest, pytest-asyncio, pytest-mock

## 目录结构

```
backend/
├── main.py                   # FastAPI 应用入口
├── requirements.txt          # Python 依赖
├── pytest.ini                # pytest 配置
├── Dockerfile                # Docker 构建文件
├── docker-compose.yml        # Docker Compose 配置
├── .env                      # 环境变量配置
├── .secrets/                 # 敏感信息存储（API Key 等）
│   └── doubao_api_key
├── data/                     # 数据目录
│   ├── uploads/              # 文件上传目录
│   └── default/              # 默认配置数据
│       ├── categories.yaml   # 默认分类定义
│       └── keys.yaml         # 默认 Key 定义
├── api/                      # API 路由层
│   ├── __init__.py           # 路由注册
│   └── v1/                   # v1 版本 API
│       ├── __init__.py       # v1 路由自动加载
│       ├── item.py           # 知识项 CRUD 接口
│       ├── upload.py         # 文件上传接口
│       ├── category.py       # 分类管理接口
│       ├── key.py            # Key 定义接口
│       ├── common.py         # 公共接口（健康检查）
│       └── plugins/          # 插件相关接口
│           ├── __init__.py
│           ├── manifests.py  # 插件清单接口
│           └── frontend.py   # 插件前端代码接口
├── managers/                 # 业务逻辑层
│   ├── __init__.py
│   ├── db_manager.py         # MongoDB 数据库管理
│   ├── item_manager.py       # 知识项管理器
│   ├── category_manager.py   # 分类管理器
│   └── key_manager.py        # Key 定义管理器
├── core/                     # 核心模块
│   ├── __init__.py
│   ├── plugin_loader.py      # 插件加载器
│   └── router_loader.py      # 路由自动加载器
├── config/                   # 配置模块
│   ├── __init__.py
│   └── settings.py           # 应用配置
├── utils/                    # 工具函数
│   ├── __init__.py
│   └── file_util.py          # 文件处理工具
└── test/                     # 测试用例
    ├── __init__.py
    ├── conftest.py           # pytest 配置
    ├── test_db_manager.py
    ├── test_item_manager.py
    ├── test_category_manager.py
    ├── test_key_manager.py
    ├── test_plugin_loader.py
    ├── test_rating_plugin.py
    └── test_rating_plugin_api.py
```

## 核心功能

### 1. 知识项管理

- 完整的 CRUD 操作（创建、读取、更新、删除）
- 支持动态属性（Key-Value）系统
- 自动时间戳管理（created_at, updated_at）
- 数据类型自动转换

### 2. 分类系统

- 层级分类结构（支持父子关系）
- 内置分类与自定义分类
- 分类验证与约束

### 3. Key 定义系统

- 灵活的属性定义
- 支持多种数据类型（string, number, boolean, array, object）
- 必填/可选控制
- 可见性控制
- 缓存机制优化性能

### 4. 文件上传

- 支持多种文件类型上传
- 自动生成唯一文件名
- 自动提取文件类型信息
- 与知识项关联

### 5. 插件系统

- 动态加载插件
- 插件可注册自定义 Key
- 插件可注册自定义 API 路由
- 插件生命周期管理（on_load, on_unload）

### 6. AI 集成

- 集成豆包 AI 进行语义检索
- API Key 安全存储（.secrets 目录）

## 配置项

### 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `API_VERSION` | `v1` | API 版本 |
| `DATA_DIR` | `./data` | 数据目录 |
| `UPLOAD_DIR` | `./data/uploads` | 文件上传目录 |
| `PLUGINS_DIR` | `./plugins` | 插件目录 |
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB 连接 URL |
| `MONGODB_DB_NAME` | `knowflow` | 数据库名称 |
| `DB_RETRY_COUNT` | `3` | 数据库连接重试次数 |
| `CORS_ORIGINS` | `*` | CORS 允许的来源 |

### AI 配置

AI 配置通过 `.secrets/doubao_api_key` 文件存储 API Key：

```python
AI_CONFIG = {
    "doubao": {
        "api_key": read_secret("doubao_api_key", ""),
        "base_url": "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
        "model": "ep-20260304151850-xqxr9"
    }
}
```

## 启动方式

### 开发环境

```bash
cd backend
pip install -r requirements.txt
python main.py
```

服务将在 `http://0.0.0.0:3000` 启动。

### 使用 uvicorn

```bash
uvicorn main:app --host 0.0.0.0 --port 3000 --reload
```

### Docker 部署

```bash
docker-compose up -d
```

## 架构特点

### 异步架构

- 所有数据库操作均为异步
- 使用 motor 作为 MongoDB 异步驱动
- FastAPI 原生支持异步

### 自动路由加载

- 通过 `router_loader.py` 自动扫描并加载路由
- 支持分层路由结构
- 无需手动注册每个路由

### 数据库重试机制

- 自动重试失败的数据库操作
- 可配置重试次数
- 自动重连机制

### Key 缓存

- Key 定义查询结果缓存
- 可配置缓存过期时间（默认 300 秒）
- 写操作自动失效缓存
