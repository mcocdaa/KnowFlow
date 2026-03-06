const axios = require('axios');

class DoubaoSearchPlugin {
  constructor() {
    this.metadata = {
      name: 'doubao-search',
      version: '1.0.0',
      description: '豆包文献检索插件',
      author: 'KnowFlow Team',
      type: 'search',
      main: 'main.js',
      icon: 'icon.png',
      dependencies: ['axios']
    };
    this.config = {};
    this.status = { status: 'idle' };
  }

  async init(config) {
    this.config = config;
    this.status = { status: 'idle', message: '插件已初始化' };
    console.log('DoubaoSearchPlugin initialized');
  }

  async execute(params) {
    return this.search(params);
  }

  async search(query) {
    const { query: searchQuery, filters, options } = query;
    this.status = { status: 'running', message: '正在检索文献' };

    try {
      const response = await axios.post(this.config.apiUrl, {
        model: 'doubao-pro',
        messages: [
          {
            role: 'system',
            content: '你是一个文献检索助手，根据用户提供的关键词，返回相关的学术文献信息，包括标题、摘要和链接。'
          },
          {
            role: 'user',
            content: `请检索关于"${searchQuery}"的学术文献，返回5篇相关文献，每篇文献包含标题、摘要和链接。`
          }
        ],
        temperature: 0.3
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 30000
      });

      const content = response.data.choices[0].message.content;
      const items = this.parseResponse(content);

      this.status = { status: 'idle', message: '检索完成' };
      return {
        items,
        total: items.length,
        time: response.config.headers['X-Response-Time'] || 0
      };
    } catch (error) {
      this.status = { status: 'error', message: error.message };
      console.error('Doubao search error:', error);
      return {
        items: [],
        total: 0,
        time: 0
      };
    }
  }

  parseResponse(content) {
    // 解析豆包返回的内容，提取文献信息
    const lines = content.split('\n');
    const items = [];
    let currentItem = null;

    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.')) {
        if (currentItem) {
          items.push(currentItem);
        }
        currentItem = {
          id: Date.now() + Math.random(),
          score: 1.0,
          data: {
            title: line.substring(3).trim(),
            abstract: '',
            link: ''
          }
        };
      } else if (currentItem) {
        if (line.startsWith('摘要:')) {
          currentItem.data.abstract = line.substring(3).trim();
        } else if (line.startsWith('链接:')) {
          currentItem.data.link = line.substring(3).trim();
        }
      }
    });

    if (currentItem) {
      items.push(currentItem);
    }

    return items;
  }

  async getSuggestions(query) {
    // 生成检索建议
    return [
      `${query} 最新研究`,
      `${query} 综述`,
      `${query} 应用`,
      `${query} 方法`,
      `${query} 挑战`
    ];
  }

  getStatus() {
    return this.status;
  }

  async destroy() {
    console.log('DoubaoSearchPlugin destroyed');
    this.status = { status: 'idle', message: '插件已销毁' };
  }
}

module.exports = DoubaoSearchPlugin;