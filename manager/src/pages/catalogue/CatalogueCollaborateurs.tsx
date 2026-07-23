import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Edit, Trash2, Copy, Eye, EyeOff,
  ChevronUp, ChevronDown, MoreHorizontal,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from '@/components/ui/Table'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { CatalogueCollaborateur, CollaborateurCategorie } from '@/hooks/useCatalogueCollaborateurs'

// ─── Constants ─────────────────────────────────────────────────────────────────

const CAT_STYLES: Record<CollaborateurCategorie, { bg: string; text: string; label: string }> = {
  assistant:    { bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'Assistant IA' },
  agent:        { bg: 'bg-violet-50', text: 'text-violet-600', label: 'Agent autonome' },
  analyste:     { bg: 'bg-amber-50',  text: 'text-amber-600',  label: 'Analyste IA' },
  createur:     { bg: 'bg-teal-50',   text: 'text-teal-600',   label: 'Créateur IA' },
  automatiseur: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Automatiseur' },
  autre:        { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'Autre' },
}

const CAT_OPTIONS = Object.entries(CAT_STYLES).map(([value, { label }]) => ({ value, label }))

// ─── Helpers ───────────────────────────────────────────────────────────────────

function CatBadge({ cat }: { cat: CollaborateurCategorie }) {
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

export function CatalogueCollaborateurs() {
  const navigate = useNavigate()

  // Données locales — à brancher sur Supabase ultérieurement
  const [collaborateurs, setCollaborateurs] = useState<CatalogueCollaborateur[]>([])

  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState<CollaborateurCategorie | 'all'>('all')
  const [sortKey, setSortKey]     = useState<'ordre' | 'nom' | 'prix'>('ordre')
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc')

  const [deleteTarget, setDeleteTarget] = useState<CatalogueCollaborateur | null>(null)
  const [openMenu, setOpenMenu]         = useState<string | null>(null)

  // ── Filtres + tri ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...collaborateurs]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c => c.nom.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    }
    if (catFilter !== 'all') list = list.filter(c => c.categorie === catFilter)
    list.sort((a, b) => {
      let diff = 0
      if (sortKey === 'ordre') diff = a.ordre - b.ordre
      else if (sortKey === 'nom')  diff = a.nom.localeCompare(b.nom)
      else if (sortKey === 'prix') diff = a.prix - b.prix
      return sortDir === 'asc' ? diff : -diff
    })
    return list
  }, [collaborateurs, search, catFilter, sortKey, sortDir])

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

  // ── Actions (local) ─────────────────────────────────────────────────────────

  function handleDelete(c: CatalogueCollaborateur) {
    setCollaborateurs(prev => prev.filter(x => x.id !== c.id))
    setDeleteTarget(null)
  }

  function handleToggle(c: CatalogueCollaborateur) {
    setCollaborateurs(prev => prev.map(x => x.id === c.id ? { ...x, visible: !x.visible } : x))
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const stats = { total: collaborateurs.length, visible: collaborateurs.filter(c => c.visible).length }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Catalogue</span><span>/</span>
              <span className="text-gray-600">Collaborateurs IA</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Collaborateurs IA</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {stats.total} collaborateur{stats.total !== 1 ? 's' : ''} · {stats.visible} visible{stats.visible !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => navigate('/catalogue/collaborateurs/new')} className="gap-2">
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
            onChange={e => setCatFilter(e.target.value as CollaborateurCategorie | 'all')}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Toutes catégories</option>
            {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
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
                <EmptyRow cols={7} message={search || catFilter !== 'all' ? 'Aucun collaborateur trouvé' : 'Aucun collaborateur — cliquez sur Ajouter'} />
              ) : filtered.map(c => (
                <Tr key={c.id}>
                  <Td>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{c.nom}</p>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-0.5 max-w-[260px] truncate">{c.description}</p>
                      )}
                    </div>
                  </Td>
                  <Td><CatBadge cat={c.categorie} /></Td>
                  <Td>
                    <span className="font-semibold text-gray-900">{formatCurrency(c.prix)}</span>
                  </Td>
                  <Td>
                    <button onClick={() => handleToggle(c)} title={c.visible ? 'Masquer' : 'Rendre visible'}>
                      <VisiblePill visible={c.visible} />
                    </button>
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-500 font-mono tabular-nums">{c.ordre}</span>
                  </Td>
                  <Td>
                    <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/catalogue/collaborateurs/${c.id}/edit`)}
                        title="Modifier"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                          title="Plus d'actions"
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        {openMenu === c.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-gray-100 rounded-xl shadow-elevated py-1">
                              <button
                                onClick={() => { handleToggle(c); setOpenMenu(null) }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                {c.visible
                                  ? <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                                  : <Eye className="h-3.5 w-3.5 text-gray-400" />}
                                {c.visible ? 'Masquer' : 'Rendre visible'}
                              </button>
                              <button
                                onClick={() => setOpenMenu(null)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Copy className="h-3.5 w-3.5 text-gray-400" />
                                Dupliquer
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button
                                onClick={() => { setDeleteTarget(c); setOpenMenu(null) }}
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
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 text-right">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Modal Suppression ───────────────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le collaborateur"
        description={deleteTarget?.nom}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Cette action est irréversible. Le collaborateur sera définitivement supprimé du catalogue.
        </p>
      </Modal>
    </Layout>
  )
}
