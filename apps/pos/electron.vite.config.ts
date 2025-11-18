import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@preload': resolve(__dirname, 'src/preload'),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
      },
    },
    plugins: [vue(), tailwindcss()],
  },
});
