import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist-renderer'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        chat: path.resolve(__dirname, 'src/renderer/chat.html'),
        settings: path.resolve(__dirname, 'src/renderer/settings.html'),
        entry: path.resolve(__dirname, 'src/renderer/entry.html'),
        lite: path.resolve(__dirname, 'src/renderer/lite.html'),
        workflow: path.resolve(__dirname, 'src/renderer/workflow.html'),
        overlay: path.resolve(__dirname, 'src/renderer/overlay.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
    },
  },
});
