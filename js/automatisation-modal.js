/* ============================================================
   Automatisations — Modal fiche technique dynamique
   Données : AUTOMATIONS statique + AUTO_EXTRA + Supabase (futur)
   CA-TECH · 2026
   ============================================================ */

const ATM_SUPA_URL = 'https://jhcyooksjeivajdjicka.supabase.co'
const ATM_SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY3lvb2tzamVpdmFqZGppY2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzEwMjQsImV4cCI6MjA5NzU0NzAyNH0.pFYDxJUDD5oZyVfGSDDKnPAnyc-jkXd0scS0LvGdlFk'

// ── Enrichissement statique ───────────────────────────────────
// Fournit : declencheur, etapes[], cas_utilisation[], faq[]
// Remplacé par Supabase quand la table catalogue_automatisations existera.

const AUTO_EXTRA = {
  'form-crm-email': {
    declencheur: 'Soumission d\'un formulaire de contact sur votre site web',
    etapes: [
      'Le formulaire capte les données du visiteur (nom, email, besoin)',
      'Un nouveau contact est créé automatiquement dans votre CRM',
      'Un email de bienvenue personnalisé est envoyé au prospect en 30 secondes',
      'Votre équipe reçoit une alerte avec le résumé du lead',
    ],
    cas_utilisation: [
      'Une agence capte 3× plus de leads qualifiés sans intervention manuelle',
      'Un cabinet de conseil envoie une proposition de valeur dans les 30 secondes',
      'Un restaurant reçoit les demandes de réservation directement dans son CRM',
    ],
    faq: [
      { question: 'Quels formulaires sont compatibles ?', reponse: 'Typeform, HubSpot Forms, Gravity Forms, Tally, Jotform, Contact Form 7, et tout formulaire avec webhook.' },
      { question: 'L\'email de bienvenue est-il personnalisable ?', reponse: 'Oui, vous définissez le contenu, l\'objet et la signature. L\'IA peut même personnaliser dynamiquement selon les informations saisies.' },
      { question: 'Et si le CRM est indisponible au moment de la soumission ?', reponse: 'L\'email part dans tous les cas. La création CRM est retentée 3 fois avant de vous notifier en cas d\'erreur persistante.' },
    ],
  },

  'email-lead-slack': {
    declencheur: 'Réception d\'un email commercial dans votre boîte professionnelle',
    etapes: [
      'L\'IA détecte et classe les emails commerciaux entrants',
      'Les informations clés sont extraites (nom, société, besoin estimé)',
      'Un lead est créé ou mis à jour dans votre CRM',
      'Une alerte résumée est envoyée dans votre canal Slack dédié',
    ],
    cas_utilisation: [
      'Un directeur commercial ne rate plus jamais un email de prospect chaud',
      'Une startup SaaS traite 150 emails entrants par jour sans saisie manuelle',
      'Une agence RH alimente son CRM automatiquement depuis ses candidatures email',
    ],
    faq: [
      { question: 'Comment l\'IA différencie emails commerciaux des spams ?', reponse: 'Via un modèle entraîné sur vos emails historiques et affiné sur vos retours. Le taux de précision dépasse 95% après 2 semaines.' },
      { question: 'Gmail et Outlook sont-ils compatibles ?', reponse: 'Oui, les deux. Ainsi qu\'iCloud Mail et tout service IMAP.' },
    ],
  },

  'devis-facture-email': {
    declencheur: 'Acceptation d\'un devis par le client (signature électronique ou clic)',
    etapes: [
      'Le client signe ou accepte le devis en ligne',
      'Une facture est générée automatiquement avec la bonne numérotation',
      'La facture est envoyée au client par email en PDF sécurisé',
      'Le statut du dossier est mis à jour dans votre outil de gestion',
      'Un rappel de paiement est planifié à J+15 si non réglée',
    ],
    cas_utilisation: [
      'Un artisan envoie ses factures en 0 clic — la signature du devis suffit',
      'Une agence de communication facture 40 clients par mois sans saisie manuelle',
      'Un consultant indépendant récupère 4h par semaine sur l\'administratif',
    ],
    faq: [
      { question: 'Quels logiciels de devis sont compatibles ?', reponse: 'Sellsy, Pennylane, QuickBooks, Harvest, Freshbooks, et tout outil avec API ou webhook.' },
      { question: 'La numérotation est-elle personnalisable ?', reponse: 'Oui : préfixe, millésime, numéro séquentiel — selon vos règles comptables.' },
    ],
  },

  'soir-resume-leads': {
    declencheur: 'Déclenchement planifié automatiquement chaque soir à 18h',
    etapes: [
      'L\'automatisation collecte toutes les données de la journée depuis votre CRM',
      'Les leads entrants, devis envoyés et relances effectuées sont compilés',
      'Un rapport résumé est généré avec les indicateurs clés',
      'Le rapport est envoyé dans Slack à l\'équipe commerciale',
      'Les actions prévues pour le lendemain sont listées automatiquement',
    ],
    cas_utilisation: [
      'Un responsable commercial reçoit le bilan de la journée sans ouvrir son CRM',
      'Une PME suit l\'activité commerciale quotidienne sans réunion de reporting',
      'Un dirigeant pilote son pipeline depuis son téléphone pendant son trajet retour',
    ],
    faq: [
      { question: 'L\'heure d\'envoi est-elle personnalisable ?', reponse: 'Oui, à la minute près. Vous pouvez aussi configurer plusieurs rapports à différentes heures selon les équipes.' },
      { question: 'Le rapport fonctionne-t-il si personne ne travaille ce jour-là ?', reponse: 'Oui, un rapport "journée calme" est envoyé pour confirmer que tout fonctionne — même le vendredi et les jours fériés.' },
    ],
  },

  'gmail-calendar-slack': {
    declencheur: 'Réception d\'un email contenant une date, heure ou invitation dans Gmail',
    etapes: [
      'L\'IA scanne les emails entrants à la recherche de dates et créneaux horaires',
      'Les informations d\'événement sont extraites (date, heure, lieu, participants)',
      'Un événement est créé dans Google Calendar avec tous les détails',
      'Une notification est envoyée dans Slack avec le résumé et le lien Calendar',
      'Un rappel automatique est planifié 1h avant l\'événement',
    ],
    cas_utilisation: [
      'Un commercial ne rate plus jamais un RDV confirmé par email',
      'Une équipe RH synchronise automatiquement les entretiens reçus par email',
      'Un chef de projet voit ses deadlines client apparaître dans son agenda',
    ],
    faq: [
      { question: 'L\'IA comprend-elle les emails en français et en anglais ?', reponse: 'Oui, et dans 15 autres langues. La détection de dates est robuste aux formulations floues ("la semaine prochaine", "vendredi prochain").' },
      { question: 'Peut-on exclure certains expéditeurs ou libellés ?', reponse: 'Absolument. Vous définissez des règles d\'exclusion par expéditeur, domaine ou libellé Gmail lors de la configuration.' },
    ],
  },

  'whatsapp-crm-email': {
    declencheur: 'Nouveau message entrant sur WhatsApp Business',
    etapes: [
      'Le message WhatsApp est reçu et analysé par l\'IA',
      'Les informations du prospect sont extraites (nom, besoin, urgence)',
      'Un contact est créé ou mis à jour dans le CRM',
      'Un email de bienvenue personnalisé est envoyé au prospect',
      'Votre équipe reçoit une notification avec le contexte du message',
    ],
    cas_utilisation: [
      'Un prestataire de services transforme chaque WhatsApp en fiche prospect qualifiée',
      'Un e-commerce convertit les questions produit en opportunités commerciales',
      'Un agent immobilier centralise ses contacts WhatsApp dans son CRM sans manipulation',
    ],
    faq: [
      { question: 'Faut-il un compte WhatsApp Business API ?', reponse: 'Oui, WhatsApp Business API (compte officiel) est requis. On vous aide à le configurer lors de l\'onboarding — 30 minutes suffisent.' },
      { question: 'Les messages privés sont-ils sécurisés ?', reponse: 'Oui. Les données transitent chiffrées et ne sont jamais stockées sur nos serveurs au-delà du traitement en temps réel.' },
    ],
  },

  'forms-sheets-devis': {
    declencheur: 'Soumission d\'un formulaire de demande de devis (Google Forms)',
    etapes: [
      'Le prospect remplit le formulaire en ligne (type de projet, budget, délais)',
      'Les données sont enregistrées dans une feuille Google Sheets structurée',
      'L\'IA calcule une estimation selon vos grilles tarifaires prédéfinies',
      'Un devis PDF professionnel est généré automatiquement',
      'Le devis est envoyé au prospect par email en moins de 5 minutes',
    ],
    cas_utilisation: [
      'Une agence web envoie des estimations 24h/24 sans décrocher le téléphone',
      'Un imprimeur automatise 80% de ses devis standardisés',
      'Un artisan du bâtiment reçoit les demandes la nuit et répond avant 8h',
    ],
    faq: [
      { question: 'La grille tarifaire est-elle configurable ?', reponse: 'Oui, elle est définie par vous dans Google Sheets. L\'IA l\'applique automatiquement, avec gestion des remises et des options.' },
      { question: 'Le devis PDF reprend-il votre charte graphique ?', reponse: 'Oui, on intègre votre logo, couleurs et mentions légales dans le template PDF lors de la configuration initiale.' },
    ],
  },

  'linkedin-apify-crm': {
    declencheur: 'Déclenchement manuel ou planifié d\'une campagne de prospection LinkedIn',
    etapes: [
      'Vous définissez votre cible sur LinkedIn (secteur, poste, localisation, taille)',
      'Apify extrait les profils correspondants (URL, nom, poste, entreprise)',
      'L\'IA enrichit les données (email professionnel, signaux d\'intérêt)',
      'Les contacts sont importés dans votre CRM avec les tags appropriés',
      'Un email de prospection personnalisé est envoyé à chaque contact',
      'Les ouvertures et clics sont trackés et remontés dans le CRM',
    ],
    cas_utilisation: [
      'Une startup B2B prospecte 200 décideurs par semaine en mode automatique',
      'Un cabinet de conseil cible les DRH de PME industrielles de plus de 50 salariés',
      'Une agence de recrutement alimente son vivier de candidats qualifiés',
    ],
    faq: [
      { question: 'Est-ce conforme aux CGU de LinkedIn ?', reponse: 'L\'extraction via Apify opère sur des données publiques. Pour rester dans des limites acceptables, nous limitons les volumes et espaçons les requêtes.' },
      { question: 'Faut-il un compte LinkedIn Premium ?', reponse: 'Non, un compte standard suffit pour les profils publics. Sales Navigator améliore la précision du ciblage si vous en disposez.' },
    ],
  },

  'stripe-facture-email': {
    declencheur: 'Paiement confirmé sur Stripe (événement charge.succeeded)',
    etapes: [
      'Stripe notifie l\'automatisation via webhook dès la confirmation du paiement',
      'Les données de transaction sont récupérées (montant, client, description)',
      'Une facture conforme (TVA, mentions légales) est générée en PDF',
      'La facture est envoyée au client par email en quelques secondes',
      'Le client est mis à jour dans votre CRM avec le statut "payé"',
    ],
    cas_utilisation: [
      'Un SaaS envoie automatiquement les factures mensuelles à 500 abonnés',
      'Un formateur en ligne gère la facturation sans logiciel comptable dédié',
      'Un e-commerce génère des factures TVA conformes pour ses clients B2B',
    ],
    faq: [
      { question: 'Les factures sont-elles conformes fiscalement ?', reponse: 'Oui : numérotation séquentielle obligatoire, TVA décomposée, mentions légales complètes, format immuable archivé 10 ans.' },
      { question: 'Compatible avec Stripe Connect (marketplace) ?', reponse: 'Oui, avec gestion des transferts et commission plateforme selon vos règles de répartition.' },
    ],
  },

  'drive-ia-classement': {
    declencheur: 'Dépôt d\'un nouveau fichier dans un dossier Google Drive surveillé',
    etapes: [
      'Le fichier est détecté dès son dépôt dans le dossier source',
      'L\'IA analyse le contenu (texte, images, métadonnées) pour identifier le type',
      'Le fichier est renommé selon vos conventions de nommage',
      'Il est déplacé dans le bon sous-dossier selon la classification IA',
      'Un log de l\'action est enregistré dans Google Sheets pour audit complet',
    ],
    cas_utilisation: [
      'Un cabinet comptable classe automatiquement 500 pièces justificatives par mois',
      'Une agence photo organise ses livrables clients sans toucher à l\'arborescence',
      'Un service RH archive les CV et contrats dans les bons dossiers collaborateurs',
    ],
    faq: [
      { question: 'L\'IA apprend-elle mes conventions de classement ?', reponse: 'Oui, après validation de 20 à 50 fichiers, elle affine ses prédictions en continu. Vous restez maître de la règle à tout moment.' },
      { question: 'Que se passe-t-il en cas de doute sur le classement ?', reponse: 'Le fichier est mis en quarantaine dans un dossier "À vérifier" et vous êtes notifié pour valider manuellement.' },
    ],
  },

  'outlook-teams-crm': {
    declencheur: 'Réception d\'un email client dans Outlook (boîte en surveillance)',
    etapes: [
      'L\'email entrant est analysé pour détecter s\'il provient d\'un client ou prospect',
      'Une notification résumée est postée dans votre canal Microsoft Teams',
      'Le thread email est enregistré dans le CRM sur la fiche contact',
      'Une tâche de suivi est créée et assignée au commercial responsable',
    ],
    cas_utilisation: [
      'Une équipe commerciale Microsoft 365 ne perd plus aucun email client',
      'Un service ADV trace tous les échanges par numéro de commande',
      'Un cabinet conseil historise automatiquement ses échanges client dans son CRM',
    ],
    faq: [
      { question: 'Compatible avec Outlook on-premise (Exchange) ?', reponse: 'Oui, via Exchange Online ou connecteur EWS. Les environnements Exchange 2016+ sont supportés.' },
      { question: 'Quels CRM sont supportés ?', reponse: 'HubSpot, Salesforce, Pipedrive, Dynamics 365, Zoho CRM, et tout CRM avec API REST.' },
    ],
  },

  'hubspot-slack-calendar': {
    declencheur: 'Changement de statut d\'un deal dans le pipeline HubSpot',
    etapes: [
      'HubSpot notifie l\'automatisation dès qu\'un deal change d\'étape',
      'Un message de mise à jour est posté dans le canal Slack de l\'équipe',
      'Un événement de suivi est créé dans Google Calendar avec la date de closing',
      'Des tâches de suivi spécifiques à l\'étape sont créées et assignées',
    ],
    cas_utilisation: [
      'Une équipe commerciale voit en temps réel l\'avancement de chaque deal',
      'Un manager reçoit des alertes sur les deals "en danger" avant qu\'ils ne soient perdus',
      'Les réunions de pipeline hebdomadaires sont remplacées par des notifications Slack automatiques',
    ],
    faq: [
      { question: 'Peut-on personnaliser les alertes selon l\'étape du pipeline ?', reponse: 'Oui, chaque étape peut avoir son propre message Slack, ses tâches assignées et ses événements Calendar.' },
      { question: 'Fonctionne avec HubSpot Starter ?', reponse: 'Oui, depuis le plan Starter. Les webhooks sont disponibles sur tous les plans payants HubSpot.' },
    ],
  },
}

