import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // antd + jsdom 渲染较重，默认 5s 在并行执行时偏紧
    testTimeout: 15000,
  },
});
