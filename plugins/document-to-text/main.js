const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

class DocumentToTextPlugin {
  constructor() {
    this.metadata = {
      name: 'document-to-text',
      version: '1.0.0',
      description: '文献转文字插件',
      author: 'KnowFlow Team',
      type: 'knowledge_processing',
      main: 'main.js',
      icon: 'icon.png',
      dependencies: ['tesseract.js', 'pdf-parse']
    };
    this.config = {};
    this.status = { status: 'idle' };
  }

  async init(config) {
    this.config = config;
    this.status = { status: 'idle', message: '插件已初始化' };
    console.log('DocumentToTextPlugin initialized');
  }

  async execute(params) {
    return this.process(params.content, params.options);
  }

  async process(content, options = {}) {
    this.status = { status: 'running', message: '正在提取文本' };

    try {
      let text = '';
      const filePath = content;
      const fileExtension = path.extname(filePath).toLowerCase();

      if (fileExtension === '.pdf') {
        // 处理PDF文件
        text = await this.extractFromPdf(filePath);
      } else if (['.jpg', '.jpeg', '.png', '.bmp', '.gif'].includes(fileExtension)) {
        // 处理图片文件
        text = await this.extractFromImage(filePath);
      } else {
        throw new Error('不支持的文件类型');
      }

      this.status = { status: 'idle', message: '文本提取完成' };
      return {
        success: true,
        result: text,
        error: null
      };
    } catch (error) {
      this.status = { status: 'error', message: error.message };
      console.error('Document to text error:', error);
      return {
        success: false,
        result: '',
        error: error.message
      };
    }
  }

  async extractFromPdf(filePath) {
    // 从PDF文件提取文本
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  async extractFromImage(filePath) {
    // 从图片文件提取文本
    const result = await Tesseract.recognize(
      filePath,
      this.config.tesseractLang || 'eng+chi_sim',
      {
        logger: info => console.log(info)
      }
    );
    return result.data.text;
  }

  getSupportedTypes() {
    return ['pdf', 'jpg', 'jpeg', 'png', 'bmp', 'gif'];
  }

  getStatus() {
    return this.status;
  }

  async destroy() {
    console.log('DocumentToTextPlugin destroyed');
    this.status = { status: 'idle', message: '插件已销毁' };
  }
}

module.exports = DocumentToTextPlugin;