# 前端 UI 整理与后端逻辑对齐设计

- 日期：2026-09-14
- 状态：待审核（多 subagent 审核后实施）
- 分支：`feat/frontend-ui-redesign`
- 关联：后端 API 已稳定（PR #14–#20）；本轮只改前端 + 前端文档，不动后端

## 背景与动机

当前前端是一个无路由单页：React 19 + Ant Design 6 + Redux Toolkit + styled-components + 全局 CSS 三套样式体系并存。用户反馈"显示不好看、廉价"，且页面逻辑与后端能力严重脱节。

### 现状问题（代码定位）

1. **信息架构**：全部功能挤在 `pages/MainPage.tsx`（421 行）的 640px 卡片里，无 URL 概念，不可直达、不可回退（无 react-router）。
2. **后端能力未用**：
   - `GET /api/v1/item/search`（服务端 q/筛选/排序/分页）完全未调用；前端在 `hooks/useKnowledge.ts:80-94` 对全量 `GET /item` 结果做 name/file_path 子串过滤，排序在本地做（`:47-65`），大规模数据必卡。
   - 分类只有读取（`api.ts:51`），后端 POST/PUT/DELETE `/categories` 未暴露；Key 编辑字段不完整，无分类管理页。
   - `GET /plugins/manifests` 未调用，插件注册在 `plugins/index.tsx:20` 硬编码。
   - `updated_at`、`key_info` 被 `transformItemData`（`api.ts:26-31`）丢弃；`tags` 虽由 AI 打标签持久化，但后端响应从不返回（见"已知限制"）。
3. **视觉与交互**：
   - 图标混杂 emoji（tab `✨📁🔍`、空态 `📭📂`、侧栏 `🔑`、详情页 `📋⏰⚙️🔧`、ErrorBoundary `💥`）、unicode `★✓✗` 与 antd SVG 图标；`★` 与 emoji 渲染不可控。
   - 两套色板：`styles/App.css` 硬编码 indigo `#6366F1/#8B5CF6`，与 `theme/tokens.ts` 的蓝 `#2563EB`/紫 `#7C3AED` 不一致；`#52c41a`、`#ffc107`、`#666` 等硬编码散落。
   - 过度装饰：毛玻璃 Drawer、渐变按钮/标题、卡片悬浮位移，和"专业知识库"气质不符。
   - 全部 `Modal` 同时挂载（`MainPage.tsx:378-415`），上传无进度（`UploadSection.tsx:153-160` `showUploadList={false}`），表单无校验规则（`DynamicKeyForm` 只标红不拦截），初始加载无骨架屏，删除按钮仅 hover 可见。
4. **死代码**：`src/layouts/`、`src/components/LayoutParts/`、`src/electron/` 空目录；`react.svg`/`vite.svg` 残留；`FRONTEND_MODIFICATION_GUIDE.md` 指向已删除的 `Layout.tsx`；`index.html` `lang="en"`、`<title>frontend</title>`；`@ant-design/icons` 被直接 import 但未在 `package.json` 声明（antd 的传递依赖，升级可能炸）。

## 调研结论（2026-09-14，官方文档与 npm registry）

1. **antd v6**（6.0.0 发布于 2025-11-22）：要求 React ≥ 18；**默认启用 CSS 变量**；`@ant-design/icons` 必须 ≥ 6（当前 6.1.0，需从传递依赖提升为显式依赖）。6.3.0 起 Modal/Drawer 蒙层模糊默认关闭（本项目 6.3.1，无需处理）。Tag 不再自带尾部 margin。来源：https://ant.design/docs/react/migration-v6/ 。
2. **消息/弹窗上下文**：v6 推荐用 `App.useApp()` 获取 `message/notification/modal`，静态方法不继承 `ConfigProvider` 主题。当前 `hooks/useKnowledge.ts` 已用 `App.useApp()`，方向正确，需全量贯彻。来源：https://ant.design/components/app 。
3. **react-router**：latest 为 v8.3.1，但 **v8 要求 Node ≥ 22.22 / React ≥ 19.2.7**，本项目 CI 与 `frontend/Dockerfile` 固定 Node 20（`ci.yml:53`、`Dockerfile:6`）→ 选择 **`react-router@7.18.3`（engines: node ≥ 20, react ≥ 18）declarative 模式**（`BrowserRouter` + `Routes/Route`），import 自 `react-router`（v7 起 `react-router-dom` 仅为转发包；v8 已删除）。来源：https://reactrouter.com/start/modes 、`npm view react-router@7 engines` 。
4. **antd Upload 进度**：`action`/`data`/`name` 由组件内置 XHR 上传并提供 `onChange` 状态与内置进度条；`customRequest` 可完全接管并拿到 `onProgress`。本项目在"选文件 → 元数据确认 → 提交"两段式流程下，采用 `customRequest` 桥接自研 XHR 上传函数，进度由 antd 渲染。来源：https://ant.design/components/upload 。
5. **后端搜索语义**（`backend/managers/item_manager.py:236-296`）：
   - `q`：对 `name` **及所有已知 key 的存储值**做大小写不敏感子串正则（不是只搜名称/路径）。
   - `key` + `key_value`：两者需同时提供；对该 key 的存储值做子串匹配；未知 key → 400。
   - `sort`：`recent`（created_at 倒序）/ `rating`（数值倒序，缺失按 0）/ `name`（升序）。
   - `page`≥1、`page_size` 1..100，返回 `{items,total,page,page_size,total_pages}`。
   - 错误响应：HTTP 状态 = envelope `code`，`message` 为可展示文案。

