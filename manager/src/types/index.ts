export type Status = 'actif' | 'inactif' | 'archive'
export type LeadStatus = 'nouveau' | 'contact' | 'qualifie' | 'proposition' | 'negocie' | 'gagne' | 'perdu'
export type DevisStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
export type FactureStatus = 'brouillon' | 'envoyee' | 'partiellement_payee' | 'payee' | 'en_retard' | 'annulee'
export type ProjetStatus = 'planifie' | 'en_cours' | 'en_pause' | 'termine' | 'annule'
export type TacheStatus = 'a_faire' | 'en_cours' | 'termine' | 'bloque'
export type TachePriority = 'basse' | 'normale' | 'haute' | 'urgente'
export type PaiementMethod = 'virement' | 'carte' | 'stripe' | 'cheque' | 'especes'
export type TicketStatus = 'ouvert' | 'en_cours' | 'resolu' | 'ferme'
export type TicketPriority = 'basse' | 'normale' | 'haute' | 'critique'

export interface Client {
  id: string
  created_at: string
  updated_at: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  entreprise?: string
  secteur?: string
  adresse?: string
  ville?: string
  code_postal?: string
  pays: string
  status: Status
  notes?: string
  avatar_url?: string
  total_ca: number
}

export interface Lead {
  id: string
  created_at: string
  updated_at: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  entreprise?: string
  secteur?: string
  source: string
  status: LeadStatus
  budget_estime?: number
  besoin?: string
  notes?: string
  client_id?: string
  assigned_to?: string
}

export interface Service {
  id: string
  created_at: string
  nom: string
  description?: string
  prix_base: number
  unite: string
  actif: boolean
  categorie: string
  duree_jours?: number
}

export interface DevisLigne {
  id: string
  service_id?: string
  description: string
  quantite: number
  prix_unitaire: number
  tva: number
  total_ht: number
  total_ttc: number
}

export interface Devis {
  id: string
  created_at: string
  updated_at: string
  numero: string
  client_id: string
  client?: Client
  lead_id?: string
  status: DevisStatus
  lignes: DevisLigne[]
  sous_total_ht: number
  tva_rate: number
  tva_total: number
  total_ttc: number
  validite_jours: number
  date_envoi?: string
  date_expiration?: string
  notes?: string
  conditions?: string
  projet_id?: string
  signature?: string
}

export interface FactureLigne {
  id: string
  description: string
  quantite: number
  prix_unitaire: number
  tva: number
  total_ht: number
  total_ttc: number
}

export interface Facture {
  id: string
  created_at: string
  updated_at: string
  numero: string
  client_id: string
  client?: Client
  devis_id?: string
  projet_id?: string
  status: FactureStatus
  lignes: FactureLigne[]
  sous_total_ht: number
  tva_rate: number
  tva_total: number
  total_ttc: number
  amount_paid: number
  date_emission: string
  date_echeance: string
  date_paiement?: string
  notes?: string
  stripe_payment_link?: string
}

export interface Projet {
  id: string
  created_at: string
  updated_at: string
  nom: string
  description?: string
  notes?: string
  client_id: string
  client?: Client
  status: ProjetStatus
  date_debut?: string
  date_fin_prevue?: string
  date_fin_reelle?: string
  budget: number
  temps_estime?: number
  temps_passe?: number
  progression: number
  assigned_to?: string[]
  tags?: string[]
  couleur?: string
}

export interface Tache {
  id: string
  created_at: string
  updated_at: string
  titre: string
  description?: string
  projet_id?: string
  projet?: Projet
  client_id?: string
  status: TacheStatus
  priority: TachePriority
  assigned_to?: string
  date_echeance?: string
  date_completion?: string
  tags?: string[]
  time_estime?: number
  time_log?: number
}

export interface Paiement {
  id: string
  created_at: string
  facture_id: string
  facture?: Facture
  client_id: string
  client?: Client
  montant: number
  methode: PaiementMethod
  reference?: string
  date_paiement: string
  notes?: string
  stripe_payment_id?: string
}

