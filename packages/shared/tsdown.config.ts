import { defineConfig } from 'tsdown';

export default defineConfig({
  // Define entry points (each will map to a sub-directory in the bundled package)
  entry: ['./src/index.ts', './src/ui/index.ts', './src/utils/index.ts'],
  // Use automatic exports. Can be customized using {customExports(...) {}}
  exports: {
    devExports: true,
  },
  // Copy static files into dist directory
  copy: [],
  // Enable/disable source maps
  sourcemap: true,
});