// ── Supabase (futur) ──────────────────────────────────────────
let dbAutos     = {}
let autoFetchDone = false

async function fetchDbAutomatisations() {
  try {
    const res = await fetch(
      `${ATM_SUPA_URL}/rest/v1/catalogue_automatisations?visible=eq.true`,
      {
        headers: {
          'apikey':        ATM_SUPA_KEY,
          'Authorization': `Bearer ${ATM_SUPA_KEY}`,
          'Accept':        'application/json',
        },
      }
    )
    if (!res.ok) return
    const rows = await res.json()
    rows.forEach(row => { if (row.id) dbAutos[row.id] = row })
  } catch (_) {
    // Table absente — fallback statique utilisé
  } finally {
    autoFetchDone = true
  }
}

// ── Résolution des données ────────────────────────────────────
// Priorité : Supabase → AUTOMATIONS statique + AUTO_EXTRA

function resolveAuto(id) {
  if (dbAutos[id]) return dbAutos[id]

  const base  = (typeof AUTOMATIONS !== 'undefined') ? AUTOMATIONS.find(a => a.id === id) : null
  if (!base) return null

  const extra = AUTO_EXTRA[id] || {}
  return {
    id:              base.id,
    name:            base.name,
    description:     base.description,
    timeSaved:       base.timeSaved,
    category:        base.category,
    apps:            base.apps || [],
    declencheur:     extra.declencheur || null,
    etapes:          extra.etapes || [],
    cas_utilisation: extra.cas_utilisation || [],
    faq:             extra.faq || [],
  }
}

