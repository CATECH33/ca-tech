import { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, X, UserCheck, Mail, Phone, Reply, Trash2,
  UserPlus, Send, LifeBuoy, Inbox, MailOpen, Archive, CheckCheck,
  Check, MessageSquare, RefreshCw, Wand2, AlertCircle,
  Users, TrendingUp, Award, Percent, Columns3, List,
  GripVertical, Building2, CheckCircle2, DollarSign,
} from 'lucide-react'
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
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
  useLeads, useLeadsRealtime, useCreateLead, useUpdateLead,
  useUpdateLeadStatus, useDeleteLead, useConvertLeadToClient,
} from '@/hooks/useLeads'
import type { Lead, LeadStatus } from '@/types'
import {
  useMessages, useMarkMessage, useMarkAllRead, useReplyMessage,
  useArchiveMessage, useDeleteMessage, useCreateMessage,
  useMessagesRealtime, useGenerateReply, useLinkMessageToLead,
} from '@/hooks/useMessages'
import type { MessageRow } from '@/hooks/useMessages'
import { useClients } from '@/hooks/useClients'
import { useCreateTicket } from '@/hooks/useTickets'

// ─── TAB TYPE ─────────────────────────────────────────────────────────────────

type Tab = 'leads' | 'messages'

// ═══════════════════════════════════════════════════════════════════════════════
// LEADS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

type ViewMode = 'kanban' | 'liste'

type ColDef = {
  status: LeadStatus; label: string
  bg: string; header: string; dot: string
}

