/* eslint-disable */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.CLIENT_PORT || 5173,
    open: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT || 5172}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Ensures `/api` is preserved
      },
    },
  },
});