## 用户已确认的方向

| 决策 | 选择 |
|------|------|
| 组件库 | 精修 Ant Design 6（不迁移 shadcn/Tailwind） |
| 信息架构 | 引入 react-router 多页面 |
| 后端对齐 | 全面对齐（服务端搜索分页、分类 CRUD、Key 全字段、插件 manifests、上传进度、updated_at/tags） |
| 视觉风格 | 现代简洁知识库风（浅色侧边栏 + 清爽内容区，克制品牌色，去渐变/毛玻璃） |

## 目标与非目标

### 目标

1. 多页面 IA：`/library`、`/categories`、`/keys`、`/plugins`、`/ai`，URL 可直达、可回退，侧边栏导航高亮。
2. 页面逻辑以后端为准：列表走 `/item/search`；分类/Key 全量 CRUD；插件列表来自 `/plugins/manifests`；详情展示 `key_info`/`tags`/`updated_at`；上传真实进度；表单校验对齐后端必填/类型约束。
3. 统一设计系统：单一 token 来源（`theme/tokens.ts` → antd ThemeConfig），删除第二套色板与 styled-components；所有图标为 SVG（`@ant-design/icons`）；统一 loading/empty/error 三态；桌面优先 + 侧栏可折叠响应式。
4. 前端测试从 29 个提升到覆盖新逻辑（API 层、路由、各页面关键交互），并新增"禁止 emoji 图标"自动检查。

### 非目标（本轮不做，记录为已知限制）

- 不做登录/鉴权（后端本来没有）。
- 不做 xlsx 批量导入（后端没有该接口）。
- 不做动态加载插件前端模块（后端无静态托管插件前端的路由；`PLUGINS.md` 的 `frontend` 路由是过期文档）。OpenClaw 专用 REST（PUT/GET/PATCH `/plugins/knowflow_openclaw/...`）仍不接 UI，其 key 以普通动态字段呈现。
- 不做暗色主题/主题切换。
- 不引入 i18n 框架（维持硬编码中文，仅修正 `lang`/`title`）。
- 不做 Electron 壳改动（仅保持 `window.knowflow` 能力）。

### 已知限制（后端现状，本轮不动后端）

- **tags 不可见**：`POST /ai/auto-tag` 会把 tags 写入 item（`backend/api/v1/ai.py:166-178`），但 `_format_item_response`（`backend/managers/item_manager.py:100-128`）不返回该字段，前端无法展示。
- **上传文件不随条目删除**：`item_manager.py:223-233` 只删文档，`uploads/` 文件保留；删除确认文案会提示。
- **插件 manifests 无 `type`**：`plugin_manager.py:281-289` 只返回 name/version/description/author/frontend_entry。
- **未使用的读接口**：`GET /keys/{name}`、`GET /categories/{id}`、`GET /plugins/rating/items/{id}/rating`（列表数据已覆盖需求）。
- **后端校验/错误文案为英文**（如 `cannot delete category with existing children`、`builtin categories cannot be deleted`），前端原样透出。

## 信息架构与路由

```
/               → Navigate to /library
/library        知识库：搜索/排序/筛选 + 服务端分页列表 + 详情抽屉 + 上传/新建/编辑
/categories     分类管理：分类树 + CRUD（保护 builtin、子分类约束提示）
/keys           Key 管理：按分类分组的全字段 CRUD，类型化默认值编辑 + JSON 校验
/plugins        插件：manifests 列表 + 已注册 UI 组件说明
/ai             AI 助手：语义检索 + 自动打标签
*               404 页
```

