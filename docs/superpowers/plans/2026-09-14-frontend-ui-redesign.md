# 前端 UI 整理与后端逻辑对齐实现计划

> **For agentic workers:** 由主 agent 串行执行；每个 Task 先写失败测试，再实现，再全量回归后提交。禁止并行派发实现 subagent（git 索引会踩踏）。

**Goal:** 按 2026-09-14 spec 完成前端多页面重构 + 后端逻辑全面对齐 + SVG 图标统一，`lint/test/build` 与 CI 全绿。

**Architecture:** 保留 React 19 + antd 6 + Redux Toolkit；新增 `react-router@7` declarative 模式；新增/替换 API 层与 slices；页面逐一切换完成后再删除旧组件；styled-components 在最后一个组件替换完成后移除依赖。

**Tech Stack:** React 19.2、antd 6.3+（后续步骤可保持 ^6.3.1）、@ant-design/icons 6.x、react-router 7.18.x、Redux Toolkit 2、vitest 4 + Testing Library、Vite 7、Node 20（CI/镜像）。

**Spec:** `docs/superpowers/specs/2026-09-14-frontend-ui-redesign-design.md`

---

## 通用约定（所有任务适用）

- 工作目录：`frontend/`
- 单测：`npx vitest run`（或单文件 `npx vitest run tests/xxx.test.tsx`）；CI 同命令
- lint：`npm run lint`；构建/类型：`npm run build`（= `tsc -b && vite build`）
- 提交前必须：`npx vitest run && npm run lint && npm run build` 全绿；提交信息用 `feat(frontend):` / `refactor(frontend):` / `test(frontend):` / `docs(frontend):` / `chore(frontend):`
- 测试渲染统一工具：`tests/utils/renderWithProviders.tsx`（Task 1 创建）：`MemoryRouter` + Redux `Provider`（可传 preloadedState）+ `ConfigProvider` + `AntdApp`
- API mock 统一 `vi.mock('../src/services/api')`；XHR 用自建 MockXMLHttpRequest 类，不新增依赖
- 后端不动；最终回归包含 `docker compose` 起栈 + `backend/.venv/bin/python backend/test/e2e_api_check.py`（36/36）
- 每个 Task 完成后更新本文件任务标题为 `✅`

---

### Task 1: 依赖与路由骨架 ✅（占位页）

**Files:**
- Modify: `frontend/package.json`、`frontend/package-lock.json`
- Create: `frontend/src/layouts/AppLayout.tsx`、`frontend/src/components/layout/SideNav.tsx`
- Create: `frontend/src/pages/{LibraryPage,CategoriesPage,KeysPage,PluginsPage,AIPage,NotFoundPage}.tsx`（占位版）
- Modify: `frontend/src/App.tsx`、`frontend/src/main.tsx`
- Create: `frontend/tests/utils/renderWithProviders.tsx`、`frontend/tests/routing.test.tsx`
- Modify: `frontend/tests/App.test.tsx`

**Step 1: 安装依赖**
Run: `npm install react-router@^7.18.3 @ant-design/icons@^6.3.4`（不要装 `react-router-dom`：v7 起不需要，v8 已删除）
预期：二者进入 `dependencies`，lockfile 更新。

**Step 2: 写失败测试**

`tests/routing.test.tsx`（要点）：
- 在 `MemoryRouter initialEntries={['/']}` 下渲染 `<App/>` → 最终显示"知识库"页标题（`/` 重定向 `/library`）。
- `initialEntries={['/categories']}` → 显示"分类管理"标题；`/keys`、`/plugins`、`/ai` 同理。
- `initialEntries={['/nope']}` → 显示 404 文案（如"页面不存在"）。
- 侧栏导航：`screen.getByRole('link', { name: /知识库/ })` 等 5 项存在；nav 必须用 `NavLink`（`Link` 不产生 `aria-current`），断言当前项 `aria-current="page"`。
- 渲染辅助 `renderWithProviders(children, { route, preloadedState })`：接受 ReactNode（**数组/Fragment**，便于在 Router 内并排渲染 `LocationProbe`），包 `MemoryRouter` + `Provider`（store 先含现有 `knowledge/key` reducer，Task 4 起再加三个新 slice）+ `ConfigProvider` + `AntdApp`。
- `tests/setup.ts` 补 `window.matchMedia` mock（jsdom 无此 API，antd Row/Col/Grid 会崩），顺手补 `requestAnimationFrame` shim。

