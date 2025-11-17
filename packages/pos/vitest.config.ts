import { defineConfig, mergeConfig } from 'vitest/config';
import electronViteConfig from './electron.vite.config';

export default defineConfig({
  test: {
    projects: [
      mergeConfig((electronViteConfig.main || {}) as Record<string, any>, {
        test: {
          name: 'main',
          environment: 'node',
          include: ['src/main/**/*.test.ts', 'src/main/**/*.spec.ts', 'src/main/tests/**/*'],
        },
      }),
      mergeConfig((electronViteConfig.preload || {}) as Record<string, any>, {
        test: {
          name: 'preload',
          environment: 'node',
          include: [
            'src/preload/**/*.test.ts',
            'src/preload/**/*.spec.ts',
            'src/preload/tests/**/*',
          ],
        },
      }),
      mergeConfig((electronViteConfig.renderer || {}) as Record<string, any>, {
        test: {
          name: 'renderer',
          environment: 'jsdom',
          include: [
            'src/renderer/**/*.test.ts',
            'src/renderer/**/*.spec.ts',
            'src/renderer/tests/**/*',
          ],
        },
      }),
    ],
  },
});
