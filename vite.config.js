import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const SPA_ROUTES = [
  '/services', '/loic', '/collaborateurs-ia',
  '/automatisations', '/realisations', '/blog', '/contact',
  '/catalogue', '/tarifs', '/a-propos',
  '/expertises/ia', '/expertises/automatisation',
  '/expertises/web-saas', '/expertises/infrastructure',
  '/projets', '/devis', '/mentions-legales',
  '/politique-de-confidentialite', '/gestion-des-cookies',
  '/portfolio-preview',
]

function spaRouter() {
  return {
    name: 'spa-router',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url || '').split('?')[0].replace(/\/$/, '') || '/'
        if (path === '/' || SPA_ROUTES.some(r => path === r || path.startsWith(r + '/'))) {
          req.url = '/index-src.html'
        }
        next()
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), spaRouter()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: command === 'serve' ? '/' : '/dist/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './index-src.html',
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase'))       return 'vendor-supabase'
            if (id.includes('react-router'))   return 'vendor-router'
            if (id.includes('framer-motion'))  return 'vendor-motion'
            if (id.includes('lucide-react'))   return 'vendor-icons'
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/'))
                                               return 'vendor-react'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
}))
