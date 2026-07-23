import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Auth pages — chargées immédiatement (pas derrière ProtectedRoute)
import { Login } from './pages/Login'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { GoogleOAuthCallback } from './pages/GoogleOAuthCallback'

// Pages métier — lazy-loaded (un chunk par module)
const Dashboard           = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Clients             = lazy(() => import('./pages/Clients').then(m => ({ default: m.Clients })))
const Leads               = lazy(() => import('./pages/Leads').then(m => ({ default: m.Leads })))
const Devis               = lazy(() => import('./pages/Devis').then(m => ({ default: m.Devis })))
const Factures            = lazy(() => import('./pages/Factures').then(m => ({ default: m.Factures })))
const Projets             = lazy(() => import('./pages/Projets').then(m => ({ default: m.Projets })))
const Taches              = lazy(() => import('./pages/Taches').then(m => ({ default: m.Taches })))
const Services            = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })))
const Paiements           = lazy(() => import('./pages/Paiements').then(m => ({ default: m.Paiements })))
const Portfolio           = lazy(() => import('./pages/Portfolio').then(m => ({ default: m.Portfolio })))
const Agenda              = lazy(() => import('./pages/Agenda').then(m => ({ default: m.Agenda })))
const Messages            = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })))
const Support             = lazy(() => import('./pages/Support').then(m => ({ default: m.Support })))
const Parametres          = lazy(() => import('./pages/Parametres').then(m => ({ default: m.Parametres })))
const Loic                = lazy(() => import('./pages/Loic').then(m => ({ default: m.Loic })))
const Notifications       = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })))
const Documents           = lazy(() => import('./pages/Documents').then(m => ({ default: m.Documents })))
const Integrations        = lazy(() => import('./pages/Integrations').then(m => ({ default: m.Integrations })))

// Module prospection — regroupé dans un chunk unique
const ProspectionCommercialDashboard = lazy(() => import('./pages/prospection/ProspectionCommercialDashboard').then(m => ({ default: m.ProspectionCommercialDashboard })))
const ProspectionDashboard           = lazy(() => import('./pages/prospection/ProspectionDashboard').then(m => ({ default: m.ProspectionDashboard })))
const ProspectionProspects           = lazy(() => import('./pages/prospection/ProspectionProspects').then(m => ({ default: m.ProspectionProspects })))
const ProspectionRecherche           = lazy(() => import('./pages/prospection/ProspectionRecherche').then(m => ({ default: m.ProspectionRecherche })))
const ProspectionQualification       = lazy(() => import('./pages/prospection/ProspectionQualification').then(m => ({ default: m.ProspectionQualification })))
const ProspectionBrouillons          = lazy(() => import('./pages/prospection/ProspectionBrouillons').then(m => ({ default: m.ProspectionBrouillons })))
const ProspectionCampagnes           = lazy(() => import('./pages/prospection/ProspectionCampagnes').then(m => ({ default: m.ProspectionCampagnes })))
const ProspectionRelances            = lazy(() => import('./pages/prospection/ProspectionRelances').then(m => ({ default: m.ProspectionRelances })))
const ProspectionStatistiques        = lazy(() => import('./pages/prospection/ProspectionStatistiques').then(m => ({ default: m.ProspectionStatistiques })))
const ProspectionParametres          = lazy(() => import('./pages/prospection/ProspectionParametres').then(m => ({ default: m.ProspectionParametres })))
const ProspectionPipeline            = lazy(() => import('./pages/prospection/ProspectionPipeline').then(m => ({ default: m.ProspectionPipeline })))
const ProspectionProspectDetail      = lazy(() => import('./pages/prospection/ProspectionProspectDetail').then(m => ({ default: m.ProspectionProspectDetail })))
const ProspectionConnecteurs         = lazy(() => import('./pages/prospection/ProspectionConnecteurs').then(m => ({ default: m.ProspectionConnecteurs })))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
})

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb' }}>
      <div style={{ width: 28, height: 28, border: '2.5px solid #e5e7eb', borderTopColor: '#0066FF', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function ProtectedApp() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login"          element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="/"               element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clients/*"      element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/leads/*"        element={<ProtectedRoute><Leads /></ProtectedRoute>} />
        <Route path="/devis/*"        element={<ProtectedRoute><Devis /></ProtectedRoute>} />
        <Route path="/factures/*"     element={<ProtectedRoute><Factures /></ProtectedRoute>} />
        <Route path="/projets/*"      element={<ProtectedRoute><Projets /></ProtectedRoute>} />
        <Route path="/taches/*"       element={<ProtectedRoute><Taches /></ProtectedRoute>} />
        <Route path="/services/*"     element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/paiements/*"    element={<ProtectedRoute><Paiements /></ProtectedRoute>} />
        <Route path="/portfolio/*"    element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/agenda/*"       element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
        <Route path="/messages/*"     element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/support/*"      element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/parametres/*"   element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
        <Route path="/integrations"   element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
        <Route path="/documents/*"    element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/loic/*"         element={<ProtectedRoute><Loic /></ProtectedRoute>} />
        <Route path="/notifications/*" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/prospection"              element={<ProtectedRoute><ProspectionCommercialDashboard /></ProtectedRoute>} />
        <Route path="/prospection/ia"           element={<ProtectedRoute><ProspectionDashboard /></ProtectedRoute>} />
        <Route path="/prospection/prospects"    element={<ProtectedRoute><ProspectionProspects /></ProtectedRoute>} />
        <Route path="/prospection/recherche"    element={<ProtectedRoute><ProspectionRecherche /></ProtectedRoute>} />
        <Route path="/prospection/qualification" element={<ProtectedRoute><ProspectionQualification /></ProtectedRoute>} />
        <Route path="/prospection/brouillons"   element={<ProtectedRoute><ProspectionBrouillons /></ProtectedRoute>} />
        <Route path="/prospection/campagnes"    element={<ProtectedRoute><ProspectionCampagnes /></ProtectedRoute>} />
        <Route path="/prospection/relances"     element={<ProtectedRoute><ProspectionRelances /></ProtectedRoute>} />
        <Route path="/prospection/statistiques" element={<ProtectedRoute><ProspectionStatistiques /></ProtectedRoute>} />
        <Route path="/prospection/config"       element={<ProtectedRoute><ProspectionParametres /></ProtectedRoute>} />
        <Route path="/prospection/pipeline"     element={<ProtectedRoute><ProspectionPipeline /></ProtectedRoute>} />
        <Route path="/prospection/prospects/:id" element={<ProtectedRoute><ProspectionProspectDetail /></ProtectedRoute>} />
        <Route path="/prospection/connecteurs"  element={<ProtectedRoute><ProspectionConnecteurs /></ProtectedRoute>} />
        <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/">
        <AuthProvider>
          <ProtectedApp />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
