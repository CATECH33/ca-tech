import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined, fmt = 'dd/MM/yyyy'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, fmt, { locale: fr })
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function formatNumber(n: number | undefined): string {
  if (n === undefined || n === null) return '—'
  return new Intl.NumberFormat('fr-FR').format(n)
}

export function initials(nom?: string, prenom?: string): string {
  const n = (prenom?.[0] ?? '') + (nom?.[0] ?? '')
  return n.toUpperCase() || '?'
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    actif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactif: 'bg-gray-50 text-gray-600 border-gray-200',
    archive: 'bg-gray-50 text-gray-500 border-gray-200',
    nouveau: 'bg-blue-50 text-blue-700 border-blue-200',
    contact: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    qualifie: 'bg-violet-50 text-violet-700 border-violet-200',
    proposition: 'bg-amber-50 text-amber-700 border-amber-200',
    negocie: 'bg-orange-50 text-orange-700 border-orange-200',
    gagne: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    perdu: 'bg-red-50 text-red-700 border-red-200',
    brouillon: 'bg-gray-50 text-gray-600 border-gray-200',
    envoye: 'bg-blue-50 text-blue-700 border-blue-200',
    accepte: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    refuse: 'bg-red-50 text-red-700 border-red-200',
    expire: 'bg-orange-50 text-orange-700 border-orange-200',
    envoyee: 'bg-blue-50 text-blue-700 border-blue-200',
    partiellement_payee: 'bg-amber-50 text-amber-700 border-amber-200',
    payee: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    en_retard: 'bg-red-50 text-red-700 border-red-200',
    annulee: 'bg-gray-50 text-gray-500 border-gray-200',
    planifie: 'bg-blue-50 text-blue-700 border-blue-200',
    en_cours: 'bg-violet-50 text-violet-700 border-violet-200',
    en_pause: 'bg-amber-50 text-amber-700 border-amber-200',
    termine: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    annule: 'bg-gray-50 text-gray-500 border-gray-200',
    a_faire: 'bg-gray-50 text-gray-600 border-gray-200',
    bloque: 'bg-red-50 text-red-700 border-red-200',
    basse: 'bg-gray-50 text-gray-600 border-gray-200',
    normale: 'bg-blue-50 text-blue-700 border-blue-200',
    haute: 'bg-amber-50 text-amber-700 border-amber-200',
    urgente: 'bg-red-50 text-red-700 border-red-200',
    ouvert: 'bg-blue-50 text-blue-700 border-blue-200',
    resolu: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ferme: 'bg-gray-50 text-gray-500 border-gray-200',
    critique: 'bg-red-50 text-red-700 border-red-200',
    // Prospect statuses
    new: 'bg-slate-50 text-slate-600 border-slate-200',
    researching: 'bg-blue-50 text-blue-700 border-blue-200',
    qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    email_ready: 'bg-violet-50 text-violet-700 border-violet-200',
    contacted: 'bg-purple-50 text-purple-700 border-purple-200',
    responded: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    meeting: 'bg-teal-50 text-teal-700 border-teal-200',
    proposal_sent: 'bg-amber-50 text-amber-700 border-amber-200',
    contract_signed: 'bg-orange-50 text-orange-700 border-orange-200',
    converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    project_started: 'bg-green-50 text-green-700 border-green-200',
    disqualified: 'bg-gray-50 text-gray-500 border-gray-200',
  }
  return map[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    actif: 'Actif', inactif: 'Inactif', archive: 'Archivé',
    nouveau: 'Nouveau', contact: 'Contacté', qualifie: 'Qualifié',
    proposition: 'Proposition', negocie: 'Négociation', gagne: 'Gagné', perdu: 'Perdu',
    brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté',
    refuse: 'Refusé', expire: 'Expiré',
    envoyee: 'Envoyée', partiellement_payee: 'Part. payée', payee: 'Payée', en_retard: 'En retard', annulee: 'Annulée',
    planifie: 'Planifié', en_cours: 'En cours', en_pause: 'En pause',
    termine: 'Terminé', annule: 'Annulé',
    a_faire: 'À faire', bloque: 'Bloqué',
    basse: 'Basse', normale: 'Normale', haute: 'Haute', urgente: 'Urgente',
    ouvert: 'Ouvert', resolu: 'Résolu', ferme: 'Fermé', critique: 'Critique',
    // Prospect statuses
    new: 'Nouveau prospect', researching: 'En recherche', qualified: 'Qualifié',
    email_ready: 'Email prêt', contacted: 'Email envoyé', responded: 'Réponse reçue',
    meeting: 'Rendez-vous', proposal_sent: 'Devis envoyé', contract_signed: 'Contrat signé',
    converted: 'Client', project_started: 'Projet lancé', disqualified: 'Disqualifié',
  }
  return map[status] ?? status
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}
