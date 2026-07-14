import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Login } from './pages/Login'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { Leads } from './pages/Leads'
import { Devis } from './pages/Devis'
import { Factures } from './pages/Factures'
import { Projets } from './pages/Projets'
import { Taches } from './pages/Taches'
import { Services } from './pages/Services'
import { Paiements } from './pages/Paiements'
import { Portfolio } from './pages/Portfolio'
import { Agenda } from './pages/Agenda'
import { Messages } from './pages/Messages'
import { Support } from './pages/Support'
import { Parametres } from './pages/Parametres'
import { Loic } from './pages/Loic'
import { Notifications } from './pages/Notifications'
import { Documents } from './pages/Documents'
import { ProspectionCommercialDashboard } from './pages/prospection/ProspectionCommercialDashboard'
import { ProspectionDashboard } from './pages/prospection/ProspectionDashboard'
import { ProspectionProspects } from './pages/prospection/ProspectionProspects'
import { ProspectionRecherche } from './pages/prospection/ProspectionRecherche'
import { ProspectionQualification } from './pages/prospection/ProspectionQualification'
import { ProspectionBrouillons } from './pages/prospection/ProspectionBrouillons'
import { ProspectionCampagnes } from './pages/prospection/ProspectionCampagnes'
import { ProspectionRelances } from './pages/prospection/ProspectionRelances'
import { ProspectionStatistiques } from './pages/prospection/ProspectionStatistiques'
import { ProspectionParametres } from './pages/prospection/ProspectionParametres'
import { ProspectionPipeline } from './pages/prospection/ProspectionPipeline'
import { ProspectionProspectDetail } from './pages/prospection/ProspectionProspectDetail'
import { ProspectionConnecteurs } from './pages/prospection/ProspectionConnecteurs'
import { Integrations } from './pages/Integrations'
import { GoogleOAuthCallback } from './pages/GoogleOAuthCallback'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
})

function ProtectedApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/clients/*" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/leads/*" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/devis/*" element={<ProtectedRoute><Devis /></ProtectedRoute>} />
      <Route path="/factures/*" element={<ProtectedRoute><Factures /></ProtectedRoute>} />
      <Route path="/projets/*" element={<ProtectedRoute><Projets /></ProtectedRoute>} />
      <Route path="/taches/*" element={<ProtectedRoute><Taches /></ProtectedRoute>} />
      <Route path="/services/*" element={<ProtectedRoute><Services /></ProtectedRoute>} />
      <Route path="/paiements/*" element={<ProtectedRoute><Paiements /></ProtectedRoute>} />
      <Route path="/portfolio/*" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
      <Route path="/agenda/*" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
      <Route path="/messages/*" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/support/*" element={<ProtectedRoute><Support /></ProtectedRoute>} />
      <Route path="/parametres/*" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
      <Route path="/documents/*" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/loic/*" element={<ProtectedRoute><Loic /></ProtectedRoute>} />
      <Route path="/notifications/*" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/prospection" element={<ProtectedRoute><ProspectionCommercialDashboard /></ProtectedRoute>} />
      <Route path="/prospection/ia" element={<ProtectedRoute><ProspectionDashboard /></ProtectedRoute>} />
      <Route path="/prospection/prospects" element={<ProtectedRoute><ProspectionProspects /></ProtectedRoute>} />
      <Route path="/prospection/recherche" element={<ProtectedRoute><ProspectionRecherche /></ProtectedRoute>} />
      <Route path="/prospection/qualification" element={<ProtectedRoute><ProspectionQualification /></ProtectedRoute>} />
      <Route path="/prospection/brouillons" element={<ProtectedRoute><ProspectionBrouillons /></ProtectedRoute>} />
      <Route path="/prospection/campagnes" element={<ProtectedRoute><ProspectionCampagnes /></ProtectedRoute>} />
      <Route path="/prospection/relances" element={<ProtectedRoute><ProspectionRelances /></ProtectedRoute>} />
      <Route path="/prospection/statistiques" element={<ProtectedRoute><ProspectionStatistiques /></ProtectedRoute>} />
      <Route path="/prospection/config" element={<ProtectedRoute><ProspectionParametres /></ProtectedRoute>} />
      <Route path="/prospection/pipeline" element={<ProtectedRoute><ProspectionPipeline /></ProtectedRoute>} />
      <Route path="/prospection/prospects/:id" element={<ProtectedRoute><ProspectionProspectDetail /></ProtectedRoute>} />
      <Route path="/prospection/connecteurs" element={<ProtectedRoute><ProspectionConnecteurs /></ProtectedRoute>} />
      <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/manager">
        <AuthProvider>
          <ProtectedApp />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
