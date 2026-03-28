export const APP_CONFIG = {
  TITLE: 'KnowFlow',
  VERSION: '1.0.0',
  DESCRIPTION: '知识管理系统',
} as const;

export const API_CONFIG = {
  BASE_URL: '/api/v1',
  TIMEOUT: 30000,
} as const;

export const LAYOUT_CONFIG = {
  HEADER_HEIGHT: 64,
  SIDER_WIDTH: 240,
  CONTENT_PADDING: 24,
} as const;

export const STORAGE_KEYS = {
  KNOWLEDGE_ITEMS: 'knowledge_items',
  KEY_DEFINITIONS: 'key_definitions',
  CATEGORIES: 'categories',
} as const;