// ── Helpers render ────────────────────────────────────────────

const ATM_CAT_LABELS = {
  commercial:    'Commercial',
  finance:       'Finance',
  communication: 'Communication',
  rh:            'RH',
  reporting:     'Reporting',
  ecommerce:     'E-commerce',
}

const ATM_CAT_COLORS = {
  commercial:    { bg: 'rgba(0,102,255,.18)',  color: '#60a5fa' },
  finance:       { bg: 'rgba(217,119,6,.18)',  color: '#fbbf24' },
  communication: { bg: 'rgba(5,150,105,.18)',  color: '#34d399' },
  rh:            { bg: 'rgba(124,58,237,.18)', color: '#c4b5fd' },
  reporting:     { bg: 'rgba(13,148,136,.18)', color: '#2dd4bf' },
  ecommerce:     { bg: 'rgba(249,115,22,.18)', color: '#fb923c' },
}

function _atmAppIcon(key, size) {
  if (typeof APPS === 'undefined' || !APPS[key]) return ''
  const app = APPS[key]
  const dim = size === 'lg' ? '52px' : '36px'
  return `<div class="atm-app-icon atm-app-icon--${size}" style="background:${app.color}" title="${app.label}">${app.icon}</div>`
}

function _atmFlowHero(apps) {
  if (!apps || apps.length < 2) return ''
  const [a, b, c] = apps
  let html = `<div class="atm-flow-hero">`
  html += _atmAppIcon(a, 'lg')
  html += `<div class="atm-flow-conn"><span class="atm-flow-dot"></span></div>`
  html += _atmAppIcon(b, 'lg')
  if (c) {
    html += `<div class="atm-flow-conn"><span class="atm-flow-dot" style="animation-delay:.65s"></span></div>`
    html += _atmAppIcon(c, 'lg')
  }
  html += `</div>`
  return html
}

