# KnowFlow OpenClaw Plugin 设计文档

## 1. Agent Tools 完整参数定义

### 1.1 knowflow_record

**名称**: `knowflow_record`

**描述**: 在 KnowFlow 中创建一条归档记录，自动设置 OpenClaw 相关属性

**参数 (JSON Schema)**:
```typescript
import { Type, Static } from '@sinclair/typebox';

const KnowflowRecordSchema = Type.Object({
  name: Type.String({ 
    description: '记录名称/标题',
    minLength: 1,
    maxLength: 200
  }),
  projectId: Type.String({ 
    description: '项目ID（必填），用于按项目隔离归档',
    minLength: 1
  }),
  type: Type.Union([
    Type.Literal('requirement'),
    Type.Literal('code'),
    Type.Literal('test'),
    Type.Literal('document'),
    Type.Literal('flow_record')
  ], { 
    description: '归档类型：requirement/code/test/document/flow_record',
    default: 'document'
  }),
  summary: Type.String({ 
    description: '一句话摘要（顶层折叠内容），AI只读摘要省Token',
    default: ''
  }),
  content: Type.String({ 
    description: '完整内容（支持Markdown）',
    default: ''
  }),
  agent: Type.String({ 
    description: '生成者：编码Agent/调试Agent/AutoFlow溯源',
    default: ''
  }),
  foldLevel: Type.Number({ 
    description: '折叠层级：1(顶层摘要)/2(中层)/3(完整内容)',
    default: 3,
    minimum: 1,
    maximum: 3
  }),
  flowId: Type.String({ 
    description: 'AutoFlow流程ID（可选），关联自动化流程',
    default: ''
  })
}, { 
  additionalProperties: false 
});

type KnowflowRecordParams = Static<typeof KnowflowRecordSchema>;
```

---

### 1.2 knowflow_search

**名称**: `knowflow_search`

**描述**: 在 KnowFlow 中搜索归档记录，支持关键词、项目ID、归档类型筛选

**参数 (JSON Schema)**:
```typescript
const KnowflowSearchSchema = Type.Object({
  query: Type.String({ 
    description: '搜索关键词，匹配名称、摘要、内容',
    minLength: 1,
    maxLength: 500
  }),
  projectId: Type.Optional(Type.String({ 
    description: '按项目ID筛选（可选）'
  })),
  type: Type.Optional(Type.Union([
    Type.Literal('requirement'),
    Type.Literal('code'),
    Type.Literal('test'),
    Type.Literal('document'),
    Type.Literal('flow_record')
  ], { 
    description: '按归档类型筛选（可选）'
  })),
  agent: Type.Optional(Type.String({ 
    description: '按生成者筛选（可选）'
  })),
  limit: Type.Number({ 
    description: '返回结果数量限制',
    default: 10,
    minimum: 1,
    maximum: 50
  })
}, { 
  additionalProperties: false 
});

type KnowflowSearchParams = Static<typeof KnowflowSearchSchema>;
```

---

### 1.3 knowflow_list

**名称**: `knowflow_list`

**描述**: 列出 KnowFlow 中最近的归档记录，支持按项目ID、归档类型筛选

**参数 (JSON Schema)**:
```typescript
const KnowflowListSchema = Type.Object({
  projectId: Type.Optional(Type.String({ 
    description: '按项目ID筛选（可选）'
  })),
  type: Type.Optional(Type.Union([
    Type.Literal('requirement'),
    Type.Literal('code'),
    Type.Literal('test'),
    Type.Literal('document'),
    Type.Literal('flow_record')
  ], { 
    description: '按归档类型筛选（可选）'
  })),
  limit: Type.Number({ 
    description: '返回结果数量限制',
    default: 10,
    minimum: 1,
    maximum: 100
  }),
  offset: Type.Number({ 
    description: '分页偏移量',
    default: 0,
    minimum: 0
  })
}, { 
  additionalProperties: false 
});

type KnowflowListParams = Static<typeof KnowflowListSchema>;
```

---

### 1.4 knowflow_get

**名称**: `knowflow_get`

**描述**: 获取 KnowFlow 中单条归档记录的完整信息

**参数 (JSON Schema)**:
```typescript
const KnowflowGetSchema = Type.Object({
  id: Type.String({ 
    description: '记录ID（必填）',
    minLength: 1
  }),
  foldLevel: Type.Optional(Type.Number({ 
    description: '返回内容的折叠层级：1(仅摘要)/2(中层)/3(完整内容)，不传则按记录设置返回',
    minimum: 1,
    maximum: 3
  }))
}, { 
  additionalProperties: false 
});

type KnowflowGetParams = Static<typeof KnowflowGetSchema>;
```

