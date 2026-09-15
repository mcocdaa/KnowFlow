---
title: 前端组件
version: 1.0
keywords: [组件, 布局, 知识库, 分类, Key, 插件]
description: 前端组件清单与职责说明
---

# 前端组件

本文件是前端组件的唯一清单。组件均位于 [frontend/src/components/](../../frontend/src/components/)，页面组件位于 [frontend/src/pages/](../../frontend/src/pages/)，插件组件位于 [frontend/src/plugins/](../../frontend/src/plugins/)。所有组件使用函数式写法 + Ant Design 6。

## 布局组件（layout/）

| 组件 | 文件 | 用途 |
|------|------|------|
| `AppLayout` | [AppLayout.tsx](../../frontend/src/layouts/AppLayout.tsx) | 应用外壳：Header 展示品牌 Logo 与标题，Sider 承载侧边导航，Content 通过 `<Outlet />` 渲染子路由。 |
| `SideNav` | [layout/SideNav.tsx](../../frontend/src/components/layout/SideNav.tsx) | 侧边导航菜单，五个入口（知识库/分类管理/Key 管理/插件/AI 助手），以 `useLocation().pathname` 决定高亮。 |

## 通用组件（common/）

| 组件 | 文件 | 用途 |
|------|------|------|
| `BrandLogo` | [common/BrandLogo.tsx](../../frontend/src/components/common/BrandLogo.tsx) | 内联渐变 SVG 品牌标志，`useId` 生成渐变 ID 避免冲突。 |
| `ErrorBoundary` | [common/ErrorBoundary.tsx](../../frontend/src/components/common/ErrorBoundary.tsx) | 捕获渲染异常并展示 `Result` 兜底页，支持重试。 |
| `StatePlaceholder` | [common/StatePlaceholder.tsx](../../frontend/src/components/common/StatePlaceholder.tsx) | 统一 loading（Skeleton）/ empty（Empty）/ error（Result + 重试）三态占位。 |
| `DynamicKeyForm` | [common/DynamicKeyForm.tsx](../../frontend/src/components/common/DynamicKeyForm.tsx) | 根据可见 Key 定义动态生成表单：布尔→Switch、数字→InputNumber、数组/对象→JSON 文本域，其余→TextArea；提交时反序列化 JSON。 |
| `FileIcon` | [common/FileIcon.tsx](../../frontend/src/components/common/FileIcon.tsx) | 按 MIME 类型（image/video/pdf/text/excel/zip）选择对应线性图标。 |
| `JsonBlock` | [common/JsonBlock.tsx](../../frontend/src/components/common/JsonBlock.tsx) | 只读展示对象/数组字段，等宽格式化并限制最大高度。 |

## 知识库组件（library/）

| 组件 | 文件 | 用途 |
|------|------|------|
| `SearchToolbar` | [library/SearchToolbar.tsx](../../frontend/src/components/library/SearchToolbar.tsx) | 搜索框（400ms 防抖）、排序、高级筛选（Key + 值）、每页条数，以及上传/新建入口；本地输入与 URL 参数在渲染期校正同步。 |
| `ItemTable` | [library/ItemTable.tsx](../../frontend/src/components/library/ItemTable.tsx) | 知识记录表格：文件图标 + 名称、评分、更新时间、查看/编辑/删除操作与分页。 |
| `ItemDetailDrawer` | [library/ItemDetailDrawer.tsx](../../frontend/src/components/library/ItemDetailDrawer.tsx) | 右侧详情抽屉：按分类分组展示 Key-Value，插件字段走 `PluginRenderer`，支持媒体预览、打开文件所在文件夹、编辑与删除。 |
| `ItemFormModal` | [library/ItemFormModal.tsx](../../frontend/src/components/library/ItemFormModal.tsx) | 新建/编辑记录弹窗，内部复用 `DynamicKeyForm` 并维护提交态。 |
| `UploadModal` | [library/UploadModal.tsx](../../frontend/src/components/library/UploadModal.tsx) | 文件上传弹窗：拖拽选择单个文件、填写动态属性、展示上传进度。 |
| `MediaPreviewModal` | [library/MediaPreviewModal.tsx](../../frontend/src/components/library/MediaPreviewModal.tsx) | 图片/视频预览弹窗，图片使用 antd `Image`，视频使用原生 `<video>`。 |

## 分类组件（categories/）

| 组件 | 文件 | 用途 |
|------|------|------|
| `CategoryFormModal` | [categories/CategoryFormModal.tsx](../../frontend/src/components/categories/CategoryFormModal.tsx) | 新建/编辑分类表单（标识、名称、父分类），编辑时用 TreeSelect 排除自身与后代以避免环。 |

## Key 组件（keys/）

| 组件 | 文件 | 用途 |
|------|------|------|
| `KeyFormModal` | [keys/KeyFormModal.tsx](../../frontend/src/components/keys/KeyFormModal.tsx) | 新建/编辑 Key 定义：名称、类型、默认值（随类型切换控件）、描述、分类与必填/可见/公开/私有开关；编辑态额外展示来源插件等只读信息。 |

## 插件组件（plugins/）

| 组件 | 文件 | 用途 |
|------|------|------|
| `PluginRenderer` | [plugins/loader.tsx](../../frontend/src/plugins/loader.tsx) | 按插件名从注册表取组件；命中时在 `Suspense` 中渲染，未命中回退展示原始值，避免因缺少插件而报错。 |
| `StarRating` | [plugins/components/StarRating.tsx](../../frontend/src/plugins/components/StarRating.tsx) | 内置 `rating` 插件：星级评分，点击即持久化到后端，失败自动回滚并提示。 |

## 页面组件（pages/）

各页面负责编排上述组件、调用对应 Hook 并落地三态渲染：

| 页面 | 文件 | 用途 |
|------|------|------|
| `LibraryPage` | [LibraryPage.tsx](../../frontend/src/pages/LibraryPage.tsx) | 组合工具栏/表格/详情抽屉/表单/上传弹窗，承载知识库全部交互。 |
| `CategoriesPage` | [CategoriesPage.tsx](../../frontend/src/pages/CategoriesPage.tsx) | 分类表格与增删改，内置分类禁改禁删。 |
| `KeysPage` | [KeysPage.tsx](../../frontend/src/pages/KeysPage.tsx) | Key 表格、按分类筛选与增删改。 |
| `PluginsPage` | [PluginsPage.tsx](../../frontend/src/pages/PluginsPage.tsx) | 展示后端插件清单及前端 UI 注册状态。 |
| `AIPage` | [AIPage.tsx](../../frontend/src/pages/AIPage.tsx) | 语义检索与自动打标签两个 Tab。 |
| `NotFoundPage` | [NotFoundPage.tsx](../../frontend/src/pages/NotFoundPage.tsx) | 404 结果页与返回知识库入口。 |

## 相关文档

- [前端架构](./architecture.md)
- [前端部署](./deployment.md)
