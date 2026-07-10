import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { cn } from '@/lib/utils'
import {
  Plus, Trash2, Edit2, Check, X,
  Play, Pause, Archive, Copy,
  Users, Clock, Layers, Mail, Search, AlertCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign,
  useDuplicateCampaign, useCreateStep, useUpdateStep, useDeleteStep,
  useEnrollProspect, useRemoveProspect,
  type CampaignRow, type CampaignStatus, type CampaignStep, type CampaignBase,
} from '@/hooks/useCampagnes'
import { useProspectsForDraft } from '@/hooks/useEmailDrafts'
import type { EmailDraftTone } from '@/types'

/* ─── Constants ──────────────────────────────────────────────────────────── */

const TONES: { value: EmailDraftTone; label: string }[] = [
  { value: 'professional', label: 'Professionnel' },
  { value: 'formal', label: 'Formel' },
  { value: 'friendly', label: 'Amical' },
  { value: 'direct', label: 'Direct' },
]

const STATUS_CFG: Record<CampaignStatus, { label: string; bg: string; text: string }> = {
  draft:    { label: 'Brouillon',  bg: 'bg-gray-100',    text: 'text-gray-600' },
  active:   { label: 'Active',     bg: 'bg-emerald-100', text: 'text-emerald-700' },
  paused:   { label: 'En pause',   bg: 'bg-amber-100',   text: 'text-amber-700' },
  archived: { label: 'Archivée',   bg: 'bg-gray-100',    text: 'text-gray-400' },
}

const STATUS_FILTERS: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'Toutes' },
  { value: 'active',   label: 'Actives' },
  { value: 'draft',    label: 'Brouillons' },
  { value: 'paused',   label: 'En pause' },
  { value: 'archived', label: 'Archivées' },
]

/* ─── Step form state ────────────────────────────────────────────────────── */

interface StepFormState {
  delay_days: number
  subject: string
  body: string
  tone: EmailDraftTone
}

/* ─── StatusBadge ────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: CampaignStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', c.bg, c.text)}>
      {c.label}
    </span>
  )
}

/* ─── CampaignCard ───────────────────────────────────────────────────────── */

