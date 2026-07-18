/*!
 * CA-TECH — Bibliothèque Automatisations v1.0
 * ─────────────────────────────────────────────
 * Pour ajouter une automatisation → insérer un objet dans AUTOMATIONS (section 2).
 * Pour ajouter une application    → insérer une entrée dans APPS (section 1).
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. APPLICATIONS
   Chaque clé = un identifiant utilisé dans AUTOMATIONS.apps[]
   Champs : label (nom affiché), color (hex), icon (SVG string)
   ══════════════════════════════════════════════════════════════ */
const APPS = {

  form: {
    label: 'Formulaire',
    color: '#1d4ed8',
    icon: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  },

  crm: {
    label: 'CRM',
    color: '#059669',
    icon: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  },

  email: {
    label: 'Email',
    color: '#c2410c',
    icon: `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>`,
  },

  slack: {
    label: 'Slack',
    color: '#4a154b',
    icon: `<svg viewBox="0 0 24 24"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></svg>`,
  },

  li: {
    label: 'LinkedIn',
    color: '#0a66c2',
    icon: `<svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  },

  devis: {
    label: 'Devis',
    color: '#4f46e5',
    icon: `<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  },

  facture: {
    label: 'Facture',
    color: '#b45309',
    icon: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },

  stripe: {
    label: 'Paiement',
    color: '#635bff',
    icon: `<svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  },

  sms: {
    label: 'SMS',
    color: '#15803d',
    icon: `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  },

  cal: {
    label: 'Calendrier',
    color: '#0369a1',
    icon: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  },

  rpt: {
    label: 'Rapport',
    color: '#0f766e',
    icon: `<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  },

  blog: {
    label: 'Blog / Site',
    color: '#374151',
    icon: `<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  },

  news: {
    label: 'Newsletter',
    color: '#92400e',
    icon: `<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  },

  google: {
    label: 'Google',
    color: '#b91c1c',
    icon: `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },

  wa: {
    label: 'WhatsApp',
    color: '#15803d',
    icon: `<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>`,
  },

  notif: {
    label: 'Notification',
    color: '#1d4ed8',
    icon: `<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  },

  time: {
    label: 'Planificateur',
    color: '#312e81',
    icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  },

  phone: {
    label: 'Téléphone',
    color: '#374151',
    icon: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.06 1.22 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
  },

  cart: {
    label: 'E-commerce',
    color: '#c2410c',
    icon: `<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.42H6"/></svg>`,
  },

  cand: {
    label: 'Recrutement',
    color: '#6d28d9',
    icon: `<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
  },

  sheets: {
    label: 'Tableur',
    color: '#15803d',
    icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`,
  },

  notion: {
    label: 'Notion',
    color: '#1f2937',
    icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h6M7 17h4"/></svg>`,
  },

};

/* ══════════════════════════════════════════════════════════════
   2. AUTOMATISATIONS
   ──────────────────────────────────────────────────────────────
   Pour ajouter une automatisation, copier-coller ce modèle
   et remplir les champs :

   {
     id:          'identifiant-unique',         // string sans espaces
     name:        'App A → App B',              // nom court
     description: 'Ce que fait cette automatisation en 1-2 phrases.',
     timeSaved:   '3h / semaine',               // temps économisé estimé
     category:    'commercial',                 // voir liste ci-dessous
     apps:        ['app1', 'app2'],             // 2 ou 3 clés de APPS
     popular:     false,                        // true = section Populaires
     tags:        ['mot', 'clé', 'recherche'],  // mots-clés pour la recherche
   }

   Catégories disponibles :
   'commercial' | 'finance' | 'communication' | 'rh' | 'reporting' | 'ecommerce'
   ══════════════════════════════════════════════════════════════ */
