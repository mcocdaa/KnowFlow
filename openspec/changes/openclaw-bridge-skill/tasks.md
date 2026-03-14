# Tasks: OpenClaw Bridge Skill

## Task 1: 创建技能目录结构
- [x] 创建 `~/.openclaw/skills/knowflow/` 目录
- [x] 创建 `~/.openclaw/skills/knowflow/scripts/` 目录
- **负责人**: 后端虾 (backend_dev)
- **实际时间**: 2 分钟 ✅

## Task 2: 编写 kf-record.ps1 脚本
- [x] 实现参数解析（Name, ProjectId, Type, Summary, Content, Agent, FoldLevel, FlowId, BaseUrl）
- [x] 实现 POST /api/v1/item 创建知识项
- [x] 实现 PUT /api/v1/plugins/knowflow_openclaw/items/{id}/openclaw 设置属性
- [x] 实现错误处理和输出格式化
- [x] 测试：创建一条测试文档并验证
- **负责人**: 后端虾 (backend_dev) → 总管虾修正 (coord)
- **实际时间**: 25 分钟 ✅
- **备注**: 后端虾初版有 PowerShell 语法问题（中文编码+hashtable管道），总管虾重写修正

## Task 3: 编写 kf-search.ps1 脚本
- [x] 实现参数解析（Query, Key, KeyValue, Sort, Page, PageSize, BaseUrl）
- [x] 实现 GET /api/v1/item/search 调用
- [x] 实现结果格式化（简洁输出）
- [x] 测试：搜索文档
- **负责人**: 后端虾 (backend_dev) → 总管虾修正 (coord)
- **实际时间**: 15 分钟 ✅
- **备注**: 修正了结果解析路径（entry.item.id 而非 entry.id）

## Task 4: 编写 kf-list.ps1 脚本
- [x] 实现参数解析（Limit, BaseUrl）
- [x] 实现 GET /api/v1/item/search 调用（按最近排序）
- [x] 实现结果格式化
- [x] 测试：列出文档
- **负责人**: 后端虾 (backend_dev) → 总管虾修正 (coord)
- **实际时间**: 10 分钟 ✅

## Task 5: 编写 kf-get.ps1 脚本
- [x] 实现参数解析（Id, BaseUrl）
- [x] 实现 GET /api/v1/item/{id} 调用
- [x] 实现结果格式化（含 OpenClaw 属性）
- [x] 测试：获取文档详情
- **负责人**: 后端虾 (backend_dev) → 总管虾修正 (coord)
- **实际时间**: 10 分钟 ✅

## Task 6: 编写 SKILL.md 技能文件
- [x] 编写技能描述和触发条件
- [x] 编写快速开始示例
- [x] 编写脚本参考文档
- [x] 编写直接 API 调用示例
- [x] 编写数据模型说明
- [x] 编写配置说明
- [x] 修正 archive_type 枚举值（requirement/code/test/document/flow_record）
- [x] 修正插件 API URL 前缀（/api/v1/plugins/knowflow_openclaw/）
- **负责人**: 后端虾 (backend_dev) → 总管虾修正 (coord)
- **实际时间**: 20 分钟 ✅

## Task 7: 集成测试 + Bug 修复
- [x] 端到端测试：记录 → 搜索 → 查看 → 列表
- [x] 验证 OpenClaw 属性正确设置
- [x] 发现并修复 KnowFlow 路由顺序 Bug（/item/search 被 /item/{item_id} 拦截）
- [x] 清理测试数据
- **负责人**: 总管虾 (coord)
- **实际时间**: 20 分钟 ✅
- **备注**: 发现 FastAPI 路由顺序问题，修复后 push 到远程 openclaw 分支

## Task 8: 提交代码
- [x] git commit 到 openclaw 分支
- [x] git push 到远程 origin/openclaw 分支
- [x] WSL 仓库切换到 openclaw 分支
- [ ] 更新 MEMORY.md 记录
- [ ] OpenSpec archive
- **负责人**: 总管虾 (coord)
