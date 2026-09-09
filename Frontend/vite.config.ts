import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7141',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'https://localhost:7141',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
