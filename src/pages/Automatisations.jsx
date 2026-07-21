import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Automatisations.css'

export default function Automatisations() {
  useEffect(() => {
    /* ══════════════════════════════════════════════════════════════
       1. APPLICATIONS
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
      gmail: {
        label: 'Gmail',
        color: '#EA4335',
        icon: `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>`,
      },
      gcal: {
        label: 'Google Calendar',
        color: '#4285F4',
        icon: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      },
      gforms: {
        label: 'Google Forms',
        color: '#7248B9',
        icon: `<svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="14" y2="16"/></svg>`,
      },
      gsheets: {
        label: 'Google Sheets',
        color: '#0F9D58',
        icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="3" x2="12" y2="21"/></svg>`,
      },
      gdrive: {
        label: 'Google Drive',
        color: '#4285F4',
        icon: `<svg viewBox="0 0 24 24"><path d="M22 17H2a3 3 0 014-4l6-10 6 10a3 3 0 014 4z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>`,
      },
      ai: {
        label: 'Intelligence IA',
        color: '#0066FF',
        icon: `<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      },
      apify: {
        label: 'Apify',
        color: '#00C2B2',
        icon: `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/></svg>`,
      },
      outlook: {
        label: 'Outlook',
        color: '#0078D4',
        icon: `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>`,
      },
      teams: {
        label: 'Microsoft Teams',
        color: '#5C2D91',
        icon: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
      },
      hubspot: {
        label: 'HubSpot',
        color: '#FF7A59',
        icon: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
      },
    };

    /* ══════════════════════════════════════════════════════════════
       2. AUTOMATISATIONS
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
        description: "Ajoutez un prospect sur LinkedIn pour déclencher automatiquement une séquence d'emails personnalisés sur 7 jours.",
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
        description: "Chaque lead entrant est assigné au bon commercial selon vos règles de routage et l'équipe est notifiée instantanément.",
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
        description: "À J+15 puis J+30, vos clients reçoivent une relance professionnelle et automatique. Plus d'oubli, plus de gêne.",
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
        description: "Publiez sur votre site et l'article est automatiquement partagé sur LinkedIn et envoyé à vos abonnés newsletter.",
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
        description: "Chaque message WhatsApp crée un ticket, l'assigne au bon interlocuteur et envoie un accusé de réception au client.",
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
        description: "Chaque candidature reçue génère un accusé de réception professionnel et propose des créneaux d'entretien automatiquement.",
        timeSaved: '3h / semaine',
        category: 'rh',
        apps: ['cand', 'email', 'cal'],
        popular: false,
        tags: ['candidature', 'recrutement', 'email', 'entretien', 'calendrier', 'rh', 'accusé'],
      },
      {
        id: 'onboarding-collaborateur',
        name: 'Nouveau collaborateur → Onboarding complet',
        description: "Création des accès outils, email de bienvenue, checklist J1 envoyée au manager — tout se déclenche automatiquement.",
        timeSaved: '4h / arrivée',
        category: 'rh',
        apps: ['notif', 'email', 'slack'],
        popular: false,
        tags: ['onboarding', 'collaborateur', 'accès', 'bienvenue', 'manager', 'rh', 'intégration'],
      },
      {
        id: 'conges-validation-planning',
        name: 'Congés demandés → Validation + Planning',
        description: "Les demandes de congés notifient le manager, déclenchent la validation et mettent à jour le planning d'équipe.",
        timeSaved: '1h / semaine',
        category: 'rh',
        apps: ['cal', 'email', 'slack'],
        popular: false,
        tags: ['congés', 'validation', 'planning', 'manager', 'rh', 'calendrier', 'notification'],
      },
      {
        id: 'offre-diffusion-multi',
        name: "Offre d'emploi → Diffusion multi-canaux",
        description: "Publiez une offre en un clic et elle est automatiquement diffusée sur LinkedIn, votre site et par newsletter interne.",
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
        description: "Vos indicateurs clés — CA, taux de conversion, coût d'acquisition — compilés et envoyés automatiquement à la direction.",
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
        description: "Chaque commande envoie une confirmation au client, crée son profil dans le CRM et alerte l'équipe logistique.",
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
      /* ── AUTOMATISATIONS DÉMO ─────────────────────────────────── */
      {
        id: 'gmail-calendar-slack',
        name: 'Gmail → Calendar → Slack',
        description: "Chaque email contenant une date ou une invitation est automatiquement transformé en événement Google Calendar et notifié dans Slack.",
        timeSaved: '3h / semaine',
        category: 'communication',
        apps: ['gmail', 'gcal', 'slack'],
        popular: true,
        href: 'auto-gmail-calendar-slack.html',
        tags: ['gmail', 'calendar', 'slack', 'email', 'agenda', 'réunion', 'notification', 'communication', 'google'],
      },
      {
        id: 'whatsapp-crm-email',
        name: 'WhatsApp → CRM → Email',
        description: 'Un prospect vous écrit sur WhatsApp ? En quelques secondes, il est ajouté au CRM et reçoit un email de bienvenue personnalisé.',
        timeSaved: '2h / semaine',
        category: 'commercial',
        apps: ['wa', 'crm', 'email'],
        popular: true,
        href: 'auto-whatsapp-crm-email.html',
        tags: ['whatsapp', 'crm', 'email', 'prospect', 'lead', 'commercial', 'bienvenue', 'message'],
      },
      {
        id: 'forms-sheets-devis',
        name: 'Google Forms → Sheets → Devis PDF',
        description: 'Votre prospect remplit le formulaire. En moins de 5 minutes, un devis PDF professionnel est généré et envoyé automatiquement.',
        timeSaved: '4h / semaine',
        category: 'finance',
        apps: ['gforms', 'gsheets', 'devis'],
        popular: true,
        href: 'auto-forms-sheets-devis.html',
        tags: ['formulaire', 'google forms', 'sheets', 'devis', 'pdf', 'finance', 'automatique', 'calcul'],
      },
      {
        id: 'linkedin-apify-crm',
        name: 'LinkedIn → Apify → CRM + Email',
        description: "Définissez votre cible sur LinkedIn. Apify extrait les profils. Votre CRM est alimenté et un email de prospection part automatiquement.",
        timeSaved: '5h / semaine',
        category: 'commercial',
        apps: ['li', 'apify', 'crm'],
        popular: true,
        href: 'auto-linkedin-apify-crm.html',
        tags: ['linkedin', 'apify', 'crm', 'prospection', 'b2b', 'leads', 'scraping', 'email', 'commercial'],
      },
      {
        id: 'stripe-facture-email',
        name: 'Stripe → Facture PDF → Email',
        description: "Dès qu'un paiement Stripe est confirmé, une facture conforme est générée et envoyée au client en quelques secondes — sans intervention.",
        timeSaved: 'Instantané',
        category: 'finance',
        apps: ['stripe', 'facture', 'email'],
        popular: true,
        href: 'auto-stripe-facture-email.html',
        tags: ['stripe', 'facture', 'pdf', 'paiement', 'email', 'finance', 'automatique', 'conformité'],
      },
      {
        id: 'drive-ia-classement',
        name: 'Google Drive → IA → Classement',
        description: "Chaque fichier déposé dans Drive est analysé par l'IA, renommé selon vos conventions et classé dans le bon dossier automatiquement.",
        timeSaved: '3h / semaine',
        category: 'reporting',
        apps: ['gdrive', 'ai', 'gsheets'],
        popular: false,
        href: 'auto-drive-ia-classement.html',
        tags: ['google drive', 'ia', 'classement', 'documents', 'organisation', 'fichiers', 'archivage', 'reporting'],
      },
      {
        id: 'outlook-teams-crm',
        name: 'Outlook → Teams → CRM',
        description: "Les emails clients dans Outlook sont automatiquement détectés, notifiés dans Teams et enregistrés dans votre CRM — sans manipulation manuelle.",
        timeSaved: '3h / semaine',
        category: 'communication',
        apps: ['outlook', 'teams', 'crm'],
        popular: false,
        href: 'auto-outlook-teams-crm.html',
        tags: ['outlook', 'teams', 'crm', 'microsoft', 'email', 'notification', 'communication', 'suivi', '365'],
      },
      {
        id: 'hubspot-slack-calendar',
        name: 'HubSpot → Slack → Calendar',
        description: "Quand un deal change d'étape dans HubSpot, votre équipe est alertée sur Slack et un suivi est automatiquement créé dans Google Calendar.",
        timeSaved: '2h / semaine',
        category: 'commercial',
        apps: ['hubspot', 'slack', 'gcal'],
        popular: false,
        href: 'auto-hubspot-slack-calendar.html',
        tags: ['hubspot', 'slack', 'calendar', 'crm', 'pipeline', 'deal', 'commercial', 'notification', 'vente'],
      },
    ];

    /* ══════════════════════════════════════════════════════════════
       3. MOTEUR DE RENDU
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

    function _appBadge(key, size) {
      size = size || 'md';
      const app = APPS[key];
      if (!app) return '';
      const dim = size === 'lg' ? '46px' : '36px';
      return `
        <div class="alib-app" style="width:${dim};height:${dim};background:${app.color}" title="${app.label}">
          ${app.icon}
        </div>`;
    }

    function _flowRow(apps, size) {
      size = size || 'md';
      if (!apps || apps.length < 2) return '';
      const a = apps[0], b = apps[1], c = apps[2];
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

    function renderCard(auto) {
      const cat    = CATEGORY_LABELS[auto.category] || auto.category;
      const colors = CATEGORY_COLORS[auto.category] || { bg: 'rgba(255,255,255,.1)', color: '#fff' };
      const dest   = auto.href ? auto.href : 'index.html#contact';

      return `
<article class="alib-card alib-reveal"
  data-id="${auto.id}"
  data-cat="${auto.category}"
  data-keywords="${(auto.tags || []).join(' ')}"
  data-popular="${auto.popular ? '1' : '0'}"
  onclick="location.href='${dest}'"
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
      ${auto.href ? 'Voir la fiche' : 'Découvrir'}
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h12M8 2l5 5-5 5"/></svg>
    </span>
  </div>

  <div class="alib-cat-badge" style="background:${colors.bg};color:${colors.color}">${cat}</div>
</article>`;
    }

    function renderGrid(containerId, items) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = items.map(renderCard).join('');
      _initCardInteractions(el);
    }

    function _initCardInteractions(root) {
      root.querySelectorAll('.alib-card').forEach(function(card) {
        let raf = null;

        card.addEventListener('mousemove', function(e) {
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(function() {
            const r = card.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
            const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
            card.style.transform = `perspective(900px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateY(-8px)`;
          });
        });

        card.addEventListener('mouseleave', function() {
          if (raf) cancelAnimationFrame(raf);
          card.style.transform = '';
        });

        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
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

      allCards.forEach(function(card) {
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
      document.querySelectorAll('.at-filter').forEach(function(b) {
        b.classList.toggle('active', b.dataset.cat === cat);
      });
      _applyFilters();
      const sec = document.getElementById('automatisations') || document.getElementById('all-grid');
      if (sec) setTimeout(function() { sec.scrollIntoView({ behavior: 'smooth' }); }, 80);
    }

    /* ══════════════════════════════════════════════════════════════
       5. INITIALISATION
       ══════════════════════════════════════════════════════════════ */

    /* — Rendu populaires — */
    const popular = AUTOMATIONS.filter(function(a) { return a.popular; });
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
      searchEl.addEventListener('input', function() {
        _currentQ = searchEl.value.toLowerCase().trim();
        if (clearEl) clearEl.classList.toggle('show', _currentQ.length > 0);
        _applyFilters();
        if (_currentQ.length > 1) {
          const grid = document.getElementById('all-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    if (clearEl) {
      clearEl.addEventListener('click', function() {
        if (searchEl) searchEl.value = '';
        _currentQ = '';
        clearEl.classList.remove('show');
        _applyFilters();
        if (searchEl) searchEl.focus();
      });
    }

    /* — Filtres catégorie — */
    document.querySelectorAll('.at-filter').forEach(function(btn) {
      btn.addEventListener('click', function() { filterByCat(btn.dataset.cat); });
    });

    /* — Reveal alib cards au scroll — */
    const revObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('alib-visible');
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.alib-card').forEach(function(el, i) {
      el.style.transitionDelay = `${(i % 8) * 55}ms`;
      revObs.observe(el);
    });

    /* ── Canvas particles ── */
    let canvasAnimId = null;
    const canvasResizeHandler = (function(){
      const cv = document.getElementById('atCanvas');
      if (!cv) return null;
      const cx = cv.getContext('2d');
      let W, H, pts = [];
      const N = 55, LK = 115;
      function resize(){ W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
      window.addEventListener('resize', resize, {passive:true}); resize();
      function r(a,b){ return a + Math.random()*(b-a); }
      for(let i=0;i<N;i++) pts.push({x:r(0,W),y:r(0,H),vx:r(-.22,.22),vy:r(-.22,.22),s:r(.9,1.8)});
      function frame(){
        cx.clearRect(0,0,W,H);
        pts.forEach(function(p){
          p.x+=p.vx; p.y+=p.vy;
          if(p.x<0)p.x=W; if(p.x>W)p.x=0;
          if(p.y<0)p.y=H; if(p.y>H)p.y=0;
          cx.beginPath(); cx.arc(p.x,p.y,p.s,0,Math.PI*2);
          cx.fillStyle='rgba(0,102,255,.45)'; cx.fill();
        });
        for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){
          const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<LK){
            cx.beginPath(); cx.moveTo(pts[i].x,pts[i].y); cx.lineTo(pts[j].x,pts[j].y);
            cx.strokeStyle=`rgba(0,102,255,${.09*(1-d/LK)})`; cx.lineWidth=1; cx.stroke();
          }
        }
        canvasAnimId = requestAnimationFrame(frame);
      }
      frame();
      return resize;
    })();

    /* ── Mouse parallax halos ── */
    const h1=document.getElementById('halo1'), h2=document.getElementById('halo2'), h3=document.getElementById('halo3');
    let t1x=0,t1y=0,t2x=0,t2y=0,t3x=0,t3y=0;
    let c1x=0,c1y=0,c2x=0,c2y=0,c3x=0,c3y=0,haloRaf=null;
    function lerp(a,b,t){return a+(b-a)*t;}
    function haloTick(){
      haloRaf=null;
      c1x=lerp(c1x,t1x,.06);c1y=lerp(c1y,t1y,.06);
      c2x=lerp(c2x,t2x,.04);c2y=lerp(c2y,t2y,.04);
      c3x=lerp(c3x,t3x,.05);c3y=lerp(c3y,t3y,.05);
      if(h1) h1.style.transform=`translate(${c1x}px,${c1y}px)`;
      if(h2) h2.style.transform=`translate(${c2x}px,${c2y}px)`;
      if(h3) h3.style.transform=`translate(${c3x}px,${c3y}px)`;
      const done=Math.abs(c1x-t1x)<.4&&Math.abs(c1y-t1y)<.4;
      if(!done) haloRaf=requestAnimationFrame(haloTick);
    }
    function haloMove(e){
      const mx=(e.clientX/window.innerWidth-.5)*2, my=(e.clientY/window.innerHeight-.5)*2;
      t1x=mx*-26;t1y=my*-16; t2x=mx*16;t2y=my*12; t3x=mx*-12;t3y=my*-20;
      if(!haloRaf) haloRaf=requestAnimationFrame(haloTick);
    }
    if(h1) window.addEventListener('mousemove', haloMove, {passive:true});

    /* ── Scroll reveal (.at-reveal) ── */
    const revEls = document.querySelectorAll('.at-reveal');
    const scrollRevObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          const delay = (e.target.closest('.at-grid') || e.target.closest('.at-pop-grid'))
            ? Array.from(revEls).indexOf(e.target)*55 : 0;
          setTimeout(function(){ e.target.classList.add('visible'); }, delay);
          scrollRevObs.unobserve(e.target);
        }
      });
    },{threshold:0.10});
    revEls.forEach(function(el){ scrollRevObs.observe(el); });

    /* ── FAQ accordion ── */
    document.querySelectorAll('.at-faq-q').forEach(function(btn){
      btn.addEventListener('click',function(){
        const item = btn.closest('.at-faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.at-faq-item.open').forEach(function(i){
          i.classList.remove('open');
          i.querySelector('.at-faq-a').style.maxHeight='0';
          i.querySelector('.at-faq-q').setAttribute('aria-expanded','false');
        });
        if(!isOpen){
          item.classList.add('open');
          btn.setAttribute('aria-expanded','true');
          item.querySelector('.at-faq-a').style.maxHeight = item.querySelector('.at-faq-a-inner').offsetHeight+'px';
        }
      });
    });

    return function() {
      if(h1) window.removeEventListener('mousemove', haloMove);
      if(canvasAnimId) cancelAnimationFrame(canvasAnimId);
    };
  }, [])

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
           HERO
           ════════════════════════════════════════════════════════════ */}
      <section className="at-hero">
        <canvas className="at-canvas" id="atCanvas" aria-hidden="true"></canvas>
        <div className="at-grid-bg" aria-hidden="true"></div>
        <div className="at-halo at-halo-1" id="halo1" aria-hidden="true"></div>
        <div className="at-halo at-halo-2" id="halo2" aria-hidden="true"></div>
        <div className="at-halo at-halo-3" id="halo3" aria-hidden="true"></div>

        <div className="at-hero-inner">
          <p className="at-kicker at-a0"><span></span>Intelligence Artificielle · Automatisations<span></span></p>

          <h1 className="at-a1">
            Vous perdez 15 heures<br />
            <em>par semaine. On les récupère.</em>
          </h1>

          <p className="at-hero-sub at-a2">
            Relances oubliées. Saisies en double. Rapports jamais à jour. Transferts manuels. On s'en occupe — en 48h.
            Activez-les en 48h — sans code, sans formation, sans effort.
          </p>

          {/* Search */}
          <div className="at-search-wrap at-a3">
            <div className="at-search-icon">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <input
              type="text"
              className="at-search"
              id="atSearch"
              placeholder='Rechercher… ex : "devis", "relance", "leads"'
              autoComplete="off"
              spellCheck={false}
            />
            <button className="at-search-clear" id="atClear" aria-label="Effacer">✕</button>
          </div>

          {/* Category filters */}
          <div className="at-filters at-a4">
            <button className="at-filter active" data-cat="all">Tous</button>
            <button className="at-filter" data-cat="commercial">Commercial &amp; Vente</button>
            <button className="at-filter" data-cat="finance">Finance &amp; Devis</button>
            <button className="at-filter" data-cat="communication">Communication</button>
            <button className="at-filter" data-cat="rh">RH &amp; Recrutement</button>
            <button className="at-filter" data-cat="reporting">Reporting</button>
            <button className="at-filter" data-cat="ecommerce">Site &amp; E-commerce</button>
          </div>

          {/* Stats */}
          <div className="at-stats at-a4">
            <div>
              <div className="at-stat-val">40<em>+</em></div>
              <div className="at-stat-lbl">Processus automatisés</div>
            </div>
            <div>
              <div className="at-stat-val">48<em>h</em></div>
              <div className="at-stat-lbl">Pour être opérationnel</div>
            </div>
            <div>
              <div className="at-stat-val">15<em>h</em></div>
              <div className="at-stat-lbl">Récupérées chaque semaine</div>
            </div>
            <div>
              <div className="at-stat-val">120<em>+</em></div>
              <div className="at-stat-lbl">Dirigeants libérés</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
           CATÉGORIES
           ════════════════════════════════════════════════════════════ */}
      <section className="at-section dark">
        <div className="sec-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop&q=60&auto=format')", opacity: .10 }} aria-hidden="true"></div>
        <div className="at-section-inner">
          <div className="at-sec-head at-reveal">
            <p className="at-sec-label">Parcourir par catégorie</p>
            <h2 className="at-sec-h">Trouvez votre <em>automatisation idéale.</em></h2>
          </div>

          <div className="at-cats-grid">

            <button className="at-cat-card at-reveal" data-cat="commercial">
              <div className="at-cat-icon" style={{ background: 'linear-gradient(135deg,rgba(0,66,130,.6),rgba(0,102,255,.4))' }}>
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.06 1.22 2 2 0 012 0h3a2 2 0 012 1.72 12.13 12.13 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.13 12.13 0 002.81.7A2 2 0 0122 16.92z" /></svg>
              </div>
              <div className="at-cat-name">Commercial &amp; Vente</div>
              <div className="at-cat-count">8 automatisations</div>
            </button>

            <button className="at-cat-card at-reveal" data-cat="finance">
              <div className="at-cat-icon" style={{ background: 'linear-gradient(135deg,rgba(92,40,2,.6),rgba(217,119,6,.4))' }}>
                <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              </div>
              <div className="at-cat-name">Finance &amp; Devis</div>
              <div className="at-cat-count">7 automatisations</div>
            </button>

            <button className="at-cat-card at-reveal" data-cat="communication">
              <div className="at-cat-icon" style={{ background: 'linear-gradient(135deg,rgba(4,78,57,.6),rgba(5,150,105,.4))' }}>
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              </div>
              <div className="at-cat-name">Communication</div>
              <div className="at-cat-count">6 automatisations</div>
            </button>

            <button className="at-cat-card at-reveal" data-cat="rh">
              <div className="at-cat-icon" style={{ background: 'linear-gradient(135deg,rgba(59,21,113,.6),rgba(124,58,237,.4))' }}>
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              </div>
              <div className="at-cat-name">RH &amp; Recrutement</div>
              <div className="at-cat-count">5 automatisations</div>
            </button>

            <button className="at-cat-card at-reveal" data-cat="reporting">
              <div className="at-cat-icon" style={{ background: 'linear-gradient(135deg,rgba(13,68,64,.6),rgba(13,148,136,.4))' }}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
              </div>
              <div className="at-cat-name">Reporting</div>
              <div className="at-cat-count">6 automatisations</div>
            </button>

            <button className="at-cat-card at-reveal" data-cat="ecommerce">
              <div className="at-cat-icon" style={{ background: 'linear-gradient(135deg,rgba(90,33,8,.6),rgba(234,88,12,.4))' }}>
                <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.42H6" /></svg>
              </div>
              <div className="at-cat-name">Site &amp; E-commerce</div>
              <div className="at-cat-count">4 automatisations</div>
            </button>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
           AUTOMATISATIONS POPULAIRES
           ════════════════════════════════════════════════════════════ */}
      <section className="at-section darker" id="automatisations">
        <div className="sec-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&h=900&fit=crop&q=60&auto=format')", opacity: .13 }} aria-hidden="true"></div>
        <div className="at-section-inner">
          <div className="at-sec-head at-reveal">
            <p className="at-sec-label">Les plus utilisées</p>
            <h2 className="at-sec-h">Automatisations <em>populaires.</em></h2>
            <p className="at-sec-desc">Les scénarios que nos clients activent en premier — parce qu'ils rapportent le plus vite.</p>
          </div>

          <div id="pop-grid" className="at-pop-grid"></div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
           TOUTES LES AUTOMATISATIONS
           ════════════════════════════════════════════════════════════ */}
      <section className="at-section dark" id="toutes">
        <div className="sec-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=900&fit=crop&q=60&auto=format')", opacity: .10 }} aria-hidden="true"></div>
        <div className="at-section-inner">
          <div className="at-sec-head at-reveal">
            <p className="at-sec-label">Catalogue complet</p>
            <h2 className="at-sec-h">Toutes les <em>automatisations.</em></h2>
            <p className="at-sec-desc">Filtrez par catégorie ou utilisez la recherche en haut de page pour trouver exactement ce qu'il vous faut.</p>
          </div>

          <div id="all-grid" className="at-grid"></div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
           POURQUOI CA-TECH
           ════════════════════════════════════════════════════════════ */}
      <section className="at-section darker">
        <div className="sec-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop&q=60&auto=format')", opacity: .12 }} aria-hidden="true"></div>
        <div className="at-section-inner">
          <div className="at-sec-head at-reveal">
            <p className="at-sec-label">Notre différence</p>
            <h2 className="at-sec-h">Ce que vous obtenez <em>concrètement.</em></h2>
            <p className="at-sec-desc">Pas un abonnement SaaS. Pas un tutoriel. Une équipe qui comprend votre métier et automatise exactement ce qui vous coûte du temps.</p>
          </div>

          <div className="at-why-grid">
            <div className="at-why-card at-reveal">
              <div className="at-why-icon">
                <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <h4>Opérationnel en 48h</h4>
              <p>Vous récupérez du temps dans les 2 jours. Pas dans 2 mois. Pas après une formation interminable. Maintenant.</p>
            </div>
            <div className="at-why-card at-reveal">
              <div className="at-why-icon">
                <svg viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
              </div>
              <h4>Adapté à votre métier</h4>
              <p>Vos outils, votre secteur, vos habitudes. On s'adapte à vous — pas l'inverse. Aucune solution générique imposée.</p>
            </div>
            <div className="at-why-card at-reveal">
              <div className="at-why-icon">
                <svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>
              </div>
              <h4>Vous n'êtes jamais seul</h4>
              <p>On configure. On monitore. On corrige. Si quelque chose déraille, on intervient sous 4h — avant même que vous le remarquiez.</p>
            </div>
            <div className="at-why-card at-reveal">
              <div className="at-why-icon">
                <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              </div>
              <h4>Rentable dès le 1er mois</h4>
              <p>15 heures récupérées par semaine. Des devis envoyés sans y penser. Des relances qui partent seules. Vous voyez la différence avant la fin du mois.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
           FAQ
           ════════════════════════════════════════════════════════════ */}
      <section className="at-section dark">
        <div className="sec-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1600&h=900&fit=crop&q=60&auto=format')", opacity: .08 }} aria-hidden="true"></div>
        <div className="at-section-inner">
          <div className="at-sec-head at-reveal">
            <p className="at-sec-label">Questions fréquentes</p>
            <h2 className="at-sec-h">Tout ce que vous <em>voulez savoir.</em></h2>
          </div>

          <div className="at-faq-list">

            <div className="at-faq-item at-reveal">
              <button className="at-faq-q" aria-expanded="false">
                <span className="at-faq-q-text">Faut-il des connaissances techniques pour utiliser vos automatisations ?</span>
                <div className="at-faq-icon"><svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></div>
              </button>
              <div className="at-faq-a">
                <div className="at-faq-a-inner">Non, absolument aucune. Notre équipe s'occupe de tout — de l'analyse de vos besoins jusqu'au déploiement et au monitoring. Vous décrivez votre processus en français, nous le configurons. Aucune ligne de code n'est requise de votre côté.</div>
              </div>
            </div>

            <div className="at-faq-item at-reveal">
              <button className="at-faq-q" aria-expanded="false">
                <span className="at-faq-q-text">Combien de temps faut-il pour déployer une automatisation ?</span>
                <div className="at-faq-icon"><svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></div>
              </button>
              <div className="at-faq-a">
                <div className="at-faq-a-inner">La plupart de nos automatisations sont opérationnelles en 24 à 48 heures. Pour les scénarios complexes impliquant plusieurs outils ou des règles métier avancées, comptez 3 à 5 jours. Nous validons toujours le fonctionnement avec vous avant la mise en production.</div>
              </div>
            </div>

            <div className="at-faq-item at-reveal">
              <button className="at-faq-q" aria-expanded="false">
                <span className="at-faq-q-text">Quels outils et logiciels sont compatibles ?</span>
                <div className="at-faq-icon"><svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></div>
              </button>
              <div className="at-faq-a">
                <div className="at-faq-a-inner">Nous sommes compatibles avec plus de 200 outils : Gmail, Outlook, HubSpot, Salesforce, Notion, Slack, Stripe, Shopify, WooCommerce, WordPress, Airtable, LinkedIn, Google Sheets, Pipedrive, et bien d'autres. Si vous utilisez un outil spécifique, demandez-nous — nous l'avons probablement déjà intégré.</div>
              </div>
            </div>

            <div className="at-faq-item at-reveal">
              <button className="at-faq-q" aria-expanded="false">
                <span className="at-faq-q-text">Que se passe-t-il si une automatisation échoue ou ne fonctionne pas ?</span>
                <div className="at-faq-icon"><svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></div>
              </button>
              <div className="at-faq-a">
                <div className="at-faq-a-inner">Nos automatisations sont monitorées en temps réel. En cas d'erreur, vous êtes alerté immédiatement par email ou Slack, et notre équipe technique intervient sous 4 heures en jours ouvrés. Toutes les actions sont aussi enregistrées dans un journal pour audit complet.</div>
              </div>
            </div>

            <div className="at-faq-item at-reveal">
              <button className="at-faq-q" aria-expanded="false">
                <span className="at-faq-q-text">Peut-on faire évoluer une automatisation après le déploiement ?</span>
                <div className="at-faq-icon"><svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></div>
              </button>
              <div className="at-faq-a">
                <div className="at-faq-a-inner">Oui, vos automatisations évoluent avec votre activité. Ajout d'un nouvel outil, modification des critères de déclenchement, nouvelles règles de routage — tout est ajustable à tout moment sur simple demande. Nous recommandons d'ailleurs une révision trimestrielle pour optimiser les performances.</div>
              </div>
            </div>

            <div className="at-faq-item at-reveal">
              <button className="at-faq-q" aria-expanded="false">
                <span className="at-faq-q-text">Quel est le modèle tarifaire ?</span>
                <div className="at-faq-icon"><svg viewBox="0 0 14 14"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></div>
              </button>
              <div className="at-faq-a">
                <div className="at-faq-a-inner">Chaque automatisation est proposée avec une mise en place unique (selon la complexité) et un abonnement mensuel de maintenance qui inclut le monitoring, les corrections et les ajustements. Nous établissons un devis personnalisé selon votre situation. Demandez une démonstration gratuite pour obtenir une estimation.</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
           CTA FINAL
           ════════════════════════════════════════════════════════════ */}
      <section className="at-cta">
        <div className="at-cta-inner at-reveal">
          <p className="at-cta-kicker">Passez à l'action</p>
          <h2>Récupérez <strong>15 heures cette semaine.</strong></h2>
          <p>Dites-nous ce qui vous prend le plus de temps. On s'en occupe — opérationnel en 48h, résultats visibles ce mois-ci.</p>
          <div className="at-cta-btns">
            <Link to="/contact" className="btn-cta-white">Demander une démonstration gratuite →</Link>
            <a
              href="#automatisations"
              className="btn-cta-outline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('automatisations').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Revoir les automatisations
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