`tests/App.test.tsx`（改写）：App 不再自带 Router（`BrowserRouter` 移到 `main.tsx`），测试统一走 `renderWithProviders`；断言顶栏产品名与侧栏导航存在。api mock 需包含 `searchItems`（Task 5a 起 `/library` 首屏会调用，提前加上避免返工）。

**Step 3: 确认失败**
Run: `npx vitest run tests/routing.test.tsx`
预期：FAIL（无 react-router / 无 AppLayout / `/` 未重定向）。

**Step 4: 实现**
- `main.tsx`：`<BrowserRouter><App/></BrowserRouter>`。
- `App.tsx`：`ConfigProvider(antdTheme, zhCN)` → `AntdApp` → `Provider store` → `ErrorBoundary` → `Routes`（`/`→`Navigate /library`，各页，`*`→NotFound）。
- `AppLayout.tsx`：antd `Layout`（Header + Sider + Content），`<Outlet/>`；Header 左侧 `<BrandLogo/>`（本 Task 用文字占位，Task 2 换 SVG）+ 产品名；Sider 用 `SideNav`。
- `SideNav.tsx`：`Menu` `items` 为 5 个导航（icon 先用 antd SVG 图标），`selectedKeys=[location.pathname]`，label 用 `<Link/>`；Sider 可折叠（`breakpoint="lg"`）。
- 占位页：各自 `<Typography.Title level={3}>知识库</Typography.Title>` + 占位说明（Task 5–8 填充）。
- 删除 `App.tsx` 对 `MainPage` 的引用（`MainPage.tsx` 暂留，Task 5 删除；未被引用不影响构建）。

**Step 5: 全量回归 + 提交**
Run: `npx vitest run && npm run lint && npm run build`
```bash
git add frontend/package.json frontend/package-lock.json frontend/src frontend/tests
git commit -m "feat(frontend): add react-router shell with sidebar navigation"
```

---

### Task 2: 图标与通用基元 ✅

**Files:**
- Create: `frontend/src/components/common/BrandLogo.tsx`、`FileIcon.tsx`、`StatePlaceholder.tsx`
- Modify: `frontend/src/layouts/AppLayout.tsx`（接入 BrandLogo）
- Create: `frontend/tests/components/primitives.test.tsx`

**Step 1: 写失败测试**
- `BrandLogo`：渲染后容器内存在 `<svg>`（内联自绘 SVG）。
- `FileIcon`：`file_type="image/png"` → 图标 `aria-label="file-image"`；`"application/pdf"`→`file-pdf`；`"video/mp4"`→`video-camera`；`"text/plain"`→`file-text`；未知/空→`file`。
- `StatePlaceholder`：`variant="empty"` 显示 `Empty` + 自定义文案；`variant="error"` 显示重试按钮并触发 `onRetry`；`variant="loading"` 渲染 `Skeleton`。

**Step 2: 确认失败** → **Step 3: 实现**
- `BrandLogo`：24~28px 内联 SVG（知识流向/层叠书页意象 + 蓝紫渐变 `#2563EB→#7C3AED`），`aria-label="KnowFlow"`。
- `FileIcon`：`file_type`（MIME，来自后端 `file_type` key）到 `@ant-design/icons` 的映射函数 + `data-testid`；映射表与 `utils/file.tsx` 旧逻辑合并后删除旧文件（旧文件仅被旧组件引用，Task 5 统一删）。
- `StatePlaceholder`：封装 antd `Empty/Result/Skeleton` 三态，供各页面复用（禁止每页各写一套）。

**Step 4: 全量回归 + 提交**（命令同上）
```bash
git commit -m "feat(frontend): add SVG brand logo, file icons and state placeholders"
```

---

### Task 3: API 层与类型扩展 ✅

