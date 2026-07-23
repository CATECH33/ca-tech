import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DetailDrawer from '../components/DetailDrawer'
import './Automatisations.css'

/* ══════════════════════════════════════════════════════════
   LOGOS SVG (inline)
══════════════════════════════════════════════════════════ */
const L = {
  'google-workspace': (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M24 20v7h11c-.5 2.5-2 4.7-4.2 6.1l6.6 5.1C41 34.6 43 29.7 43 24c0-1.4-.1-2.8-.4-4H24z" fill="#4285F4"/>
      <path d="M11.5 28.1l-1.5 1.2L4.3 33C7.5 39.3 15.2 43.5 24 43.5c5.6 0 10.3-1.9 13.8-5.1l-6.6-5.1c-1.9 1.3-4.3 2-7.2 2-5.5 0-10.2-3.7-11.9-8.7l-.6.5z" fill="#34A853"/>
      <path d="M4.3 15C3 17.6 2.5 20.6 2.5 24s.5 6.4 1.8 9l7.2-5.6c-.4-1.3-.6-2.5-.6-3.9s.2-2.6.6-3.9L4.3 15z" fill="#FBBC05"/>
      <path d="M24 10.5c3.1 0 5.9 1.1 8.1 3.2l6.1-6.1C34.5 4.2 29.6 2.5 24 2.5 15.2 2.5 7.5 6.7 4.3 13l7.2 5.6C13 13.8 18 10.5 24 10.5z" fill="#EA4335"/>
    </svg>
  ),
  'microsoft-365': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3"  width="19" height="19" rx="2" fill="#F25022"/>
      <rect x="26" y="3" width="19" height="19" rx="2" fill="#7FBA00"/>
      <rect x="3" y="26" width="19" height="19" rx="2" fill="#00A4EF"/>
      <rect x="26" y="26" width="19" height="19" rx="2" fill="#FFB900"/>
    </svg>
  ),
  'whatsapp': (
    <svg viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#25D366"/>
      <path d="M34.5 28.1c-.6-.3-3.4-1.7-4-1.9-.5-.2-.9-.3-1.3.3-.4.6-1.7 1.9-2.1 2.2-.4.4-.7.4-1.3.1-.6-.3-2.5-.9-4.7-2.9-1.7-1.6-2.9-3.5-3.2-4.1-.4-.6 0-.9.3-1.2l.8-.9c.2-.3.3-.6.5-1 .2-.3.1-.6-.1-.9-.2-.3-1.3-3.2-1.8-4.3-.5-1.1-1-.9-1.4-.9h-1.1c-.4 0-.9.1-1.4.7-.5.6-1.9 1.8-1.9 4.5s2 5.2 2.2 5.6c.2.4 3.8 5.8 9.2 8.1 1.3.6 2.3.9 3.1 1.1 1.3.4 2.5.3 3.4.2 1-.1 3.2-1.3 3.7-2.7.5-1.3.5-2.4.3-2.6z" fill="white"/>
    </svg>
  ),
  'slack': (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M17 29.5A3.5 3.5 0 0113.5 26V14a3.5 3.5 0 017 0v12a3.5 3.5 0 01-3.5 3.5z" fill="#E01E5A"/>
      <path d="M31 34.5A3.5 3.5 0 0127.5 31V19a3.5 3.5 0 017 0v12a3.5 3.5 0 01-3.5 3.5z" fill="#36C5F0"/>
      <path d="M20 34.5a3.5 3.5 0 01-3.5-3.5v-3.5H24a3.5 3.5 0 010 7H20z" fill="#2EB67D"/>
      <path d="M21.5 17A3.5 3.5 0 0125 13.5h3.5V17A3.5 3.5 0 0121.5 17z" fill="#ECB22E"/>
      <path d="M28 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" fill="#2EB67D"/>
      <path d="M17 41.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" fill="#ECB22E"/>
      <path d="M12.5 20.5H9a3.5 3.5 0 000 7h3.5v-7z" fill="#E01E5A"/>
      <path d="M27.5 27.5H31a3.5 3.5 0 000-7h-3.5v7z" fill="#36C5F0"/>
    </svg>
  ),
  'hubspot': (
    <svg viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#FF7A59"/>
      <circle cx="31" cy="17" r="5" fill="white"/>
      <circle cx="31" cy="17" r="2.5" fill="#FF7A59"/>
      <path d="M26 17h-8v3h8v-3z" fill="white"/>
      <circle cx="18" cy="24" r="8" fill="white"/>
      <circle cx="18" cy="24" r="4" fill="#FF7A59"/>
    </svg>
  ),
  'notion': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="6" fill="#191919"/>
      <path d="M14 12h16l8 10v14H34V22l-8-8H14V12z" fill="white"/>
      <rect x="14" y="12" width="3" height="22" fill="#191919"/>
      <rect x="14" y="32" width="20" height="2" fill="white"/>
    </svg>
  ),
  'stripe': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#635BFF"/>
      <path d="M22 18c0-1.3 1.1-1.8 2.8-1.8 2.5 0 5.6.8 8 2V11c-2.6-1.4-5.3-2-8-2-6.4 0-10.7 3.3-10.7 9 0 8.7 12 7.3 12 11 0 1.5-1.4 2-3.2 2-2.7 0-6.1-1.1-8.8-2.6v6.7c3 1.3 6 1.8 8.8 1.8 6.5 0 11-3.2 11-8.8C33.9 19.3 22 21 22 18z" fill="white"/>
    </svg>
  ),
  'meta': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#0082FB"/>
      <path d="M10 30c0 2.8 1.8 5 4.2 5S18 32.8 18 30V23c0-2.8-1.8-5-3.8-5S10 20.2 10 23v7zm3-7c0-1.5.8-2.5 1.8-2.5S17 21.5 17 23v7c0 1.5-.8 2.5-1.8 2.5S13 31.5 13 30v-7z" fill="white"/>
      <path d="M24 18c0-2.8 1.9-5 4.3-5 1.8 0 3.4 1.1 4.1 2.7.7-1.7 2.3-2.7 4.1-2.7v3c-1.4 0-2 1-2 2.5v8.5h-3V22c0-1.4-.8-2.5-2-2.5S27 20.6 27 22v7c0 2.8-1.9 5-4.3 5S18 31.7 18 29v-5h3v5c0 1.4.8 2.5 2 2.5s2-1.1 2-2.5V18z" fill="white"/>
    </svg>
  ),
  'linkedin': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="8" fill="#0A66C2"/>
      <rect x="10" y="19" width="7" height="19" fill="white"/>
      <circle cx="13.5" cy="13.5" r="4" fill="white"/>
      <path d="M26 26.5c0-2 1.4-3.5 3.5-3.5S33 24.5 33 26.5V38h7V25.5c0-5.5-3.5-8.5-8-8.5-2.5 0-4.5 1-6 2.8V17h-7v21h7v-11.5z" fill="white"/>
    </svg>
  ),
  'calendly': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#006BFF"/>
      <rect x="10" y="17" width="28" height="22" rx="3" fill="white"/>
      <rect x="10" y="13" width="28" height="8" rx="3" fill="#4BA3FF"/>
      <path d="M19 30l3.5 3.5L30 26" stroke="#006BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'apify': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#00C2B2"/>
      <path d="M14 36L24 12l10 24H14z" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
      <line x1="17.5" y1="28" x2="30.5" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  'google-maps': (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M24 4C16.3 4 10 10.3 10 18c0 9.5 14 26 14 26s14-16.5 14-26c0-7.7-6.3-14-14-14z" fill="#EA4335"/>
      <circle cx="24" cy="18" r="6" fill="white"/>
      <circle cx="24" cy="18" r="3" fill="#EA4335"/>
      <ellipse cx="24" cy="42" rx="7" ry="2.5" fill="#34A853" opacity="0.4"/>
    </svg>
  ),
  'telegram': (
    <svg viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#2AABEE"/>
      <path d="M35.6 13.4L7.5 24.5c-1.9.8-1.9 1.9-.3 2.4l7 2.2 2.7 8.4c.3 1 .6 1.4 1.4 1.4.6 0 .9-.3 1.3-.7l3.1-3 6.4 4.7c1.2.7 2 .3 2.3-.9l4.2-19.8c.4-1.9-.7-2.8-2-2.2z" fill="white"/>
      <path d="M16.7 28.5l12.5-7.8L19.8 30.8l-.5 3.4-2.6-5.7z" fill="#CAE9F5"/>
    </svg>
  ),
  'discord': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#5865F2"/>
      <path d="M34 15.5A27 27 0 0027.4 13.5c-.3.5-.6 1.2-.8 1.8a25 25 0 00-6.8 0 16 16 0 00-.9-1.8 27 27 0 00-6.6 2c-4.1 6.2-5.2 12.2-4.7 18.1a27.5 27.5 0 008.3 4.2c.7-.9 1.3-2 1.8-3.1a17.6 17.6 0 01-2.8-1.4l.7-.5c5.4 2.5 11.2 2.5 16.4 0l.7.5c-.9.5-1.9 1-2.9 1.4.5 1.1 1.1 2.2 1.8 3.1a27.4 27.4 0 008.3-4.2c.7-7-1.1-13-4.9-18.1zM19.2 30c-1.5 0-2.7-1.4-2.7-3.1s1.2-3.1 2.7-3.1 2.8 1.4 2.7 3.1c0 1.7-1.2 3.1-2.7 3.1zm9.6 0c-1.5 0-2.7-1.4-2.7-3.1s1.2-3.1 2.7-3.1 2.8 1.4 2.7 3.1c0 1.7-1.2 3.1-2.7 3.1z" fill="white"/>
    </svg>
  ),
}

