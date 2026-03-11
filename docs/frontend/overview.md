# 前端概述

## 技术栈

- **框架**: React 19.2.0
- **构建工具**: Vite 7.3.1
- **UI 组件库**: Ant Design 6.3.1
- **状态管理**: Redux Toolkit 2.11.2 + React Redux 9.2.0
- **样式方案**: Styled Components 6.3.11
- **测试框架**: Vitest 4.0.18
- **类型检查**: TypeScript 5.9.3
- **桌面应用**: Electron 40.7.0

## 目录结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # 主布局组件
│   │   ├── LayoutParts/            # Layout 子组件
│   │   │   ├── index.ts            # 子组件导出
│   │   │   ├── layout-styles.ts    # 样式组件定义
│   │   │   ├── styles/             # 样式子目录
│   │   │   ├── SearchSection.tsx   # 搜索区域组件
│   │   │   ├── FileCard.tsx        # 文件卡片组件
│   │   │   ├── DetailDrawer.tsx    # 详情抽屉组件
│   │   │   └── UploadSection.tsx   # 上传区域组件
│   │   ├── AIAssistant.tsx         # AI 助手组件
│   │   ├── KeyManager.tsx          # Key 管理组件
│   │   ├── DynamicKeyForm.tsx      # 动态 Key 表单组件
│   │   └── MediaPreview.tsx        # 媒体预览组件
│   ├── store/
│   │   ├── index.ts                # Store 配置
│   │   ├── knowledgeSlice.ts       # 知识项状态
│   │   └── keySlice.ts             # Key 定义状态
│   ├── hooks/
│   │   └── useKnowledge.ts         # 自定义 Hooks
│   ├── services/
│   │   └── api.ts                  # API 服务层
│   ├── plugins/
│   │   ├── index.tsx               # 插件入口
│   │   ├── loader.tsx              # 插件加载器
│   │   └── components/
│   │       └── StarRating.tsx      # 星级评分插件
│   ├── theme/
│   │   └── index.ts                # 主题配置
│   ├── types/
│   │   ├── index.ts                # 类型定义
│   │   └── electron.d.ts           # Electron 类型定义
│   ├── utils/
│   │   └── helpers.tsx             # 工具函数
│   ├── assets/
│   │   └── react.svg               # 静态资源
│   ├── App.tsx                     # 根组件
│   ├── App.css                     # 全局样式
│   ├── main.tsx                    # 应用入口
│   └── index.css                   # 基础样式
├── electron/
│   └── main.cjs                    # Electron 主进程
├── tests/
│   ├── setup.ts                    # 测试配置
│   ├── App.test.tsx                # 组件测试
│   └── plugins/                    # 插件测试
├── index.html                      # HTML 模板
├── package.json                    # 项目配置
├── vite.config.ts                  # Vite 配置
├── vitest.config.ts                # Vitest 配置
└── eslint.config.js                # ESLint 配置
```

## 核心功能

1. **知识项管理**
   - 文件上传（支持拖拽）
   - 知识项列表展示
   - 知识项详情查看
   - 知识项编辑和删除

2. **Key 系统**
   - Key 分类管理
   - Key 定义管理
   - 动态 Key 表单生成
   - Key 值编辑

3. **搜索与筛选**
   - 支持关键词搜索
   - 按点击次数/星级排序
   - AI 语义检索

4. **AI 助手**
   - 语义检索
   - 自动打标签（预留功能）

5. **文件预览**
   - 图片预览
   - 视频预览

6. **Electron 集成**
   - 打开文件所在文件夹
   - 桌面应用打包

7. **插件系统**
   - 动态加载插件组件
   - 插件组件注册机制
   - 内置星级评分插件

## 设计系统

### 颜色规范

| 变量名 | 颜色值 | 说明 |
|--------|--------|------|
| primary | #6366F1 | 主色调（靛蓝色） |
| primaryHover | #4F46E5 | 主色调悬停 |
| primaryLight | rgba(99, 102, 241, 0.1) | 主色调 10% 透明度 |
| background | #F8FAFC | 页面背景 |
| sidebarBg | #FFFFFF | 侧边栏背景 |
| text | #1E293B | 主文本色 |
| textSecondary | #64748B | 次要文本色 |
| border | #E2E8F0 | 边框色 |
| white | #FFFFFF | 白色 |
| danger | #EF4444 | 危险色 |
| success | #10B981 | 成功色 |
| warning | #F59E0B | 警告色 |

### 间距规范

| 变量名 | 值 |
|--------|-----|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| xxl | 48px |
| xxxl | 64px |

### 圆角规范

| 变量名 | 值 |
|--------|-----|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 20px |
| xxl | 24px |
| full | 9999px |

### 阴影规范

| 变量名 | 说明 |
|--------|------|
| sm | 小阴影 |
| md | 中等阴影 |
| lg | 大阴影 |
| xl | 超大阴影 |
| card | 卡片阴影 |
| cardHover | 卡片悬停阴影 |
| button | 按钮阴影 |
| input | 输入框聚焦阴影 |

## 依赖说明

### 生产依赖

- `react` & `react-dom`: React 框架
- `@reduxjs/toolkit`: Redux 工具包
- `react-redux`: React Redux 绑定
- `antd`: Ant Design UI 组件库
- `styled-components`: CSS-in-JS 样式方案

### 开发依赖

- `typescript`: TypeScript 类型检查
- `vite`: 构建工具
- `@vitejs/plugin-react`: Vite React 插件
- `vitest`: 测试框架
- `@testing-library/react`: React 测试工具
- `@testing-library/jest-dom`: Jest DOM 匹配器
- `@testing-library/user-event`: 用户事件模拟
- `eslint`: 代码 linting
- `electron`: Electron 桌面应用框架
- `electron-builder`: Electron 打包工具

## API 通信

### 基础配置

- API 基础路径: `/api/v1`
- 通信方式: `fetch` API

### 主要 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/item` | GET | 获取知识项列表 |
| `/api/v1/item` | POST | 创建知识项 |
| `/api/v1/item/:id` | PUT | 更新知识项 |
| `/api/v1/item/:id` | DELETE | 删除知识项 |
| `/api/v1/upload` | POST | 上传文件 |
| `/api/v1/categories` | GET | 获取分类列表 |
| `/api/v1/keys` | GET | 获取 Key 定义列表 |
| `/api/v1/plugins/manifests` | GET | 获取插件清单 |
