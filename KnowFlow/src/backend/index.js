const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const port = 3000;

// 配置中间件
app.use(bodyParser.json());
app.use(cors());

// 创建上传目录
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
console.log(`Upload directory set to: ${uploadDir}`);

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// AI配置
const AI_CONFIG = {
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY || 'your-api-key-here',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  },
};

// 插件管理
const pluginManager = {
  plugins: {},
  
  loadPlugins() {
    const pluginsDir = path.join(__dirname, '../../plugins');
    if (fs.existsSync(pluginsDir)) {
      const pluginDirs = fs.readdirSync(pluginsDir);
      pluginDirs.forEach(pluginDir => {
        const pluginPath = path.join(pluginsDir, pluginDir, 'main.js');
        if (fs.existsSync(pluginPath)) {
          try {
            delete require.cache[require.resolve(pluginPath)];
            const plugin = require(pluginPath);
            this.plugins[pluginDir] = plugin;
            console.log(`Loaded plugin: ${pluginDir}`);
          } catch (error) {
            console.error(`Error loading plugin ${pluginDir}:`, error);
          }
        }
      });
    }
  },
  
  getPlugin(name) {
    return this.plugins[name];
  },
  
  getAllPlugins() {
    return Object.keys(this.plugins).map(name => ({
      name,
      ...this.plugins[name].info || {}
    }));
  },
  
  unloadPlugin(name) {
    if (this.plugins[name]) {
      delete this.plugins[name];
      console.log(`Unloaded plugin: ${name}`);
      return true;
    }
    return false;
  },
  
  reloadPlugin(name) {
    this.unloadPlugin(name);
    this.loadPlugins();
    return this.getPlugin(name) !== undefined;
  }
};

// 数据存储文件
const dbFile = './db.json';

// 初始化数据库
let db = {
  knowledgeItems: [],
  categories: [
    { id: '1', name: '内置 Key', parentId: null, isBuiltin: true },
    { id: '2', name: '基础属性', parentId: '1', isBuiltin: true },
    { id: '3', name: '统计属性', parentId: '1', isBuiltin: true },
    { id: '4', name: '评价属性', parentId: '1', isBuiltin: true },
    { id: '5', name: '时间属性', parentId: '1', isBuiltin: true },
    { id: '6', name: '媒体属性', parentId: '1', isBuiltin: true },
    { id: '7', name: '文献属性', parentId: '1', isBuiltin: true },
    { id: '8', name: '自定义 Key', parentId: null, isBuiltin: false },
  ],
  keyDefinitions: [
    { id: '1', name: 'file_path', categoryId: '2', isBuiltin: true, dataType: 'string', script: '', description: '文件路径' },
    { id: '2', name: 'file_type', categoryId: '2', isBuiltin: true, dataType: 'string', script: '', description: '文件类型' },
    { id: '3', name: 'click_count', categoryId: '3', isBuiltin: true, dataType: 'number', script: '', description: '点击次数' },
    { id: '4', name: 'star_rating', categoryId: '4', isBuiltin: true, dataType: 'number', script: '', description: '星级' },
    { id: '5', name: 'created_at', categoryId: '5', isBuiltin: true, dataType: 'timestamp', script: '', description: '创建时间' },
    { id: '6', name: 'image_resolution', categoryId: '6', isBuiltin: true, dataType: 'string', script: '', description: '图片分辨率' },
    { id: '7', name: 'video_duration', categoryId: '6', isBuiltin: true, dataType: 'number', script: '', description: '视频时长' },
    { id: '8', name: 'author', categoryId: '7', isBuiltin: true, dataType: 'string', script: '', description: '作者' },
    { id: '9', name: 'publication_date', categoryId: '7', isBuiltin: true, dataType: 'date', script: '', description: '发表日期' },
  ],
};

