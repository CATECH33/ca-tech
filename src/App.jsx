import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Header } from './components/navigation/Header'
import { Footer } from './components/footer/Footer'

const Home                    = lazy(() => import('./pages/Home'))
const APropos                 = lazy(() => import('./pages/APropos'))
const Contact                 = lazy(() => import('./pages/Contact'))
const Devis                   = lazy(() => import('./pages/Devis'))
const MentionsLegales         = lazy(() => import('./pages/MentionsLegales'))
const PolitiqueConfidentialite = lazy(() => import('./pages/PolitiqueConfidentialite'))
const GestionCookies          = lazy(() => import('./pages/GestionCookies'))
const Stub                    = lazy(() => import('./pages/StubPage'))
const NotFound                = lazy(() => import('./pages/NotFound'))
const PortfolioPreview        = lazy(() => import('./portfolio-mockups'))

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#05101E',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '2px solid rgba(53,155,217,0.20)',
        borderTopColor: '#359BD9',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const isPreview = location.pathname === '/portfolio-preview'

  return (
    <>
      {!isPreview && <a href="#main-content" className="skip-link">Aller au contenu principal</a>}
      {!isPreview && <Header />}
      <main id="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Routes canoniques ── */}
            <Route path="/"                              element={<Home />} />

            {/* Services */}
            <Route path="/services"                      element={<Stub title="Services" />} />
            <Route path="/services/ia"                   element={<Stub title="Intelligence Artificielle" />} />
            <Route path="/services/automatisation"       element={<Stub title="Automatisation" />} />
            <Route path="/services/llm-mcp"              element={<Stub title="LLM & MCP" />} />
            <Route path="/services/systemes"             element={<Stub title="Systèmes & Infrastructure" />} />
            <Route path="/services/developpement"        element={<Stub title="Développement Web" />} />
            <Route path="/services/seo"                  element={<Stub title="SEO" />} />
            <Route path="/services/design"               element={<Stub title="Design & Identité" />} />

            {/* Projets */}
            <Route path="/projets"                       element={<Stub title="Réalisations" />} />
            <Route path="/projets/:slug"                 element={<Stub title="Projet" />} />

            {/* Pages */}
            <Route path="/a-propos"                      element={<APropos />} />
            <Route path="/contact"                       element={<Contact />} />
            <Route path="/devis"                         element={<Devis />} />
            <Route path="/blog"                          element={<Stub title="Blog" />} />
            <Route path="/blog/:slug"                    element={<Stub title="Article" />} />

            {/* Légal */}
            <Route path="/mentions-legales"              element={<MentionsLegales />} />
            <Route path="/politique-de-confidentialite"  element={<PolitiqueConfidentialite />} />
            <Route path="/gestion-des-cookies"           element={<GestionCookies />} />

            {/* ── Anciennes routes — redirections React Router (dev mode) ── */}
            <Route path="/expertises/ia"             element={<Navigate to="/services/ia" replace />} />
            <Route path="/expertises/automatisation" element={<Navigate to="/services/automatisation" replace />} />
            <Route path="/expertises/web-saas"       element={<Navigate to="/services/developpement" replace />} />
            <Route path="/expertises/infrastructure" element={<Navigate to="/services/systemes" replace />} />
            <Route path="/expertises/*"              element={<Navigate to="/services" replace />} />
            <Route path="/realisations"              element={<Navigate to="/projets" replace />} />
            <Route path="/loic"                      element={<Stub title="Loïc IA" />} />
            <Route path="/collaborateurs-ia"         element={<Navigate to="/services/ia" replace />} />
            <Route path="/automatisations"           element={<Navigate to="/services/automatisation" replace />} />
            <Route path="/catalogue"                 element={<Navigate to="/" replace />} />
            <Route path="/tarifs"                    element={<Navigate to="/contact" replace />} />

            {/* ── Dev-only route — portfolio mockup preview ── */}
            <Route path="/portfolio-preview" element={<PortfolioPreview />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isPreview && <Footer />}
    </>
  )
}
