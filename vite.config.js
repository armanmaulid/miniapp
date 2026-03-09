import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    // Inject backend URL at build time via env
    // Usage: import.meta.env.VITE_API_URL
  }
})