function CampaignCard({
  campaign, selected, onClick,
}: {
  campaign: CampaignRow
  selected: boolean
  onClick: () => void
}) {
  const updatedAt = (() => {
    try { return format(parseISO(campaign.updated_at), 'd MMM', { locale: fr }) }
    catch { return '' }
  })()

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 rounded-xl border transition-all',
        selected
          ? 'border-brand-200 bg-brand-50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className={cn('text-sm font-semibold truncate flex-1', selected ? 'text-brand-700' : 'text-gray-900')}>
          {campaign.name}
        </p>
        <StatusBadge status={campaign.status} />
      </div>
      {campaign.description && (
        <p className="text-xs text-gray-400 truncate mb-1.5">{campaign.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {campaign.steps.length} étape{campaign.steps.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {campaign.enrolled.length}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="h-3 w-3" />
          {updatedAt}
        </span>
      </div>
    </button>
  )
}

/* ─── StepForm ───────────────────────────────────────────────────────────── */

function StepForm({
  initial, isFirst, onSave, onCancel, saving,
}: {
  initial: StepFormState
  isFirst: boolean
  onSave: (v: StepFormState) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<StepFormState>(initial)
  const set = <K extends keyof StepFormState>(k: K, v: StepFormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="mt-3 space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
      {!isFirst && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Délai après l'étape précédente
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={365}
              value={form.delay_days}
              onChange={e => set('delay_days', Number(e.target.value))}
              className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <span className="text-sm text-gray-500">jour{form.delay_days !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Objet</label>
        <input
          type="text"
          value={form.subject}
          onChange={e => set('subject', e.target.value)}
          placeholder="Objet de l'email…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Corps</label>
        <textarea
          value={form.body}
          onChange={e => set('body', e.target.value)}
          placeholder="Contenu de l'email…"
          rows={5}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Ton</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => set('tone', t.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                form.tone === t.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.subject.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="h-3.5 w-3.5" />
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Annuler
        </button>
      </div>
    </div>
  )
}

/* ─── StepCard ───────────────────────────────────────────────────────────── */

function StepCard({
  step, isLast, editingStepId,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete, saving,
}: {
  step: CampaignStep
  isLast: boolean
  editingStepId: string | null
  onStartEdit: (id: string) => void
  onSaveEdit: (id: string, v: StepFormState) => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
  saving: boolean
}) {
  const isEditing = editingStepId === step.id
  const toneLabel = TONES.find(t => t.value === step.tone)?.label ?? step.tone
  const delayLabel = step.step_number === 1
    ? 'Envoi immédiat'
    : `J+${step.delay_days} après étape ${step.step_number - 1}`

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
          {step.step_number}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[1rem]" />}
      </div>
      <div className={cn('flex-1', isLast ? 'pb-0' : 'pb-5')}>
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs text-gray-400">{delayLabel}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{toneLabel}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {step.subject || <span className="text-gray-400 italic font-normal">Objet non défini</span>}
              </p>
              {step.body && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 whitespace-pre-wrap">{step.body}</p>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onStartEdit(step.id)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                title="Modifier"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(step.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="Supprimer l'étape"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {isEditing && (
            <StepForm
              initial={{ delay_days: step.delay_days, subject: step.subject, body: step.body, tone: step.tone }}
              isFirst={step.step_number === 1}
              onSave={v => onSaveEdit(step.id, v)}
              onCancel={onCancelEdit}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── NewCampaignModal ───────────────────────────────────────────────────── */

function NewCampaignModal({
  onClose, onCreate,
}: {
  onClose: () => void
  onCreate: (name: string, description: string) => void
}) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    onCreate(name.trim(), desc.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Nouvelle campagne</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Ex : Séquence agences web — 3 emails"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Objectif, cible, ton général…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── EnrollModal ────────────────────────────────────────────────────────── */

function EnrollModal({
  enrolledIds, onClose, onEnroll,
}: {
  enrolledIds: Set<string>
  onClose: () => void
  onEnroll: (prospectId: string) => void
}) {
  const { data: prospects = [], isLoading } = useProspectsForDraft()
  const [search, setSearch] = useState('')
  const filtered = prospects.filter(p =>
    p.company_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Ajouter des prospects</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un prospect…"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading && <p className="text-sm text-gray-400 text-center py-6">Chargement…</p>}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Aucun prospect trouvé</p>
          )}
          {filtered.map(p => {
            const enrolled = enrolledIds.has(p.id)
            return (
              <button
                key={p.id}
                onClick={() => { if (!enrolled) onEnroll(p.id) }}
                disabled={enrolled}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors',
                  enrolled
                    ? 'bg-emerald-50 text-emerald-700 cursor-default'
                    : 'hover:bg-gray-50 text-gray-700 cursor-pointer',
                )}
              >
                <span className="font-medium">{p.company_name}</span>
                {enrolled
                  ? <span className="text-xs text-emerald-600">Enrôlé</span>
                  : <Plus className="h-3.5 w-3.5 text-gray-400" />
                }
              </button>
            )
          })}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── CampaignDetail ─────────────────────────────────────────────────────── */

function CampaignDetail({ campaign }: { campaign: CampaignRow }) {
  const updateCampaign = useUpdateCampaign()
  const duplicateCampaign = useDuplicateCampaign()
  const createStep = useCreateStep()
  const updateStep = useUpdateStep()
  const deleteStep = useDeleteStep()
  const enrollProspect = useEnrollProspect()
  const removeProspect = useRemoveProspect()

  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [addingStep, setAddingStep] = useState(false)
  const [showEnroll, setShowEnroll] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(campaign.name)
  const [editingDesc, setEditingDesc] = useState(false)
  const [descVal, setDescVal] = useState(campaign.description ?? '')

  const sortedSteps = [...campaign.steps].sort((a, b) => a.step_number - b.step_number)
  const enrolledIds = new Set(campaign.enrolled.map(e => e.prospect_id))

  const setStatus = (status: CampaignStatus) =>
    updateCampaign.mutate({ id: campaign.id, status })

  const saveName = () => {
    const trimmed = nameVal.trim()
    if (trimmed && trimmed !== campaign.name) {
      updateCampaign.mutate({ id: campaign.id, name: trimmed })
    }
    setEditingName(false)
  }

  const saveDesc = () => {
    updateCampaign.mutate({ id: campaign.id, description: descVal.trim() || null })
    setEditingDesc(false)
  }

  const handleSaveEdit = (id: string, v: StepFormState) => {
    updateStep.mutate({ id, ...v }, { onSuccess: () => setEditingStepId(null) })
  }

  const handleCreateStep = (v: StepFormState) => {
    createStep.mutate(
      { campaign_id: campaign.id, step_number: sortedSteps.length + 1, ...v },
      { onSuccess: () => setAddingStep(false) },
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* ── Header ── */}
      <div className="p-6 border-b border-gray-100 shrink-0">
        {editingName ? (
          <div className="flex gap-2 mb-3">
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameVal(campaign.name); setEditingName(false) } }}
              className="flex-1 border border-brand-300 rounded-lg px-3 py-1.5 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <button onClick={saveName} className="p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"><Check className="h-4 w-4" /></button>
            <button onClick={() => { setNameVal(campaign.name); setEditingName(false) }} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"><X className="h-4 w-4 text-gray-500" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2 group">
            <h2 className="text-xl font-bold text-gray-900 flex-1">{campaign.name}</h2>
            <StatusBadge status={campaign.status} />
            <button
              onClick={() => setEditingName(true)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-opacity"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {editingDesc ? (
          <div className="space-y-2 mb-4">
            <textarea
              autoFocus
              value={descVal}
              onChange={e => setDescVal(e.target.value)}
              rows={2}
              className="w-full border border-brand-300 rounded-lg px-3 py-2 text-sm text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <div className="flex gap-2">
              <button onClick={saveDesc} className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium flex items-center gap-1"><Check className="h-3 w-3" />Enregistrer</button>
              <button onClick={() => { setDescVal(campaign.description ?? ''); setEditingDesc(false) }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500">Annuler</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditingDesc(true)}
            className="text-sm text-gray-400 hover:text-gray-600 text-left group flex items-start gap-1 mb-4"
          >
            <span>{campaign.description || <span className="italic">Ajouter une description…</span>}</span>
            <Edit2 className="h-3 w-3 mt-0.5 opacity-0 group-hover:opacity-100 shrink-0" />
          </button>
        )}

        {/* Status actions */}
        <div className="flex flex-wrap gap-2">
          {campaign.status === 'draft' && (
            <button onClick={() => setStatus('active')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors">
              <Play className="h-3.5 w-3.5" /> Activer
            </button>
          )}
          {campaign.status === 'active' && (
            <button onClick={() => setStatus('paused')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors">
              <Pause className="h-3.5 w-3.5" /> Mettre en pause
            </button>
          )}
          {campaign.status === 'paused' && (
            <button onClick={() => setStatus('active')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors">
              <Play className="h-3.5 w-3.5" /> Reprendre
            </button>
          )}
          {(campaign.status === 'active' || campaign.status === 'paused') && (
            <button onClick={() => setStatus('archived')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
              <Archive className="h-3.5 w-3.5" /> Archiver
            </button>
          )}
          {campaign.status === 'archived' && (
            <button onClick={() => setStatus('draft')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
              <Play className="h-3.5 w-3.5" /> Réactiver
            </button>
          )}
          <button
            onClick={() => duplicateCampaign.mutate(campaign)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            <Copy className="h-3.5 w-3.5" /> Dupliquer
          </button>
        </div>
      </div>

      {/* ── Steps ── */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-900">
            Séquence d'emails
            <span className="ml-2 text-xs font-normal text-gray-400">{sortedSteps.length} étape{sortedSteps.length !== 1 ? 's' : ''}</span>
          </h3>
        </div>

        {sortedSteps.length === 0 && !addingStep && (
          <p className="text-sm text-gray-400 italic mb-4">
            Aucune étape. Ajoutez un premier email à cette séquence.
          </p>
        )}

        {sortedSteps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            isLast={i === sortedSteps.length - 1 && !addingStep}
            editingStepId={editingStepId}
            onStartEdit={id => { setAddingStep(false); setEditingStepId(id) }}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setEditingStepId(null)}
            onDelete={id => deleteStep.mutate(id)}
            saving={updateStep.isPending}
          />
        ))}

        {addingStep ? (
          <div className="flex gap-4">
            <div className="flex flex-col items-center shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">
                {sortedSteps.length + 1}
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Nouvelle étape</p>
                <StepForm
                  initial={{ delay_days: sortedSteps.length === 0 ? 0 : 3, subject: '', body: '', tone: 'professional' }}
                  isFirst={sortedSteps.length === 0}
                  onSave={handleCreateStep}
                  onCancel={() => setAddingStep(false)}
                  saving={createStep.isPending}
                />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setEditingStepId(null); setAddingStep(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm hover:border-brand-300 hover:text-brand-600 transition-colors w-full justify-center mt-2"
          >
            <Plus className="h-4 w-4" /> Ajouter une étape
          </button>
        )}
      </div>

      {/* ── Enrolled prospects ── */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            Prospects enrôlés
            <span className="ml-2 text-xs font-normal text-gray-400">{campaign.enrolled.length}</span>
          </h3>
          <button
            onClick={() => setShowEnroll(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-medium hover:bg-brand-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>

        {campaign.enrolled.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Aucun prospect enrôlé dans cette campagne.</p>
        ) : (
          <div className="space-y-2">
            {campaign.enrolled.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl group">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.prospect?.company_name ?? '—'}</p>
                  <p className="text-xs text-gray-400">
                    Étape {e.current_step} / {campaign.steps.length}
                    {' · '}
                    {e.status === 'active' ? 'En cours' : e.status === 'completed' ? 'Terminé' : e.status === 'paused' ? 'En pause' : 'Désabonné'}
                  </p>
                </div>
                <button
                  onClick={() => removeProspect.mutate(e.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                  title="Retirer"
                >
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
  const createCampaign = useCreateCampaign()
  const deleteCampaign = useDeleteCampaign()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<CampaignRow | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')

  const filtered = campaigns
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  const selected = campaigns.find(c => c.id === selectedId) ?? null

  const handleCreate = (name: string, description: string) => {
    createCampaign.mutate(
      { name, description: description || undefined },
      { onSuccess: (data: CampaignBase) => setSelectedId(data.id) },
    )
  }

  const handleConfirmDelete = (campaign: CampaignRow) => {
    deleteCampaign.mutate(campaign.id, {
      onSuccess: () => {
        if (selectedId === campaign.id) setSelectedId(null)
        setConfirmDelete(null)
      },
    })
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* ── Left: list ── */}
        <div className="w-80 xl:w-96 border-r border-gray-100 flex flex-col bg-gray-50 shrink-0">
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base font-bold text-gray-900">
                Campagnes
                <span className="ml-2 text-xs font-normal text-gray-400">{campaigns.length}</span>
              </h1>
              <button
                onClick={() => setShowNew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Nouvelle
              </button>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                    statusFilter === f.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
                ))}
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
              <div key={c.id} className="group relative">
                <CampaignCard
                  campaign={c}
                  selected={selectedId === c.id}
                  onClick={() => setSelectedId(c.id)}
                />
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDelete(c) }}
                  className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: detail ── */}
        <div className="flex-1 bg-white overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-8">
              <div className="h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center">
                <Layers className="h-8 w-8 text-brand-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-700">Sélectionnez une campagne</h2>
              <p className="text-sm text-gray-400 max-w-sm">
                Choisissez une campagne dans la liste ou créez-en une nouvelle pour définir votre séquence d'emails.
              </p>
              <button
                onClick={() => setShowNew(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors mt-2"
              >
                <Plus className="h-4 w-4" /> Nouvelle campagne
              </button>
            </div>
          ) : (
            <CampaignDetail key={selected.id} campaign={selected} />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showNew && (
        <NewCampaignModal onClose={() => setShowNew(false)} onCreate={handleCreate} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-gray-900 mb-2">Supprimer la campagne ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>"{confirmDelete.name}"</strong> et toutes ses étapes seront définitivement supprimées.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleConfirmDelete(confirmDelete)}
                disabled={deleteCampaign.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
