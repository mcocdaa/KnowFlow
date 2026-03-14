# Proposal: OpenClaw Bridge Skill

## Summary
开发 OpenClaw 技能（knowflow skill），作为 OpenClaw Agent 与 KnowFlow API 之间的桥接工具。让 Agent 能通过简单的 exec 命令调用 KnowFlow 进行结构化文档记录、查询和管理。

## Problem
当前 OpenClaw Agent 团队的文档记录依赖 MEMORY.md 纯文本文件，存在以下问题：
1. 纯文本无法结构化查询（按项目、类型、时间筛选）
2. 文件越来越大，全文加载浪费 token
3. 无法追溯文档的创建者、修改历史
4. 多 Agent 并发写入可能冲突

KnowFlow v1.0.3 已提供完整的 REST API 和 OpenClaw 插件（knowflow_openclaw），但 Agent 端缺少便捷的调用工具。

## Solution

### 1. OpenClaw 技能 (SKILL.md)
创建 `~/.openclaw/skills/knowflow/SKILL.md`，指导 Agent 如何调用 KnowFlow API：
- 文档记录（创建知识项 + 设置 OpenClaw 属性）
- 文档查询（按关键词、项目、类型搜索）
- 文档更新和删除
- 分类和 Key 管理

### 2. 辅助脚本 (scripts/)
创建 PowerShell/Shell 脚本封装常用操作，减少 Agent 每次调用时的 HTTP 拼装：
- `kf-record.ps1` — 一键记录文档（合并 create item + set openclaw attrs）
- `kf-search.ps1` — 搜索文档
- `kf-list.ps1` — 列出文档
- `kf-get.ps1` — 获取单个文档详情

### 3. KnowFlow 后端增强（如需要）
- 检查现有 API 是否满足桥接需求
- 如有缺口，在 openclaw 分支上补充

## Scope
- ✅ OpenClaw 技能文件 (SKILL.md + scripts/)
- ✅ 辅助脚本（PowerShell，兼容 Windows 环境）
- ✅ KnowFlow 后端 API 补充（如需要）
- ❌ 前端 UI 改动（不在本次范围）
- ❌ 记忆搜索功能（继续用 memory_search）

## Rollback Plan
技能文件和脚本独立于 KnowFlow 核心代码，删除技能目录即可回滚。
KnowFlow 后端改动在 openclaw 分支，不影响 main。

## Success Criteria
1. Agent 能通过一条命令完成文档记录
2. Agent 能按项目ID、归档类型搜索文档
3. 所有脚本在 Windows PowerShell 环境正常运行
4. KnowFlow API 响应正常（200/201）
