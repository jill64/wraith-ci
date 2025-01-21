import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    include: ['**/*.test.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages')
    }
  }
})
