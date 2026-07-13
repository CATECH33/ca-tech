import { useState } from 'react'
import {
  Globe, ExternalLink, RefreshCw, Loader2, CheckCircle2, XCircle,
  HelpCircle, Cpu, Search, MessageCircle, TrendingUp, Gauge,
  Clock, ShieldCheck, Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ProspectRow } from '@/hooks/useProspects'
import {
  useRunAudit, useSaveAudit, getAudit,
  type AuditResult, type AuditCheckResult, type AuditCategory,
  AUDIT_CATEGORY_LABELS, AUDIT_CATEGORY_ORDER,
} from '@/hooks/useAudit'

/* ── Score ring ──────────────────────────────────────────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const r    = 28
  const circ = 2 * Math.PI * r
  const dash = Math.min(1, score / 10) * circ
  const color =
    score >= 7 ? '#10b981' :
    score >= 4 ? '#f59e0b' :
    score > 0  ? '#ef4444' : '#e5e7eb'

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="rotate-[-90deg]" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-gray-900 leading-none">{score.toFixed(1)}</span>
        <span className="text-[9px] text-gray-400 leading-none">/10</span>
      </div>
    </div>
  )
}

/* ── Check row ───────────────────────────────────────────────────────────────── */

function CheckRow({ check }: { check: AuditCheckResult }) {
  const Icon =
    check.value === true  ? CheckCircle2 :
    check.value === false ? XCircle : HelpCircle

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition group">
      <Icon className={cn(
        'h-4 w-4 shrink-0',
        check.value === true  ? 'text-emerald-500' :
        check.value === false ? 'text-red-400' : 'text-gray-300',
      )} />
      <span className={cn(
        'flex-1 text-sm',
        check.value === null ? 'text-gray-400' : 'text-gray-700',
      )}>
        {check.label}
      </span>
      {check.detail && (
        <span className="text-[11px] text-gray-400 font-mono shrink-0">{check.detail}</span>
      )}
      <span className={cn(
        'text-[11px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 transition',
        check.value === true  ? 'bg-emerald-100 text-emerald-700' :
        check.value === false ? 'bg-red-100 text-red-500' :
                                'bg-gray-100 text-gray-400',
      )}>
        {check.value === true ? `+${check.weight}` : `${check.weight} pt`}
      </span>
    </div>
  )
}

/* ── Category section ────────────────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<AuditCategory, React.ElementType> = {
  technique: Cpu,
  seo:       Search,
  contact:   MessageCircle,
  marketing: TrendingUp,
}

const CATEGORY_COLORS: Record<AuditCategory, string> = {
  technique: 'text-brand-600 bg-brand-50',
  seo:       'text-amber-600 bg-amber-50',
  contact:   'text-emerald-600 bg-emerald-50',
  marketing: 'text-violet-600 bg-violet-50',
}

function CategorySection({ category, checks }: { category: AuditCategory; checks: AuditCheckResult[] }) {
  const Icon    = CATEGORY_ICONS[category]
  const color   = CATEGORY_COLORS[category]
  const earned  = checks.filter(c => c.value === true).reduce((s, c) => s + c.weight, 0)
  const total   = checks.reduce((s, c) => s + c.weight, 0)
  const passing = checks.filter(c => c.value === true).length
  const label   = AUDIT_CATEGORY_LABELS[category]

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className={cn('h-5 w-5 rounded-md flex items-center justify-center', color)}>
            <Icon className="h-3 w-3" />
          </div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className={cn(
          'text-[11px] font-semibold px-2 py-0.5 rounded-full',
          earned === total  ? 'bg-emerald-100 text-emerald-700' :
          earned === 0      ? 'bg-red-100 text-red-500' :
                              'bg-amber-100 text-amber-700',
        )}>
          {passing}/{checks.length}
        </span>
      </div>
      <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 bg-white">
        {checks.map(c => <CheckRow key={c.id} check={c} />)}
      </div>
    </div>
  )
}

/* ── Info pill ───────────────────────────────────────────────────────────────── */

