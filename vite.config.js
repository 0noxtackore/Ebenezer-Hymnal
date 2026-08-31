import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Los assets del proyecto (hymns.json, logos) se sirven en la raíz (/)
export default defineConfig({
  plugins: [react()],
  publicDir: 'assets',
  server: {
    host: true,
    port: 5173,
    open: false
  }
})
