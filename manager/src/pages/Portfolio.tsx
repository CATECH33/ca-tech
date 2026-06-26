import { useState, useRef, useCallback, useMemo } from 'react'
import {
  Plus, X, Trash2, Edit, Star, Globe, Eye, ExternalLink,
  Image, ChevronLeft, ChevronRight, LayoutGrid, List,
  Upload, Check,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatDate, cn } from '@/lib/utils'
import {
  usePortfolioItems, useCreatePortfolioItem, useUpdatePortfolioItem,
  useDeletePortfolioItem, useToggleFeatured, useTogglePublished,
  type PortfolioPayload,
} from '@/hooks/usePortfolio'
import type { PortfolioItem } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'web',       label: 'Site Web',     icon: '🌐', bg: 'bg-blue-50',    text: 'text-blue-700'   },
  { value: 'ecommerce', label: 'E-commerce',   icon: '🛍️', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { value: 'landing',   label: 'Landing Page', icon: '📄', bg: 'bg-violet-50',  text: 'text-violet-700' },
  { value: 'logo',      label: 'Logo',         icon: '🎨', bg: 'bg-rose-50',    text: 'text-rose-700'   },
  { value: 'branding',  label: 'Branding',     icon: '✨', bg: 'bg-amber-50',   text: 'text-amber-700'  },
  { value: 'print',     label: 'Print',        icon: '🖨️', bg: 'bg-orange-50',  text: 'text-orange-700' },
  { value: 'ia',        label: 'IA / Auto.',   icon: '🤖', bg: 'bg-teal-50',    text: 'text-teal-700'   },
  { value: 'autre',     label: 'Autre',        icon: '📦', bg: 'bg-gray-100',   text: 'text-gray-600'   },
]
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))
const CAT_OPTIONS = [{ value: '', label: 'Sans catégorie' }, ...CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))]

const FORM_INIT: PortfolioFormState = {
  titre: '', categorie: '', client_nom: '', description: '',
  date_livraison: '', url_projet: '', technologies: [],
  featured: false, publie: false,
  thumbFile: null, thumbPreview: null,
  galleryFiles: [], keepImages: [], removeImages: [],
}

interface PortfolioFormState {
  titre: string; categorie: string; client_nom: string
  description: string; date_livraison: string; url_projet: string
  technologies: string[]
  featured: boolean; publie: boolean
  thumbFile: File | null; thumbPreview: string | null
  galleryFiles: Array<{ file: File; preview: string }>
  keepImages: string[]; removeImages: string[]
}

// ─── Category badge ───────────────────────────────────────────────────────────

function CatBadge({ cat, size = 'sm' }: { cat?: string; size?: 'sm' | 'xs' }) {
  const c = cat ? CAT_MAP[cat] : null
  if (!c) return null
  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-medium rounded-full border border-transparent',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5',
      c.bg, c.text,
    )}>
      {c.icon} {c.label}
    </span>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1',
          checked ? 'bg-brand-500' : 'bg-gray-200',
        )}
        style={{ height: '22px' }}
        role="switch"
        aria-checked={checked}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
          checked && 'translate-x-[18px]',
        )} />
      </button>
    </div>
  )
}

// ─── Tech tag input ───────────────────────────────────────────────────────────

function TechInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const t = draft.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setDraft('')
  }
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1.5">Technologies</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {value.map(t => (
          <span key={t} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {t}
            <button type="button" onClick={() => onChange(value.filter(v => v !== t))} className="text-gray-400 hover:text-gray-600 leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
          placeholder="React, TailwindCSS… (Entrée pour ajouter)"
          className="flex-1 h-8 px-3 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {draft.trim() && (
          <button type="button" onClick={add} className="h-8 px-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Thumbnail drop zone ──────────────────────────────────────────────────────

