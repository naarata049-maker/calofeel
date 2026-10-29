import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages（main ブランチの /docs）で公開する。base はそのURL（/calofeel/）に合わせる
export default defineConfig({
  base: '/calofeel/',
  build: { outDir: 'docs' },
  plugins: [react()],
})
