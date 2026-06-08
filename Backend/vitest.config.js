import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['./tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/services/authService.js',
        'src/services/dashboardService.js',
        'src/services/emotionLogService.js',
        'src/services/habitLogService.js',
        'src/services/habitService.js',
        'src/services/recommendationService.js',
      ],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
  },
})
