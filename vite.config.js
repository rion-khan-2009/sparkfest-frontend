import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/macros/s/AKfycbxwj04hgvfEbt2SVwcNpybwEZFtKk12m2DUKGMOP9x9JbSAd0vIjnqJICtUZTBs_fp23Q/exec'),
        secure: true,
      }
    }
  }
})