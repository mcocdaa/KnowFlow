---
title: 前端架构
version: 1.0
keywords: [架构, 路由, 数据流, Redux, 主题, 插件, 测试]
description: KnowFlow 前端多页应用架构说明
---

# 前端架构

KnowFlow 前端是一个多页单页应用（SPA）：`react-router` 负责页面路由，Redux Toolkit 负责跨页共享的服务端状态，钩子负责把“URL 参数 → API → Store”串联起来，Ant Design 6 提供 UI 与主题令牌。

## 技术栈

| 领域 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 框架 | React | 19.2 | 严格模式渲染 |
| 构建 | Vite | 7.3 | 开发端口 `5177`，构建产物 `dist/` |
| 语言 | TypeScript | 5.9 | 全量类型约束 |
| UI 组件库 | Ant Design | 6.3 | 主题通过 `ConfigProvider` 注入 |
| 图标 | @ant-design/icons | 6.3 | 线性图标，配套内联 SVG 品牌标志 |
| 路由 | react-router | 7.18 | `BrowserRouter` + 嵌套路由 |
| 状态管理 | Redux Toolkit | 2.11 | 配合 react-redux 9.2 |
| 测试 | Vitest | 4.0 | jsdom 环境，20 个测试文件 / 114 个用例 |
| 桌面端 | Electron | 40.7 | 主进程 `electron/main.cjs` |

样式方案为 Ant Design 的 CSS-in-JS 令牌，配合 `styles/index.css` 全局样式。

## 目录结构

```
frontend/
├── src/
│   ├── App.tsx                     # 路由表 + ErrorBoundary
│   ├── main.tsx                    # 应用装配入口
│   ├── layouts/
│   │   └── AppLayout.tsx           # Header + Sider + Content(Outlet)
│   ├── components/
│   │   ├── layout/SideNav.tsx      # 左侧导航菜单
│   │   ├── common/                 # BrandLogo/ErrorBoundary/StatePlaceholder/
│   │   │                           # DynamicKeyForm/FileIcon/JsonBlock
│   │   ├── library/                # SearchToolbar/ItemTable/ItemDetailDrawer/
│   │   │                           # ItemFormModal/UploadModal/MediaPreviewModal
│   │   ├── categories/CategoryFormModal.tsx
│   │   └── keys/KeyFormModal.tsx
│   ├── pages/                      # LibraryPage/CategoriesPage/KeysPage/
│   │                               # PluginsPage/AIPage/NotFoundPage
│   ├── hooks/                      # useLibrary/useCatalog/useCategories/
│   │                               # useKeys/usePlugins/useAI
│   ├── services/api.ts             # fetch 封装、XHR 上传、线上字段映射
│   ├── store/                      # index/librarySlice/catalogSlice/pluginsSlice
│   ├── plugins/                    # index.tsx/loader.tsx/components/StarRating.tsx
│   ├── theme/                      # index.ts/tokens.ts/antd.ts
│   ├── utils/                      # categoryTree/dynamicForm/format/helpers/electron
│   ├── types/                      # index.ts/electron.d.ts
│   └── styles/index.css
├── tests/                          # setup + utils + 各层测试（114 用例）
├── electron/                       # main.cjs/preload.cjs
├── public/favicon.svg
├── index.html
├── vite.config.ts / vitest.config.ts / eslint.config.js
└── Dockerfile / nginx.conf
```

## 应用装配

[frontend/src/main.tsx](../../frontend/src/main.tsx) 的 Provider 顺序固定为：

```
StrictMode
└── ConfigProvider(theme=antdTheme, locale=zhCN)
    └── AntdApp（message/modal 上下文）
        └── Provider(store)
            └── BrowserRouter
                └── App
```

[frontend/src/App.tsx](../../frontend/src/App.tsx) 在模块加载时调用 `initializePlugins()` 注册内置插件组件，随后渲染 `ErrorBoundary` 包裹的路由树。所有业务页面都作为 `AppLayout` 的子路由通过 `<Outlet />` 渲染。

## 路由表

| 路径 | 页面组件 | 说明 |
|------|----------|------|
| `/` | `Navigate to="/library"` | 根路径重定向到知识库 |
| `/library` | `LibraryPage` | 知识库：搜索、筛选、分页、上传、新建、详情、编辑 |
| `/categories` | `CategoriesPage` | 分类管理：树形父子关系维护 |
| `/keys` | `KeysPage` | Key 管理：定义、类型、可见性、来源插件 |
| `/plugins` | `PluginsPage` | 插件清单：后端 manifest 与前端组件注册状态 |
| `/ai` | `AIPage` | AI 助手：语义检索、自动打标签 |
| `*` | `NotFoundPage` | 404 结果页，提供返回知识库入口 |

