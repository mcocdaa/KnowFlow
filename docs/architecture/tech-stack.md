# 技术栈

KnowFlow 采用前后端分离架构，以下是项目使用的核心技术。

---

## 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Vite | 7.3.1 | 构建工具 |
| Ant Design | 6.3.1 | UI 组件库 |
| Redux Toolkit | 2.11.2 | 状态管理 |
| Styled Components | 6.3.11 | CSS-in-JS 样式 |
| Vitest | 4.0.18 | 测试框架 |
| Electron | 40.7.0 | 桌面应用 |

---

## 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.8+ | 运行环境 |
| FastAPI | - | Web 框架 |
| Uvicorn | - | ASGI 服务器 |
| MongoDB | 4.4+ | 数据库 |
| motor | - | MongoDB 异步驱动 |
| httpx | - | HTTP 客户端（AI API） |
| PyYAML | - | YAML 配置解析 |

---

## 技术选型理由

### 前端

- **React 19**: 最新版本，支持并发渲染和自动批处理
- **Vite**: 极速的开发服务器和构建工具
- **Ant Design 6**: 企业级 UI 组件，开箱即用
- **Redux Toolkit**: 简化的 Redux 开发体验

### 后端

- **FastAPI**: 高性能异步框架，自动生成 API 文档
- **MongoDB**: 文档型数据库，适合动态 Key-Value 结构
- **motor**: 异步驱动，与 FastAPI 完美配合

---

## 相关文档

- [模块划分](./modules.md)
- [数据存储](./data-storage.md)
- [关键流程](./flows.md)