function _atmSection(title, icon, html) {
  return `<div class="atm-section">
    <h3 class="atm-section-title"><span class="atm-section-icon">${icon}</span>${title}</h3>
    ${html}
  </div>`
}

function _atmSteps(items) {
  if (!items || !items.length) return ''
  return `<ol class="atm-steps">${items.map((s, i) => `
    <li class="atm-step">
      <span class="atm-step-num">${i + 1}</span>
      <span class="atm-step-text">${s}</span>
    </li>`).join('')}</ol>`
}

function _atmCases(items) {
  if (!items || !items.length) return ''
  return `<ul class="atm-cases">${items.map(c => `
    <li class="atm-case">
      <span class="atm-case-dot"></span>
      <span>${c}</span>
    </li>`).join('')}</ul>`
}

function _atmFaq(items) {
  if (!items || !items.length) return '<p class="atm-empty">Aucune question disponible.</p>'
  return `<div class="atm-faq" id="atm-faq-list">${items.map((item, i) => `
    <div class="atm-faq-item${i === 0 ? ' open' : ''}" data-faq="${i}">
      <button class="atm-faq-q" aria-expanded="${i === 0}" type="button">
        <span>${item.question}</span>
        <svg class="atm-faq-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="atm-faq-r"${i === 0 ? '' : ' hidden'}>
        <p>${item.reponse}</p>
      </div>
    </div>`).join('')}</div>`
}