/* ══════════════════════════════════════════════════════════
   DONNÉES — 14 INTÉGRATIONS enrichies
══════════════════════════════════════════════════════════ */
const INTEGRATIONS = [
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    category: 'google',
    color: '#4285F4',
    desc: 'Gmail, Drive, Sheets, Calendar et Forms connectés à l\'ensemble de vos outils métier.',
    useCases: [
      'Email entrant → Lead CRM + réponse automatique',
      'Formulaire → Fiche Sheets + alerte Slack',
      'Fichier Drive → Classement IA + notification équipe',
    ],
    timeSaved: '−8h / semaine',
    apps: ['Gmail', 'Google Forms', 'Google Drive', 'Google Sheets', 'HubSpot', 'Slack'],
    workflow: [
      { label: 'Email Gmail reçu', type: 'trigger' },
      { label: 'Analyse IA du message', type: 'action' },
      { label: 'Lead créé dans le CRM', type: 'action' },
      { label: 'Réponse + alerte Slack', type: 'result' },
    ],
    declencheur: 'Réception d\'un email dans Gmail ou soumission d\'un formulaire Google Forms',
    actionsRealisees: [
      'Extraction automatique des coordonnées et du contexte',
      'Création ou mise à jour de la fiche dans votre CRM',
      'Envoi d\'une réponse personnalisée en moins de 5 min',
      'Notification dans le canal Slack #commercial',
      'Classement automatique du fichier Drive associé',
    ],
    benefices: [
      'Zéro lead perdu — chaque message déclenche une action',
      'Réponse client sous 5 minutes, 24h/24 7j/7',
      'CRM toujours à jour, zéro saisie manuelle',
    ],
    frequence: 'En temps réel — déclenché à chaque email entrant ou soumission de formulaire',
    prerequis: ['Compte Google Workspace actif', 'Accès API Google activé (2 min)', 'CRM connecté — HubSpot, Pipedrive ou autre'],
    faq: [
      {
        q: 'Fonctionne-t-il avec un Gmail personnel ?',
        a: 'Oui, mais nous recommandons Google Workspace pour la fiabilité des intégrations avancées. La mise en place est identique.',
      },
      {
        q: 'Peut-on traiter plusieurs boîtes email en même temps ?',
        a: 'Oui — on configure autant d\'alias ou de boîtes que nécessaire, chacun avec son propre workflow et ses propres règles.',
      },
    ],
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    category: 'microsoft',
    color: '#0078D4',
    desc: 'Outlook, Teams, OneDrive et SharePoint intégrés dans vos workflows métier sans effort.',
    useCases: [
      'Email Outlook → Lead CRM + alerte Teams',
      'Réunion Teams → Compte-rendu auto Notion',
      'Fichier OneDrive → Classement et archivage auto',
    ],
    timeSaved: '−6h / semaine',
    apps: ['Outlook', 'Microsoft Teams', 'OneDrive', 'SharePoint', 'Notion', 'Slack'],
    workflow: [
      { label: 'Email Outlook reçu', type: 'trigger' },
      { label: 'Qualification IA', type: 'action' },
      { label: 'CRM mis à jour', type: 'action' },
      { label: 'Alerte Teams + note auto', type: 'result' },
    ],
    declencheur: 'Réception d\'un email dans Outlook ou fin d\'une réunion Microsoft Teams',
    actionsRealisees: [
      'Extraction des coordonnées et du contexte du message',
      'Création ou mise à jour de la fiche CRM',
      'Notification dans le canal Teams approprié',
      'Génération automatique du compte-rendu de réunion dans Notion',
      'Archivage intelligent dans OneDrive avec nommage automatique',
    ],
    benefices: [
      'Zéro saisie manuelle dans le CRM depuis Outlook',
      'Comptes-rendus de réunion disponibles en 30 secondes',
      'Visibilité équipe complète sur les échanges clients',
    ],
    frequence: 'En temps réel pour les emails — automatique après chaque réunion Teams',
    prerequis: ['Abonnement Microsoft 365 Business', 'Droits administrateur pour les intégrations API', 'CRM compatible'],
    faq: [
      {
        q: 'Compatible avec toutes les versions de Microsoft 365 ?',
        a: 'Oui, à partir de Microsoft 365 Business Basic. Les fonctions Teams avancées nécessitent Business Standard ou supérieur.',
      },
      {
        q: 'Peut-on exclure certains expéditeurs ou types d\'emails ?',
        a: 'Absolument — on configure des règles de filtrage par expéditeur, objet, domaine ou mots-clés pour ne traiter que ce qui vous intéresse.',
      },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'communication',
    color: '#25D366',
    desc: 'Transformez chaque message WhatsApp en lead qualifié et gérez le support client 24/7.',
    useCases: [
      'Message entrant → Ticket support + assignation',
      'Prospect → CRM + email de bienvenue immédiat',
      'Commande → Confirmation livraison automatique',
    ],
    timeSaved: '−4h / semaine',
    apps: ['WhatsApp Business API', 'HubSpot', 'Slack', 'Gmail'],
    workflow: [
      { label: 'Message WhatsApp entrant', type: 'trigger' },
      { label: 'Analyse et qualification IA', type: 'action' },
      { label: 'Fiche CRM créée ou mise à jour', type: 'action' },
      { label: 'Réponse automatique envoyée', type: 'result' },
    ],
    declencheur: 'Réception d\'un message ou d\'une demande via WhatsApp Business',
    actionsRealisees: [
      'Identification automatique du contact (prospect, client ou inconnu)',
      'Création ou mise à jour de la fiche CRM avec l\'historique de la conversation',
      'Réponse automatique personnalisée envoyée dans les 10 secondes',
      'Création d\'un ticket support si demande de SAV',
      'Notification à l\'agent assigné via Slack',
    ],
    benefices: [
      'Temps de réponse < 10 secondes même la nuit et le week-end',
      'Aucun message sans suite — chaque demande est traitée',
      'Satisfaction client améliorée grâce à la réactivité',
    ],
    frequence: 'En temps réel — dès réception du message',
    prerequis: ['Compte WhatsApp Business vérifié', 'Accès à l\'API WhatsApp Business (Meta)', 'Numéro de téléphone dédié'],
    faq: [
      {
        q: 'Faut-il l\'API officielle WhatsApp Business ?',
        a: 'Oui, pour les automatisations avancées. On vous aide à obtenir l\'accès API en quelques jours si vous ne l\'avez pas encore.',
      },
      {
        q: 'Peut-on répondre manuellement quand on le souhaite ?',
        a: 'Oui — l\'IA prend le relais uniquement si aucun agent n\'a répondu dans un délai que vous définissez (ex. 5 min).',
      },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    color: '#4A154B',
    desc: 'Centralisez toutes vos alertes métier et notifications dans les bons canaux Slack.',
    useCases: [
      'Nouveau lead → Alerte canal #commercial en temps réel',
      'Paiement reçu → Notification automatique #finance',
      'Rapport 18h → Résumé quotidien dans votre canal',
    ],
    timeSaved: '−3h / semaine',
    apps: ['Slack', 'HubSpot', 'Stripe', 'Gmail', 'Notion'],
    workflow: [
      { label: 'Événement métier détecté', type: 'trigger' },
      { label: 'Formatage de l\'alerte IA', type: 'action' },
      { label: 'Message Slack envoyé au bon canal', type: 'result' },
    ],
    declencheur: 'Tout événement métier : nouveau lead, paiement, ticket, mention, rapport programmé',
    actionsRealisees: [
      'Détection de l\'événement depuis votre outil source (CRM, Stripe, Gmail…)',
      'Formatage intelligent du message avec les infos pertinentes',
      'Envoi dans le bon canal Slack avec les bonnes personnes taguées',
      'Rapport quotidien automatique à 18h avec les KPIs du jour',
      'Alertes d\'urgence avec @here pour les événements critiques',
    ],
    benefices: [
      'L\'équipe est informée en temps réel sans consulter 5 outils',
      'Zéro information manquée sur les événements importants',
      'Rapports automatiques — plus de réunions de suivi inutiles',
    ],
    frequence: 'En temps réel pour les alertes, programmé pour les rapports quotidiens',
    prerequis: ['Espace de travail Slack actif', 'Droits d\'administration pour créer les bots', 'Canaux dédiés créés'],
    faq: [
      {
        q: 'Peut-on trier les alertes par priorité ?',
        a: 'Oui — on configure des niveaux de priorité (normal, urgent, critique) avec des formats et des canaux différents pour chaque niveau.',
      },
      {
        q: 'Fonctionne-t-il avec la version gratuite de Slack ?',
        a: 'Pour les fonctions de base, oui. Les workflows avancés (plusieurs étapes, actions conditionnelles) nécessitent Slack Pro ou supérieur.',
      },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    color: '#FF7A59',
    desc: 'Synchronisez votre pipeline HubSpot avec tous vos outils marketing et de communication.',
    useCases: [
      'Deal → étape → Alerte Slack + tâche calendrier auto',
      'Formulaire site → Séquence email HubSpot déclenchée',
      'Contact enrichi → Campagne personnalisée lancée',
    ],
    timeSaved: '−5h / semaine',
    apps: ['HubSpot CRM', 'Gmail', 'Slack', 'Calendly', 'LinkedIn', 'Stripe'],
    workflow: [
      { label: 'Deal créé ou changement d\'étape', type: 'trigger' },
      { label: 'Scoring et segmentation IA', type: 'action' },
      { label: 'Séquence email + tâche créée', type: 'action' },
      { label: 'Alerte Slack + agenda mis à jour', type: 'result' },
    ],
    declencheur: 'Création d\'un contact, changement d\'étape d\'un deal ou soumission d\'un formulaire HubSpot',
    actionsRealisees: [
      'Qualification et scoring automatique du nouveau contact',
      'Attribution du deal au bon commercial selon les règles de routing',
      'Déclenchement de la séquence email adaptée au segment',
      'Création automatique d\'une tâche de suivi dans le calendrier',
      'Notification Slack au commercial responsable avec le contexte complet',
    ],
    benefices: [
      'Chaque lead est pris en charge en < 5 minutes, 24h/24',
      'Zéro deal qui stagne — chaque étape déclenche une action',
      'Taux de closing augmenté grâce aux relances automatisées',
    ],
    frequence: 'En temps réel à chaque événement CRM, séquences selon planning défini',
    prerequis: ['Compte HubSpot (Starter ou supérieur recommandé)', 'Accès API HubSpot activé', 'Séquences email configurées'],
    faq: [
      {
        q: 'Compatible avec HubSpot gratuit ?',
        a: 'Les fonctions de base oui. Les workflows avancés, séquences email et scoring nécessitent HubSpot Starter (environ 50€/mois).',
      },
      {
        q: 'Peut-on garder notre processus commercial existant ?',
        a: 'Oui — on s\'adapte à votre pipeline et vos étapes existants. On automatise sans tout reconfigurer.',
      },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'outils',
    color: '#191919',
    desc: 'Notion devient le hub central de vos projets — alimenté automatiquement par vos autres outils.',
    useCases: [
      'Nouveau client signé → Espace Notion dédié créé',
      'Tâche terminée → Base de données mise à jour',
      'RDV Calendly → Note de réunion ajoutée auto',
    ],
    timeSaved: '−3h / semaine',
    apps: ['Notion', 'Calendly', 'HubSpot', 'Slack', 'Gmail', 'Google Drive'],
    workflow: [
      { label: 'Client signé ou RDV pris', type: 'trigger' },
      { label: 'Création de l\'espace Notion', type: 'action' },
      { label: 'Base de données mise à jour', type: 'action' },
      { label: 'Équipe notifiée via Slack', type: 'result' },
    ],
    declencheur: 'Nouveau client signé dans le CRM, RDV Calendly confirmé ou tâche marquée terminée',
    actionsRealisees: [
      'Création automatique d\'un espace de travail Notion dédié au client',
      'Population des informations client depuis le CRM dans Notion',
      'Ajout automatique de la note de réunion après chaque RDV Calendly',
      'Mise à jour des bases de données Notion en temps réel',
      'Notification de l\'équipe dans Slack avec le lien vers l\'espace Notion',
    ],
    benefices: [
      'Chaque client a son espace Notion prêt dès la signature — sans effort',
      'Toute l\'équipe a accès au même contexte en temps réel',
      'Zéro copier-coller entre CRM, email et Notion',
    ],
    frequence: 'Déclenchement instantané à chaque événement, mises à jour en temps réel',
    prerequis: ['Espace Notion avec accès API', 'Templates Notion créés et partagés', 'Connexion CRM ou Calendly'],
    faq: [
      {
        q: 'Fonctionne-t-il avec Notion gratuit ?',
        a: 'L\'API Notion est disponible sur tous les plans. Les fonctions d\'automatisation avancées nécessitent Notion Plus (16€/mois).',
      },
      {
        q: 'Peut-on utiliser nos templates Notion existants ?',
        a: 'Oui — on connecte vos templates actuels. L\'automatisation les duplique et les remplit avec les bonnes données à chaque déclenchement.',
      },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'finance',
    color: '#635BFF',
    desc: 'Automatisez tout votre cycle de paiement — de la confirmation à la relance d\'impayés.',
    useCases: [
      'Paiement confirmé → Facture PDF envoyée automatiquement',
      'Abonnement créé → CRM mis à jour + email client',
      'Échec paiement → Séquence de relance déclenchée',
    ],
    timeSaved: 'Instantané',
    apps: ['Stripe', 'Gmail', 'HubSpot', 'Notion', 'Slack', 'QuickBooks'],
    workflow: [
      { label: 'Paiement confirmé ou échoué', type: 'trigger' },
      { label: 'Génération de la facture PDF', type: 'action' },
      { label: 'CRM + comptabilité mis à jour', type: 'action' },
      { label: 'Email client + alerte équipe', type: 'result' },
    ],
    declencheur: 'Paiement reçu, abonnement créé ou renouvelé, échec de paiement détecté',
    actionsRealisees: [
      'Génération automatique de la facture PDF aux normes légales',
      'Envoi de la facture au client par email avec votre branding',
      'Mise à jour du CRM et de la comptabilité (QuickBooks, Pennylane)',
      'Déclenchement d\'une séquence de relance en cas d\'échec paiement',
      'Notification Slack au service finance avec les détails de la transaction',
    ],
    benefices: [
      'Facturation émise en < 30 secondes après chaque paiement',
      'Taux de récupération des impayés augmenté de 35 %',
      'Comptabilité à jour en temps réel sans saisie manuelle',
    ],
    frequence: 'En temps réel à chaque événement Stripe (paiement, abonnement, remboursement)',
    prerequis: ['Compte Stripe actif avec accès API', 'Template de facture configuré', 'Email expéditeur vérifié'],
    faq: [
      {
        q: 'Les factures sont-elles conformes à la législation française ?',
        a: 'Oui — numéro séquentiel, mentions légales, TVA, tous les éléments obligatoires sont inclus et configurables selon votre statut.',
      },
      {
        q: 'Peut-on personnaliser les emails de relance impayés ?',
        a: 'Oui — on configure le ton, le nombre de relances, les délais (J+5, J+15, J+30) et le contenu de chaque email selon votre approche commerciale.',
      },
    ],
  },
  {
    id: 'meta',
    name: 'Meta (Facebook & Instagram)',
    category: 'crm',
    color: '#0082FB',
    desc: 'Connectez vos publicités et pages Meta à votre CRM pour capturer chaque lead instantanément.',
    useCases: [
      'Lead Ad → CRM + email de bienvenue immédiat',
      'Commentaire → Réponse automatique personnalisée',
      'DM entrant → Ticket support créé et assigné',
    ],
    timeSaved: '−4h / semaine',
    apps: ['Facebook Lead Ads', 'Instagram DMs', 'HubSpot', 'Gmail', 'Slack'],
    workflow: [
      { label: 'Lead Ad ou DM reçu', type: 'trigger' },
      { label: 'Qualification et enrichissement', type: 'action' },
      { label: 'CRM + email bienvenue envoyé', type: 'result' },
    ],
    declencheur: 'Soumission d\'un Lead Ad Facebook/Instagram, DM entrant ou commentaire sur une publication',
    actionsRealisees: [
      'Capture instantanée du lead depuis les formulaires Meta Lead Ads',
      'Enrichissement du contact avec les données disponibles',
      'Création de la fiche dans le CRM avec la source exacte (campagne, publicité)',
      'Envoi d\'un email de bienvenue personnalisé dans les 2 minutes',
      'Réponse automatique au commentaire ou DM selon vos templates',
    ],
    benefices: [
      'Chaque euro dépensé en pub génère un lead traité instantanément',
      'Zéro lead "froid" — contact pris dans les 2 minutes',
      'ROI publicitaire amélioré grâce à la réactivité',
    ],
    frequence: 'En temps réel — dès la soumission du formulaire ou réception du message',
    prerequis: ['Page Facebook/Instagram Business active', 'Accès API Meta (Meta Business Suite)', 'CRM connecté'],
    faq: [
      {
        q: 'Fonctionne-t-il avec les publicités existantes ?',
        a: 'Oui — on connecte vos campagnes actuelles sans les modifier. Chaque nouveau lead Ad existant sera automatiquement traité.',
      },
      {
        q: 'Les réponses automatiques aux commentaires sont-elles personnalisées ?',
        a: 'Oui — l\'IA analyse le contenu du commentaire et adapte la réponse. Elle peut aussi taguer le bon membre de l\'équipe selon le sujet.',
      },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'crm',
    color: '#0A66C2',
    desc: 'Extrayez, enrichissez et contactez vos prospects LinkedIn en pilote automatique.',
    useCases: [
      'Nouveau contact → Séquence email 7 jours déclenchée',
      'Profil ciblé → Ajout CRM + enrichissement données',
      'Post publié → Partage multicanal automatique',
    ],
    timeSaved: '−5h / semaine',
    apps: ['LinkedIn', 'HubSpot', 'Gmail', 'Slack', 'Notion'],
    workflow: [
      { label: 'Profil ciblé identifié', type: 'trigger' },
      { label: 'Enrichissement du contact', type: 'action' },
      { label: 'CRM créé + séquence lancée', type: 'result' },
    ],
    declencheur: 'Nouveau contact LinkedIn identifié, connexion acceptée ou interaction sur une publication',
    actionsRealisees: [
      'Extraction et enrichissement des données du profil LinkedIn',
      'Création de la fiche contact dans le CRM avec toutes les infos disponibles',
      'Déclenchement d\'une séquence de suivi email sur 7 jours',
      'Ajout d\'une tâche de relance pour le commercial responsable',
      'Partage automatique des nouveaux articles sur LinkedIn + Twitter + Facebook',
    ],
    benefices: [
      'Pipeline alimenté en continu sans prospection manuelle',
      'Chaque connexion LinkedIn devient une opportunité commerciale',
      'Présence multicanale amplifiée sans effort supplémentaire',
    ],
    frequence: 'En temps réel pour les nouvelles connexions, quotidien pour la veille et le partage',
    prerequis: ['Compte LinkedIn actif', 'Outil de scraping LinkedIn compatible (Apify, PhantomBuster)', 'CRM connecté'],
    faq: [
      {
        q: 'Est-ce conforme aux CGU de LinkedIn ?',
        a: 'Oui, si utilisé dans les limites de LinkedIn (volume raisonnable, interactions authentiques). On vous guide pour rester dans les règles.',
      },
      {
        q: 'Peut-on cibler des secteurs ou titres spécifiques ?',
        a: 'Oui — on définit ensemble vos critères de ciblage (secteur, taille d\'entreprise, titre, localisation) et l\'automatisation ne traite que ces profils.',
      },
    ],
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'outils',
    color: '#006BFF',
    desc: 'Transformez chaque rendez-vous Calendly en opportunité commerciale qualifiée.',
    useCases: [
      'RDV pris → Lead CRM + séquence pré-RDV',
      'RDV confirmé → Rappel email et SMS automatique',
      'Après RDV → Email de suivi + proposition envoyée',
    ],
    timeSaved: '−2h / semaine',
    apps: ['Calendly', 'HubSpot', 'Gmail', 'Slack', 'Notion', 'Stripe'],
    workflow: [
      { label: 'Rendez-vous réservé', type: 'trigger' },
      { label: 'Lead CRM + séquence pré-RDV', type: 'action' },
      { label: 'Note réunion + email post-RDV', type: 'result' },
    ],
    declencheur: 'Réservation d\'un rendez-vous via Calendly (nouveau RDV, annulation ou report)',
    actionsRealisees: [
      'Création ou mise à jour de la fiche lead dans le CRM avec les réponses du formulaire',
      'Envoi d\'un email de confirmation personnalisé avec les infos pratiques',
      'Rappel automatique à J-1 et H-1 avant le rendez-vous',
      'Création d\'une note de réunion dans Notion avec l\'agenda préparé',
      'Email de suivi envoyé automatiquement 2h après la fin du RDV',
    ],
    benefices: [
      'Taux de no-show réduit de 40 % grâce aux rappels automatiques',
      'Chaque RDV est préparé — le prospect arrive avec le bon contexte',
      'Proposition commerciale envoyée avant même d\'avoir raccroché',
    ],
    frequence: 'Déclenché à chaque réservation Calendly, rappels selon le planning du RDV',
    prerequis: ['Compte Calendly actif (Basic ou supérieur)', 'Formulaire d\'inscription Calendly configuré', 'CRM connecté'],
    faq: [
      {
        q: 'Fonctionne-t-il avec plusieurs types de rendez-vous ?',
        a: 'Oui — chaque type de RDV (démo, audit, suivi) peut avoir son propre workflow avec des emails et actions différents.',
      },
      {
        q: 'Peut-on personnaliser le suivi selon le type de prospect ?',
        a: 'Oui — selon les réponses du formulaire Calendly, on envoie des emails de suivi différents et on déclenche la bonne séquence commerciale.',
      },
    ],
  },
  {
    id: 'apify',
    name: 'Apify',
    category: 'outils',
    color: '#00C2B2',
    desc: 'Scrapez n\'importe quelle source web et alimentez votre pipeline commercial automatiquement.',
    useCases: [
      'Scraping LinkedIn → Prospects qualifiés → CRM',
      'Google Maps → Établissements → Prospection locale',
      'Veille concurrentielle → Rapport hebdo automatique',
    ],
    timeSaved: '−10h / semaine',
    apps: ['Apify', 'LinkedIn', 'Google Maps', 'HubSpot', 'Gmail', 'Notion'],
    workflow: [
      { label: 'Scraping déclenché (cible définie)', type: 'trigger' },
      { label: 'Qualification IA des résultats', type: 'action' },
      { label: 'Prospects ajoutés au CRM', type: 'action' },
      { label: 'Séquence prospection lancée', type: 'result' },
    ],
    declencheur: 'Lancement programmé du scraping (quotidien, hebdomadaire) ou déclenchement manuel sur une cible',
    actionsRealisees: [
      'Extraction des données depuis LinkedIn, Google Maps ou toute source web',
      'Nettoyage et déduplication des contacts extraits',
      'Qualification IA selon vos critères (secteur, taille, localisation)',
      'Import automatique des prospects qualifiés dans votre CRM',
      'Déclenchement de la séquence email de prospection',
    ],
    benefices: [
      'Jusqu\'à 500 prospects qualifiés extraits en 30 minutes',
      'Pipeline commercial alimenté en continu sans action manuelle',
      'Veille concurrentielle automatique chaque semaine',
    ],
    frequence: 'Programmable — quotidien, hebdomadaire ou à la demande selon votre stratégie',
    prerequis: ['Compte Apify actif (plan Starter suffisant)', 'Critères de ciblage définis', 'CRM connecté pour l\'import automatique'],
    faq: [
      {
        q: 'Est-ce légal de scraper ces données ?',
        a: 'Oui pour les données publiques. On configure les scrapers dans le respect des CGU de chaque plateforme et de la réglementation RGPD.',
      },
      {
        q: 'Peut-on scraper des sources spécifiques à notre secteur ?',
        a: 'Oui — Apify supporte des centaines de sources. On développe aussi des scrapers sur mesure si votre source cible n\'est pas encore disponible.',
      },
    ],
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    category: 'google',
    color: '#EA4335',
    desc: 'Extrayez des milliers de leads locaux qualifiés depuis Google Maps automatiquement.',
    useCases: [
      'Secteur ciblé → Liste prospects + emails extraits',
      'Établissement → Fiche CRM enrichie automatiquement',
      'Zone géo → Campagne de prospection ciblée lancée',
    ],
    timeSaved: '−8h / semaine',
    apps: ['Google Maps', 'Apify', 'HubSpot', 'Gmail', 'Slack'],
    workflow: [
      { label: 'Zone et secteur ciblés', type: 'trigger' },
      { label: 'Extraction des établissements', type: 'action' },
      { label: 'Enrichissement et qualification', type: 'action' },
      { label: 'CRM + campagne lancée', type: 'result' },
    ],
    declencheur: 'Définition d\'une zone géographique et d\'un type d\'établissement à cibler',
    actionsRealisees: [
      'Extraction de tous les établissements correspondant à vos critères sur Google Maps',
      'Collecte des informations : nom, adresse, téléphone, site web, horaires, note',
      'Recherche et vérification des adresses email associées',
      'Import et enrichissement dans votre CRM avec score de pertinence',
      'Lancement automatique d\'une campagne de prospection locale ciblée',
    ],
    benefices: [
      '500 à 2 000 prospects locaux qualifiés en moins d\'une heure',
      'Données fraîches directement depuis Google — toujours à jour',
      'Prospection locale à grande échelle sans aucune recherche manuelle',
    ],
    frequence: 'À la demande ou programmé selon vos zones de prospection',
    prerequis: ['Accès API Google Maps (clé API Google)', 'Outil de scraping configuré (Apify)', 'CRM pour l\'import des leads'],
    faq: [
      {
        q: 'Combien de résultats peut-on extraire en une session ?',
        a: 'Jusqu\'à 2 000 établissements par recherche. Pour des volumes plus importants, on fractionne les extractions sur plusieurs sessions.',
      },
      {
        q: 'Les emails des établissements sont-ils toujours disponibles ?',
        a: 'Environ 60 à 70 % des établissements ont une adresse email trouvable (site web, réseaux sociaux). On complète avec d\'autres sources quand c\'est possible.',
      },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'communication',
    color: '#2AABEE',
    desc: 'Recevez toutes vos alertes métier critiques en temps réel via un bot Telegram dédié.',
    useCases: [
      'Nouveau lead → Notification instantanée sur votre bot',
      'Paiement reçu → Alerte avec détails de la transaction',
      'Rapport 18h → Résumé quotidien de vos KPIs',
    ],
    timeSaved: '−2h / semaine',
    apps: ['Telegram Bot API', 'HubSpot', 'Stripe', 'Gmail', 'Apify'],
    workflow: [
      { label: 'Événement métier critique', type: 'trigger' },
      { label: 'Formatage du message', type: 'action' },
      { label: 'Alerte Telegram instantanée', type: 'result' },
    ],
    declencheur: 'Tout événement critique : nouveau lead, paiement, erreur système ou rapport programmé',
    actionsRealisees: [
      'Détection de l\'événement depuis vos outils source',
      'Formatage du message avec les infos essentielles (montant, nom, statut)',
      'Envoi immédiat sur votre bot Telegram personnel ou de groupe',
      'Rapport KPI quotidien automatique à l\'heure que vous choisissez',
      'Alertes d\'urgence avec boutons d\'action directs dans Telegram',
    ],
    benefices: [
      'Informé partout, même sans ouvrir votre ordinateur',
      'Réactivité maximale sur les événements qui comptent',
      'Un seul endroit pour toutes vos alertes métier importantes',
    ],
    frequence: 'En temps réel pour les alertes critiques, programmé pour les rapports quotidiens',
    prerequis: ['Compte Telegram actif', 'Bot Telegram créé via BotFather (5 minutes)', 'Outils source connectés'],
    faq: [
      {
        q: 'Peut-on recevoir les alertes sur un groupe Telegram d\'équipe ?',
        a: 'Oui — le bot peut envoyer dans votre chat personnel ET dans un ou plusieurs groupes d\'équipe selon le type d\'alerte.',
      },
      {
        q: 'Peut-on répondre au bot pour déclencher des actions ?',
        a: 'Oui — on configure des commandes Telegram (/rapport, /stats, /leads) qui déclenchent des actions dans vos outils depuis Telegram.',
      },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    color: '#5865F2',
    desc: 'Pilotez vos opérations et communauté depuis Discord avec des bots métier sur mesure.',
    useCases: [
      'Nouvelle commande → Alerte canal #ventes auto',
      'Ticket support → Thread Discord dédié créé',
      'KPI hebdo → Rapport automatique dans #reporting',
    ],
    timeSaved: '−2h / semaine',
    apps: ['Discord Bot API', 'HubSpot', 'Stripe', 'Notion', 'Gmail'],
    workflow: [
      { label: 'Commande ou ticket reçu', type: 'trigger' },
      { label: 'Routage et enrichissement', type: 'action' },
      { label: 'Canal Discord notifié + thread créé', type: 'result' },
    ],
    declencheur: 'Nouvelle commande, ticket support entrant, KPI à reporter ou événement communautaire',
    actionsRealisees: [
      'Détection de l\'événement depuis vos outils (boutique, CRM, email)',
      'Routage vers le bon canal Discord selon le type d\'événement',
      'Création automatique d\'un thread dédié pour chaque ticket support',
      'Assignation d\'un membre de l\'équipe avec @mention',
      'Rapport de performance hebdomadaire posté dans #reporting le lundi matin',
    ],
    benefices: [
      'Toute l\'équipe coordonnée depuis un seul endroit — Discord',
      'Support communautaire organisé avec un thread par problème',
      'Visibilité opérationnelle complète sans changer d\'outil',
    ],
    frequence: 'En temps réel pour les alertes, hebdomadaire pour les rapports KPI',
    prerequis: ['Serveur Discord créé avec les bons canaux', 'Bot Discord créé via le portail développeur Discord', 'Permissions configurées'],
    faq: [
      {
        q: 'Notre équipe peut-elle interagir avec le bot depuis Discord ?',
        a: 'Oui — on configure des commandes slash (/stats, /leads, /rapport) que n\'importe quel membre autorisé peut utiliser dans Discord.',
      },
      {
        q: 'Fonctionne-t-il pour les communautés (pas seulement les équipes) ?',
        a: 'Oui — on peut configurer le bot pour modérer automatiquement, accueillir les nouveaux membres et animer la communauté avec des posts programmés.',
      },
    ],
  },
]

const CATEGORIES = [
  { key: 'tous',          label: 'Toutes' },
  { key: 'google',        label: 'Google' },
  { key: 'microsoft',     label: 'Microsoft' },
  { key: 'communication', label: 'Communication' },
  { key: 'crm',           label: 'CRM & Sales' },
  { key: 'finance',       label: 'Finance' },
  { key: 'outils',        label: 'Outils' },
]

const CAT_COLORS = {
  google:        { bg: 'rgba(66,133,244,.1)',  color: '#4285F4' },
  microsoft:     { bg: 'rgba(0,120,212,.1)',   color: '#0078D4' },
  communication: { bg: 'rgba(37,211,102,.1)',  color: '#18A050' },
  crm:           { bg: 'rgba(255,122,89,.1)',  color: '#D95A30' },
  finance:       { bg: 'rgba(99,91,255,.1)',   color: '#635BFF' },
  outils:        { bg: 'rgba(0,107,255,.1)',   color: '#006BFF' },
}

/* ══════════════════════════════════════════════════════════
   FAQ ITEM
══════════════════════════════════════════════════════════ */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`dd-faq-item${open ? ' open' : ''}`}>
      <button className="dd-faq-q" onClick={() => setOpen(o => !o)}>
        {q}
        <span className="dd-faq-chevron">
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 5l5 4.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <p className="dd-faq-a">{a}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ICÔNES WORKFLOW
══════════════════════════════════════════════════════════ */
const WfIcon = ({ type }) => {
  if (type === 'trigger') return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
  if (type === 'action') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════
   AUTOMATISATION PANEL — contenu du drawer
══════════════════════════════════════════════════════════ */
function AutomatisationPanel({ item, onClose }) {
  const catLabel = CATEGORIES.find(c => c.key === item.category)?.label ?? item.category
  const catStyle = CAT_COLORS[item.category] || { bg: 'rgba(0,102,255,.1)', color: '#0066FF' }

  return (
    <>
      {/* Header */}
      <div className="dd-header">
        <button className="dd-close" onClick={onClose} aria-label="Fermer la fiche">
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="dd-body">

        {/* Hero logo + info */}
        <div className="dd-hero-info" style={{ paddingTop: '1.5rem' }}>
          <div className="dd-logo-wrap" style={{ borderColor: item.color + '30' }}>
            {L[item.id]}
          </div>
          <div
            className="dd-badge dd-badge--cat"
            style={{ '--acc': catStyle.color, background: catStyle.bg, color: catStyle.color, borderColor: catStyle.color + '40' }}
          >
            {catLabel}
          </div>
          <h2 className="dd-title">{item.name}</h2>
          <p className="dd-lead">{item.desc}</p>
        </div>

        {/* Applications utilisées */}
        <div className="dd-section">
          <p className="dd-section-title">Applications utilisées</p>
          <div className="dd-int-chips">
            {item.apps.map(a => (
              <span key={a} className="dd-int-chip">{a}</span>
            ))}
          </div>
        </div>

        {/* Workflow illustré */}
        <div className="dd-section">
          <p className="dd-section-title">Workflow illustré</p>
          <div className="dd-workflow">
            {item.workflow.map((step, i) => (
              <span key={i} style={{ display: 'contents' }}>
                {i > 0 && (
                  <div className="dd-wf-arr" aria-hidden="true">
                    <svg viewBox="0 0 14 14" fill="none">
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="dd-wf-step">
                  <div className={`dd-wf-icon dd-wf-icon--${step.type}`}>
                    <WfIcon type={step.type} />
                  </div>
                  <span className="dd-wf-label">{step.label}</span>
                </div>
              </span>
            ))}
          </div>
        </div>

        {/* Déclencheur */}
        <div className="dd-section">
          <p className="dd-section-title">Déclencheur</p>
          <div className="dd-trigger">
            <span className="dd-trigger-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </span>
            <p className="dd-trigger-text">{item.declencheur}</p>
          </div>
        </div>

        {/* Actions réalisées */}
        <div className="dd-section">
          <p className="dd-section-title">Actions réalisées</p>
          <ol className="dd-actions">
            {item.actionsRealisees.map(a => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </div>

        {/* Bénéfices */}
        <div className="dd-section">
          <p className="dd-section-title">Bénéfices</p>
          <ul className="dd-benefits">
            {item.benefices.map(b => (
              <li key={b}>
                <span className="dd-benefits-icon">
                  <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <polyline points="2 7 5.5 10.5 12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Temps économisé + Fréquence */}
        <div className="dd-section">
          <p className="dd-section-title">Informations pratiques</p>
          <div className="dd-meta-row">
            <div className="dd-meta-card">
              <p className="dd-meta-lbl">Temps économisé</p>
              <p className="dd-meta-val">{item.timeSaved}</p>
            </div>
            <div className="dd-meta-card">
              <p className="dd-meta-lbl">Fréquence d&apos;exécution</p>
              <p className="dd-meta-val">{item.frequence.split(' — ')[0]}</p>
            </div>
          </div>
          {item.frequence.includes(' — ') && (
            <p style={{ fontSize: '.78rem', color: '#4d6580', marginTop: '.65rem', lineHeight: 1.6 }}>
              {item.frequence}
            </p>
          )}
        </div>

        {/* Prérequis */}
        <div className="dd-section">
          <p className="dd-section-title">Prérequis</p>
          <ul className="dd-prereqs">
            {item.prerequis.map(p => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="dd-section">
          <p className="dd-section-title">Questions fréquentes</p>
          <div className="dd-faq">
            {item.faq.map(f => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>

        <div className="dd-spacer" />
      </div>

      {/* Footer CTAs */}
      <div className="dd-footer">
        <Link
          to="/contact"
          className="dd-btn dd-btn--primary"
          onClick={onClose}
          style={{ '--acc': item.color }}
        >
          <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Installer cette automatisation
        </Link>
        <Link to="/contact" className="dd-btn dd-btn--outline" onClick={onClose}>
          Demander une démo
        </Link>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function Automatisations() {
  const [active, setActive] = useState('tous')
  const [selected, setSelected] = useState(null)

  const visible = useMemo(
    () => active === 'tous' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === active),
    [active]
  )

  const openDrawer  = useCallback(item => setSelected(item), [])
  const closeDrawer = useCallback(() => setSelected(null), [])

  useEffect(() => {
    /* ── Canvas particles ── */
    const cv = document.getElementById('atCanvas')
    let animId
    if (cv) {
      const cx = cv.getContext('2d')
      let W, H, pts = []
      const N = 55, LK = 115
      function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight }
      window.addEventListener('resize', resize, { passive: true })
      resize()
      function r(a, b) { return a + Math.random() * (b - a) }
      for (let i = 0; i < N; i++) pts.push({ x: r(0, W), y: r(0, H), vx: r(-.22, .22), vy: r(-.22, .22), s: r(.9, 1.8) })
      function frame() {
        cx.clearRect(0, 0, W, H)
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
          cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
          cx.fillStyle = 'rgba(0,102,255,.45)'; cx.fill()
        })
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < LK) {
            cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y)
            cx.strokeStyle = `rgba(0,102,255,${.09 * (1 - d / LK)})`; cx.lineWidth = 1; cx.stroke()
          }
        }
        animId = requestAnimationFrame(frame)
      }
      frame()
    }

    /* ── Halo parallax ── */
    const h1 = document.getElementById('halo1'), h2 = document.getElementById('halo2'), h3 = document.getElementById('halo3')
    let t1x=0,t1y=0,t2x=0,t2y=0,t3x=0,t3y=0,c1x=0,c1y=0,c2x=0,c2y=0,c3x=0,c3y=0,hRaf=null
    function lerp(a, b, t) { return a + (b - a) * t }
    function hTick() {
      hRaf = null
      c1x=lerp(c1x,t1x,.06);c1y=lerp(c1y,t1y,.06)
      c2x=lerp(c2x,t2x,.04);c2y=lerp(c2y,t2y,.04)
      c3x=lerp(c3x,t3x,.05);c3y=lerp(c3y,t3y,.05)
      if(h1)h1.style.transform=`translate(${c1x}px,${c1y}px)`
      if(h2)h2.style.transform=`translate(${c2x}px,${c2y}px)`
      if(h3)h3.style.transform=`translate(${c3x}px,${c3y}px)`
      if(Math.abs(c1x-t1x)>.4)hRaf=requestAnimationFrame(hTick)
    }
    function onMouseMove(e) {
      const mx=(e.clientX/window.innerWidth-.5)*2,my=(e.clientY/window.innerHeight-.5)*2
      t1x=mx*-26;t1y=my*-16;t2x=mx*16;t2y=my*12;t3x=mx*-12;t3y=my*-20
      if(!hRaf)hRaf=requestAnimationFrame(hTick)
    }
    if(h1)window.addEventListener('mousemove',onMouseMove,{passive:true})

    /* ── Scroll reveal ── */
    const revEls = document.querySelectorAll('.at-reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.08 })
    revEls.forEach(el => obs.observe(el))

    return () => {
      if (animId) cancelAnimationFrame(animId)
      if (hRaf) cancelAnimationFrame(hRaf)
      if (h1) window.removeEventListener('mousemove', onMouseMove)
      obs.disconnect()
    }
  }, [])

  return (
    <>
      {/* ════════════════════════════════ HERO */}
      <section className="at-hero">
        <canvas className="at-canvas" id="atCanvas" aria-hidden="true" />
        <div className="at-grid-bg" aria-hidden="true" />
        <div className="at-halo at-halo-1" id="halo1" aria-hidden="true" />
        <div className="at-halo at-halo-2" id="halo2" aria-hidden="true" />
        <div className="at-halo at-halo-3" id="halo3" aria-hidden="true" />

        <div className="at-hero-inner">
          <p className="at-kicker at-a0"><span />Bibliothèque d'intégrations · CA-TECH<span /></p>
          <h1 className="at-a1">
            Connectez vos outils.<br />
            <em>Automatisez vos processus.</em>
          </h1>
          <p className="at-hero-sub at-a2">
            14 intégrations prêtes à déployer. De Google Workspace à Discord — vos outils travaillent ensemble en 48h, sans code, sans formation.
          </p>

          <div className="at-stats at-a3">
            <div>
              <div className="at-stat-val">14<em>+</em></div>
              <div className="at-stat-lbl">Intégrations</div>
            </div>
            <div>
              <div className="at-stat-val">200<em>+</em></div>
              <div className="at-stat-lbl">Workflows</div>
            </div>
            <div>
              <div className="at-stat-val">48<em>h</em></div>
              <div className="at-stat-lbl">Déploiement</div>
            </div>
            <div>
              <div className="at-stat-val">15<em>h</em></div>
              <div className="at-stat-lbl">Récupérées / semaine</div>
            </div>
          </div>

          <div className="at-hero-ctas at-a4">
            <a
              href="#integrations"
              className="btn-primary"
              onClick={e => { e.preventDefault(); document.getElementById('integrations')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Explorer les intégrations →
            </a>
            <Link to="/contact" className="btn-outline">Demander une démo</Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ CATALOGUE */}
      <section className="at-int-section" id="integrations">
        <div className="at-int-inner">

          <div className="at-int-header at-reveal">
            <p className="at-int-label">Bibliothèque d'intégrations</p>
            <h2 className="at-int-title">Vos outils, <em>connectés.</em></h2>
            <p className="at-int-desc">
              Cliquez sur une intégration pour découvrir le workflow complet, les actions réalisées et le temps que vous récupérez dès la première semaine.
            </p>
          </div>

          {/* Filter bar */}
          <div className="at-int-filters">
            <div className="at-int-filters-inner">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  className={`at-int-filter-btn${active === c.key ? ' at-int-filter-btn--active' : ''}`}
                  onClick={() => setActive(c.key)}
                >
                  {c.label}
                </button>
              ))}
              <span className="at-int-count">
                {visible.length} intégration{visible.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="at-int-grid">
            {visible.map(int => {
              const catStyle = CAT_COLORS[int.category] || { bg: 'rgba(0,0,0,.06)', color: '#374151' }
              return (
                <article key={int.id} className="at-int-card at-reveal">

                  <div className="at-int-card-header">
                    <div className="at-int-logo" style={{ borderColor: int.color + '30' }}>
                      {L[int.id]}
                    </div>
                    <div className="at-int-card-meta">
                      <h3 className="at-int-name">{int.name}</h3>
                      <span
                        className="at-int-cat"
                        style={{ background: catStyle.bg, color: catStyle.color }}
                      >
                        {CATEGORIES.find(c => c.key === int.category)?.label}
                      </span>
                    </div>
                  </div>

                  <p className="at-int-desc-text">{int.desc}</p>

                  <div className="at-int-divider" />

                  <p className="at-int-uses-label">Cas d'usage</p>
                  <ul className="at-int-uses">
                    {int.useCases.map(uc => (
                      <li key={uc}>
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8l3 3 7-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {uc}
                      </li>
                    ))}
                  </ul>

                  <div className="at-int-footer">
                    <div className="at-int-time">
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {int.timeSaved}
                    </div>
                    <button
                      className="at-int-btn"
                      style={{ '--int-color': int.color }}
                      onClick={() => openDrawer(int)}
                      aria-label={`Voir le workflow complet — ${int.name}`}
                    >
                      Voir le workflow
                      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ POURQUOI */}
      <section className="at-why-section">
        <div className="at-why-inner">
          <div className="at-sec-head at-reveal">
            <p className="at-sec-label">Notre différence</p>
            <h2 className="at-sec-h">Ce que vous obtenez <em>concrètement.</em></h2>
          </div>
          <div className="at-why-grid">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Opérationnel en 48h', desc: 'Vous récupérez du temps dans les 2 jours. Pas dans 2 mois. Pas après une formation interminable.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>, title: 'Adapté à votre métier', desc: 'Vos outils, votre secteur, vos habitudes. On s\'adapte à vous — pas l\'inverse. Aucune solution générique.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>, title: 'Accompagnement inclus', desc: 'On configure, on monitore, on corrige. Si quelque chose déraille, on intervient sous 4h — avant même que vous le remarquiez.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, title: 'Rentable dès le 1er mois', desc: '15 heures récupérées par semaine. Des relances automatiques. Des factures envoyées seules. Visible avant la fin du mois.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="at-why-card at-reveal">
                <div className="at-why-icon">{icon}</div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ CTA */}
      <section className="at-cta">
        <div className="at-cta-inner at-reveal">
          <p className="at-cta-kicker">Passez à l'action</p>
          <h2>Récupérez <strong>15 heures cette semaine.</strong></h2>
          <p>Dites-nous quels outils vous utilisez. On connecte tout — opérationnel en 48h, résultats visibles ce mois-ci.</p>
          <div className="at-cta-btns">
            <Link to="/contact" className="btn-cta-white">Demander une démonstration gratuite →</Link>
            <a
              href="#integrations"
              className="btn-cta-outline"
              onClick={e => { e.preventDefault(); document.getElementById('integrations')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Revoir les intégrations
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ DRAWER */}
      <DetailDrawer
        open={!!selected}
        onClose={closeDrawer}
        accentColor={selected?.color}
      >
        {selected && <AutomatisationPanel item={selected} onClose={closeDrawer} />}
      </DetailDrawer>
    </>
  )
}
