const axios = require('axios');

class AIManager {
  constructor(config) {
    this.config = config || {
      apiKey: 'your-api-key',
      apiUrl: 'https://api.doubao.com/v1/chat/completions',
      model: 'doubao-pro'
    };
  }

  // AI自动打标签
  async autoTag(filePath, content) {
    try {
      // 优化token使用：只传递关键信息
      const optimizedContent = this.optimizeContent(content);
      
      const response = await axios.post(this.config.apiUrl, {
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: '你是一个智能标签生成器，根据文件内容分析并生成相关的标签(key-value对)，包括作者、年份、研究领域等。'
          },
          {
            role: 'user',
            content: `请分析以下文件内容，生成相关的标签(key-value对)：\n文件路径：${filePath}\n内容：${optimizedContent}`
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

      const tags = this.parseTags(response.data.choices[0].message.content);
      return tags;
    } catch (error) {
      console.error('AI auto tag error:', error);
      return [];
    }
  }

  // AI语义检索
  async semanticSearch(query, knowledgeItems) {
    try {
      // 优化token使用：只传递关键key-value
      const optimizedItems = knowledgeItems.map(item => ({
        id: item.id,
        filePath: item.filePath,
        fileType: item.fileType,
        keyValues: item.keyValues.filter(kv => {
          const keyName = this.getKeyName(kv.keyId);
          return ['author', 'title', 'abstract', 'AI 总结'].includes(keyName);
        })
      }));

      const response = await axios.post(this.config.apiUrl, {
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: '你是一个智能检索助手，根据用户的自然语言查询，从提供的知识项中找出最相关的内容。'
          },
          {
            role: 'user',
            content: `请根据用户查询"${query}"，从以下知识项中找出最相关的内容：\n${JSON.stringify(optimizedItems, null, 2)}`
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

      const results = this.parseSearchResults(response.data.choices[0].message.content, knowledgeItems);
      return results;
    } catch (error) {
      console.error('AI semantic search error:', error);
      return [];
    }
  }

  // 优化内容，减少token消耗
  optimizeContent(content) {
    // 截取前1000个字符，避免token超限
    if (content.length > 1000) {
      return content.substring(0, 1000) + '...';
    }
    return content;
  }

  // 解析标签
  parseTags(content) {
    // 解析AI返回的标签格式
    const tags = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(item => item.trim());
        if (key && value) {
          tags.push({ key, value });
        }
      }
    });
    
    return tags;
  }

  // 解析搜索结果
  parseSearchResults(content, knowledgeItems) {
    // 解析AI返回的搜索结果
    const results = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line.includes('id:')) {
        const idMatch = line.match(/id:\s*(\d+)/);
        if (idMatch) {
          const id = idMatch[1];
          const item = knowledgeItems.find(item => item.id === id);
          if (item) {
            results.push(item);
          }
        }
      }
    });
    
    return results;
  }

  // 根据keyId获取key名称
  getKeyName(keyId) {
    // 这里需要根据实际的key定义映射
    const keyMap = {
      '1': 'file_path',
      '2': 'file_type',
      '3': 'click_count',
      '4': 'star_rating',
      '5': 'created_at',
      '6': 'image_resolution',
      '7': 'video_duration',
      '8': 'author',
      '9': 'publication_date'
    };
    return keyMap[keyId] || keyId;
  }

  // 批量处理文件打标签
  async batchAutoTag(files) {
    const results = [];
    for (const file of files) {
      const tags = await this.autoTag(file.path, file.content);
      results.push({ file: file.path, tags });
    }
    return results;
  }
}

module.exports = AIManager;