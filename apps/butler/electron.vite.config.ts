import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'node:path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
      },
    },
    optimizeDeps: {
      exclude: ['@ceviwie/chilbi-shared'],
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@preload': resolve(__dirname, 'src/preload'),
      },
    },
    optimizeDeps: {
      exclude: ['@ceviwie/chilbi-shared'],
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
      },
    },
    plugins: [vue(), tailwindcss()],
    optimizeDeps: {
      exclude: ['@ceviwie/chilbi-shared'],
    },
  },
});
