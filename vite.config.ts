import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base は GitHub Pages（/calofeel/）で公開するため
export default defineConfig({
  base: '/calofeel/',
  plugins: [react()],
})
