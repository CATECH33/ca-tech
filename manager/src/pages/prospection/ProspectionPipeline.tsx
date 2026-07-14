import { useState } from 'react'
import {
  Building2, Globe, Search, X, MapPin, User, ExternalLink,
  Sparkles, Mail, MessageSquare, Calendar, FileText, PenLine, CheckCircle2, Rocket,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { cn } from '@/lib/utils'
import { useProspects, useUpdateProspect, type ProspectRow } from '@/hooks/useProspects'
import { getAudit } from '@/hooks/useAudit'
import { getRecommendations, type RecommendPriority } from '@/hooks/useRecommendations'
import type { ProspectStatus } from '@/types'

// ── Pipeline stages ───────────────────────────────────────────────────────────

interface Stage {
  status: ProspectStatus
  label: string
  icon: React.ElementType
  headerBg: string
  headerText: string
  borderColor: string
  dropBg: string
  accent: string
}

const STAGES: Stage[] = [
  {
    status: 'new',
    label: 'Nouveau prospect',
    icon: Sparkles,
    headerBg: 'bg-slate-100',
    headerText: 'text-slate-600',
    borderColor: 'border-slate-200',
    dropBg: 'bg-slate-50/60',
    accent: 'bg-slate-400',
  },
  {
    status: 'qualified',
    label: 'Qualifié',
    icon: Building2,
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-700',
    borderColor: 'border-blue-200',
    dropBg: 'bg-blue-50/40',
    accent: 'bg-blue-500',
  },
  {
    status: 'email_ready',
    label: 'Email prêt',
    icon: Mail,
    headerBg: 'bg-indigo-50',
    headerText: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    dropBg: 'bg-indigo-50/40',
    accent: 'bg-indigo-500',
  },
  {
    status: 'contacted',
    label: 'Email envoyé',
    icon: Mail,
    headerBg: 'bg-violet-50',
    headerText: 'text-violet-700',
    borderColor: 'border-violet-200',
    dropBg: 'bg-violet-50/40',
    accent: 'bg-violet-500',
  },
  {
    status: 'responded',
    label: 'Réponse reçue',
    icon: MessageSquare,
    headerBg: 'bg-cyan-50',
    headerText: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    dropBg: 'bg-cyan-50/40',
    accent: 'bg-cyan-500',
  },
  {
    status: 'meeting',
    label: 'Rendez-vous',
    icon: Calendar,
    headerBg: 'bg-teal-50',
    headerText: 'text-teal-700',
    borderColor: 'border-teal-200',
    dropBg: 'bg-teal-50/40',
    accent: 'bg-teal-500',
  },
  {
    status: 'proposal_sent',
    label: 'Devis envoyé',
    icon: FileText,
    headerBg: 'bg-amber-50',
    headerText: 'text-amber-700',
    borderColor: 'border-amber-200',
    dropBg: 'bg-amber-50/40',
    accent: 'bg-amber-500',
  },
  {
    status: 'contract_signed',
    label: 'Contrat signé',
    icon: PenLine,
    headerBg: 'bg-orange-50',
    headerText: 'text-orange-700',
    borderColor: 'border-orange-200',
    dropBg: 'bg-orange-50/40',
    accent: 'bg-orange-500',
  },
  {
    status: 'converted',
    label: 'Client',
    icon: CheckCircle2,
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dropBg: 'bg-emerald-50/40',
    accent: 'bg-emerald-500',
  },
  {
    status: 'project_started',
    label: 'Projet lancé',
    icon: Rocket,
    headerBg: 'bg-green-50',
    headerText: 'text-green-700',
    borderColor: 'border-green-200',
    dropBg: 'bg-green-50/40',
    accent: 'bg-green-500',
  },
]

const STAGE_DISQUALIFIED: Stage = {
  status: 'disqualified',
  label: 'Disqualifié',
  icon: X,
  headerBg: 'bg-red-50',
  headerText: 'text-red-600',
  borderColor: 'border-red-200',
  dropBg: 'bg-red-50/40',
  accent: 'bg-red-400',
}

const ALL_STAGES_OPTIONS = [...STAGES, STAGE_DISQUALIFIED]

const PRIORITY_DOT: Record<RecommendPriority, string> = {
  A: 'bg-emerald-500',
  B: 'bg-amber-500',
  C: 'bg-slate-400',
}

const PRIORITY_LABEL: Record<RecommendPriority, string> = {
  A: 'Priorité A — Contacter sous 48 h',
  B: 'Priorité B — Potentiel à développer',
  C: 'Priorité C — Faible potentiel',
}

const PRIORITY_PANEL: Record<RecommendPriority, { bg: string; text: string }> = {
  A: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  B: { bg: 'bg-amber-50',   text: 'text-amber-700' },
  C: { bg: 'bg-slate-50',   text: 'text-slate-600' },
}

// ── Kanban card ───────────────────────────────────────────────────────────────

function KanbanCard({
  prospect,
  dragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  prospect: ProspectRow
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onClick: () => void
}) {
  const reco    = getRecommendations(prospect)
  const audit   = getAudit(prospect)
  const contact = prospect.contacts.find(c => c.is_primary) ?? prospect.contacts[0] ?? null
  const days    = Math.floor((Date.now() - new Date(prospect.created_at).getTime()) / 86_400_000)

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border p-3 cursor-grab active:cursor-grabbing select-none transition-all group',
        dragging
          ? 'opacity-40 scale-95 shadow-lg border-gray-200'
          : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5',
      )}
    >
      {/* Priority badge + score */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {reco && (
            <span className={cn(
              'text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none',
              PRIORITY_DOT[reco.priority],
            )}>
              {reco.priority}
            </span>
          )}
          {prospect.tags.slice(0, 1).map(tag => (
            <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100 truncate max-w-[72px]">
              {tag}
            </span>
          ))}
        </div>
        {prospect.score > 0 && (
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
            prospect.score >= 70 ? 'bg-emerald-50 text-emerald-600' :
            prospect.score >= 40 ? 'bg-amber-50 text-amber-600' :
            'bg-gray-50 text-gray-400',
          )}>
            {prospect.score}
          </span>
        )}
      </div>

      {/* Company */}
      <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">
        {prospect.company_name}
      </p>

      {(prospect.industry || prospect.city) && (
        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
          {[prospect.industry, prospect.city].filter(Boolean).join(' · ')}
        </p>
      )}

      {contact && (
        <div className="flex items-center gap-1 mt-1.5">
          <User className="h-2.5 w-2.5 text-gray-300 shrink-0" />
          <p className="text-[11px] text-gray-500 line-clamp-1">
            {[contact.first_name, contact.last_name].filter(Boolean).join(' ')}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
        <span className="text-[10px] text-gray-300">
          {days === 0 ? 'Auj.' : `${days}j`}
        </span>
        <div className="flex items-center gap-1.5">
          {audit && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 inline-block" />
              {audit.score.toFixed(1)}
            </span>
          )}
          {prospect.website && (
            <Globe className="h-3 w-3 text-gray-200 group-hover:text-gray-400 transition-colors" />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  stage, prospects, draggingId, isDropTarget,
  onDragOver, onDragLeave, onDrop,
  onCardDragStart, onCardDragEnd, onCardClick,
}: {
  stage: Stage
  prospects: ProspectRow[]
  draggingId: string | null
  isDropTarget: boolean
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
  onCardDragStart: (id: string) => void
  onCardDragEnd: () => void
  onCardClick: (p: ProspectRow) => void
}) {
  const Icon = stage.icon

  return (
    <div className="flex flex-col w-[240px] shrink-0">
      {/* Column header */}
      <div className={cn(
        'flex items-center gap-2 rounded-t-xl px-3 py-2.5 border border-b-0',
        stage.headerBg, stage.borderColor,
      )}>
        <Icon className={cn('h-3.5 w-3.5 shrink-0', stage.headerText)} />
        <span className={cn('text-xs font-semibold flex-1 truncate', stage.headerText)}>
          {stage.label}
        </span>
        <span className={cn(
          'text-[11px] font-semibold px-1.5 py-0.5 rounded-full leading-none bg-white/80',
          stage.headerText,
        )}>
          {prospects.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); onDragOver() }}
        onDragLeave={onDragLeave}
        onDrop={e => { e.preventDefault(); onDrop() }}
        className={cn(
          'flex-1 rounded-b-xl border border-t-0 p-2 space-y-2 transition-colors overflow-y-auto',
          stage.borderColor,
          isDropTarget && draggingId
            ? 'bg-brand-50/70 border-brand-300'
            : stage.dropBg,
        )}
        style={{ minHeight: 160 }}
      >
        {prospects.map(p => (
          <KanbanCard
            key={p.id}
            prospect={p}
            dragging={draggingId === p.id}
            onDragStart={() => onCardDragStart(p.id)}
            onDragEnd={onCardDragEnd}
            onClick={() => onCardClick(p)}
          />
        ))}

        {prospects.length === 0 && !(isDropTarget && draggingId) && (
          <div className="flex items-center justify-center py-8 text-[11px] text-gray-300 select-none">
            Vide
          </div>
        )}

        {isDropTarget && draggingId && (
          <div className="h-14 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/50 flex items-center justify-center">
            <span className="text-xs text-brand-500 font-medium">Déposer ici</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Quick panel ───────────────────────────────────────────────────────────────

function QuickPanel({
  prospect,
  onClose,
  onStatusChange,
}: {
  prospect: ProspectRow
  onClose: () => void
  onStatusChange: (s: ProspectStatus) => void
}) {
  const reco    = getRecommendations(prospect)
  const audit   = getAudit(prospect)
  const contact = prospect.contacts.find(c => c.is_primary) ?? prospect.contacts[0] ?? null
  const stage   = ALL_STAGES_OPTIONS.find(s => s.status === prospect.status)

  return (
    <div className="w-[300px] shrink-0 bg-white border-l border-gray-200 h-full flex flex-col shadow-xl">
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0',
        stage?.headerBg ?? 'bg-white',
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            'h-8 w-8 rounded-xl flex items-center justify-center shrink-0',
            'bg-white/80 shadow-sm',
          )}>
            <Building2 className={cn('h-4 w-4', stage?.headerText ?? 'text-brand-500')} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{prospect.company_name}</p>
            {prospect.industry && (
              <p className={cn('text-[11px] truncate', stage?.headerText ?? 'text-gray-400')}>
                {prospect.industry}
              </p>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition shrink-0 ml-2">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Status select */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Étape pipeline</p>
          <select
            value={prospect.status}
            onChange={e => onStatusChange(e.target.value as ProspectStatus)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white"
          >
            {ALL_STAGES_OPTIONS.map(s => (
              <option key={s.status} value={s.status}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        {reco && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Recommandation IA</p>
            <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', PRIORITY_PANEL[reco.priority].bg)}>
              <span className={cn('h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0', PRIORITY_DOT[reco.priority])}>
                {reco.priority}
              </span>
              <span className={cn('text-xs font-medium', PRIORITY_PANEL[reco.priority].text)}>
                {PRIORITY_LABEL[reco.priority]}
              </span>
            </div>
            {reco.recommendation && (
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">{reco.recommendation}</p>
            )}
          </div>
        )}

        {/* Scores */}
        {(prospect.score > 0 || audit) && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Scores</p>
            <div className="flex gap-2">
              {prospect.score > 0 && (
                <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2.5 text-center border border-gray-100">
                  <p className="text-xl font-bold text-gray-800">{prospect.score}</p>
                  <p className="text-[10px] text-gray-400">Score global</p>
                </div>
              )}
              {audit && (
                <div className="flex-1 rounded-lg bg-slate-50 px-3 py-2.5 text-center border border-slate-100">
                  <p className="text-xl font-bold text-slate-700">{audit.score.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-400">Audit /10</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Opportunités */}
        {reco && reco.opportunities.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Opportunités</p>
            <ul className="space-y-1.5">
              {reco.opportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact */}
        {contact && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Contact</p>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 space-y-1">
              <p className="text-sm font-medium text-gray-800">
                {[contact.first_name, contact.last_name].filter(Boolean).join(' ')}
              </p>
              {contact.job_title && <p className="text-xs text-gray-500">{contact.job_title}</p>}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="text-xs text-brand-500 hover:underline block">
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="text-xs text-gray-500 hover:text-gray-700 block">
                  {contact.phone}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          {prospect.website && (
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-500 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{prospect.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </a>
          )}
          {prospect.city && (
            <p className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {[prospect.city, prospect.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function PipelineProgress({ prospects }: { prospects: ProspectRow[] }) {
  const total = prospects.filter(p => p.status !== 'disqualified').length
  if (total === 0) return null

  const counts = STAGES.map(s => prospects.filter(p => p.status === s.status).length)

  return (
    <div className="flex items-center gap-0.5 h-1.5 rounded-full overflow-hidden bg-gray-100 w-48">
      {STAGES.map((stage, i) => {
        const pct = total > 0 ? (counts[i] / total) * 100 : 0
        if (pct === 0) return null
        return (
          <div
            key={stage.status}
            className={cn('h-full transition-all', stage.accent)}
            style={{ width: `${pct}%` }}
            title={`${stage.label}: ${counts[i]}`}
          />
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ProspectionPipeline() {
  const { data: prospects = [], isLoading } = useProspects()
  const update = useUpdateProspect()

  const [search,           setSearch]           = useState('')
  const [showDisqualified, setShowDisqualified] = useState(false)
  const [draggingId,       setDraggingId]       = useState<string | null>(null)
  const [dropTarget,       setDropTarget]       = useState<ProspectStatus | null>(null)
  const [selectedId,       setSelectedId]       = useState<string | null>(null)

  const visibleStages = showDisqualified ? [...STAGES, STAGE_DISQUALIFIED] : STAGES

  const filtered = prospects.filter(p =>
    p.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.industry ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.city ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const activeCount      = filtered.filter(p => p.status !== 'disqualified').length
  const convertedCount   = filtered.filter(p => p.status === 'converted' || p.status === 'project_started').length
  const conversionRate   = activeCount > 0 ? Math.round((convertedCount / filtered.length) * 100) : 0

  const handleDrop = (status: ProspectStatus) => {
    if (draggingId) update.mutate({ id: draggingId, status })
    setDraggingId(null)
    setDropTarget(null)
  }

  const handleStatusChange = (status: ProspectStatus) => {
    if (selectedId) update.mutate({ id: selectedId, status })
  }

  const selected = selectedId ? (prospects.find(p => p.id === selectedId) ?? null) : null

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pipeline commercial</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeCount} prospect{activeCount !== 1 ? 's' : ''} actifs
                {convertedCount > 0 && (
                  <span className="ml-2 text-emerald-500 font-medium">
                    · {convertedCount} client{convertedCount !== 1 ? 's' : ''} ({conversionRate}%)
                  </span>
                )}
              </p>
            </div>
            <PipelineProgress prospects={filtered} />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filtrer…"
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/30 w-44"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowDisqualified(v => !v)}
              className={cn(
                'flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition whitespace-nowrap',
                showDisqualified
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50',
              )}
            >
              {showDisqualified ? 'Masquer disqualifiés' : 'Afficher disqualifiés'}
            </button>
          </div>
        </div>

        {/* ── Board ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Kanban board — scrolls horizontally */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Chargement…
              </div>
            ) : (
              <div className="flex gap-3 h-full pb-2" style={{ width: 'max-content', minWidth: '100%' }}>
                {visibleStages.map(stage => (
                  <KanbanColumn
                    key={stage.status}
                    stage={stage}
                    prospects={filtered.filter(p => p.status === stage.status)}
                    draggingId={draggingId}
                    isDropTarget={dropTarget === stage.status}
                    onDragOver={() => setDropTarget(stage.status)}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={() => handleDrop(stage.status)}
                    onCardDragStart={id => { setDraggingId(id); setSelectedId(null) }}
                    onCardDragEnd={() => { setDraggingId(null); setDropTarget(null) }}
                    onCardClick={p => setSelectedId(p.id === selectedId ? null : p.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick panel */}
          {selected && (
            <QuickPanel
              prospect={selected}
              onClose={() => setSelectedId(null)}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
