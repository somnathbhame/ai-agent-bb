import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config with proxy so that calls to /api go to the Python backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
