import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  Search, Send, FileText, Plus, Trash2, X, ArrowLeft,
  Edit, Copy, Check, Receipt, ChevronRight, Printer,
  PenLine, Type, RotateCcw, Download, Paperclip,
} from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table, Thead, Tbody, Tr, Th, Td, EmptyRow } from '@/components/ui/Table'
import { FileUpload, type FileEntry } from '@/components/ui/FileUpload'
import {
  useDocuments, useUploadDocuments, useDeleteDocument,
  getSignedUrl, type DocumentRecord,
} from '@/hooks/useDocuments'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  useDevis, useCreateDevis, useUpdateDevis, useUpdateDevisStatus,
  useDeleteDevis, useDuplicateDevis, useConvertDevisToFacture,
} from '@/hooks/useDevis'
import { useClients } from '@/hooks/useClients'
import { useServices } from '@/hooks/useServices'
import type { Client, Devis as DevisType, DevisStatus, Service } from '@/types'

/* ─── Types & constantes ────────────────────────────────────── */

type LigneForm = { description: string; quantite: string; prix_unitaire: string }

const LIGNE_INIT: LigneForm = { description: '', quantite: '1', prix_unitaire: '' }

const FORM_INIT = {
  client_id: '', notes: '', valid_until: '',
  status: 'brouillon' as DevisStatus,
  lignes: [{ ...LIGNE_INIT }],
  tva_rate: 20,
}

const STATUS_OPTIONS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye',    label: 'Envoyé' },
  { value: 'accepte',   label: 'Accepté' },
  { value: 'refuse',    label: 'Refusé' },
  { value: 'expire',    label: 'Expiré' },
]