function Pill({ icon: Icon, label, color = 'text-gray-500 bg-white border-gray-200' }: {
  icon: React.ElementType; label: string; color?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border', color)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

/* ── Empty state ─────────────────────────────────────────────────────────────── */

function EmptyAudit({ url, onAudit, loading }: { url: string; onAudit: () => void; loading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Gauge className="h-7 w-7 text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Aucun audit disponible</p>
        <p className="text-xs text-gray-400">
          {url ? 'Lancez l\'audit pour analyser le site.' : 'Renseignez l\'URL du prospect d\'abord.'}
        </p>
      </div>
      {url && (
        <Button onClick={onAudit} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gauge className="h-3.5 w-3.5" />}
          {loading ? 'Audit en cours…' : 'Lancer l\'audit'}
        </Button>
      )}
    </div>
  )
}

/* ── ProspectAuditPanel ──────────────────────────────────────────────────────── */

export function ProspectAuditPanel({ prospect }: { prospect: ProspectRow }) {
  const existing = getAudit(prospect)
  const [result, setResult]   = useState<AuditResult | null>(existing)
  const [error, setError]     = useState<string | null>(null)

  const runAudit  = useRunAudit()
  const saveAudit = useSaveAudit()
  const loading   = runAudit.isPending

  const url = prospect.website ?? ''

  async function handleAudit() {
    if (!url) return
    setError(null)
    try {
      const data = await runAudit.mutateAsync({ url })
      setResult(data)
      await saveAudit.mutateAsync({ prospect, audit: data })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'audit')
    }
  }

  const checksById = result
    ? AUDIT_CATEGORY_ORDER.reduce<Record<AuditCategory, AuditCheckResult[]>>(
        (acc, cat) => ({ ...acc, [cat]: result.checks.filter(c => c.category === cat) }),
        {} as Record<AuditCategory, AuditCheckResult[]>,
      )
    : null

  const loadTimeFmt = result?.load_time_ms != null
    ? result.load_time_ms >= 1000
      ? `${(result.load_time_ms / 1000).toFixed(1)} s`
      : `${result.load_time_ms} ms`
    : null

  const auditedAt = result?.audited_at
    ? new Date(result.audited_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 bg-gradient-to-br from-slate-50 to-brand-50 border-b border-gray-100 shrink-0">
        <div className="flex items-start gap-4">
          <ScoreRing score={result?.score ?? 0} />

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score d'audit</p>
            <p className="text-xs text-gray-500 mb-2">
              {!result
                ? 'Aucun audit effectué'
                : result.score >= 8 ? 'Site techniquement solide'
                : result.score >= 5 ? 'Axes d\'amélioration identifiés'
                :                     'Site à moderniser en priorité'}
            </p>

            {/* Pills */}
            {result && (
              <div className="flex flex-wrap gap-1.5">
                {result.cms && (
                  <Pill icon={Globe} label={result.cms} color="text-violet-600 bg-violet-50 border-violet-200" />
                )}
                {result.http_status && (
                  <Pill
                    icon={ShieldCheck}
                    label={`HTTP ${result.http_status}`}
                    color={result.http_status < 400 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}
                  />
                )}
                {loadTimeFmt && (
                  <Pill
                    icon={Clock}
                    label={loadTimeFmt}
                    color={result.load_time_ms! < 3000 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200'}
                  />
                )}
                {result.checks.find(c => c.id === 'responsive')?.value === true && (
                  <Pill icon={Smartphone} label="Mobile OK" color="text-brand-600 bg-brand-50 border-brand-200" />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Button
              variant="outline" size="sm"
              onClick={handleAudit}
              disabled={loading || !url}
              className="bg-white"
            >
              {loading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />
              }
              {loading ? 'Audit…' : result ? 'Ré-auditer' : 'Auditer'}
            </Button>
            {auditedAt && (
              <span className="text-[10px] text-gray-400">Audité le {auditedAt}</span>
            )}
          </div>
        </div>

        {/* URL */}
        {url && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
            <Globe className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="flex-1 text-xs text-gray-600 truncate">{result?.final_url ?? url}</span>
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition shrink-0">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!result ? (
          <EmptyAudit url={url} onAudit={handleAudit} loading={loading} />
        ) : (
          <div className="space-y-4">
            {checksById && AUDIT_CATEGORY_ORDER.map(cat => (
              checksById[cat].length > 0 && (
                <CategorySection key={cat} category={cat} checks={checksById[cat]} />
              )
            ))}

            {/* Résumé pondération */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Résumé</p>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{result.checks.filter(c => c.value === true).length} critère{result.checks.filter(c => c.value === true).length > 1 ? 's' : ''} validé{result.checks.filter(c => c.value === true).length > 1 ? 's' : ''} sur {result.checks.length}</span>
                <span className="font-semibold text-gray-800">{result.score.toFixed(1)} / 10</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    result.score >= 7 ? 'bg-emerald-500' :
                    result.score >= 4 ? 'bg-amber-500' : 'bg-red-500',
                  )}
                  style={{ width: `${(result.score / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
