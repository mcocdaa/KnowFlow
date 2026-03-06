const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SciHubDownloadPlugin {
  constructor() {
    this.metadata = {
      name: 'sci-hub-download',
      version: '1.0.0',
      description: 'Sci-Hub文献获取插件',
      author: 'KnowFlow Team',
      type: 'knowledge_source',
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
    console.log('SciHubDownloadPlugin initialized');
  }

  async execute(params) {
    return this.import(params);
  }

  async import(params) {
    const { source, options } = params;
    this.status = { status: 'running', message: '正在从Sci-Hub获取文献' };

    try {
      // 提示版权风险
      console.warn('警告：使用Sci-Hub可能涉及版权问题，请确保仅用于个人学习和研究目的。');

      // 构建Sci-Hub URL
      const sciHubUrl = `${this.config.baseUrl}/${encodeURIComponent(source)}`;
      
      // 获取页面内容
      const response = await axios.get(sciHubUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // 提取PDF链接
      const pdfUrl = this.extractPdfUrl(response.data);
      
      if (!pdfUrl) {
        throw new Error('未找到PDF链接');
      }

      // 下载PDF
      const pdfData = await this.downloadPdf(pdfUrl);
      
      // 保存PDF文件
      const fileName = this.generateFileName(source);
      const filePath = path.join('/tmp', fileName);
      fs.writeFileSync(filePath, pdfData);

      const items = [{
        filePath: filePath,
        fileType: 'pdf',
        createdAt: new Date().toISOString(),
        clickCount: 0,
        starRating: 0,
        keyValues: [
          { keyId: '1', value: filePath }, // file_path
          { keyId: '2', value: 'pdf' }, // file_type
          { keyId: '5', value: new Date().toISOString() }, // created_at
          { keyId: '3', value: '0' }, // click_count
          { keyId: '4', value: '0' }, // star_rating
          { keyId: '8', value: source } // 自定义key: doi/title
        ]
      }];

      this.status = { status: 'idle', message: '文献获取完成' };
      return {
        success: true,
        items,
        error: null
      };
    } catch (error) {
      this.status = { status: 'error', message: error.message };
      console.error('Sci-Hub download error:', error);
      return {
        success: false,
        items: [],
        error: error.message
      };
    }
  }

  extractPdfUrl(html) {
    // 从HTML中提取PDF链接
    const pdfRegex = /<iframe[^>]+src="([^"]+\.pdf)"/;
    const match = html.match(pdfRegex);
    if (match) {
      let pdfUrl = match[1];
      if (!pdfUrl.startsWith('http')) {
        pdfUrl = this.config.baseUrl + pdfUrl;
      }
      return pdfUrl;
    }
    return null;
  }

  async downloadPdf(url) {
    // 下载PDF文件
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000
    });
    return response.data;
  }

  generateFileName(source) {
    // 生成文件名
    const timestamp = Date.now();
    let fileName = `sci-hub-${timestamp}.pdf`;
    
    // 如果source是DOI，提取最后一部分作为文件名
    if (source.includes('/')) {
      const parts = source.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        fileName = `${lastPart}-${timestamp}.pdf`;
      }
    }
    
    return fileName;
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
    console.log('SciHubDownloadPlugin destroyed');
    this.status = { status: 'idle', message: '插件已销毁' };
  }
}

module.exports = SciHubDownloadPlugin;