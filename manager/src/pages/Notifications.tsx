import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { useNotifications } from '@/hooks/useNotifications'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  Bell, Mail, MessageCircle, Phone, CheckCircle, XCircle,
  Loader2, RefreshCw, Filter, Wifi,
} from 'lucide-react'

const TYPE_CONFIG = {
  email:    { label: 'Email',    Icon: Mail,          color: 'text-blue-500',   bg: 'bg-blue-50'   },
  telegram: { label: 'Telegram', Icon: MessageCircle, color: 'text-sky-500',    bg: 'bg-sky-50'    },
  whatsapp: { label: 'WhatsApp', Icon: Phone,         color: 'text-green-500',  bg: 'bg-green-50'  },
} as const

const STATUS_CONFIG = {
  sent:    { label: 'Envoyé',  Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  failed:  { label: 'Échec',   Icon: XCircle,     color: 'text-red-600',   bg: 'bg-red-50'   },
  skipped: { label: 'Ignoré',  Icon: XCircle,     color: 'text-gray-400',  bg: 'bg-gray-50'  },
} as const

type FilterType = 'all' | 'email' | 'telegram' | 'whatsapp'
type FilterStatus = 'all' | 'sent' | 'failed'

export function Notifications() {
  const { data: logs = [], isLoading, refetch, isFetching } = useNotifications()
  const [typeFilter, setTypeFilter]     = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

  const filtered = logs.filter(l => {
    if (typeFilter   !== 'all' && l.channel !== typeFilter)  return false
    if (statusFilter !== 'all' && l.status  !== statusFilter) return false
    return true
  })

  const sentCount   = logs.filter(l => l.status === 'sent').length
  const failedCount = logs.filter(l => l.status === 'failed').length
  const totalToday  = logs.filter(l => {
    const d = new Date(l.created_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  return (
    <Layout
      title="Notifications Loïc"
      actions={
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full mr-1">
            <Wifi className="h-2.5 w-2.5 animate-pulse" /> Temps réel
          </span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Actualiser
          </button>
        </div>
      }
    >
      <div className="space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total',          value: logs.length,  Icon: Bell,         color: 'text-brand-500', bg: 'bg-brand-50'  },
            { label: "Aujourd'hui",    value: totalToday,   Icon: Bell,         color: 'text-blue-500',  bg: 'bg-blue-50'   },
            { label: 'Envoyées',       value: sentCount,    Icon: CheckCircle,  color: 'text-green-500', bg: 'bg-green-50'  },
            { label: 'Échecs',         value: failedCount,  Icon: XCircle,      color: 'text-red-500',   bg: 'bg-red-50'    },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', s.bg)}>
                <s.Icon className={cn('h-5 w-5', s.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Filter className="h-3.5 w-3.5" /> Filtres
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'email', 'telegram', 'whatsapp'] as FilterType[]).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  typeFilter === t ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {t === 'all' ? 'Tous' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-gray-200 mx-1" />
          <div className="flex gap-1.5">
            {(['all', 'sent', 'failed'] as FilterStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  statusFilter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {s === 'all' ? 'Tous statuts' : s === 'sent' ? 'Envoyées' : 'Échecs'}
              </button>
            ))}
          </div>
          {filtered.length !== logs.length && (
            <span className="ml-auto text-xs text-gray-400">{filtered.length} résultats</span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Historique des notifications</h3>
            <span className="text-xs text-gray-400">{logs.length} au total</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {logs.length === 0 ? 'Aucune notification pour le moment' : 'Aucun résultat pour ces filtres'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Canal', 'Provider', 'Statut', 'Destinataire', 'Message', 'Erreur', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(log => {
                    const T = TYPE_CONFIG[log.channel] ?? TYPE_CONFIG.email
                    const S = STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.failed
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <span className={cn('flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full w-fit', T.color, T.bg)}>
                            <T.Icon className="h-3 w-3" /> {T.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500 capitalize">{log.provider}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full w-fit', S.color, S.bg)}>
                            <S.Icon className="h-3 w-3" /> {S.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[160px]">
                          <span className="text-[11px] text-gray-500 truncate block">{log.recipient || '—'}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <span className="text-[11px] text-gray-500 truncate block">{log.message || '—'}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          {log.error ? (
                            <span className="text-[11px] text-red-500 truncate block" title={log.error}>
                              {log.error.slice(0, 60)}{log.error.length > 60 ? '…' : ''}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-gray-400">
                            {format(new Date(log.created_at), 'dd/MM/yy HH:mm', { locale: fr })}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Config reminder */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">Variables d'environnement Vercel à configurer</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-amber-600">
            <div>
              <p className="font-semibold mb-1">📧 Email (Resend) ✅</p>
              <code className="block">RESEND_API_KEY</code>
              <code className="block">ADMIN_EMAIL (optionnel)</code>
            </div>
            <div>
              <p className="font-semibold mb-1">📱 Telegram</p>
              <code className="block">TELEGRAM_BOT_TOKEN</code>
              <code className="block">TELEGRAM_CHAT_ID</code>
            </div>
            <div>
              <p className="font-semibold mb-1">💬 WhatsApp (CallMeBot)</p>
              <code className="block">CALLMEBOT_PHONE</code>
              <code className="block">CALLMEBOT_APIKEY</code>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
