import { useState } from 'react'
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, Target, MessageSquare, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ProspectRow } from '@/hooks/useProspects'
import {
  getRecommendations, useGenerateRecommendations, useSaveRecommendations,
  type Recommendations, type RecommendPriority,
} from '@/hooks/useRecommendations'

// ── Priority badge ────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<RecommendPriority, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Priorité A — Contacter sous 48 h' },
  B: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Priorité B — Potentiel à développer' },
  C: { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   label: 'Priorité C — Faible potentiel' },
}

function PriorityBadge({ priority }: { priority: RecommendPriority }) {
  const s = PRIORITY_STYLES[priority]
  return (
    <span className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold', s.bg, s.text, s.border)}>
      <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
        priority === 'A' ? 'bg-emerald-500' : priority === 'B' ? 'bg-amber-500' : 'bg-slate-400',
      )}>
        {priority}
      </span>
      {s.label}
    </span>
  )
}

// ── List section ──────────────────────────────────────────────────────────────

type SectionKind = 'strength' | 'weakness' | 'opportunity'

const SECTION_STYLES: Record<SectionKind, { icon: React.ReactNode; color: string; bg: string; dotColor: string }> = {
  strength:    { icon: <ThumbsUp  className="h-4 w-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50',  dotColor: 'bg-emerald-400' },
  weakness:    { icon: <ThumbsDown className="h-4 w-4" />, color: 'text-red-500',    bg: 'bg-red-50',      dotColor: 'bg-red-400' },
  opportunity: { icon: <Target    className="h-4 w-4" />, color: 'text-blue-600',   bg: 'bg-blue-50',     dotColor: 'bg-blue-400' },
}

function ListSection({ kind, title, items }: { kind: SectionKind; title: string; items: string[] }) {
  const s = SECTION_STYLES[kind]
  if (!items.length) return null
  return (
    <div className="space-y-2">
      <div className={cn('flex items-center gap-2 text-xs font-semibold uppercase tracking-wider', s.color)}>
        {s.icon}
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={cn('flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700', s.bg)}>
            <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', s.dotColor)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Recommendation block ──────────────────────────────────────────────────────

function RecommendationBlock({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600">
        <MessageSquare className="h-4 w-4" />
        Recommandation commerciale
      </div>
      <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-gray-800 leading-relaxed">
        {text}
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyReco({ onGenerate, loading }: { onGenerate: () => void; loading: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-400">
        <Sparkles className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">Aucune recommandation IA générée</p>
        <p className="mt-1 text-xs text-gray-400">Lancez l'analyse pour obtenir points forts, faiblesses et opportunités</p>
      </div>
      <Button onClick={onGenerate} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Générer les recommandations
      </Button>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function ProspectRecommendPanel({ prospect }: { prospect: ProspectRow }) {
  const [error, setError] = useState<string | null>(null)

  const existing = getRecommendations(prospect)
  const generate = useGenerateRecommendations()
  const save     = useSaveRecommendations()

  const [reco, setReco] = useState<Recommendations | null>(existing)

  const handleGenerate = async () => {
    setError(null)
    try {
      const result = await generate.mutateAsync(prospect)
      setReco(result)
      await save.mutateAsync({ prospectId: prospect.id, reco: result })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue')
    }
  }

  const loading = generate.isPending || save.isPending

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Recommandations IA</p>
            {reco && (
              <p className="text-[11px] text-gray-400">
                Généré le {new Date(reco.generated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {reco && (
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="gap-1.5 text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Régénérer
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Content */}
      {!reco ? (
        <EmptyReco onGenerate={handleGenerate} loading={loading} />
      ) : (
        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Priority */}
          <div className="flex items-center">
            <PriorityBadge priority={reco.priority} />
          </div>

          {/* Three lists */}
          <ListSection kind="strength"    title="Points forts"  items={reco.strengths} />
          <ListSection kind="weakness"    title="Points faibles" items={reco.weaknesses} />
          <ListSection kind="opportunity" title="Opportunités CA-TECH" items={reco.opportunities} />

          {/* Recommendation text */}
          {reco.recommendation && <RecommendationBlock text={reco.recommendation} />}
        </div>
      )}
    </div>
  )
}
