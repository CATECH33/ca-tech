import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Routes handled by React Router — dev server must serve index.html for these
// instead of the matching static HTML files
const SPA_ROUTES = [
  '/services', '/loic', '/collaborateurs-ia',
  '/automatisations', '/realisations', '/blog', '/contact',
]

function spaRouter() {
  return {
    name: 'spa-router',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url || '').split('?')[0].replace(/\/$/, '') || '/'
        if (SPA_ROUTES.includes(path)) {
          req.url = '/'
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
  },
  server: {
    port: 3000,
  },
}))
