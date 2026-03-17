import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/poetai1/',  // Замените ВАШЕ-ИМЯ-РЕПО на точное имя этого репо! Например /my-site/
})
