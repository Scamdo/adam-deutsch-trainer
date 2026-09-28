import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' pozwala hostować aplikację w dowolnym podkatalogu (np. GitHub Pages /adam-deutsch-trainer/)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1200 },
})