const FILTER_OPTS: Array<{ value: DevisStatus | 'all'; label: string }> = [
  { value: 'all',       label: 'Tous' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye',    label: 'Envoyé' },
  { value: 'accepte',   label: 'Accepté' },
  { value: 'refuse',    label: 'Refusé' },
  { value: 'expire',    label: 'Expiré' },
]

const TVA_PRESETS = [
  { value: 0,    label: '0%' },
  { value: 5.5,  label: '5.5%' },
  { value: 10,   label: '10%' },
  { value: 20,   label: '20%' },
]

function computeTotals(lignes: LigneForm[], tvaRate: number) {
  const ht = lignes.reduce((s, l) => s + (parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0), 0)
  const tva = ht * (tvaRate / 100)
  return { ht, tva, ttc: ht + tva }
}

/* ─── Helpers ────────────────────────────────────────────────── */

function fmtFileSize(b: number) {
  if (b < 1024) return `${b} o`
  if (b < 1_048_576) return `${Math.round(b / 1024)} Ko`
  return `${(b / 1_048_576).toFixed(1)} Mo`
}

/* ─── DevisDocuments ─────────────────────────────────────────── */

function DevisDocuments({ devisId }: { devisId: string }) {
  const { data: docs = [], isLoading } = useDocuments('quote', devisId)
  const deleteMutation = useDeleteDocument()
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (doc: DocumentRecord) => {
    if (!doc.storage_path) return
    setDownloading(doc.id)
    try {
      const url = await getSignedUrl(doc.storage_path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = (doc: DocumentRecord) => {
    if (!doc.storage_path) return
    deleteMutation.mutate({
      id: doc.id,
      storagePath: doc.storage_path,
      entityType: 'quote',
      entityId: devisId,
    })
  }

  if (isLoading) return null
  if (docs.length === 0) return null

  return (
    <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/60">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="h-3.5 w-3.5 text-gray-400" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Pièces jointes ({docs.length})
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {docs.map(doc => (
          <div
            key={doc.id}
            className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-gray-100"
          >
            <div className="shrink-0 h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <span className="text-[9px] font-bold text-brand-600 uppercase leading-none">
                {doc.extension ?? '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {doc.original_filename ?? doc.extension}
              </p>
              {doc.size != null && (
                <p className="text-[11px] text-gray-400 leading-none mt-0.5">
                  {fmtFileSize(doc.size)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.id}
                className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium px-2 py-1 rounded-lg hover:bg-brand-50 transition disabled:opacity-50"
              >
                {downloading === doc.id
                  ? <span className="block h-3 w-3 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
                  : <Download className="h-3 w-3" />
                }
                Télécharger
              </button>
              <button
                type="button"
                onClick={() => handleDelete(doc)}
                disabled={deleteMutation.isPending}
                className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Supprimer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SignatureModal ─────────────────────────────────────────── */

function SignatureModal({ onSave, onClose }: { onSave: (sig: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'draw' | 'type'>('draw')
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const isDrawing    = useRef(false)
  const [typedSig, setTypedSig] = useState('')
  const [isEmpty, setIsEmpty]   = useState(true)

  const getXY = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getXY(e, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
    isDrawing.current = true
    setIsEmpty(false)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y } = getXY(e, canvas)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0A2540'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDraw = () => { isDrawing.current = false }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  const handleSave = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current
      if (!canvas || isEmpty) return
      onSave(canvas.toDataURL('image/png'))
    } else {
      if (!typedSig.trim()) return
      const canvas = document.createElement('canvas')
      canvas.width = 480; canvas.height = 120
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, 480, 120)
      ctx.fillStyle = '#0A2540'
      ctx.font = 'italic 52px Georgia, serif'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText(typedSig, 240, 60)
      onSave(canvas.toDataURL('image/png'))
    }
  }

  const canSave = tab === 'draw' ? !isEmpty : typedSig.trim().length > 0

  return (
    <Modal
      open
      onClose={onClose}
      title="Signature électronique"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={!canSave}>
            <Check className="h-3.5 w-3.5" />Appliquer la signature
          </Button>
        </>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
        <button
          onClick={() => setTab('draw')}
          className={cn('flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition', tab === 'draw' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}
        >
          <PenLine className="h-4 w-4" />Dessiner
        </button>
        <button
          onClick={() => setTab('type')}
          className={cn('flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium transition', tab === 'type' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}
        >
          <Type className="h-4 w-4" />Taper
        </button>
      </div>

      {tab === 'draw' ? (
        <div>
          <div className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={480}
              height={160}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {isEmpty && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 pointer-events-none">
                Dessinez votre signature ici…
              </p>
            )}
          </div>
          <button onClick={clearCanvas} className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition">
            <RotateCcw className="h-3 w-3" />Effacer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            label="Votre nom ou prénom"
            value={typedSig}
            onChange={e => setTypedSig(e.target.value)}
            placeholder="Jean Dupont"
            autoFocus
          />
          {typedSig.trim() && (
            <div className="border border-gray-200 rounded-xl bg-gray-50 p-6 flex items-center justify-center min-h-[100px]">
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 42, color: '#0A2540', lineHeight: 1 }}>
                {typedSig}
              </span>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-400">
        En apposant votre signature, vous attestez avoir lu et accepté les conditions du devis.
      </p>
    </Modal>
  )
}

/* ─── LignesEditor ───────────────────────────────────────────── */

function LignesEditor({
  lignes,
  tvaRate,
  services,
  onChange,
  onTvaChange,
}: {
  lignes: LigneForm[]
  tvaRate: number
  services: Service[]
  onChange: (lignes: LigneForm[]) => void
  onTvaChange: (rate: number) => void
}) {
  const [customTva, setCustomTva] = useState('')
  const isCustom = !TVA_PRESETS.some(p => p.value === tvaRate)
  const totals = computeTotals(lignes, tvaRate)

  const setLigne = (idx: number, key: keyof LigneForm, val: string) => {
    const next = [...lignes]
    next[idx] = { ...next[idx], [key]: val }
    onChange(next)
  }
  const addLigne = () => onChange([...lignes, { ...LIGNE_INIT }])
  const removeLigne = (idx: number) => onChange(lignes.filter((_, i) => i !== idx))
  const addFromService = (s: Service) => {
    onChange([...lignes.filter(l => l.description || l.prix_unitaire), {
      description: s.nom,
      quantite: '1',
      prix_unitaire: String(s.prix_base),
    }])
  }

  const activeServices = services.filter(s => s.actif)

  return (
    <div>
      {/* Service catalogue */}
      {activeServices.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Catalogue de services</p>
          <div className="flex flex-wrap gap-1.5">
            {activeServices.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => addFromService(s)}
                className="text-xs px-2.5 py-1 bg-brand-50 text-brand-600 rounded-lg border border-brand-100 hover:bg-brand-100 transition font-medium"
              >
                + {s.nom} — {formatCurrency(s.prix_base)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-700">Prestations</label>
        <button type="button" onClick={addLigne} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors">
          <Plus className="h-3 w-3" />Ajouter une ligne
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Description</th>
              <th className="text-right px-3 py-2 font-medium text-gray-500 w-16">Qté</th>
              <th className="text-right px-3 py-2 font-medium text-gray-500 w-28">Prix HT (€)</th>
              <th className="text-right px-3 py-2 font-medium text-gray-500 w-28">Total HT</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lignes.map((l, idx) => {
              const lineTotal = (parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0)
              return (
                <tr key={idx}>
                  <td className="px-2 py-1.5">
                    <input
                      value={l.description}
                      onChange={e => setLigne(idx, 'description', e.target.value)}
                      placeholder="Description de la prestation…"
                      className="w-full text-sm px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number" min="0.5" step="0.5"
                      value={l.quantite}
                      onChange={e => setLigne(idx, 'quantite', e.target.value)}
                      className="w-16 text-sm text-right px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number" min="0"
                      value={l.prix_unitaire}
                      onChange={e => setLigne(idx, 'prix_unitaire', e.target.value)}
                      placeholder="0"
                      className="w-28 text-sm text-right px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold text-gray-800 whitespace-nowrap">
                    {formatCurrency(lineTotal)}
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    {lignes.length > 1 && (
                      <button type="button" onClick={() => removeLigne(idx)} className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row justify-between gap-4">
        {/* TVA selector */}
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Taux de TVA</p>
          <div className="flex items-center gap-1.5">
            {TVA_PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => { onTvaChange(p.value); setCustomTva('') }}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition',
                  tvaRate === p.value && !isCustom
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300',
                )}
              >
                {p.label}
              </button>
            ))}
            <input
              type="number" min="0" max="100" step="0.1"
              placeholder="Autre %"
              value={isCustom ? tvaRate : customTva}
              onChange={e => {
                setCustomTva(e.target.value)
                const v = parseFloat(e.target.value)
                if (!isNaN(v) && v >= 0 && v <= 100) onTvaChange(v)
              }}
              className={cn(
                'w-20 text-xs text-center px-2 py-1 rounded-lg border transition focus:outline-none focus:ring-1 focus:ring-brand-400',
                isCustom ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500',
              )}
            />
          </div>
        </div>

        {/* Totals */}
        <div className="w-56 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Sous-total HT</span><span>{formatCurrency(totals.ht)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>TVA {tvaRate}%</span><span>{formatCurrency(totals.tva)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
            <span>Total TTC</span>
            <span className="text-brand-600">{formatCurrency(totals.ttc)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── DevisFiche ─────────────────────────────────────────────── */

function DevisFiche({
  devis, clients, services, onBack, onUpdate, onUpdateStatus,
  onDelete, onDuplicate, onConvert,
  isUpdating, isDeleting, isDuplicating, isConverting,
}: {
  devis: DevisType
  clients: Client[]
  services: Service[]
  onBack: () => void
  onUpdate: (data: Parameters<ReturnType<typeof useUpdateDevis>['mutateAsync']>[0]) => Promise<DevisType>
  onUpdateStatus: (status: DevisStatus) => Promise<DevisType>
  onDelete: () => Promise<void>
  onDuplicate: () => Promise<void>
  onConvert: () => Promise<string>
  isUpdating: boolean
  isDeleting: boolean
  isDuplicating: boolean
  isConverting: boolean
}) {
  const [editMode, setEditMode]         = useState(false)
  const [showDelete, setShowDelete]           = useState(false)
  const [showSignature, setShowSignature]     = useState(false)
  const [convertedTo, setConvertedTo]         = useState<string | null>(null)
  const [editAttachments, setEditAttachments] = useState<FileEntry[]>([])
  const uploadDocsMutation = useUploadDocuments()
  const [form, setForm] = useState({
    client_id:   devis.client_id,
    valid_until: devis.date_expiration ?? '',
    status:      devis.status,
    notes:       devis.notes ?? '',
    tva_rate:    devis.tva_rate,
    lignes:      devis.lignes.length > 0
      ? devis.lignes.map(l => ({ description: l.description, quantite: String(l.quantite), prix_unitaire: String(l.prix_unitaire) }))
      : [{ ...LIGNE_INIT }],
  })

  useEffect(() => {
    setForm({
      client_id:   devis.client_id,
      valid_until: devis.date_expiration ?? '',
      status:      devis.status,
      notes:       devis.notes ?? '',
      tva_rate:    devis.tva_rate,
      lignes:      devis.lignes.length > 0
        ? devis.lignes.map(l => ({ description: l.description, quantite: String(l.quantite), prix_unitaire: String(l.prix_unitaire) }))
        : [{ ...LIGNE_INIT }],
    })
    setEditMode(false)
    setConvertedTo(null)
  }, [devis.id])

  const clientOptions = clients.map(c => ({
    value: c.id,
    label: `${c.prenom} ${c.nom}${c.entreprise ? ` — ${c.entreprise}` : ''}`,
  }))

  const handleSave = async () => {
    await onUpdate({
      id: devis.id,
      client_id:   form.client_id,
      valid_until: form.valid_until,
      status:      form.status,
      notes:       form.notes,
      tva_rate:    form.tva_rate,
      lignes:      form.lignes.map(l => ({
        description:   l.description,
        quantite:      parseFloat(l.quantite) || 1,
        prix_unitaire: parseFloat(l.prix_unitaire) || 0,
      })),
    })
    const readyFiles = editAttachments.filter(e => e.status === 'ready')
    await Promise.allSettled(
      readyFiles.map(e =>
        uploadDocsMutation.mutateAsync({
          file: e.file,
          opts: { entityType: 'quote', entityId: devis.id, quoteId: devis.id },
        })
      )
    )
    setEditAttachments([])
    setEditMode(false)
  }

  const handleConvert = async () => {
    const num = await onConvert()
    setConvertedTo(num)
  }

  const handleSaveSignature = async (sig: string) => {
    await onUpdate({ id: devis.id, signature: sig })
    setShowSignature(false)
  }

  const handleRemoveSignature = async () => {
    await onUpdate({ id: devis.id, signature: '' })
  }

  const handlePrint = useCallback(() => {
    const el = document.getElementById('devis-document')
    if (!el) return
    const style = document.createElement('style')
    style.id = '__devis_print_style__'
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #devis-document, #devis-document * { visibility: visible !important; }
        #devis-document { position: fixed !important; inset: 0 !important; width: 100% !important; box-shadow: none !important; border: none !important; }
        @page { margin: 15mm; }
      }
    `
    document.head.appendChild(style)
    window.print()
    document.head.removeChild(style)
  }, [])

  const canEdit = devis.status === 'brouillon' || devis.status === 'envoye'

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition mb-5 group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Retour à la liste
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 rounded-xl shrink-0">
            <FileText className="h-5 w-5 text-brand-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{devis.numero}</h1>
              <Badge status={devis.status} dot />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Créé le {formatDate(devis.created_at)}
              {devis.date_envoi && ` · Envoyé le ${formatDate(devis.date_envoi)}`}
              {devis.date_expiration && ` · Valide jusqu'au ${formatDate(devis.date_expiration)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
          {devis.status === 'brouillon' && !editMode && (
            <Button size="sm" onClick={() => onUpdateStatus('envoye')} disabled={isUpdating}>
              <Send className="h-3.5 w-3.5" />Envoyer
            </Button>
          )}
          {devis.status === 'envoye' && !editMode && (
            <>
              <Button size="sm" variant="outline" onClick={() => onUpdateStatus('refuse')} disabled={isUpdating}>
                <X className="h-3.5 w-3.5 text-red-400" />Refusé
              </Button>
              <Button size="sm" onClick={() => onUpdateStatus('accepte')} disabled={isUpdating}>
                <Check className="h-3.5 w-3.5" />Accepté
              </Button>
            </>
          )}
          {devis.status === 'accepte' && !convertedTo && (
            <Button size="sm" onClick={handleConvert} disabled={isConverting}>
              <Receipt className="h-3.5 w-3.5" />
              {isConverting ? 'Création…' : 'Créer la facture'}
            </Button>
          )}
          {convertedTo && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
              <Check className="h-3.5 w-3.5" />{convertedTo} créée
            </span>
          )}

          <Button size="sm" variant="outline" onClick={handlePrint} title="Imprimer / PDF">
            <Printer className="h-3.5 w-3.5" />PDF
          </Button>

          {canEdit && !editMode && (
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit className="h-3.5 w-3.5" />Modifier
            </Button>
          )}
          {editMode && (
            <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Annuler</Button>
          )}
          <Button size="sm" variant="outline" onClick={onDuplicate} disabled={isDuplicating} title="Dupliquer">
            <Copy className="h-3.5 w-3.5" />
            {isDuplicating ? '…' : 'Dupliquer'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit mode */}
      {editMode ? (
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Client *"
                value={form.client_id}
                onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
                options={clientOptions}
                placeholder="Sélectionner un client"
                className="col-span-2"
              />
              <Input
                label="Valide jusqu'au"
                type="date"
                value={form.valid_until}
                onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as DevisStatus }))}
                options={STATUS_OPTIONS}
              />
            </div>
            <LignesEditor
              lignes={form.lignes}
              tvaRate={form.tva_rate}
              services={services}
              onChange={lignes => setForm(f => ({ ...f, lignes }))}
              onTvaChange={tva_rate => setForm(f => ({ ...f, tva_rate }))}
            />
            <Textarea
              label="Notes"
              placeholder="Conditions particulières, délais, informations complémentaires…"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
            <FileUpload
              label="Pièces jointes"
              maxSizeMB={10}
              maxFiles={10}
              onFilesChange={setEditAttachments}
            />
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setEditMode(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={isUpdating || !form.client_id}>
              {isUpdating ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </Card>
      ) : (
        /* Document view */
        <div id="devis-document" className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-8 py-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Devis</p>
              <p className="text-3xl font-bold font-mono tracking-tight">{devis.numero}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {STATUS_OPTIONS.find(s => s.value === devis.status)?.label}
              </div>
              <p className="text-xs text-gray-400">Créé le {formatDate(devis.created_at)}</p>
              {devis.date_expiration && (
                <p className="text-xs text-gray-400">Valide jusqu'au {formatDate(devis.date_expiration)}</p>
              )}
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">De</p>
              <p className="font-bold text-gray-900 text-base">CA-TECH</p>
              <p className="text-sm text-gray-500 mt-1">pemoustaskit@gmail.com</p>
              <p className="text-sm text-gray-500">France</p>
            </div>
            <div className="p-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pour</p>
              {devis.client ? (
                <>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar nom={devis.client.nom} prenom={devis.client.prenom} size="md" />
                    <p className="font-bold text-gray-900 text-base">{devis.client.prenom} {devis.client.nom}</p>
                  </div>
                  {devis.client.entreprise && <p className="text-sm text-gray-500">{devis.client.entreprise}</p>}
                  <p className="text-sm text-gray-500">{devis.client.email}</p>
                  {devis.client.telephone && <p className="text-sm text-gray-500">{devis.client.telephone}</p>}
                </>
              ) : (
                <p className="text-sm text-gray-400">Client non renseigné</p>
              )}
            </div>
          </div>

          {/* Line items */}
          <div className="px-8 pb-6 border-t border-gray-100">
            <table className="w-full mt-6">
              <thead>
                <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left pb-3 font-semibold">Description</th>
                  <th className="text-right pb-3 font-semibold w-12">Qté</th>
                  <th className="text-right pb-3 font-semibold w-36">Prix unit. HT</th>
                  <th className="text-right pb-3 font-semibold w-12">TVA</th>
                  <th className="text-right pb-3 font-semibold w-36">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {devis.lignes.map((l, i) => (
                  <tr key={l.id ?? i} className="border-b border-gray-50">
                    <td className="py-3.5 text-sm text-gray-800 pr-4">{l.description}</td>
                    <td className="py-3.5 text-sm text-right text-gray-600">{l.quantite}</td>
                    <td className="py-3.5 text-sm text-right text-gray-600">{formatCurrency(l.prix_unitaire)}</td>
                    <td className="py-3.5 text-sm text-right text-gray-400">{devis.tva_rate}%</td>
                    <td className="py-3.5 text-sm text-right font-semibold text-gray-800">{formatCurrency(l.total_ht)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-72">
                <div className="space-y-2 pb-3">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Sous-total HT</span>
                    <span>{formatCurrency(devis.sous_total_ht)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>TVA {devis.tva_rate}%</span>
                    <span>{formatCurrency(devis.tva_total)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t-2 border-gray-900 pt-3">
                  <span className="font-bold text-gray-900 text-base">Total TTC</span>
                  <span className="text-2xl font-bold text-brand-600">{formatCurrency(devis.total_ttc)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {devis.notes && (
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{devis.notes}</p>
            </div>
          )}

          {/* Pièces jointes */}
          <DevisDocuments devisId={devis.id} />

          {/* Signature */}
          <div className="px-8 py-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Signature CA-TECH</p>
                <div className="h-20 border border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
                  <p className="text-xs text-gray-300">Cachet et signature</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Signature client</p>
                {devis.signature ? (
                  <div className="relative group">
                    <img
                      src={devis.signature}
                      alt="Signature"
                      className="h-20 w-full object-contain border border-gray-100 rounded-xl bg-gray-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition bg-white/80 rounded-xl">
                      <button onClick={() => setShowSignature(true)} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                        <Edit className="h-3 w-3" />Modifier
                      </button>
                      <button onClick={handleRemoveSignature} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                        <X className="h-3 w-3" />Retirer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSignature(true)}
                    className="h-20 w-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-brand-300 hover:bg-brand-50 transition flex flex-col items-center justify-center gap-1 group"
                  >
                    <PenLine className="h-5 w-5 text-gray-300 group-hover:text-brand-400 transition" />
                    <span className="text-xs text-gray-400 group-hover:text-brand-500 transition font-medium">Ajouter une signature</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-gray-300 mt-4 text-center">
              Bon pour accord — Date : _____ / _____ / _______
            </p>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer ce devis ?"
        description={devis.numero}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Annuler</Button>
            <Button variant="danger" onClick={async () => { await onDelete(); onBack() }} disabled={isDeleting}>
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Cette action est irréversible. Le devis {devis.numero} sera définitivement supprimé.
        </p>
      </Modal>

      {showSignature && (
        <SignatureModal
          onSave={handleSaveSignature}
          onClose={() => setShowSignature(false)}
        />
      )}
    </div>
  )
}

/* ─── Page Devis ─────────────────────────────────────────────── */

export function Devis() {
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState<DevisStatus | 'all'>('all')
  const [showAdd, setShowAdd]           = useState(false)
  const [ficheDevis, setFicheDevis]     = useState<DevisType | null>(null)
  const [form, setForm]                 = useState(FORM_INIT)
  const [attachments, setAttachments]   = useState<FileEntry[]>([])
  const uploadDocs = useUploadDocuments()

  const { data: devis = [], isLoading } = useDevis()
  const { data: clients = [] }          = useClients()
  const { data: services = [] }         = useServices()
  const createDevis    = useCreateDevis()
  const updateDevis    = useUpdateDevis()
  const updateStatus   = useUpdateDevisStatus()
  const deleteDevis    = useDeleteDevis()
  const duplicateDevis = useDuplicateDevis()
  const convertDevis   = useConvertDevisToFacture()

  useEffect(() => {
    if (!ficheDevis) return
    const fresh = devis.find(d => d.id === ficheDevis.id)
    if (fresh) setFicheDevis(fresh)
  }, [devis]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => devis.filter(d => {
    const matchSearch = `${d.numero} ${d.client?.prenom} ${d.client?.nom} ${d.client?.entreprise ?? ''}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return matchSearch && matchStatus
  }), [devis, search, filterStatus])

  const stats = useMemo(() => {
    const total     = devis.length
    const brouillon = devis.filter(d => d.status === 'brouillon').length
    const accepte   = devis.filter(d => d.status === 'accepte').length
    const totalAccepte   = devis.filter(d => d.status === 'accepte').reduce((s, d) => s + d.total_ttc, 0)
    const totalEnAttente = devis.filter(d => d.status === 'envoye').reduce((s, d) => s + d.total_ttc, 0)
    const convRate  = (total - brouillon) > 0 ? Math.round(accepte / (total - brouillon) * 100) : 0
    return { total, accepte, totalAccepte, totalEnAttente, convRate }
  }, [devis])

  const clientOptions = clients.map(c => ({
    value: c.id,
    label: `${c.prenom} ${c.nom}${c.entreprise ? ` — ${c.entreprise}` : ''}`,
  }))

  const handleCreate = async () => {
    if (!form.client_id) return
    const created = await createDevis.mutateAsync({
      client_id:   form.client_id,
      notes:       form.notes,
      valid_until: form.valid_until,
      tva_rate:    form.tva_rate,
      lignes:      form.lignes.map(l => ({
        description:   l.description,
        quantite:      parseFloat(l.quantite) || 1,
        prix_unitaire: parseFloat(l.prix_unitaire) || 0,
      })),
    })
    const readyFiles = attachments.filter(e => e.status === 'ready')
    await Promise.allSettled(
      readyFiles.map(e =>
        uploadDocs.mutateAsync({
          file: e.file,
          opts: { entityType: 'quote', entityId: created.id, quoteId: created.id },
        })
      )
    )
    setShowAdd(false)
    setForm(FORM_INIT)
    setAttachments([])
    setFicheDevis(created)
  }

  const handleFicheUpdate = async (data: Parameters<typeof updateDevis.mutateAsync>[0]) => {
    const updated = await updateDevis.mutateAsync(data)
    setFicheDevis(updated)
    return updated
  }

  const handleFicheUpdateStatus = async (status: DevisStatus) => {
    if (!ficheDevis) return {} as DevisType
    const updated = await updateStatus.mutateAsync({ id: ficheDevis.id, status })
    setFicheDevis(updated)
    return updated
  }

  const handleFicheDelete = async () => {
    if (!ficheDevis) return
    await deleteDevis.mutateAsync(ficheDevis.id)
    setFicheDevis(null)
  }

  const handleDuplicate = async () => {
    if (!ficheDevis) return
    const copy = await duplicateDevis.mutateAsync(ficheDevis)
    setFicheDevis(copy)
  }

  const handleConvert = async () => {
    if (!ficheDevis) return ''
    return await convertDevis.mutateAsync(ficheDevis)
  }

  /* ── Fiche mode ── */
  if (ficheDevis) {
    return (
      <Layout title="Devis">
        <DevisFiche
          devis={ficheDevis}
          clients={clients}
          services={services}
          onBack={() => setFicheDevis(null)}
          onUpdate={handleFicheUpdate}
          onUpdateStatus={handleFicheUpdateStatus}
          onDelete={handleFicheDelete}
          onDuplicate={handleDuplicate}
          onConvert={handleConvert}
          isUpdating={updateDevis.isPending || updateStatus.isPending}
          isDeleting={deleteDevis.isPending}
          isDuplicating={duplicateDevis.isPending}
          isConverting={convertDevis.isPending}
        />
      </Layout>
    )
  }

  /* ── List mode ── */
  return (
    <Layout
      title="Devis"
      actions={
        <Button size="sm" onClick={() => { setForm(FORM_INIT); setShowAdd(true) }}>
          <Plus className="h-3.5 w-3.5" />Nouveau devis
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card>
          <p className="text-xs text-gray-500 mb-1">Total devis</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">En attente</p>
          <p className="text-2xl font-bold text-blue-600">{devis.filter(d => d.status === 'envoye').length}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(stats.totalEnAttente)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">Acceptés</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.accepte}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(stats.totalAccepte)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">Taux conversion</p>
          <p className="text-2xl font-bold text-gray-900">{stats.convRate}%</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-card">
          {FILTER_OPTS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap',
                filterStatus === f.value ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {f.label}
              <span className={cn('ml-1.5 text-[10px]', filterStatus === f.value ? 'text-white/70' : 'text-gray-400')}>
                {f.value === 'all' ? devis.length : devis.filter(d => d.status === f.value).length}
              </span>
            </button>
          ))}
        </div>
        <Input
          placeholder="Rechercher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          leading={<Search className="h-3.5 w-3.5" />}
          className="max-w-xs"
        />
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} devis</span>
      </div>

      {/* Table */}
      <Card padding={false}>
        <Table>
          <Thead>
            <Tr>
              <Th>Numéro</Th><Th>Client</Th><Th>Montant HT</Th>
              <Th>TVA</Th><Th>Total TTC</Th><Th>Status</Th>
              <Th>Envoyé</Th><Th>Expiration</Th><Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <EmptyRow cols={9} message="Chargement…" />
            ) : filtered.length === 0 ? (
              <EmptyRow cols={9} />
            ) : filtered.map(d => (
              <Tr key={d.id} onClick={() => setFicheDevis(d)} className="cursor-pointer">
                <Td>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    <span className="font-mono text-sm font-semibold text-gray-800">{d.numero}</span>
                  </div>
                </Td>
                <Td>
                  {d.client ? (
                    <div className="flex items-center gap-2">
                      <Avatar nom={d.client.nom} prenom={d.client.prenom} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.client.prenom} {d.client.nom}</p>
                        {d.client.entreprise && <p className="text-xs text-gray-400">{d.client.entreprise}</p>}
                      </div>
                    </div>
                  ) : <span className="text-gray-300">—</span>}
                </Td>
                <Td className="text-gray-700">{formatCurrency(d.sous_total_ht)}</Td>
                <Td className="text-gray-400">{formatCurrency(d.tva_total)}</Td>
                <Td className="font-bold text-gray-900">{formatCurrency(d.total_ttc)}</Td>
                <Td><Badge status={d.status} dot /></Td>
                <Td className="text-xs text-gray-400">{formatDate(d.date_envoi)}</Td>
                <Td className="text-xs text-gray-400">{formatDate(d.date_expiration)}</Td>
                <Td onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    {d.status === 'brouillon' && (
                      <Button variant="ghost" size="icon" title="Envoyer" onClick={() => updateStatus.mutate({ id: d.id, status: 'envoye' })}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" title="Ouvrir" onClick={() => setFicheDevis(d)}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      {/* Create modal */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setAttachments([]) }}
        title="Nouveau devis"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowAdd(false); setAttachments([]) }}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createDevis.isPending || !form.client_id}>
              {createDevis.isPending ? 'Création…' : 'Créer le devis'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Client *"
              value={form.client_id}
              onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              options={clientOptions}
              placeholder="Sélectionner un client"
              className="col-span-2"
            />
            <Input
              label="Valide jusqu'au"
              type="date"
              value={form.valid_until}
              onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
            />
          </div>
          <LignesEditor
            lignes={form.lignes}
            tvaRate={form.tva_rate}
            services={services}
            onChange={lignes => setForm(f => ({ ...f, lignes }))}
            onTvaChange={tva_rate => setForm(f => ({ ...f, tva_rate }))}
          />
          <Textarea
            label="Notes"
            placeholder="Conditions particulières, délais, informations complémentaires…"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
          />
          <FileUpload
            label="Pièces jointes"
            maxSizeMB={10}
            maxFiles={10}
            onFilesChange={setAttachments}
          />
        </div>
      </Modal>
    </Layout>
  )
}
