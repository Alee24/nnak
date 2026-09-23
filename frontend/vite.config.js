import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-core': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 4875,
    strictPort: true,
    host: true,
    allowedHosts: [
      "mms.kkdes.co.ke",
      "nnak.kkdes.co.ke",
      "185.192.97.84",
      "localhost"
    ],
    proxy: {
      // Proxying API requests to backend on port 4549
      '/api': {
        target: 'http://127.0.0.1:4549',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