export interface PortfolioItem {
  id: string
  created_at: string
  updated_at: string
  titre: string
  slug: string
  description?: string
  categorie?: string
  client_nom?: string
  service_id?: string
  thumbnail_url?: string
  images: string[]
  url_projet?: string
  technologies: string[]
  featured: boolean
  publie: boolean
  ordre: number
  date_livraison?: string
}

export interface Message {
  id: string
  created_at: string
  from_name: string
  from_email: string
  subject?: string
  body: string
  source: string
  lu: boolean
  client_id?: string
  lead_id?: string
  replied: boolean
}

export interface Ticket {
  id: string
  created_at: string
  updated_at: string
  ticket_number?: string
  sujet: string
  description: string
  client_id?: string
  client?: Client
  status: TicketStatus
  priority: TicketPriority
  assigned_to?: string
  resolved_at?: string
  tags: string[]
}

export interface StatsCard {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: string
}

export interface User {
  id: string
  email: string
  nom?: string
  prenom?: string
  role: 'admin' | 'manager' | 'user'
  avatar_url?: string
}

export type AppointmentType = 'meeting' | 'call' | 'demo' | 'deadline' | 'reminder' | 'other'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  created_at: string
  updated_at: string
  titre: string
  description?: string
  type: AppointmentType
  start_at: string
  end_at?: string
  lieu?: string
  en_ligne: boolean
  url_reunion?: string
  client_id?: string
  client?: Client
  lead_id?: string
  project_id?: string
  assigned_to?: string
  status: AppointmentStatus
}

export interface Notification {
  id: string
  created_at: string
  titre: string
  corps?: string
  type: 'info' | 'success' | 'warning' | 'error'
  lu: boolean
  lien?: string
}

// ── Prospection IA ────────────────────────────────────────────────────────────

export type ProspectStatus =
  | 'new' | 'researching' | 'qualified' | 'contacted'
  | 'responded' | 'meeting' | 'converted' | 'disqualified'

export type ProspectSource =
  | 'manual' | 'linkedin' | 'search' | 'referral' | 'import' | 'other'

export type ProspectTaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
export type ProspectTaskPriority = 'low' | 'normal' | 'high' | 'urgent'

export type EmailDraftStatus = 'draft' | 'ready' | 'sent' | 'failed'
export type EmailDraftTone = 'formal' | 'friendly' | 'direct' | 'professional'

export type ProspectActivityType =
  | 'email_sent' | 'email_opened' | 'email_replied' | 'call' | 'meeting'
  | 'note_added' | 'status_changed' | 'score_updated' | 'task_completed' | 'contacted'

export interface Prospect {
  id: string
  created_at: string
  updated_at: string
  company_name: string
  website?: string
  industry?: string
  company_size?: string
  country?: string
  city?: string
  status: ProspectStatus
  score: number
  score_reasons: Record<string, unknown>
  source: ProspectSource
  linkedin_url?: string
  converted_to_lead_id?: string
  tags: string[]
  metadata: Record<string, unknown>
  created_by?: string
  // joins
  contacts?: ProspectContact[]
  activities?: ProspectActivity[]
}

export interface ProspectContact {
  id: string
  created_at: string
  updated_at: string
  prospect_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  job_title?: string
  linkedin_url?: string
  is_primary: boolean
}

export interface ProspectNote {
  id: string
  created_at: string
  updated_at: string
  prospect_id: string
  content: string
  created_by?: string
}

export interface ProspectTask {
  id: string
  created_at: string
  updated_at: string
  prospect_id: string
  title: string
  description?: string
  status: ProspectTaskStatus
  priority: ProspectTaskPriority
  due_at?: string
  completed_at?: string
  assigned_to?: string
  created_by?: string
}

export interface EmailDraft {
  id: string
  created_at: string
  updated_at: string
  prospect_id: string
  prospect_contact_id?: string
  subject: string
  body: string
  status: EmailDraftStatus
  tone: EmailDraftTone
  sequence_step: number
  sent_at?: string
  ai_model?: string
  metadata: Record<string, unknown>
  created_by?: string
}

export interface ProspectActivity {
  id: string
  created_at: string
  prospect_id: string
  type: ProspectActivityType
  description?: string
  metadata: Record<string, unknown>
  created_by?: string
}