布局壳 [frontend/src/layouts/AppLayout.tsx](../../frontend/src/layouts/AppLayout.tsx) 由 `Header`（品牌 Logo + 标题）、可折叠 `Sider`（[frontend/src/components/layout/SideNav.tsx](../../frontend/src/components/layout/SideNav.tsx)）和 `Content` 组成。导航项用 `NavLink` 渲染、以 `pathname` 作为 `selectedKeys`，因此当前页高亮完全由 URL 决定。

## 数据流：URL 即状态

知识库的检索条件不保存在组件里，而是写入地址栏查询参数，由 `useLibrary` 双向同步：

1. 用户在 `SearchToolbar` 输入 → `updateParams()` 合并补丁并用 `setSearchParams` 写回 URL（默认值会被删除，保持链接干净）。
2. `useSearchParams` 变化 → `useLibrary` 用 `useMemo` 解析出 `params`（`q`、`key`、`key_value`、`sort`、`page`、`page_size`）。
3. `params` 变化触发 effect → `dispatch(setQuery/setLoading)`，调用 `api.searchItems(params)`。
4. 请求成功后 `dispatch(setResult)`；失败 `dispatch(setError)`。使用自增 `requestIdRef` 丢弃乱序响应。

整体链路为 **hooks → api → slices**：

| Hook | 消费/更新 | 依赖 API |
|------|-----------|----------|
| `useLibrary` | `librarySlice`（items/total/page/pageSize/loading/error） | `searchItems`/`deleteItem` |
| `useCatalog` | `catalogSlice`（只读加载 keys + categories） | `fetchKeys`/`fetchCategories` |
| `useCategories` | `catalogSlice` + 本地 submitting | 分类 CRUD |
| `useKeys` | `catalogSlice` + 本地 submitting | Key CRUD |
| `usePlugins` | `pluginsSlice` | `fetchPluginManifests` |
| `useAI` | 组件本地 state（不落 store） | `aiSearch`/`autoTag` |

`catalogSlice` 被 `useCatalog`、`useCategories`、`useKeys` 共用，保证 Key/分类数据在页面间一致；`AIPage` 的检索结果是一次性交互产物，因此保留在 `useAI` 的本地 state 中而不进入全局 store。

Redux store 由三个 reducer 组成：`library`、`catalog`、`plugins`（见 [frontend/src/store/index.ts](../../frontend/src/store/index.ts)）。写操作统一采用“先调 API、成功后 `upsertItem`/`reload`”的乐观刷新策略。

## API 服务层

[frontend/src/services/api.ts](../../frontend/src/services/api.ts) 提供全部网络访问：

- **Base URL**：`window.knowflow?.apiBase`（Electron）优先，其次 `import.meta.env.VITE_API_BASE_URL`，都为空时回落到相对路径 `/api/v1`。
- **统一信封**：后端返回 `{ code, message, data }`；`request()` 在 HTTP 非 2xx 或 `code !== 0` 时抛出 `Error(message)`。
- **线上/内部字段映射**：`transformItemData` 把线上的 `attributes`、`key_info`、`created_at` 转成内部的 `keyValues`、`keyInfo`、`createdAt`/`updatedAt`；写请求再映射回 `attributes`。
- **上传进度**：`uploadFile` 使用 `XMLHttpRequest`，通过 `xhr.upload.onprogress` 回调百分比，供 `UploadModal` 的进度条展示。
- **插件评分**：`updatePluginRating` 调用 `PUT /plugins/rating/items/{id}/rating`。

## 三态 UX 模式

每个列表页都遵循同一套渲染分支，由 `StatePlaceholder` 统一外观：

```
error   ? <StatePlaceholder variant="error" onRetry=... />
: loading && 无数据 ? <StatePlaceholder variant="loading" />
: 无数据           ? <StatePlaceholder variant="empty" ... />
: <Table ... />
```

- `loading`：骨架屏（`Skeleton`）。
- `empty`：`Empty` 占位，可附带操作引导。
- `error`：`Result` + “重试”按钮，回调各 Hook 的 `reload`/`refresh`。

有数据时的 `loading` 交给 `Table` 自身的 `loading` 属性，避免刷新时整页闪烁。

## 主题与令牌系统

主题集中在 [frontend/src/theme/](../../frontend/src/theme/)：

