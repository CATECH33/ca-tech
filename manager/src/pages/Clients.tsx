import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Search, Mail, Phone, Building2, Trash2, MapPin, Globe,
  LayoutGrid, List, Edit, FileText, Receipt,
  CreditCard, FolderOpen, StickyNote, Briefcase,
  X, Activity, LifeBuoy, MessageSquare, TrendingUp,
  Users, CheckCircle, RefreshCw, Ban, ExternalLink,
  Inbox, Bot, AlertCircle,
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
  useClients, useCreateClient, useUpdateClient, useDeleteClient,
  useClientProjets, useClientDevis, useClientFactures,
  useClientPaiements, useClientTickets, useClientMessages,
  useClientLeads,
} from '@/hooks/useClients'
import {
  useSubscriptions, useCreateSubscriptionCheckout, useCancelSubscription,
} from '@/hooks/useSubscriptions'
import type { Client, Status, SubscriptionPlan } from '@/types'

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'actif',   label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'archive', label: 'Archivé' },
]
const FILTER_STATUS: Array<{ value: Status | 'all'; label: string }> = [
  { value: 'all',     label: 'Tous' },
  { value: 'actif',   label: 'Actifs' },
  { value: 'inactif', label: 'Inactifs' },
  { value: 'archive', label: 'Archivés' },
]
const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Plus récents' },
  { value: 'ca_desc',   label: 'CA décroissant' },
  { value: 'nom',       label: 'Nom A–Z' },
  { value: 'date_asc',  label: 'Plus anciens' },
]
const FORM_INIT = {
  prenom: '', nom: '', email: '', telephone: '',
  entreprise: '', secteur: '', adresse: '', code_postal: '', ville: '',
}

type FicheTab = 'infos' | 'demandes' | 'activite' | 'projets' | 'devis' | 'factures' | 'paiements' | 'abonnements' | 'tickets' | 'messages' | 'notes'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function MiniProgress({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', value === 100 ? 'bg-emerald-500' : 'bg-brand-500')} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right shrink-0">{value}%</span>
    </div>
  )
}

function InfoField({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value?: string; href?: string }) {
  if (!value) return null
  const content = (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  )
  if (href) return <a href={href} className="hover:text-brand-600 transition-colors block">{content}</a>
  return <div>{content}</div>
}

function StatChip({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  )
}

// ─── ClientCard ────────────────────────────────────────────────────────────────

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={cn('cursor-pointer hover:shadow-elevated transition-all', client.status !== 'actif' && 'opacity-60 hover:opacity-90')}
    >
      <div className="flex items-start justify-between mb-3">
        <Avatar nom={client.nom} prenom={client.prenom} size="lg" />
        <Badge status={client.status} dot />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{client.prenom} {client.nom}</h3>
      {client.entreprise && (
        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
          <Building2 className="h-3 w-3 text-gray-400" />{client.entreprise}
        </p>
      )}
      {client.secteur && (
        <p className="text-[10px] text-gray-400 mt-0.5 ml-4">{client.secteur}</p>
      )}
      <div className="mt-3 space-y-1 pb-3 border-b border-gray-50">
        <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
          <Mail className="h-3 w-3 shrink-0" />{client.email}
        </p>
        {client.telephone && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0" />{client.telephone}
          </p>
        )}
        {client.ville && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />{client.code_postal ? `${client.code_postal} ` : ''}{client.ville}
          </p>
        )}
      </div>
      <div className="pt-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">CA total</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(client.total_ca)}</p>
        </div>
        <span className="text-xs text-brand-600 font-medium">Voir la fiche →</span>
      </div>
    </Card>
  )
}

// ─── ClientPanel ───────────────────────────────────────────────────────────────