**Files:**
- Modify: `frontend/src/types/index.ts`、`frontend/src/services/api.ts`
- Create: `frontend/tests/utils/mockXhr.ts`
- Create: `frontend/tests/services/api.test.ts`

**Step 1: 写失败测试**
- `searchItems({q,key,keyValue,sort,page,pageSize})` → `fetch` 收到 `/api/v1/item/search?q=...&key=...&key_value=...&sort=rating&page=2&page_size=50`；空参数不出现；返回 `{items(转换后),total,page,pageSize,totalPages}`。
- envelope：HTTP 200 但 `code!==0` 也抛错；HTTP 400 时抛出 `message`。
- `transformItemData`：保留 `keyInfo`（`key_info`）与 `updatedAt`（后端响应不返回 tags，见 spec 已知限制）。
- 分类：`createCategory/updateCategory(name)/deleteCategory(name)` 方法与 URL（name 需 encodeURIComponent）。
- Key：`createKey/updateKey/deleteKey` 保持，新增字段透传。
- `fetchPluginManifests()` → `/plugins/manifests`。
- `uploadFile(file, attributes, onProgress)`：MockXMLHttpRequest 断言 `POST /upload`、`FormData` 含 `file` 与 `data` JSON、`upload.onprogress` 触发 `onProgress(percent)`、成功 resolve 转换后的 item、HTTP 413 时 reject 且 message 为后端文案。

**Step 2: 确认失败** → **Step 3: 实现**
- `types`：`KnowledgeItem{id,name,keyValues,keyInfo?,tags,createdAt?,updatedAt?}`、`SearchParams`、`PagedItems`、`PluginManifest`、`CategoryDefinition` 增 `created_at?/updated_at?/id?`。
- `request()`：`!response.ok` 抛 envelope message；`body.code!==0` 抛错；删除 JSON 解析的静默 catch 以外逻辑保持。
- 新增上述函数；`uploadFile` 改 XHR（保留旧 fetch 版本给未迁移页面？不需要——`uploadFile` 签名向后兼容：第三参可选 `onProgress`，旧调用不受影响，直接改实现）。
- `fetchItems` 暂留（Task 5 删除）。

**Step 4: 全量回归 + 提交**
```bash
git commit -m "feat(frontend): extend api client for search, catalog, plugins and upload progress"
```

---

### Task 4: Store 重构（library / catalog / plugins） ✅

**Files:**
- Create: `frontend/src/store/librarySlice.ts`、`catalogSlice.ts`、`pluginsSlice.ts`
- Modify: `frontend/src/store/index.ts`
- Create: `frontend/tests/store/librarySlice.test.ts`、`catalogSlice.test.ts`、`pluginsSlice.test.ts`

**Step 1: 写失败测试**（reducer 级）
- `librarySlice`：初值 `{items:[],total:0,page:1,pageSize:20,query:{q:'',key:'',keyValue:'',sort:'recent'},loading:false,error:null,selectedId:null}`；`setResult` 写入 items/total；`setQuery` 合并并重置 page=1（除非显式传 page）；`removeItem` 移除并 `total-1`；`upsertItem`；`selectItem`。
- `catalogSlice`：`setKeys/setCategories/setLoading/setError`、`upsertKey/removeKey/upsertCategory/removeCategory`。
- `pluginsSlice`：`setManifests/setLoading/setError`。
- `store/index.ts`：新增三个 reducer 并导出 `RootState/AppDispatch`（旧的 `knowledge/key` reducer **继续保留**，直到其消费组件被删除）。
- `knowledgeSlice` 延至 Task 8（删除 AIAssistant 时）移除，`keySlice` 延至 Task 7（删除 KeyManager 时）移除。

**Step 2: 确认失败** → **Step 3: 实现** → **Step 4: 全量回归 + 提交**
```bash
git commit -m "refactor(frontend): add library/catalog/plugins slices"
```

---

### Task 5: 知识库页（拆分 5a/5b/5c） ✅

#### Task 5a: 列表 + 服务端搜索 + 分页 + URL 同步 ✅

