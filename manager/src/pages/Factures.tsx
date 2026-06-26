import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search, Send, Receipt, Plus, Trash2, X, ArrowLeft,
  Edit, Copy, Check, AlertCircle, ChevronRight,
  CreditCard, Calendar, Printer, Mail, Link,
  ClipboardCopy, ExternalLink, Clock, Banknote,
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
  useFactures, useCreateFacture, useUpdateFacture, useUpdateFactureStatus,
  useDeleteFacture, useDuplicateFacture, useEnregistrerPaiement,
  useEnvoyerFacture, useFacturePayments,
} from '@/hooks/useFactures'
import { useClients } from '@/hooks/useClients'
import { useServices } from '@/hooks/useServices'
import type { Client, Facture, FactureStatus, Service } from '@/types'

/* ─── Constantes ─────────────────────────────────────────────── */

type LigneForm = { description: string; quantite: string; prix_unitaire: string }
const LIGNE_INIT: LigneForm = { description: '', quantite: '1', prix_unitaire: '' }
const FORM_INIT = {
  client_id: '', due_date: '', notes: '',
  status: 'brouillon' as FactureStatus,
  lignes: [{ ...LIGNE_INIT }],
  tva_rate: 20,
}

const STATUS_OPTIONS = [
  { value: 'brouillon',         label: 'Brouillon' },
  { value: 'envoyee',           label: 'Envoyée' },
  { value: 'partiellement_payee', label: 'Part. payée' },
  { value: 'payee',             label: 'Payée' },
  { value: 'en_retard',         label: 'En retard' },
  { value: 'annulee',           label: 'Annulée' },
]

const FILTER_OPTS: Array<{ value: FactureStatus | 'all'; label: string }> = [
  { value: 'all',               label: 'Toutes' },
  { value: 'brouillon',         label: 'Brouillon' },
  { value: 'envoyee',           label: 'Envoyée' },
  { value: 'partiellement_payee', label: 'Part. payée' },
  { value: 'en_retard',         label: 'En retard' },
  { value: 'payee',             label: 'Payée' },
  { value: 'annulee',           label: 'Annulée' },
]

const METHODE_OPTIONS = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'carte',    label: 'Carte bancaire' },
  { value: 'stripe',   label: 'Stripe' },
  { value: 'cheque',   label: 'Chèque' },
  { value: 'especes',  label: 'Espèces' },
]

const TVA_PRESETS = [
  { value: 0,   label: '0%' },
  { value: 5.5, label: '5.5%' },
  { value: 10,  label: '10%' },
  { value: 20,  label: '20%' },
]

const METHODE_ICONS: Record<string, typeof CreditCard> = {
  virement: Banknote,
  carte: CreditCard,
  stripe: CreditCard,
  cheque: Receipt,
  especes: Banknote,
}

function computeTotals(lignes: LigneForm[], tvaRate: number) {
  const ht = lignes.reduce((s, l) => s + (parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0), 0)
  const tva = ht * (tvaRate / 100)
  return { ht, tva, ttc: ht + tva }
}