---

## 2. 每个 Tool 的 Execute 逻辑流程

### 2.1 knowflow_record

```
execute(params: KnowflowRecordParams):
  1. 从配置获取 baseUrl (默认 http://localhost:8000)
  2. 构造 Item 创建请求体:
     {
       name: params.name,
       content: params.content,
       type: "document"
     }
  3. POST {baseUrl}/api/v1/item
     - 失败: 返回错误信息
     - 成功: 获取 item.id
  4. 构造 OpenClaw 属性:
     {
       openclaw_project_id: params.projectId,
       openclaw_archive_type: params.type,
       openclaw_fold_level: params.foldLevel,
       openclaw_agent_source: params.agent,
       openclaw_summary: params.summary,
       openclaw_flow_id: params.flowId
     }
  5. PUT {baseUrl}/api/v1/plugins/knowflow_openclaw/items/{item.id}/openclaw
     - 失败: 记录警告（Item已创建但属性设置失败）
     - 成功: 继续
  6. 返回结果:
     {
       content: [{
         type: "text",
         text: JSON.stringify({
           success: true,
           itemId: item.id,
           name: params.name,
           projectId: params.projectId,
           type: params.type,
           url: `${baseUrl}/item/${item.id}`
         }, null, 2)
       }]
     }
```

---

### 2.2 knowflow_search

```
execute(params: KnowflowSearchParams):
  1. 从配置获取 baseUrl
  2. 构造查询参数:
     {
       q: params.query,
       ...(params.projectId && { project_id: params.projectId }),
       ...(params.type && { archive_type: params.type }),
       ...(params.agent && { agent_source: params.agent }),
       limit: params.limit
     }
  3. GET {baseUrl}/api/v1/item/search?{queryString}
     - 失败: 返回错误信息
     - 成功: 获取 items 数组
  4. 对每个 item，提取 OpenClaw 属性:
     - 从 item.attributes 中读取 openclaw_* 字段
  5. 返回结果:
     {
       content: [{
         type: "text",
         text: JSON.stringify({
           success: true,
           count: items.length,
           items: items.map(item => ({
             id: item.id,
             name: item.name,
             projectId: item.attributes?.openclaw_project_id,
             type: item.attributes?.openclaw_archive_type,
             summary: item.attributes?.openclaw_summary,
             agent: item.attributes?.openclaw_agent_source,
             createdAt: item.created_at,
             url: `${baseUrl}/item/${item.id}`
           }))
         }, null, 2)
       }]
     }
```

---

### 2.3 knowflow_list

```
execute(params: KnowflowListParams):
  1. 从配置获取 baseUrl
  2. 构造查询参数:
     {
       limit: params.limit,
       offset: params.offset,
       sort_by: "created_at",
       sort_order: "desc",
       ...(params.projectId && { 
         attributes: JSON.stringify({ openclaw_project_id: params.projectId })
       }),
       ...(params.type && { 
         attributes: JSON.stringify({ openclaw_archive_type: params.type })
       })
     }
  3. GET {baseUrl}/api/v1/item?{queryString}
     - 失败: 返回错误信息
     - 成功: 获取 items 数组
  4. 过滤：只保留包含 openclaw_project_id 属性的 items
  5. 返回结果:
     {
       content: [{
         type: "text",
         text: JSON.stringify({
           success: true,
           count: filteredItems.length,
           items: filteredItems.map(item => ({
             id: item.id,
             name: item.name,
             projectId: item.attributes?.openclaw_project_id,
             type: item.attributes?.openclaw_archive_type,
             summary: item.attributes?.openclaw_summary,
             agent: item.attributes?.openclaw_agent_source,
             foldLevel: item.attributes?.openclaw_fold_level,
             createdAt: item.created_at,
             updatedAt: item.updated_at,
             url: `${baseUrl}/item/${item.id}`
           }))
         }, null, 2)
       }]
     }
```

---

### 2.4 knowflow_get