**Files:**
- Create: `frontend/src/pages/LibraryPage.tsx`、`components/library/SearchToolbar.tsx`、`components/library/ItemTable.tsx`、`hooks/useLibrary.ts`
- Delete: `pages/MainPage.tsx`、`hooks/useKnowledge.ts`、`store/knowledgeSlice.ts`、`components/layout/{FileCard,SearchSection,UploadSection}.tsx`、`components/layout/layout-styles.ts`、`components/layout/styles/*`、`styles/App.css`（顺带 Task 5a 完成主题浅色化与 `index.css` 重写）
- Modify: `theme/tokens.ts`、`theme/antd.ts`、`utils/index.ts`（移除 `file`/`menu` 导出）；Delete: `utils/menu.tsx`、`utils/file.tsx`（Task 2 已替代）。`theme/index.ts` 的导出清理推迟到 Task 5b（DetailDrawer 仍引用 `COLORS/SHADOWS`）
- Create: `frontend/tests/pages/LibraryPage.test.tsx`、`tests/hooks/useLibrary.test.tsx`（如需要）

**Step 1: 写失败测试**
- 首屏：mock `api.searchItems` resolve `{items:[...2],total:42,page:1,pageSize:20,totalPages:3}` → 表格渲染两行；`searchItems` 以 `{q:'',sort:'recent',page:1,pageSize:20,key:'',keyValue:''}` 调用。
- 搜索：输入"部署"→ 400ms 防抖后 `searchItems` 收到 `q:'部署'`；URL 变为 `/library?q=部署`（MemoryRouter 下用 `useLocation` 探针组件断言）。
- 排序改 `rating` → 请求 `sort=rating`；翻页点第 2 页 → `page=2`。
- URL 直达：`initialEntries=['/library?q=abc&sort=name&page=2']` → 首屏请求即带这些参数（URL 是唯一真源）。
- 空态/错误态：reject → `StatePlaceholder variant=error` 且"重试"重新请求；items 空 → `variant=empty`。
- 删除：Popconfirm 确认 → `deleteItem(id)` → 重新请求当前页；若删除后本页为空且 `page>1` → 请求 `page-1`。
- 竞态：先发出的慢响应不得覆盖后发出的快响应（实现用请求序号或 `AbortController`；测试模拟两个 resolve 顺序相反的 promise 断言最终结果来自最后一次请求）。

**Step 2: 确认失败**
**Step 3: 实现**
- 测试注意：antd Button 双汉字会渲染为 `确 定`（`spaceChildren` 插空格），确认按钮断言用 `getByRole('button', { name: /确\s*定/ })`；`q=部署` 在 URL 中是 percent-encoded，用 `new URLSearchParams(location.search).get('q')` 断言；App/旧测试的 api mock 补 `searchItems`。
- `useLibrary`：`useSearchParams` 读取/写回（q/sort/page/page_size/key/key_value）；400ms 防抖仅作用于 q 输入；请求取消用 `AbortController` 或请求序号防竞态；`searchItems` → `librarySlice.setResult`。
- `SearchToolbar`：`Input.Search`（受控 + 防抖）、`Select` 排序（最近添加/评分/名称）、`Popover` 高级筛选（key 下拉 + key_value 输入，两者都填才拼参数，并提示后端语义）、每页条数 `Select`（10/20/50/100）、右侧"上传文件""新建记录"按钮（5c 接）。
- `ItemTable`：列 = 文件图标+名称（点击开抽屉）、标签 `Tag`、评分（PluginRenderer 或只读 Rate）、更新时间、操作（查看/编辑/删除）；`pagination` 服务端模式（`current/pageSize/total/onChange`），`loading` 用 `Table loading`；行 hover 显示操作（保留可见性）。
- 主题浅色化：`tokens.sidebarBg` → 白色、边框 `#E2E8F0`；`antd.ts` 去掉 Menu 深色覆写改浅色选中态；`styles/index.css` 重写（reset、滚动条、少量 `--ant-*` 用法），删除全部 `!important` 覆写与 App.css；`AppLayout/SideNav` 视觉收尾。
- 删除旧文件（含 `App.tsx` 里对 App.css 的 import）。

