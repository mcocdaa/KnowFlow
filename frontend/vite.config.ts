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
  Object.assign(process.env, rootEnv)

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
          target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // antd 组件库固有体积较大（约 1.2MB minified），vendor 已拆分，此处设合理阈值
      chunkSizeWarningLimit: 1300,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
            antd: ['antd'],
            icons: ['@ant-design/icons'],
            styled: ['styled-components'],
          },
        },
      },
    }
  }
})
