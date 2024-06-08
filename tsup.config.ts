import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  skipNodeModulesBundle: true,
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: 'inline',
  keepNames: true,
  entry: ['./src/index.ts'],
  outDir: './dist',
});