**Step 4: 全量回归 + 提交**
```bash
git commit -m "feat(frontend): rebuild library page on server-side search and pagination"
```

#### Task 5b: 详情抽屉 ✅

**Files:** Create `components/library/ItemDetailDrawer.tsx`、`components/common/JsonBlock.tsx`、`components/library/MediaPreviewModal.tsx`；Delete `components/layout/DetailDrawer.tsx`、`components/business/MediaPreview.tsx`；Create `tests/components/ItemDetailDrawer.test.tsx`

**Step 1: 写失败测试**
- 按 `key_info[key].category_name` 分组显示区块标题（用 `/categories` 的 `title`）；字段标题用 `key_info[key].title`；值按 `value_type` 渲染：boolean→`是/否` Tag（SVG 图标可选）、number→数值、array/object→`JsonBlock`、string→文本（长文本折叠）。
- `created_at/updated_at` 显示（后端不返回 tags，不展示）。
- 有 `plugin_name` 的 key 走 `PluginRenderer`（rating 显示可点击 Rate 并调用 `updatePluginRating`）。
- `file_type` 为 image/video 时出现"预览"按钮 → 打开 `MediaPreviewModal`（`src=/uploads/{basename(file_path)}`）。
- 操作：编辑/删除/打开所在文件夹回调触发；删除确认文案提示"仅删除记录，不删除已上传文件"（后端行为）。

**Step 2–3: 红 → 实现（沿用旧 DetailDrawer 的格式化逻辑，重写为受控 + token 样式，无 glass）**
**Step 4: 回归 + 提交**
```bash
git commit -m "feat(frontend): redesign item detail drawer around key_info"
```

#### Task 5c: 上传 / 新建 / 编辑（含真实进度与校验） ✅

**Files:** Create `components/library/ItemFormModal.tsx`、`components/library/UploadModal.tsx`、`components/common/DynamicKeyForm.tsx`；Delete `components/business/DynamicKeyForm.tsx`；Create `tests/components/ItemFormModal.test.tsx`、`UploadModal.test.tsx`、`DynamicKeyForm.test.tsx`

**Step 1: 写失败测试**
- `DynamicKeyForm`：`is_required` 未填 → 提交被拦截（`onSubmit` 未调用且出现校验文案）；number 控件为 `InputNumber`；boolean 为 `Switch`；array/object 输入非法 JSON → 拦截并提示；合法 JSON 提交时解析为真实数组/对象再给 `onSubmit`。
- `ItemFormModal`：编辑态初始值来自 `initialValues`；提交调用 `updateItem`（携带 `name`+`attributes`）；新建调用 `createItem`。
- `UploadModal`：选文件 → 填元数据 → 提交调用 `uploadFile(file, attributes, onProgress)`；`onProgress` 更新 `Progress` 百分比；成功后关闭并刷新列表；413 错误文案透出。
- 创建成功后列表刷新请求参数不变。

**Step 2–3: 红 → 实现（Upload 用 antd `Dragger` + 受控文件 + `customRequest` 或手动按钮触发 XHR）**
**Step 4: 回归 + 提交**
```bash
git commit -m "feat(frontend): add item create/edit/upload modals with validation and progress"
```
- 回归额外确认：`rg "styled-components" src` 只剩 Task 6–8 待改文件（允许存在，Task 9 清零）。

---

### Task 6: 分类管理页 ✅

**Files:** Create `pages/CategoriesPage.tsx`、`components/categories/CategoryFormModal.tsx`、`hooks/useCategories.ts`；Create `tests/pages/CategoriesPage.test.tsx`

**Step 1: 写失败测试**
- 渲染 `/categories` → `fetchCategories` 调用；树/表格显示 `title`，`is_builtin` 显示"内置"Tag 且编辑/删除按钮禁用。
- 新建：提交 `createCategory({name,title,parent_name})`；`parent_name` 用 `TreeSelect`（排除自身与后代的选项）。
- 编辑：`updateCategory(原name, {title,...})`；重命名时 name 字段可改并提示影响。
- 删除：Popconfirm → `deleteCategory(name)`；后端 400 文案为英文（如 `cannot delete category with existing children`、`builtin categories cannot be deleted`）→ 原样 `message.error(后端 message)` 且列表不刷新。
- 加载/错误态复用 `StatePlaceholder`。