// ── Construction du contenu modal ─────────────────────────────

function buildAutoContent(a) {
  const catLabel  = ATM_CAT_LABELS[a.category] || a.category
  const catColors = ATM_CAT_COLORS[a.category] || { bg: 'rgba(255,255,255,.1)', color: '#fff' }

  const appsHtml = (a.apps || []).map(key => {
    if (typeof APPS === 'undefined' || !APPS[key]) return ''
    const app = APPS[key]
    return `<div class="atm-app-row">
      <div class="atm-app-sm" style="background:${app.color}">${app.icon}</div>
      <span class="atm-app-name">${app.label}</span>
    </div>`
  }).join('')

  return `
    <div class="atm-hero">
      <div class="atm-hero-overlay"></div>
      <div class="atm-hero-inner">
        ${_atmFlowHero(a.apps)}
        <h2 class="atm-hero-name">${a.name}</h2>
        <span class="atm-cat-badge" style="background:${catColors.bg};color:${catColors.color}">${catLabel}</span>
      </div>
    </div>

    <div class="atm-body">
      <div class="atm-grid">

        <div class="atm-main">
          ${a.description ? _atmSection('Description', '📋', `<p class="atm-prose">${a.description}</p>`) : ''}
          ${a.declencheur ? _atmSection('Déclencheur', '⚡', `
            <div class="atm-trigger">
              <span class="atm-trigger-icon">▶</span>
              <p>${a.declencheur}</p>
            </div>`) : ''}
          ${a.etapes && a.etapes.length ? _atmSection('Étapes du workflow', '🔄', _atmSteps(a.etapes)) : ''}
          ${a.cas_utilisation && a.cas_utilisation.length ? _atmSection('Cas d\'utilisation', '🎯', _atmCases(a.cas_utilisation)) : ''}
          ${a.faq && a.faq.length ? _atmSection('Questions fréquentes', '❓', _atmFaq(a.faq)) : ''}
        </div>

        <aside class="atm-sidebar">

          <div class="atm-time-card">
            <p class="atm-card-label">Temps gagné</p>
            <div class="atm-time-val">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${a.timeSaved}
            </div>
          </div>

          <div class="atm-apps-card">
            <p class="atm-card-label">Applications connectées</p>
            <div class="atm-apps-list">${appsHtml}</div>
          </div>

          <div class="atm-meta-card">
            <div class="atm-meta-item">
              <span class="atm-meta-icon">⚡</span>
              <div>
                <span class="atm-meta-label">Déploiement</span>
                <span class="atm-meta-val">48 heures</span>
              </div>
            </div>
            <div class="atm-meta-item">
              <span class="atm-meta-icon">✅</span>
              <div>
                <span class="atm-meta-label">Configuration</span>
                <span class="atm-meta-val">Incluse</span>
              </div>
            </div>
            <div class="atm-meta-item">
              <span class="atm-meta-icon">🔄</span>
              <div>
                <span class="atm-meta-label">Monitoring</span>
                <span class="atm-meta-val">24h/24 · 7j/7</span>
              </div>
            </div>
          </div>

          <div class="atm-cta-stack">
            <a href="/contact?sujet=demo&auto=${encodeURIComponent(a.id)}" class="atm-btn-primary">
              Demander une démonstration
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h12M8 2l5 5-5 5"/></svg>
            </a>
            <a href="/contact?sujet=devis&auto=${encodeURIComponent(a.id)}" class="atm-btn-secondary">
              Demander un devis
            </a>
          </div>

        </aside>
      </div>
    </div>`
}

