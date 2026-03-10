import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: '.',
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: ['vjcad']
  }
});
