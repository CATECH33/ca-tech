import { useState, useMemo } from 'react'
import { Plus, Briefcase, Trash2, Clock, TrendingUp, Star, Package } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import {
  useServices, useServiceStats,
  useCreateService, useUpdateService, useDeleteService,
} from '@/hooks/useServices'
import type { Service } from '@/types'

const CAT_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  web:      { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: '🌐' },
  branding: { bg: 'bg-violet-50', text: 'text-violet-600', icon: '✨' },
  tech:     { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: '⚙️' },
  print:    { bg: 'bg-rose-50',   text: 'text-rose-600',   icon: '🖨️' },
  ia:       { bg: 'bg-teal-50',   text: 'text-teal-600',   icon: '🤖' },
  autre:    { bg: 'bg-gray-100',  text: 'text-gray-600',   icon: '📦' },
}
const CAT_LABEL: Record<string, string> = {
  web: 'Web', branding: 'Branding', tech: 'Tech', print: 'Print', ia: 'IA', autre: 'Autre',
}
const CAT_OPTIONS = [
  { value: 'web',      label: 'Web' },
  { value: 'branding', label: 'Branding' },
  { value: 'tech',     label: 'Tech' },
  { value: 'print',    label: 'Print' },
  { value: 'ia',       label: 'IA' },
  { value: 'autre',    label: 'Autre' },
]
const UNITE_OPTIONS = [
  { value: 'forfait', label: 'Forfait' },
  { value: 'heure',   label: 'Heure' },
  { value: 'jour',    label: 'Jour' },
  { value: 'mois',    label: 'Mois' },
  { value: 'page',    label: 'Page' },
]

const CATECH_PRESETS = [
  { nom: 'Site Vitrine',        categorie: 'web',      prix_base: 990,  unite: 'forfait', duree_jours: 14, description: "Site vitrine professionnel, responsive, SEO optimisé, jusqu'à 5 pages." },
  { nom: 'Site E-commerce',     categorie: 'web',      prix_base: 2490, unite: 'forfait', duree_jours: 30, description: 'Boutique en ligne complète avec gestion des produits, paiements et livraison.' },
  { nom: 'Landing Page',        categorie: 'web',      prix_base: 490,  unite: 'forfait', duree_jours: 7,  description: 'Page de conversion haute performance, optimisée pour la publicité et le SEO.' },
  { nom: 'Logo Professionnel',  categorie: 'branding', prix_base: 290,  unite: 'forfait', duree_jours: 5,  description: 'Logo unique avec 3 propositions et fichiers sources (AI, SVG, PNG, PDF).' },
  { nom: 'Flyer Professionnel', categorie: 'print',    prix_base: 149,  unite: 'forfait', duree_jours: 3,  description: "Flyer recto-verso professionnel, prêt à l'impression en haute résolution." },
  { nom: 'Identité Visuelle',   categorie: 'branding', prix_base: 790,  unite: 'forfait', duree_jours: 10, description: 'Logo, charte graphique complète, typographie, palette de couleurs et déclinaisons.' },
] as const