**Step 2–4: 红 → 实现 → 回归 + 提交**
```bash
git commit -m "feat(frontend): add category management page with CRUD"
```

---

### Task 7: Key 管理页

**Files:** Create `pages/KeysPage.tsx`、`components/keys/KeyFormModal.tsx`、`hooks/useKeys.ts`（`components/keys/JsonValueField.tsx` 如 Task 5c 未建则在此建）；Create `tests/pages/KeysPage.test.tsx`；Delete `components/business/KeyManager.tsx`、`store/keySlice.ts`

**Step 1: 写失败测试**
- 表格按 `category_name` 分组（`Table` 分组或 Section 列表），列：title/name/value_type/category/必填/可见/来源插件；按分类筛选。
- 新建/编辑表单字段齐全：`name/title/value_type(Select 5 种)/default_value(按类型切换控件)/description/category_name(Select)/is_required/is_visible/is_public/is_private`；`plugin_name/delete_with_plugin/created_at/updated_at` 只读展示（编辑态）。
- `default_value` 为 array/object 时用 JSON 校验字段；number 用 `InputNumber`；boolean 用 `Switch`。
- 提交调用 `createKey/updateKey(name, payload)`，payload 不含只读字段；**改名提示**：Key 重命名只改定义，存量 item 仍以旧 key 名存储（后端不迁移数据）；删除 Popconfirm → `deleteKey(name)`；错误透出。
- 必填联动：`is_required=true` 时提示会影响 item 创建校验。

**Step 2–4: 红 → 实现 → 回归 + 提交**
```bash
git commit -m "feat(frontend): add key management page with full-field editor"
```

---

### Task 8: 插件页 + AI 页

**Files:** Create `pages/PluginsPage.tsx`、`pages/AIPage.tsx`、`hooks/usePlugins.ts`、`hooks/useAI.ts`；Create `tests/pages/PluginsPage.test.tsx`、`AIPage.test.tsx`；Delete `components/business/AIAssistant.tsx`；Modify `components/library/DetailDrawer`（如有 AI 入口引用）

**Step 1: 写失败测试**
- 插件页：`fetchPluginManifests` → 卡片/表格展示 name/version/description/author/frontend_entry；测试需先调用 `initializePlugins()`（注册在 `plugins/index.tsx` 模块作用域），再断言 `hasPluginComponent('rating')` 为真，其他插件显示"仅后端/未注册 UI"。
- AI 页-语义检索：输入查询 → `aiSearch(query, corpus)`，corpus 来自 `searchItems({sort:'recent',page:1,pageSize:50})`（后端 `MAX_ITEMS=50` 截断）；`total>50` 时提示"仅对最近 50 条生效"；结果可点击跳转 `/library?q=<名称>`。
- AI 页-自动打标签：`autoTag(corpus)` → 结果在 AI 页按 item 展示 Tag（tags 已持久化但 API 不回传，不刷新列表）；失败（503）显示后端 message（未配置 DOUBAO_API_KEY）。

**Step 2–4: 红 → 实现 → 回归 + 提交**
```bash
git commit -m "feat(frontend): add plugins and AI assistant pages"
```

---

### Task 9: 清理、SVG 收尾与文档

**Files:**
- Modify: `components/common/ErrorBoundary.tsx`（💥→`WarningOutlined` + antd `Result`）、`plugins/components/StarRating.tsx`（`★`→antd `Rate`，保留乐观更新/回滚契约）、`tests/plugins/StarRating.test.tsx`（按 Rate 交互更新断言）
- Create: `frontend/tests/no-emoji-icons.test.ts`
- Delete: `src/layouts/`（如空）、`src/components/LayoutParts/`、`src/electron/`、`src/assets/react.svg`、`public/vite.svg`（换 SVG favicon）、`frontend/FRONTEND_MODIFICATION_GUIDE.md`
- Modify: `frontend/index.html`（`lang="zh-CN"`、`<title>KnowFlow</title>`、favicon）、`frontend/package.json`（移除 `styled-components`）、`vite.config.ts`（**删除 manualChunks 的 `styled: ['styled-components']` 条目**，否则 rollup 解析失败）
- Modify docs: `docs/frontend/architecture.md`、`docs/frontend/components.md`、`docs/frontend/README.md`、`docs/frontend/overview.md`（按实际结构更新）、根 `README.md`（前端章节如有过时描述）