布局：`AppLayout` = 顶栏（Logo/产品名 + AI 快捷入口 + GitHub/文档链接）+ 浅色可折叠侧栏（SVG 图标菜单，`NavLink` 高亮）+ 内容区（面包屑 + 页面容器）。

### 页面职责与后端映射

| 页面/交互 | 调用的后端接口 | 说明 |
|-----------|----------------|------|
| 知识库列表/搜索/排序/分页 | `GET /item/search?q&key&key_value&sort&page&page_size` | 替换现有客户端过滤；`q` 语义与后端一致 |
| 高级筛选 | 同上 `key`+`key_value` | 两个输入都填才生效（后端行为）；key 用下拉（来自 `/keys`） |
| 详情抽屉 | 列表响应中的 `key_info`+`attributes` | 按 `key_info.category_name` 分组显示标题/类型；`created_at/updated_at` |
| 上传文件 | `POST /upload`（multipart: `file`+`data` JSON） | `data={"attributes":{...}}`；真实进度；10MB 限制错误透出 |
| 新建记录 | `POST /item` | `{name, attributes}`；必填校验对齐后端 |
| 编辑记录 | `PUT /item/{id}` | `{name, attributes}` |
| 删除记录 | `DELETE /item/{id}` | 确认弹窗；成功后刷新当前页（处理"删掉当前页最后一条"回退页码） |
| 分类管理 | `GET/POST /categories`、`PUT/DELETE /categories/{name}` | builtin 禁改禁删；删除有子分类时后端 400 文案直接展示 |
| Key 管理 | `GET/POST /keys`、`PUT/DELETE /keys/{name}` | 全字段；`plugin_name/delete_with_plugin/created_at/updated_at` 只读展示；重命名走 PUT |
| 插件页 | `GET /plugins/manifests` | name/version/description/author/frontend_entry；标注哪些已注册前端组件（rating） |
| AI 语义检索 | `POST /ai/search`（客户端提供候选 items） | 候选 = 当前库按 recent 取前 50 条（后端 `ai.py:24` `MAX_ITEMS=50` 截断），超出时明确提示 |
| AI 自动打标签 | `POST /ai/auto-tag` | 结果在 AI 页按 item 展示；tags 已持久化但 API 不回传，列表无法展示（已知限制） |
| 评分插件 | `PUT /plugins/rating/items/{id}/rating`（保留） | 组件改用 antd `Rate`（SVG 星），保留乐观更新与回滚 |
| 媒体预览 | `GET /uploads/{filename}` 静态资源 | 图片/视频 |

## 设计系统

### 令牌与主题

- 唯一来源：`src/theme/tokens.ts`；`theme/antd.ts` 保持 ThemeConfig 映射并精简（去除自相矛盾的组件覆盖）。
- 浅色化：`Layout.siderBg` 改白、`Menu` 变浅色选中态（primary 背景 + 白字或浅蓝底 + primary 字，实施时以浅色方案为准）；页面底 `#F8FAFC`，卡片白。
- 品牌色：主 `#2563EB`；紫色 `#7C3AED` 仅用于 Logo 渐变点；成功/警告/危险沿用 tokens。
- 组件内不再手写颜色/间距：一律 `theme.useToken()` 或 antd 组件 props；全局 CSS 仅保留 reset、滚动条与少量 `--ant-*` 变量引用，删除 `!important` 覆写。
- `styles/App.css` 中 indigo 色板、`.main-card` 渐变顶栏、glass 相关样式全部删除。
- `styled-components` 全部退场：组件文件内的 styled 定义替换为 antd 组件 + 少量普通 CSS 类（最终移除依赖）。

### 图标（硬性要求：仅 SVG）

- 统一使用 `@ant-design/icons`（v6，SVG React 组件），显式加入 `package.json` 依赖；Logo 为自绘内联 SVG 组件；favicon 换为 SVG。
- 全部 emoji/unicode 图标替换：tab/菜单 → `BookOutlined/FolderOutlined/KeyOutlined/ApiOutlined/RobotOutlined` 等；空态 → `InboxOutlined/FileSearchOutlined`；文件类型 → `FileImageOutlined/FilePdfOutlined/FileTextOutlined/FileExcelOutlined/VideoCameraOutlined/FileZipOutlined/FileOutlined`；操作用 `SearchOutlined/UploadOutlined/PlusOutlined/EditOutlined/DeleteOutlined/EyeOutlined/FolderOpenOutlined/ReloadOutlined`；ErrorBoundary → `WarningOutlined`；评分 → antd `Rate` 内置 SVG。
- 自动检查：新增 `tests/no-emoji-icons.test.ts`，扫描 `src/**` 源码禁止 emoji 码点（测试代码自身除外），防止回潮。