const FORM_INIT = { nom: '', description: '', prix_base: '', unite: 'forfait', categorie: 'web', duree_jours: '' }

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange() }}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1 ${checked ? 'bg-brand-500' : 'bg-gray-200'}`}
      aria-checked={checked}
      role="switch"
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  )
}

export function Services() {
  const [cat, setCat] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Service | null>(null)
  const [form, setForm] = useState(FORM_INIT)

  const { data: services = [], isLoading } = useServices()
  const { data: statsMap = {} } = useServiceStats()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()

  const cats = useMemo(() => Array.from(new Set(services.map(s => s.categorie ?? 'autre'))), [services])
  const filtered = cat === 'all' ? services : services.filter(s => (s.categorie ?? 'autre') === cat)

  const totalCA = useMemo(() => Object.values(statsMap).reduce((sum, s) => sum + s.ca, 0), [statsMap])

  const topService = useMemo(() => {
    let best: { nom: string; ventes: number } | null = null
    for (const svc of services) {
      const st = statsMap[svc.id]
      if (st && (!best || st.ventes > best.ventes)) best = { nom: svc.nom, ventes: st.ventes }
    }
    return best
  }, [services, statsMap])

  const maxCA = useMemo(() => Math.max(1, ...Object.values(statsMap).map(s => s.ca)), [statsMap])

  const existingNames = useMemo(() => new Set(services.map(s => s.nom)), [services])

  const openAdd = () => { setForm(FORM_INIT); setShowAdd(true) }

  const openEdit = (s: Service) => {
    setForm({
      nom: s.nom,
      description: s.description ?? '',
      prix_base: String(s.prix_base),
      unite: s.unite,
      categorie: s.categorie ?? 'autre',
      duree_jours: s.duree_jours ? String(s.duree_jours) : '',
    })
    setSelected(s)
  }

  const handleCreate = async () => {
    if (!form.nom || !form.prix_base) return
    await createService.mutateAsync({
      nom: form.nom,
      description: form.description || undefined,
      prix_base: Number(form.prix_base),
      unite: form.unite,
      categorie: form.categorie,
      duree_jours: form.duree_jours ? Number(form.duree_jours) : undefined,
    })
    setShowAdd(false)
    setForm(FORM_INIT)
  }

  const handleUpdate = async () => {
    if (!selected || !form.nom || !form.prix_base) return
    await updateService.mutateAsync({
      id: selected.id,
      nom: form.nom,
      description: form.description || undefined,
      prix_base: Number(form.prix_base),
      unite: form.unite,
      categorie: form.categorie,
      duree_jours: form.duree_jours ? Number(form.duree_jours) : undefined,
    })
    setSelected(null)
  }

  const handleDelete = async () => {
    if (!selected) return
    await deleteService.mutateAsync(selected.id)
    setSelected(null)
  }

  const serviceForm = (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Suggestions CA-TECH</p>
        <div className="flex flex-wrap gap-1.5">
          {CATECH_PRESETS.map(preset => {
            const exists = existingNames.has(preset.nom)
            const active = form.nom === preset.nom
            return (
              <button
                key={preset.nom}
                type="button"
                disabled={exists}
                onClick={() => {
                  if (exists) return
                  setForm({
                    nom: preset.nom,
                    description: preset.description,
                    prix_base: String(preset.prix_base),
                    unite: preset.unite,
                    categorie: preset.categorie,
                    duree_jours: String(preset.duree_jours),
                  })
                }}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  exists
                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-default'
                    : active
                      ? 'border-brand-400 bg-brand-50 text-brand-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {exists ? '✓ ' : ''}{preset.nom}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <Input
          label="Nom du service *"
          placeholder="Site Vitrine, Logo, Application…"
          value={form.nom}
          onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
        />
        <Textarea
          label="Description"
          placeholder="Ce qui est inclus dans la prestation…"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prix de base (€) *"
            type="number"
            min="0"
            placeholder="590"
            value={form.prix_base}
            onChange={e => setForm(f => ({ ...f, prix_base: e.target.value }))}
          />
          <Select
            label="Unité"
            value={form.unite}
            onChange={e => setForm(f => ({ ...f, unite: e.target.value }))}
            options={UNITE_OPTIONS}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Catégorie"
            value={form.categorie}
            onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
            options={CAT_OPTIONS}
          />
          <Input
            label="Durée moyenne (jours)"
            type="number"
            min="1"
            placeholder="14"
            value={form.duree_jours}
            onChange={e => setForm(f => ({ ...f, duree_jours: e.target.value }))}
          />
        </div>
      </div>
    </div>
  )

  return (
    <Layout
      title="Services"
      actions={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" />Nouveau service</Button>}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <Package className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <p className="text-xs text-gray-500">Total services</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{services.length}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="text-xs text-gray-500">Actifs</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{services.filter(s => s.actif).length}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-brand-50 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5 text-brand-500" />
            </div>
            <p className="text-xs text-gray-500">CA généré</p>
          </div>
          <p className="text-2xl font-bold text-brand-600">{totalCA > 0 ? formatCurrency(totalCA) : '—'}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <Star className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500">Top service</p>
          </div>
          {topService ? (
            <>
              <p className="text-sm font-bold text-gray-900 truncate leading-tight">{topService.nom}</p>
              <p className="text-xs text-gray-400 mt-0.5">{topService.ventes} vente{topService.ventes !== 1 ? 's' : ''}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-300">—</p>
          )}
        </Card>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setCat('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat === 'all' ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
        >
          Tous ({services.length})
        </button>
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat === c ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            {CAT_LABEL[c] ?? c} ({services.filter(s => (s.categorie ?? 'autre') === c).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-12">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Briefcase className="h-6 w-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">Aucun service dans cette catégorie</p>
          <button onClick={openAdd} className="mt-2 text-xs text-brand-600 hover:underline">
            Ajouter un service →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(service => {
            const c = service.categorie ?? 'autre'
            const col = CAT_COLORS[c] ?? CAT_COLORS.autre
            const st = statsMap[service.id]
            const caBar = st ? Math.round((st.ca / maxCA) * 100) : 0

            return (
              <Card
                key={service.id}
                onClick={() => openEdit(service)}
                className={`cursor-pointer transition-shadow ${service.actif ? 'hover:shadow-elevated' : 'opacity-55 hover:opacity-80 hover:shadow-elevated'}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 flex items-center justify-center text-lg rounded-xl shrink-0 ${col.bg}`}>
                      {col.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{service.nom}</h3>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${col.bg} ${col.text}`}>
                        {CAT_LABEL[c] ?? c}
                      </span>
                    </div>
                  </div>
                  <Toggle
                    checked={service.actif}
                    onChange={() => updateService.mutate({ id: service.id, actif: !service.actif })}
                  />
                </div>

                {/* Description */}
                {service.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{service.description}</p>
                )}

                {/* Duration + sales badges */}
                {(service.duree_jours || (st && st.ventes > 0)) && (
                  <div className="flex items-center gap-3 mb-3">
                    {service.duree_jours && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{service.duree_jours} jour{service.duree_jours > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {st && st.ventes > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <TrendingUp className="h-3 w-3 shrink-0" />
                        <span>{st.ventes} vente{st.ventes > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(service.prix_base)}</span>
                      <span className="text-xs text-gray-400 ml-1">/ {service.unite}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${service.actif ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {service.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  {/* CA bar */}
                  {st && st.ca > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-400">CA généré</span>
                        <span className="text-[10px] font-medium text-gray-600">{formatCurrency(st.ca)}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-500"
                          style={{ width: `${caBar}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Nouveau service"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createService.isPending || !form.nom || !form.prix_base}>
              {createService.isPending ? 'Création…' : 'Créer le service'}
            </Button>
          </>
        }
      >
        {serviceForm}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.nom ?? ''}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteService.isPending}>
              <Trash2 className="h-3.5 w-3.5" />
              {deleteService.isPending ? 'Suppression…' : 'Supprimer'}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Annuler</Button>
              <Button onClick={handleUpdate} disabled={updateService.isPending || !form.nom || !form.prix_base}>
                {updateService.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        }
      >
        {serviceForm}
      </Modal>
    </Layout>
  )
}
