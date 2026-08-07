import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Routes handled by React Router — dev server must serve index.html for these
// instead of the matching static HTML files
const SPA_ROUTES = [
  '/services', '/loic', '/collaborateurs-ia',
  '/automatisations', '/realisations', '/blog', '/contact',
  '/catalogue', '/tarifs',
]

function spaRouter() {
  return {
    name: 'spa-router',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url || '').split('?')[0].replace(/\/$/, '') || '/'
        // Redirect all SPA routes (including root) to the source HTML entry
        if (path === '/' || SPA_ROUTES.includes(path)) {
          req.url = '/index-src.html'
        }
        next()
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), spaRouter()],
  base: command === 'serve' ? '/' : '/dist/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './index-src.html',
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react'
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
}))
