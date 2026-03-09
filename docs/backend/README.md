# KnowFlow 后端文档

本目录包含 KnowFlow 后端的完整文档。

## 文档目录

| 文档 | 说明 |
|------|------|
| [overview.md](./overview.md) | 后端概述：技术栈、目录结构、核心功能 |
| [api.md](./api.md) | API 接口文档：所有接口的详细说明 |
| [database.md](./database.md) | 数据库结构：数据模型和字段说明 |
| [deployment.md](./deployment.md) | 部署与测试：环境搭建、测试运行、生产部署 |

## 快速开始

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

服务将在 `http://localhost:3000` 启动。

## 后端代码位置

- 主应用: [backend/app.py](../../backend/app.py)
- 测试: [backend/test/test_app.py](../../backend/test/test_app.py)
- 数据库: [backend/db.json](../../backend/db.json)