const AUTOMATIONS = [

  /* ── COMMERCIAL & VENTE ───────────────────────────────────── */
  {
    id: 'form-crm-email',
    name: 'Formulaire → CRM + Email',
    description: 'Chaque nouveau contact de votre site est automatiquement ajouté au CRM et reçoit un email personnalisé en 30 secondes.',
    timeSaved: '3h / semaine',
    category: 'commercial',
    apps: ['form', 'crm', 'email'],
    popular: true,
    tags: ['formulaire', 'crm', 'email', 'bienvenue', 'lead', 'contact', 'commercial'],
  },
  {
    id: 'email-lead-slack',
    name: 'Email pro → Lead CRM + Alerte Slack',
    description: 'Chaque email commercial entrant crée un lead dans votre CRM et alerte votre équipe commerciale en temps réel.',
    timeSaved: '2h / semaine',
    category: 'commercial',
    apps: ['email', 'crm', 'slack'],
    popular: true,
    tags: ['email', 'lead', 'crm', 'slack', 'alerte', 'notification', 'commercial', 'vente'],
  },
  {
    id: 'li-sequence-email',
    name: 'LinkedIn → Séquence emails',
    description: 'Ajoutez un prospect sur LinkedIn pour déclencher automatiquement une séquence d\'emails personnalisés sur 7 jours.',
    timeSaved: '5h / semaine',
    category: 'commercial',
    apps: ['li', 'email'],
    popular: false,
    tags: ['linkedin', 'prospection', 'sequence', 'email', 'commercial', 'vente', 'lead'],
  },
  {
    id: 'appel-sms-agenda',
    name: 'Appel manqué → SMS + Rappel agenda',
    description: 'Chaque appel sans réponse envoie un SMS au client et crée un rappel dans votre agenda pour un suivi le lendemain.',
    timeSaved: '1h / semaine',
    category: 'commercial',
    apps: ['phone', 'sms', 'cal'],
    popular: false,
    tags: ['appel', 'manqué', 'sms', 'rappel', 'agenda', 'commercial', 'suivi'],
  },
  {
    id: 'lead-attribution-notif',
    name: 'Nouveau lead → Attribution + Notification',
    description: 'Chaque lead entrant est assigné au bon commercial selon vos règles de routage et l\'équipe est notifiée instantanément.',
    timeSaved: '2h / semaine',
    category: 'commercial',
    apps: ['crm', 'slack'],
    popular: false,
    tags: ['lead', 'attribution', 'commercial', 'notification', 'slack', 'routage', 'vente'],
  },

  /* ── FINANCE & DEVIS ──────────────────────────────────────── */
  {
    id: 'devis-facture-email',
    name: 'Devis accepté → Facture + Envoi client',
    description: 'Votre client signe le devis — la facture est créée, numérotée et envoyée automatiquement. Zéro saisie manuelle.',
    timeSaved: '4h / semaine',
    category: 'finance',
    apps: ['devis', 'facture', 'email'],
    popular: true,
    tags: ['devis', 'facture', 'signature', 'email', 'finance', 'comptabilité', 'automatique'],
  },
  {
    id: 'facture-relances',
    name: 'Facture impayée → Relances J+15 / J+30',
    description: 'À J+15 puis J+30, vos clients reçoivent une relance professionnelle et automatique. Plus d\'oubli, plus de gêne.',
    timeSaved: '3h / semaine',
    category: 'finance',
    apps: ['facture', 'email'],
    popular: false,
    tags: ['facture', 'impayée', 'relance', 'email', 'recouvrement', 'finance', 'comptabilité'],
  },
  {
    id: 'paiement-recu-crm',
    name: 'Paiement reçu → Reçu + CRM mis à jour',
    description: 'Chaque paiement confirmé envoie un reçu au client et met à jour son dossier dans le CRM sans intervention manuelle.',
    timeSaved: '2h / semaine',
    category: 'finance',
    apps: ['stripe', 'email', 'crm'],
    popular: false,
    tags: ['paiement', 'reçu', 'stripe', 'crm', 'finance', 'facturation', 'confirmation'],
  },
  {
    id: 'fin-de-mois-bilan',
    name: 'Fin de mois → Bilan financier automatique',
    description: 'Le premier de chaque mois, un bilan synthétique (CA, encaissements, en attente) est généré et envoyé à la direction.',
    timeSaved: '3h / mois',
    category: 'finance',
    apps: ['time', 'rpt', 'email'],
    popular: false,
    tags: ['fin de mois', 'bilan', 'financier', 'rapport', 'direction', 'comptabilité', 'kpi'],
  },
  {
    id: 'devis-rdv',
    name: 'Formulaire devis → Estimation + RDV',
    description: 'Chaque demande de devis en ligne déclenche une estimation préliminaire par email et propose un créneau de consultation.',
    timeSaved: '4h / semaine',
    category: 'finance',
    apps: ['form', 'email', 'cal'],
    popular: false,
    tags: ['formulaire', 'devis', 'estimation', 'rdv', 'calendrier', 'commercial', 'finance'],
  },

  /* ── COMMUNICATION ────────────────────────────────────────── */
  {
    id: 'article-li-newsletter',
    name: 'Nouvel article → LinkedIn + Newsletter',
    description: 'Publiez sur votre site et l\'article est automatiquement partagé sur LinkedIn et envoyé à vos abonnés newsletter.',
    timeSaved: '2h / semaine',
    category: 'communication',
    apps: ['blog', 'li', 'news'],
    popular: false,
    tags: ['article', 'blog', 'linkedin', 'newsletter', 'publication', 'communication', 'marketing'],
  },
  {
    id: 'avis-google-reponse',
    name: 'Avis Google → Notif interne + Réponse',
    description: 'Chaque nouvel avis Google alerte votre équipe sur Slack et génère un template de réponse personnalisé prêt à publier.',
    timeSaved: '1h / semaine',
    category: 'communication',
    apps: ['google', 'slack', 'email'],
    popular: false,
    tags: ['avis', 'google', 'réputation', 'réponse', 'slack', 'communication', 'notif'],
  },
  {
    id: 'whatsapp-ticket-support',
    name: 'WhatsApp → Ticket support + Assignation',
    description: 'Chaque message WhatsApp crée un ticket, l\'assigne au bon interlocuteur et envoie un accusé de réception au client.',
    timeSaved: '2h / semaine',
    category: 'communication',
    apps: ['wa', 'crm', 'notif'],
    popular: false,
    tags: ['whatsapp', 'ticket', 'support', 'assignation', 'client', 'communication', 'message'],
  },
  {
    id: 'newsletter-welcome-sequence',
    name: 'Inscription newsletter → Séquence bienvenue',
    description: 'Chaque nouvel abonné reçoit une séquence de 5 emails sur 10 jours qui présente vos services et crée la confiance.',
    timeSaved: '2h / semaine',
    category: 'communication',
    apps: ['form', 'email'],
    popular: false,
    tags: ['newsletter', 'inscription', 'séquence', 'bienvenue', 'email', 'abonné', 'marketing'],
  },

  /* ── RH & RECRUTEMENT ─────────────────────────────────────── */
  {
    id: 'candidature-email-entretien',
    name: 'Candidature → Email accusé + Entretien',
    description: 'Chaque candidature reçue génère un accusé de réception professionnel et propose des créneaux d\'entretien automatiquement.',
    timeSaved: '3h / semaine',
    category: 'rh',
    apps: ['cand', 'email', 'cal'],
    popular: false,
    tags: ['candidature', 'recrutement', 'email', 'entretien', 'calendrier', 'rh', 'accusé'],
  },
  {
    id: 'onboarding-collaborateur',
    name: 'Nouveau collaborateur → Onboarding complet',
    description: 'Création des accès outils, email de bienvenue, checklist J1 envoyée au manager — tout se déclenche automatiquement.',
    timeSaved: '4h / arrivée',
    category: 'rh',
    apps: ['notif', 'email', 'slack'],
    popular: false,
    tags: ['onboarding', 'collaborateur', 'accès', 'bienvenue', 'manager', 'rh', 'intégration'],
  },
  {
    id: 'conges-validation-planning',
    name: 'Congés demandés → Validation + Planning',
    description: 'Les demandes de congés notifient le manager, déclenchent la validation et mettent à jour le planning d\'équipe.',
    timeSaved: '1h / semaine',
    category: 'rh',
    apps: ['cal', 'email', 'slack'],
    popular: false,
    tags: ['congés', 'validation', 'planning', 'manager', 'rh', 'calendrier', 'notification'],
  },
  {
    id: 'offre-diffusion-multi',
    name: 'Offre d\'emploi → Diffusion multi-canaux',
    description: 'Publiez une offre en un clic et elle est automatiquement diffusée sur LinkedIn, votre site et par newsletter interne.',
    timeSaved: '2h / offre',
    category: 'rh',
    apps: ['blog', 'li', 'news'],
    popular: false,
    tags: ['offre emploi', 'recrutement', 'diffusion', 'linkedin', 'rh', 'publication'],
  },

  /* ── REPORTING ────────────────────────────────────────────── */
  {
    id: 'soir-resume-leads',
    name: 'Chaque soir 18h → Résumé leads du jour',
    description: 'En fin de journée, recevez le résumé des leads entrants, des devis envoyés et des relances prévues demain.',
    timeSaved: '1h / semaine',
    category: 'reporting',
    apps: ['time', 'rpt', 'slack'],
    popular: true,
    tags: ['soir', 'résumé', 'leads', 'quotidien', 'reporting', 'kpi', 'suivi'],
  },
  {
    id: 'lundi-rapport-equipe',
    name: 'Lundi 8h → Rapport performance équipe',
    description: 'Le bilan commercial de la semaine écoulée arrive dans votre boîte mail chaque lundi matin avant votre café.',
    timeSaved: '2h / semaine',
    category: 'reporting',
    apps: ['time', 'rpt', 'email'],
    popular: false,
    tags: ['lundi', 'rapport', 'performance', 'équipe', 'hebdomadaire', 'reporting', 'kpi'],
  },
  {
    id: 'mensuel-kpis-direction',
    name: 'Fin de mois → KPIs direction',
    description: 'Vos indicateurs clés — CA, taux de conversion, coût d\'acquisition — compilés et envoyés automatiquement à la direction.',
    timeSaved: '3h / mois',
    category: 'reporting',
    apps: ['time', 'sheets', 'email'],
    popular: false,
    tags: ['kpis', 'direction', 'mensuel', 'indicateurs', 'reporting', 'tableau de bord', 'bilan'],
  },
  {
    id: 'crm-sheets-sync',
    name: 'CRM → Tableur synchronisé en temps réel',
    description: 'Chaque modification dans votre CRM est immédiatement reflétée dans votre tableur Google Sheets ou Excel.',
    timeSaved: '2h / semaine',
    category: 'reporting',
    apps: ['crm', 'sheets'],
    popular: false,
    tags: ['crm', 'sheets', 'google', 'tableur', 'synchronisation', 'reporting', 'données'],
  },

  /* ── SITE & E-COMMERCE ────────────────────────────────────── */
  {
    id: 'abandon-panier-email',
    name: 'Abandon panier → Email relance J+1',
    description: 'Un visiteur a failli acheter ? Il reçoit un email personnalisé 24h après avec le résumé de son panier et une offre.',
    timeSaved: '4h / semaine',
    category: 'ecommerce',
    apps: ['cart', 'email'],
    popular: false,
    tags: ['panier', 'abandon', 'email', 'relance', 'ecommerce', 'vente', 'récupération'],
  },
  {
    id: 'commande-confirmation-crm',
    name: 'Nouvelle commande → Confirmation + CRM',
    description: 'Chaque commande envoie une confirmation au client, crée son profil dans le CRM et alerte l\'équipe logistique.',
    timeSaved: '3h / semaine',
    category: 'ecommerce',
    apps: ['cart', 'email', 'crm'],
    popular: false,
    tags: ['commande', 'confirmation', 'crm', 'ecommerce', 'logistique', 'client', 'vente'],
  },
  {
    id: 'notion-crm-projet',
    name: 'Nouveau client → Espace Notion + Projet',
    description: 'À chaque nouveau client signé, un espace Notion dédié est créé avec le brief, les accès et le planning projet.',
    timeSaved: '2h / projet',
    category: 'ecommerce',
    apps: ['crm', 'notion', 'slack'],
    popular: false,
    tags: ['client', 'notion', 'projet', 'espace', 'slack', 'brief', 'onboarding client'],
  },

];

