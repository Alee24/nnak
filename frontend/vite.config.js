import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5525,
    strictPort: true,
    host: true,
    proxy: {
      // Proxying API requests to backend on port 5526
      '/api': {
        target: 'http://127.0.0.1:5526',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
