import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
  },
  css: {
    // Avoid loading project PostCSS/Tailwind in unit tests
    postcss: null,
  },
})

