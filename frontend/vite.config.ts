import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 生产 CSP：file:// 加载的页面没有 HTTP 响应头，必须通过 meta 标签注入（build 产物生效）
const PROD_CSP_META =
  '<meta http-equiv="Content-Security-Policy" content="' +
  "default-src 'self'; " +
  "script-src 'self'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob: http://localhost:* http://127.0.0.1:*; " +
  "media-src 'self' http://localhost:* http://127.0.0.1:*; " +
  "font-src 'self' data:; " +
  "connect-src 'self' http://localhost:* http://127.0.0.1:*; " +
  "object-src 'none'; base-uri 'self'; frame-ancestors 'none'" +
  '">'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '..'), '')
  // 根目录 .env 仅作为默认值注入；已存在的进程环境变量优先，
  // 便于 start.sh 在本地下发时覆盖（如 VITE_API_BASE_URL="" 走相对路径）
  for (const [key, value] of Object.entries(rootEnv)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    plugins: [
      react(),
      {
        name: 'inject-csp-meta',
        apply: 'build',
        transformIndexHtml(html) {
          return html.replace('</head>', `  ${PROD_CSP_META}\n</head>`)
        },
      },
    ],
    server: {
      port: 5177,
      proxy: {
        '/api': {
          // 本地 dev 由 start.sh 传入 VITE_PROXY_TARGET；否则回落到 VITE_API_BASE_URL / 3000
          target: process.env.VITE_PROXY_TARGET || process.env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // antd 组件库固有体积较大（约 1.4MB minified），vendor 已拆分，此处设合理阈值
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // vite 8（rolldown）只接受函数形式；按需拆 vendor
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return
            if (id.includes('@ant-design/icons')) return 'icons'
            if (id.includes('/antd/') || id.includes('/rc-') || id.includes('@rc-component')) return 'antd'
            if (/node_modules\/(react|react-dom|react-redux|@reduxjs|react-router|scheduler)/.test(id)) {
              return 'react-vendor'
            }
          },
        },
      },
    }
  }
})
