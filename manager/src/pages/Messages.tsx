import { useState, useEffect, useMemo } from 'react'
import {
  Search, Reply, Trash2, UserPlus, Send, LifeBuoy,
  Inbox, Mail, MailOpen, Archive, CheckCheck,
  Check, MessageSquare, Plus, RefreshCw, X, Wand2, AlertCircle,
} from 'lucide-react'
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { cn, formatDate } from '@/lib/utils'
import {
  useMessages, useMarkMessage, useMarkAllRead, useReplyMessage,
  useArchiveMessage, useDeleteMessage, useCreateMessage,
  useMessagesRealtime, useGenerateReply,
} from '@/hooks/useMessages'
import type { MessageRow } from '@/hooks/useMessages'
import { useCreateLead, useLeads } from '@/hooks/useLeads'
import { useCreateTicket } from '@/hooks/useTickets'
import { useClients } from '@/hooks/useClients'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Folder = 'tous' | 'nonlus' | 'repondus' | 'archives'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d))     return format(d, 'HH:mm')
  if (isYesterday(d)) return 'hier'
  if (isThisWeek(d))  return format(d, 'EEE', { locale: fr })
  return format(d, 'dd MMM', { locale: fr })
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(' ')
  return {
    nom:    parts.at(-1) ?? fullName,
    prenom: parts.length > 1 ? parts.slice(0, -1).join(' ') : '',
  }
}

// ─── Config ────────────────────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  Formulaire: { label: 'Formulaire', cls: 'bg-blue-50 text-blue-700 border-blue-200',     icon: '📋' },
  Email:      { label: 'Email',      cls: 'bg-violet-50 text-violet-700 border-violet-200', icon: '📧' },
  WhatsApp:   { label: 'WhatsApp',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💬' },
  LinkedIn:   { label: 'LinkedIn',   cls: 'bg-sky-50 text-sky-700 border-sky-200',         icon: '🔗' },
  Téléphone:  { label: 'Téléphone',  cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: '📞' },
  Instagram:  { label: 'Instagram',  cls: 'bg-rose-50 text-rose-700 border-rose-200',      icon: '📸' },
}
function srcStyle(src: string) {
  return SOURCE_CONFIG[src] ?? { label: src, cls: 'bg-gray-50 text-gray-600 border-gray-200', icon: '📌' }
}

const FOLDER_DEFS: {
  id: Folder; label: string; icon: React.ElementType
  filter: (m: MessageRow) => boolean
}[] = [
  { id: 'tous',     label: 'Tous',       icon: Inbox,      filter: m => !m.is_archived },
  { id: 'nonlus',   label: 'Non lus',    icon: Mail,       filter: m => !m.is_archived && !m.lu },
  { id: 'repondus', label: 'Répondus',   icon: CheckCheck, filter: m => !m.is_archived && m.replied },
  { id: 'archives', label: 'Archivés',   icon: Archive,    filter: m => m.is_archived },
]

const SOURCES_LOG = [
  { value: 'Formulaire', label: 'Formulaire web' },
  { value: 'Email',      label: 'Email' },
  { value: 'Téléphone',  label: 'Téléphone' },
  { value: 'WhatsApp',   label: 'WhatsApp' },
  { value: 'LinkedIn',   label: 'LinkedIn' },
  { value: 'Instagram',  label: 'Instagram' },
  { value: 'Walk-in',    label: 'Walk-in' },
  { value: 'Autre',      label: 'Autre' },
]

const LOG_INIT = { from_name: '', from_email: '', source: 'Téléphone', subject: '', body: '', client_id: '', lead_id: '' }

// ─── MiniStat ──────────────────────────────────────────────────────────────────

function MiniStat({
  label, value, icon, colorCls, active, onClick,
}: {
  label: string; value: number; icon: React.ReactNode
  colorCls: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 bg-white rounded-xl border p-4 text-left transition-all shadow-card w-full',
        active ? 'border-brand-400 ring-2 ring-brand-200' : 'border-gray-100 hover:border-gray-200'
      )}
    >
      <div className={cn('p-2 rounded-lg shrink-0', colorCls)}>{icon}</div>
      <div>
        <p className="text-[11px] text-gray-500 leading-none mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
    </button>
  )
}

