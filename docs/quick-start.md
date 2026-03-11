# 快速开始指南

本指南帮助你在 5 分钟内启动 KnowFlow 项目。

---

## 环境要求

| 依赖 | 版本要求 |
|------|---------|
| Python | 3.8+ |
| Node.js | 18+ |
| MongoDB | 4.4+ |

---

## 第一步：启动数据库

```bash
# 使用 Docker 启动 MongoDB（推荐）
docker run -d --name mongodb -p 27017:27017 mongo:latest

# 或使用本地 MongoDB
mongod --dbpath /path/to/data
```

---

## 第二步：启动后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

后端将在 `http://localhost:3000` 启动。

验证服务：
```bash
curl http://localhost:3000/api/v1/health
# 预期响应: {"status": "ok"}
```

---

## 第三步：启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 启动。

---

## 第四步：开始使用

1. 打开浏览器访问 `http://localhost:5173`
2. 拖拽文件到上传区域，或点击"添加知识记录"
3. 在左侧导航栏管理 Key 分类
4. 使用搜索框快速检索知识项

---

## 常见问题

### 后端无法连接数据库

检查 MongoDB 是否运行：
```bash
docker ps | grep mongo
# 或
mongod --version
```

### 前端无法连接后端

确认后端服务运行在 `http://localhost:3000`：
```bash
curl http://localhost:3000/api/v1/health
```

### 端口被占用

修改端口：
- 后端：编辑 `backend/main.py` 中的 `port` 参数
- 前端：编辑 `frontend/vite.config.ts` 中的 `server.port`

---

## 下一步

- [项目概述](./summary.md) - 了解项目功能
- [后端 API](./backend/api.md) - 查看接口文档
- [前端组件](./frontend/components.md) - 了解组件结构
- [插件开发](./plugin-system-design.md) - 开发自定义插件
