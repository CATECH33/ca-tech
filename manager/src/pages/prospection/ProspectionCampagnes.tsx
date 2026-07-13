import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { cn } from '@/lib/utils'
import {
  Plus, Trash2, Edit2, Check, X, Play, Pause, Archive, Copy,
  Users, Clock, Mail, Phone, Link2, MessageSquare, Search,
  AlertCircle, Layers, ChevronRight, Send, MessageCircle,
  CalendarCheck, Trophy, Target, MoreVertical, ArrowUpDown,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign,
  useDuplicateCampaign, useCreateStep, useUpdateStep, useDeleteStep,
  useEnrollProspect, useRemoveProspect,
  type CampaignRow, type CampaignStatus, type CampaignType,
  type CampaignStep, type CampaignBase,
} from '@/hooks/useCampagnes'
import { useProspectsForDraft } from '@/hooks/useEmailDrafts'
import type { EmailDraftTone } from '@/types'

/* ─── Config ─────────────────────────────────────────────────────────────── */

const TYPE_CFG: Record<CampaignType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  email:    { label: 'Email',    icon: Mail,           color: 'text-brand-600',   bg: 'bg-brand-50'   },
  phone:    { label: 'Téléphone',icon: Phone,          color: 'text-emerald-600', bg: 'bg-emerald-50' },
  linkedin: { label: 'LinkedIn', icon: Link2,           color: 'text-blue-600',    bg: 'bg-blue-50'    },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare,  color: 'text-teal-600',    bg: 'bg-teal-50'    },
}

const STATUS_CFG: Record<CampaignStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft:    { label: 'Brouillon',  bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400'    },
  active:   { label: 'Active',     bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  paused:   { label: 'En pause',   bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  archived: { label: 'Archivée',   bg: 'bg-gray-100',    text: 'text-gray-400',    dot: 'bg-gray-300'    },
}

const STATUS_FILTERS: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'Toutes'     },
  { value: 'active',   label: 'Actives'    },
  { value: 'draft',    label: 'Brouillons' },
  { value: 'paused',   label: 'En pause'   },
  { value: 'archived', label: 'Archivées'  },
]

const TONES: { value: EmailDraftTone; label: string }[] = [
  { value: 'professional', label: 'Professionnel' },
  { value: 'formal',       label: 'Formel'        },
  { value: 'friendly',     label: 'Amical'        },
  { value: 'direct',       label: 'Direct'        },
]

/* ─── StatusBadge ────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: CampaignStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', c.bg, c.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  )
}

/* ─── TypeBadge ──────────────────────────────────────────────────────────── */

function TypeBadge({ type, size = 'sm' }: { type: CampaignType; size?: 'sm' | 'md' }) {
  const c = TYPE_CFG[type]
  const Icon = c.icon
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-lg font-medium',
      c.bg, c.color,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
    )}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {c.label}
    </span>
  )
}

/* ─── StatChip ───────────────────────────────────────────────────────────── */

function StatChip({ icon: Icon, value, color }: { icon: React.ElementType; value: number; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <Icon className={cn('h-3 w-3', color)} />
      {value}
    </span>
  )
}

/* ─── CampaignCard ───────────────────────────────────────────────────────── */

function CampaignCard({
  campaign, selected, onClick, onDelete,
}: {
  campaign: CampaignRow
  selected: boolean
  onClick: () => void
  onDelete: () => void
}) {
  const prospectCount = campaign.enrolled.length

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left px-3.5 py-3.5 rounded-xl border transition-all',
          selected
            ? 'border-brand-200 bg-brand-50 shadow-sm'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm',
        )}
      >
        {/* Row 1: name + badges */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-semibold truncate', selected ? 'text-brand-700' : 'text-gray-900')}>
              {campaign.name}
            </p>
          </div>
          <StatusBadge status={campaign.status} />
        </div>

        {/* Row 2: type + objective */}
        <div className="flex items-center gap-2 mb-2.5">
          <TypeBadge type={campaign.type} />
          {campaign.objective && (
            <p className="text-xs text-gray-400 truncate flex-1">{campaign.objective}</p>
          )}
        </div>

        {/* Row 3: stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <StatChip icon={Users}         value={prospectCount}       color="text-brand-400"   />
          <StatChip icon={Send}          value={campaign.emails_sent} color="text-violet-400"  />
          <StatChip icon={MessageCircle} value={campaign.replies}     color="text-teal-400"    />
          <StatChip icon={CalendarCheck} value={campaign.meetings}    color="text-amber-400"   />
          <StatChip icon={Trophy}        value={campaign.clients}     color="text-emerald-400" />
          <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-300">
            <Clock className="h-3 w-3" />
            {format(parseISO(campaign.created_at), 'd MMM', { locale: fr })}
          </span>
        </div>
      </button>

      {/* Delete on hover */}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute top-2.5 right-2.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}

