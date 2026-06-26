import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients/*" element={<Clients />} />
          <Route path="/leads/*" element={<Leads />} />
          <Route path="/devis/*" element={<Devis />} />
          <Route path="/factures/*" element={<Factures />} />
          <Route path="/projets/*" element={<Projets />} />
          <Route path="/taches/*" element={<Taches />} />
          <Route path="/services/*" element={<Services />} />
          <Route path="/paiements/*" element={<Paiements />} />
          <Route path="/portfolio/*" element={<Portfolio />} />
          <Route path="/agenda/*" element={<Agenda />} />
          <Route path="/messages/*" element={<Messages />} />
          <Route path="/support/*" element={<Support />} />
          <Route path="/parametres/*" element={<Parametres />} />
          <Route path="/loic/*" element={<Loic />} />
          <Route path="/notifications/*" element={<Notifications />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
