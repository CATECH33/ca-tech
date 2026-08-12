import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox, UserPlus, FileText, ChevronRight, Search,
  ArrowRight, CheckCircle2,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useLeads } from '@/hooks/useLeads'
import { useDevis } from '@/hooks/useDevis'

const PIPELINE_STAGES = [
  { key: 'demande',       label: 'Demande',       color: 'bg-blue-500',    text: 'text-blue-600',    light: 'bg-blue-50' },
  { key: 'qualification', label: 'Qualification',  color: 'bg-violet-500',  text: 'text-violet-600',  light: 'bg-violet-50' },
  { key: 'devis',         label: 'Devis',          color: 'bg-amber-500',   text: 'text-amber-600',   light: 'bg-amber-50' },
  { key: 'paiement',      label: 'Paiement',       color: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
]

type TabType = 'tous' | 'demandes' | 'devis'

export function DemandesDevis() {
  const [tab, setTab] = useState<TabType>('tous')
  const [search, setSearch] = useState('')

  const { data: leads = [] } = useLeads()
  const { data: devis = [] } = useDevis()

  const searchLower = search.toLowerCase()

  const filteredLeads = leads
    .filter(l => {
      if (!searchLower) return true
      return `${l.prenom} ${l.nom} ${l.entreprise ?? ''}`.toLowerCase().includes(searchLower)
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filteredDevis = devis
    .filter(d => {
      if (!searchLower) return true
      return `${d.numero} ${d.client?.entreprise ?? ''} ${d.client?.prenom ?? ''} ${d.client?.nom ?? ''}`.toLowerCase().includes(searchLower)
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const pipelineCounts = {
    demande:       leads.filter(l => ['nouveau', 'contact'].includes(l.status)).length,
    qualification: leads.filter(l => l.status === 'qualifie').length,
    devis:         devis.filter(d => ['brouillon', 'envoye'].includes(d.status)).length
                   + leads.filter(l => ['proposition', 'negocie'].includes(l.status)).length,
    paiement:      leads.filter(l => l.status === 'gagne').length,
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'tous',     label: 'Tous',     count: filteredLeads.length + filteredDevis.length },
    { key: 'demandes', label: 'Demandes', count: filteredLeads.length },
    { key: 'devis',    label: 'Devis',    count: filteredDevis.length },
  ]

  return (
    <Layout title="Demandes & Devis">

      {/* Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.key} className="relative">
            <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className={cn('h-1 w-8 rounded-full mb-3', stage.color)} />
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{stage.label}</p>
              <p className={cn('text-3xl font-bold mt-1', stage.text)}>
                {pipelineCounts[stage.key as keyof typeof pipelineCounts]}
              </p>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center bg-white rounded-full border border-gray-100">
                <ArrowRight className="h-3 w-3 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t.label}
              <span className={cn(
                'text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none',
                tab === t.key ? 'bg-brand-100 text-brand-600' : 'bg-gray-200 text-gray-500'
              )}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="space-y-4">

        {/* ── Demandes (leads) ──────────────────────────────────────────── */}
        {(tab === 'tous' || tab === 'demandes') && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-500" />
                <CardTitle>Demandes</CardTitle>
                {leads.filter(l => l.status === 'nouveau').length > 0 && (
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-600 rounded-full px-2 py-0.5">
                    {leads.filter(l => l.status === 'nouveau').length} à traiter
                  </span>
                )}
              </div>
              <Link to="/leads" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
                Gérer <ChevronRight className="h-3 w-3" />
              </Link>
            </CardHeader>

            {filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle2 className="h-6 w-6 text-gray-200" />
                <p className="text-sm text-gray-400">Aucune demande</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredLeads.slice(0, 10).map(lead => (
                  <Link
                    key={lead.id}
                    to="/leads"
                    className="flex items-center gap-3 py-2.5 px-1 hover:bg-gray-50 rounded-lg transition -mx-1"
                  >
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lead.prenom} {lead.nom}
                        </p>
                        {lead.entreprise && (
                          <span className="text-xs text-gray-400 truncate hidden sm:inline">· {lead.entreprise}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(lead.created_at)}
                        {lead.budget_estime ? ` · ${formatCurrency(lead.budget_estime)}` : ''}
                      </p>
                    </div>
                    <Badge status={lead.status} className="text-[10px] shrink-0" />
                  </Link>
                ))}
                {filteredLeads.length > 10 && (
                  <div className="pt-3 text-center">
                    <Link to="/leads" className="text-xs text-brand-500 hover:underline">
                      Voir les {filteredLeads.length - 10} autres demandes
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* ── Devis ────────────────────────────────────────────────────── */}
        {(tab === 'tous' || tab === 'devis') && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-500" />
                <CardTitle>Devis</CardTitle>
                {devis.filter(d => d.status === 'envoye').length > 0 && (
                  <span className="text-[10px] font-semibold bg-brand-100 text-brand-600 rounded-full px-2 py-0.5">
                    {devis.filter(d => d.status === 'envoye').length} en attente
                  </span>
                )}
              </div>
              <Link to="/devis" className="text-[11px] text-brand-500 hover:underline font-medium flex items-center gap-0.5">
                Gérer <ChevronRight className="h-3 w-3" />
              </Link>
            </CardHeader>

            {filteredDevis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Inbox className="h-6 w-6 text-gray-200" />
                <p className="text-sm text-gray-400">Aucun devis</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredDevis.slice(0, 10).map(d => (
                  <Link
                    key={d.id}
                    to="/devis"
                    className="flex items-center gap-3 py-2.5 px-1 hover:bg-gray-50 rounded-lg transition -mx-1"
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      d.status === 'accepte' ? 'bg-emerald-50'
                      : d.status === 'refuse' || d.status === 'expire' ? 'bg-red-50'
                      : 'bg-blue-50'
                    )}>
                      <FileText className={cn(
                        'h-3.5 w-3.5',
                        d.status === 'accepte' ? 'text-emerald-500'
                        : d.status === 'refuse' || d.status === 'expire' ? 'text-red-500'
                        : 'text-blue-500'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-900 font-mono truncate">{d.numero}</p>
                        <span className="text-xs text-gray-400 truncate hidden sm:inline">
                          · {d.client?.entreprise ?? `${d.client?.prenom ?? ''} ${d.client?.nom ?? ''}`.trim()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(d.created_at)}
                        {d.date_expiration ? ` · Expire le ${formatDate(d.date_expiration)}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-800">{formatCurrency(d.total_ttc)}</p>
                      <Badge status={d.status} className="text-[10px] mt-0.5" />
                    </div>
                  </Link>
                ))}
                {filteredDevis.length > 10 && (
                  <div className="pt-3 text-center">
                    <Link to="/devis" className="text-xs text-brand-500 hover:underline">
                      Voir les {filteredDevis.length - 10} autres devis
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  )
}
