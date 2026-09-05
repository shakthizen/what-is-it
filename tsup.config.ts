import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'cli/index': 'src/cli/index.ts',
    'core/index': 'src/core/index.ts'
  },
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  dts: false,
  clean: false,
  sourcemap: true,
  shims: true
});
