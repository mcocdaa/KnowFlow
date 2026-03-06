# KnowFlow 插件系统架构设计

## 1. 插件系统概述

### 1.1 设计目标
- **动态加载/卸载**：插件可以在运行时动态加载和卸载，无需重启应用
- **标准化接口**：定义统一的插件接口，确保插件的兼容性和可扩展性
- **类型分类**：支持多种类型的插件，包括知识源导入、检索、知识处理等
- **安全隔离**：插件运行在隔离环境中，避免影响主应用

### 1.2 插件类型

| 插件类型 | 描述 | 示例 |
|---------|------|------|
| 知识源导入插件 | 从外部源导入知识到知识库 | 远程网页抓取、API数据导入 |
| 检索插件 | 提供高级检索功能 | AI语义检索、多维度检索 |
| 知识处理插件 | 对知识内容进行处理 | 文献转文字、翻译、总结 |
| 可视化插件 | 提供数据可视化功能 | 知识图谱、统计图表 |
| 自动化插件 | 自动执行特定任务 | 定时更新、自动分类 |

## 2. 插件系统架构

### 2.1 核心组件

#### 2.1.1 插件管理器 (PluginManager)
- 负责插件的发现、加载、初始化和卸载
- 维护插件注册表
- 处理插件的生命周期管理
- 提供插件间通信机制

#### 2.1.2 插件加载器 (PluginLoader)
- 从插件目录加载插件
- 验证插件的合法性和完整性
- 处理插件依赖关系
- 提供插件热加载功能

#### 2.1.3 插件接口定义 (PluginInterface)
- 定义标准化的插件接口
- 提供插件元数据规范
- 定义插件生命周期方法
- 提供插件配置方案

#### 2.1.4 插件运行时 (PluginRuntime)
- 为插件提供运行环境
- 管理插件的资源使用
- 实现插件隔离机制
- 提供插件API访问控制

### 2.2 目录结构

```
plugins/
├── plugin1/
│   ├── package.json       # 插件元数据
│   ├── main.js            # 插件主入口
│   ├── manifest.json      # 插件配置
│   └── icon.png           # 插件图标
├── plugin2/
│   └── ...
└── plugin_config.json     # 插件系统配置
```

### 2.3 插件元数据结构

```json
{
  "name": "web-scraper",
  "version": "1.0.0",
  "description": "网页数据抓取插件",
  "author": "KnowFlow Team",
  "type": "knowledge_source",
  "main": "main.js",
  "icon": "icon.png",
  "dependencies": [],
  "config": {
    "timeout": 30000,
    "userAgent": "Mozilla/5.0"
  }
}
```

## 3. 插件接口标准

### 3.1 基础接口

```typescript
interface Plugin {
  // 插件元数据
  metadata: PluginMetadata;
  
  // 初始化插件
  init(config: PluginConfig): Promise<void>;
  
  // 执行插件功能
  execute(params: any): Promise<any>;
  
  // 清理资源
  destroy(): Promise<void>;
  
  // 获取插件状态
  getStatus(): PluginStatus;
}

interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  main: string;
  icon?: string;
  dependencies?: string[];
}

interface PluginConfig {
  [key: string]: any;
}

interface PluginStatus {
  status: 'idle' | 'running' | 'error';
  message?: string;
}

type PluginType = 'knowledge_source' | 'search' | 'knowledge_processing' | 'visualization' | 'automation';
```

### 3.2 知识源导入插件接口

```typescript
interface KnowledgeSourcePlugin extends Plugin {
  // 导入知识
  import(params: ImportParams): Promise<ImportResult>;
  
  // 获取导入状态
  getImportStatus(): ImportStatus;
}

interface ImportParams {
  source: string; // 数据源地址
  options?: {
    [key: string]: any;
  };
}

interface ImportResult {
  success: boolean;
  items: KnowledgeItem[];
  error?: string;
}

interface ImportStatus {
  progress: number; // 0-100
  status: 'pending' | 'importing' | 'completed' | 'error';
  message?: string;
}
```

### 3.3 检索插件接口

```typescript
interface SearchPlugin extends Plugin {
  // 执行检索
  search(query: SearchQuery): Promise<SearchResult>;
  
  // 获取检索建议
  getSuggestions(query: string): Promise<string[]>;
}

interface SearchQuery {
  query: string;
  filters?: {
    [key: string]: any;
  };
  options?: {
    [key: string]: any;
  };
}

interface SearchResult {
  items: SearchItem[];
  total: number;
  time: number; // 检索耗时(ms)
}

interface SearchItem {
  id: string;
  score: number;
  data: any;
}
```

### 3.4 知识处理插件接口

```typescript
interface KnowledgeProcessingPlugin extends Plugin {
  // 处理知识内容
  process(content: any, options?: ProcessOptions): Promise<ProcessResult>;
  
  // 获取支持的处理类型
  getSupportedTypes(): string[];
}

interface ProcessOptions {
  [key: string]: any;
}

interface ProcessResult {
  success: boolean;
  result: any;
  error?: string;
}
```

## 4. 插件生命周期

### 4.1 加载阶段
1. 插件管理器扫描插件目录
2. 读取插件元数据
3. 验证插件合法性
4. 加载插件代码
5. 初始化插件实例