const COLUMNS: ColDef[] = [
  { status: 'nouveau',     label: 'Nouveau',      bg: 'bg-blue-50',    header: 'bg-blue-500',    dot: 'bg-blue-500' },
  { status: 'contact',     label: 'Contacté',     bg: 'bg-indigo-50',  header: 'bg-indigo-500',  dot: 'bg-indigo-500' },
  { status: 'qualifie',    label: 'Qualification', bg: 'bg-violet-50',  header: 'bg-violet-500',  dot: 'bg-violet-500' },
  { status: 'proposition', label: 'Proposition',  bg: 'bg-amber-50',   header: 'bg-amber-500',   dot: 'bg-amber-500' },
  { status: 'negocie',     label: 'Négociation',  bg: 'bg-orange-50',  header: 'bg-orange-500',  dot: 'bg-orange-500' },
  { status: 'gagne',       label: 'Gagné',        bg: 'bg-emerald-50', header: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { status: 'perdu',       label: 'Perdu',        bg: 'bg-red-50',     header: 'bg-red-500',     dot: 'bg-red-500' },
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

function colDef(status: LeadStatus) {
  return COLUMNS.find(c => c.status === status) ?? COLUMNS[0]
}

function getSourceIcon(source: string) {
  const map: Record<string, string> = {
    'LinkedIn': '🔗', 'Instagram': '📸', 'Facebook': '👥',
    'Google': '🔍', 'Site web': '🌐', 'Formulaire': '📋',
    'Référence': '🤝', 'Email': '📧', 'Téléphone': '📞', 'Événement': '🎪',
  }
  return map[source] ?? '📌'
}

type FicheForm = {
  prenom: string; nom: string; email: string; telephone: string
  entreprise: string; source: string; budget_estime: string
  besoin: string; status: LeadStatus
}

// ─── LeadFiche ────────────────────────────────────────────────────────────────

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

  const isActive    = ACTIVE_STATUSES.includes(lead.status)
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

        {/* Status bar */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex gap-1">
            {COLUMNS.map((col, i) => {
              const currentIdx = COLUMNS.findIndex(c => c.status === form.status)
              const isPast     = i < currentIdx
              const isCurrent  = i === currentIdx
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
          <div className="flex flex-wrap gap-1 mt-3">
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
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Contact</p>
            <div className="space-y-2">
              <Input label="Email" type="email" value={form.email} onChange={set('email')}
                leading={<Mail className="h-3.5 w-3.5" />} />
              <Input label="Téléphone" value={form.telephone} onChange={set('telephone')}
                leading={<Phone className="h-3.5 w-3.5" />} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Opportunité</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Source</label>
                <select value={form.source} onChange={set('source')}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white transition">
                  <option value="">Sélectionner…</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Budget estimé (€)" type="number" value={form.budget_estime} onChange={set('budget_estime')}
                leading={<DollarSign className="h-3.5 w-3.5" />} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes & besoin</p>
            <textarea value={form.besoin} onChange={set('besoin')} rows={4}
              placeholder="Besoin du client, contexte, remarques…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 resize-none transition" />
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1 text-gray-500">
            <div className="flex justify-between">
              <span>Créé le</span><span className="font-medium text-gray-700">{formatDate(lead.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Modifié le</span><span className="font-medium text-gray-700">{formatDate(lead.updated_at)}</span>
            </div>
            {lead.budget_estime && (
              <div className="flex justify-between">
                <span>Valeur estimée</span><span className="font-bold text-gray-800">{formatCurrency(lead.budget_estime)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <Button variant="danger" size="sm" onClick={async () => { setDeleting(true); await onDelete(); setDeleting(false); onClose() }} disabled={deleting}>
            <Trash2 className="h-3.5 w-3.5" />{deleting ? 'Suppression…' : 'Supprimer'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" disabled={saving || !form.prenom || !form.nom}
              onClick={async () => { setSaving(true); await onSave(form); setSaving(false) }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LeadCard ─────────────────────────────────────────────────────────────────

function LeadCard({ lead, isDragging, onOpen, onDragStart, onDragEnd }: {
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
        'cursor-pointer select-none group hover:shadow-card hover:border-gray-200 transition-all',
        isDragging && 'opacity-40 scale-[0.97]',
        isConverted && 'border-l-2 border-l-emerald-400',
      )}
    >
      <div className="flex items-start gap-2 mb-2.5">
        <GripVertical className="h-3.5 w-3.5 text-gray-200 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition" />
        <Avatar nom={lead.nom} prenom={lead.prenom} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{lead.prenom} {lead.nom}</p>
            {isConverted && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
          </div>
          {lead.entreprise && <p className="text-[11px] text-gray-400 truncate">{lead.entreprise}</p>}
        </div>
      </div>
      <div className="space-y-0.5 mb-2">
        {lead.email && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Mail className="h-2.5 w-2.5 shrink-0" /><span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.telephone && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Phone className="h-2.5 w-2.5 shrink-0" /><span>{lead.telephone}</span>
          </div>
        )}
      </div>
      {lead.source && (
        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full leading-none mb-2 inline-block">
          {getSourceIcon(lead.source)} {lead.source}
        </span>
      )}
      {lead.besoin && <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-2">{lead.besoin}</p>}
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

// ─── KanbanView ───────────────────────────────────────────────────────────────

function KanbanView({ leads, onOpen, onCreate, onStatusChange }: {
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
    setDraggingId(null); setDragOverCol(null)
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-6">
      <div className="flex gap-3" style={{ minWidth: '1820px' }}>
        {COLUMNS.map(col => {
          const colLeads = leads.filter(l => l.status === col.status)
          const colValue = colLeads.reduce((s, l) => s + (l.budget_estime ?? 0), 0)
          const isOver   = dragOverCol === col.status && draggingId !== null
          return (
            <div key={col.status} className="flex flex-col w-64 shrink-0"
              onDragEnter={() => { if (draggingId) setDragOverCol(col.status) }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.status)}>
              <div className={cn('rounded-t-xl px-3 py-2.5 flex items-center justify-between shrink-0', col.header)}>
                <span className="text-xs font-semibold text-white truncate mr-2">{col.label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {colValue > 0 && <span className="text-[10px] text-white/70 hidden 2xl:inline">{formatCurrency(colValue)}</span>}
                  <span className="text-[11px] font-bold text-white bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">{colLeads.length}</span>
                </div>
              </div>
              <div className={cn(
                'flex-1 min-h-[480px] rounded-b-xl p-2 space-y-2 transition-all duration-150',
                isOver ? 'bg-brand-50 ring-2 ring-inset ring-brand-300 ring-dashed' : col.bg,
              )}>
                {colLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} isDragging={draggingId === lead.id}
                    onOpen={onOpen}
                    onDragStart={() => setDraggingId(lead.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverCol(null) }}
                  />
                ))}
                <button onClick={() => onCreate(col.status)}
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

// ─── ListeView ────────────────────────────────────────────────────────────────

function ListeView({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  return (
    <Card padding={false}>
      <Table>
        <Thead>
          <Tr>
            <Th>Lead</Th><Th>Contact</Th><Th>Source</Th>
            <Th>Statut</Th><Th>Budget</Th><Th>Date</Th><Th></Th>
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
                  {l.source
                    ? <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{getSourceIcon(l.source)} {l.source}</span>
                    : <span className="text-gray-300 text-xs">—</span>}
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
                <Td><span className="text-xs text-gray-400">{formatDate(l.created_at)}</span></Td>
                <Td onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => onOpen(l)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
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

// ─── LeadsSection ─────────────────────────────────────────────────────────────

function LeadsSection() {
  const [view, setView]       = useState<ViewMode>('kanban')
  const [search, setSearch]   = useState('')
  const [filterGroup, setFG]  = useState<'tous' | 'actifs' | 'gagnes' | 'perdus'>('tous')
  const [filterSource, setFS] = useState('')
  const [fiche, setFiche]     = useState<Lead | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addStatus, setAddStatus] = useState<LeadStatus>('nouveau')
  const [form, setForm]       = useState(FORM_INIT)
  const [convertLead, setConvertLead] = useState<Lead | null>(null)

  const { data: leads = [], isLoading } = useLeads()
  useLeadsRealtime()
  const createLead      = useCreateLead()
  const updateLead      = useUpdateLead()
  const updateStatus    = useUpdateLeadStatus()
  const deleteLead      = useDeleteLead()
  const convertToClient = useConvertLeadToClient()

  useEffect(() => {
    if (fiche) {
      const fresh = leads.find(l => l.id === fiche.id)
      if (fresh) setFiche(fresh)
    }
  }, [leads]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = leads.filter(l => {
    if (search) {
      const q = search.toLowerCase()
      if (!`${l.prenom} ${l.nom} ${l.entreprise ?? ''} ${l.email}`.toLowerCase().includes(q)) return false
    }
    if (filterSource && l.source !== filterSource) return false
    if (filterGroup === 'actifs' && !ACTIVE_STATUSES.includes(l.status)) return false
    if (filterGroup === 'gagnes' && l.status !== 'gagne') return false
    if (filterGroup === 'perdus' && l.status !== 'perdu') return false
    return true
  })

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
    setAddStatus(status); setForm({ ...FORM_INIT, status }); setShowAdd(true)
  }

  const handleCreate = async () => {
    if (!form.prenom || !form.nom) return
    await createLead.mutateAsync({
      prenom: form.prenom, nom: form.nom, email: form.email,
      telephone: form.telephone, entreprise: form.entreprise, source: form.source,
      budget_estime: form.budget_estime ? Number(form.budget_estime) : undefined,
      besoin: form.besoin, status: form.status,
    })
    setShowAdd(false); setForm(FORM_INIT)
  }

  const sourceFilterOpts = [
    { value: '', label: 'Toutes sources' },
    ...Array.from(new Set(leads.map(l => l.source).filter(Boolean))).map(s => ({ value: s, label: s })),
  ]

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <Card>
          <div className="flex items-center justify-between mb-1"><p className="text-xs text-gray-500">Total leads</p><Users className="h-4 w-4 text-gray-300" /></div>
          <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
          <p className="text-xs text-gray-400 mt-1">{activeCount} actifs</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1"><p className="text-xs text-gray-500">Conversion</p><Percent className="h-4 w-4 text-gray-300" /></div>
          <p className="text-2xl font-bold text-emerald-600">{winRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{wonLeads.length} gagnés</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1"><p className="text-xs text-gray-500">Pipeline actif</p><TrendingUp className="h-4 w-4 text-gray-300" /></div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(pipelineVal)}</p>
          <p className="text-xs text-gray-400 mt-1">Valeur estimée</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1"><p className="text-xs text-gray-500">CA gagné</p><Award className="h-4 w-4 text-gray-300" /></div>
          <p className="text-2xl font-bold text-brand-600">{formatCurrency(wonVal)}</p>
          <p className="text-xs text-gray-400 mt-1">Deals closés</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-1"><p className="text-xs text-gray-500">Convertis</p><UserCheck className="h-4 w-4 text-gray-300" /></div>
          <p className="text-2xl font-bold text-gray-900">{leads.filter(l => l.client_id).length}</p>
          <p className="text-xs text-gray-400 mt-1">Devenus clients</p>
        </Card>
      </div>

      {/* Filters + actions */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input placeholder="Rechercher un lead…" value={search} onChange={e => setSearch(e.target.value)}
          leading={<Search className="h-3.5 w-3.5" />} className="w-56" />
        <select value={filterSource} onChange={e => setFS(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 bg-white text-gray-600 transition">
          {sourceFilterOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {(['tous', 'actifs', 'gagnes', 'perdus'] as const).map(g => (
          <button key={g} onClick={() => setFG(g)}
            className={cn(
              'text-[11px] font-medium px-2.5 py-1 rounded-lg border transition',
              filterGroup === g ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300',
            )}>
            {{ tous: 'Tous', actifs: 'Actifs', gagnes: 'Gagnés', perdus: 'Perdus' }[g]}
          </button>
        ))}
        {(search || filterSource || filterGroup !== 'tous') && (
          <button onClick={() => { setSearch(''); setFS(''); setFG('tous') }}
            className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition">
            <X className="h-3 w-3" /> Réinitialiser
          </button>
        )}
        <span className="text-xs text-gray-400">{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</span>
        <div className="ml-auto flex items-center gap-2">
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
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-12">Chargement…</p>
      ) : view === 'kanban' ? (
        <KanbanView leads={filtered} onOpen={setFiche} onCreate={openAdd}
          onStatusChange={(id, status) => updateStatus.mutate({ id, status })} />
      ) : (
        <ListeView leads={filtered} onOpen={setFiche} />
      )}

      {/* Fiche side panel */}
      {fiche && (
        <LeadFiche lead={fiche} onClose={() => setFiche(null)}
          onSave={async data => {
            if (!fiche) return
            await updateLead.mutateAsync({
              id: fiche.id, prenom: data.prenom, nom: data.nom, email: data.email,
              telephone: data.telephone, entreprise: data.entreprise, source: data.source,
              budget_estime: data.budget_estime ? Number(data.budget_estime) : undefined,
              besoin: data.besoin, status: data.status,
            })
          }}
          onDelete={async () => { if (fiche) await deleteLead.mutateAsync(fiche.id) }}
          onConvert={l => setConvertLead(l)}
        />
      )}

      {/* Modal: nouveau lead */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nouveau lead"
        description={COLUMNS.find(c => c.status === addStatus)?.label} size="lg"
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
          <Input label="Prénom *" placeholder="Thomas" value={form.prenom} onChange={set('prenom')} autoFocus />
          <Input label="Nom *" placeholder="Legrand" value={form.nom} onChange={set('nom')} />
          <Input label="Email" type="email" placeholder="thomas@exemple.fr" value={form.email} onChange={set('email')} className="col-span-2" />
          <Input label="Téléphone" placeholder="06 XX XX XX XX" value={form.telephone} onChange={set('telephone')} />
          <Input label="Entreprise" placeholder="Legrand & Co" value={form.entreprise} onChange={set('entreprise')} />
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
          <Select label="Statut initial" value={form.status} options={STATUS_OPTIONS}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as LeadStatus }))} className="col-span-2" />
        </div>
      </Modal>

      {/* Modal: convertir en client */}
      <Modal open={!!convertLead} onClose={() => setConvertLead(null)} title="Convertir en client" size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConvertLead(null)}>Annuler</Button>
            <Button onClick={async () => { if (convertLead) { await convertToClient.mutateAsync(convertLead); setConvertLead(null); setFiche(null) } }}
              disabled={convertToClient.isPending}>
              <UserCheck className="h-3.5 w-3.5" />
              {convertToClient.isPending ? 'Conversion…' : 'Convertir'}
            </Button>
          </>
        }
      >
        {convertLead && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Un profil client sera créé. Le lead passera au statut <strong>Gagné</strong>.</p>
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES SECTION
// ═══════════════════════════════════════════════════════════════════════════════

type Folder = 'tous' | 'nonlus' | 'repondus' | 'archives'

function relativeTime(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d))     return format(d, 'HH:mm')
  if (isYesterday(d)) return 'hier'
  if (isThisWeek(d))  return format(d, 'EEE', { locale: fr })
  return format(d, 'dd MMM', { locale: fr })
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(' ')
  return { nom: parts.at(-1) ?? fullName, prenom: parts.length > 1 ? parts.slice(0, -1).join(' ') : '' }
}

const SOURCE_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  Formulaire: { label: 'Formulaire', cls: 'bg-blue-50 text-blue-700 border-blue-200',      icon: '📋' },
  Email:      { label: 'Email',      cls: 'bg-violet-50 text-violet-700 border-violet-200', icon: '📧' },
  WhatsApp:   { label: 'WhatsApp',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💬' },
  LinkedIn:   { label: 'LinkedIn',   cls: 'bg-sky-50 text-sky-700 border-sky-200',          icon: '🔗' },
  Téléphone:  { label: 'Téléphone',  cls: 'bg-amber-50 text-amber-700 border-amber-200',    icon: '📞' },
  Instagram:  { label: 'Instagram',  cls: 'bg-rose-50 text-rose-700 border-rose-200',       icon: '📸' },
}
function srcStyle(src: string) {
  return SOURCE_CONFIG[src] ?? { label: src, cls: 'bg-gray-50 text-gray-600 border-gray-200', icon: '📌' }
}

const FOLDER_DEFS: { id: Folder; label: string; icon: React.ElementType; filter: (m: MessageRow) => boolean }[] = [
  { id: 'tous',     label: 'Tous',     icon: Inbox,      filter: m => !m.is_archived },
  { id: 'nonlus',   label: 'Non lus',  icon: Mail,       filter: m => !m.is_archived && !m.lu },
  { id: 'repondus', label: 'Répondus', icon: CheckCheck, filter: m => !m.is_archived && m.replied },
  { id: 'archives', label: 'Archivés', icon: Archive,    filter: m => m.is_archived },
]

const SOURCES_LOG = [
  { value: 'Formulaire', label: 'Formulaire web' }, { value: 'Email', label: 'Email' },
  { value: 'Téléphone', label: 'Téléphone' },       { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'LinkedIn', label: 'LinkedIn' },           { value: 'Instagram', label: 'Instagram' },
  { value: 'Walk-in', label: 'Walk-in' },             { value: 'Autre', label: 'Autre' },
]

const LOG_INIT = { from_name: '', from_email: '', source: 'Téléphone', subject: '', body: '', client_id: '', lead_id: '' }

function MessageCard({ message, active, onClick }: { message: MessageRow; active: boolean; onClick: () => void }) {
  const { nom, prenom } = splitName(message.from_name)
  const src = srcStyle(message.source)
  return (
    <button onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 border-b border-gray-50 transition-colors group',
        active ? 'bg-brand-50' : 'hover:bg-gray-50',
        !message.lu && !active && 'border-l-2 border-l-brand-500 pl-[10px]'
      )}>
      <div className="flex items-start gap-2.5">
        <Avatar nom={nom} prenom={prenom} size="sm" className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={cn('text-xs truncate', !message.lu ? 'font-bold text-gray-900' : 'font-medium text-gray-700')}>
              {message.from_name}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {!message.lu && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />}
              <span className="text-[10px] text-gray-400">{relativeTime(message.created_at)}</span>
            </div>
          </div>
          <p className={cn('text-xs truncate mb-1', !message.lu ? 'text-gray-800 font-medium' : 'text-gray-600')}>
            {message.subject ?? '(Sans objet)'}
          </p>
          <p className="text-[11px] text-gray-400 truncate mb-1.5">{message.body}</p>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium', src.cls)}>
              {src.icon} {src.label}
            </span>
            {message.replied && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                <Check className="h-2.5 w-2.5" />Répondu
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function MessagesSection() {
  const { data, isLoading, isError } = useMessages()
  const { data: clientsData = [] }   = useClients()
  const { data: leadsData = [] }     = useLeads()
  const messages = useMemo(() => data ?? [], [data])

  const markMessage    = useMarkMessage()
  const markAllRead    = useMarkAllRead()
  const replyMessage   = useReplyMessage()
  const archiveMessage = useArchiveMessage()
  const deleteMessage  = useDeleteMessage()
  const createMessage  = useCreateMessage()
  const createLead        = useCreateLead()
  const linkMessageToLead = useLinkMessageToLead()
  const createTicket   = useCreateTicket()
  const generateReply  = useGenerateReply()
  useMessagesRealtime()

  const [folder, setFolder]         = useState<Folder>('tous')
  const [srcFilter, setSrcFilter]   = useState('all')
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<MessageRow | null>(null)
  const [showReply, setShowReply]   = useState(false)
  const [replyText, setReplyText]   = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [showLog, setShowLog]       = useState(false)
  const [logForm, setLogForm]       = useState(LOG_INIT)
  const [banner, setBanner]         = useState<{ type: 'lead' | 'ticket'; label: string } | null>(null)

  useEffect(() => {
    if (!selected) return
    const fresh = messages.find(m => m.id === selected.id)
    if (fresh) setSelected(fresh)
  }, [messages]) // eslint-disable-line react-hooks/exhaustive-deps

  const clientMap = useMemo(() => new Map(clientsData.map(c => [c.id, c])), [clientsData])
  const leadMap   = useMemo(() => new Map(leadsData.map(l => [l.id, l])), [leadsData])

  const folderCounts = useMemo(() => {
    const counts: Record<Folder, number> = { tous: 0, nonlus: 0, repondus: 0, archives: 0 }
    messages.forEach(m => FOLDER_DEFS.forEach(f => { if (f.filter(m)) counts[f.id]++ }))
    return counts
  }, [messages])

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    messages.filter(m => !m.is_archived).forEach(m => { counts[m.source] = (counts[m.source] ?? 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [messages])

  const filtered = useMemo(() => {
    const folderDef = FOLDER_DEFS.find(f => f.id === folder)!
    return messages.filter(m => {
      if (!folderDef.filter(m)) return false
      if (srcFilter !== 'all' && m.source !== srcFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!`${m.from_name} ${m.from_email} ${m.subject ?? ''} ${m.body}`.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [messages, folder, srcFilter, search])

  function selectMessage(m: MessageRow) {
    setSelected(m); setShowReply(false); setReplyText(''); setBanner(null)
    if (!m.lu) markMessage.mutate({ id: m.id, is_read: true })
  }

  function handleConvertToLead() {
    if (!selected) return
    const { nom, prenom } = splitName(selected.from_name)
    if (selected.lead_id) { setBanner({ type: 'lead', label: selected.from_name }); setTimeout(() => setBanner(null), 5000); return }
    const existing = leadsData.find(l => l.email.toLowerCase() === selected.from_email.toLowerCase())
    if (existing) {
      linkMessageToLead.mutate({ messageId: selected.id, leadId: existing.id }, {
        onSuccess: () => { setBanner({ type: 'lead', label: `${existing.prenom} ${existing.nom}` }); setTimeout(() => setBanner(null), 5000) },
      })
      return
    }
    createLead.mutate(
      { prenom, nom, email: selected.from_email, besoin: selected.body, source: selected.source },
      { onSuccess: (newLead) => {
          linkMessageToLead.mutate({ messageId: selected.id, leadId: newLead.id })
          setBanner({ type: 'lead', label: `${prenom} ${nom}` }); setTimeout(() => setBanner(null), 5000)
        },
      }
    )
  }

  const selSrc = selected ? srcStyle(selected.source) : null
  const { nom: selNom, prenom: selPrenom } = selected ? splitName(selected.from_name) : { nom: '', prenom: '' }
  const linkedClient = selected?.client_id ? clientMap.get(selected.client_id) : undefined
  const linkedLead   = selected?.lead_id   ? leadMap.get(selected.lead_id)     : undefined

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Non lus',      value: folderCounts.nonlus,   icon: <Mail className="h-3.5 w-3.5 text-brand-500" />,    cls: 'bg-brand-50',  id: 'nonlus'   as Folder },
          { label: 'Total',        value: folderCounts.tous,     icon: <Inbox className="h-3.5 w-3.5 text-gray-500" />,    cls: 'bg-gray-100',  id: 'tous'     as Folder },
          { label: 'Répondus',     value: folderCounts.repondus, icon: <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />, cls: 'bg-emerald-50', id: 'repondus' as Folder },
          { label: 'Archivés',     value: folderCounts.archives, icon: <Archive className="h-3.5 w-3.5 text-gray-400" />,  cls: 'bg-gray-100',  id: 'archives' as Folder },
        ].map(s => (
          <button key={s.id} onClick={() => { setFolder(s.id); setSrcFilter('all') }}
            className={cn(
              'flex items-center gap-3 bg-white rounded-xl border p-4 text-left transition-all shadow-card w-full',
              folder === s.id ? 'border-brand-400 ring-2 ring-brand-200' : 'border-gray-100 hover:border-gray-200'
            )}>
            <div className={cn('p-2 rounded-lg shrink-0', s.cls)}>{s.icon}</div>
            <div>
              <p className="text-[11px] text-gray-500 leading-none mb-1">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 leading-none">{s.value}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setShowLog(true)}>
          <Plus className="h-3.5 w-3.5" /> Enregistrer un contact
        </Button>
      </div>

      {/* 3-panel */}
      <div className="flex rounded-xl border border-gray-100 bg-white shadow-card overflow-hidden"
        style={{ height: 'calc(100vh - 380px)', minHeight: '480px' }}>

        {/* Folder sidebar */}
        <aside className="w-48 shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col py-3 overflow-y-auto">
          {folderCounts.nonlus > 0 && (
            <button onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}
              className="mx-2 mb-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-brand-600 hover:bg-brand-50 transition-colors">
              {markAllRead.isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
              Tout marquer lu
            </button>
          )}
          <div className="px-2 space-y-0.5">
            {FOLDER_DEFS.map(f => {
              const Icon = f.icon; const active = folder === f.id; const count = folderCounts[f.id]
              return (
                <button key={f.id} onClick={() => { setFolder(f.id); setSrcFilter('all') }}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left',
                    active ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}>
                  <span className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-brand-500' : 'text-gray-400')} />
                    {f.label}
                  </span>
                  {count > 0 && (
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none',
                      f.id === 'nonlus' ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600')}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {sourceCounts.length > 0 && (
            <>
              <div className="border-t border-gray-100 mx-3 mt-4 mb-3" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Sources</p>
              <div className="px-2 space-y-0.5">
                <button onClick={() => setSrcFilter('all')}
                  className={cn('w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    srcFilter === 'all' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100')}>
                  <span>Toutes</span><span className="text-[10px] text-gray-400">{folderCounts.tous}</span>
                </button>
                {sourceCounts.map(([src, count]) => {
                  const s = srcStyle(src)
                  return (
                    <button key={src} onClick={() => setSrcFilter(src)}
                      className={cn('w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                        srcFilter === src ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100')}>
                      <span className="flex items-center gap-1.5"><span className="text-[11px]">{s.icon}</span>{s.label}</span>
                      <span className="text-[10px] text-gray-400">{count}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </aside>

        {/* Message list */}
        <div className="w-72 shrink-0 border-r border-gray-100 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              leading={<Search className="h-3.5 w-3.5" />} />
          </div>
          <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">{filtered.length} message{filtered.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : isError ? (
              <p className="p-4 text-xs text-red-500 text-center">Erreur lors du chargement</p>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Inbox className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs">Aucun message</p>
              </div>
            ) : filtered.map(m => (
              <MessageCard key={m.id} message={m} active={selected?.id === m.id} onClick={() => selectMessage(m)} />
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <MessageSquare className="h-12 w-12 text-gray-200" />
              <p className="text-sm">Sélectionnez un message pour le lire</p>
            </div>
          ) : (
            <>
              {banner && (
                <div className={cn('mx-5 mt-4 shrink-0 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border',
                  banner.type === 'lead' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-brand-50 border-brand-200 text-brand-700')}>
                  <span className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5" />
                    {banner.type === 'lead' ? `Lead créé · ${banner.label}` : `Ticket créé · « ${banner.label} »`}
                  </span>
                  <button onClick={() => setBanner(null)}><X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" /></button>
                </div>
              )}
              <div className="p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar nom={selNom} prenom={selPrenom} size="lg" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{selected.from_name}</p>
                      <a href={`mailto:${selected.from_email}`}
                        className="text-xs text-gray-500 hover:text-brand-600 transition-colors">
                        {selected.from_email}
                      </a>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium', selSrc!.cls)}>
                          {selSrc!.icon} {selSrc!.label}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatDate(selected.created_at, 'dd MMM yyyy à HH:mm')}</span>
                        {selected.replied && (
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                            <Check className="h-2.5 w-2.5" />Répondu
                          </span>
                        )}
                      </div>
                      {(linkedClient || linkedLead) && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {linkedClient && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                              👤 {linkedClient.prenom} {linkedClient.nom}
                            </span>
                          )}
                          {linkedLead && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              🎯 Lead · {linkedLead.prenom} {linkedLead.nom}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <Button size="sm" variant={showReply ? 'primary' : 'outline'}
                      onClick={() => { setShowReply(v => !v); if (showReply) setReplyText('') }}>
                      <Reply className="h-3.5 w-3.5" />{showReply ? 'Annuler' : 'Répondre'}
                    </Button>
                    <Button size="icon" variant="outline"
                      onClick={() => markMessage.mutate({ id: selected.id, is_read: !selected.lu })}
                      title={selected.lu ? 'Marquer non lu' : 'Marquer lu'}>
                      {selected.lu ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="outline"
                      onClick={() => archiveMessage.mutate({ id: selected.id, is_archived: !selected.is_archived }, { onSuccess: () => setSelected(null) })}
                      title={selected.is_archived ? 'Désarchiver' : 'Archiver'}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={handleConvertToLead}
                      loading={createLead.isPending} title="Convertir en lead">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline"
                      onClick={() => createTicket.mutate(
                        { sujet: selected.subject ?? `Message de ${selected.from_name}`, description: selected.body, priority: 'normale', client_id: selected.client_id },
                        { onSuccess: () => { setBanner({ type: 'ticket', label: selected.subject ?? selected.from_name }); setTimeout(() => setBanner(null), 5000); archiveMessage.mutate({ id: selected.id, is_archived: true }) } }
                      )}
                      loading={createTicket.isPending} title="Créer un ticket support">
                      <LifeBuoy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setShowDelete(true)}
                      title="Supprimer" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {selected.subject && <h2 className="text-base font-semibold text-gray-900 mb-4">{selected.subject}</h2>}
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.body}</p>
                {selected.replied && selected.reply_body && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-5 w-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                        <Reply className="h-3 w-3 text-brand-600" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Votre réponse</p>
                    </div>
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.reply_body}</p>
                    </div>
                  </div>
                )}
              </div>

              {showReply && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/60 shrink-0 space-y-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-brand-50 to-violet-50 rounded-lg px-3 py-2 border border-brand-100">
                    <Wand2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span className="text-xs text-brand-700 font-medium flex-1">Réponse automatique par l'IA</span>
                    {generateReply.isError && (
                      <span className="text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />{(generateReply.error as Error).message}
                      </span>
                    )}
                    {generateReply.isSuccess && !generateReply.isPending && (
                      <span className="text-[11px] text-emerald-600">✓ Généré</span>
                    )}
                    <button
                      onClick={async () => {
                        if (!selected) return
                        try {
                          const reply = await generateReply.mutateAsync({
                            from_name: selected.from_name, from_email: selected.from_email,
                            subject: selected.subject, body: selected.body, source: selected.source,
                          })
                          setReplyText(reply)
                        } catch { /* shown in UI */ }
                      }}
                      disabled={generateReply.isPending}
                      className={cn(
                        'text-xs font-semibold px-2.5 py-1 rounded-lg border transition shrink-0',
                        generateReply.isPending
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-brand-200 text-brand-600 hover:bg-brand-50',
                      )}>
                      {generateReply.isPending
                        ? <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" />Génération…</span>
                        : 'Générer'}
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">À : <span className="font-medium text-gray-700">{selected.from_email}</span></p>
                    <Textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                      placeholder="Bonjour, merci pour votre message…" rows={5} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm"
                      onClick={() => window.open(`mailto:${selected.from_email}?subject=Re: ${encodeURIComponent(selected.subject ?? '')}`)}
                      className="text-gray-500 text-xs">
                      Ouvrir messagerie ↗
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setShowReply(false); setReplyText(''); generateReply.reset() }}>Annuler</Button>
                      <Button size="sm" loading={replyMessage.isPending} disabled={!replyText.trim()}
                        onClick={() => replyMessage.mutate({
                          id: selected.id, reply_body: replyText.trim(),
                          to_email: selected.from_email, to_name: selected.from_name,
                          original_subject: selected.subject,
                        }, { onSuccess: () => { setShowReply(false); setReplyText('') } })}>
                        <Send className="h-3.5 w-3.5" /> Enregistrer réponse
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Supprimer le message" size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Annuler</Button>
            <Button variant="danger" loading={deleteMessage.isPending}
              onClick={() => deleteMessage.mutate(selected!.id, { onSuccess: () => { setSelected(null); setShowDelete(false) } })}>
              Supprimer
            </Button>
          </>
        }>
        <p className="text-sm text-gray-600">
          Supprimer définitivement le message de <span className="font-semibold text-gray-900">{selected?.from_name}</span> ?
          Cette action est irréversible.
        </p>
      </Modal>

      {/* Log modal */}
      <Modal open={showLog} onClose={() => { setShowLog(false); setLogForm(LOG_INIT) }} title="Enregistrer un contact"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowLog(false); setLogForm(LOG_INIT) }}>Annuler</Button>
            <Button loading={createMessage.isPending} disabled={!logForm.from_name || !logForm.body}
              onClick={async () => {
                if (!logForm.from_name || !logForm.body) return
                await createMessage.mutateAsync({
                  from_name: logForm.from_name, from_email: logForm.from_email,
                  source: logForm.source, subject: logForm.subject || undefined,
                  body: logForm.body, client_id: logForm.client_id || undefined,
                  lead_id: logForm.lead_id || undefined,
                })
                setShowLog(false); setLogForm(LOG_INIT)
              }}>
              Enregistrer
            </Button>
          </>
        }>
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Enregistrez manuellement un contact reçu par téléphone, walk-in ou autre canal.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nom complet *" placeholder="Jean Dupont" value={logForm.from_name}
              onChange={e => setLogForm(f => ({ ...f, from_name: e.target.value }))} />
            <Input label="Email" type="email" placeholder="jean@exemple.fr" value={logForm.from_email}
              onChange={e => setLogForm(f => ({ ...f, from_email: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Canal" value={logForm.source} options={SOURCES_LOG}
              onChange={e => setLogForm(f => ({ ...f, source: e.target.value }))} />
            <Input label="Objet" placeholder="Sujet du contact" value={logForm.subject}
              onChange={e => setLogForm(f => ({ ...f, subject: e.target.value }))} />
          </div>
          <Textarea label="Message / Notes *" placeholder="Ce que la personne a demandé…" value={logForm.body}
            onChange={e => setLogForm(f => ({ ...f, body: e.target.value }))} rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Client lié (optionnel)" value={logForm.client_id} placeholder="Aucun client"
              options={clientsData.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))}
              onChange={e => setLogForm(f => ({ ...f, client_id: e.target.value }))} />
            <Select label="Lead lié (optionnel)" value={logForm.lead_id} placeholder="Aucun lead"
              options={leadsData.map(l => ({ value: l.id, label: `${l.prenom} ${l.nom}` }))}
              onChange={e => setLogForm(f => ({ ...f, lead_id: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

export function Contacts() {
  const [tab, setTab] = useState<Tab>('leads')

  const { data: leads = [] }    = useLeads()
  const { data: messages = [] } = useMessages()

  const newLeads      = leads.filter(l => l.status === 'nouveau').length
  const unreadMsgs    = (messages as MessageRow[]).filter(m => !m.lu && !m.is_archived).length

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'leads',    label: 'Leads',    badge: newLeads   || undefined },
    { key: 'messages', label: 'Messages', badge: unreadMsgs || undefined },
  ]

  return (
    <Layout title="Contacts & Demandes">
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}>
            {t.label}
            {t.badge !== undefined && (
              <span className={cn(
                'text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center',
                tab === t.key ? 'bg-brand-100 text-brand-600' : 'bg-gray-200 text-gray-500'
              )}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'leads'    && <LeadsSection />}
      {tab === 'messages' && <MessagesSection />}
    </Layout>
  )
}
