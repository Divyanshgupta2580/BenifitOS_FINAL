import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@components': path.resolve(__dirname, './src/components'),
      '@navigation': path.resolve(__dirname, './src/navigation'),
      '@screens': path.resolve(__dirname, './src/screens'),
    },
  },
  server: {
    port: 3000,
    open: false,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