/* ══════════════════════════════════════════════════════════════
   3. MOTEUR DE RENDU — ne pas modifier
   ══════════════════════════════════════════════════════════════ */

const CATEGORY_LABELS = {
  commercial:    'Commercial',
  finance:       'Finance',
  communication: 'Communication',
  rh:            'RH',
  reporting:     'Reporting',
  ecommerce:     'E-commerce',
};

const CATEGORY_COLORS = {
  commercial:    { bg: 'rgba(0,102,255,.14)',    color: '#60a5fa' },
  finance:       { bg: 'rgba(217,119,6,.14)',    color: '#fbbf24' },
  communication: { bg: 'rgba(5,150,105,.14)',    color: '#34d399' },
  rh:            { bg: 'rgba(124,58,237,.14)',   color: '#c4b5fd' },
  reporting:     { bg: 'rgba(13,148,136,.14)',   color: '#2dd4bf' },
  ecommerce:     { bg: 'rgba(249,115,22,.14)',   color: '#fb923c' },
};

/** Génère le HTML d'une icône d'application */
function _appBadge(key, size = 'md') {
  const app = APPS[key];
  if (!app) return '';
  const dim = size === 'lg' ? '46px' : '36px';
  const svgSize = size === 'lg' ? '20px' : '16px';
  return `
    <div class="alib-app" style="width:${dim};height:${dim};background:${app.color}" title="${app.label}">
      ${app.icon}
    </div>`;
}