// ─── MessageCard ───────────────────────────────────────────────────────────────

function MessageCard({ message, active, onClick }: { message: MessageRow; active: boolean; onClick: () => void }) {
  const { nom, prenom } = splitName(message.from_name)
  const src = srcStyle(message.source)
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 border-b border-gray-50 transition-colors group',
        active ? 'bg-brand-50' : 'hover:bg-gray-50',
        !message.lu && !active && 'border-l-2 border-l-brand-500 pl-[10px]'
      )}
    >
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

// ─── Main ──────────────────────────────────────────────────────────────────────

export function Messages() {
  const { data, isLoading, isError } = useMessages()
  const { data: clientsData = [] } = useClients()
  const { data: leadsData = [] }   = useLeads()
  const messages = useMemo(() => data ?? [], [data])

  const markMessage    = useMarkMessage()
  const markAllRead    = useMarkAllRead()
  const replyMessage   = useReplyMessage()
  const archiveMessage = useArchiveMessage()
  const deleteMessage  = useDeleteMessage()
  const createMessage  = useCreateMessage()
  const createLead     = useCreateLead()
  const createTicket   = useCreateTicket()
  const generateReply  = useGenerateReply()

  useMessagesRealtime()

  const [folder, setFolder]             = useState<Folder>('tous')
  const [srcFilter, setSrcFilter]       = useState('all')
  const [search, setSearch]             = useState('')
  const [selected, setSelected]         = useState<MessageRow | null>(null)
  const [showReply, setShowReply]       = useState(false)
  const [replyText, setReplyText]       = useState('')
  const [showDelete, setShowDelete]     = useState(false)
  const [showLog, setShowLog]           = useState(false)
  const [logForm, setLogForm]           = useState(LOG_INIT)
  const [banner, setBanner]             = useState<{ type: 'lead' | 'ticket'; label: string } | null>(null)

  useEffect(() => {
    if (!selected) return
    const fresh = messages.find(m => m.id === selected.id)
    if (fresh) setSelected(fresh)
  }, [messages]) // eslint-disable-line react-hooks/exhaustive-deps

  // Client / lead lookup maps
  const clientMap = useMemo(() => new Map(clientsData.map(c => [c.id, c])), [clientsData])
  const leadMap   = useMemo(() => new Map(leadsData.map(l => [l.id, l])), [leadsData])

  // Folder counts
  const folderCounts = useMemo(() => {
    const counts: Record<Folder, number> = { tous: 0, nonlus: 0, repondus: 0, archives: 0 }
    messages.forEach(m => FOLDER_DEFS.forEach(f => { if (f.filter(m)) counts[f.id]++ }))
    return counts
  }, [messages])

  // Source counts (non-archived)
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    messages.filter(m => !m.is_archived).forEach(m => { counts[m.source] = (counts[m.source] ?? 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [messages])

  // Filtered list
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

  // ── Actions ────────────────────────────────────────────────────────────────

  function selectMessage(m: MessageRow) {
    setSelected(m)
    setShowReply(false)
    setReplyText('')
    setBanner(null)
    if (!m.lu) markMessage.mutate({ id: m.id, is_read: true })
  }

  function handleArchive() {
    if (!selected) return
    const becoming = !selected.is_archived
    archiveMessage.mutate({ id: selected.id, is_archived: becoming }, {
      onSuccess: () => { setSelected(null) },
    })
  }

  function handleSendReply() {
    if (!selected || !replyText.trim()) return
    replyMessage.mutate({
      id: selected.id,
      reply_body: replyText.trim(),
      to_email: selected.from_email,
      to_name: selected.from_name,
      original_subject: selected.subject,
    }, {
      onSuccess: () => { setShowReply(false); setReplyText('') },
    })
  }

  async function handleGenerateReply() {
    if (!selected) return
    try {
      const reply = await generateReply.mutateAsync({
        from_name:  selected.from_name,
        from_email: selected.from_email,
        subject:    selected.subject,
        body:       selected.body,
        source:     selected.source,
      })
      setReplyText(reply)
    } catch {
      // error shown in UI
    }
  }

  function handleConvertToLead() {
    if (!selected) return
    const { nom, prenom } = splitName(selected.from_name)
    createLead.mutate(
      { prenom, nom, email: selected.from_email, besoin: selected.body, source: selected.source },
      {
        onSuccess: () => {
          setBanner({ type: 'lead', label: `${prenom} ${nom}` })
          setTimeout(() => setBanner(null), 5000)
        },
      }
    )
  }

  function handleConvertToTicket() {
    if (!selected) return
    createTicket.mutate(
      {
        sujet: selected.subject ?? `Message de ${selected.from_name}`,
        description: selected.body,
        priority: 'normale',
        client_id: selected.client_id,
      },
      {
        onSuccess: () => {
          setBanner({ type: 'ticket', label: selected.subject ?? selected.from_name })
          setTimeout(() => setBanner(null), 5000)
          archiveMessage.mutate({ id: selected.id, is_archived: true })
        },
      }
    )
  }

  function handleDelete() {
    if (!selected) return
    deleteMessage.mutate(selected.id, {
      onSuccess: () => { setSelected(null); setShowDelete(false) },
    })
  }

  async function handleLog() {
    if (!logForm.from_name || !logForm.body) return
    await createMessage.mutateAsync({
      from_name: logForm.from_name,
      from_email: logForm.from_email,
      source: logForm.source,
      subject: logForm.subject || undefined,
      body: logForm.body,
      client_id: logForm.client_id || undefined,
      lead_id: logForm.lead_id || undefined,
    })
    setShowLog(false)
    setLogForm(LOG_INIT)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const selSrc = selected ? srcStyle(selected.source) : null
  const { nom: selNom, prenom: selPrenom } = selected ? splitName(selected.from_name) : { nom: '', prenom: '' }
  const linkedClient = selected?.client_id ? clientMap.get(selected.client_id) : undefined
  const linkedLead   = selected?.lead_id   ? leadMap.get(selected.lead_id)     : undefined

  const unreadTotal = folderCounts.nonlus

  return (
    <Layout
      title={`Messages${unreadTotal > 0 ? ` (${unreadTotal})` : ''}`}
      actions={
        <Button size="sm" onClick={() => setShowLog(true)}>
          <Plus className="h-3.5 w-3.5" />
          Enregistrer un contact
        </Button>
      }
    >
      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MiniStat
          label="Non lus"
          value={folderCounts.nonlus}
          icon={<Mail className="h-3.5 w-3.5 text-brand-500" />}
          colorCls="bg-brand-50"
          active={folder === 'nonlus'}
          onClick={() => { setFolder('nonlus'); setSrcFilter('all') }}
        />
        <MiniStat
          label="Total messages"
          value={folderCounts.tous}
          icon={<Inbox className="h-3.5 w-3.5 text-gray-500" />}
          colorCls="bg-gray-100"
          active={folder === 'tous'}
          onClick={() => { setFolder('tous'); setSrcFilter('all') }}
        />
        <MiniStat
          label="Répondus"
          value={folderCounts.repondus}
          icon={<CheckCheck className="h-3.5 w-3.5 text-emerald-500" />}
          colorCls="bg-emerald-50"
          active={folder === 'repondus'}
          onClick={() => { setFolder('repondus'); setSrcFilter('all') }}
        />
        <MiniStat
          label="Archivés"
          value={folderCounts.archives}
          icon={<Archive className="h-3.5 w-3.5 text-gray-400" />}
          colorCls="bg-gray-100"
          active={folder === 'archives'}
          onClick={() => { setFolder('archives'); setSrcFilter('all') }}
        />
      </div>

      {/* ── 3-panel ──────────────────────────────────────────────────────── */}
      <div className="flex rounded-xl border border-gray-100 bg-white shadow-card overflow-hidden" style={{ height: 'calc(100vh - 310px)', minHeight: '480px' }}>

        {/* Sidebar */}
        <aside className="w-48 shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col py-3 overflow-y-auto">
          {/* Mark all read */}
          {unreadTotal > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="mx-2 mb-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-brand-600 hover:bg-brand-50 transition-colors"
            >
              {markAllRead.isPending
                ? <RefreshCw className="h-3 w-3 animate-spin" />
                : <CheckCheck className="h-3 w-3" />}
              Tout marquer lu
            </button>
          )}

          {/* Folders */}
          <div className="px-2 space-y-0.5">
            {FOLDER_DEFS.map(f => {
              const Icon = f.icon
              const active = folder === f.id
              const count = folderCounts[f.id]
              return (
                <button
                  key={f.id}
                  onClick={() => { setFolder(f.id); setSrcFilter('all') }}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left',
                    active ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-brand-500' : 'text-gray-400')} />
                    {f.label}
                  </span>
                  {count > 0 && (
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none',
                      f.id === 'nonlus' ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Sources */}
          {sourceCounts.length > 0 && (
            <>
              <div className="border-t border-gray-100 mx-3 mt-4 mb-3" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Sources</p>
              <div className="px-2 space-y-0.5">
                <button
                  onClick={() => setSrcFilter('all')}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    srcFilter === 'all' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <span>Toutes</span>
                  <span className="text-[10px] text-gray-400">{folderCounts.tous}</span>
                </button>
                {sourceCounts.map(([src, count]) => {
                  const s = srcStyle(src)
                  return (
                    <button
                      key={src}
                      onClick={() => setSrcFilter(src)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                        srcFilter === src ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-[11px]">{s.icon}</span>
                        {s.label}
                      </span>
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
            <Input
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leading={<Search className="h-3.5 w-3.5" />}
            />
          </div>
          <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {filtered.length} message{filtered.length > 1 ? 's' : ''}
            </span>
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
            ) : (
              filtered.map(m => (
                <MessageCard
                  key={m.id}
                  message={m}
                  active={selected?.id === m.id}
                  onClick={() => selectMessage(m)}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <MessageSquare className="h-12 w-12 text-gray-200" />
              <p className="text-sm">Sélectionnez un message pour le lire</p>
              <p className="text-xs text-gray-300">j / k pour naviguer</p>
            </div>
          ) : (
            <>
              {/* Banner */}
              {banner && (
                <div className={cn(
                  'mx-5 mt-4 shrink-0 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border',
                  banner.type === 'lead'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-brand-50 border-brand-200 text-brand-700'
                )}>
                  <span className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5" />
                    {banner.type === 'lead'
                      ? `Lead créé · ${banner.label} ajouté au pipeline`
                      : `Ticket créé · « ${banner.label} »`}
                  </span>
                  <button onClick={() => setBanner(null)}><X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" /></button>
                </div>
              )}

              {/* Header */}
              <div className="p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar nom={selNom} prenom={selPrenom} size="lg" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{selected.from_name}</p>
                      <a
                        href={`mailto:${selected.from_email}`}
                        className="text-xs text-gray-500 hover:text-brand-600 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        {selected.from_email}
                      </a>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium', selSrc!.cls)}>
                          {selSrc!.icon} {selSrc!.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(selected.created_at, 'dd MMM yyyy à HH:mm')}
                        </span>
                        {selected.replied && (
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                            <Check className="h-2.5 w-2.5" />Répondu
                          </span>
                        )}
                      </div>
                      {(selected.company || selected.phone || selected.ip_address) && (
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {selected.company && (
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                              🏢 {selected.company}
                            </span>
                          )}
                          {selected.phone && (
                            <a href={`tel:${selected.phone}`} className="text-[11px] text-gray-500 hover:text-brand-600 transition flex items-center gap-1">
                              📞 {selected.phone}
                            </a>
                          )}
                          {selected.ip_address && (
                            <span className="text-[10px] text-gray-300 font-mono">
                              🌐 {selected.ip_address}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Linked entities */}
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

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <Button
                      size="sm"
                      variant={showReply ? 'primary' : 'outline'}
                      onClick={() => { setShowReply(v => !v); if (showReply) setReplyText('') }}
                    >
                      <Reply className="h-3.5 w-3.5" />
                      {showReply ? 'Annuler' : 'Répondre'}
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => markMessage.mutate({ id: selected.id, is_read: !selected.lu })} title={selected.lu ? 'Marquer non lu' : 'Marquer lu'}>
                      {selected.lu ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="outline" onClick={handleArchive} title={selected.is_archived ? 'Désarchiver' : 'Archiver'}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="outline"
                      onClick={handleConvertToLead}
                      loading={createLead.isPending}
                      title="Convertir en lead"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="outline"
                      onClick={handleConvertToTicket}
                      loading={createTicket.isPending}
                      title="Créer un ticket support"
                    >
                      <LifeBuoy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      onClick={() => setShowDelete(true)}
                      title="Supprimer"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {selected.subject && (
                  <h2 className="text-base font-semibold text-gray-900 mb-4">{selected.subject}</h2>
                )}
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.body}</p>

                {/* Sent reply */}
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

              {/* Reply compose */}
              {showReply && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/60 shrink-0 space-y-3">
                  {/* IA generator */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-brand-50 to-violet-50 rounded-lg px-3 py-2 border border-brand-100">
                    <Wand2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span className="text-xs text-brand-700 font-medium flex-1">Réponse automatique par l'IA</span>
                    {generateReply.isError && (
                      <span className="text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {(generateReply.error as Error).message}
                      </span>
                    )}
                    {generateReply.isSuccess && !generateReply.isPending && (
                      <span className="text-[11px] text-emerald-600">✓ Généré</span>
                    )}
                    <button
                      onClick={handleGenerateReply}
                      disabled={generateReply.isPending}
                      className={cn(
                        'text-xs font-semibold px-2.5 py-1 rounded-lg border transition shrink-0',
                        generateReply.isPending
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-brand-200 text-brand-600 hover:bg-brand-50',
                      )}
                    >
                      {generateReply.isPending
                        ? <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" />Génération…</span>
                        : 'Générer'
                      }
                    </button>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">
                      À : <span className="font-medium text-gray-700">{selected.from_email}</span>
                    </p>
                    <Textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Bonjour, merci pour votre message…"
                      rows={5}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => window.open(`mailto:${selected.from_email}?subject=Re: ${encodeURIComponent(selected.subject ?? '')}`)}
                      className="text-gray-500 text-xs"
                    >
                      Ouvrir messagerie ↗
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setShowReply(false); setReplyText(''); generateReply.reset() }}>
                        Annuler
                      </Button>
                      <Button size="sm" onClick={handleSendReply} loading={replyMessage.isPending} disabled={!replyText.trim()}>
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
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer le message"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteMessage.isPending}>Supprimer</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Supprimer définitivement le message de{' '}
          <span className="font-semibold text-gray-900">{selected?.from_name}</span> ?
          Cette action est irréversible.
        </p>
      </Modal>

      {/* Log / compose modal */}
      <Modal
        open={showLog}
        onClose={() => { setShowLog(false); setLogForm(LOG_INIT) }}
        title="Enregistrer un contact"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowLog(false); setLogForm(LOG_INIT) }}>Annuler</Button>
            <Button onClick={handleLog} loading={createMessage.isPending} disabled={!logForm.from_name || !logForm.body}>
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Enregistrez manuellement un contact reçu par téléphone, walk-in ou autre canal.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nom complet *"
              placeholder="Jean Dupont"
              value={logForm.from_name}
              onChange={e => setLogForm(f => ({ ...f, from_name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jean@exemple.fr"
              value={logForm.from_email}
              onChange={e => setLogForm(f => ({ ...f, from_email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Canal"
              value={logForm.source}
              onChange={e => setLogForm(f => ({ ...f, source: e.target.value }))}
              options={SOURCES_LOG}
            />
            <Input
              label="Objet"
              placeholder="Sujet du contact"
              value={logForm.subject}
              onChange={e => setLogForm(f => ({ ...f, subject: e.target.value }))}
            />
          </div>
          <Textarea
            label="Message / Notes *"
            placeholder="Ce que la personne a demandé, son besoin, etc."
            value={logForm.body}
            onChange={e => setLogForm(f => ({ ...f, body: e.target.value }))}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Client lié (optionnel)"
              value={logForm.client_id}
              onChange={e => setLogForm(f => ({ ...f, client_id: e.target.value }))}
              placeholder="Aucun client"
              options={clientsData.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))}
            />
            <Select
              label="Lead lié (optionnel)"
              value={logForm.lead_id}
              onChange={e => setLogForm(f => ({ ...f, lead_id: e.target.value }))}
              placeholder="Aucun lead"
              options={leadsData.map(l => ({ value: l.id, label: `${l.prenom} ${l.nom}` }))}
            />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