- [tokens.ts](../../frontend/src/theme/tokens.ts) 定义 `FLOW_COLORS`、`FLOW_SPACING`、`FLOW_BORDER_RADIUS`、`FLOW_FONT_SIZES`、`FLOW_FONT_WEIGHTS`、`FLOW_SHADOWS`、`FLOW_TRANSITIONS`、`FLOW_FONT_FAMILY`，并导出 `COLORS`、`SPACING` 等短别名。主色为 `#2563EB`，品牌渐变为蓝紫 `#2563EB → #7C3AED`。
- [antd.ts](../../frontend/src/theme/antd.ts) 将令牌映射为 Ant Design `ThemeConfig`，同时覆盖 Button/Input/Select/Table/Menu/Layout 等组件的圆角、间距与阴影。
- [index.ts](../../frontend/src/theme/index.ts) 聚合导出，供 `main.tsx` 的 `ConfigProvider` 与测试注入。
- 组件内需要动态令牌时使用 `theme.useToken()`，禁止硬编码颜色体系统一值。

## 插件系统

插件系统由“后端清单 + 前端组件注册表”两部分组成：

- **注册表** [frontend/src/plugins/loader.tsx](../../frontend/src/plugins/loader.tsx)：`registerPluginComponent(name, component)`、`getPluginComponent(name)`、`hasPluginComponent(name)` 维护 `loadedPlugins` 映射。
- **内置注册** [frontend/src/plugins/index.tsx](../../frontend/src/plugins/index.tsx)：`initializePlugins()` 注册 `rating` → `StarRating`。新增插件只需在此追加注册并在 `plugins/components/` 添加组件。
- **渲染器** `PluginRenderer`：按 `pluginName` 查表，命中则渲染组件并通过 `Suspense` 提供加载态；未命中则回退显示原始值文本，保证插件缺失时页面不崩。
- **评分插件** [frontend/src/plugins/components/StarRating.tsx](../../frontend/src/plugins/components/StarRating.tsx)：点击即通过 `api.updatePluginRating` 持久化，失败时回滚本地状态并提示。
- **挂载点**：`ItemDetailDrawer` 在字段的 `definition.plugin_name` 命中注册表时改用 `PluginRenderer` 渲染，其余字段按 `value_type` 走布尔/数字/JSON/文本分支。
- **管理页**：`PluginsPage` 拉取 `/plugins/manifests`，用 `hasPluginComponent` 标注每个插件是“已注册 UI 组件”还是“仅后端”。

## 图标策略与 no-emoji 测试

前端只允许两类图标来源：

1. `@ant-design/icons` 的线性 SVG 图标；
2. 手写内联 SVG（如 `BrandLogo`）。

禁止在源码中使用 emoji 或 Unicode 象形字符。[frontend/tests/no-emoji-icons.test.ts](../../frontend/tests/no-emoji-icons.test.ts) 会递归扫描 `src/` 下的 `.ts`/`.tsx`，用 Unicode 区间正则匹配并断言无命中，从而在 CI 中强制该策略。

## 测试体系

- **配置** [frontend/vitest.config.ts](../../frontend/vitest.config.ts)：`jsdom` 环境、`globals: true`、`setupFiles: ./tests/setup.ts`、`testTimeout: 15000`（antd 渲染较重）。
- **环境准备** [frontend/tests/setup.ts](../../frontend/tests/setup.ts)：引入 `@testing-library/jest-dom`，补齐 jsdom 缺失的 `ResizeObserver`、`matchMedia`、`requestAnimationFrame`。
- **渲染工具** [frontend/tests/utils/renderWithProviders.tsx](../../frontend/tests/utils/renderWithProviders.tsx)：`renderWithProviders` 复刻生产 Provider 链（`ConfigProvider` + `AntdApp` + Redux `Provider` + `MemoryRouter`），并把主题 `token.motion` 设为 `false` 关闭动画以稳定断言；`createTestStore` 支持注入 `preloadedState`。
- **Mock**：`tests/utils/mockApi.ts` 提供 API 替身，`mockXhr.ts` 覆盖上传进度场景，`deferred.ts` 控制异步时序（含乱序响应测试）。
- **覆盖**：`tests/` 按 `pages/`、`components/`、`hooks/`、`store/`、`services/`、`plugins/` 分层，另有 `App.test.tsx`、`routing.test.tsx` 与 `no-emoji-icons.test.ts`。当前共 **20 个测试文件、114 个用例**。

运行方式：

```bash
cd frontend
npm run lint          # ESLint
npx vitest run        # 单次运行全部测试
npm run build         # tsc -b + vite build
```
