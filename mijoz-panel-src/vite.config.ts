import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: '/client/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:4000',
        '/uploads': 'http://localhost:4000',
        '/socket.io': { target: 'http://localhost:4000', ws: true },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
