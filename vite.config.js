import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  css: {
    devSourcemap: true, // ✅ bật source map cho CSS
  },
  build: {
    sourcemap: true, // bật luôn cho JS & CSS build
  },
})

