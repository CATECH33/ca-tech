import { useState, useCallback } from 'react'
import { Layout } from '@/components/layout/Layout'
import {
  useAllDocuments,
  useDeleteDocument,
  getSignedUrl,
  type DocumentWithContext,
} from '@/hooks/useDocuments'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  Paperclip, Search, Eye, Download, Link2, Trash2,
  RefreshCw, X, FileText, Image, File, AlertCircle,
  Wifi, Check, ExternalLink, Filter,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtSize(bytes: number | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / 1_048_576).toFixed(1)} Mo`
}

function fmtExt(doc: DocumentWithContext): string {
  return (doc.extension ?? doc.file_type?.split('/')[1] ?? '—').toUpperCase().slice(0, 6)
}

type Category = 'pdf' | 'image' | 'word' | 'excel' | 'ppt' | 'zip' | 'other'

function getCategory(doc: DocumentWithContext): Category {
  const m = doc.mime_type ?? doc.file_type ?? ''
  const e = (doc.extension ?? '').toLowerCase()
  if (m === 'application/pdf' || e === 'pdf') return 'pdf'
  if (m.startsWith('image/')) return 'image'
  if (m.includes('excel') || m.includes('spreadsheet') || e === 'xls' || e === 'xlsx') return 'excel'
  if (m.includes('powerpoint') || m.includes('presentation') || e === 'ppt' || e === 'pptx') return 'ppt'
  if (m.includes('word') || m.includes('wordprocessing') || e === 'doc' || e === 'docx') return 'word'
  if (m === 'application/zip' || e === 'zip') return 'zip'
  return 'other'
}

const CAT_STYLE: Record<Category, { bg: string; fg: string; Icon: typeof File }> = {
  pdf:   { bg: 'bg-red-50',      fg: 'text-red-600',      Icon: FileText },
  image: { bg: 'bg-violet-50',   fg: 'text-violet-600',   Icon: Image },
  word:  { bg: 'bg-blue-50',     fg: 'text-blue-600',     Icon: FileText },
  excel: { bg: 'bg-emerald-50',  fg: 'text-emerald-700',  Icon: FileText },
  ppt:   { bg: 'bg-orange-50',   fg: 'text-orange-600',   Icon: FileText },
  zip:   { bg: 'bg-amber-50',    fg: 'text-amber-600',    Icon: File },
  other: { bg: 'bg-gray-50',     fg: 'text-gray-500',     Icon: File },
}

function prospectName(doc: DocumentWithContext): string {
  if (doc.lead) return `${doc.lead.first_name} ${doc.lead.last_name}`.trim()
  return '—'
}

function quoteRef(doc: DocumentWithContext): string {
  if (doc.quote) return doc.quote.devis_number
  return '—'
}

// ─── Preview modal ────────────────────────────────────────────────────────────

interface PreviewModalProps {
  doc: DocumentWithContext
  url: string
  onClose: () => void
}

function PreviewModal({ doc, url, onClose }: PreviewModalProps) {
  const cat = getCategory(doc)
  const filename = doc.original_filename ?? doc.name ?? 'document'
  const isImg = cat === 'image'
  const isPdf = cat === 'pdf'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', CAT_STYLE[cat].bg)}>
            <span className={cn('text-[10px] font-bold', CAT_STYLE[cat].fg)}>{fmtExt(doc)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{filename}</p>
            <p className="text-xs text-gray-400">{fmtSize(doc.size ?? doc.file_size)}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0 bg-gray-50">
          {isImg ? (
            <div className="flex items-center justify-center p-6 h-full">
              <img src={url} alt={filename} className="max-w-full max-h-[65vh] rounded-xl shadow-md object-contain" />
            </div>
          ) : isPdf ? (
            <iframe src={url} className="w-full h-[65vh]" title={filename} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-6">
              <div className={cn('h-16 w-16 rounded-2xl flex items-center justify-center', CAT_STYLE[cat].bg)}>
                <span className={cn('text-xl font-bold', CAT_STYLE[cat].fg)}>{fmtExt(doc)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Aperçu non disponible</p>
                <p className="text-xs text-gray-400 mt-1">Téléchargez le fichier pour l'ouvrir</p>
              </div>
              <a
                href={url}
                download={filename}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Download className="h-4 w-4" /> Télécharger
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── DocRow ───────────────────────────────────────────────────────────────────

interface DocRowProps {
  doc: DocumentWithContext
  onPreview: (doc: DocumentWithContext) => void
  onDownload: (doc: DocumentWithContext) => void
  onCopyLink: (doc: DocumentWithContext) => void
  onDelete: (doc: DocumentWithContext) => void
  copied: string | null
  deleting: string | null
}

function DocRow({ doc, onPreview, onDownload, onCopyLink, onDelete, copied, deleting }: DocRowProps) {
  const cat = getCategory(doc)
  const style = CAT_STYLE[cat]
  const filename = doc.original_filename ?? doc.name ?? '—'
  const isDeleting = deleting === doc.id

  return (
    <tr className={cn('group border-b border-gray-50 transition-colors', isDeleting ? 'opacity-40' : 'hover:bg-gray-50/60')}>
      {/* Nom */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', style.bg)}>
            <span className={cn('text-[9px] font-bold leading-none', style.fg)}>{fmtExt(doc)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{filename}</p>
            <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{doc.entity_type ?? '—'}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold', style.bg, style.fg)}>
          {fmtExt(doc)}
        </span>
      </td>

      {/* Taille */}
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {fmtSize(doc.size ?? doc.file_size)}
      </td>

      {/* Prospect */}
      <td className="px-4 py-3">
        {doc.lead ? (
          <div>
            <p className="text-sm text-gray-800 font-medium">{prospectName(doc)}</p>
            <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{doc.lead.email}</p>
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      {/* Devis */}
      <td className="px-4 py-3">
        {doc.quote ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-600">
            {quoteRef(doc)}
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {format(new Date(doc.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionBtn title="Aperçu" onClick={() => onPreview(doc)}>
            <Eye className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn title="Télécharger" onClick={() => onDownload(doc)}>
            <Download className="h-3.5 w-3.5" />
          </ActionBtn>
          <ActionBtn
            title="Copier le lien sécurisé"
            onClick={() => onCopyLink(doc)}
            active={copied === doc.id}
          >
            {copied === doc.id
              ? <Check className="h-3.5 w-3.5 text-emerald-500" />
              : <Link2 className="h-3.5 w-3.5" />}
          </ActionBtn>
          <ActionBtn
            title="Supprimer"
            onClick={() => onDelete(doc)}
            danger
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </ActionBtn>
        </div>
      </td>
    </tr>
  )
}

interface ActionBtnProps {
  title: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  danger?: boolean
  disabled?: boolean
}

function ActionBtn({ title, onClick, children, active, danger, disabled }: ActionBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        active  ? 'bg-emerald-50 text-emerald-500' :
        danger  ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' :
                  'text-gray-400 hover:text-brand-500 hover:bg-brand-50',
      )}
    >
      {children}
    </button>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

type EntityFilter = 'all' | 'quote' | 'conversation' | 'other'

export function Documents() {
  const { data: docs = [], isLoading, refetch, isFetching } = useAllDocuments()
  const deleteMutation = useDeleteDocument()

  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all')
  const [preview, setPreview] = useState<{ doc: DocumentWithContext; url: string } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DocumentWithContext | null>(null)

  // ── Filtered list ──
  const filtered = docs.filter(d => {
    const name = (d.original_filename ?? d.name ?? '').toLowerCase()
    const prospect = prospectName(d).toLowerCase()
    const quote = quoteRef(d).toLowerCase()
    const q = search.toLowerCase()
    const matchSearch = !q || name.includes(q) || prospect.includes(q) || quote.includes(q)
    const matchEntity =
      entityFilter === 'all' ||
      (entityFilter === 'other'
        ? d.entity_type !== 'quote' && d.entity_type !== 'conversation'
        : d.entity_type === entityFilter)
    return matchSearch && matchEntity
  })

  // ── Stats ──
  const today = docs.filter(d => {
    return new Date(d.created_at).toDateString() === new Date().toDateString()
  }).length
  const totalSize = docs.reduce((s, d) => s + (d.size ?? d.file_size ?? 0), 0)

  // ── Actions ──
  const handlePreview = useCallback(async (doc: DocumentWithContext) => {
    if (!doc.storage_path) return
    setLoadingId(doc.id)
    try {
      const url = await getSignedUrl(doc.storage_path)
      setPreview({ doc, url })
    } catch (e) {
      console.error('Preview error:', e)
    } finally {
      setLoadingId(null)
    }
  }, [])

  const handleDownload = useCallback(async (doc: DocumentWithContext) => {
    if (!doc.storage_path) return
    setLoadingId(doc.id)
    try {
      const url = await getSignedUrl(doc.storage_path)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.original_filename ?? doc.name ?? 'document'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error('Download error:', e)
    } finally {
      setLoadingId(null)
    }
  }, [])

  const handleCopyLink = useCallback(async (doc: DocumentWithContext) => {
    if (!doc.storage_path) return
    try {
      const url = await getSignedUrl(doc.storage_path)
      await navigator.clipboard.writeText(url)
      setCopied(doc.id)
      setTimeout(() => setCopied(null), 2000)
    } catch (e) {
      console.error('Copy link error:', e)
    }
  }, [])

  const handleDeleteConfirmed = useCallback(async () => {
    if (!deleteConfirm?.storage_path) return
    setDeleting(deleteConfirm.id)
    setDeleteConfirm(null)
    try {
      await deleteMutation.mutateAsync({
        id: deleteConfirm.id,
        storagePath: deleteConfirm.storage_path,
        entityType: deleteConfirm.entity_type ?? '',
        entityId: deleteConfirm.entity_id ?? '',
      })
    } catch (e) {
      console.error('Delete error:', e)
    } finally {
      setDeleting(null)
    }
  }, [deleteConfirm, deleteMutation])

  return (
    <Layout
      title="Documents"
      actions={
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full mr-1">
            <Wifi className="h-2.5 w-2.5 animate-pulse" /> Temps réel
          </span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Actualiser
          </button>
        </div>
      }
    >
      <div className="space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total',          value: docs.length,             color: 'text-brand-500',   bg: 'bg-brand-50'   },
            { label: "Aujourd'hui",    value: today,                   color: 'text-blue-500',    bg: 'bg-blue-50'    },
            { label: 'Depuis devis',   value: docs.filter(d => d.entity_type === 'quote').length,
                                                                        color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Taille totale',  value: fmtSize(totalSize),      color: 'text-amber-600',   bg: 'bg-amber-50'   },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', s.bg)}>
                <Paperclip className={cn('h-5 w-5', s.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom, prospect, devis…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Entity filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {([
              { v: 'all',          l: 'Tous' },
              { v: 'quote',        l: 'Devis' },
              { v: 'conversation', l: 'Loïc' },
              { v: 'other',        l: 'Autres' },
            ] as { v: EntityFilter; l: string }[]).map(opt => (
              <button
                key={opt.v}
                onClick={() => setEntityFilter(opt.v)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  entityFilter === opt.v ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {opt.l}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} document{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Paperclip className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {search || entityFilter !== 'all' ? 'Aucun résultat' : 'Aucun document reçu'}
              </p>
              {search || entityFilter !== 'all' ? (
                <button
                  onClick={() => { setSearch(''); setEntityFilter('all') }}
                  className="text-xs text-brand-500 font-medium hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              ) : (
                <p className="text-xs text-gray-400 text-center max-w-xs">
                  Les documents envoyés via le formulaire de devis ou le widget Loïc apparaîtront ici.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Nom</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Taille</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Prospect</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Devis</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => (
                    <DocRow
                      key={doc.id}
                      doc={doc}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                      onCopyLink={handleCopyLink}
                      onDelete={d => setDeleteConfirm(d)}
                      copied={copied}
                      deleting={deleting}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay for single-doc actions */}
      {loadingId && (
        <div className="fixed inset-0 z-40 bg-black/10 flex items-center justify-center">
          <div className="bg-white rounded-xl px-5 py-3 shadow-lg flex items-center gap-3">
            <RefreshCw className="h-4 w-4 animate-spin text-brand-500" />
            <span className="text-sm font-medium text-gray-700">Génération du lien…</span>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <PreviewModal
          doc={preview.doc}
          url={preview.url}
          onClose={() => setPreview(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Supprimer ce document ?</p>
                <p className="text-xs text-gray-500 mt-1 break-all">
                  {deleteConfirm.original_filename ?? deleteConfirm.name ?? 'document'}
                </p>
                <p className="text-xs text-red-500 mt-2">Cette action est irréversible.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
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
