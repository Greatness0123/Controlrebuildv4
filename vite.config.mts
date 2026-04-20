import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/renderer-react'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist-renderer'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        chat: path.resolve(__dirname, 'src/renderer-react/chat.html'),
        settings: path.resolve(__dirname, 'src/renderer-react/settings.html'),
        entry: path.resolve(__dirname, 'src/renderer-react/entry.html'),
        lite: path.resolve(__dirname, 'src/renderer-react/lite.html'),
        workflow: path.resolve(__dirname, 'src/renderer-react/workflow.html'),
        overlay: path.resolve(__dirname, 'src/renderer-react/overlay.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer-react/src'),
    },
  },
});
