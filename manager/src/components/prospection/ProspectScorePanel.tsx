import { Star, CheckCircle2, XCircle, HelpCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProspectRow } from '@/hooks/useProspects'
import { getAudit } from '@/hooks/useAudit'
import { getAnalyse } from '@/hooks/useProspects'
import {
  computeScoreCommercial,
  GROUP_ORDER, GROUP_LABELS, OPPORTUNITY_CONFIG,
  type CommercialCriterion, type CriterionGroup, type Opportunity,
} from '@/lib/scoreCommercial'

// ── Stars ─────────────────────────────────────────────────────────────────────

function StarRow({ stars, total = 5 }: { stars: number; total?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-6 w-6 transition-colors',
            i < stars
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-200 fill-gray-100',
          )}
        />
      ))}
    </div>
  )
}

// ── Opportunity badge ─────────────────────────────────────────────────────────

function OpportunityBadge({ opp }: { opp: Opportunity }) {
  const c = OPPORTUNITY_CONFIG[opp]
  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold',
      c.bg, c.text, c.border,
    )}>
      <span className={cn('h-2 w-2 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  )
}

// ── Criterion row ─────────────────────────────────────────────────────────────

function CriterionRow({ criterion }: { criterion: CommercialCriterion }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      {criterion.value === true  && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
      {criterion.value === false && <XCircle      className="h-4 w-4 text-red-400 shrink-0" />}
      {criterion.value === null  && <HelpCircle   className="h-4 w-4 text-gray-300 shrink-0" />}

      <span className={cn(
        'text-sm flex-1',
        criterion.value === true  ? 'text-gray-800' :
        criterion.value === false ? 'text-gray-600' :
        'text-gray-400',
      )}>
        {criterion.label}
      </span>

      {criterion.detail && (
        <span className="text-[11px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 truncate max-w-[120px]">
          {criterion.detail}
        </span>
      )}
      {criterion.value === null && (
        <span className="text-[11px] text-gray-300 italic">non renseigné</span>
      )}
    </div>
  )
}

// ── Group section ─────────────────────────────────────────────────────────────

function GroupSection({ group, criteria }: { group: CriterionGroup; criteria: CommercialCriterion[] }) {
  const items = criteria.filter(c => c.group === group)
  if (!items.length) return null

  const known = items.filter(c => c.value !== null)
  const pass  = items.filter(c => c.value === true).length

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-1 mt-4 first:mt-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {GROUP_LABELS[group]}
        </p>
        {known.length > 0 && (
          <span className="text-[11px] text-gray-400">
            {pass}/{known.length}
          </span>
        )}
      </div>
      <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-50">
        {items.map(c => (
          <div key={c.id} className="px-3">
            <CriterionRow criterion={c} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Score hero ────────────────────────────────────────────────────────────────

const HERO_GRADIENT: Record<Opportunity, string> = {
  very_high: 'from-emerald-50 via-white to-white',
  medium:    'from-amber-50 via-white to-white',
  low:       'from-slate-50 via-white to-white',
}

const SCORE_TEXT: Record<Opportunity, string> = {
  very_high: 'text-emerald-600',
  medium:    'text-amber-500',
  low:       'text-slate-500',
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function ProspectScorePanel({ prospect }: { prospect: ProspectRow }) {
  const audit   = getAudit(prospect)
  const analyse = getAnalyse(prospect)
  const result  = computeScoreCommercial(prospect, audit, analyse)

  const { score, stars, opportunity, criteria, dataQuality } = result

  const knownCount = criteria.filter(c => c.value !== null).length
  const totalCount = criteria.length

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* ── Hero ── */}
      <div className={cn(
        'px-6 py-8 bg-gradient-to-b shrink-0',
        HERO_GRADIENT[opportunity],
      )}>
        <div className="flex flex-col items-center gap-3 text-center">

          {/* Score number */}
          <div className="flex items-end gap-1 leading-none">
            <span className={cn('text-6xl font-black tabular-nums tracking-tight', SCORE_TEXT[opportunity])}>
              {score.toFixed(1)}
            </span>
            <span className="text-xl text-gray-300 font-medium mb-2">/10</span>
          </div>

          {/* Stars */}
          {stars > 0 && <StarRow stars={stars} />}

          {/* Opportunity badge */}
          <div className="mt-1">
            <OpportunityBadge opp={opportunity} />
          </div>
        </div>
      </div>

      {/* ── Data quality notice ── */}
      {dataQuality !== 'full' && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
          <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            {knownCount}/{totalCount} critères renseignés — lancez l'
            <span className="font-semibold">Analyse</span> et l'<span className="font-semibold">Audit</span> pour un score complet.
          </p>
        </div>
      )}

      {/* ── Criteria breakdown ── */}
      <div className="flex-1 px-4 py-4 space-y-1 pb-6">
        {GROUP_ORDER.map(group => (
          <GroupSection key={group} group={group} criteria={criteria} />
        ))}
      </div>
    </div>
  )
}
