# KnowFlow

KnowFlow 是一个智能知识管理系统，帮助用户高效组织、检索和管理各类文件和知识。

## 项目简介

KnowFlow 采用前后端分离架构，前端基于 React + TypeScript + Electron 构建，后端使用 Python + FastAPI 实现。系统支持文件上传、关键词管理、智能检索等功能，为用户提供一站式知识管理解决方案。

## 主要功能

- 📁 **文件管理**：支持多种文件格式上传、预览和管理
- 🔍 **智能搜索**：基于关键词和语义的快速检索
- 🏷️ **关键词管理**：自定义关键词分类和定义
- ⭐ **文件评分**：支持对文件进行星级评价
- 📊 **点击统计**：记录文件点击次数，智能推荐常用文件
- 🖥️ **跨平台**：基于 Electron 构建，支持 Windows、macOS 和 Linux

## 技术栈

### 前端
- **框架**：React 19.2.0
- **语言**：TypeScript
- **状态管理**：Redux Toolkit
- **UI 库**：Ant Design 6.3.1
- **样式**：Styled Components
- **构建工具**：Vite
- **桌面应用**：Electron 40.7.0

### 后端
- **框架**：FastAPI
- **语言**：Python
- **数据存储**：JSON 文件
- **文件上传**：FastAPI UploadFile
- **AI 集成**：豆包 API

## 快速开始

### 环境要求
- **Node.js**：18.0 或更高版本
- **Python**：3.8 或更高版本

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/knowflow.git
   cd knowflow
   ```

2. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   ```

3. **安装后端依赖**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **启动后端服务**
   ```bash
   python app.py
   ```
   后端服务将在 `http://localhost:3000` 启动

5. **启动前端开发服务器**
   ```bash
   cd ../frontend
   npm run dev
   ```
   前端服务将在 `http://localhost:5173` 启动（如果端口被占用，会自动选择其他端口）

6. **启动 Electron 应用**（可选）
   ```bash
   npm run electron:dev
   ```

## 项目结构

```
knowflow/
├── backend/           # 后端代码
│   ├── app.py         # 主应用文件
│   ├── requirements.txt  # 依赖文件
│   ├── uploads/       # 上传文件存储目录
│   └── db.json        # 数据存储文件
├── frontend/          # 前端代码
│   ├── src/           # 源代码
│   │   ├── components/  # React 组件
│   │   ├── store/      # Redux 状态管理
│   │   └── types/      # TypeScript 类型定义
│   ├── electron/      # Electron 相关代码
│   ├── package.json   # 前端依赖
│   └── vite.config.ts  # Vite 配置
└── README.md          # 项目说明文档
```

## API 文档

### 后端 API 接口

#### 知识项管理
- `GET /api/knowledge` - 获取所有知识项
- `POST /api/knowledge` - 添加新的知识项
- `POST /api/upload` - 上传文件并创建知识项

#### 分类和关键词管理
- `GET /api/categories` - 获取所有分类
- `GET /api/keys` - 获取所有关键词定义

#### AI 检索
- `POST /api/ai/search` - 基于 AI 的语义检索

#### 健康检查
- `GET /api/health` - 检查服务状态

## 部署说明

### 构建前端
```bash
cd frontend
npm run build
```

### 构建 Electron 应用
```bash
npm run electron:build
```
构建产物将生成在 `dist/electron` 目录

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目链接：[https://github.com/yourusername/knowflow](https://github.com/yourusername/knowflow)
- 问题反馈：[Issues](https://github.com/yourusername/knowflow/issues)

---

**KnowFlow - 让知识流动起来** 🚀