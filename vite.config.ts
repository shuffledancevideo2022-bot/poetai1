import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/poetai1/',
  build: {
    outDir: 'dist',
    sourcemap: false  // Ускоряет
  }
})
