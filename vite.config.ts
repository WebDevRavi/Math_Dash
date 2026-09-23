import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VERCEL ? '/' : './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // keep informative crazygames SDK logs
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
