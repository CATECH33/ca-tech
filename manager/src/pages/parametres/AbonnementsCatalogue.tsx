import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard, RefreshCw, Loader2, ToggleLeft, ToggleRight,
  Users, ArrowLeft, Zap, CheckCircle2, AlertCircle,
  AlertTriangle, ShieldOff, TrendingUp,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { cn, formatCurrency } from '@/lib/utils'
import { useStripePlans, useToggleStripePlan, type StripePlan } from '@/hooks/useStripePlans'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useChurnEvents, useAutoSuspendSetting, useUpdateAutoSuspend, type ChurnEventType } from '@/hooks/useChurnEvents'

const SLUG_ORDER = ['essentiel', 'confort', 'premium']

const PLAN_FEATURES: Record<string, string[]> = {
  essentiel: ['Site vitrine responsive', 'Maintenance mensuelle', 'Support email sous 48h', '1 mise à jour/mois'],
  confort:   ['Tout Essentiel', 'E-commerce ou sur-mesure', 'Support prioritaire 24h', '3 mises à jour/mois', 'Rapport mensuel'],
  premium:   ['Tout Confort', 'IA & automatisation', 'Support dédié 4h', 'Mises à jour illimitées', 'Rapport hebdomadaire', 'Loïc IA intégré'],
}

const CHURN_EVENT_META: Record<ChurnEventType, { label: string; color: string; bg: string; Icon: typeof AlertTriangle }> = {
  payment_failed:        { label: 'Échec paiement',   color: 'text-red-600',    bg: 'bg-red-50',    Icon: AlertTriangle },
  auto_suspended:        { label: 'Suspendu auto',     color: 'text-orange-600', bg: 'bg-orange-50', Icon: ShieldOff     },
  payment_recovered:     { label: 'Paiement rétabli',  color: 'text-emerald-600',bg: 'bg-emerald-50',Icon: TrendingUp    },
  manually_reactivated:  { label: 'Réactivé manuel',   color: 'text-brand-600',  bg: 'bg-brand-50',  Icon: CheckCircle2  },
}