```
execute(params: KnowflowGetParams):
  1. 从配置获取 baseUrl
  2. GET {baseUrl}/api/v1/item/{params.id}
     - 失败(404): 返回 "记录不存在" 错误
     - 失败(其他): 返回错误信息
     - 成功: 获取 item 详情
  3. 检查 item 是否包含 OpenClaw 属性
     - 若无 openclaw_project_id: 返回警告 "该记录不是OpenClaw归档记录"
  4. 根据 foldLevel 决定返回内容:
     - foldLevel=1: 只返回摘要和元数据
     - foldLevel=2: 返回摘要 + 前50%内容
     - foldLevel=3 或未指定: 返回完整内容
  5. 返回结果:
     {
       content: [{
         type: "text",
         text: JSON.stringify({
           success: true,
           item: {
             id: item.id,
             name: item.name,
             content: processedContent,  // 根据 foldLevel 处理
             projectId: item.attributes?.openclaw_project_id,
             type: item.attributes?.openclaw_archive_type,
             summary: item.attributes?.openclaw_summary,
             agent: item.attributes?.openclaw_agent_source,
             foldLevel: item.attributes?.openclaw_fold_level,
             flowId: item.attributes?.openclaw_flow_id,
             createdAt: item.created_at,
             updatedAt: item.updated_at,
             url: `${baseUrl}/item/${item.id}`
           }
         }, null, 2)
       }]
     }
```

---

## 3. openclaw.plugin.json 完整内容

```json
{
  "id": "knowflow",
  "name": "KnowFlow OpenClaw Plugin",
  "version": "1.0.0",
  "description": "KnowFlow 知识管理集成插件，提供文档归档、搜索、列表和获取功能",
  "author": "KnowFlow Team",
  "license": "MIT",
  "main": "dist/index.js",
  "entry": {
    "tools": "dist/tools.js"
  },
  "configSchema": {
    "type": "object",
    "properties": {
      "baseUrl": {
        "type": "string",
        "description": "KnowFlow API 基础地址",
        "default": "http://localhost:8000",
        "format": "uri"
      },
      "apiKey": {
        "type": "string",
        "description": "KnowFlow API 密钥（如需要）",
        "default": ""
      },
      "timeout": {
        "type": "number",
        "description": "API 请求超时时间（毫秒）",
        "default": 30000,
        "minimum": 5000,
        "maximum": 120000
      },
      "defaultProjectId": {
        "type": "string",
        "description": "默认项目ID（可选，用于快速归档）",
        "default": ""
      }
    },
    "required": ["baseUrl"],
    "additionalProperties": false
  },
  "permissions": [
    "network"
  ],
  "dependencies": {},
  "engines": {
    "openclaw": ">=1.0.0"
  }
}
```

---

## 4. SKILL.md 内容大纲

```markdown
# KnowFlow Skill

## 概述
KnowFlow 是一个知识管理归档系统，用于 Agent 工作成果的持久化存储和检索。

## 核心概念
- **Item**: 知识条目，即一条归档记录
- **Project ID**: 项目标识，用于隔离不同项目的归档
- **Archive Type**: 归档类型（requirement/code/test/document/flow_record）
- **Fold Level**: 折叠层级，控制内容展示粒度（1-3级）
- **Agent Source**: 记录生成者，用于溯源

## 可用工具

### knowflow_record
创建一条新的归档记录。

**使用场景**:
- 完成一个功能开发后归档代码说明
- 记录需求分析结果
- 保存测试用例和结果
- 归档流程执行记录

**示例**:
```json
{
  "name": "用户登录API实现",
  "projectId": "project-alpha",
  "type": "code",
  "summary": "实现了JWT认证的用户登录接口",
  "content": "# 用户登录API...",
  "agent": "backend_dev"
}
```

### knowflow_search
搜索归档记录。

**使用场景**:
- 查找之前实现过的类似功能
- 检索特定项目的所有文档
- 按类型筛选归档（如只看代码归档）

### knowflow_list
列出最近的归档记录。

**使用场景**:
- 查看当前项目的最近归档
- 浏览历史工作成果
- 快速定位最近的工作记录

### knowflow_get
获取单条归档记录的详情。

**使用场景**:
- 查看某条记录的完整内容
- 获取特定归档的详细信息
- 根据搜索结果进一步查看详情

## 最佳实践
1. **始终设置 projectId**: 确保归档按项目隔离
2. **写清晰的 summary**: 方便AI快速了解内容，省Token
3. **选择合适的 type**: 便于后续分类检索
4. **设置 agent 字段**: 便于溯源和问题排查
5. **合理使用 foldLevel**: 
   - Level 1: 仅摘要，适合快速浏览
   - Level 2: 中层详情，适合概览
   - Level 3: 完整内容，适合深度阅读

## 工作流示例

### 开发归档工作流
1. 开发完成后，使用 knowflow_record 归档
2. 设置 type 为 "code"，agent 为当前 Agent 名称
3. 填写清晰的 summary 描述改动要点
4. 完整内容写入 content（可包含代码、说明、注意事项）

### 知识检索工作流
1. 使用 knowflow_search 搜索相关关键词
2. 浏览返回的摘要列表
3. 使用 knowflow_get 查看感兴趣的记录详情
4. 根据 foldLevel 控制获取的内容粒度

## 故障排查
- **连接失败**: 检查 baseUrl 配置是否正确
- **记录创建失败**: 确认 projectId 不为空
- **搜索无结果**: 尝试不同的关键词组合
- **属性设置失败**: 检查归档类型是否在允许范围内
```

