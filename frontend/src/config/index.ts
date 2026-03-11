// 应用配置
export const appConfig = {
  title: import.meta.env.VITE_APP_TITLE || 'KnowFlow',
  description: import.meta.env.VITE_APP_DESCRIPTION || '知识管理系统',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  isMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
}

// API 配置
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  version: import.meta.env.VITE_API_VERSION || 'v1',
  proxyTarget: import.meta.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
}

// 导出完整配置
export default {
  app: appConfig,
  api: apiConfig,
}
