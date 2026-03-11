# 部署文档

## 环境要求

- Node.js 18+
- npm 或 yarn 或 pnpm

## 安装依赖

```bash
cd frontend
npm install
```

## 开发

### 启动开发服务器

```bash
npm run dev
```

服务将在 `http://localhost:5173` 启动。

### 启动 Electron 开发模式

```bash
npm run electron:dev
```

## 构建

### Web 构建

```bash
npm run build
```

构建产物输出到 `frontend/dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

### Electron 打包

```bash
npm run electron:build
```

打包产物输出到 `frontend/dist/electron/` 目录。

**打包配置** (package.json):

| 平台 | 输出格式 |
|------|----------|
| Windows | NSIS, Portable |
| macOS | DMG |
| Linux | DEB, RPM, AppImage |

## 测试

### 运行测试

```bash
npm run test
```

### 测试文件

测试文件位于 `frontend/tests/` 目录：

- `setup.ts`: 测试配置
- `App.test.tsx`: 组件测试
- `plugins/loader.test.tsx`: 插件加载器测试
- `plugins/StarRating.test.tsx`: 星级评分插件测试

### 测试框架

- **Vitest**: 测试运行器
- **@testing-library/react**: React 组件测试工具
- **@testing-library/jest-dom**: DOM 匹配器
- **@testing-library/user-event**: 用户事件模拟
- **jsdom**: DOM 环境模拟

## Lint

### 运行 Lint

```bash
npm run lint
```

## 配置文件

### Vite 配置

**文件**: [frontend/vite.config.ts](../../frontend/vite.config.ts)

Vite 构建工具配置。

### Vitest 配置

**文件**: [frontend/vitest.config.ts](../../frontend/vitest.config.ts)

Vitest 测试框架配置。

### ESLint 配置

**文件**: [frontend/eslint.config.js](../../frontend/eslint.config.js)

代码 linting 规则配置。

### TypeScript 配置

TypeScript 配置文件：

- `tsconfig.json`: 主配置
- `tsconfig.app.json`: 应用配置
- `tsconfig.node.json`: Node.js 配置

## 开发流程

1. 确保后端服务已启动 (`http://localhost:3000`)
2. 启动前端开发服务器 (`npm run dev`)
3. 访问 `http://localhost:5173`
4. 进行开发和调试

## 注意事项

1. **后端依赖**: 前端需要后端服务运行在 `http://localhost:3000`
2. **CORS**: 后端已配置 CORS 允许跨域请求
3. **API Key**: AI 功能需要在后端配置 API Key
4. **数据备份**: 定期备份后端的数据库和上传文件
5. **Electron**: 桌面应用打包需要安装 Electron 依赖

## 故障排查

### 前端无法连接后端

- 检查后端服务是否启动
- 确认后端地址为 `http://localhost:3000`
- 检查浏览器控制台的网络错误

### 依赖安装失败

- 尝试删除 `node_modules` 和 `package-lock.json`
- 重新运行 `npm install`
- 检查 Node.js 版本是否满足要求

### 构建失败

- 运行 `npm run lint` 检查代码错误
- 确保 TypeScript 类型检查通过
- 检查依赖版本兼容性

### 测试失败

- 检查测试环境配置 (`tests/setup.ts`)
- 确保所有依赖正确安装
- 检查 jsdom 环境是否正确配置

## 项目脚本

| 脚本 | 命令 | 说明 |
|------|------|------|
| dev | `vite` | 启动开发服务器 |
| build | `tsc -b && vite build` | 构建生产版本 |
| lint | `eslint .` | 运行代码检查 |
| preview | `vite preview` | 预览构建结果 |
| test | `vitest` | 运行测试 |
| electron:dev | `electron .` | 启动 Electron 开发模式 |
| electron:build | `electron-builder` | 打包 Electron 应用 |
