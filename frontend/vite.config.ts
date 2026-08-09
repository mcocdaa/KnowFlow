import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '..'), '')
  Object.assign(process.env, rootEnv)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
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