/* ─── CampaignFormModal ──────────────────────────────────────────────────── */

interface CampaignFormState {
  name:        string
  description: string
  objective:   string
  type:        CampaignType
  status:      CampaignStatus
}

function CampaignFormModal({
  initial, title, onClose, onSave, saving,
}: {
  initial?: Partial<CampaignFormState>
  title: string
  onClose: () => void
  onSave: (v: CampaignFormState) => void
  saving: boolean
}) {
  const [form, setForm] = useState<CampaignFormState>({
    name:        initial?.name        ?? '',
    description: initial?.description ?? '',
    objective:   initial?.objective   ?? '',
    type:        initial?.type        ?? 'email',
    status:      initial?.status      ?? 'draft',
  })
  const set = <K extends keyof CampaignFormState>(k: K, v: CampaignFormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom *</label>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ex : Relance agences web — mai 2026"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Objectif */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Objectif</label>
            <input
              type="text"
              value={form.objective}
              onChange={e => set('objective', e.target.value)}
              placeholder="Ex : Obtenir 5 rendez-vous en 30 jours"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Cible, ton, contexte…"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Type de canal</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(TYPE_CFG) as [CampaignType, typeof TYPE_CFG[CampaignType]][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                const active = form.type === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('type', key)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                      active
                        ? `${cfg.bg} ${cfg.color} border-current/20 ring-2 ring-offset-1 ring-brand-300`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Statut (edit only) */}
          {initial?.status !== undefined && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Statut</label>
              <div className="flex gap-2 flex-wrap">
                {(Object.entries(STATUS_CFG) as [CampaignStatus, typeof STATUS_CFG[CampaignStatus]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('status', key)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      form.status === key
                        ? `${cfg.bg} ${cfg.text} border-transparent`
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
                    )}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name.trim() || saving}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── StatCounter ────────────────────────────────────────────────────────── */

function StatCounter({
  label, value, icon: Icon, color, bg,
  onIncrement, onDecrement,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
  onIncrement: () => void
  onDecrement: () => void
}) {
  return (
    <div className={cn('rounded-xl border border-gray-100 p-3.5 flex flex-col gap-2', bg)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={cn('h-6 w-6 rounded-lg flex items-center justify-center', bg.replace('50', '100'))}>
          <Icon className={cn('h-3.5 w-3.5', color)} />
        </div>
      </div>
      <p className={cn('text-3xl font-black tabular-nums leading-none', color)}>{value}</p>
      <div className="flex items-center gap-1 pt-1">
        <button
          onClick={onDecrement}
          disabled={value <= 0}
          className="h-6 w-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 text-base leading-none transition-colors"
        >
          −
        </button>
        <button
          onClick={onIncrement}
          className="h-6 w-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 text-base leading-none transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}

/* ─── StepForm ───────────────────────────────────────────────────────────── */

interface StepFormState { delay_days: number; subject: string; body: string; tone: EmailDraftTone }

function StepForm({ initial, isFirst, onSave, onCancel, saving }: {
  initial: StepFormState; isFirst: boolean
  onSave: (v: StepFormState) => void; onCancel: () => void; saving: boolean
}) {
  const [form, setForm] = useState<StepFormState>(initial)
  const set = <K extends keyof StepFormState>(k: K, v: StepFormState[K]) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="mt-3 space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
      {!isFirst && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600 shrink-0">Délai :</label>
          <input type="number" min={0} max={365} value={form.delay_days}
            onChange={e => set('delay_days', Number(e.target.value))}
            className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
          <span className="text-sm text-gray-500">jours</span>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Objet</label>
        <input type="text" value={form.subject} onChange={e => set('subject', e.target.value)}
          placeholder="Objet de l'email…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Corps</label>
        <textarea value={form.body} onChange={e => set('body', e.target.value)}
          placeholder="Contenu de l'email…" rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-brand-300" />
      </div>
      <div className="flex flex-wrap gap-2">
        {TONES.map(t => (
          <button key={t.value} type="button" onClick={() => set('tone', t.value)}
            className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              form.tone === t.value ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300')}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving || !form.subject.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
          <Check className="h-3.5 w-3.5" /> Enregistrer
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
          <X className="h-3.5 w-3.5" /> Annuler
        </button>
      </div>
    </div>
  )
}

/* ─── EnrollModal ────────────────────────────────────────────────────────── */

function EnrollModal({ enrolledIds, onClose, onEnroll }: {
  enrolledIds: Set<string>; onClose: () => void; onEnroll: (id: string) => void
}) {
  const { data: prospects = [], isLoading } = useProspectsForDraft()
  const [search, setSearch] = useState('')
  const filtered = prospects.filter(p => p.company_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[75vh]">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Ajouter des prospects</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-4 w-4" /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un prospect…"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading && <p className="text-sm text-gray-400 text-center py-6">Chargement…</p>}
          {!isLoading && filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Aucun résultat</p>}
          {filtered.map(p => {
            const enrolled = enrolledIds.has(p.id)
            return (
              <button key={p.id} onClick={() => { if (!enrolled) onEnroll(p.id) }} disabled={enrolled}
                className={cn('w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors',
                  enrolled ? 'bg-emerald-50 text-emerald-700 cursor-default' : 'hover:bg-gray-50 text-gray-700')}>
                <span className="font-medium">{p.company_name}</span>
                {enrolled ? <span className="text-xs text-emerald-600">Ajouté</span> : <Plus className="h-3.5 w-3.5 text-gray-400" />}
              </button>
            )
          })}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── CampaignDetail ─────────────────────────────────────────────────────── */

function CampaignDetail({ campaign, onEdit }: { campaign: CampaignRow; onEdit: () => void }) {
  const updateCampaign  = useUpdateCampaign()
  const duplicateCampaign = useDuplicateCampaign()
  const createStep      = useCreateStep()
  const updateStep      = useUpdateStep()
  const deleteStep      = useDeleteStep()
  const enrollProspect  = useEnrollProspect()
  const removeProspect  = useRemoveProspect()

  const [editingStepId, setEditingStepId]   = useState<string | null>(null)
  const [addingStep,    setAddingStep]       = useState(false)
  const [showEnroll,    setShowEnroll]       = useState(false)
  const [showActions,   setShowActions]      = useState(false)

  const sortedSteps   = [...campaign.steps].sort((a, b) => a.step_number - b.step_number)
  const enrolledIds   = new Set(campaign.enrolled.map(e => e.prospect_id))
  const prospectCount = campaign.enrolled.length

  const setStatus = (status: CampaignStatus) => updateCampaign.mutate({ id: campaign.id, status })

  const incStat = (field: 'emails_sent' | 'replies' | 'meetings' | 'clients', delta: 1 | -1) => {
    const cur = campaign[field]
    updateCampaign.mutate({ id: campaign.id, [field]: Math.max(0, cur + delta) })
  }

  const TypeIcon = TYPE_CFG[campaign.type].icon

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-100 shrink-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1.5">{campaign.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={campaign.type} size="md" />
              <StatusBadge status={campaign.status} />
              <span className="text-xs text-gray-400">
                Créée le {format(parseISO(campaign.created_at), 'd MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowActions(v => !v)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-9 z-30 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44 text-sm">
                  <button onClick={() => { onEdit(); setShowActions(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700">
                    <Edit2 className="h-3.5 w-3.5 text-gray-400" /> Modifier
                  </button>
                  <button onClick={() => { duplicateCampaign.mutate(campaign); setShowActions(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-700">
                    <Copy className="h-3.5 w-3.5 text-gray-400" /> Dupliquer
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  {campaign.status !== 'active' && campaign.status !== 'archived' && (
                    <button onClick={() => { setStatus('active'); setShowActions(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-emerald-50 text-emerald-700">
                      <Play className="h-3.5 w-3.5" /> Activer
                    </button>
                  )}
                  {campaign.status === 'active' && (
                    <button onClick={() => { setStatus('paused'); setShowActions(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-amber-50 text-amber-700">
                      <Pause className="h-3.5 w-3.5" /> Mettre en pause
                    </button>
                  )}
                  {campaign.status === 'paused' && (
                    <button onClick={() => { setStatus('active'); setShowActions(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-emerald-50 text-emerald-700">
                      <Play className="h-3.5 w-3.5" /> Reprendre
                    </button>
                  )}
                  {(campaign.status === 'active' || campaign.status === 'paused') && (
                    <button onClick={() => { setStatus('archived'); setShowActions(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-600">
                      <Archive className="h-3.5 w-3.5" /> Archiver
                    </button>
                  )}
                  {campaign.status === 'archived' && (
                    <button onClick={() => { setStatus('draft'); setShowActions(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-gray-600">
                      <ArrowUpDown className="h-3.5 w-3.5" /> Réactiver
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Objective + description */}
        {campaign.objective && (
          <div className="flex items-start gap-2 rounded-xl bg-brand-50 border border-brand-100 px-3 py-2.5 mb-2">
            <Target className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
            <p className="text-sm text-brand-700 font-medium">{campaign.objective}</p>
          </div>
        )}
        {campaign.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{campaign.description}</p>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="px-6 py-5 border-b border-gray-100 shrink-0">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Statistiques</h3>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">

          {/* Prospects (auto from enrolled) */}
          <div className="rounded-xl border border-gray-100 bg-brand-50 p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Prospects</p>
              <div className="h-6 w-6 rounded-lg bg-brand-100 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-brand-600" />
              </div>
            </div>
            <p className="text-3xl font-black tabular-nums leading-none text-brand-600">{prospectCount}</p>
            <p className="text-[10px] text-gray-400">Auto depuis les enrôlements</p>
          </div>

          <StatCounter label="Emails envoyés" value={campaign.emails_sent}
            icon={Send} color="text-violet-600" bg="bg-violet-50"
            onIncrement={() => incStat('emails_sent', 1)}
            onDecrement={() => incStat('emails_sent', -1)} />

          <StatCounter label="Réponses" value={campaign.replies}
            icon={MessageCircle} color="text-teal-600" bg="bg-teal-50"
            onIncrement={() => incStat('replies', 1)}
            onDecrement={() => incStat('replies', -1)} />

          <StatCounter label="Rendez-vous" value={campaign.meetings}
            icon={CalendarCheck} color="text-amber-600" bg="bg-amber-50"
            onIncrement={() => incStat('meetings', 1)}
            onDecrement={() => incStat('meetings', -1)} />

          <StatCounter label="Clients signés" value={campaign.clients}
            icon={Trophy} color="text-emerald-600" bg="bg-emerald-50"
            onIncrement={() => incStat('clients', 1)}
            onDecrement={() => incStat('clients', -1)} />

          {/* Taux de réponse */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Taux réponse</p>
              <div className="h-6 w-6 rounded-lg bg-gray-100 flex items-center justify-center">
                <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
              </div>
            </div>
            <p className="text-3xl font-black tabular-nums leading-none text-gray-700">
              {campaign.emails_sent > 0
                ? `${Math.round(campaign.replies / campaign.emails_sent * 100)}%`
                : '—'}
            </p>
            <p className="text-[10px] text-gray-400">Réponses / Emails envoyés</p>
          </div>
        </div>
      </div>

      {/* ── Séquence emails ── */}
      {campaign.type === 'email' && (
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              Séquence d'emails
              <span className="ml-2 text-xs font-normal text-gray-400">{sortedSteps.length} étape{sortedSteps.length !== 1 ? 's' : ''}</span>
            </h3>
          </div>

          {sortedSteps.length === 0 && !addingStep && (
            <p className="text-sm text-gray-400 italic mb-3">Aucune étape — ajoutez un premier email.</p>
          )}

          <div className="space-y-0">
            {sortedSteps.map((step, i) => {
              const isLast    = i === sortedSteps.length - 1 && !addingStep
              const isEditing = editingStepId === step.id
              const toneLabel = TONES.find(t => t.value === step.tone)?.label ?? step.tone
              const delayLabel = step.step_number === 1 ? 'Envoi immédiat' : `J+${step.delay_days}`

              return (
                <div key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {step.step_number}
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[1.5rem]" />}
                  </div>
                  <div className={cn('flex-1', isLast ? 'pb-0' : 'pb-4')}>
                    <div className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-colors group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs text-gray-400">{delayLabel}</span>
                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{toneLabel}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {step.subject || <span className="text-gray-400 italic font-normal">Objet non défini</span>}
                          </p>
                          {step.body && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{step.body}</p>}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => { setAddingStep(false); setEditingStepId(step.id) }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteStep.mutate(step.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {isEditing && (
                        <StepForm
                          initial={{ delay_days: step.delay_days, subject: step.subject, body: step.body, tone: step.tone as EmailDraftTone }}
                          isFirst={step.step_number === 1}
                          onSave={v => updateStep.mutate({ id: step.id, ...v }, { onSuccess: () => setEditingStepId(null) })}
                          onCancel={() => setEditingStepId(null)}
                          saving={updateStep.isPending}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {addingStep ? (
              <div className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-7 w-7 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">
                    {sortedSteps.length + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5">
                    <p className="text-sm font-medium text-gray-700 mb-1">Nouvelle étape</p>
                    <StepForm
                      initial={{ delay_days: sortedSteps.length === 0 ? 0 : 3, subject: '', body: '', tone: 'professional' }}
                      isFirst={sortedSteps.length === 0}
                      onSave={v => createStep.mutate(
                        { campaign_id: campaign.id, step_number: sortedSteps.length + 1, ...v },
                        { onSuccess: () => setAddingStep(false) },
                      )}
                      onCancel={() => setAddingStep(false)}
                      saving={createStep.isPending}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setEditingStepId(null); setAddingStep(true) }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm hover:border-brand-300 hover:text-brand-600 transition-colors w-full justify-center mt-1"
              >
                <Plus className="h-4 w-4" /> Ajouter une étape
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Prospects enrôlés ── */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            Prospects enrôlés
            <span className="ml-2 text-xs font-normal text-gray-400">{prospectCount}</span>
          </h3>
          <button onClick={() => setShowEnroll(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-medium hover:bg-brand-100 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>

        {campaign.enrolled.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-6 text-center">
            <Users className="h-6 w-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucun prospect enrôlé</p>
            <button onClick={() => setShowEnroll(true)} className="mt-2 text-xs text-brand-600 hover:underline">
              Ajouter le premier
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {campaign.enrolled.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5 px-3.5 bg-gray-50 rounded-xl group">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.prospect?.company_name ?? '—'}</p>
                  <p className="text-xs text-gray-400">
                    Étape {e.current_step} · {
                      e.status === 'active'       ? 'En cours'     :
                      e.status === 'completed'    ? 'Terminé'      :
                      e.status === 'paused'       ? 'En pause'     :
                      'Désabonné'
                    }
                  </p>
                </div>
                <button onClick={() => removeProspect.mutate(e.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEnroll && (
        <EnrollModal
          enrolledIds={enrolledIds}
          onClose={() => setShowEnroll(false)}
          onEnroll={prospectId => enrollProspect.mutate({ campaign_id: campaign.id, prospect_id: prospectId })}
        />
      )}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export function ProspectionCampagnes() {
  const { data: campaigns = [], isLoading, error, refetch } = useCampaigns()
  const createCampaign  = useCreateCampaign()
  const updateCampaign  = useUpdateCampaign()
  const deleteCampaign  = useDeleteCampaign()

  const [selectedId,     setSelectedId]     = useState<string | null>(null)
  const [showNew,        setShowNew]         = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<CampaignRow | null>(null)
  const [confirmDelete,  setConfirmDelete]   = useState<CampaignRow | null>(null)
  const [search,         setSearch]          = useState('')
  const [statusFilter,   setStatusFilter]    = useState<CampaignStatus | 'all'>('all')

  const filtered = campaigns
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  const selected = campaigns.find(c => c.id === selectedId) ?? null

  const handleCreate = (form: CampaignFormState) => {
    createCampaign.mutate(
      { name: form.name, description: form.description || null, objective: form.objective || null, type: form.type },
      { onSuccess: (data: CampaignBase) => { setSelectedId(data.id); setShowNew(false) } },
    )
  }

  const handleEdit = (form: CampaignFormState) => {
    if (!editingCampaign) return
    updateCampaign.mutate(
      { id: editingCampaign.id, name: form.name, description: form.description || null,
        objective: form.objective || null, type: form.type, status: form.status },
      { onSuccess: () => setEditingCampaign(null) },
    )
  }

  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    deleteCampaign.mutate(confirmDelete.id, {
      onSuccess: () => {
        if (selectedId === confirmDelete.id) setSelectedId(null)
        setConfirmDelete(null)
      },
    })
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

        {/* ── Left panel ── */}
        <div className="w-80 xl:w-96 border-r border-gray-100 flex flex-col bg-gray-50 shrink-0">
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Campagnes
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {campaigns.length}
                </span>
              </h1>
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Nouvelle
              </button>
            </div>

            <div className="relative mb-2.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white" />
            </div>

            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  className={cn('px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                    statusFilter === f.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <p className="text-sm text-red-500">Erreur de chargement</p>
                <button onClick={() => refetch()} className="text-xs text-brand-600 hover:underline">Réessayer</button>
              </div>
            )}
            {!isLoading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">
                  {campaigns.length === 0 ? 'Aucune campagne.' : 'Aucun résultat.'}
                </p>
                {campaigns.length === 0 && (
                  <button onClick={() => setShowNew(true)} className="text-xs text-brand-600 hover:underline">
                    Créer votre première campagne
                  </button>
                )}
              </div>
            )}
            {filtered.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                selected={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
                onDelete={() => setConfirmDelete(c)}
              />
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 bg-white overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-8">
              <div className="h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center">
                <Layers className="h-8 w-8 text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Sélectionnez une campagne</h2>
                <p className="text-sm text-gray-400 max-w-xs">
                  Choisissez une campagne dans la liste ou créez-en une nouvelle.
                </p>
              </div>
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
                <Plus className="h-4 w-4" /> Nouvelle campagne
              </button>
            </div>
          ) : (
            <CampaignDetail
              key={selected.id}
              campaign={selected}
              onEdit={() => setEditingCampaign(selected)}
            />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showNew && (
        <CampaignFormModal
          title="Nouvelle campagne"
          onClose={() => setShowNew(false)}
          onSave={handleCreate}
          saving={createCampaign.isPending}
        />
      )}

      {editingCampaign && (
        <CampaignFormModal
          title="Modifier la campagne"
          initial={{
            name:        editingCampaign.name,
            description: editingCampaign.description ?? '',
            objective:   editingCampaign.objective   ?? '',
            type:        editingCampaign.type,
            status:      editingCampaign.status,
          }}
          onClose={() => setEditingCampaign(null)}
          onSave={handleEdit}
          saving={updateCampaign.isPending}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-gray-900 mb-2">Supprimer la campagne ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>"{confirmDelete.name}"</strong>, ses étapes et ses enrôlements seront définitivement supprimés.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleConfirmDelete} disabled={deleteCampaign.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