function daysOverdue(dateEcheance?: string) {
  if (!dateEcheance) return 0
  const diff = new Date().getTime() - new Date(dateEcheance).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function generateEmailBody(f: Facture): string {
  return `Bonjour ${f.client?.prenom ?? 'Madame/Monsieur'},

Nous vous adressons votre facture ${f.numero} pour un montant de ${formatCurrency(f.total_ttc)} TTC.

Date d'émission : ${formatDate(f.date_emission)}
Date d'échéance : ${formatDate(f.date_echeance)}
Montant TTC     : ${formatCurrency(f.total_ttc)}${f.amount_paid > 0 && f.amount_paid < f.total_ttc ? `\nMontant réglé   : ${formatCurrency(f.amount_paid)}\nRestant dû      : ${formatCurrency(f.total_ttc - f.amount_paid)}` : ''}${f.stripe_payment_link ? `\n\nPaiement en ligne : ${f.stripe_payment_link}` : ''}${f.notes ? `\n\n${f.notes}` : ''}

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
L'équipe CA-TECH
pemoustaskit@gmail.com`
}

/* ─── LignesEditor ───────────────────────────────────────────── */

function LignesEditor({
  lignes, tvaRate, services, onChange, onTvaChange,
}: {
  lignes: LigneForm[]; tvaRate: number; services: Service[]
  onChange: (l: LigneForm[]) => void; onTvaChange: (r: number) => void
}) {
  const [customTva, setCustomTva] = useState('')
  const isCustom = !TVA_PRESETS.some(p => p.value === tvaRate)
  const totals = computeTotals(lignes, tvaRate)
  const activeServices = services.filter(s => s.actif)

  const setLigne = (idx: number, key: keyof LigneForm, val: string) => {
    const next = [...lignes]; next[idx] = { ...next[idx], [key]: val }; onChange(next)
  }
  const addFromService = (s: Service) => {
    onChange([...lignes.filter(l => l.description || l.prix_unitaire), {
      description: s.nom, quantite: '1', prix_unitaire: String(s.prix_base),
    }])
  }

  return (
    <div>
      {activeServices.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Catalogue</p>
          <div className="flex flex-wrap gap-1.5">
            {activeServices.map(s => (
              <button key={s.id} type="button" onClick={() => addFromService(s)}
                className="text-xs px-2.5 py-1 bg-brand-50 text-brand-600 rounded-lg border border-brand-100 hover:bg-brand-100 transition font-medium">
                + {s.nom} — {formatCurrency(s.prix_base)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-700">Prestations</label>
        <button type="button" onClick={() => onChange([...lignes, { ...LIGNE_INIT }])}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
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
                    <input value={l.description} onChange={e => setLigne(idx, 'description', e.target.value)}
                      placeholder="Description de la prestation…"
                      className="w-full text-sm px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 focus:outline-none" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min="0.5" step="0.5" value={l.quantite}
                      onChange={e => setLigne(idx, 'quantite', e.target.value)}
                      className="w-16 text-sm text-right px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 focus:outline-none" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min="0" value={l.prix_unitaire}
                      onChange={e => setLigne(idx, 'prix_unitaire', e.target.value)}
                      placeholder="0"
                      className="w-28 text-sm text-right px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 focus:outline-none" />
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold text-gray-800 whitespace-nowrap">
                    {formatCurrency(lineTotal)}
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    {lignes.length > 1 && (
                      <button type="button" onClick={() => onChange(lignes.filter((_, i) => i !== idx))}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded">
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
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Taux de TVA</p>
          <div className="flex items-center gap-1.5">
            {TVA_PRESETS.map(p => (
              <button key={p.value} type="button"
                onClick={() => { onTvaChange(p.value); setCustomTva('') }}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition',
                  tvaRate === p.value && !isCustom
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300',
                )}>
                {p.label}
              </button>
            ))}
            <input type="number" min="0" max="100" step="0.1"
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
              )} />
          </div>
        </div>

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

/* ─── EmailModal ─────────────────────────────────────────────── */

function EmailModal({ facture, onSent, onClose }: {
  facture: Facture; onSent: () => Promise<void>; onClose: () => void
}) {
  const [body, setBody] = useState(() => generateEmailBody(facture))
  const [sending, setSending] = useState(false)
  const email = facture.client?.email ?? ''

  const handleSend = async () => {
    setSending(true)
    const subject = encodeURIComponent(`Facture ${facture.numero} — CA-TECH`)
    const encodedBody = encodeURIComponent(body)
    window.open(`mailto:${email}?subject=${subject}&body=${encodedBody}`, '_blank')
    await onSent()
    setSending(false)
    onClose()
  }

  return (
    <Modal
      open onClose={onClose}
      title="Envoyer la facture par email"
      description={`${facture.numero} · ${facture.client?.prenom} ${facture.client?.nom}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSend} disabled={sending || !email}>
            <Mail className="h-3.5 w-3.5" />
            {sending ? 'Ouverture…' : 'Ouvrir le client mail'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Mail className="h-4 w-4 text-blue-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800">Destinataire</p>
            <p className="text-xs text-blue-600">{email || 'Email client non renseigné'}</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Corps du message</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={12}
            className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent font-mono"
          />
        </div>
        <p className="text-[11px] text-gray-400">
          Ouvre votre client mail avec le message pré-rempli. La facture sera marquée comme envoyée.
        </p>
      </div>
    </Modal>
  )
}

/* ─── StripeModal ────────────────────────────────────────────── */

function StripeModal({ facture, onSave, onClose }: {
  facture: Facture; onSave: (link: string) => Promise<void>; onClose: () => void
}) {
  const [link, setLink] = useState(facture.stripe_payment_link ?? '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(link)
    setSaving(false)
    onClose()
  }

  const handleCopy = () => {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      open onClose={onClose}
      title="Lien de paiement Stripe"
      description={`${facture.numero} · ${formatCurrency(facture.total_ttc)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Check className="h-3.5 w-3.5" />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
          <p className="text-xs font-semibold text-violet-800 mb-1">Comment obtenir un lien Stripe ?</p>
          <ol className="text-xs text-violet-700 space-y-0.5 list-decimal list-inside">
            <li>Connectez-vous à votre tableau de bord Stripe</li>
            <li>Allez dans <strong>Produits → Payment Links</strong></li>
            <li>Créez un lien pour {formatCurrency(facture.total_ttc)}</li>
            <li>Copiez le lien et collez-le ci-dessous</li>
          </ol>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Lien de paiement</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://buy.stripe.com/…"
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {link && (
              <button onClick={handleCopy}
                className={cn('px-3 py-2 rounded-xl border text-xs font-medium transition',
                  copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
              </button>
            )}
            {link && (
              <a href={link} target="_blank" rel="noreferrer"
                className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300 transition">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

/* ─── PaiementModal ──────────────────────────────────────────── */

function PaiementModal({ facture, onPaiement, onClose }: {
  facture: Facture
  onPaiement: (montant: number, methode: string, reference: string, date: string, notes: string) => Promise<void>
  onClose: () => void
}) {
  const restant = facture.total_ttc - facture.amount_paid
  const [form, setForm] = useState({
    montant: String(restant.toFixed(2)),
    methode: 'virement',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [isPaying, setIsPaying] = useState(false)

  const montantNum = parseFloat(form.montant) || 0
  const isPartial  = montantNum < restant - 0.01
  const isOver     = montantNum > restant + 0.01

  const handleSubmit = async () => {
    if (!montantNum || isOver) return
    setIsPaying(true)
    await onPaiement(montantNum, form.methode, form.reference, form.date, form.notes)
    setIsPaying(false)
    onClose()
  }

  return (
    <Modal
      open onClose={onClose}
      title="Enregistrer un règlement"
      description={`${facture.numero} · ${formatCurrency(facture.total_ttc)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isPaying || !montantNum || isOver}>
            <Check className="h-3.5 w-3.5" />
            {isPaying ? 'Enregistrement…' : isPartial ? 'Paiement partiel' : 'Confirmer le paiement'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {/* Progress bar */}
        {facture.amount_paid > 0 && (
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <div className="flex justify-between text-xs text-gray-600 mb-1.5">
              <span>Déjà réglé</span>
              <span className="font-semibold">{formatCurrency(facture.amount_paid)} / {formatCurrency(facture.total_ttc)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (facture.amount_paid / facture.total_ttc) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Restant dû : <strong>{formatCurrency(restant)}</strong></p>
          </div>
        )}

        {!facture.amount_paid && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Montant total à encaisser</p>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(facture.total_ttc)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Montant encaissé (€) *</label>
            <input
              type="number" min="0.01" step="0.01"
              max={restant}
              value={form.montant}
              onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
              className={cn(
                'w-full text-sm px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400',
                isOver ? 'border-red-300 bg-red-50' : 'border-gray-200',
              )}
            />
            {isOver && <p className="text-[11px] text-red-500 mt-0.5">Supérieur au restant dû</p>}
            {isPartial && !isOver && <p className="text-[11px] text-amber-600 mt-0.5">Paiement partiel — solde restant : {formatCurrency(restant - montantNum)}</p>}
          </div>
          <Select label="Méthode *" value={form.methode}
            onChange={e => setForm(f => ({ ...f, methode: e.target.value }))}
            options={METHODE_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Référence (optionnel)" placeholder="VIR-001, CHQ-12…"
            value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
          <Input label="Date de règlement" type="date"
            value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <Textarea label="Notes (optionnel)" placeholder="Commentaire sur ce paiement…"
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
      </div>
    </Modal>
  )
}

/* ─── PaymentHistory ─────────────────────────────────────────── */

function PaymentHistory({ factureId, total }: { factureId: string; total: number }) {
  const { data: payments = [], isLoading } = useFacturePayments(factureId)
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)

  if (isLoading) return null
  if (payments.length === 0) return null

  const MethodIcon = ({ method }: { method: string }) => {
    const Icon = METHODE_ICONS[method] ?? CreditCard
    return <Icon className="h-3.5 w-3.5" />
  }

  return (
    <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Historique des règlements</p>
        <span className="text-xs font-semibold text-emerald-600">{formatCurrency(totalPaid)} encaissé</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all',
              totalPaid >= total ? 'bg-emerald-500' : 'bg-amber-400')}
            style={{ width: `${Math.min(100, (totalPaid / total) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>{Math.round((totalPaid / total) * 100)}% réglé</span>
          {totalPaid < total && <span>Restant : {formatCurrency(total - totalPaid)}</span>}
        </div>
      </div>

      <div className="space-y-2">
        {payments.map(p => (
          <div key={p.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-3 py-2.5">
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500 shrink-0">
              <MethodIcon method={p.method} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{formatCurrency(p.amount)}</span>
                <span className="text-xs text-gray-400 capitalize">{METHODE_OPTIONS.find(m => m.value === p.method)?.label ?? p.method}</span>
                {p.reference && <span className="text-xs text-gray-400 truncate">· {p.reference}</span>}
              </div>
              {p.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{p.notes}</p>}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
              <Clock className="h-3 w-3" />
              {formatDate(p.paid_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── FactureFiche ───────────────────────────────────────────── */

function FactureFiche({
  facture, clients, services, onBack,
  onUpdate, onUpdateStatus, onDelete, onDuplicate, onPaiement, onEnvoyer,
  isUpdating, isDeleting, isDuplicating,
}: {
  facture: Facture; clients: Client[]; services: Service[]
  onBack: () => void
  onUpdate: (d: Parameters<ReturnType<typeof useUpdateFacture>['mutateAsync']>[0]) => Promise<Facture>
  onUpdateStatus: (s: FactureStatus) => Promise<Facture>
  onDelete: () => Promise<void>
  onDuplicate: () => Promise<void>
  onPaiement: (montant: number, methode: string, reference: string, date: string, notes: string) => Promise<Facture>
  onEnvoyer: () => Promise<Facture>
  isUpdating: boolean; isDeleting: boolean; isDuplicating: boolean
}) {
  const [editMode, setEditMode]       = useState(false)
  const [showDelete, setShowDelete]   = useState(false)
  const [showPaiement, setShowPaiement] = useState(false)
  const [showEmail, setShowEmail]     = useState(false)
  const [showStripe, setShowStripe]   = useState(false)
  const [copiedLink, setCopiedLink]   = useState(false)

  const [form, setForm] = useState({
    client_id: facture.client_id,
    due_date:  facture.date_echeance ?? '',
    status:    facture.status,
    notes:     facture.notes ?? '',
    tva_rate:  facture.tva_rate,
    lignes:    facture.lignes.length > 0
      ? facture.lignes.map(l => ({ description: l.description, quantite: String(l.quantite), prix_unitaire: String(l.prix_unitaire) }))
      : [{ ...LIGNE_INIT }],
  })

  useEffect(() => {
    setForm({
      client_id: facture.client_id,
      due_date:  facture.date_echeance ?? '',
      status:    facture.status,
      notes:     facture.notes ?? '',
      tva_rate:  facture.tva_rate,
      lignes:    facture.lignes.length > 0
        ? facture.lignes.map(l => ({ description: l.description, quantite: String(l.quantite), prix_unitaire: String(l.prix_unitaire) }))
        : [{ ...LIGNE_INIT }],
    })
    setEditMode(false)
  }, [facture.id])

  const handleSave = async () => {
    await onUpdate({
      id: facture.id, client_id: form.client_id, due_date: form.due_date,
      status: form.status, notes: form.notes, tva_rate: form.tva_rate,
      lignes: form.lignes.map(l => ({
        description: l.description, quantite: parseFloat(l.quantite) || 1,
        prix_unitaire: parseFloat(l.prix_unitaire) || 0,
      })),
    })
    setEditMode(false)
  }

  const handlePrint = useCallback(() => {
    const el = document.getElementById('facture-document')
    if (!el) return
    const style = document.createElement('style')
    style.id = '__facture_print_style__'
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #facture-document, #facture-document * { visibility: visible !important; }
        #facture-document { position: fixed !important; inset: 0 !important; width: 100% !important; box-shadow: none !important; border: none !important; }
        @page { margin: 15mm; }
      }
    `
    document.head.appendChild(style)
    window.print()
    document.head.removeChild(style)
  }, [])

  const handleCopyLink = () => {
    if (!facture.stripe_payment_link) return
    navigator.clipboard.writeText(facture.stripe_payment_link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSaveStripeLink = async (link: string) => {
    await onUpdate({ id: facture.id, stripe_payment_link: link })
  }

  const overdue = daysOverdue(facture.date_echeance)
  const canEdit = ['brouillon', 'envoyee', 'en_retard', 'partiellement_payee'].includes(facture.status)
  const canPay  = ['envoyee', 'en_retard', 'partiellement_payee'].includes(facture.status)
  const clientOptions = clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}${c.entreprise ? ` — ${c.entreprise}` : ''}` }))
  const restant = facture.total_ttc - facture.amount_paid

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition mb-5 group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Retour à la liste
      </button>

      {/* Overdue alert */}
      {facture.status === 'en_retard' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Facture en retard de {overdue} jour{overdue > 1 ? 's' : ''}</p>
            <p className="text-xs text-red-500 mt-0.5">Échéance dépassée depuis le {formatDate(facture.date_echeance)}</p>
          </div>
          <Button size="sm" onClick={() => setShowPaiement(true)} className="shrink-0">
            <Check className="h-3.5 w-3.5" />Enregistrer le paiement
          </Button>
        </div>
      )}

      {/* Paid / partial banner */}
      {facture.status === 'payee' && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-5">
          <Check className="h-5 w-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">
            Facture réglée intégralement le {formatDate(facture.date_paiement)} · {formatCurrency(facture.total_ttc)} encaissé
          </p>
        </div>
      )}
      {facture.status === 'partiellement_payee' && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
          <CreditCard className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Paiement partiel · {formatCurrency(facture.amount_paid)} encaissé sur {formatCurrency(facture.total_ttc)}
            </p>
            <div className="mt-2 h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(facture.amount_paid / facture.total_ttc) * 100}%` }} />
            </div>
            <p className="text-xs text-amber-700 mt-1">Restant dû : <strong>{formatCurrency(restant)}</strong></p>
          </div>
          <Button size="sm" onClick={() => setShowPaiement(true)} className="shrink-0">
            <Check className="h-3.5 w-3.5" />Solde restant
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl shrink-0">
            <Receipt className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 font-mono">{facture.numero}</h1>
              <Badge status={facture.status} dot />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Émise le {formatDate(facture.date_emission)}
              {facture.date_echeance && ` · Échéance : ${formatDate(facture.date_echeance)}`}
              {facture.date_paiement && ` · Payée le ${formatDate(facture.date_paiement)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
          {facture.status === 'brouillon' && !editMode && (
            <Button size="sm" onClick={() => setShowEmail(true)} disabled={isUpdating}>
              <Send className="h-3.5 w-3.5" />Envoyer
            </Button>
          )}
          {canPay && (
            <Button size="sm" onClick={() => setShowPaiement(true)}>
              <Check className="h-3.5 w-3.5" />
              {facture.status === 'partiellement_payee' ? 'Compléter' : 'Marquer payée'}
            </Button>
          )}
          {(facture.status === 'envoyee' || facture.status === 'en_retard' || facture.status === 'partiellement_payee') && (
            <Button size="sm" variant="outline" onClick={() => setShowEmail(true)}>
              <Mail className="h-3.5 w-3.5" />Email
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowStripe(true)} title="Lien Stripe">
            <Link className="h-3.5 w-3.5" />Stripe
          </Button>
          <Button size="sm" variant="outline" onClick={handlePrint} title="PDF">
            <Printer className="h-3.5 w-3.5" />PDF
          </Button>
          {(facture.status === 'envoyee' || facture.status === 'en_retard' || facture.status === 'partiellement_payee') && (
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus('annulee')} disabled={isUpdating}>
              <X className="h-3.5 w-3.5 text-gray-400" />Annuler
            </Button>
          )}
          {canEdit && !editMode && (
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit className="h-3.5 w-3.5" />Modifier
            </Button>
          )}
          {editMode && <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Annuler</Button>}
          <Button size="sm" variant="outline" onClick={onDuplicate} disabled={isDuplicating}>
            <Copy className="h-3.5 w-3.5" />{isDuplicating ? '…' : 'Dupliquer'}
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
              <Select label="Client *" value={form.client_id}
                onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
                options={clientOptions} placeholder="Sélectionner un client" className="col-span-2" />
              <Input label="Date d'échéance" type="date" value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              <Select label="Status" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as FactureStatus }))}
                options={STATUS_OPTIONS} />
            </div>
            <LignesEditor lignes={form.lignes} tvaRate={form.tva_rate} services={services}
              onChange={lignes => setForm(f => ({ ...f, lignes }))}
              onTvaChange={tva_rate => setForm(f => ({ ...f, tva_rate }))} />
            <Textarea label="Notes / Conditions de paiement" placeholder="Virement sous 30 jours, IBAN…"
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
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
        <div id="facture-document" className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-8 py-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Facture</p>
              <p className="text-3xl font-bold font-mono tracking-tight">{facture.numero}</p>
            </div>
            <div className="text-right space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {STATUS_OPTIONS.find(s => s.value === facture.status)?.label}
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />Émise le {formatDate(facture.date_emission)}
              </div>
              {facture.date_echeance && (
                <div className={cn('flex items-center justify-end gap-1.5 text-xs', facture.status === 'en_retard' ? 'text-red-300 font-semibold' : 'text-gray-400')}>
                  <Calendar className="h-3 w-3" />Échéance : {formatDate(facture.date_echeance)}
                </div>
              )}
              {facture.date_paiement && (
                <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-300 font-semibold">
                  <Check className="h-3 w-3" />Payée le {formatDate(facture.date_paiement)}
                </div>
              )}
            </div>
          </div>

          {/* Stripe payment link banner */}
          {facture.stripe_payment_link && facture.status !== 'payee' && (
            <div className="px-8 py-3 bg-violet-50 border-b border-violet-100 flex items-center gap-3">
              <Link className="h-4 w-4 text-violet-500 shrink-0" />
              <p className="text-xs text-violet-700 font-medium flex-1 truncate">
                Lien de paiement : <a href={facture.stripe_payment_link} target="_blank" rel="noreferrer"
                  className="underline hover:no-underline">{facture.stripe_payment_link}</a>
              </p>
              <button onClick={handleCopyLink}
                className={cn('text-xs font-medium transition px-2 py-1 rounded-lg',
                  copiedLink ? 'text-emerald-700 bg-emerald-100' : 'text-violet-600 hover:bg-violet-100')}>
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}

          {/* From / To */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">De</p>
              <p className="font-bold text-gray-900 text-base">CA-TECH</p>
              <p className="text-sm text-gray-500 mt-1">pemoustaskit@gmail.com</p>
              <p className="text-sm text-gray-500">France</p>
            </div>
            <div className="p-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Facturer à</p>
              {facture.client ? (
                <>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar nom={facture.client.nom} prenom={facture.client.prenom} size="md" />
                    <p className="font-bold text-gray-900 text-base">{facture.client.prenom} {facture.client.nom}</p>
                  </div>
                  {facture.client.entreprise && <p className="text-sm text-gray-500">{facture.client.entreprise}</p>}
                  <p className="text-sm text-gray-500">{facture.client.email}</p>
                  {facture.client.telephone && <p className="text-sm text-gray-500">{facture.client.telephone}</p>}
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
                {facture.lignes.map((l, i) => (
                  <tr key={l.id ?? i} className="border-b border-gray-50">
                    <td className="py-3.5 text-sm text-gray-800 pr-4">{l.description}</td>
                    <td className="py-3.5 text-sm text-right text-gray-600">{l.quantite}</td>
                    <td className="py-3.5 text-sm text-right text-gray-600">{formatCurrency(l.prix_unitaire)}</td>
                    <td className="py-3.5 text-sm text-right text-gray-400">{facture.tva_rate}%</td>
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
                    <span>Sous-total HT</span><span>{formatCurrency(facture.sous_total_ht)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>TVA {facture.tva_rate}%</span><span>{formatCurrency(facture.tva_total)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t-2 border-gray-900 pt-3">
                  <span className="font-bold text-gray-900 text-base">Total TTC</span>
                  <span className={cn('text-2xl font-bold', facture.status === 'payee' ? 'text-emerald-600' : 'text-brand-600')}>
                    {formatCurrency(facture.total_ttc)}
                  </span>
                </div>
                {facture.amount_paid > 0 && facture.amount_paid < facture.total_ttc && (
                  <>
                    <div className="flex justify-between text-sm text-emerald-600 mt-2">
                      <span>Encaissé</span><span>{formatCurrency(facture.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-amber-600 border-t border-amber-200 pt-1.5 mt-1">
                      <span>Restant dû</span><span>{formatCurrency(facture.total_ttc - facture.amount_paid)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {facture.notes && (
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Conditions de paiement</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{facture.notes}</p>
            </div>
          )}

          {/* Payment history */}
          <PaymentHistory factureId={facture.id} total={facture.total_ttc} />
        </div>
      )}

      {/* Modals */}
      {showPaiement && (
        <PaiementModal
          facture={facture}
          onPaiement={async (montant, methode, reference, date, notes) => {
            await onPaiement(montant, methode, reference, date, notes)
            setShowPaiement(false)
          }}
          onClose={() => setShowPaiement(false)}
        />
      )}

      {showEmail && (
        <EmailModal
          facture={facture}
          onSent={async () => { await onEnvoyer() }}
          onClose={() => setShowEmail(false)}
        />
      )}

      {showStripe && (
        <StripeModal
          facture={facture}
          onSave={handleSaveStripeLink}
          onClose={() => setShowStripe(false)}
        />
      )}

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Supprimer cette facture ?"
        description={facture.numero}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Annuler</Button>
            <Button variant="danger" onClick={async () => { await onDelete(); onBack() }} disabled={isDeleting}>
              <Trash2 className="h-3.5 w-3.5" />{isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Cette action est irréversible. La facture {facture.numero} sera définitivement supprimée.</p>
      </Modal>
    </div>
  )
}

/* ─── Page Factures ──────────────────────────────────────────── */

export function Factures() {
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState<FactureStatus | 'all'>('all')
  const [showAdd, setShowAdd]           = useState(false)
  const [ficheFacture, setFicheFacture] = useState<Facture | null>(null)
  const [form, setForm]                 = useState(FORM_INIT)

  const { data: factures = [], isLoading } = useFactures()
  const { data: clients = [] }             = useClients()
  const { data: services = [] }            = useServices()
  const createFacture       = useCreateFacture()
  const updateFacture       = useUpdateFacture()
  const updateStatus        = useUpdateFactureStatus()
  const deleteFacture       = useDeleteFacture()
  const duplicateFacture    = useDuplicateFacture()
  const enregistrerPaiement = useEnregistrerPaiement()
  const envoyerFacture      = useEnvoyerFacture()

  useEffect(() => {
    if (!ficheFacture) return
    const fresh = factures.find(f => f.id === ficheFacture.id)
    if (fresh) setFicheFacture(fresh)
  }, [factures]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => factures.filter(f => {
    const matchSearch = `${f.numero} ${f.client?.prenom} ${f.client?.nom} ${f.client?.entreprise ?? ''}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || f.status === filterStatus
    return matchSearch && matchStatus
  }), [factures, search, filterStatus])

  const stats = useMemo(() => ({
    totalPayee:           factures.filter(f => f.status === 'payee').reduce((s, f) => s + f.total_ttc, 0),
    totalAttente:         factures.filter(f => f.status === 'envoyee').reduce((s, f) => s + f.total_ttc, 0),
    totalRetard:          factures.filter(f => f.status === 'en_retard').reduce((s, f) => s + f.total_ttc, 0),
    totalPartiel:         factures.filter(f => f.status === 'partiellement_payee').reduce((s, f) => s + (f.total_ttc - f.amount_paid), 0),
    nbRetard:             factures.filter(f => f.status === 'en_retard').length,
    total:                factures.length,
  }), [factures])

  const clientOptions = clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}${c.entreprise ? ` — ${c.entreprise}` : ''}` }))

  const handleCreate = async () => {
    if (!form.client_id) return
    const created = await createFacture.mutateAsync({
      client_id: form.client_id, due_date: form.due_date, notes: form.notes, tva_rate: form.tva_rate,
      lignes: form.lignes.map(l => ({ description: l.description, quantite: parseFloat(l.quantite) || 1, prix_unitaire: parseFloat(l.prix_unitaire) || 0 })),
    })
    setShowAdd(false); setForm(FORM_INIT); setFicheFacture(created)
  }

  const handleFicheUpdate = async (d: Parameters<typeof updateFacture.mutateAsync>[0]) => {
    const updated = await updateFacture.mutateAsync(d)
    setFicheFacture(updated); return updated
  }

  const handleFicheUpdateStatus = async (status: FactureStatus) => {
    if (!ficheFacture) return {} as Facture
    const updated = await updateStatus.mutateAsync({ id: ficheFacture.id, status })
    setFicheFacture(updated); return updated
  }

  const handleFicheDelete = async () => {
    if (!ficheFacture) return
    await deleteFacture.mutateAsync(ficheFacture.id)
    setFicheFacture(null)
  }

  const handleDuplicate = async () => {
    if (!ficheFacture) return
    const copy = await duplicateFacture.mutateAsync(ficheFacture)
    setFicheFacture(copy)
  }

  const handlePaiement = async (montant: number, methode: string, reference: string, date: string, notes: string) => {
    if (!ficheFacture) return {} as Facture
    const updated = await enregistrerPaiement.mutateAsync({ facture: ficheFacture, montant, methode, reference, date_paiement: date, notes })
    setFicheFacture(updated); return updated
  }

  const handleEnvoyer = async () => {
    if (!ficheFacture) return {} as Facture
    const updated = await envoyerFacture.mutateAsync(ficheFacture.id)
    setFicheFacture(updated); return updated
  }

  /* ── Fiche mode ── */
  if (ficheFacture) {
    return (
      <Layout title="Factures">
        <FactureFiche
          facture={ficheFacture}
          clients={clients}
          services={services}
          onBack={() => setFicheFacture(null)}
          onUpdate={handleFicheUpdate}
          onUpdateStatus={handleFicheUpdateStatus}
          onDelete={handleFicheDelete}
          onDuplicate={handleDuplicate}
          onPaiement={handlePaiement}
          onEnvoyer={handleEnvoyer}
          isUpdating={updateFacture.isPending || updateStatus.isPending || envoyerFacture.isPending}
          isDeleting={deleteFacture.isPending}
          isDuplicating={duplicateFacture.isPending}
        />
      </Layout>
    )
  }

  /* ── List mode ── */
  return (
    <Layout
      title="Factures"
      actions={<Button size="sm" onClick={() => { setForm(FORM_INIT); setShowAdd(true) }}><Plus className="h-3.5 w-3.5" />Nouvelle facture</Button>}
    >
      {stats.nbRetard > 0 && (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl mb-5">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {stats.nbRetard} facture{stats.nbRetard > 1 ? 's' : ''} en retard
            <span className="font-bold ml-1">· {formatCurrency(stats.totalRetard)}</span>
          </p>
          <button onClick={() => setFilterStatus('en_retard')} className="ml-auto text-xs text-red-600 underline hover:no-underline">Voir</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card>
          <p className="text-xs text-gray-500 mb-1">Total factures</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">Encaissé</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalPayee)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">En attente</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalAttente)}</p>
          {stats.totalPartiel > 0 && <p className="text-xs text-amber-500 mt-0.5">+{formatCurrency(stats.totalPartiel)} solde restant</p>}
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">En retard</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.totalRetard)}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-card overflow-x-auto">
          {FILTER_OPTS.map(f => (
            <button key={f.value} onClick={() => setFilterStatus(f.value)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap',
                filterStatus === f.value ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-700',
              )}>
              {f.label}
              <span className={cn('ml-1.5 text-[10px]', filterStatus === f.value ? 'text-white/70' : 'text-gray-400')}>
                {f.value === 'all' ? factures.length : factures.filter(fa => fa.status === f.value).length}
              </span>
            </button>
          ))}
        </div>
        <Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
          leading={<Search className="h-3.5 w-3.5" />} className="max-w-xs" />
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} facture{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <Card padding={false}>
        <Table>
          <Thead>
            <Tr>
              <Th>Numéro</Th><Th>Client</Th><Th>Total TTC</Th>
              <Th>Encaissé</Th><Th>Status</Th><Th>Émise</Th>
              <Th>Échéance</Th><Th>Payée</Th><Th />
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <EmptyRow cols={9} message="Chargement…" />
            ) : filtered.length === 0 ? (
              <EmptyRow cols={9} />
            ) : filtered.map(f => (
              <Tr key={f.id} onClick={() => setFicheFacture(f)} className="cursor-pointer">
                <Td>
                  <div className="flex items-center gap-2">
                    <Receipt className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                    <span className="font-mono text-sm font-semibold text-gray-800">{f.numero}</span>
                  </div>
                </Td>
                <Td>
                  {f.client ? (
                    <div className="flex items-center gap-2">
                      <Avatar nom={f.client.nom} prenom={f.client.prenom} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{f.client.prenom} {f.client.nom}</p>
                        {f.client.entreprise && <p className="text-xs text-gray-400">{f.client.entreprise}</p>}
                      </div>
                    </div>
                  ) : <span className="text-gray-300">—</span>}
                </Td>
                <Td className="font-bold text-gray-900">{formatCurrency(f.total_ttc)}</Td>
                <Td>
                  {f.amount_paid > 0 ? (
                    <div>
                      <p className={cn('text-sm font-medium', f.amount_paid >= f.total_ttc ? 'text-emerald-600' : 'text-amber-600')}>
                        {formatCurrency(f.amount_paid)}
                      </p>
                      {f.amount_paid < f.total_ttc && (
                        <div className="w-16 h-1 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(f.amount_paid / f.total_ttc) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  ) : <span className="text-gray-300">—</span>}
                </Td>
                <Td><Badge status={f.status} dot /></Td>
                <Td className="text-xs text-gray-400">{formatDate(f.date_emission)}</Td>
                <Td className={cn('text-xs font-medium', f.status === 'en_retard' ? 'text-red-500' : 'text-gray-400')}>
                  {formatDate(f.date_echeance)}
                </Td>
                <Td className="text-xs text-emerald-600 font-medium">{formatDate(f.date_paiement)}</Td>
                <Td onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    {f.status === 'brouillon' && (
                      <Button variant="ghost" size="icon" title="Envoyer" onClick={() => envoyerFacture.mutate(f.id)}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" title="Ouvrir" onClick={() => setFicheFacture(f)}>
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
        onClose={() => setShowAdd(false)}
        title="Nouvelle facture"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createFacture.isPending || !form.client_id}>
              {createFacture.isPending ? 'Création…' : 'Créer la facture'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Client *" value={form.client_id}
              onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              options={clientOptions} placeholder="Sélectionner un client" className="col-span-2" />
            <Input label="Date d'échéance" type="date" value={form.due_date}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
          <LignesEditor lignes={form.lignes} tvaRate={form.tva_rate} services={services}
            onChange={lignes => setForm(f => ({ ...f, lignes }))}
            onTvaChange={tva_rate => setForm(f => ({ ...f, tva_rate }))} />
          <Textarea label="Notes / Conditions de paiement" placeholder="Virement sous 30 jours, IBAN…"
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
        </div>
      </Modal>
    </Layout>
  )
}