### 三态与反馈

- 列表/表格：`Skeleton`（初次）与 `Spin`（翻页/搜索覆层）；空态 `Empty` 带引导操作；失败态 `Result/Alert` + 重试按钮。
- 全部操作反馈经 `App.useApp()` 的 `message`；禁止 `window.alert/confirm`；删除一律 `Popconfirm`（表格行内 + 抽屉底部）。
- 表单：`DynamicKeyForm` 按 `value_type` 选择控件（string→Input/TextArea，number→InputNumber，boolean→Switch，array/object→JSON 编辑器），`is_required` 生成真 `rules`；JSON 字段解析失败阻止提交并定位错误。

## 数据层设计

- 保留 Redux Toolkit；新增/瘦身 slices：
  - `librarySlice`：`{ items, total, page, pageSize, query:{q,key,keyValue,sort}, loading, error, selectedId }`，reducers 覆盖 `setQuery/mergeQuery/setResult/removeItem/upsertItem/selectItem`。
  - `catalogSlice`（原 keySlice 扩展）：`{ keys, categories, loading, error }` + CRUD 后局部更新 reducers。
  - `pluginsSlice`：`{ manifests, loading, error }`。
  （不引入 RTK Query/React Query；当前数据流简单，hooks + slice 足够，避免新增概念。）
- `services/api.ts` 扩展（全部 `request()` 走统一 envelope 错误处理，并校验 `body.code === 0`）：
  - `searchItems(params)`、`createCategory/updateCategory/deleteCategory`、`fetchPluginManifests`；
  - `uploadFile(file, attributes, onProgress?)` 用 XHR 实现进度（其余仍 fetch）；
  - `transformItemData` 保留 `updatedAt`、`keyInfo`。
- hooks 按页面拆分：`useLibrary`（含防抖、URL 查询参数同步、增删改）、`useCategories`、`useKeys`、`usePlugins`、`useAI`。删除 `useKnowledge.ts`。
- URL 即状态：`/library?q=...&sort=...&page=2&page_size=20&key=...&key_value=...` 与 store 双向同步（刷新/分享可复现），排序/页码变化触发请求；搜索输入 400ms 防抖。

## 组件清单（新建 / 移除）

**新建**
- `layouts/AppLayout.tsx`、`components/layout/SideNav.tsx`、`components/layout/PageHeader.tsx`
- `pages/LibraryPage.tsx`、`components/library/SearchToolbar.tsx`、`components/library/ItemTable.tsx`、`components/library/ItemDetailDrawer.tsx`、`components/library/ItemFormModal.tsx`、`components/library/UploadModal.tsx`
- `pages/CategoriesPage.tsx`、`components/categories/CategoryFormModal.tsx`
- `pages/KeysPage.tsx`、`components/keys/KeyFormModal.tsx`、`components/keys/JsonValueField.tsx`
- `pages/PluginsPage.tsx`、`pages/AIPage.tsx`、`pages/NotFoundPage.tsx`
- `components/common/StatePlaceholder.tsx`（三态统一）、`FileIcon.tsx`、`BrandLogo.tsx`

**移除**
- `pages/MainPage.tsx`、`hooks/useKnowledge.ts`
- `components/layout/FileCard.tsx`、`SearchSection.tsx`、`UploadSection.tsx`、`layout-styles.ts`、`styles/layout.ts`、`styles/search.ts`
- `components/business/KeyManager.tsx`（拆分为 KeysPage + KeyFormModal）、`AIAssistant.tsx`（改为 AIPage）、`DynamicKeyForm.tsx`（重写为 `components/common/DynamicKeyForm.tsx`）、`MediaPreview.tsx`（重写为受控 `MediaPreviewModal`，由详情抽屉调用）
- `src/layouts/`、`src/components/LayoutParts/`、`src/electron/` 空目录、`react.svg`/`vite.svg`、`FRONTEND_MODIFICATION_GUIDE.md`、`theme/index.ts` 中无效导出
- 依赖：`styled-components`

**保留并小改**
- `plugins/loader.tsx`（不变）、`plugins/index.tsx`（注册 rating）、`plugins/components/StarRating.tsx`（内部换 antd `Rate`，契约不变）、`components/common/ErrorBoundary.tsx`（SVG 图标 + antd 样式）、`utils/*`（保留 electron/helper，新增文件类型图标映射）

## 有意行为变更（需审核确认）

