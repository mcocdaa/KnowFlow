# Design: OpenClaw Bridge Skill

## 架构

```
~/.openclaw/skills/knowflow/
├── SKILL.md              # 技能说明文件（Agent 阅读）
└── scripts/
    ├── kf-record.ps1     # 记录文档（创建 + 设置属性）
    ├── kf-search.ps1     # 搜索文档
    ├── kf-list.ps1       # 列出文档
    └── kf-get.ps1        # 获取文档详情
```

## SKILL.md 设计

### 触发条件
- 用户提到 KnowFlow、知识记录、文档归档
- Agent 需要记录项目文档、错误日志、学习记录
- Agent 需要查询历史文档

### 内容结构
1. **概述** — KnowFlow 是什么，桥接工具做什么
2. **快速开始** — 最常用的操作示例
3. **脚本参考** — 每个脚本的参数说明
4. **直接 API 调用** — 无脚本时的 HTTP 示例
5. **数据模型** — OpenClaw 属性字段说明
6. **配置** — KnowFlow 服务地址等

## 脚本设计

### kf-record.ps1
```
参数:
  -Name        [必填] 文档名称
  -ProjectId   [必填] 项目ID
  -Type        [可选] 归档类型，默认 "document"
  -Summary     [可选] 一句话摘要
  -Content     [可选] 文档内容（写入 file_path 字段）
  -Agent       [可选] 生成者 Agent ID
  -FoldLevel   [可选] 折叠层级，默认 3
  -FlowId      [可选] AutoFlow 流程ID
  -BaseUrl     [可选] KnowFlow 地址，默认 http://localhost:3000

流程:
  1. POST /api/v1/item 创建知识项
  2. PUT /api/v1/items/{id}/openclaw 设置 OpenClaw 属性
  3. 输出 JSON 结果（含 item ID）
```

### kf-search.ps1
```
参数:
  -Query       [可选] 搜索关键词
  -Key         [可选] 按指定 Key 筛选
  -KeyValue    [可选] Key 的值
  -Sort        [可选] 排序方式，默认 "recent"
  -Page        [可选] 页码，默认 1
  -PageSize    [可选] 每页条数，默认 20
  -BaseUrl     [可选] KnowFlow 地址

输出: JSON 数组，每项含 id, name, summary, created_at
```

### kf-list.ps1
```
参数:
  -Limit       [可选] 返回条数，默认 20
  -BaseUrl     [可选] KnowFlow 地址

输出: JSON 数组，简洁格式
```

### kf-get.ps1
```
参数:
  -Id          [必填] 知识项 ID
  -BaseUrl     [可选] KnowFlow 地址

输出: JSON 对象，完整属性
```

## KnowFlow 后端评估

当前 v1.0.3 API 已满足桥接需求：
- CRUD 接口完整
- 搜索接口支持关键词 + Key 筛选
- OpenClaw 插件提供专属属性管理

**结论：无需修改 KnowFlow 后端。**

## 错误处理
- 脚本检查 HTTP 状态码，非 2xx 输出错误信息
- KnowFlow 服务不可达时给出明确提示
- 参数校验在脚本层完成
