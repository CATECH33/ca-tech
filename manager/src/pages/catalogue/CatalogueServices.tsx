import { useState, useMemo } from 'react'
import {
  Plus, Search, Edit, Trash2, Copy, Eye, EyeOff,
  ChevronUp, ChevronDown, MoreHorizontal, Loader2,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from '@/components/ui/Table'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  useCatalogueServices,
  useCreateCatalogueService,
  useUpdateCatalogueService,
  useDeleteCatalogueService,
  useToggleCatalogueVisible,
  useDuplicateCatalogueService,
} from '@/hooks/useCatalogueServices'
import type { CatalogueService, CatalogueCategorie } from '@/hooks/useCatalogueServices'

// ─── Constants ─────────────────────────────────────────────────────────────────

const CAT_STYLES: Record<CatalogueCategorie, { bg: string; text: string; label: string }> = {
  web:         { bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'Site web' },
  ecommerce:   { bg: 'bg-violet-50', text: 'text-violet-600', label: 'E-commerce' },
  seo:         { bg: 'bg-amber-50',  text: 'text-amber-600',  label: 'SEO' },
  ia:          { bg: 'bg-teal-50',   text: 'text-teal-600',   label: 'IA & Auto.' },
  branding:    { bg: 'bg-pink-50',   text: 'text-pink-600',   label: 'Branding' },
  application: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Application' },
  autre:       { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'Autre' },
}

const CAT_OPTIONS = Object.entries(CAT_STYLES).map(([value, { label }]) => ({ value, label }))

const FORM_INIT = {
  nom: '',
  description: '',
  categorie: 'web' as CatalogueCategorie,
  prix: '',
  ordre: '',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function CatBadge({ cat }: { cat: CatalogueCategorie }) {
  const s = CAT_STYLES[cat]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', s.bg, s.text)}>
      {s.label}
    </span>
  )
}

