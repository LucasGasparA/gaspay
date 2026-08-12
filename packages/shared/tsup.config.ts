import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  // Metro e Node consomem o bundle; zod fica externo para não duplicar instância.
  external: ['zod'],
});