function ThumbnailZone({ current, preview, onFile }: {
  current?: string; preview: string | null; onFile: (f: File | null, p: string | null) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const src = preview ?? current
  const [drag, setDrag] = useState(false)

  const pick = (file: File) => {
    const url = URL.createObjectURL(file)
    onFile(file, url)
  }
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'))
    if (f) pick(f)
  }, [])

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1.5">Thumbnail *</label>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => ref.current?.click()}
        className={cn(
          'relative w-full aspect-video rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all',
          drag ? 'border-brand-400 bg-brand-50' : src ? 'border-transparent' : 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/40',
        )}
      >
        {src ? (
          <>
            <img src={src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="bg-white/90 rounded-full p-2">
                <Upload className="h-4 w-4 text-gray-700" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
              <Image className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 text-center px-4">
              {drag ? 'Déposer ici' : 'Glisser-déposer ou cliquer'}
            </p>
          </div>
        )}
      </div>
      {src && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onFile(null, null) }}
          className="mt-1.5 text-[10px] text-red-500 hover:text-red-700 transition-colors"
        >
          Supprimer le thumbnail
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = '' }} />
    </div>
  )
}

// ─── Gallery zone ─────────────────────────────────────────────────────────────

function GalleryZone({ existing, newFiles, onAddFiles, onRemoveExisting, onRemoveNew }: {
  existing: string[]
  newFiles: Array<{ file: File; preview: string }>
  onAddFiles: (files: File[]) => void
  onRemoveExisting: (url: string) => void
  onRemoveNew: (idx: number) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const hasItems = existing.length > 0 || newFiles.length > 0

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1.5">Galerie d'images</label>
      <div className="grid grid-cols-4 gap-2">
        {existing.map(url => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(url)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        {newFiles.map(({ preview }, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-1 left-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <button
              type="button"
              onClick={() => onRemoveNew(idx)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={cn(
            'aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50/40 transition-colors flex flex-col items-center justify-center gap-1',
            !hasItems && 'col-span-4 aspect-auto py-6',
          )}
        >
          <Plus className="h-4 w-4 text-gray-400" />
          {!hasItems && <p className="text-xs text-gray-400">Ajouter des images</p>}
        </button>
      </div>
      <input
        ref={ref} type="file" accept="image/*" multiple hidden
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onAddFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, index, onClose, onNav }: {
  images: string[]; index: number; onClose: () => void; onNav: (i: number) => void
}) {
  return (
    <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
        <X className="h-5 w-5 text-white" />
      </button>
      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onNav(index - 1) }}
          className="absolute left-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
      )}
      <img
        src={images[index]}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
        onClick={e => e.stopPropagation()}
      />
      {index < images.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNav(index + 1) }}
          className="absolute right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      )}
      <div className="absolute bottom-4 text-xs text-white/50">{index + 1} / {images.length}</div>
    </div>
  )
}

// ─── Preview modal ────────────────────────────────────────────────────────────

function PreviewModal({ item, onClose, onEdit }: {
  item: PortfolioItem; onClose: () => void; onEdit: () => void
}) {
  const allImages = [item.thumbnail_url, ...item.images].filter(Boolean) as string[]
  const [lbIdx, setLbIdx] = useState<number | null>(null)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      {lbIdx !== null && (
        <Lightbox images={allImages} index={lbIdx} onClose={() => setLbIdx(null)} onNav={setLbIdx} />
      )}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative aspect-video w-full shrink-0 bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.titre} className="w-full h-full object-cover cursor-pointer" onClick={() => setLbIdx(0)} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="h-16 w-16 text-brand-200" />
            </div>
          )}
          {/* top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className={cn(
              'text-[10px] font-semibold px-2 py-1 rounded-full',
              item.publie ? 'bg-emerald-500 text-white' : 'bg-gray-800/60 text-white',
            )}>
              {item.publie ? 'Publié' : 'Brouillon'}
            </span>
            <div className="flex gap-2">
              {item.url_projet && (
                <a
                  href={item.url_projet}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="h-8 px-3 flex items-center gap-1.5 bg-white/90 hover:bg-white rounded-full text-xs font-medium text-gray-700 shadow transition-colors"
                >
                  <ExternalLink className="h-3 w-3" /> Voir en ligne
                </a>
              )}
              <button
                onClick={onEdit}
                className="h-8 px-3 flex items-center gap-1.5 bg-white/90 hover:bg-white rounded-full text-xs font-medium text-gray-700 shadow transition-colors"
              >
                <Edit className="h-3 w-3" /> Modifier
              </button>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          {item.featured && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
              <span className="text-xs font-semibold text-amber-400">En vedette</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              {item.categorie && <CatBadge cat={item.categorie} />}
              <h2 className="text-xl font-bold text-gray-900 mt-1.5">{item.titre}</h2>
              {item.client_nom && (
                <p className="text-sm text-gray-500 mt-0.5">{item.client_nom}</p>
              )}
              {item.date_livraison && (
                <p className="text-xs text-gray-400 mt-0.5">Livré le {formatDate(item.date_livraison)}</p>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{item.description}</p>
          )}

          {item.technologies.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Technologies</p>
              <div className="flex flex-wrap gap-1.5">
                {item.technologies.map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Gallery strip */}
          {item.images.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Galerie</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {item.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setLbIdx(item.thumbnail_url ? i + 1 : i)}
                    className="shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-brand-400 transition-colors"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Portfolio card ───────────────────────────────────────────────────────────

function PortfolioCard({ item, onEdit, onPreview, onDelete, onToggleFeatured, onTogglePublished }: {
  item: PortfolioItem
  onEdit: () => void
  onPreview: () => void
  onDelete: () => void
  onToggleFeatured: () => void
  onTogglePublished: () => void
}) {
  return (
    <div className={cn('group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-card hover:shadow-elevated transition-all duration-200', !item.publie && 'opacity-65 hover:opacity-100')}>
      {/* Image area */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer" onClick={onPreview}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.titre} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="h-10 w-10 text-gray-200" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

        {/* Top badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <span className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm',
            item.publie ? 'bg-emerald-500/90 text-white' : 'bg-gray-800/60 text-gray-200',
          )}>
            {item.publie ? 'Publié' : 'Brouillon'}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onToggleFeatured() }}
            className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
          >
            <Star className={cn('h-3.5 w-3.5', item.featured ? 'fill-amber-400 text-amber-400' : 'text-white/60')} />
          </button>
        </div>

        {/* Category badge at bottom */}
        {item.categorie && (
          <div className="absolute bottom-3 left-3">
            <CatBadge cat={item.categorie} size="xs" />
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onPreview() }}
            className="h-8 px-3 bg-white/90 hover:bg-white rounded-full text-xs font-medium text-gray-800 flex items-center gap-1.5 shadow transition-colors"
          >
            <Eye className="h-3 w-3" /> Aperçu
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="h-8 px-3 bg-white/90 hover:bg-white rounded-full text-xs font-medium text-gray-800 flex items-center gap-1.5 shadow transition-colors"
          >
            <Edit className="h-3 w-3" /> Modifier
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{item.titre}</h3>
            {item.client_nom && <p className="text-xs text-gray-400 truncate mt-0.5">{item.client_nom}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {item.url_projet && (
              <a
                href={item.url_projet}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-500 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              onClick={e => { e.stopPropagation(); onTogglePublished() }}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                item.publie ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500',
              )}
              title={item.publie ? 'Dépublier' : 'Publier'}
            >
              <Globe className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.technologies.slice(0, 4).map(t => (
              <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t}</span>
            ))}
            {item.technologies.length > 4 && (
              <span className="text-[10px] text-gray-400">+{item.technologies.length - 4}</span>
            )}
          </div>
        )}
        {item.date_livraison && (
          <p className="text-[10px] text-gray-400 mt-2">Livré le {formatDate(item.date_livraison)}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function Portfolio() {
  const [catFilter, setCatFilter]   = useState('all')
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid')
  const [panelMode, setPanelMode]   = useState<'create' | 'edit' | null>(null)
  const [editItem, setEditItem]     = useState<PortfolioItem | null>(null)
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null)
  const [form, setForm]             = useState<PortfolioFormState>(FORM_INIT)

  const { data: items = [], isLoading } = usePortfolioItems()
  const createItem    = useCreatePortfolioItem()
  const updateItem    = useUpdatePortfolioItem()
  const deleteItem    = useDeletePortfolioItem()
  const toggleFeat    = useToggleFeatured()
  const togglePub     = useTogglePublished()

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total     = items.length
  const published = items.filter(i => i.publie).length
  const featured  = items.filter(i => i.featured).length
  const topCat    = useMemo(() => {
    const counts: Record<string, number> = {}
    items.forEach(i => { if (i.categorie) counts[i.categorie] = (counts[i.categorie] ?? 0) + 1 })
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    return best ? CAT_MAP[best[0]] : null
  }, [items])

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = catFilter === 'all' ? items : items.filter(i => i.categorie === catFilter)

  // ── Panel helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(FORM_INIT)
    setEditItem(null)
    setPanelMode('create')
  }
  const openEdit = (item: PortfolioItem) => {
    setForm({
      titre: item.titre,
      categorie: item.categorie ?? '',
      client_nom: item.client_nom ?? '',
      description: item.description ?? '',
      date_livraison: item.date_livraison ?? '',
      url_projet: item.url_projet ?? '',
      technologies: [...item.technologies],
      featured: item.featured,
      publie: item.publie,
      thumbFile: null,
      thumbPreview: null,
      keepImages: [...item.images],
      galleryFiles: [],
      removeImages: [],
    })
    setEditItem(item)
    setPanelMode('edit')
    setPreviewItem(null)
  }
  const closePanel = () => { setPanelMode(null); setEditItem(null) }

  const setF = <K extends keyof PortfolioFormState>(k: K, v: PortfolioFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const buildPayload = (): PortfolioPayload => ({
    titre: form.titre,
    categorie: form.categorie || undefined,
    client_nom: form.client_nom || undefined,
    description: form.description || undefined,
    date_livraison: form.date_livraison || undefined,
    url_projet: form.url_projet || undefined,
    technologies: form.technologies,
    featured: form.featured,
    publie: form.publie,
    thumbFile: form.thumbFile,
    galleryFiles: form.galleryFiles.map(g => g.file),
    keepImages: form.keepImages,
    removeImages: form.removeImages,
  })

  const handleSave = async () => {
    if (!form.titre.trim()) return
    if (panelMode === 'create') {
      await createItem.mutateAsync(buildPayload())
    } else if (editItem) {
      await updateItem.mutateAsync({ id: editItem.id, ...buildPayload() })
    }
    closePanel()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteItem.mutateAsync(deleteTarget)
    setDeleteTarget(null)
  }

  const isPending = createItem.isPending || updateItem.isPending

  // ── Gallery image handlers ─────────────────────────────────────────────────
  const addGalleryFiles = (files: File[]) => {
    const newEntries = files.map(file => ({ file, preview: URL.createObjectURL(file) }))
    setForm(f => ({ ...f, galleryFiles: [...f.galleryFiles, ...newEntries] }))
  }
  const removeExistingImage = (url: string) => {
    setForm(f => ({
      ...f,
      keepImages: f.keepImages.filter(u => u !== url),
      removeImages: [...f.removeImages, url],
    }))
  }
  const removeNewImage = (idx: number) => {
    setForm(f => {
      URL.revokeObjectURL(f.galleryFiles[idx].preview)
      return { ...f, galleryFiles: f.galleryFiles.filter((_, i) => i !== idx) }
    })
  }

  return (
    <Layout
      title="Portfolio"
      actions={<Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5" />Ajouter une réalisation</Button>}
    >
      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Réalisations', value: total, sub: 'au total', color: 'text-gray-900' },
          { label: 'Publiées', value: published, sub: `${total - published} brouillon${total - published > 1 ? 's' : ''}`, color: 'text-emerald-600' },
          { label: 'En vedette', value: featured, sub: 'épinglées', color: 'text-amber-500' },
          {
            label: 'Top catégorie', value: topCat ? `${topCat.icon}` : '—',
            sub: topCat?.label ?? 'Aucune', color: 'text-gray-700',
          },
        ].map(s => (
          <Card key={s.label}>
            <p className="text-xs text-gray-500 mb-1.5">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setCatFilter('all')}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            catFilter === 'all' ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}
        >
          Tous ({items.length})
        </button>
        {CATEGORIES.filter(c => items.some(i => i.categorie === c.value)).map(c => (
          <button
            key={c.value}
            onClick={() => setCatFilter(c.value)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              catFilter === c.value ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}
          >
            {c.icon} {c.label} ({items.filter(i => i.categorie === c.value).length})
          </button>
        ))}

        <div className="ml-auto flex items-center bg-gray-100 rounded-lg p-0.5">
          {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn('p-1.5 rounded-md transition-colors',
                viewMode === mode ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600')}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-16">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Image className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Aucune réalisation</p>
          <button onClick={openCreate} className="text-xs text-brand-600 hover:underline">
            Ajouter la première →
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(item => (
            <PortfolioCard
              key={item.id}
              item={item}
              onEdit={() => openEdit(item)}
              onPreview={() => setPreviewItem(item)}
              onDelete={() => setDeleteTarget(item)}
              onToggleFeatured={() => toggleFeat.mutate({ id: item.id, featured: !item.featured })}
              onTogglePublished={() => togglePub.mutate({ id: item.id, publie: !item.publie })}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <Card padding={false}>
          <div className="divide-y divide-gray-50">
            {filtered.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.thumbnail_url
                    ? <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Globe className="h-4 w-4 text-gray-300" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.titre}</p>
                    {item.featured && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
                  </div>
                  {item.client_nom && <p className="text-xs text-gray-400 truncate">{item.client_nom}</p>}
                </div>
                {item.categorie && <CatBadge cat={item.categorie} size="xs" />}
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                  item.publie ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                  {item.publie ? 'Publié' : 'Brouillon'}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => setPreviewItem(item)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Preview modal ─────────────────────────────────────────────────── */}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={() => { openEdit(previewItem); setPreviewItem(null) }}
        />
      )}

      {/* ── Delete confirm ────────────────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la réalisation"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteItem.isPending}>
              {deleteItem.isPending ? 'Suppression…' : 'Supprimer'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Supprimer <span className="font-semibold">"{deleteTarget?.titre}"</span> ? Les images associées seront également supprimées.
        </p>
      </Modal>

      {/* ── Create / Edit panel ───────────────────────────────────────────── */}
      {panelMode && (
        <>
          <div className="fixed inset-0 z-20 bg-black/10 backdrop-blur-[2px]" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 w-[760px] z-30 bg-white shadow-2xl flex flex-col border-l border-gray-100">

            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-semibold text-gray-900">
                {panelMode === 'create' ? 'Nouvelle réalisation' : `Modifier — ${editItem?.titre}`}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={closePanel}>Annuler</Button>
                <Button size="sm" onClick={handleSave} disabled={isPending || !form.titre.trim()}>
                  {isPending ? 'Enregistrement…' : panelMode === 'create' ? 'Créer' : 'Enregistrer'}
                </Button>
                <button onClick={closePanel} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Panel body — 2 columns */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 divide-x divide-gray-100 h-full">

                {/* Left — form fields */}
                <div className="px-6 py-5 space-y-4">
                  <Select
                    label="Catégorie"
                    value={form.categorie}
                    onChange={e => setF('categorie', e.target.value)}
                    options={CAT_OPTIONS}
                    placeholder="Sans catégorie"
                  />
                  <Input
                    label="Titre *"
                    placeholder="Site vitrine Dupont & Associés"
                    value={form.titre}
                    onChange={e => setF('titre', e.target.value)}
                  />
                  <Input
                    label="Nom du client"
                    placeholder="Dupont & Associés"
                    value={form.client_nom}
                    onChange={e => setF('client_nom', e.target.value)}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Présentation du projet, contexte, objectifs…"
                    value={form.description}
                    onChange={e => setF('description', e.target.value)}
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Date de livraison"
                      type="date"
                      value={form.date_livraison}
                      onChange={e => setF('date_livraison', e.target.value)}
                    />
                    <Input
                      label="URL du projet"
                      placeholder="https://…"
                      value={form.url_projet}
                      onChange={e => setF('url_projet', e.target.value)}
                    />
                  </div>
                  <TechInput value={form.technologies} onChange={v => setF('technologies', v)} />
                </div>

                {/* Right — images + toggles */}
                <div className="px-6 py-5 space-y-5">
                  <ThumbnailZone
                    current={editItem?.thumbnail_url}
                    preview={form.thumbPreview}
                    onFile={(f, p) => setForm(prev => ({ ...prev, thumbFile: f, thumbPreview: p }))}
                  />
                  <GalleryZone
                    existing={form.keepImages}
                    newFiles={form.galleryFiles}
                    onAddFiles={addGalleryFiles}
                    onRemoveExisting={removeExistingImage}
                    onRemoveNew={removeNewImage}
                  />
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <Toggle
                      label="Publier sur le portfolio"
                      checked={form.publie}
                      onChange={v => setF('publie', v)}
                    />
                    <Toggle
                      label="Mettre en vedette"
                      checked={form.featured}
                      onChange={v => setF('featured', v)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
