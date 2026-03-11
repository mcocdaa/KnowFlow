import axios from 'axios'
import { apiConfig, appConfig } from '@/config'

const request = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加版本号到请求头
    config.headers['X-API-Version'] = apiConfig.version

    // 调试模式下打印请求信息
    if (appConfig.isDebug) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config)
    }

    return config
  },
  (error) => {
    if (appConfig.isDebug) {
      console.error('[API Request Error]', error)
    }
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 调试模式下打印响应信息
    if (appConfig.isDebug) {
      console.log(`[API Response] ${response.status} ${response.config.url}`, response.data)
    }

    return response.data
  },
  (error) => {
    if (appConfig.isDebug) {
      console.error('[API Response Error]', error.response?.data || error.message)
    }

    // 这里可以添加统一的错误处理逻辑，比如token过期跳转到登录页等
    return Promise.reject(error)
  }
)

export default request