function VisiblePill({ visible }: { visible: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      visible ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', visible ? 'bg-emerald-500' : 'bg-gray-400')} />
      {visible ? 'Visible' : 'Masqué'}
    </span>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function CatalogueServices() {
  const { data: services = [], isLoading, isError } = useCatalogueServices()
  const createMut    = useCreateCatalogueService()
  const updateMut    = useUpdateCatalogueService()
  const deleteMut    = useDeleteCatalogueService()
  const toggleMut    = useToggleCatalogueVisible()
  const dupMut       = useDuplicateCatalogueService()

  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState<CatalogueCategorie | 'all'>('all')
  const [sortKey, setSortKey]     = useState<'ordre' | 'nom' | 'prix'>('ordre')
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc')

  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState<CatalogueService | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CatalogueService | null>(null)
  const [openMenu, setOpenMenu]         = useState<string | null>(null)
  const [form, setForm]                 = useState(FORM_INIT)

  // ── Filtres + tri ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...services]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => s.nom.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
    }
    if (catFilter !== 'all') list = list.filter(s => s.categorie === catFilter)
    list.sort((a, b) => {
      let diff = 0
      if (sortKey === 'ordre') diff = a.ordre - b.ordre
      else if (sortKey === 'nom')  diff = a.nom.localeCompare(b.nom)
      else if (sortKey === 'prix') diff = a.prix - b.prix
      return sortDir === 'asc' ? diff : -diff
    })
    return list
  }, [services, search, catFilter, sortKey, sortDir])

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 text-gray-300 inline ml-0.5" />
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-brand-500 inline ml-0.5" />
      : <ChevronDown className="h-3 w-3 text-brand-500 inline ml-0.5" />
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function openCreate() {
    const maxOrdre = services.length ? Math.max(...services.map(s => s.ordre)) : 0
    setEditing(null)
    setForm({ ...FORM_INIT, ordre: String(maxOrdre + 1) })
    setModalOpen(true)
  }

  function openEdit(s: CatalogueService) {
    setEditing(s)
    setForm({ nom: s.nom, description: s.description, categorie: s.categorie, prix: String(s.prix), ordre: String(s.ordre) })
    setModalOpen(true)
    setOpenMenu(null)
  }

  async function handleSave() {
    if (!form.nom.trim() || !form.prix) return
    const payload = {
      nom:         form.nom.trim(),
      description: form.description,
      categorie:   form.categorie,
      prix:        Number(form.prix),
      ordre:       Number(form.ordre) || 0,
    }
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, ...payload })
    } else {
      await createMut.mutateAsync(payload)
    }
    setModalOpen(false)
  }

  async function handleDelete(s: CatalogueService) {
    await deleteMut.mutateAsync(s.id)
    setDeleteTarget(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const stats = { total: services.length, visible: services.filter(s => s.visible).length }
  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Catalogue</span><span>/</span>
              <span className="text-gray-600">Services</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Services</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {stats.total} service{stats.total !== 1 ? 's' : ''} · {stats.visible} visible{stats.visible !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value as CatalogueCategorie | 'all')}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Toutes catégories</option>
            {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement…
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-sm text-red-500">
              Erreur lors du chargement des services.
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr className="hover:bg-transparent">
                  <Th>
                    <button onClick={() => toggleSort('nom')} className="flex items-center gap-0.5 hover:text-gray-700">
                      Nom <SortIcon col="nom" />
                    </button>
                  </Th>
                  <Th>Catégorie</Th>
                  <Th>
                    <button onClick={() => toggleSort('prix')} className="flex items-center gap-0.5 hover:text-gray-700">
                      Prix <SortIcon col="prix" />
                    </button>
                  </Th>
                  <Th>Visible</Th>
                  <Th>
                    <button onClick={() => toggleSort('ordre')} className="flex items-center gap-0.5 hover:text-gray-700">
                      Ordre <SortIcon col="ordre" />
                    </button>
                  </Th>
                  <Th>Création</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 ? (
                  <EmptyRow cols={7} message={search || catFilter !== 'all' ? 'Aucun service trouvé' : 'Aucun service — cliquez sur Ajouter'} />
                ) : filtered.map(s => (
                  <Tr key={s.id}>
                    <Td>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{s.nom}</p>
                        {s.description && (
                          <p className="text-xs text-gray-400 mt-0.5 max-w-[260px] truncate">{s.description}</p>
                        )}
                      </div>
                    </Td>
                    <Td><CatBadge cat={s.categorie} /></Td>
                    <Td>
                      <span className="font-semibold text-gray-900">{formatCurrency(s.prix)}</span>
                    </Td>
                    <Td>
                      <button
                        onClick={() => toggleMut.mutate({ id: s.id, visible: !s.visible })}
                        title={s.visible ? 'Masquer' : 'Rendre visible'}
                        disabled={toggleMut.isPending}
                      >
                        <VisiblePill visible={s.visible} />
                      </button>
                    </Td>
                    <Td>
                      <span className="text-xs text-gray-500 font-mono tabular-nums">{s.ordre}</span>
                    </Td>
                    <Td>
                      <span className="text-xs text-gray-400">{formatDate(s.created_at)}</span>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          title="Modifier"
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                            title="Plus d'actions"
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          {openMenu === s.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                              <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-gray-100 rounded-xl shadow-elevated py-1">
                                <button
                                  onClick={() => { toggleMut.mutate({ id: s.id, visible: !s.visible }); setOpenMenu(null) }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  {s.visible
                                    ? <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                                    : <Eye className="h-3.5 w-3.5 text-gray-400" />}
                                  {s.visible ? 'Masquer' : 'Rendre visible'}
                                </button>
                                <button
                                  onClick={() => { dupMut.mutate(s); setOpenMenu(null) }}
                                  disabled={dupMut.isPending}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                                  Dupliquer
                                </button>
                                <div className="h-px bg-gray-100 my-1" />
                                <button
                                  onClick={() => { setDeleteTarget(s); setOpenMenu(null) }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Supprimer
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Modal Créer / Modifier ───────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le service' : 'Nouveau service'}
        description={editing ? editing.nom : 'Remplissez les informations du service.'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={isSaving} disabled={!form.nom.trim() || !form.prix}>
              {editing ? 'Enregistrer' : 'Créer'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nom *"
            placeholder="Ex : Site Vitrine"
            value={form.nom}
            onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
          />
          <Textarea
            label="Description"
            placeholder="Décrivez brièvement ce service…"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Catégorie"
              value={form.categorie}
              options={CAT_OPTIONS}
              onChange={e => setForm(f => ({ ...f, categorie: e.target.value as CatalogueCategorie }))}
            />
            <Input
              label="Prix (€) *"
              type="number"
              min="0"
              placeholder="0"
              value={form.prix}
              onChange={e => setForm(f => ({ ...f, prix: e.target.value }))}
            />
          </div>
          <Input
            label="Ordre d'affichage"
            type="number"
            min="1"
            placeholder="1"
            value={form.ordre}
            onChange={e => setForm(f => ({ ...f, ordre: e.target.value }))}
            hint="Détermine la position dans la liste (1 = premier)"
          />
        </div>
      </Modal>

      {/* ── Modal Suppression ───────────────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le service"
        description={deleteTarget?.nom}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button
              variant="danger"
              loading={deleteMut.isPending}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Cette action est irréversible. Le service sera définitivement supprimé du catalogue.
        </p>
      </Modal>
    </Layout>
  )
}
