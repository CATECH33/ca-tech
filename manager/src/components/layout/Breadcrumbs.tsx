import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const labels: Record<string, string> = {
  clients: 'Clients', leads: 'Leads', devis: 'Devis', factures: 'Factures',
  projets: 'Projets', taches: 'Tâches', services: 'Services', paiements: 'Paiements',
  portfolio: 'Portfolio', messages: 'Messages', support: 'Support', parametres: 'Paramètres',
  nouveau: 'Nouveau', edit: 'Modifier',
  prospection: 'Prospection IA', prospects: 'Prospects', recherche: 'Recherche',
  qualification: 'Qualification IA', brouillons: 'Brouillons', relances: 'Relances',
  statistiques: 'Statistiques', config: 'Paramètres',
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <Home className="h-3.5 w-3.5" />
      <span className="font-medium text-gray-900">Dashboard</span>
    </div>
  )

  return (
    <nav className="flex items-center gap-1 text-xs text-gray-400">
      <Link to="/" className="flex items-center hover:text-gray-600 transition">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const to = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        return (
          <span key={to} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className={cn('font-medium text-gray-700')}>{labels[seg] ?? seg}</span>
            ) : (
              <Link to={to} className="hover:text-gray-600 transition">{labels[seg] ?? seg}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
