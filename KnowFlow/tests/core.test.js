const AIManager = require('../src/core/ai/aiManager');
const MediaProcessor = require('../src/core/media/mediaProcessor');

describe('Core Modules', () => {
  describe('AIManager', () => {
    let aiManager;

    beforeAll(() => {
      aiManager = new AIManager({
        apiKey: 'test-api-key',
        apiUrl: 'https://api.doubao.com/v1/chat/completions'
      });
    });

    test('should optimize content to reduce token usage', () => {
      const longContent = 'a'.repeat(2000);
      const optimizedContent = aiManager.optimizeContent(longContent);
      expect(optimizedContent.length).toBeLessThanOrEqual(1003); // 1000 + '...'
      expect(optimizedContent.slice(-3)).toBe('...');
    });

    test('should parse tags from AI response', () => {
      const mockResponse = `
author: John Doe
year: 2024
research_field: Artificial Intelligence
`;
      const tags = aiManager.parseTags(mockResponse);
      expect(tags).toHaveLength(3);
      expect(tags[0]).toEqual({ key: 'author', value: 'John Doe' });
      expect(tags[1]).toEqual({ key: 'year', value: '2024' });
      expect(tags[2]).toEqual({ key: 'research_field', value: 'Artificial Intelligence' });
    });
  });

  describe('MediaProcessor', () => {
    let mediaProcessor;

    beforeAll(() => {
      mediaProcessor = new MediaProcessor();
    });

    test('should identify image file type', () => {
      expect(mediaProcessor.getFileType('test.jpg')).toBe('image');
      expect(mediaProcessor.getFileType('test.png')).toBe('image');
      expect(mediaProcessor.getFileType('test.gif')).toBe('image');
    });

    test('should identify video file type', () => {
      expect(mediaProcessor.getFileType('test.mp4')).toBe('video');
      expect(mediaProcessor.getFileType('test.avi')).toBe('video');
      expect(mediaProcessor.getFileType('test.mov')).toBe('video');
    });

    test('should identify other file type', () => {
      expect(mediaProcessor.getFileType('test.txt')).toBe('other');
      expect(mediaProcessor.getFileType('test.pdf')).toBe('other');
    });

    test('should generate thumbnail path', () => {
      const filePath = '/path/to/test.jpg';
      const thumbnailPath = mediaProcessor.generateThumbnailPath(filePath);
      expect(thumbnailPath).toBe('/path/to/.test_thumbnail.jpg');
    });
  });
});