import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { vercelToolbar } from '@vercel/toolbar/plugins/vite'

export default defineConfig({
  base: '/manager/',
  plugins: [react(), vercelToolbar()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
