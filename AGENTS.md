# KnowFlow — Notes for Coding Agents

本文件面向在 KnowFlow 仓库中工作的 AI Coding Agent。用户文档见 [README.md](README.md)，设计与开发文档见 [docs/](docs/)。

## 1. Read First (必读指引)

1. 阅读 [规范文档索引](docs/rules/index.md) 以及 [docs/architecture.md](docs/architecture.md)、[docs/key-system-design.md](docs/key-system-design.md)、[docs/plugin-system-design.md](docs/plugin-system-design.md)。
2. KnowFlow 核心为**知识项管理 + 动态 Key-Value 系统 + 插件扩展 + 语义检索**。
3. 动态属性系统支持多种数据类型与分类层级，涉及属性元数据变更需验证前后端表单联动。

## 2. Repository Rules & Constraints (核心契约与安全规则)

- **服务组件**：FastAPI 后端 + MongoDB 数据持久化 + React 19 前端（兼顾 Electron 桌面端构建）。
- **统一脚本**：容器模式与本地模式均通过 `scripts/start.sh` / `scripts/stop.sh` 管理。
- **密钥安全**：绝不提交 `.env`、MongoDB 连接串真实密码、AI 平台 API Key（如豆包/OpenAI Key）或用户上传的知识项文件。
- **插件协议**：插件动态加载必须保证沙箱隔离与错误容灾，避免单个插件异常导致主服务崩溃。

## 3. Essential Commands (核心研发命令)

```bash
# 后端测试与检查
cd backend
python -m pytest test/                 # 后端单元测试
python -m ruff check .                 # 代码检查

# 前端 (React 19 + AntD)
cd ../frontend
npm test                               # 前端组件测试
npm run lint                           # ESLint 检查
npm run build                          # 前端生产构建

# 服务启动
cd ..
./scripts/start.sh dev full            # Docker 模式启动前后端与 Mongo
./scripts/start.sh local full          # 本地源码启动
```

## 4. Verification Checklist (提交前自检)

- [ ] 后端 pytest 测试全绿
- [ ] 前端 lint 与 build 通过无报错
- [ ] 动态 Key-Value 增删改查逻辑完整测试
- [ ] 敏感配置保持占位符，未泄漏真实密钥
