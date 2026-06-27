import { useState, useEffect } from 'react'
import {
  Plus, UserCheck, TrendingUp, DollarSign, Users, Award,
  Phone, Mail, Trash2, Search,
  List, Columns3, X, GripVertical, ChevronRight,
  Building2, Percent, CheckCircle2,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from '@/components/ui/Table'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  useLeads, useCreateLead, useUpdateLead,
  useUpdateLeadStatus, useDeleteLead, useConvertLeadToClient,
} from '@/hooks/useLeads'
import type { Lead, LeadStatus } from '@/types'

/* ─── CONSTANTES ─────────────────────────────────────────────────────────── */

type ViewMode = 'kanban' | 'liste'

type ColDef = {
  status: LeadStatus; label: string
  bg: string; header: string; dot: string
}

const COLUMNS: ColDef[] = [
  { status: 'nouveau',     label: 'Nouveau',             bg: 'bg-blue-50',    header: 'bg-blue-500',    dot: 'bg-blue-500' },
  { status: 'contact',     label: 'Contacté',            bg: 'bg-indigo-50',  header: 'bg-indigo-500',  dot: 'bg-indigo-500' },
  { status: 'qualifie',    label: 'Qualification',       bg: 'bg-violet-50',  header: 'bg-violet-500',  dot: 'bg-violet-500' },
  { status: 'proposition', label: 'Proposition',         bg: 'bg-amber-50',   header: 'bg-amber-500',   dot: 'bg-amber-500' },
  { status: 'negocie',     label: 'Négociation',         bg: 'bg-orange-50',  header: 'bg-orange-500',  dot: 'bg-orange-500' },
  { status: 'gagne',       label: 'Gagné',               bg: 'bg-emerald-50', header: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { status: 'perdu',       label: 'Perdu',               bg: 'bg-red-50',     header: 'bg-red-500',     dot: 'bg-red-500' },
]

const ACTIVE_STATUSES: LeadStatus[] = ['nouveau', 'contact', 'qualifie', 'proposition', 'negocie']

const STATUS_OPTIONS = COLUMNS.map(c => ({ value: c.status, label: c.label }))

const SOURCES = [
  'LinkedIn', 'Site web', 'Formulaire', 'Référence', 'Instagram',
  'Facebook', 'Google', 'Email', 'Téléphone', 'Événement', 'Autre',
]

const FORM_INIT = {
  prenom: '', nom: '', email: '', telephone: '', entreprise: '',
  source: '', budget_estime: '', besoin: '', status: 'nouveau' as LeadStatus,
}

/* ─── UTILITAIRES ─────────────────────────────────────────────────────────── */

function colDef(status: LeadStatus) {
  return COLUMNS.find(c => c.status === status) ?? COLUMNS[0]
}

function getSourceIcon(source: string) {
  const map: Record<string, string> = {
    'LinkedIn': '🔗', 'Instagram': '📸', 'Facebook': '👥',
    'Google': '🔍', 'Site web': '🌐', 'Formulaire': '📋',
    'Référence': '🤝', 'Email': '📧', 'Téléphone': '📞',
    'Événement': '🎪',
  }
  return map[source] ?? '📌'
}

/* ─── FICHE LEAD ─────────────────────────────────────────────────────────── */

type FicheForm = {
  prenom: string; nom: string; email: string; telephone: string
  entreprise: string; source: string; budget_estime: string
  besoin: string; status: LeadStatus
}

function LeadFiche({
  lead, onClose, onSave, onDelete, onConvert,
}: {
  lead: Lead
  onClose: () => void
  onSave: (data: FicheForm) => Promise<void>
  onDelete: () => Promise<void>
  onConvert: (l: Lead) => void
}) {
  const [form, setForm] = useState<FicheForm>({
    prenom: lead.prenom, nom: lead.nom, email: lead.email,
    telephone: lead.telephone ?? '', entreprise: lead.entreprise ?? '',
    source: lead.source ?? '', budget_estime: lead.budget_estime ? String(lead.budget_estime) : '',
    besoin: lead.besoin ?? '', status: lead.status,
  })
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setForm({
      prenom: lead.prenom, nom: lead.nom, email: lead.email,
      telephone: lead.telephone ?? '', entreprise: lead.entreprise ?? '',
      source: lead.source ?? '', budget_estime: lead.budget_estime ? String(lead.budget_estime) : '',
      besoin: lead.besoin ?? '', status: lead.status,
    })
  }, [lead.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof FicheForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete()
    setDeleting(false)
    onClose()
  }

  const isActive = ACTIVE_STATUSES.includes(lead.status)
  const isConverted = !!lead.client_id

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white shadow-2xl h-full overflow-y-auto flex flex-col border-l border-gray-200">

        {/* Header */}
        <div className={cn('px-5 pt-5 pb-4 shrink-0', colDef(lead.status).bg)}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar nom={lead.nom} prenom={lead.prenom} size="lg" />
              <div>
                <h3 className="text-base font-bold text-gray-900">{lead.prenom} {lead.nom}</h3>
                {lead.entreprise && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Building2 className="h-3 w-3" /> {lead.entreprise}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge status={lead.status} dot />
                  {isConverted && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Client
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            {lead.email && (
              <a href={`mailto:${lead.email}`}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-gray-200 text-gray-600 transition">
                <Mail className="h-3 w-3" /> Email
              </a>
            )}
            {lead.telephone && (
              <a href={`tel:${lead.telephone}`}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/80 hover:bg-white rounded-lg border border-gray-200 text-gray-600 transition">
                <Phone className="h-3 w-3" /> Appeler
              </a>
            )}
            {isActive && !isConverted && (
              <button
                onClick={() => onConvert(lead)}
                className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition font-medium">
                <UserCheck className="h-3 w-3" /> Convertir en client
              </button>
            )}
          </div>
        </div>

        {/* Status progression */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex gap-1">
            {COLUMNS.map((col, i) => {
              const currentIdx = COLUMNS.findIndex(c => c.status === form.status)
              const isPast = i < currentIdx
              const isCurrent = i === currentIdx
              return (
                <button
                  key={col.status}
                  onClick={() => setForm(f => ({ ...f, status: col.status }))}
                  title={col.label}
                  className={cn(
                    'flex-1 h-1.5 rounded-full transition-all',
                    isCurrent ? col.dot : isPast ? col.dot + ' opacity-40' : 'bg-gray-200',
                  )}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-gray-400">Nouveau</span>
            <span className="text-[11px] font-semibold text-gray-700">{colDef(form.status).label}</span>
            <span className="text-[10px] text-gray-400">Gagné</span>
          </div>
          {/* Status buttons */}
          <div className="flex flex-wrap gap-1 mt-2">
            {COLUMNS.map(col => (
              <button
                key={col.status}
                onClick={() => setForm(f => ({ ...f, status: col.status }))}
                className={cn(
                  'text-[10px] font-medium px-2 py-1 rounded-lg border transition',
                  form.status === col.status
                    ? `${col.header} text-white border-transparent`
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white',
                )}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">

          {/* Identité */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Identité</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom" value={form.prenom} onChange={set('prenom')} />
              <Input label="Nom" value={form.nom} onChange={set('nom')} />
            </div>
            <div className="mt-3">
              <Input label="Entreprise" value={form.entreprise} onChange={set('entreprise')}
                leading={<Building2 className="h-3.5 w-3.5" />} />
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Contact</p>
            <div className="space-y-2">
              <Input label="Email" type="email" value={form.email} onChange={set('email')}
                leading={<Mail className="h-3.5 w-3.5" />} />
              <Input label="Téléphone" value={form.telephone} onChange={set('telephone')}
                leading={<Phone className="h-3.5 w-3.5" />} />
            </div>
          </div>

          {/* Opportunité */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Opportunité</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Source</label>
                <select
                  value={form.source}
                  onChange={set('source')}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition"
                >
                  <option value="">Sélectionner…</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Budget estimé (€)" type="number" value={form.budget_estime} onChange={set('budget_estime')}
                leading={<DollarSign className="h-3.5 w-3.5" />} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes & besoin</p>
            <textarea
              value={form.besoin}
              onChange={set('besoin')}
              rows={4}
              placeholder="Besoin du client, contexte, remarques…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition"
            />
          </div>

          {/* Meta info */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1 text-gray-500">
            <div className="flex justify-between">
              <span>Créé le</span>
              <span className="font-medium text-gray-700">{formatDate(lead.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Modifié le</span>
              <span className="font-medium text-gray-700">{formatDate(lead.updated_at)}</span>
            </div>
            {lead.budget_estime && (
              <div className="flex justify-between">
                <span>Valeur estimée</span>
                <span className="font-bold text-gray-800">{formatCurrency(lead.budget_estime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? 'Suppression…' : 'Supprimer'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !form.prenom || !form.nom}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── LEAD CARD ──────────────────────────────────────────────────────────── */

function LeadCard({
  lead, isDragging, onOpen, onDragStart, onDragEnd,
}: {
  lead: Lead; isDragging: boolean
  onOpen: (l: Lead) => void
  onDragStart: () => void; onDragEnd: () => void
}) {
  const isConverted = !!lead.client_id
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(lead)}
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm p-3.5',
        'cursor-pointer select-none group',
        'hover:shadow-card hover:border-gray-200 transition-all',
        isDragging && 'opacity-40 scale-[0.97]',
        isConverted && 'border-l-2 border-l-emerald-400',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2.5">
        <GripVertical className="h-3.5 w-3.5 text-gray-200 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition" />
        <Avatar nom={lead.nom} prenom={lead.prenom} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
              {lead.prenom} {lead.nom}
            </p>
            {isConverted && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
          </div>
          {lead.entreprise && (
            <p className="text-[11px] text-gray-400 truncate leading-tight">{lead.entreprise}</p>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-0.5 mb-2">
        {lead.email && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Mail className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.telephone && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Phone className="h-2.5 w-2.5 shrink-0" />
            <span>{lead.telephone}</span>
          </div>
        )}
      </div>

      {/* Source + besoin */}
      <div className="flex flex-wrap gap-1 mb-2">
        {lead.source && (
          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full leading-none">
            {getSourceIcon(lead.source)} {lead.source}
          </span>
        )}
      </div>
      {lead.besoin && (
        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-2">{lead.besoin}</p>
      )}

      {/* Budget + date */}
      {lead.budget_estime ? (
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{formatDate(lead.created_at, 'dd MMM yy')}</span>
          <span className="text-xs font-semibold text-gray-800">{formatCurrency(lead.budget_estime)}</span>
        </div>
      ) : (
        <p className="text-[10px] text-gray-300 mt-1">{formatDate(lead.created_at, 'dd MMM yy')}</p>
      )}
    </div>
  )
}

/* ─── KANBAN VIEW ─────────────────────────────────────────────────────────── */

function KanbanView({
  leads, onOpen, onCreate,
  onStatusChange,
}: {
  leads: Lead[]
  onOpen: (l: Lead) => void
  onCreate: (status: LeadStatus) => void
  onStatusChange: (id: string, status: LeadStatus) => void
}) {
  const [draggingId, setDraggingId]   = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null)

  const handleDrop = (status: LeadStatus) => {
    if (!draggingId) return
    const lead = leads.find(l => l.id === draggingId)
    if (lead && lead.status !== status) onStatusChange(draggingId, status)
    setDraggingId(null)
    setDragOverCol(null)
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-6">
      <div className="flex gap-3" style={{ minWidth: '1820px' }}>
        {COLUMNS.map(col => {
          const colLeads = leads.filter(l => l.status === col.status)
          const colValue = colLeads.reduce((s, l) => s + (l.budget_estime ?? 0), 0)
          const isOver   = dragOverCol === col.status && draggingId !== null
          return (
            <div
              key={col.status}
              className="flex flex-col w-64 shrink-0"
              onDragEnter={() => { if (draggingId) setDragOverCol(col.status) }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.status)}
            >
              {/* Header */}
              <div className={cn('rounded-t-xl px-3 py-2.5 flex items-center justify-between shrink-0', col.header)}>
                <span className="text-xs font-semibold text-white truncate mr-2">{col.label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {colValue > 0 && (
                    <span className="text-[10px] text-white/70 hidden 2xl:inline">{formatCurrency(colValue)}</span>
                  )}
                  <span className="text-[11px] font-bold text-white bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">
                    {colLeads.length}
                  </span>
                </div>
              </div>
              {/* Drop zone */}
              <div className={cn(
                'flex-1 min-h-[480px] rounded-b-xl p-2 space-y-2 transition-all duration-150',
                isOver ? 'bg-brand-50 ring-2 ring-inset ring-brand-300 ring-dashed' : col.bg,
              )}>
                {colLeads.map(lead => (
                  <LeadCard
                    key={lead.id} lead={lead}
                    isDragging={draggingId === lead.id}
                    onOpen={onOpen}
                    onDragStart={() => setDraggingId(lead.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverCol(null) }}
                  />
                ))}
                <button
                  onClick={() => onCreate(col.status)}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-xs font-medium transition',
                    'flex items-center justify-center gap-1.5',
                    'border border-dashed border-transparent',
                    'text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-white/60',
                    isOver && 'pointer-events-none opacity-0',
                  )}
                >
                  <Plus className="h-3 w-3" /> Ajouter
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── LISTE VIEW ─────────────────────────────────────────────────────────── */

function ListeView({
  leads, onOpen,
}: {
  leads: Lead[]
  onOpen: (l: Lead) => void
}) {
  return (
    <Card padding={false}>
      <Table>
        <Thead>
          <Tr>
            <Th>Lead</Th>
            <Th>Contact</Th>
            <Th>Source</Th>
            <Th>Statut</Th>
            <Th>Budget</Th>
            <Th>Date</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {leads.length === 0 ? <EmptyRow cols={7} /> : leads.map(l => {
            const isConverted = !!l.client_id
            const col = colDef(l.status)
            return (
              <Tr key={l.id} onClick={() => onOpen(l)} className="cursor-pointer">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar nom={l.nom} prenom={l.prenom} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-800">{l.prenom} {l.nom}</p>
                        {isConverted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      {l.entreprise && <p className="text-xs text-gray-400">{l.entreprise}</p>}
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="space-y-0.5">
                    {l.email && (
                      <a href={`mailto:${l.email}`} onClick={e => e.stopPropagation()}
                        className="text-xs text-gray-500 flex items-center gap-1 hover:text-brand-600 transition">
                        <Mail className="h-3 w-3" /> {l.email}
                      </a>
                    )}
                    {l.telephone && (
                      <a href={`tel:${l.telephone}`} onClick={e => e.stopPropagation()}
                        className="text-xs text-gray-400 flex items-center gap-1 hover:text-brand-600 transition">
                        <Phone className="h-3 w-3" /> {l.telephone}
                      </a>
                    )}
                  </div>
                </Td>
                <Td>
                  {l.source ? (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {getSourceIcon(l.source)} {l.source}
                    </span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', col.dot)} />
                    <Badge status={l.status} />
                  </div>
                </Td>
                <Td>
                  {l.budget_estime
                    ? <span className="text-sm font-semibold text-gray-700">{formatCurrency(l.budget_estime)}</span>
                    : <span className="text-gray-300 text-xs">—</span>}
                </Td>
                <Td>
                  <span className="text-xs text-gray-400">{formatDate(l.created_at)}</span>
                </Td>
                <Td onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => onOpen(l)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </Card>
  )
}

/* ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────── */

export function Leads() {
  const [view, setView]             = useState<ViewMode>('kanban')
  const [search, setSearch]         = useState('')
  const [filterSource, setFS]       = useState('')
  const [filterGroup, setFG]        = useState<'tous' | 'actifs' | 'gagnes' | 'perdus'>('tous')
  const [showFunnel, setShowFunnel] = useState(true)
  const [fiche, setFiche]           = useState<Lead | null>(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [addStatus, setAddStatus]   = useState<LeadStatus>('nouveau')
  const [form, setForm]             = useState(FORM_INIT)
  const [convertLead, setConvertLead] = useState<Lead | null>(null)

  const { data: leads = [], isLoading } = useLeads()
  const createLead      = useCreateLead()
  const updateLead      = useUpdateLead()
  const updateStatus    = useUpdateLeadStatus()
  const deleteLead      = useDeleteLead()
  const convertToClient = useConvertLeadToClient()

  /* Sync fiche when data refreshes */
  useEffect(() => {
    if (fiche) {
      const fresh = leads.find(l => l.id === fiche.id)
      if (fresh) setFiche(fresh)
    }
  }, [leads]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Filters */
  const filtered = leads.filter(l => {
    if (search) {
      const q = search.toLowerCase()
      if (!`${l.prenom} ${l.nom} ${l.entreprise ?? ''} ${l.email}`.toLowerCase().includes(q)) return false
    }
    if (filterSource && l.source !== filterSource) return false
    if (filterGroup === 'actifs'  && !ACTIVE_STATUSES.includes(l.status)) return false
    if (filterGroup === 'gagnes'  && l.status !== 'gagne')  return false
    if (filterGroup === 'perdus'  && l.status !== 'perdu')  return false
    return true
  })

  /* Stats */
  const closedLeads = leads.filter(l => l.status === 'gagne' || l.status === 'perdu')
  const wonLeads    = leads.filter(l => l.status === 'gagne')
  const winRate     = closedLeads.length > 0 ? Math.round(wonLeads.length / closedLeads.length * 100) : 0
  const pipelineVal = leads.filter(l => ACTIVE_STATUSES.includes(l.status)).reduce((s, l) => s + (l.budget_estime ?? 0), 0)
  const wonVal      = wonLeads.reduce((s, l) => s + (l.budget_estime ?? 0), 0)
  const activeCount = leads.filter(l => ACTIVE_STATUSES.includes(l.status)).length

  const set = (k: keyof typeof FORM_INIT) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const openAdd = (status: LeadStatus = 'nouveau') => {
    setAddStatus(status)
    setForm({ ...FORM_INIT, status })
    setShowAdd(true)
  }

  const handleCreate = async () => {
    if (!form.prenom || !form.nom) return
    await createLead.mutateAsync({
      prenom: form.prenom, nom: form.nom, email: form.email,
      telephone: form.telephone, entreprise: form.entreprise,
      source: form.source,
      budget_estime: form.budget_estime ? Number(form.budget_estime) : undefined,
      besoin: form.besoin, status: form.status,
    })
    setShowAdd(false)
    setForm(FORM_INIT)
  }

  const handleFicheSave = async (data: FicheForm) => {
    if (!fiche) return
    await updateLead.mutateAsync({
      id: fiche.id,
      prenom: data.prenom, nom: data.nom, email: data.email,
      telephone: data.telephone, entreprise: data.entreprise,
      source: data.source,
      budget_estime: data.budget_estime ? Number(data.budget_estime) : undefined,
      besoin: data.besoin, status: data.status,
    })
  }

  const handleFicheDelete = async () => {
    if (!fiche) return
    await deleteLead.mutateAsync(fiche.id)
    setFiche(null)
  }

  const handleConvert = async () => {
    if (!convertLead) return
    await convertToClient.mutateAsync(convertLead)
    setConvertLead(null)
    setFiche(null)
  }

  const sourceOptions = Array.from(new Set(leads.map(l => l.source).filter(Boolean)))
    .map(s => ({ value: s, label: s }))
  const sourceFilterOpts = [{ value: '', label: 'Toutes sources' }, ...sourceOptions]

  return (
    <Layout
      title="Leads"
      actions={
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView('kanban')} title="Kanban"
              className={cn('p-1.5 rounded-md transition', view === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
              <Columns3 className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setView('liste')} title="Liste"
              className={cn('p-1.5 rounded-md transition', view === 'liste' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="h-3.5 w-3.5" /> Nouveau lead
          </Button>
        </div>
      }
    >

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Total leads</p>
            <Users className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
          <p className="text-xs text-gray-400 mt-1">{activeCount} actifs</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Conversion</p>
            <Percent className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{winRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{wonLeads.length} gagnés / {closedLeads.length} closés</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Pipeline actif</p>
            <TrendingUp className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(pipelineVal)}</p>
          <p className="text-xs text-gray-400 mt-1">Valeur estimée</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">CA gagné</p>
            <Award className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-brand-600">{formatCurrency(wonVal)}</p>
          <p className="text-xs text-gray-400 mt-1">Deals closés</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Convertis</p>
            <UserCheck className="h-4 w-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{leads.filter(l => l.client_id).length}</p>
          <p className="text-xs text-gray-400 mt-1">Devenus clients</p>
        </Card>
      </div>

      {/* ── FUNNEL ─────────────────────────────────────────────────────────── */}
      <Card className="mb-5">
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setShowFunnel(f => !f)}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Entonnoir de conversion
          </p>
          <ChevronRight className={cn('h-4 w-4 text-gray-300 transition-transform', showFunnel && 'rotate-90')} />
        </button>

        {showFunnel && (
          <>
            <div className="flex items-end gap-2 h-16 mt-4">
              {COLUMNS.map(col => {
                const count    = leads.filter(l => l.status === col.status).length
                const colValue = leads.filter(l => l.status === col.status).reduce((s, l) => s + (l.budget_estime ?? 0), 0)
                const maxCount = Math.max(1, leads.length)
                const barH     = Math.max(6, Math.round((count / maxCount) * 56))
                return (
                  <button
                    key={col.status}
                    onClick={() => setFG(g => g === col.status as string ? 'tous' : col.status as string as typeof filterGroup)}
                    className="flex-1 flex flex-col items-center gap-1 group min-w-0"
                  >
                    <div className="w-full flex flex-col justify-end" style={{ height: '56px' }}>
                      <div
                        className={cn('w-full rounded-t-md transition-all', col.header, 'opacity-75 group-hover:opacity-100')}
                        style={{ height: `${barH}px` }}
                        title={colValue > 0 ? `${count} leads · ${formatCurrency(colValue)}` : `${count} leads`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600">{count}</span>
                    <span className="text-[9px] text-gray-400 hidden xl:block text-center truncate w-full px-1 leading-tight">
                      {col.label}
                    </span>
                  </button>
                )
              })}
            </div>
            {/* Conversion rates */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
              {COLUMNS.map((col, i) => {
                if (i === 0) return <div key={col.status} className="flex-1" />
                const prev      = COLUMNS[i - 1]
                const prevCount = leads.filter(l => l.status === prev.status).length
                const currCount = leads.filter(l => l.status === col.status).length
                const rate      = prevCount > 0 ? Math.round((currCount / prevCount) * 100) : null
                return (
                  <div key={col.status} className="flex-1 text-center">
                    {rate !== null ? (
                      <span className={cn('text-[10px] font-medium', rate >= 50 ? 'text-emerald-600' : rate >= 25 ? 'text-amber-600' : 'text-red-500')}>
                        {rate}%
                      </span>
                    ) : <span className="text-[10px] text-gray-300">—</span>}
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-right">Taux de passage entre étapes</p>
          </>
        )}
      </Card>

      {/* ── FILTERS ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input placeholder="Rechercher un lead…" value={search} onChange={e => setSearch(e.target.value)}
          leading={<Search className="h-3.5 w-3.5" />} className="w-56" />

        {/* Source filter - using actual sources in data */}
        <select
          value={filterSource}
          onChange={e => setFS(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white text-gray-600 transition"
        >
          {sourceFilterOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Group filter */}
        {(['tous', 'actifs', 'gagnes', 'perdus'] as const).map(g => (
          <button
            key={g}
            onClick={() => setFG(g)}
            className={cn(
              'text-[11px] font-medium px-2.5 py-1 rounded-lg border transition',
              filterGroup === g
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-500 hover:border-gray-300',
            )}
          >
            {{ tous: 'Tous', actifs: 'Actifs', gagnes: 'Gagnés', perdus: 'Perdus' }[g]}
          </button>
        ))}

        {(search || filterSource || filterGroup !== 'tous') && (
          <button
            onClick={() => { setSearch(''); setFS(''); setFG('tous') }}
            className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition"
          >
            <X className="h-3 w-3" /> Réinitialiser
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-12">Chargement…</p>
      ) : view === 'kanban' ? (
        <KanbanView
          leads={filtered}
          onOpen={setFiche}
          onCreate={openAdd}
          onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
        />
      ) : (
        <ListeView leads={filtered} onOpen={setFiche} />
      )}

      {/* ── FICHE SIDE PANEL ───────────────────────────────────────────────── */}
      {fiche && (
        <LeadFiche
          lead={fiche}
          onClose={() => setFiche(null)}
          onSave={handleFicheSave}
          onDelete={handleFicheDelete}
          onConvert={l => { setConvertLead(l) }}
        />
      )}

      {/* ── MODAL: Nouveau lead ────────────────────────────────────────────── */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Nouveau lead"
        description={COLUMNS.find(c => c.status === addStatus)?.label}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createLead.isPending || !form.prenom || !form.nom}>
              {createLead.isPending ? 'Création…' : 'Créer le lead'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom *" placeholder="Thomas"     value={form.prenom}     onChange={set('prenom')} autoFocus />
          <Input label="Nom *"    placeholder="Legrand"    value={form.nom}        onChange={set('nom')} />
          <Input label="Email" type="email" placeholder="thomas@exemple.fr" value={form.email} onChange={set('email')} className="col-span-2" />
          <Input label="Téléphone"  placeholder="06 XX XX XX XX" value={form.telephone}  onChange={set('telephone')} />
          <Input label="Entreprise" placeholder="Legrand & Co"   value={form.entreprise} onChange={set('entreprise')} />
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Source</label>
            <select value={form.source} onChange={set('source')}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition">
              <option value="">Sélectionner…</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Input label="Budget estimé (€)" type="number" placeholder="0" value={form.budget_estime} onChange={set('budget_estime')} />
          <Textarea label="Notes / Besoin" placeholder="Besoin du client, contexte…" value={form.besoin} onChange={set('besoin')} rows={3} className="col-span-2" />
          <Select label="Statut initial" value={form.status} options={STATUS_OPTIONS} onChange={e => setForm(f => ({ ...f, status: e.target.value as LeadStatus }))} className="col-span-2" />
        </div>
      </Modal>

      {/* ── MODAL: Convertir en client ─────────────────────────────────────── */}
      <Modal
        open={!!convertLead}
        onClose={() => setConvertLead(null)}
        title="Convertir en client"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConvertLead(null)}>Annuler</Button>
            <Button onClick={handleConvert} disabled={convertToClient.isPending}>
              <UserCheck className="h-3.5 w-3.5" />
              {convertToClient.isPending ? 'Conversion…' : 'Convertir'}
            </Button>
          </>
        }
      >
        {convertLead && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Un profil client sera créé automatiquement à partir de ce lead.
              Le lead passera au statut <strong>Gagné</strong>.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <Avatar nom={convertLead.nom} prenom={convertLead.prenom} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{convertLead.prenom} {convertLead.nom}</p>
                  {convertLead.entreprise && <p className="text-xs text-gray-500">{convertLead.entreprise}</p>}
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5 pt-1 border-t border-gray-200">
                {convertLead.email && <p><span className="text-gray-400">Email :</span> <strong className="text-gray-700">{convertLead.email}</strong></p>}
                {convertLead.telephone && <p><span className="text-gray-400">Tél :</span> <strong className="text-gray-700">{convertLead.telephone}</strong></p>}
                {convertLead.budget_estime && <p><span className="text-gray-400">Budget :</span> <strong className="text-gray-700">{formatCurrency(convertLead.budget_estime)}</strong></p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
