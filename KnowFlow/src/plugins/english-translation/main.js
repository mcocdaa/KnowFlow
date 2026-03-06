const axios = require('axios');

class EnglishTranslationPlugin {
  constructor() {
    this.metadata = {
      name: 'english-translation',
      version: '1.0.0',
      description: '英文文献翻译插件',
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
    console.log('EnglishTranslationPlugin initialized');
  }

  async execute(params) {
    return this.process(params.content, params.options);
  }

  async process(content, options = {}) {
    this.status = { status: 'running', message: '正在翻译文本' };

    try {
      // 检查文本是否为英文
      const isEnglish = this.isEnglish(content);
      if (!isEnglish) {
        return {
          success: true,
          result: content,
          error: null
        };
      }

      // 调用豆包API进行翻译
      const translatedText = await this.translateWithDoubao(content);

      this.status = { status: 'idle', message: '翻译完成' };
      return {
        success: true,
        result: translatedText,
        error: null
      };
    } catch (error) {
      this.status = { status: 'error', message: error.message };
      console.error('English translation error:', error);
      return {
        success: false,
        result: '',
        error: error.message
      };
    }
  }

  isEnglish(text) {
    // 简单判断文本是否为英文
    const englishRegex = /^[A-Za-z0-9\s.,!?'"()\[\]{}:;\-]+$/;
    return englishRegex.test(text);
  }

  async translateWithDoubao(text) {
    // 调用豆包API进行翻译
    const response = await axios.post(this.config.apiUrl, {
      model: 'doubao-pro',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的翻译助手，将英文文本翻译成中文，保持专业术语的准确性。'
        },
        {
          role: 'user',
          content: `请将以下英文文本翻译成中文：\n${text}`
        }
      ],
      temperature: 0.3
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
    console.log('EnglishTranslationPlugin destroyed');
    this.status = { status: 'idle', message: '插件已销毁' };
  }
}

module.exports = EnglishTranslationPlugin;