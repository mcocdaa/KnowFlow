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
│   ├── electron/
│   │   └── preload.ts              # Electron 预加载脚本
│   ├── types/
│   │   └── electron.d.ts           # Electron 类型定义
│   ├── assets/
│   │   └── react.svg               # 静态资源
│   ├── App.tsx                     # 根组件
│   ├── App.css                     # 全局样式
│   ├── main.tsx                    # 应用入口
│   └── index.css                   # 基础样式
├── electron/
│   └── main.cjs                    # Electron 主进程
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
   - 支持 `key:pattern` 语法搜索
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

## 设计系统

### 颜色规范

| 变量名 | 颜色值 | 说明 |
|--------|--------|------|
| primary | #3B82F6 | 主色调（克莱因蓝） |
| primaryLight | rgba(59, 130, 246, 0.1) | 主色调 10% 透明度 |
| background | #F8FAFC | 页面背景 |
| sidebarBg | #F1F5F9 | 侧边栏背景 |
| text | #1E293B | 主文本色 |
| textSecondary | #64748B | 次要文本色 |
| border | #E2E8F0 | 边框色 |
| white | #FFFFFF | 白色 |
| danger | #EF4444 | 危险色 |

### 间距规范

| 变量名 | 值 |
|--------|-----|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |

### 圆角规范

| 变量名 | 值 |
|--------|-----|
| sm | 4px |
| md | 8px |
| lg | 12px |

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
- `eslint`: 代码 linting
- `electron`: Electron 桌面应用框架
- `electron-builder`: Electron 打包工具
