import { defineConfig } from 'vitest/config'

/**
 * Vitest 配置 - 后端 API 烟测
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    exclude: ['dist/**', 'node_modules/**'],
  },
})
