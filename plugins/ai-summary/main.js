const axios = require('axios');

class AISummaryPlugin {
  constructor() {
    this.metadata = {
      name: 'ai-summary',
      version: '1.0.0',
      description: 'AI文献总结插件',
      author: 'KnowFlow Team',
      type: 'knowledge_processing',
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
    console.log('AISummaryPlugin initialized');
  }

  async execute(params) {
    return this.process(params.content, params.options);
  }

  async process(content, options = {}) {
    this.status = { status: 'running', message: '正在生成总结' };

    try {
      // 调用豆包API生成总结
      const summary = await this.generateSummary(content);

      // 构建返回结果，包含总结文本和建议的key-value
      const result = {
        summary: summary,
        keyValue: {
          key: 'AI 总结',
          value: summary
        }
      };

      this.status = { status: 'idle', message: '总结生成完成' };
      return {
        success: true,
        result: result,
        error: null
      };
    } catch (error) {
      this.status = { status: 'error', message: error.message };
      console.error('AI summary error:', error);
      return {
        success: false,
        result: '',
        error: error.message
      };
    }
  }

  async generateSummary(text) {
    // 调用豆包API生成总结
    const response = await axios.post(this.config.apiUrl, {
      model: 'doubao-pro',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的文献总结助手，根据提供的文本，生成300字以内的核心观点总结，保持内容的准确性和专业性。`
        },
        {
          role: 'user',
          content: `请对以下文本生成300字以内的核心观点总结：\n${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: this.config.summaryLength || 300
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      timeout: 60000
    });

    return response.data.choices[0].message.content;
  }

  getSupportedTypes() {
    return ['text'];
  }

  getStatus() {
    return this.status;
  }

  async destroy() {
    console.log('AISummaryPlugin destroyed');
    this.status = { status: 'idle', message: '插件已销毁' };
  }
}

module.exports = AISummaryPlugin;