function PlanCard({ plan, subscriberCount, onToggle, isToggling }: {
  plan: StripePlan
  subscriberCount: number
  onToggle: () => void
  isToggling: boolean
}) {
  const features = PLAN_FEATURES[plan.slug] ?? []
  const amountEur = plan.amount / 100

  return (
    <div className={cn(
      'bg-white rounded-2xl border-2 transition-all',
      plan.slug === 'confort'
        ? 'border-brand-400 shadow-lg shadow-brand-100'
        : plan.active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60',
    )}>
      {plan.slug === 'confort' && (
        <div className="bg-brand-500 text-white text-center text-xs font-semibold py-1.5 rounded-t-xl tracking-wide">
          POPULAIRE
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-gray-900">{amountEur} €</span>
              <span className="text-sm text-gray-400 font-medium">/mois HT</span>
            </div>
          </div>
          <button
            onClick={onToggle}
            disabled={isToggling}
            title={plan.active ? 'Désactiver' : 'Activer'}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
          >
            {isToggling
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : plan.active
                ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                : <ToggleLeft className="h-5 w-5" />
            }
          </button>
        </div>

        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg mb-4',
          subscriberCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500',
        )}>
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium">
            {subscriberCount} abonné{subscriberCount > 1 ? 's' : ''} actif{subscriberCount > 1 ? 's' : ''}
          </span>
        </div>

        <ul className="space-y-2 mb-5">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-100 pt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Price ID</span>
            <code className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]">
              {plan.stripe_price_id}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Statut</span>
            <span className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
              plan.active ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 bg-gray-100',
            )}>
              {plan.active ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AbonnementsCatalogue() {
  const { data: plans = [], isLoading, refetch, isFetching } = useStripePlans()
  const { data: subscriptions = [] } = useSubscriptions()
  const { data: churnEvents = [], isLoading: churnLoading } = useChurnEvents(30)
  const { data: autoSuspend = true } = useAutoSuspendSetting()
  const updateAutoSuspend = useUpdateAutoSuspend()
  const togglePlan = useToggleStripePlan()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const sortedPlans = [...plans].sort((a, b) => {
    const ai = SLUG_ORDER.indexOf(a.slug)
    const bi = SLUG_ORDER.indexOf(b.slug)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  function subscriberCount(plan: StripePlan) {
    return subscriptions.filter(s => s.name === plan.name && s.status === 'active').length
  }

  async function handleToggle(plan: StripePlan) {
    setTogglingId(plan.id)
    try { await togglePlan.mutateAsync({ id: plan.id, active: !plan.active }) }
    finally { setTogglingId(null) }
  }

  const totalActive = subscriptions.filter(s => s.status === 'active').length
  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <Layout
      title="Catalogue abonnements"
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/parametres"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Paramètres
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Actualiser
          </button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Plans actifs',   value: plans.filter(p => p.active).length, Icon: Zap,        color: 'text-brand-500',   bg: 'bg-brand-50'   },
            { label: 'Abonnés actifs', value: totalActive,                         Icon: Users,       color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'MRR',            value: formatCurrency(mrr),                 Icon: CreditCard,  color: 'text-violet-500',  bg: 'bg-violet-50'  },
          ].map(s => (
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

        {/* État si aucun plan */}
        {!isLoading && plans.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Aucun plan configuré</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Exécutez le script de setup pour créer les plans Stripe et les enregistrer en base :
              </p>
              <code className="block mt-2 text-xs bg-amber-100 text-amber-900 px-3 py-2 rounded-lg font-mono">
                STRIPE_SECRET_KEY=sk_... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup-stripe-plans.mjs
              </code>
            </div>
          </div>
        )}

        {/* Plans */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedPlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                subscriberCount={subscriberCount(plan)}
                onToggle={() => handleToggle(plan)}
                isToggling={togglingId === plan.id}
              />
            ))}
          </div>
        )}

        {/* Liste abonnés actifs */}
        {subscriptions.filter(s => s.status === 'active').length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Abonnés actifs</p>
            </div>
            <div className="divide-y divide-gray-50">
              {subscriptions
                .filter(s => s.status === 'active')
                .map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Renouvellement : {s.current_period_end
                          ? new Date(s.current_period_end).toLocaleDateString('fr-FR')
                          : '—'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(s.amount)}
                      <span className="text-xs font-normal text-gray-400">/mois</span>
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Événements churn (30j) ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Événements churn — 30 derniers jours
            </p>
            {/* Toggle auto_suspend */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Suspension auto (3 échecs)</span>
              <button
                onClick={() => updateAutoSuspend.mutate(!autoSuspend)}
                disabled={updateAutoSuspend.isPending}
                title={autoSuspend ? 'Désactiver la suspension automatique' : 'Activer la suspension automatique'}
                className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
              >
                {updateAutoSuspend.isPending
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : autoSuspend
                    ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                    : <ToggleLeft className="h-5 w-5" />
                }
              </button>
            </div>
          </div>

          {churnLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
            </div>
          ) : churnEvents.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun événement churn ces 30 derniers jours.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {churnEvents.map(ev => {
                const meta = CHURN_EVENT_META[ev.event_type] ?? CHURN_EVENT_META.payment_failed
                const Icon = meta.Icon
                const sub  = ev.subscriptions
                const client = sub?.clients
                  ? `${(sub.clients as any).first_name} ${(sub.clients as any).last_name}`
                  : '—'

                return (
                  <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', meta.bg)}>
                      <Icon className={cn('h-3.5 w-3.5', meta.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', meta.bg, meta.color)}>
                          {meta.label}
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate">{client}</span>
                        {sub && (
                          <span className="text-xs text-gray-400 truncate">{sub.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {new Date(ev.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {ev.consecutive_failures_at_event > 0 && (
                          <span className="text-xs text-red-500 font-medium">
                            {ev.consecutive_failures_at_event} échec{ev.consecutive_failures_at_event > 1 ? 's' : ''} consécutif{ev.consecutive_failures_at_event > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
