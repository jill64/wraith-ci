import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    include: ['**/*.test.ts']
  },
  resolve: {
    alias: {
      '$shared': path.resolve(__dirname, './packages/shared')
    }
  }
})
