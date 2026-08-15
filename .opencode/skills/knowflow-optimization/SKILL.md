---
name: knowflow-optimization
description: KnowFlow 项目专用的"调研驱动优化"工作流：网络调研验证技术假设 → 多 subagent 分角度审核计划 → TDD 逐任务实施。适用于后端/插件代码的保守重构与依赖升级。使用场景：用户要求"继续优化""重构""升级依赖"时。
---

# KnowFlow 优化工作流

本项目验证有效的优化流程（2026-08-11 第二轮优化沉淀）。目标是保守重构：零行为变更（或明示的有意变更）、每步可验证、随时可回退。

## 何时使用

- 用户要求优化/重构/升级依赖
- 涉及第三方库行为（驱动、框架 API）变更
- 多文件机械改造（依赖注入、抽取 helper）

## 流程

### 1. 网络调研先行（HARD REQUIREMENT）

任何依赖/框架相关决策前，抓取**官方文档**验证技术假设，不依赖记忆：

- 库弃用状态与迁移指南（如 Motor 已弃用 → PyMongo Async 迁移指南确认 API 差异）
- API 签名核对（如 `AsyncMongoClient.close()` 是 async、`AsyncCollection.aggregate` 是协程）
- 框架官方推荐模式（如 FastAPI `dependencies.py` 模块 + `Depends` 注入）

产出：调研结论写入 spec 的"背景与动机"。

### 2. 多 subagent 分角度审核计划（HARD REQUIREMENT）

计划完成后，并行派发 3 个 code-reviewer，各自结合网络调研验证：

| Reviewer | 角度 | 典型发现 |
|----------|------|----------|
| A | 库 API/迁移正确性 | 测试盲区（conftest mock 掩盖真实回归）、patch 路径错误 |
| B | 测试 TDD 正确性 | await MagicMock 必炸、既有测试被行为变更破坏、计数推算 |
| C | 行为等价性/范围控制 | 抽取语义微差、fixture patch 目标失效、循环导入 |

每个 reviewer 必须给出 ✅/⚠️(级别+位置+修复)/结论(YES/YES-WITH-FIXES/NO)。HIGH 项全部修复后才实施。

### 3. TDD 逐任务实施（串行）

- 每任务：写失败测试 → 确认红 → 最小实现 → 确认绿 → 全量回归 → 提交
- 提交后立即更新计划文档状态（`### Task N: ... ✅`）并单独提交
- git 操作由主 agent 掌控，不并行派发实现 subagent（曾发生 git 索引踩踏）
- 提交前全量 `pytest` + `ruff check`；注意 pre-commit 的 ruff-format hook 会失败一次（文件被格式化），`git add` 后重提即可

### 4. 验证与收尾

- 最终 fresh 验证：pytest 全量 + ruff + `./scripts/start.sh dev backend` 冒烟（health/manifests/路由）
- 文档同步：grep 全仓库确认无旧库引用残留（`rg -n "motor" .` 等），归档文档（docs/superpowers/、.progress）豁免
- 分支推送 + PR

## 本项目已知坑（实测）

1. **patch 路径必须指向使用模块的命名空间**：`from pymongo import AsyncMongoClient` 后 `patch("pymongo.AsyncMongoClient")` 无效，必须 `patch("managers.db_manager.AsyncMongoClient")`
2. **async 迁移后 mock 必须 await 化**：`await mock.close()` 对 `MagicMock()` 抛 TypeError，用 `AsyncMock()`
3. **conftest mock 会掩盖回归**：`mock_db_manager` fixture 把方法全 mock 掉，真实行为变化（如 aggregate 未 await）测试抓不到——迁移类任务必须补直接调用 db_manager 的测试
4. **测试直接赋值 `_cache` 必须同时设 `_cache_time`**，否则 `_load_cache()` 走 `db_manager.find`
5. **既有测试可能被重构破坏**：行为变更（如逐条删→批量删）要 grep 所有断言旧 API 的测试并重写
6. **pre-commit ruff-format**：hook 修改文件导致 commit 失败时，重新 `git add` 后提交即可（文件已自动格式化）

## 测试基线

- 全量命令：`cd backend && python -m pytest -q`（当前 170 passed）
- 新增测试必须走 TDD 红绿循环，不写无失败证明的测试