**Step 1: 写失败测试**
- `no-emoji-icons.test.ts`：用 `node:fs`（`readdirSync(root,{recursive:true})`，Node 20 可用）扫描 `src/**/*.{ts,tsx}`，正则 `/[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u`（覆盖 ⏰ 等 23xx 图标；不含 2000–206F 以免误伤中文引号/破折号），命中输出 `文件:行`。`tests/**` 自身不扫描；`tsc -b` 不检查 tests（tsconfig 只含 src），测试类型错误不会被 CI 捕获（本轮接受此风险）。
- `StarRating.test.tsx`：Rate 每个星为 `role="radio"` 且**无独立可访问名**（图标 aria-label 相同），用 `getAllByRole('radio')[i]`（第 i 个 = 值 i+1；注意旧实现 DOM 反序 5→1，交互值映射反转）；填充用 `toHaveClass('ant-rate-star-full')`；`readOnly` 映射为 `disabled`（click/hover 不触发）；保留初始 0/5/undefined/null 与失败回滚断言。

**Step 2: 确认失败**（此时 `💥`、`★` 仍在 → 红）
**Step 3: 实现**
- ErrorBoundary 与 StarRating 改造；删除 `styled-components`（先 `rg "styled-components" src` 必须为零）并 `npm uninstall styled-components`。
- 清理死文件与 assets；index.html 修正；favicon 用 BrandLogo 同款 SVG 写入 `public/favicon.svg`。
- 文档更新（对照最终目录与路由改）。

**Step 4: 全量回归 + 提交**
Run: `npx vitest run && npm run lint && npm run build && rg "styled-components|📭|🔑|💥|★" frontend/src frontend/index.html`
```bash
git commit -m "chore(frontend): remove emoji icons, styled-components and stale files"
git commit -m "docs(frontend): update frontend docs for multi-page UI"
```

---

### Task 10: 端到端验证与 PR

**Step 1: 全量静态与单测**
`cd frontend && npm ci && npx vitest run && npm run lint && npm run build`

**Step 2: 真栈冒烟**
- `docker compose up -d --build`（根目录）→ 等 healthy。
- curl 或浏览器：`/`、`/library`、`/categories`、`/keys`、`/plugins`、`/ai` 刷新均 200 直达（nginx SPA fallback）；浏览器手工验证各页 CRUD 与错误态。
- 跑 `backend/.venv/bin/python backend/test/e2e_api_check.py --base http://localhost:8002/api/v1` → 36/36（证明前端改动未影响后端）。
- 手工验证关键流（如可行）：搜索/分页/排序、分类 CRUD、Key CRUD、上传进度、详情、AI 页 503 提示。

**Step 3: 文档与 PR**
- 更新 spec/plan 任务状态；确认 `docs/frontend` 与新结构一致。
- 推送分支 `feat/frontend-ui-redesign`，创建 PR，描述包含"有意行为变更"清单（推荐 Tab 移除、搜索语义变化、分页化、AI 候选上限 100）。
- CI 全绿后汇报。

---

## 自检清单

- [ ] 所有图标为 `@ant-design/icons` SVG 或自绘 SVG；`no-emoji-icons` 测试绿
- [ ] `/item/search` 为列表唯一数据源；URL 参数可复现列表状态
- [ ] 分类/Key 全 CRUD 可用，后端 400 文案原样透出
- [ ]  plugins manifests 来自 API；rating 插件契约未变
- [ ] 三态（loading/empty/error）在所有页面统一
- [ ] `styled-components` 已移除且无残留引用
- [ ] 后端 e2e 36/36；CI 全绿
- [ ] `docs/frontend/*` 与 `README` 与实现一致
