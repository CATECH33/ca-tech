import { useState } from 'react'
import {
  Mail, RefreshCw, ExternalLink, CheckCircle2,
  AlertTriangle, Inbox, Clock, Filter, Loader2,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { cn, formatDate } from '@/lib/utils'
import {
  useEmailDigestItems,
  useEmailDigestStats,
  useMarkDigestItemProcessed,
  CATEGORY_META,
  CATEGORIES,
  type DigestCategory,
  type DigestFilters,
  type EmailDigestItem,
} from '@/hooks/useEmailDigest'

/* ─── Filtres ─────────────────────────────────────────────── */

type DaysOption = 1 | 7 | 30

const DAY_OPTIONS: { value: DaysOption; label: string }[] = [
  { value: 1,  label: "Aujourd'hui" },
  { value: 7,  label: '7 jours'     },
  { value: 30, label: '30 jours'    },
]

/* ─── Composant carte email ───────────────────────────────── */

function DigestCard({ item, onMarkProcessed, isLoading }: {
  item: EmailDigestItem
  onMarkProcessed: (id: string) => void
  isLoading: boolean
}) {
  const meta = CATEGORY_META[item.category]

  return (
    <div className={cn(
      'bg-white rounded-xl border transition-all',
      item.is_processed
        ? 'border-gray-100 opacity-60'
        : item.action_needed
          ? 'border-amber-200 shadow-sm'
          : 'border-gray-100 hover:border-gray-200',
    )}>
      <div className="p-4">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            {/* Dot catégorie */}
            <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', meta.dot)} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {item.subject ?? '(sans objet)'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{item.from_addr}</p>
            </div>
          </div>

          {/* Date + badge catégorie */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[11px] text-gray-400 whitespace-nowrap">
              {formatDate(item.received_at, 'dd/MM HH:mm')}
            </span>
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
              meta.bg, meta.color, meta.border,
            )}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* Résumé */}
        {item.summary && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {item.summary}
          </p>
        )}

        {/* Action requise */}
        {item.action_needed && item.action_text && (
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">{item.action_text}</p>
          </div>
        )}

        {/* Actions footer */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {item.gmail_link && (
              <a
                href={item.gmail_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Ouvrir dans Gmail
              </a>
            )}
          </div>

          {!item.is_processed ? (
            <button
              onClick={() => onMarkProcessed(item.id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 transition-colors disabled:opacity-50"
            >
              {isLoading
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <CheckCircle2 className="h-3 w-3" />
              }
              Marquer traité
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Traité
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Page principale ─────────────────────────────────────── */

export function EmailDigest() {
  const [categoryFilter, setCategoryFilter] = useState<DigestCategory | 'all'>('all')
  const [processedFilter, setProcessedFilter] = useState<boolean | 'all'>('all')
  const [days, setDays]                       = useState<DaysOption>(7)
  const [processingId, setProcessingId]       = useState<string | null>(null)

  const filters: DigestFilters = {
    category:     categoryFilter,
    is_processed: processedFilter,
    days,
  }

  const { data: items = [], isLoading, isFetching, refetch } = useEmailDigestItems(filters)
  const { data: stats } = useEmailDigestStats()
  const markProcessed = useMarkDigestItemProcessed()

  async function handleMarkProcessed(id: string) {
    setProcessingId(id)
    try {
      await markProcessed.mutateAsync(id)
    } finally {
      setProcessingId(null)
    }
  }

  const statCards = [
    {
      label: '30 jours',
      value: stats?.total ?? 0,
      Icon:  Mail,
      color: 'text-brand-500',
      bg:    'bg-brand-50',
    },
    {
      label: "Aujourd'hui",
      value: stats?.today ?? 0,
      Icon:  Clock,
      color: 'text-blue-500',
      bg:    'bg-blue-50',
    },
    {
      label: 'Actions requises',
      value: stats?.actionCount ?? 0,
      Icon:  AlertTriangle,
      color: 'text-amber-500',
      bg:    'bg-amber-50',
    },
    {
      label: 'Non traités',
      value: stats?.unprocessed ?? 0,
      Icon:  Inbox,
      color: 'text-gray-500',
      bg:    'bg-gray-50',
    },
  ]

  return (
    <Layout
      title="Digest Emails IA"
      actions={
        <div className="flex items-center gap-1.5">
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

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', s.bg)}>
                <s.Icon className={cn('h-5 w-5', s.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-semibold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Répartition par catégorie */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Répartition 30 jours</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const count = stats.byCategory[cat] ?? 0
                if (count === 0) return null
                const meta = CATEGORY_META[cat]
                return (
                  <div key={cat} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium', meta.bg, meta.color, meta.border)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
                    {meta.label}
                    <span className="ml-1 font-bold">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Période */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium mr-1">Période</span>
              {DAY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    days === opt.value
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-gray-100 hidden sm:block" />

            {/* Catégorie */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-gray-400" />
              <button
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  categoryFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                )}
              >
                Toutes
              </button>
              {CATEGORIES.map(cat => {
                const meta = CATEGORY_META[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                      categoryFilter === cat
                        ? cn(meta.bg, meta.color, meta.border)
                        : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100',
                    )}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>

            <div className="h-4 w-px bg-gray-100 hidden sm:block" />

            {/* Statut traitement */}
            <div className="flex items-center gap-1">
              {([
                { value: 'all' as const,  label: 'Tous'        },
                { value: false,           label: 'Non traités'  },
                { value: true,            label: 'Traités'      },
              ] as const).map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setProcessedFilter(opt.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    processedFilter === opt.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Mail className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Aucun email dans cette période</p>
            <p className="text-xs text-gray-400 mt-1">
              La collecte automatique s'effectue toutes les 15 minutes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <DigestCard
                key={item.id}
                item={item}
                onMarkProcessed={handleMarkProcessed}
                isLoading={processingId === item.id}
              />
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}