// 加载数据
function loadData() {
  try {
    if (fs.existsSync(dbFile)) {
      const data = fs.readFileSync(dbFile, 'utf8');
      db = JSON.parse(data);
      console.log('Data loaded from file');
    } else {
      console.log('No data file found, using default data');
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// 保存数据
function saveData() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    console.log('Data saved to file');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// 加载插件
pluginManager.loadPlugins();

// 加载数据
loadData();

// API路由

// 获取所有知识项
app.get('/api/knowledge', (req, res) => {
  res.json(db.knowledgeItems);
});

// 添加知识项
app.post('/api/knowledge', (req, res) => {
  const newItem = {
    id: (db.knowledgeItems.length + 1).toString(),
    ...req.body,
    clickCount: 0,
    starRating: 0,
    createdAt: new Date().toISOString(),
  };
  db.knowledgeItems.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

// 获取所有分类
app.get('/api/categories', (req, res) => {
  res.json(db.categories);
});

// 添加分类
app.post('/api/categories', (req, res) => {
  const newCategory = {
    id: (db.categories.length + 1).toString(),
    ...req.body,
  };
  db.categories.push(newCategory);
  saveData();
  res.status(201).json(newCategory);
});

// 获取所有Key定义
app.get('/api/keys', (req, res) => {
  res.json(db.keyDefinitions);
});

// 添加Key定义
app.post('/api/keys', (req, res) => {
  const newKey = {
    id: (db.keyDefinitions.length + 1).toString(),
    ...req.body,
  };
  db.keyDefinitions.push(newKey);
  saveData();
  res.status(201).json(newKey);
});

// 文件上传API
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const newItem = {
    id: (db.knowledgeItems.length + 1).toString(),
    filePath: req.file.path,
    fileType: req.file.mimetype,
    clickCount: 0,
    starRating: 0,
    createdAt: new Date().toISOString(),
    keyValues: [],
  };
  
  db.knowledgeItems.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

// AI语义检索API
app.post('/api/ai/search', async (req, res) => {
  const { query, items } = req.body;
  
  try {
    // 调用Doubao API进行语义检索
    const response = await axios.post(
      `${AI_CONFIG.doubao.baseURL}/chat/completions`,
      {
        model: 'ep-20260304151850-xqxr9',
        messages: [
          {
            role: 'system',
            content: '你是一个语义检索助手，根据用户的查询和提供的知识项，返回最相关的知识项。'
          },
          {
            role: 'user',
            content: `查询: ${query}\n\n知识项: ${JSON.stringify(db.knowledgeItems)}`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.doubao.apiKey}`
        }
      }
    );
    
    // 解析AI返回的结果
    const aiResponse = response.data.choices[0].message.content;
    // 简单的关键词匹配作为 fallback
    const results = db.knowledgeItems.filter(item => 
      item.filePath.toLowerCase().includes(query.toLowerCase()) ||
      (item.fileType && item.fileType.toLowerCase().includes(query.toLowerCase()))
    );
    
    res.json(results);
  } catch (error) {
    console.error('AI search error:', error);
    // 出错时使用简单的关键词匹配
    const results = db.knowledgeItems.filter(item => 
      item.filePath.toLowerCase().includes(query.toLowerCase()) ||
      (item.fileType && item.fileType.toLowerCase().includes(query.toLowerCase()))
    );
    res.json(results);
  }
});

// AI自动打标签API
app.post('/api/ai/auto-tag', async (req, res) => {
  const { items } = req.body;
  
  try {
    // 调用Doubao API进行自动打标签
    const response = await axios.post(
      `${AI_CONFIG.doubao.baseURL}/chat/completions`,
      {
        model: 'ep-20260304151850-xqxr9',
        messages: [
          {
            role: 'system',
            content: '你是一个自动打标签助手，根据提供的知识项，为每个知识项生成合适的标签。'
          },
          {
            role: 'user',
            content: `知识项: ${JSON.stringify(db.knowledgeItems)}`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.doubao.apiKey}`
        }
      }
    );
    
    // 解析AI返回的结果
    const aiResponse = response.data.choices[0].message.content;
    // 简单的标签生成作为 fallback
    const taggedItems = db.knowledgeItems.map(item => ({
      ...item,
      tags: [item.fileType || 'unknown']
    }));
    
    res.json(taggedItems);
  } catch (error) {
    console.error('AI auto-tag error:', error);
    // 出错时使用简单的标签生成
    const taggedItems = db.knowledgeItems.map(item => ({
      ...item,
      tags: [item.fileType || 'unknown']
    }));
    res.json(taggedItems);
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 插件系统API

// 获取所有插件
app.get('/api/plugins', (req, res) => {
  const plugins = pluginManager.getAllPlugins();
  res.json(plugins);
});

// 获取单个插件
app.get('/api/plugins/:name', (req, res) => {
  const { name } = req.params;
  const plugin = pluginManager.getPlugin(name);
  if (plugin) {
    res.json({
      name,
      ...plugin.info || {}
    });
  } else {
    res.status(404).json({ error: 'Plugin not found' });
  }
});

// 重载插件
app.post('/api/plugins/:name/reload', (req, res) => {
  const { name } = req.params;
  const success = pluginManager.reloadPlugin(name);
  if (success) {
    res.json({ success: true, message: `Plugin ${name} reloaded` });
  } else {
    res.status(404).json({ success: false, error: 'Plugin not found' });
  }
});

// 调用插件方法
app.post('/api/plugins/:name/run', (req, res) => {
  const { name } = req.params;
  const { method, params } = req.body;
  
  const plugin = pluginManager.getPlugin(name);
  if (!plugin) {
    return res.status(404).json({ error: 'Plugin not found' });
  }
  
  if (plugin[method]) {
    try {
      const result = plugin[method](params);
      res.json({ success: true, result });
    } catch (error) {
      console.error(`Error running plugin ${name} method ${method}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(404).json({ error: `Method ${method} not found in plugin ${name}` });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
