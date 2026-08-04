import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/Footer.jsx'
import PwaInstallBanner from './components/PwaInstallBanner'
import Home from './pages/Home.jsx'
import { SEO_PAGES } from './data/seoPages.js'

const Services       = lazy(() => import('./pages/Services.jsx'))
const Loic           = lazy(() => import('./pages/Loic.jsx'))
const CollaborateursIA = lazy(() => import('./pages/CollaborateursIA.jsx'))
const Automatisations  = lazy(() => import('./pages/Automatisations.jsx'))
const Realisations   = lazy(() => import('./pages/Realisations.jsx'))
const Contact        = lazy(() => import('./pages/Contact.jsx'))
const Catalogue      = lazy(() => import('./pages/Catalogue.jsx'))
const Tarifs         = lazy(() => import('./pages/Tarifs.jsx'))
const SeoPage        = lazy(() => import('./pages/SeoPage.jsx'))

function Layout() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
      <Footer />
      <PwaInstallBanner />
    </>
  )
}

function NotFound() {
  return (
    <section style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>404</p>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '16px 0 12px' }}>Page introuvable</h1>
      <p style={{ color: 'var(--color-gray-600)', marginBottom: '32px' }}>Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" style={{ background: 'var(--color-primary)', color: '#fff', padding: '12px 28px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
        Retour à l'accueil →
      </Link>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                  element={<Home />} />
          <Route path="/services"          element={<Services />} />
          <Route path="/loic"              element={<Loic />} />
          <Route path="/collaborateurs-ia" element={<CollaborateursIA />} />
          <Route path="/automatisations"   element={<Automatisations />} />
          <Route path="/realisations"      element={<Realisations />} />
          <Route path="/contact"           element={<Contact />} />
          <Route path="/catalogue"         element={<Catalogue />} />
          <Route path="/tarifs"            element={<Tarifs />} />
          {Object.values(SEO_PAGES).map(page => (
            <Route key={page.path} path={page.path} element={<SeoPage page={page} />} />
          ))}
          <Route path="*"                  element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
