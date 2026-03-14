# Tasks: OpenClaw Bridge Skill

## Task 1: 创建技能目录结构
- [x] 创建 `~/.openclaw/skills/knowflow/` 目录
- [x] 创建 `~/.openclaw/skills/knowflow/scripts/` 目录
- **负责人**: 后端虾 (backend_dev)
- **预计时间**: 5 分钟

## Task 2: 编写 kf-record.ps1 脚本
- [x] 实现参数解析（Name, ProjectId, Type, Summary, Content, Agent, FoldLevel, FlowId, BaseUrl）
- [x] 实现 POST /api/v1/item 创建知识项
- [x] 实现 PUT /api/v1/items/{id}/openclaw 设置属性
- [x] 实现错误处理和输出格式化
- [ ] 测试：创建一条测试文档并验证
- **负责人**: 后端虾 (backend_dev)
- **预计时间**: 20 分钟

## Task 3: 编写 kf-search.ps1 脚本
- [x] 实现参数解析（Query, Key, KeyValue, Sort, Page, PageSize, BaseUrl）
- [x] 实现 GET /api/v1/item/search 调用
- [x] 实现结果格式化（简洁输出）
- [ ] 测试：搜索 Task 2 创建的文档
- **负责人**: 后端虾 (backend_dev)
- **预计时间**: 15 分钟

## Task 4: 编写 kf-list.ps1 脚本
- [x] 实现参数解析（Limit, BaseUrl）
- [x] 实现 GET /api/v1/item 调用
- [x] 实现结果格式化
- [ ] 测试：列出文档
- **负责人**: 后端虾 (backend_dev)
- **预计时间**: 10 分钟

## Task 5: 编写 kf-get.ps1 脚本
- [x] 实现参数解析（Id, BaseUrl）
- [x] 实现 GET /api/v1/item/{id} 调用
- [x] 实现结果格式化（含 OpenClaw 属性）
- [ ] 测试：获取 Task 2 创建的文档详情
- **负责人**: 后端虾 (backend_dev)
- **预计时间**: 10 分钟

## Task 6: 编写 SKILL.md 技能文件
- [x] 编写技能描述和触发条件
- [x] 编写快速开始示例
- [x] 编写脚本参考文档
- [x] 编写直接 API 调用示例
- [x] 编写数据模型说明
- [x] 编写配置说明
- **负责人**: 后端虾 (backend_dev)
- **预计时间**: 15 分钟

## Task 7: 集成测试
- [ ] 端到端测试：记录 → 搜索 → 查看 → 列表
- [ ] 验证 OpenClaw 属性正确设置
- [ ] 验证错误处理（服务不可达、参数缺失）
- [ ] 清理测试数据
- **负责人**: 兜底虾 (qa_ops)
- **预计时间**: 15 分钟

## Task 8: 提交代码
- [ ] git add + commit 到 openclaw 分支
- [ ] 更新 MEMORY.md 记录
- [ ] OpenSpec archive
- **负责人**: 总管虾 (coord)
- **预计时间**: 5 分钟
