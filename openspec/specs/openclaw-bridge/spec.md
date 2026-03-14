# openclaw-bridge Specification

## Purpose
TBD - created by archiving change openclaw-bridge-skill. Update Purpose after archive.
## Requirements
### Requirement: 文档记录
Agent SHALL 能通过单条命令创建 KnowFlow 知识项并设置 OpenClaw 属性。

#### Scenario: 基本文档记录
- GIVEN KnowFlow 服务运行在 http://localhost:3000
- WHEN Agent 执行 `kf-record.ps1 -Name "API设计文档" -ProjectId "proj-001" -Type "document" -Summary "用户认证模块API设计" -Content "详细内容..." -Agent "backend_dev"`
- THEN KnowFlow 创建知识项并返回 item ID
- AND OpenClaw 属性（project_id, archive_type, summary, agent_source）被正确设置

#### Scenario: 最简记录（仅必填字段）
- GIVEN KnowFlow 服务运行在 http://localhost:3000
- WHEN Agent 执行 `kf-record.ps1 -Name "快速笔记" -ProjectId "proj-001"`
- THEN 使用默认值创建知识项（type=document, fold_level=3）

### Requirement: 文档搜索
Agent SHALL 能按关键词、项目ID、归档类型搜索 KnowFlow 中的文档。

#### Scenario: 关键词搜索
- GIVEN KnowFlow 中存在多个知识项
- WHEN Agent 执行 `kf-search.ps1 -Query "API设计"`
- THEN 返回名称或内容匹配的知识项列表（含 ID、名称、摘要、创建时间）

#### Scenario: 按项目筛选
- GIVEN KnowFlow 中存在多个项目的知识项
- WHEN Agent 执行 `kf-search.ps1 -Key "openclaw_project_id" -KeyValue "proj-001"`
- THEN 仅返回该项目的知识项

### Requirement: 文档查看
Agent SHALL 能获取单个知识项的完整信息。

#### Scenario: 查看文档详情
- GIVEN 知识项 ID 为 "abc123"
- WHEN Agent 执行 `kf-get.ps1 -Id "abc123"`
- THEN 返回该知识项的所有属性（含 OpenClaw 属性）

### Requirement: 文档列表
Agent SHALL 能列出所有或最近的知识项。

#### Scenario: 列出最近文档
- GIVEN KnowFlow 中存在知识项
- WHEN Agent 执行 `kf-list.ps1 -Limit 10`
- THEN 返回最近 10 条知识项（按创建时间倒序）

### Requirement: 技能指导
SKILL.md SHALL 提供完整的 API 调用指南，让 Agent 在无脚本时也能直接用 HTTP 调用。

#### Scenario: Agent 直接调用 API
- GIVEN Agent 读取了 SKILL.md
- WHEN Agent 需要记录文档但脚本不可用
- THEN Agent 能根据 SKILL.md 中的示例直接构造 HTTP 请求