function ClientPanel({ client, onClose, onUpdate, onDelete, isUpdating, isDeleting }: {
  client: Client
  onClose: () => void
  onUpdate: (data: Record<string, any> & { id: string }) => Promise<Client>
  onDelete: (id: string) => Promise<void>
  isUpdating: boolean
  isDeleting: boolean
}) {
  const [tab, setTab]           = useState<FicheTab>('infos')
  const [editMode, setEditMode] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [notes, setNotes]       = useState(client.notes ?? '')
  const [notesSaving, setNotesSaving] = useState(false)
  const [form, setForm]         = useState({
    prenom: client.prenom, nom: client.nom, email: client.email,
    telephone: client.telephone ?? '', entreprise: client.entreprise ?? '',
    secteur: client.secteur ?? '', adresse: client.adresse ?? '',
    code_postal: client.code_postal ?? '', ville: client.ville ?? '',
    status: client.status,
  })

  useEffect(() => {
    setForm({
      prenom: client.prenom, nom: client.nom, email: client.email,
      telephone: client.telephone ?? '', entreprise: client.entreprise ?? '',
      secteur: client.secteur ?? '', adresse: client.adresse ?? '',
      code_postal: client.code_postal ?? '', ville: client.ville ?? '',
      status: client.status,
    })
    setNotes(client.notes ?? '')
  }, [client.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: projets       = [] } = useClientProjets(client.id)
  const { data: devis         = [] } = useClientDevis(client.id)
  const { data: factures      = [] } = useClientFactures(client.id)
  const { data: paiements     = [] } = useClientPaiements(client.id)
  const { data: tickets       = [] } = useClientTickets(client.id)
  const { data: messages      = [] } = useClientMessages(client.id)
  const { data: abonnements   = [] } = useSubscriptions(client.id)
  const { data: demandesClient = [] } = useClientLeads(client.id)
  const createSubscription           = useCreateSubscriptionCheckout()
  const cancelSubscription           = useCancelSubscription()

  const [showSubModal, setShowSubModal]     = useState(false)
  const [subPlan, setSubPlan]               = useState<SubscriptionPlan>('vitrine')
  const [subDevisId, setSubDevisId]         = useState('')

  // Activity timeline
  const activite = useMemo(() => {
    type AItem = { id: string; date: string; type: string; titre: string; status?: string; montant?: number; icon: React.ElementType; cls: string }
    const items: AItem[] = [
      ...projets.map(p => ({ id: p.id, date: p.created_at, type: 'Projet', titre: p.nom, status: p.status, icon: FolderOpen, cls: 'text-brand-500 bg-brand-50' })),
      ...devis.map(d => ({ id: d.id, date: d.created_at, type: 'Devis', titre: d.numero, status: d.status, montant: d.total_ttc, icon: FileText, cls: 'text-violet-500 bg-violet-50' })),
      ...factures.map(f => ({ id: f.id, date: f.created_at, type: 'Facture', titre: f.numero, status: f.status, montant: f.total_ttc, icon: Receipt, cls: 'text-amber-500 bg-amber-50' })),
      ...paiements.map(p => ({ id: p.id, date: p.date_paiement, type: 'Paiement', titre: 'Paiement reçu', montant: p.montant, icon: CreditCard, cls: 'text-emerald-500 bg-emerald-50' })),
      ...tickets.map(t => ({ id: t.id, date: t.created_at, type: 'Ticket', titre: t.sujet, status: t.status, icon: LifeBuoy, cls: 'text-rose-500 bg-rose-50' })),
      ...messages.map(m => ({ id: m.id, date: m.created_at, type: 'Message', titre: m.subject ?? m.body.substring(0, 40), icon: MessageSquare, cls: 'text-gray-500 bg-gray-100' })),
    ]
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [projets, devis, factures, paiements, tickets, messages])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleUpdate() {
    await onUpdate({ id: client.id, ...form })
    setEditMode(false)
  }

  async function handleSaveNotes() {
    setNotesSaving(true)
    await onUpdate({ id: client.id, notes })
    setNotesSaving(false)
  }

  const totalPaiements = paiements.reduce((s, p) => s + p.montant, 0)

  const TABS: Array<{ id: FicheTab; label: string; icon: React.ElementType; count?: number }> = [
    { id: 'infos',     label: 'Infos',     icon: Edit },
    { id: 'demandes',  label: 'Demandes',  icon: Inbox,         count: demandesClient.length || undefined },
    { id: 'activite',  label: 'Activité',  icon: Activity,      count: activite.length },
    { id: 'projets',   label: 'Projets',   icon: FolderOpen,    count: projets.length },
    { id: 'devis',     label: 'Devis',     icon: FileText,      count: devis.length },
    { id: 'factures',  label: 'Factures',  icon: Receipt,       count: factures.length },
    { id: 'paiements',    label: 'Paiements',    icon: CreditCard,    count: paiements.length },
    { id: 'abonnements',  label: 'Abonnements',  icon: RefreshCw,     count: abonnements.length },
    { id: 'tickets',      label: 'Tickets',      icon: LifeBuoy,      count: tickets.length },
    { id: 'messages',  label: 'Messages',  icon: MessageSquare, count: messages.length },
    { id: 'notes',     label: 'Notes',     icon: StickyNote },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[720px] bg-white border-l border-gray-200 shadow-2xl z-30 flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-start gap-4">
            <Avatar nom={client.nom} prenom={client.prenom} size="xl" className="h-14 w-14 text-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-gray-900 truncate">{client.prenom} {client.nom}</h2>
                <Badge status={client.status} dot />
              </div>
              {client.entreprise && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-gray-400" />
                  {client.entreprise}
                  {client.secteur && <span className="text-gray-300">·</span>}
                  {client.secteur && <span className="text-gray-400">{client.secteur}</span>}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                  <Mail className="h-3 w-3" />{client.email}
                </a>
                {client.telephone && (
                  <a href={`tel:${client.telephone}`} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                    <Phone className="h-3 w-3" />{client.telephone}
                  </a>
                )}
                {client.ville && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{client.code_postal ? `${client.code_postal} ` : ''}{client.ville}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button size="sm" variant="outline" onClick={() => { setTab('infos'); setEditMode(true) }}>
                <Edit className="h-3.5 w-3.5" />Modifier
              </Button>
              <Link to="/loic"
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition text-xs font-medium"
                title="Ouvrir Loïc IA">
                <Bot className="h-3.5 w-3.5" />Loïc IA
              </Link>
              <Button size="icon" variant="ghost" onClick={() => setShowDelete(true)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <StatChip label="CA total" value={formatCurrency(client.total_ca)} />
            <StatChip label="Paiements" value={formatCurrency(totalPaiements)} />
            <StatChip label="Projets" value={projets.length} />
            <StatChip label="Devis" value={devis.length} />
            <StatChip label="Factures" value={factures.length} />
            <StatChip label="Tickets" value={tickets.length} />
            <StatChip label="Client depuis" value={formatDate(client.created_at, 'MMM yyyy')} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-100 bg-white shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id !== 'infos') setEditMode(false) }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0',
                tab === t.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', tab === t.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500')}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Infos ── */}
          {tab === 'infos' && (
            <div className="p-5">
              {editMode ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Prénom *" value={form.prenom} onChange={set('prenom')} />
                      <Input label="Nom *" value={form.nom} onChange={set('nom')} />
                      <Input label="Email *" type="email" value={form.email} onChange={set('email')} className="col-span-2" />
                      <Input label="Téléphone" value={form.telephone} onChange={set('telephone')} />
                      <Select label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Entreprise</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Société" value={form.entreprise} onChange={set('entreprise')} />
                      <Input label="Secteur" placeholder="Tech, Commerce, Santé…" value={form.secteur} onChange={set('secteur')} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Adresse</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Adresse" value={form.adresse} onChange={set('adresse')} className="col-span-2" />
                      <Input label="Code postal" value={form.code_postal} onChange={set('code_postal')} />
                      <Input label="Ville" value={form.ville} onChange={set('ville')} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => setEditMode(false)}>Annuler</Button>
                    <Button onClick={handleUpdate} disabled={isUpdating || !form.prenom || !form.nom || !form.email}>
                      {isUpdating ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact</p>
                    <div className="space-y-4">
                      <InfoField icon={Mail} label="Email" value={client.email} href={`mailto:${client.email}`} />
                      <InfoField icon={Phone} label="Téléphone" value={client.telephone} href={client.telephone ? `tel:${client.telephone}` : undefined} />
                    </div>
                  </Card>
                  <Card>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Entreprise</p>
                    <div className="space-y-4">
                      <InfoField icon={Building2} label="Société" value={client.entreprise} />
                      <InfoField icon={Briefcase} label="Secteur" value={client.secteur} />
                    </div>
                  </Card>
                  <Card>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Adresse</p>
                    <div className="space-y-4">
                      <InfoField icon={MapPin} label="Adresse" value={client.adresse} />
                      <InfoField icon={MapPin} label="Ville" value={[client.code_postal, client.ville].filter(Boolean).join(' ') || undefined} />
                      <InfoField icon={Globe} label="Pays" value={client.pays} />
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* ── Demandes ── */}
          {tab === 'demandes' && (
            <div className="p-5">
              {demandesClient.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Aucune demande liée à ce client</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {demandesClient.map(lead => {
                    const STATUS_DOT: Record<string, string> = {
                      nouveau: 'bg-blue-500', contact: 'bg-indigo-500', qualifie: 'bg-violet-500',
                      proposition: 'bg-amber-500', negocie: 'bg-orange-500', gagne: 'bg-emerald-500', perdu: 'bg-red-500',
                    }
                    const STATUS_LABEL: Record<string, string> = {
                      nouveau: 'Nouveau', contact: 'Contacté', qualifie: 'Qualifié',
                      proposition: 'Proposition', negocie: 'Négociation', gagne: 'Gagné', perdu: 'Perdu',
                    }
                    return (
                      <div key={lead.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition">
                        <Avatar nom={lead.nom} prenom={lead.prenom} size="sm" className="shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-800">{lead.prenom} {lead.nom}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_DOT[lead.status] ?? 'bg-gray-400')} />
                              <span className="text-xs text-gray-500">{STATUS_LABEL[lead.status] ?? lead.status}</span>
                            </div>
                          </div>
                          {lead.besoin && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">{lead.besoin}</p>
                          )}
                          <div className="flex items-center gap-3 flex-wrap">
                            {lead.source && (
                              <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{lead.source}</span>
                            )}
                            {lead.budget_estime && (
                              <span className="text-[11px] font-semibold text-gray-700">{formatCurrency(lead.budget_estime)}</span>
                            )}
                            <span className="text-[11px] text-gray-400">{formatDate(lead.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-2 border-t border-gray-100">
                    <Link to="/contacts"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition">
                      Voir dans Contacts →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Activité ── */}
          {tab === 'activite' && (
            <div className="p-5">
              {activite.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Aucune activité enregistrée</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                  <div className="space-y-4">
                    {activite.map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={`${item.id}-${i}`} className="flex gap-4 relative">
                          <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ring-2 ring-white', item.cls)}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 pt-1 pb-4 border-b border-gray-50 last:border-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{item.type}</span>
                                  {item.status && <Badge status={item.status} dot />}
                                </div>
                                <p className="text-sm font-medium text-gray-800">{item.titre}</p>
                              </div>
                              <div className="text-right shrink-0">
                                {item.montant !== undefined && (
                                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.montant)}</p>
                                )}
                                <p className="text-[10px] text-gray-400">{formatDate(item.date, 'dd MMM yyyy')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Projets ── */}
          {tab === 'projets' && (
            <Table>
              <Thead>
                <Tr><Th>Projet</Th><Th>Status</Th><Th>Progression</Th><Th>Budget</Th><Th>Échéance</Th></Tr>
              </Thead>
              <Tbody>
                {projets.length === 0 ? (
                  <EmptyRow cols={5} message="Aucun projet pour ce client" />
                ) : projets.map(p => (
                  <Tr key={p.id}>
                    <Td className="font-medium text-gray-800">{p.nom}</Td>
                    <Td><Badge status={p.status} dot /></Td>
                    <Td className="min-w-[140px]"><MiniProgress value={p.progression} /></Td>
                    <Td className="font-semibold text-gray-700">{formatCurrency(p.budget)}</Td>
                    <Td className="text-xs text-gray-400">{formatDate(p.date_fin_prevue)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* ── Devis ── */}
          {tab === 'devis' && (
            <Table>
              <Thead>
                <Tr><Th>Numéro</Th><Th>Montant TTC</Th><Th>Status</Th><Th>Date</Th></Tr>
              </Thead>
              <Tbody>
                {devis.length === 0 ? (
                  <EmptyRow cols={4} message="Aucun devis pour ce client" />
                ) : devis.map(d => (
                  <Tr key={d.id}>
                    <Td className="font-mono text-sm font-semibold text-gray-700">{d.numero}</Td>
                    <Td className="font-bold text-gray-900">{formatCurrency(d.total_ttc)}</Td>
                    <Td><Badge status={d.status} dot /></Td>
                    <Td className="text-xs text-gray-400">{formatDate(d.created_at)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* ── Factures ── */}
          {tab === 'factures' && (
            <Table>
              <Thead>
                <Tr><Th>Numéro</Th><Th>Montant TTC</Th><Th>Status</Th><Th>Échéance</Th><Th>Émission</Th></Tr>
              </Thead>
              <Tbody>
                {factures.length === 0 ? (
                  <EmptyRow cols={5} message="Aucune facture pour ce client" />
                ) : factures.map(f => (
                  <Tr key={f.id}>
                    <Td className="font-mono text-sm font-semibold text-gray-700">{f.numero}</Td>
                    <Td className="font-bold text-gray-900">{formatCurrency(f.total_ttc)}</Td>
                    <Td><Badge status={f.status} dot /></Td>
                    <Td className={cn('text-xs font-medium', f.status === 'en_retard' ? 'text-red-500' : 'text-gray-400')}>
                      {formatDate(f.date_echeance)}
                    </Td>
                    <Td className="text-xs text-gray-400">{formatDate(f.created_at)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* ── Paiements ── */}
          {tab === 'paiements' && (
            <>
              <Table>
                <Thead>
                  <Tr><Th>Date</Th><Th>Montant</Th><Th>Méthode</Th><Th>Référence</Th></Tr>
                </Thead>
                <Tbody>
                  {paiements.length === 0 ? (
                    <EmptyRow cols={4} message="Aucun paiement enregistré" />
                  ) : paiements.map(p => (
                    <Tr key={p.id}>
                      <Td className="text-sm text-gray-600">{formatDate(p.date_paiement)}</Td>
                      <Td className="font-bold text-emerald-600">{formatCurrency(p.montant)}</Td>
                      <Td>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{p.methode}</span>
                      </Td>
                      <Td className="text-xs text-gray-400 font-mono">{p.reference ?? '—'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {paiements.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{paiements.length} paiement{paiements.length > 1 ? 's' : ''}</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalPaiements)}</span>
                </div>
              )}
            </>
          )}

          {/* ── Abonnements ── */}
          {tab === 'abonnements' && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Abonnements maintenance</span>
                <button
                  type="button"
                  onClick={() => setShowSubModal(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-50 transition"
                >
                  <Plus className="h-3.5 w-3.5" />Nouvel abonnement
                </button>
              </div>
              <Table>
                <Thead>
                  <Tr><Th>Plan</Th><Th>Montant</Th><Th>Statut</Th><Th>Date de début</Th><Th>Prochain renouvellement</Th><Th></Th></Tr>
                </Thead>
                <Tbody>
                  {abonnements.length === 0 ? (
                    <EmptyRow cols={6} message="Aucun abonnement actif" />
                  ) : abonnements.map(a => (
                    <Tr key={a.id}>
                      <Td className="font-medium text-gray-800 text-sm">{a.name}</Td>
                      <Td className="font-bold text-gray-900">{formatCurrency(a.amount)}<span className="text-xs font-normal text-gray-400">{a.frequency === 'monthly' ? '/mois' : '/an'}</span></Td>
                      <Td>
                        <span className={cn(
                          'text-xs font-medium px-2.5 py-1 rounded-full border',
                          a.status === 'active'    && 'text-emerald-600 bg-emerald-50 border-emerald-200',
                          a.status === 'trialing'  && 'text-blue-600 bg-blue-50 border-blue-200',
                          a.status === 'past_due'  && 'text-orange-600 bg-orange-50 border-orange-200',
                          a.status === 'cancelled' && 'text-gray-500 bg-gray-50 border-gray-200',
                          a.status === 'paused'    && 'text-gray-500 bg-gray-50 border-gray-200',
                        )}>
                          {a.status === 'active' ? 'Actif' : a.status === 'trialing' ? 'En cours' : a.status === 'past_due' ? 'En retard' : a.status === 'cancelled' ? 'Annulé' : 'En pause'}
                        </span>
                      </Td>
                      <Td className="text-xs text-gray-400">
                        {a.current_period_start ? formatDate(a.current_period_start) : '—'}
                      </Td>
                      <Td className="text-xs text-gray-400">
                        {a.current_period_end ? formatDate(a.current_period_end) : '—'}
                      </Td>
                      <Td>
                        {a.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => { if (confirm('Annuler cet abonnement ?')) cancelSubscription.mutate(a.id) }}
                            disabled={cancelSubscription.isPending}
                            className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                            title="Annuler l'abonnement"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Modal création abonnement */}
              {showSubModal && (
                <Modal open={showSubModal} title="Nouvel abonnement" onClose={() => setShowSubModal(false)}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Plan de maintenance</label>
                      <div className="space-y-2">
                        {([
                          { value: 'vitrine',   label: 'Maintenance Site Vitrine',    price: '49 €/mois' },
                          { value: 'ecommerce', label: 'Maintenance E-commerce',      price: '99 €/mois' },
                          { value: 'ia',        label: 'Maintenance IA / Sur-mesure', price: '149 €/mois' },
                        ] as const).map(p => (
                          <label key={p.value} className={cn(
                            'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition',
                            subPlan === p.value ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                          )}>
                            <div className="flex items-center gap-2">
                              <input type="radio" className="sr-only" value={p.value} checked={subPlan === p.value} onChange={() => setSubPlan(p.value)} />
                              <div className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0', subPlan === p.value ? 'border-brand-500' : 'border-gray-300')}>
                                {subPlan === p.value && <div className="h-2 w-2 rounded-full bg-brand-500" />}
                              </div>
                              <span className="text-sm font-medium text-gray-800">{p.label}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{p.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {devis.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Lier à un devis (optionnel)</label>
                        <select
                          value={subDevisId}
                          onChange={e => setSubDevisId(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                        >
                          <option value="">— Aucun —</option>
                          {devis.filter(d => d.status === 'accepte').map(d => (
                            <option key={d.id} value={d.id}>{d.numero} — {formatCurrency(d.total_ttc)}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Un lien de paiement Stripe sera généré. Le client entre sa carte bancaire pour activer l'abonnement récurrent.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setShowSubModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Annuler</button>
                    <button
                      type="button"
                      disabled={createSubscription.isPending}
                      onClick={async () => {
                        try {
                          const url = await createSubscription.mutateAsync({
                            client_id: client.id,
                            plan: subPlan,
                            devis_id: subDevisId || undefined,
                          })
                          setShowSubModal(false)
                          window.open(url, '_blank', 'noopener,noreferrer')
                        } catch (e: any) {
                          alert(e?.message ?? 'Erreur lors de la création')
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 transition"
                    >
                      {createSubscription.isPending ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      {createSubscription.isPending ? 'Génération…' : 'Générer le lien Stripe'}
                    </button>
                  </div>
                </Modal>
              )}
            </>
          )}

          {/* ── Tickets ── */}
          {tab === 'tickets' && (
            <Table>
              <Thead>
                <Tr><Th>#</Th><Th>Sujet</Th><Th>Priorité</Th><Th>Statut</Th><Th>Créé le</Th></Tr>
              </Thead>
              <Tbody>
                {tickets.length === 0 ? (
                  <EmptyRow cols={5} message="Aucun ticket pour ce client" />
                ) : tickets.map(t => (
                  <Tr key={t.id}>
                    <Td><span className="font-mono text-xs text-gray-400">{t.ticket_number ?? t.id.substring(0, 8).toUpperCase()}</span></Td>
                    <Td className="font-medium text-gray-800 max-w-[240px] truncate">{t.sujet}</Td>
                    <Td><Badge status={t.priority} dot /></Td>
                    <Td><Badge status={t.status} dot /></Td>
                    <Td className="text-xs text-gray-400">{formatDate(t.created_at)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* ── Messages ── */}
          {tab === 'messages' && (
            <Table>
              <Thead>
                <Tr><Th>Sujet</Th><Th>Source</Th><Th>Lu</Th><Th>Répondu</Th><Th>Date</Th></Tr>
              </Thead>
              <Tbody>
                {messages.length === 0 ? (
                  <EmptyRow cols={5} message="Aucun message pour ce client" />
                ) : messages.map(m => (
                  <Tr key={m.id}>
                    <Td className="max-w-[240px]">
                      <p className={cn('text-sm truncate', !m.lu ? 'font-semibold text-gray-900' : 'text-gray-600')}>
                        {m.subject ?? '(Sans objet)'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{m.body.substring(0, 60)}…</p>
                    </Td>
                    <Td>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.source}</span>
                    </Td>
                    <Td>
                      {m.lu
                        ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                        : <span className="h-2 w-2 rounded-full bg-brand-500 inline-block" />}
                    </Td>
                    <Td>
                      {m.replied
                        ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                        : <span className="text-xs text-gray-300">—</span>}
                    </Td>
                    <Td className="text-xs text-gray-400">{formatDate(m.created_at, 'dd MMM yyyy')}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* ── Notes ── */}
          {tab === 'notes' && (
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes internes</p>
              <Textarea
                placeholder="Notes privées : besoins, préférences, historique, personnes clés…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={12}
              />
              <div className="flex justify-end mt-3">
                <Button onClick={handleSaveNotes} disabled={notesSaving || notes === (client.notes ?? '')} size="sm">
                  {notesSaving ? 'Enregistrement…' : 'Enregistrer les notes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer ce client ?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Annuler</Button>
            <Button variant="danger" onClick={async () => { await onDelete(client.id); onClose() }} disabled={isDeleting}>
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Supprimer <span className="font-semibold text-gray-900">{client.prenom} {client.nom}</span> ?
          Les données associées (projets, devis, factures) seront dissociées. Action irréversible.
        </p>
      </Modal>
    </>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────

export function Clients() {
  const [view, setView]               = useState<'table' | 'cards'>('table')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterSecteur, setSecteur]   = useState('all')
  const [sort, setSort]               = useState('date_desc')
  const [search, setSearch]           = useState('')
  const [showAdd, setShowAdd]         = useState(false)
  const [panelClient, setPanelClient] = useState<Client | null>(null)
  const [form, setForm]               = useState(FORM_INIT)

  const { data: clients = [], isLoading } = useClients()
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  // Sync panel with fresh data
  useEffect(() => {
    if (!panelClient) return
    const fresh = clients.find(c => c.id === panelClient.id)
    if (fresh) setPanelClient(fresh)
  }, [clients]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sectors from data
  const secteurs = useMemo(() =>
    Array.from(new Set(clients.map(c => c.secteur).filter(Boolean) as string[])).sort(),
  [clients])

  // Stats
  const totalCA  = useMemo(() => clients.reduce((s, c) => s + c.total_ca, 0), [clients])
  const actifs   = useMemo(() => clients.filter(c => c.status === 'actif').length, [clients])
  const caActifs = useMemo(() => clients.filter(c => c.status === 'actif'), [clients])
  const caMonyen = caActifs.length > 0 ? totalCA / caActifs.length : 0

  // Filter + sort
  const filtered = useMemo(() => {
    let arr = clients.filter(c => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      if (filterSecteur !== 'all' && c.secteur !== filterSecteur) return false
      if (search) {
        const q = search.toLowerCase()
        if (!`${c.prenom} ${c.nom} ${c.email} ${c.entreprise ?? ''} ${c.ville ?? ''} ${c.secteur ?? ''}`.toLowerCase().includes(q)) return false
      }
      return true
    })
    switch (sort) {
      case 'ca_desc':   arr = [...arr].sort((a, b) => b.total_ca - a.total_ca); break
      case 'nom':       arr = [...arr].sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)); break
      case 'date_asc':  arr = [...arr].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break
    }
    return arr
  }, [clients, filterStatus, filterSecteur, search, sort])

  const existingEmailClient = useMemo(() => {
    if (!form.email) return null
    return clients.find(c => c.email.toLowerCase() === form.email.toLowerCase()) ?? null
  }, [clients, form.email])

  const set = (k: keyof typeof FORM_INIT) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleCreate() {
    if (!form.prenom || !form.nom || !form.email) return
    if (existingEmailClient) return
    const c = await createClient.mutateAsync({
      prenom: form.prenom, nom: form.nom, email: form.email,
      telephone: form.telephone, entreprise: form.entreprise,
      secteur: form.secteur, adresse: form.adresse,
      code_postal: form.code_postal, ville: form.ville,
    })
    setShowAdd(false)
    setForm(FORM_INIT)
    setPanelClient(c)
  }

  async function handlePanelUpdate(data: Record<string, any> & { id: string }): Promise<Client> {
    const updated = await updateClient.mutateAsync(data)
    setPanelClient(updated)
    return updated
  }

  return (
    <Layout
      title="Clients"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('table')} className={cn('px-2.5 py-1.5 transition-colors', view === 'table' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50')} title="Tableau">
              <List className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setView('cards')} className={cn('px-2.5 py-1.5 transition-colors', view === 'cards' ? 'bg-brand-500 text-white' : 'text-gray-500 hover:bg-gray-50')} title="Cartes">
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button size="sm" onClick={() => { setForm(FORM_INIT); setShowAdd(true) }}>
            <Plus className="h-3.5 w-3.5" />Nouveau client
          </Button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total clients', value: clients.length, icon: Users, cls: 'text-gray-500 bg-gray-100' },
          { label: 'Clients actifs', value: actifs, icon: CheckCircle, cls: 'text-emerald-500 bg-emerald-50' },
          { label: 'CA total',      value: formatCurrency(totalCA),  icon: TrendingUp, cls: 'text-brand-500 bg-brand-50' },
          { label: 'CA moyen',      value: formatCurrency(caMonyen), icon: TrendingUp, cls: 'text-violet-500 bg-violet-50' },
        ].map(s => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg shrink-0', s.cls)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Status pills */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-card">
          {FILTER_STATUS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-colors', filterStatus === f.value ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-700')}
            >
              {f.label}
              <span className={cn('ml-1.5 text-[10px]', filterStatus === f.value ? 'text-white/70' : 'text-gray-400')}>
                {f.value === 'all' ? clients.length : clients.filter(c => c.status === f.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Sector filter */}
        {secteurs.length > 0 && (
          <select
            value={filterSecteur}
            onChange={e => setSecteur(e.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Tous secteurs</option>
            {secteurs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Search */}
        <Input
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          leading={<Search className="h-3.5 w-3.5" />}
          className="max-w-xs"
        />
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <Card padding={false}>
          <Table>
            <Thead>
              <Tr>
                <Th>Client</Th><Th>Entreprise</Th><Th>Contact</Th>
                <Th>Ville</Th><Th>Status</Th><Th>Devis / Paiements</Th><Th>CA total</Th><Th>Depuis</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <EmptyRow cols={7} message="Chargement…" />
              ) : filtered.length === 0 ? (
                <EmptyRow cols={7} />
              ) : (
                filtered.map(client => (
                  <Tr key={client.id} onClick={() => setPanelClient(client)} className="cursor-pointer">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar nom={client.nom} prenom={client.prenom} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.prenom} {client.nom}</p>
                          <p className="text-xs text-gray-400">{client.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      {client.entreprise
                        ? <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />{client.entreprise}
                          </div>
                        : <span className="text-gray-300 text-sm">Particulier</span>}
                    </Td>
                    <Td>
                      <div className="space-y-0.5">
                        {client.telephone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone className="h-3 w-3 text-gray-400" />{client.telephone}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Mail className="h-3 w-3 text-gray-400" />{client.email}
                        </div>
                      </div>
                    </Td>
                    <Td className="text-sm text-gray-600">{client.ville ?? <span className="text-gray-300">—</span>}</Td>
                    <Td><Badge status={client.status} dot /></Td>
                    <Td>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-gray-300" />
                          {client.devis_count ?? 0}
                        </span>
                        <span className="text-gray-200">·</span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3 text-gray-300" />
                          {client.paiements_count ?? 0}
                        </span>
                      </div>
                    </Td>
                    <Td className="font-semibold text-gray-800">{formatCurrency(client.total_ca)}</Td>
                    <Td className="text-xs text-gray-400">{formatDate(client.created_at)}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Card>
      )}

      {/* Cards view */}
      {view === 'cards' && (
        isLoading ? (
          <p className="text-sm text-gray-400 text-center py-16">Chargement…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(client => (
              <ClientCard key={client.id} client={client} onClick={() => setPanelClient(client)} />
            ))}
          </div>
        )
      )}

      {/* Client panel */}
      {panelClient && (
        <ClientPanel
          client={panelClient}
          onClose={() => setPanelClient(null)}
          onUpdate={handlePanelUpdate}
          onDelete={async (id) => { await deleteClient.mutateAsync(id); setPanelClient(null) }}
          isUpdating={updateClient.isPending}
          isDeleting={deleteClient.isPending}
        />
      )}

      {/* Add modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Nouveau client"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createClient.isPending || !form.prenom || !form.nom || !form.email || !!existingEmailClient}>
              {createClient.isPending ? 'Création…' : 'Créer le client'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom *" placeholder="Sophie" value={form.prenom} onChange={set('prenom')} />
              <Input label="Nom *" placeholder="Martin" value={form.nom} onChange={set('nom')} />
              <Input label="Email *" type="email" placeholder="sophie@entreprise.fr" className="col-span-2" value={form.email} onChange={set('email')} />
              {existingEmailClient && (
                <div className="col-span-2 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Client existant avec cet email : <strong>{existingEmailClient.prenom} {existingEmailClient.nom}</strong>.
                    Modifiez l'email ou ouvrez la fiche de ce client.
                  </p>
                </div>
              )}
              <Input label="Téléphone" placeholder="06 XX XX XX XX" value={form.telephone} onChange={set('telephone')} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Entreprise</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Société" placeholder="Martin SARL" value={form.entreprise} onChange={set('entreprise')} />
              <Input label="Secteur" placeholder="Tech, Commerce, Santé…" value={form.secteur} onChange={set('secteur')} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Adresse</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Adresse" placeholder="12 rue de la Paix" value={form.adresse} onChange={set('adresse')} className="col-span-2" />
              <Input label="Code postal" placeholder="75001" value={form.code_postal} onChange={set('code_postal')} />
              <Input label="Ville" placeholder="Paris" value={form.ville} onChange={set('ville')} />
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
