const DoubaoSearchPlugin = require('../src/plugins/doubao-search/main');
const 波尔学术SearchPlugin = require('../src/plugins/波尔学术-search/main');
const SciHubDownloadPlugin = require('../src/plugins/sci-hub-download/main');
const DocumentToTextPlugin = require('../src/plugins/document-to-text/main');
const EnglishTranslationPlugin = require('../src/plugins/english-translation/main');
const AISummaryPlugin = require('../src/plugins/ai-summary/main');

describe('Plugins', () => {
  describe('Search Plugins', () => {
    test('DoubaoSearchPlugin should initialize correctly', () => {
      const plugin = new DoubaoSearchPlugin();
      expect(plugin.metadata.name).toBe('doubao-search');
      expect(plugin.metadata.type).toBe('search');
    });

    test('波尔学术SearchPlugin should initialize correctly', () => {
      const plugin = new 波尔学术SearchPlugin();
      expect(plugin.metadata.name).toBe('波尔学术-search');
      expect(plugin.metadata.type).toBe('search');
    });
  });

  describe('Knowledge Source Plugins', () => {
    test('SciHubDownloadPlugin should initialize correctly', () => {
      const plugin = new SciHubDownloadPlugin();
      expect(plugin.metadata.name).toBe('sci-hub-download');
      expect(plugin.metadata.type).toBe('knowledge_source');
    });
  });

  describe('Knowledge Processing Plugins', () => {
    test('DocumentToTextPlugin should initialize correctly', () => {
      const plugin = new DocumentToTextPlugin();
      expect(plugin.metadata.name).toBe('document-to-text');
      expect(plugin.metadata.type).toBe('knowledge_processing');
    });

    test('EnglishTranslationPlugin should initialize correctly', () => {
      const plugin = new EnglishTranslationPlugin();
      expect(plugin.metadata.name).toBe('english-translation');
      expect(plugin.metadata.type).toBe('knowledge_processing');
    });

    test('AISummaryPlugin should initialize correctly', () => {
      const plugin = new AISummaryPlugin();
      expect(plugin.metadata.name).toBe('ai-summary');
      expect(plugin.metadata.type).toBe('knowledge_processing');
    });
  });

  describe('Plugin Methods', () => {
    test('EnglishTranslationPlugin should detect English text', () => {
      const plugin = new EnglishTranslationPlugin();
      expect(plugin.isEnglish('Hello world')).toBe(true);
      expect(plugin.isEnglish('你好世界')).toBe(false);
    });

    test('DocumentToTextPlugin should return supported types', () => {
      const plugin = new DocumentToTextPlugin();
      const supportedTypes = plugin.getSupportedTypes();
      expect(supportedTypes).toContain('pdf');
      expect(supportedTypes).toContain('jpg');
      expect(supportedTypes).toContain('png');
    });
  });
});