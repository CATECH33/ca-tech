import { useState, useRef, useCallback, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Upload, X, ImageIcon, Smile, Eye, EyeOff,
  Globe, Tag, Save, ChevronDown,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { CollaborateurCategorie } from '@/hooks/useCatalogueCollaborateurs'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  nom: string
  slug: string
  categorie: CollaborateurCategorie
  description_courte: string
  description_complete: string
  image: File | null
  imagePreview: string | null
  icone: string
  prix: string
  prix_barre: string
  cta_label: string
  ordre: string
  visible: boolean
  seo_title: string
  seo_description: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CAT_OPTIONS = [
  { value: 'assistant',    label: 'Assistant IA' },
  { value: 'agent',        label: 'Agent autonome' },
  { value: 'analyste',     label: 'Analyste IA' },
  { value: 'createur',     label: 'Créateur IA' },
  { value: 'automatiseur', label: 'Automatiseur' },
  { value: 'autre',        label: 'Autre' },
]

const ICON_SUGGESTIONS = ['🤖', '🧠', '⚡', '✨', '🔮', '💡', '📊', '🎯', '🚀', '🔧', '📝', '🌐']

const FORM_INIT: FormState = {
  nom: '',
  slug: '',
  categorie: 'assistant',
  description_courte: '',
  description_complete: '',
  image: null,
  imagePreview: null,
  icone: '',
  prix: '',
  prix_barre: '',
  cta_label: 'Activer ce collaborateur',
  ordre: '1',
  visible: false,
  seo_title: '',
  seo_description: '',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeSlug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ─── ImageDropzone ─────────────────────────────────────────────────────────────

interface ImageDropzoneProps {
  preview: string | null
  onFile: (file: File) => void
  onRemove: () => void
}

function ImageDropzone({ preview, onFile, onRemove }: ImageDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    onFile(file)
  }, [onFile])

  return (
    <div className="relative">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video">
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={e => { e.preventDefault(); setDragging(false) }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handle(file)
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed aspect-video cursor-pointer transition-all',
            dragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
          )}
        >
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center transition-colors',
            dragging ? 'bg-brand-100' : 'bg-white border border-gray-200'
          )}>
            <ImageIcon className={cn('h-5 w-5', dragging ? 'text-brand-500' : 'text-gray-400')} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {dragging ? "Déposez l'image" : 'Glissez une image ici'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              ou <span className="text-brand-500 font-medium">parcourez</span> · PNG, JPG, WEBP
            </p>
          </div>
          <p className="text-[11px] text-gray-400">Recommandé : 1200 × 630 px</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (file) handle(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ─── IconPicker ────────────────────────────────────────────────────────────────

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700">Icône</label>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-xl shrink-0">
          {value || <Smile className="h-4 w-4 text-gray-400" />}
        </div>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Emoji ou texte court…"
          maxLength={4}
          className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            Suggestions <ChevronDown className="h-3 w-3" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-10 z-20 bg-white border border-gray-100 rounded-xl shadow-elevated p-2 flex flex-wrap gap-1 w-48">
                {ICON_SUGGESTIONS.map(ico => (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => { onChange(ico); setOpen(false) }}
                    className="h-8 w-8 rounded-lg text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    {ico}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400">Un emoji, un symbole ou une abréviation (4 caractères max)</p>
    </div>
  )
}

// ─── SeoPreview ────────────────────────────────────────────────────────────────

function SeoPreview({ title, description }: { title: string; description: string }) {
  const displayTitle = title || 'Titre SEO du collaborateur'
  const displayDesc  = description || 'Description meta qui apparaît dans les résultats Google.'
  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-medium">Aperçu Google</p>
      <p className="text-[13px] text-[#1a0dab] font-medium leading-tight truncate">
        {displayTitle.length > 60 ? displayTitle.slice(0, 57) + '…' : displayTitle}
      </p>
      <p className="text-[11px] text-[#006621] mt-0.5">ca-tech.fr › collaborateurs › …</p>
      <p className="text-[12px] text-[#545454] mt-0.5 leading-snug line-clamp-2">
        {displayDesc.length > 160 ? displayDesc.slice(0, 157) + '…' : displayDesc}
      </p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function CatalogueCollaborateurForm() {
  const navigate = useNavigate()
  const { id }   = useParams<{ id: string }>()
  const isEdit   = Boolean(id)

  const [form, setForm]         = useState<FormState>(FORM_INIT)
  const [slugManual, setSlugManual] = useState(false)

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleNomChange(nom: string) {
    set('nom', nom)
    if (!slugManual) set('slug', makeSlug(nom))
    if (!form.seo_title) set('seo_title', nom)
  }

  function handleImage(file: File) {
    const url = URL.createObjectURL(file)
    setForm(f => ({ ...f, image: file, imagePreview: url }))
  }

  function removeImage() {
    if (form.imagePreview && form.image) URL.revokeObjectURL(form.imagePreview)
    setForm(f => ({ ...f, image: null, imagePreview: null }))
  }

  const canSave = form.nom.trim().length > 0 && form.prix.length > 0

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/catalogue/collaborateurs')}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
                <span>Catalogue</span><span>/</span>
                <button onClick={() => navigate('/catalogue/collaborateurs')} className="hover:text-gray-600 transition-colors">Collaborateurs IA</button>
                <span>/</span>
                <span className="text-gray-600">{isEdit ? 'Modifier' : 'Nouveau'}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {isEdit ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/catalogue/collaborateurs')}>
              Annuler
            </Button>
            <Button disabled={!canSave} className="gap-2">
              <Save className="h-4 w-4" />
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </div>

        {/* Layout deux colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* ── Colonne principale ──────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Informations générales */}
            <Card>
              <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
              <div className="space-y-4">
                <Input
                  label="Nom *"
                  placeholder="Ex : Assistant Rédaction IA"
                  value={form.nom}
                  onChange={e => handleNomChange(e.target.value)}
                />

                {/* Slug */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">Slug</label>
                  <div className="flex items-center gap-0 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent overflow-hidden bg-white">
                    <span className="h-9 px-3 flex items-center text-xs text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0 select-none">
                      /collaborateurs/
                    </span>
                    <input
                      value={form.slug}
                      onChange={e => {
                        setSlugManual(true)
                        set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                      }}
                      placeholder="nom-du-collaborateur"
                      className="flex-1 h-9 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                    />
                  </div>
                  {slugManual && (
                    <button
                      type="button"
                      onClick={() => { setSlugManual(false); set('slug', makeSlug(form.nom)) }}
                      className="text-[11px] text-brand-500 hover:text-brand-600 text-left transition-colors"
                    >
                      Regénérer depuis le nom
                    </button>
                  )}
                </div>

                <Select
                  label="Catégorie"
                  value={form.categorie}
                  options={CAT_OPTIONS}
                  onChange={e => set('categorie', e.target.value as CollaborateurCategorie)}
                />

                <Textarea
                  label="Description courte"
                  placeholder="Résumé en 1-2 phrases affiché dans les cartes et les aperçus…"
                  value={form.description_courte}
                  onChange={e => set('description_courte', e.target.value)}
                />
                <div className="flex justify-end">
                  <span className={cn(
                    'text-[11px]',
                    form.description_courte.length > 160 ? 'text-amber-500' : 'text-gray-400'
                  )}>
                    {form.description_courte.length}/160
                  </span>
                </div>
              </div>
            </Card>

            {/* Description complète */}
            <Card>
              <CardHeader><CardTitle>Description complète</CardTitle></CardHeader>
              <Textarea
                placeholder="Décrivez le collaborateur en détail : ses capacités, cas d'usage, limites, exemples concrets…"
                value={form.description_complete}
                onChange={e => set('description_complete', e.target.value)}
                className="min-h-[180px]"
              />
            </Card>

            {/* Médias */}
            <Card>
              <CardHeader>
                <CardTitle>Médias</CardTitle>
              </CardHeader>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-gray-400" />
                    Image principale
                  </p>
                  <ImageDropzone
                    preview={form.imagePreview}
                    onFile={handleImage}
                    onRemove={removeImage}
                  />
                </div>
                <IconPicker value={form.icone} onChange={v => set('icone', v)} />
              </div>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  Référencement (SEO)
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <Input
                    label="Titre SEO"
                    placeholder="Titre optimisé pour Google…"
                    value={form.seo_title}
                    onChange={e => set('seo_title', e.target.value)}
                  />
                  <div className="flex justify-end">
                    <span className={cn(
                      'text-[11px]',
                      form.seo_title.length > 60 ? 'text-amber-500' : 'text-gray-400'
                    )}>
                      {form.seo_title.length}/60
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Textarea
                    label="Description SEO"
                    placeholder="Description meta affichée dans les résultats de recherche…"
                    value={form.seo_description}
                    onChange={e => set('seo_description', e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <span className={cn(
                      'text-[11px]',
                      form.seo_description.length > 160 ? 'text-amber-500' : 'text-gray-400'
                    )}>
                      {form.seo_description.length}/160
                    </span>
                  </div>
                </div>
                <SeoPreview title={form.seo_title} description={form.seo_description} />
              </div>
            </Card>
          </div>

          {/* ── Colonne latérale ────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Publication */}
            <Card>
              <CardHeader><CardTitle>Publication</CardTitle></CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Visible</p>
                    <p className="text-xs text-gray-400 mt-0.5">Affiché sur le site public</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('visible', !form.visible)}
                    className={cn(
                      'relative w-10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1',
                      form.visible ? 'bg-brand-500' : 'bg-gray-200'
                    )}
                    style={{ height: '22px' }}
                    role="switch"
                    aria-checked={form.visible}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                      form.visible ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </button>
                </div>

                {form.visible ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                    <Eye className="h-3.5 w-3.5" />
                    Visible sur le site
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                    <EyeOff className="h-3.5 w-3.5" />
                    Non publié
                  </div>
                )}

                <Input
                  label="Ordre d'affichage"
                  type="number"
                  min="1"
                  value={form.ordre}
                  onChange={e => set('ordre', e.target.value)}
                  hint="1 = affiché en premier"
                />
              </div>
            </Card>

            {/* Tarification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  Tarification
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <Input
                  label="Prix (€) *"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.prix}
                  onChange={e => set('prix', e.target.value)}
                />

                <div className="flex flex-col gap-1">
                  <Input
                    label="Prix barré (€)"
                    type="number"
                    min="0"
                    placeholder="Optionnel"
                    value={form.prix_barre}
                    onChange={e => set('prix_barre', e.target.value)}
                  />
                  {form.prix_barre && form.prix && Number(form.prix_barre) > Number(form.prix) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-1">
                      <span className="line-through text-gray-400">{form.prix_barre} €</span>
                      <span className="text-gray-700 font-semibold">{form.prix} €</span>
                      <span className="ml-auto text-emerald-600 font-medium">
                        -{Math.round((1 - Number(form.prix) / Number(form.prix_barre)) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <Input
                  label="Libellé du bouton CTA"
                  placeholder="Ex : Activer ce collaborateur"
                  value={form.cta_label}
                  onChange={e => set('cta_label', e.target.value)}
                />
                {form.cta_label && (
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium">
                      {form.cta_label}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 mt-5 pt-5 border-t border-gray-100">
          <Button variant="outline" onClick={() => navigate('/catalogue/collaborateurs')}>
            Annuler
          </Button>
          <Button disabled={!canSave} className="gap-2">
            <Save className="h-4 w-4" />
            {isEdit ? 'Enregistrer les modifications' : 'Créer le collaborateur'}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
