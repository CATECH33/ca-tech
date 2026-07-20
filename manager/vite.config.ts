import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { vercelToolbar } from '@vercel/toolbar/plugins/vite'

export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    // Toolbar uniquement en développement
    ...(mode !== 'production' ? [vercelToolbar()] : []),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react'
          }
          if (id.includes('@tanstack/react-query')) return 'vendor-query'
          if (id.includes('@supabase/supabase-js') || id.includes('@supabase/')) return 'vendor-supabase'
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) return 'vendor-charts'
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf'
          if (id.includes('lucide-react') || id.includes('class-variance-authority') || id.includes('/clsx/') || id.includes('tailwind-merge')) return 'vendor-ui'
          if (id.includes('date-fns')) return 'vendor-dates'
        },
      },
    },
  },
  // Optimisation des dépendances en développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
}))
