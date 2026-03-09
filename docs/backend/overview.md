# KnowFlow 后端概述

## 技术栈

- **Web 框架**: FastAPI (Python)
- **服务器**: Uvicorn (ASGI 服务器)
- **HTTP 客户端**: httpx (用于 AI API 调用)
- **文件上传**: python-multipart
- **数据库**: JSON 文件 (db.json)

## 目录结构

```
backend/
├── app.py                    # FastAPI 应用入口
├── main.py                   # 主启动脚本
├── db.json                   # 数据库文件
├── requirements.txt          # Python 依赖
├── uploads/                  # 文件上传目录
├── api/                      # API 路由层
│   ├── __init__.py           # 路由注册
│   └── v1/                   # v1 版本 API
│       ├── __init__.py
│       ├── knowledge.py      # 知识项 CRUD 接口
│       ├── upload.py         # 文件上传接口
│       ├── category.py       # 分类管理接口
│       ├── key.py            # Key 定义接口
│       └── common.py         # 公共接口（健康检查等）
├── database/                 # 数据库层
│   ├── __init__.py
│   ├── database.py           # 数据库操作封装
│   └── init_data.py          # 初始化数据
├── managers/                 # 业务逻辑层
│   ├── __init__.py
│   ├── knowledge_item_manager.py  # 知识项管理器
│   ├── category_manager.py        # 分类管理器
│   └── key_manager.py             # Key 定义管理器
├── plugins/                  # 插件系统
│   ├── __init__.py
│   ├── manager.py            # 插件管理器
│   └── ai.py                 # AI 插件（豆包集成）
├── config/                   # 配置模块
│   ├── __init__.py
│   ├── settings.py           # 应用配置
│   └── constants.py          # 常量定义
├── utils/                    # 工具函数
│   ├── __init__.py
│   ├── migrate.py            # 数据迁移工具
│   └── file_util.py          # 文件处理工具
└── test/                     # 测试用例
    ├── test_app.py
    └── test_managers.py
```

## 核心功能

1. **知识项管理**: CRUD 操作
2. **文件上传**: 支持多种文件类型上传
3. **分类系统**: 内置和自定义分类
4. **Key 系统**: 灵活的属性定义
5. **AI 检索**: 集成豆包 AI 进行语义检索
6. **数据迁移**: 兼容旧数据格式

## 配置项

- `UPLOAD_DIR`: 文件上传目录 (默认: `./uploads`)
- `DB_FILE`: 数据库文件路径 (默认: `./db.json`)
- `AI_CONFIG`: AI 服务配置 (豆包 API)

## 启动方式

```bash
cd backend
pip install -r requirements.txt
python app.py
```

服务将在 `http://0.0.0.0:3000` 启动。
