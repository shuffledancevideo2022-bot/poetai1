import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'  // Ваш SWC!

export default defineConfig({
  plugins: [react()],
  base: '/poetai1/'
})
