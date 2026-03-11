# KnowFlow 后端文档

本目录包含 KnowFlow 后端的完整文档。

## 文档目录

| 文档 | 说明 |
|------|------|
| [overview.md](./overview.md) | 后端概述：技术栈、目录结构、核心功能 |
| [api.md](./api.md) | API 接口文档：所有接口的详细说明 |
| [database.md](./database.md) | 数据库结构：MongoDB 集合结构和字段说明 |
| [deployment.md](./deployment.md) | 部署与测试：环境搭建、测试运行、生产部署 |

## 快速开始

### 环境要求

- Python 3.8+
- MongoDB 4.4+

### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 启动 MongoDB

```bash
# 使用 Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 启动服务

```bash
python main.py
```

服务将在 `http://localhost:3000` 启动。

### 验证服务

```bash
curl http://localhost:3000/api/v1/health
# 预期响应: {"status": "ok"}
```

## 后端代码位置

- 主应用: [backend/main.py](../../backend/main.py)
- API 路由: [backend/api/](../../backend/api/)
- 业务逻辑: [backend/managers/](../../backend/managers/)
- 测试: [backend/test/](../../backend/test/)

## 核心特性

- **异步架构**: 基于 FastAPI + motor 的全异步实现
- **MongoDB 存储**: 灵活的文档数据库
- **插件系统**: 支持动态加载插件扩展功能
- **Key-Value 系统**: 灵活的动态属性定义
- **自动路由加载**: 无需手动注册路由

## 相关文档

- [插件系统设计](../plugin-system-design.md)
- [Key 系统设计](../key-system-design.md)
- [系统架构](../architecture.md)