---

## 5. 插件目录结构

```
knowflow-openclaw-plugin/           # 插件根目录（git submodule 挂载点）
├── openclaw.plugin.json            # 插件清单文件
├── package.json                    # npm 包配置
├── tsconfig.json                   # TypeScript 配置
├── README.md                       # 插件说明文档
├── src/
│   ├── index.ts                    # 插件入口，注册所有 tools
│   ├── tools/
│   │   ├── record.ts               # knowflow_record 工具实现
│   │   ├── search.ts               # knowflow_search 工具实现
│   │   ├── list.ts                 # knowflow_list 工具实现
│   │   └── get.ts                  # knowflow_get 工具实现
│   ├── types/
│   │   ├── index.ts                # 共享类型定义
│   │   └── schemas.ts              # TypeBox Schema 定义
│   ├── api/
│   │   └── client.ts               # KnowFlow API 客户端封装
│   └── config/
│       └── index.ts                # 配置读取和验证
├── skills/
│   └── knowflow/
│       └── SKILL.md                # 内置 Skill 文档
└── dist/                           # 编译输出目录
    ├── index.js
    ├── tools.js
    └── ...
```

---

## 核心设计决策

### 1. 双步骤归档流程
- **决策**: knowflow_record 先创建 Item，再设置 OpenClaw 属性
- **理由**: 与 KnowFlow 后端 API 设计保持一致，Item 和属性是分开管理的
- **权衡**: 增加一次 HTTP 调用，但职责更清晰

### 2. 使用 TypeBox 进行 Schema 定义
- **决策**: 使用 @sinclair/typebox 定义参数 Schema
- **理由**: 提供运行时类型验证和静态类型推断，与 OpenClaw 插件规范兼容
- **替代方案**: 原生 JSON Schema（选择 TypeBox 是因为更好的开发体验）

### 3. 属性过滤策略
- **决策**: knowflow_list 只返回包含 openclaw_project_id 的 items
- **理由**: 确保返回的都是 OpenClaw 相关的归档记录，避免混杂其他数据
- **权衡**: 可能遗漏未正确设置属性的记录，但保证了数据纯净度

### 4. 折叠层级设计
- **决策**: 在 knowflow_get 中支持 foldLevel 参数覆盖
- **理由**: 允许调用者按需获取不同粒度的内容，灵活控制 Token 消耗
- **默认行为**: 不传 foldLevel 时按记录自身设置返回

### 5. 配置设计
- **决策**: baseUrl 为必填，其他为可选（带默认值）
- **理由**: 
  - baseUrl 是连接 KnowFlow 的必需信息
  - apiKey 预留认证扩展
  - defaultProjectId 提供便利，但不强制
  - timeout 防止长时间挂起

### 6. 错误处理策略
- **决策**: 所有错误都通过 execute 返回的 content 传递，不抛出异常
- **理由**: 符合 OpenClaw 插件规范，Agent 可以优雅处理错误
- **格式**: 返回 JSON 字符串，包含 success: false 和 error 信息

### 7. 返回值设计
- **决策**: 所有工具返回格式统一的 JSON 文本
- **理由**: 
  - 便于 Agent 解析和处理
  - 包含 URL 方便人工查看
  - 包含元数据便于后续操作

### 8. Git Submodule 部署
- **决策**: 插件作为独立仓库，通过 git submodule 挂载到 KnowFlow
- **理由**:
  - 插件可以独立版本管理
  - KnowFlow 可以选择性集成
  - 便于回滚（删除 submodule 即可）
- **挂载点**: `plugins/knowflow_openclaw/openclaw_plugin/`