1. **移除"推荐"Tab**：后端无推荐接口，原逻辑是"前 5 条"的伪推荐；改为排序控件（最近/评分/名称），不再造假。
2. **搜索从纯客户端变为服务端**：搜索范围由 name/file_path 扩大为后端语义（name + 所有属性值），结果更全；搜索行为变化需在 PR 说明。
3. **列表分页化**：默认每页 20，不再一次渲染全部。
4. **AI 语义检索候选上限 50**（与现状持平）：后端 `MAX_ITEMS=50` 会静默截断，界面明确提示"仅对最近 50 条生效"，避免误导。
5. **分类/Key 管理拆成独立页面**（原弹窗），删除入口从弹窗改为页面导航。
6. **图标全部换 SVG**（文案不变，emoji/unicode 图形字符清零）。
7. **左侧分类树浏览入口移除**：原侧栏分类树 + Key 点击过滤改为"知识库高级筛选 + 分类管理页"，分类/Key 浏览路径变化。
8. **名称排序语义变化**：原为前端 `localeCompare('zh-Hans-CN')`，新为后端 MongoDB 默认排序（`name` 升序，按存储字节序），中文名顺序可能与旧版不同。

## 测试策略

- 基线：`npm run lint` 干净；`npm test`（29 通过，其中 App/StarRating/loader 三份需按新结构有意更新）；`npm run build` 通过。CI 已覆盖三者。
- 新增单测（vitest + Testing Library，jsdom）：
  - `tests/services/api.test.ts`：search 参数拼装、envelope 错误、tags/key_info 转换、XHR 上传进度回调、分类/Key/manifests 端点。
  - `tests/store/*.test.ts`：slice reducers（分页状态、局部更新/删除）。
  - `tests/routing.test.tsx`：`/` 重定向、各路由渲染、404、侧栏高亮（MemoryRouter）。
  - `tests/pages/LibraryPage.test.tsx`：首屏请求参数、搜索防抖后请求、翻页请求 page=2、空/错/载三态、删除调用与刷新。
  - `tests/pages/CategoriesPage.test.tsx`、`KeysPage.test.tsx`、`PluginsPage.test.tsx`、`AIPage.test.tsx`：CRUD 调用参数、校验拦截、错误透出。
  - `tests/no-emoji-icons.test.ts`：emoji 扫描。
- 测试注意：`tests/setup.ts` 需补 `window.matchMedia`（jsdom 无，antd Row/Col 会崩）；antd Button 双汉字会插空格（确认按钮断言用 `/确\s*定/`）；URL 中文参数 percent-encode，用 `URLSearchParams` 断言；Rate 星为 `role=radio` 无独立名字，按索引点击、`ant-rate-star-full` 断言填充；防抖用 `vi.useFakeTimers()` + `userEvent.setup({ advanceTimers })`。
- 回归：每任务红→绿→全量；最终 `lint + test + build`，并用根 `compose.yaml` 起全栈后浏览器手工冒烟（登录无，检查各页 CRUD 与 e2e 脚本仍 36/36 保证后端未受影响）。

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| 大范围重写引入回归 | 逐任务提交、每步全量测试；先 API/store 后页面；保留 e2e 后端脚本做端到端兜底 |
| react-router v8 诱惑导致 Node 不兼容 | 显式 pin `react-router@^7.18.3`，不加 `react-router-dom` |
| antd 6 组件行为记错 | 关键交互（Upload/Table/Rate/Menu/Form）先查官方文档再写；实现中以官方 demo 为准 |
| JSON 字段存储为字符串/解析差异 | 统一在 api 转换层处理，测试覆盖 string→array/object/boolean/number 各分支 |
| 删 styled-components 造成样式遗漏 | 逐组件替换，`rg "styled-components"` 清零后移除依赖；构建 + 视觉冒烟 |
| 现有 29 个测试被破坏 | 明确列出需要有意更新的三份测试（App 路由化、StarRating 换 Rate、loader 不变），其余必须保持；jsdom 需补 `matchMedia` mock |
| antd v6 废弃 prop | 遵循迁移文档：Modal `maskClosable`→`mask.closable`、Spin `tip`→`description`、Table pagination `position`→`placement`、Tag 用 `variant` 替代旧写法 |
| Node 20 已 EOL（2026-04-30） | 与 react-router v8 升级一起作为后续独立事项，不在本轮扩大范围 |

## 交付物

1. 上述新前端代码 + 测试，`lint/test/build` 全绿，CI 通过。
2. 文档同步：`docs/frontend/architecture.md`、`components.md`、`overview.md`（如涉及）、`README.md` 前端章节、`docs/frontend/README.md`；删除过期 `FRONTEND_MODIFICATION_GUIDE.md`。
3. PR（分支 `feat/frontend-ui-redesign`），PR 描述列出有意行为变更清单。