/** Génère la ligne de flux App A → App B (+App C) */
function _flowRow(apps, size = 'md') {
  if (!apps || apps.length < 2) return '';
  const [a, b, c] = apps;
  let html = `<div class="alib-flow">`;
  html += _appBadge(a, size);
  html += `<div class="alib-connector"><span class="alib-dot"></span></div>`;
  html += _appBadge(b, size);
  if (c) {
    html += `<span class="alib-plus">+</span>`;
    html += _appBadge(c, size);
  }
  html += `</div>`;
  return html;
}

/** Génère le HTML complet d'une carte automatisation */
function renderCard(auto) {
  const cat    = CATEGORY_LABELS[auto.category] || auto.category;
  const colors = CATEGORY_COLORS[auto.category] || { bg: 'rgba(255,255,255,.1)', color: '#fff' };

  return `
<article class="alib-card alib-reveal"
  data-id="${auto.id}"
  data-cat="${auto.category}"
  data-keywords="${(auto.tags || []).join(' ')}"
  data-popular="${auto.popular ? '1' : '0'}"
  onclick="location.href='index.html#contact'"
  tabindex="0"
  role="button"
  aria-label="${auto.name}">

  ${_flowRow(auto.apps, 'md')}

  <div class="alib-body">
    <h3 class="alib-name">${auto.name}</h3>
    <p class="alib-desc">${auto.description}</p>
  </div>

  <div class="alib-sep"></div>

  <div class="alib-footer">
    <div class="alib-time">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ${auto.timeSaved}
    </div>
    <span class="alib-btn">
      Découvrir
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h12M8 2l5 5-5 5"/></svg>
    </span>
  </div>

  <div class="alib-cat-badge" style="background:${colors.bg};color:${colors.color}">${cat}</div>
</article>`;
}

