import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});