### 4.2 运行阶段
1. 插件接收执行请求
2. 执行插件逻辑
3. 返回执行结果
4. 处理错误和异常

### 4.3 卸载阶段
1. 停止插件执行
2. 清理插件资源
3. 从插件注册表中移除
4. 释放内存

## 5. 插件通信机制

### 5.1 事件系统
- 插件可以发布和订阅事件
- 支持自定义事件类型
- 事件传递支持参数

### 5.2 API调用
- 插件可以调用主应用提供的API
- 主应用可以调用插件提供的API
- API调用支持异步操作

### 5.3 数据共享
- 插件间可以共享数据
- 支持数据缓存机制
- 提供数据访问控制

## 6. 插件安全

### 6.1 隔离机制
- 插件运行在沙箱环境中
- 限制插件的系统权限
- 监控插件的资源使用

### 6.2 权限控制
- 插件需要声明所需权限
- 主应用审核插件权限
- 用户可以管理插件权限

### 6.3 代码验证
- 插件代码签名验证
- 插件完整性检查
- 恶意代码检测

## 7. 插件开发流程

### 7.1 开发步骤
1. 创建插件目录结构
2. 编写插件元数据
3. 实现插件接口
4. 测试插件功能
5. 打包发布插件

### 7.2 开发工具
- 插件模板
- 开发环境配置
- 测试框架
- 打包工具

### 7.3 发布流程
- 插件验证
- 版本管理
- 发布平台
- 更新机制

## 8. 示例插件：远程网页数据导入

### 8.1 插件元数据

```json
{
  "name": "web-scraper",
  "version": "1.0.0",
  "description": "远程网页数据导入插件",
  "author": "KnowFlow Team",
  "type": "knowledge_source",
  "main": "main.js",
  "icon": "icon.png",
  "dependencies": ["axios", "cheerio"]
}
```

### 8.2 插件实现

```javascript
// main.js
const axios = require('axios');
const cheerio = require('cheerio');

class WebScraperPlugin {
  constructor() {
    this.metadata = {
      name: 'web-scraper',
      version: '1.0.0',
      description: '远程网页数据导入插件',
      author: 'KnowFlow Team',
      type: 'knowledge_source',
      main: 'main.js',
      icon: 'icon.png',
      dependencies: ['axios', 'cheerio']
    };
    this.config = {};
    this.status = { status: 'idle' };
  }

  async init(config) {
    this.config = config;
    this.status = { status: 'idle', message: '插件已初始化' };
    console.log('WebScraperPlugin initialized');
  }

  async execute(params) {
    return this.import(params);
  }

  async import(params) {
    const { source, options } = params;
    this.status = { status: 'running', message: '正在抓取网页数据' };

    try {
      const response = await axios.get(source, {
        timeout: this.config.timeout || 30000,
        headers: {
          'User-Agent': this.config.userAgent || 'Mozilla/5.0'
        }
      });

      const $ = cheerio.load(response.data);
      const items = [];

      // 示例：抓取黄金价格
      if (source.includes('goldprice')) {
        const price = $('.gold-price').text();
        const date = new Date().toISOString();

        items.push({
          filePath: `gold-price-${date}.txt`,
          fileType: 'text',
          createdAt: date,
          clickCount: 0,
          starRating: 0,
          keyValues: [
            { keyId: '1', value: `gold-price-${date}.txt` }, // file_path
            { keyId: '2', value: 'text' }, // file_type
            { keyId: '5', value: date }, // created_at
            { keyId: '3', value: '0' }, // click_count
            { keyId: '4', value: '0' }, // star_rating
            { keyId: '9', value: price } // 自定义key: price
          ]
        });
      }

      this.status = { status: 'idle', message: '抓取完成' };
      return {
        success: true,
        items,
        error: null
      };
    } catch (error) {
      this.status = { status: 'error', message: error.message };
      return {
        success: false,
        items: [],
        error: error.message
      };
    }
  }

  getImportStatus() {
    return {
      progress: this.status.status === 'running' ? 50 : 100,
      status: this.status.status === 'running' ? 'importing' : 'completed',
      message: this.status.message
    };
  }

  getStatus() {
    return this.status;
  }

  async destroy() {
    console.log('WebScraperPlugin destroyed');
    this.status = { status: 'idle', message: '插件已销毁' };
  }
}

module.exports = WebScraperPlugin;
```

### 8.3 插件配置

```json
{
  "timeout": 30000,
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}
```

## 9. 插件系统实现要点

### 9.1 技术选型
- **前端**：React + TypeScript
- **后端**：Node.js + Express
- **插件加载**：Dynamic import + VM2 (沙箱)
- **通信**：EventEmitter + WebSocket
- **存储**：SQLite + JSON

### 9.2 性能优化
- 插件懒加载
- 缓存插件实例
- 并行执行插件
- 资源使用限制

### 9.3 可扩展性
- 插件类型可扩展
- 接口版本管理
- 插件依赖管理
- 国际化支持

## 10. 未来发展

### 10.1 插件市场
- 官方插件市场
- 第三方插件发布
- 插件评分和评论
- 插件自动更新

### 10.2 高级功能
- 插件组合
- 插件工作流
- AI辅助插件开发
- 插件模板系统

### 10.3 安全性增强
- 插件代码分析
- 行为监控
- 权限细粒度控制
- 安全审计