/** Remplit un conteneur avec les cartes filtrées */
function renderGrid(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(renderCard).join('');
  _initCardInteractions(el);
}

/** Animation 3D tilt + keyboard support sur les cartes */
function _initCardInteractions(root) {
  root.querySelectorAll('.alib-card').forEach(card => {
    let raf = null;

    card.addEventListener('mousemove', e => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
        const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
        card.style.transform = `perspective(900px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateY(-8px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = '';
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        location.href = 'index.html#contact';
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   4. FILTRES + RECHERCHE
   ══════════════════════════════════════════════════════════════ */

let _currentCat = 'all';
let _currentQ   = '';

function _applyFilters() {
  const allCards = document.querySelectorAll('#all-grid .alib-card, #pop-grid .alib-card');
  let visible = 0;

  allCards.forEach(card => {
    const kw    = (card.dataset.keywords || '').toLowerCase();
    const cc    = card.dataset.cat || '';
    const okQ   = !_currentQ || kw.includes(_currentQ);
    const okCat = _currentCat === 'all' || cc === _currentCat;
    const show  = okQ && okCat;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  const noRes = document.getElementById('alib-no-results');
  if (noRes) noRes.style.display = visible ? 'none' : 'block';
}

function filterByCat(cat) {
  _currentCat = cat;
  document.querySelectorAll('.at-filter').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === cat)
  );
  _applyFilters();
  const sec = document.getElementById('automatisations') || document.getElementById('all-grid');
  if (sec) setTimeout(() => sec.scrollIntoView({ behavior: 'smooth' }), 80);
}

/* ══════════════════════════════════════════════════════════════
   5. INITIALISATION
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* — Rendu populaires — */
  const popular = AUTOMATIONS.filter(a => a.popular);
  renderGrid('pop-grid', popular);

  /* — Rendu toutes — */
  renderGrid('all-grid', AUTOMATIONS);

  /* — Compteur — */
  const countEl = document.getElementById('alib-count');
  if (countEl) countEl.textContent = AUTOMATIONS.length + '+';

  /* — Recherche — */
  const searchEl = document.getElementById('atSearch');
  const clearEl  = document.getElementById('atClear');

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      _currentQ = searchEl.value.toLowerCase().trim();
      clearEl && clearEl.classList.toggle('show', _currentQ.length > 0);
      _applyFilters();
      if (_currentQ.length > 1) {
        const grid = document.getElementById('all-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (clearEl) {
    clearEl.addEventListener('click', () => {
      if (searchEl) searchEl.value = '';
      _currentQ = '';
      clearEl.classList.remove('show');
      _applyFilters();
      searchEl && searchEl.focus();
    });
  }

  /* — Filtres catégorie — */
  document.querySelectorAll('.at-filter').forEach(btn => {
    btn.addEventListener('click', () => filterByCat(btn.dataset.cat));
  });

  /* — Reveal au scroll — */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('alib-visible');
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.alib-card').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 8) * 55}ms`;
    revObs.observe(el);
  });

});