function buildAutoLoading() {
  return `
    <div class="atm-hero atm-hero--loading"><div class="atm-hero-overlay"></div></div>
    <div class="atm-loading-body">
      <div class="atm-spinner"></div>
      <p>Chargement…</p>
    </div>`
}

// ── Open / Close ──────────────────────────────────────────────

let currentAutoId = null

function openAutoModal(id) {
  currentAutoId = id
  const modal = document.getElementById('atm-modal')
  const inner = document.getElementById('atm-modal-inner')
  if (!modal || !inner) return

  if (!autoFetchDone) {
    inner.innerHTML = buildAutoLoading()
    document.getElementById('atm-modal-title-sr').textContent = 'Chargement…'
    modal.classList.add('open')
    document.body.style.overflow = 'hidden'

    const poll = setInterval(() => {
      if (!autoFetchDone) return
      clearInterval(poll)
      const a = resolveAuto(id)
      if (a) {
        inner.innerHTML = buildAutoContent(a)
        document.getElementById('atm-modal-title-sr').textContent = a.name
        wireAutoAccordion()
      }
    }, 100)
    return
  }

  const a = resolveAuto(id)
  if (!a) return

  inner.innerHTML = buildAutoContent(a)
  document.getElementById('atm-modal-title-sr').textContent = a.name
  modal.classList.add('open')
  document.body.style.overflow = 'hidden'
  modal.querySelector('.atm-panel')?.focus()
  wireAutoAccordion()
}

function closeAutoModal() {
  const modal = document.getElementById('atm-modal')
  if (!modal) return
  modal.classList.remove('open')
  document.body.style.overflow = ''
  currentAutoId = null
}

function wireAutoAccordion() {
  document.getElementById('atm-faq-list')?.addEventListener('click', handleAutoFaqClick)
}

function handleAutoFaqClick(e) {
  const btn = e.target.closest('.atm-faq-q')
  if (!btn) return
  const item   = btn.closest('.atm-faq-item')
  const answer = item.querySelector('.atm-faq-r')
  const isOpen = item.classList.contains('open')

  document.querySelectorAll('.atm-faq-item.open').forEach(el => {
    el.classList.remove('open')
    el.querySelector('.atm-faq-r').setAttribute('hidden', '')
    el.querySelector('.atm-faq-q').setAttribute('aria-expanded', 'false')
  })

  if (!isOpen) {
    item.classList.add('open')
    answer.removeAttribute('hidden')
    btn.setAttribute('aria-expanded', 'true')
  }
}

// ── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  fetchDbAutomatisations()

  document.getElementById('atm-overlay')?.addEventListener('click', closeAutoModal)
  document.getElementById('atm-close')?.addEventListener('click', closeAutoModal)

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAutoModal()
  })
})

window.openAutoModal  = openAutoModal
window.closeAutoModal = closeAutoModal
