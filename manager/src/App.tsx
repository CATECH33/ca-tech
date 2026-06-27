import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Login } from './pages/Login'
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
})

function ProtectedApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
      <Route path="/loic/*" element={<ProtectedRoute><Loic /></ProtectedRoute>} />
      <Route path="/notifications/*" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ProtectedApp />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
