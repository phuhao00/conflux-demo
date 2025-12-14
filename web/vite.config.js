import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/relay': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/nft': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/topup': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/balance': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
