# Proposal: KnowFlow OpenClaw Plugin

## Summary
将现有的 PS 脚本桥接方式升级为正规的 OpenClaw 插件（TypeScript），作为独立仓库维护，通过 git submodule 挂载到 KnowFlow 的 `plugins/knowflow_openclaw/openclaw_plugin` 目录。

## Why
当前桥接方式（PS 脚本 + SKILL.md）存在以下问题：
1. PS 脚本不是 OpenClaw 原生工具，Agent 需要通过 exec 调用
2. 脚本散落在 `~/.openclaw/skills/knowflow/scripts/`，不跟 KnowFlow 仓库一起维护
3. 没有配置校验、没有类型安全、没有生命周期管理
4. 不能利用 OpenClaw 插件系统的 allowlist/denylist 策略

## What Changes
1. 创建 OpenClaw 插件项目（TypeScript）
2. 注册 agent tools：knowflow_record, knowflow_search, knowflow_list, knowflow_get
3. 插件内置 skill（`skills/knowflow/SKILL.md`）
4. 通过 git submodule 挂载到 KnowFlow 仓库
5. 废弃旧的 PS 脚本桥接

## Scope
- ✅ OpenClaw 插件代码（TypeScript）
- ✅ openclaw.plugin.json 清单
- ✅ 内置 SKILL.md
- ✅ git submodule 配置
- ❌ 不改 KnowFlow 后端 API
- ❌ 不改 OpenClaw 核心

## Rollback Plan
删除 submodule 即可回滚，KnowFlow 后端不受影响。
