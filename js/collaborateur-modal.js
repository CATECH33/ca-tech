/* ============================================================
   Collaborateur IA — Modal fiche technique dynamique
   Données : Supabase (catalogue_collaborateurs) + fallback statique
   CA-TECH · 2026
   ============================================================ */

// ── Config Supabase ──────────────────────────────────────────

const SUPA_URL = 'https://jhcyooksjeivajdjicka.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoY3lvb2tzamVpdmFqZGppY2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzEwMjQsImV4cCI6MjA5NzU0NzAyNH0.pFYDxJUDD5oZyVfGSDDKnPAnyc-jkXd0scS0LvGdlFk'

// ── Données statiques de secours ─────────────────────────────
// Affichées si un slug n'est pas encore en base ou si le fetch échoue.

const FALLBACK = {
  commercial: {
    nom: 'Commercial IA', icone: '💼', tag: 'Actif · 24h/24',
    grad: 'linear-gradient(135deg,rgba(0,102,255,.7) 0%,rgba(0,212,255,.35) 100%)',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&h=380&fit=crop&q=85',
    description_complete: 'Le Collaborateur Commercial IA prospecte, qualifie et relance en continu. Il identifie les leads les plus chauds dans votre CRM, envoie des séquences d\'emails personnalisées et vous transmet uniquement les opportunités prêtes à être closées.',
    mission: 'Générer et qualifier des leads automatiquement pour que votre équipe se concentre sur la conclusion.',
    fonctionnalites: ['Prospection multicanal (email, LinkedIn, SMS)','Qualification automatique des leads','Séquences de relance personnalisées','Synchronisation CRM en temps réel','Scoring et priorisation des opportunités','Reporting hebdomadaire des performances'],
    resultats_attendus: ['Une PME B2B reçoit 3× plus de rendez-vous qualifiés sans embaucher.','Un cabinet de conseil convertit 40% de leads dormants.','Une startup SaaS réduit son cycle de vente de 30 jours à 12 jours.'],
    secteurs: ['SaaS','Services B2B','Immobilier','Recrutement','Cabinet de conseil','Assurance'],
    outils_compatibles: ['HubSpot','Pipedrive','Salesforce','Slack','LinkedIn Sales Navigator','Apollo'],
    faq: [
      { question: 'Combien de leads peut-il traiter par mois ?', reponse: 'Sans limite. Le volume est illimité et le traitement reste instantané, que vous ayez 50 ou 5 000 leads entrants par mois.' },
      { question: 'Comment se connecte-t-il à mon CRM ?', reponse: 'Via API native (HubSpot, Pipedrive, Salesforce) ou Zapier/Make. La configuration prend moins de 2 heures.' },
      { question: 'Mes données sont-elles sécurisées ?', reponse: 'Toutes les données restent hébergées en Europe. Aucune donnée n\'est utilisée pour entraîner des modèles tiers. RGPD conforme.' },
    ],
    prix: '290', unite: '/ mois', prix_description: 'Configuration + déploiement inclus',
    temps_installation: '48 heures', cta_label: 'Activer ce collaborateur', cta_secondaire: 'Demander une démo',
  },
  support: {
    nom: 'Support IA', icone: '🎧', tag: 'Actif · 24h/24',
    grad: 'linear-gradient(135deg,rgba(6,182,212,.7) 0%,rgba(99,102,241,.4) 100%)',
    image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=900&h=380&fit=crop&q=85',
    description_complete: 'Le Collaborateur Support IA répond à vos clients sur tous les canaux, 24h/24 et 7j/7. Il gère les tickets, résout les problèmes courants et escalade intelligemment les cas complexes à votre équipe.',
    mission: 'Offrir une réponse instantanée et personnalisée à chaque client, sur chaque canal, à toute heure.',
    fonctionnalites: ['Réponses automatiques multicanal','Gestion et catégorisation des tickets','Base de connaissances auto-apprenante','Escalade intelligente vers un humain','Résolution autonome des problèmes courants','Rapport quotidien volumes et tendances'],
    resultats_attendus: ['Un e-commerce réduit son temps de réponse de 4h à 45 secondes.','Un éditeur SaaS résout 78% des tickets de niveau 1 sans intervention humaine.','Un service hôtelier gère les demandes en 4 langues simultanément.'],
    secteurs: ['E-commerce','SaaS','Hôtellerie','Santé','Finance','Éducation'],
    outils_compatibles: ['Zendesk','Intercom','Freshdesk','WhatsApp Business','Slack','Crisp','HubSpot'],
    faq: [
      { question: 'Dans quelles langues peut-il répondre ?', reponse: 'Plus de 40 langues nativement. La détection de langue est automatique.' },
      { question: 'Comment l\'entraîner sur mes produits ?', reponse: 'Nous importons votre documentation, vos FAQ et votre historique de tickets. L\'IA est opérationnelle en 48h.' },
    ],
    prix: '240', unite: '/ mois', prix_description: 'Configuration + déploiement inclus',
    temps_installation: '48 heures', cta_label: 'Activer ce collaborateur', cta_secondaire: 'Demander une démo',
  },
  rh: {
    nom: 'RH IA', icone: '👥', tag: 'Actif · 24h/24',
    grad: 'linear-gradient(135deg,rgba(5,150,105,.65) 0%,rgba(52,211,153,.35) 100%)',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&h=380&fit=crop&q=85',
    description_complete: 'Le Collaborateur RH IA prend en charge le cycle de recrutement de A à Z : diffusion des offres, tri des CV, planification des entretiens et onboarding des nouvelles recrues.',
    mission: 'Accélérer le recrutement et fluidifier l\'onboarding pour que vos équipes RH se concentrent sur la stratégie.',
    fonctionnalites: ['Publication automatique sur les jobboards','Tri et scoring des candidatures','Planification automatique des entretiens','Onboarding digitalisé et personnalisé','FAQ RH répondue automatiquement','Reporting recrutement en temps réel'],
    resultats_attendus: ['Une PME de 50 personnes réduit son délai de recrutement de 45 à 18 jours.','Un cabinet RH automatise le screening et ne fait plus que les entretiens finaux.','Un groupe hôtelier automatise l\'onboarding de 200 saisonniers chaque été.'],
    secteurs: ['PME & ETI','Cabinet RH','Hôtellerie-Restauration','Retail','Santé','Tech'],
    outils_compatibles: ['LinkedIn','Indeed','BambooHR','Notion','Slack','Google Calendar','DocuSign'],
    faq: [
      { question: 'Est-ce conforme au RGPD pour les données RH ?', reponse: 'Oui. Les données candidates sont traitées dans le respect du RGPD, avec durée de conservation paramétrée et droit à l\'effacement.' },
      { question: 'Combien de recrutements simultanés peut-il gérer ?', reponse: 'Sans limite. Plusieurs postes, plusieurs marchés, plusieurs critères — il gère tout en parallèle.' },
    ],
    prix: '220', unite: '/ mois', prix_description: 'Configuration + déploiement inclus',
    temps_installation: '48 heures', cta_label: 'Activer ce collaborateur', cta_secondaire: 'Demander une démo',
  },
  juridique: {
    nom: 'Juridique IA', icone: '⚖️', tag: 'Actif · 24h/24',
    grad: 'linear-gradient(135deg,rgba(109,40,217,.65) 0%,rgba(167,139,250,.35) 100%)',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=900&h=380&fit=crop&q=85',
    description_complete: 'Le Collaborateur Juridique IA rédige vos contrats, analyse les clauses à risque, surveille les délais légaux et répond à vos questions juridiques courantes en quelques secondes.',
    mission: 'Sécuriser vos actes juridiques quotidiens et rédiger vos contrats types sans attendre un avocat.',
    fonctionnalites: ['Rédaction de contrats types sur mesure','Analyse et détection de clauses à risque','Alertes sur les délais légaux','Réponses aux questions juridiques courantes','Gestion des documents légaux','Signature électronique intégrée'],
    resultats_attendus: ['Une startup génère ses CGV, CGU, NDA en 3 minutes.','Un commerçant détecte une clause abusive dans son bail avant signature.','Une agence reçoit une alerte 30 jours avant l\'échéance de chaque contrat.'],
    secteurs: ['Startup','PME','Cabinet d\'avocats','Immobilier','Agences','E-commerce'],
    outils_compatibles: ['DocuSign','Google Drive','Notion','Dropbox','Slack','Yousign'],
    faq: [
      { question: 'Peut-il remplacer un avocat ?', reponse: 'Non. Il gère les actes courants et standardisés. Pour un litige ou un contrat complexe, votre avocat reste indispensable.' },
      { question: 'Quels types de contrats peut-il rédiger ?', reponse: 'CGV/CGU, NDA, contrats de prestation, contrats de travail types, baux commerciaux standards, mentions légales.' },
    ],
    prix: '250', unite: '/ mois', prix_description: 'Configuration + déploiement inclus',
    temps_installation: '48 heures', cta_label: 'Activer ce collaborateur', cta_secondaire: 'Demander une démo',
  },
  seo: {
    nom: 'SEO IA', icone: '📈', tag: 'Actif · 24h/24',
    grad: 'linear-gradient(135deg,rgba(234,88,12,.65) 0%,rgba(251,191,36,.35) 100%)',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=380&fit=crop&q=85',
    description_complete: 'Le Collaborateur SEO IA audite votre site, identifie les opportunités de mots-clés, rédige des articles optimisés et surveille vos positions Google en continu.',
    mission: 'Faire remonter votre site sur Google et produire du contenu SEO de qualité sans mobiliser votre temps.',
    fonctionnalites: ['Audit SEO technique complet et automatisé','Recherche et clustering de mots-clés','Rédaction d\'articles SEO optimisés','Optimisation des balises title/meta/H1','Maillage interne intelligent','Suivi des positions Google en temps réel'],
    resultats_attendus: ['Un e-commerce produit 30 fiches catégories optimisées en une journée.','Un cabinet médical passe de la page 3 à la page 1 Google en 4 mois.','Une agence livre des audits SEO complets en 2 minutes au lieu de 3 jours.'],
    secteurs: ['E-commerce','Santé','Immobilier','Médias','Formation','Agences web'],
    outils_compatibles: ['Google Search Console','Google Analytics 4','Semrush','WordPress','Webflow','Shopify'],
    faq: [
      { question: 'Combien d\'articles peut-il produire par mois ?', reponse: 'Sans limite théorique. En pratique, nos clients produisent entre 20 et 80 articles/mois selon leur secteur.' },
      { question: 'Combien de temps pour voir les premiers résultats ?', reponse: 'Les premières remontées significatives apparaissent entre 6 et 12 semaines.' },
    ],
    prix: '260', unite: '/ mois', prix_description: 'Configuration + déploiement inclus',
    temps_installation: '48 heures', cta_label: 'Activer ce collaborateur', cta_secondaire: 'Demander une démo',
  },
  comptable: {
    nom: 'Comptable IA', icone: '🧾', tag: 'Actif · 24h/24',
    grad: 'linear-gradient(135deg,rgba(16,185,129,.65) 0%,rgba(6,182,212,.35) 100%)',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=380&fit=crop&q=85',
    description_complete: 'Le Collaborateur Comptable IA automatise la saisie, le rapprochement bancaire, la génération des factures et les déclarations de TVA. Il surveille votre trésorerie en temps réel.',
    mission: 'Automatiser la comptabilité opérationnelle pour que vous pilotiez votre trésorerie en temps réel sans ressaisie.',
    fonctionnalites: ['Saisie et catégorisation automatique des écritures','Rapprochement bancaire en temps réel','Génération automatique des factures','Déclarations de TVA pré-remplies','Relances clients impayés automatisées','Tableau de bord trésorerie temps réel'],
    resultats_attendus: ['Un freelance supprime 6 heures de saisie manuelle par mois.','Une PME réduit ses relances clients impayés de 45 jours à 12 jours.','Un restaurateur pilote sa trésorerie au quotidien depuis son téléphone.'],
    secteurs: ['Freelances','TPE/PME','Restauration','Commerce','Artisanat','Cabinet comptable'],
    outils_compatibles: ['Pennylane','QuickBooks','Sage','Stripe','Qonto','Shine','Sellsy'],
    faq: [
      { question: 'Peut-il remplacer mon expert-comptable ?', reponse: 'Non. Il automatise la comptabilité opérationnelle, mais votre expert-comptable reste indispensable pour la clôture et le conseil fiscal.' },
      { question: 'Comment se connecte-t-il à ma banque ?', reponse: 'Via API bancaire ouverte (DSP2) ou import de relevés. Compatible avec toutes les banques françaises.' },
    ],
    prix: '210', unite: '/ mois', prix_description: 'Configuration + déploiement inclus',
    temps_installation: '48 heures', cta_label: 'Activer ce collaborateur', cta_secondaire: 'Demander une démo',
  },
}

// Dégradés par catégorie (utilisés si l'image_url vient de Supabase)
const GRAD_BY_CATEGORIE = {
  assistant:    'linear-gradient(135deg,rgba(0,102,255,.7) 0%,rgba(0,212,255,.35) 100%)',
  agent:        'linear-gradient(135deg,rgba(99,102,241,.7) 0%,rgba(167,139,250,.4) 100%)',
  analyste:     'linear-gradient(135deg,rgba(234,88,12,.65) 0%,rgba(251,191,36,.35) 100%)',
  createur:     'linear-gradient(135deg,rgba(6,182,212,.7) 0%,rgba(99,102,241,.4) 100%)',
  automatiseur: 'linear-gradient(135deg,rgba(16,185,129,.65) 0%,rgba(6,182,212,.35) 100%)',
  autre:        'linear-gradient(135deg,rgba(100,116,139,.6) 0%,rgba(148,163,184,.3) 100%)',
}

// Correspondance entre les clés courtes des cartes HTML et les slugs complets en base
const SHORT_SLUG_MAP = {
  commercial: 'assistant-commercial-ia',
  support:    'assistant-support-client-ia',
  rh:         'collaborateur-rh-ia',
  juridique:  'juriste-ia',
  seo:        'referenceur-seo-ia',
  comptable:  'comptable-ia',
}

// ── Supabase fetch ────────────────────────────────────────────

// Map slug → données Supabase (peuplé au chargement)
let dbCollabs = {}
let fetchDone = false

async function fetchCollaborateurs() {
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/catalogue_collaborateurs?visible=eq.true&order=ordre.asc`,
      {
        headers: {
          'apikey':        SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`,
          'Accept':        'application/json',
        },
      }
    )
    if (!res.ok) return
    const rows = await res.json()
    rows.forEach(row => {
      if (!row.slug) return
      dbCollabs[row.slug] = {
        nom:                  row.nom,
        icone:                row.icone || '',
        tag:                  'Actif · 24h/24',
        grad:                 GRAD_BY_CATEGORIE[row.categorie] || GRAD_BY_CATEGORIE.autre,
        image:                row.image_url || null,
        description_complete: row.description_complete || '',
        mission:              row.mission || '',
        fonctionnalites:      row.fonctionnalites || [],
        resultats_attendus:   row.resultats_attendus || [],
        secteurs:             row.secteurs || [],
        outils_compatibles:   row.outils_compatibles || [],
        faq:                  row.faq || [],
        prix:                 String(row.prix || 0),
        unite:                '/ mois',
        prix_description:     row.temps_installation
          ? `Déploiement en ${row.temps_installation}`
          : 'Configuration + déploiement inclus',
        temps_installation:   row.temps_installation || '',
        cta_label:            row.cta_label || 'Activer ce collaborateur',
        cta_secondaire:       row.cta_secondaire || 'Demander une démo',
      }
    })
    renderBento()
  } catch (_) {
    // Fetch failed → fallback data utilisé silencieusement
  } finally {
    fetchDone = true
  }
}

// Résoudre : Supabase en priorité (slug complet ou alias court), sinon fallback statique
function resolveCollab(slug) {
  return dbCollabs[slug] || dbCollabs[SHORT_SLUG_MAP[slug]] || FALLBACK[slug] || null
}

// Mettre à jour les cartes bento avec les données live (image, nom, data-collab → slug complet)
function renderBento() {
  document.querySelectorAll('[data-collab]').forEach(card => {
    const shortSlug = card.getAttribute('data-collab')
    const dbSlug    = SHORT_SLUG_MAP[shortSlug] || shortSlug
    const data      = dbCollabs[dbSlug]
    if (!data) return

    // Pointer data-collab vers le slug complet pour que les CTAs du modal aient le bon slug
    card.setAttribute('data-collab', dbSlug)

    // Remplacer l'image Unsplash par l'image Supabase Storage si disponible
    if (data.image) {
      const img = card.querySelector('.cai-thumb img')
      if (img) {
        img.src = data.image
        img.alt = data.nom
      }
    }

    // Mettre à jour le nom
    const nameEl = card.querySelector('.cai-card-name')
    if (nameEl && data.nom) nameEl.textContent = data.nom

    // Mettre à jour l'aria-label
    card.setAttribute('aria-label', `Découvrir ${data.nom}`)
  })
}

// ── État ─────────────────────────────────────────────────────

let currentSlug = null

// ── Rendu ─────────────────────────────────────────────────────

function renderSection(title, icon, html) {
  return `<div class="cmd-section">
    <h3 class="cmd-section-title"><span class="cmd-section-icon">${icon}</span>${title}</h3>
    ${html}
  </div>`
}

function renderTags(items) {
  if (!items || !items.length) return '<p class="cmd-empty">—</p>'
  return `<div class="cmd-tags">${items.map(t => `<span class="cmd-tag">${t}</span>`).join('')}</div>`
}

function renderFeatures(items) {
  if (!items || !items.length) return '<p class="cmd-empty">—</p>'
  return `<ul class="cmd-features">${items.map(f => `
    <li class="cmd-feature">
      <span class="cmd-feature-check" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <span>${f}</span>
    </li>`).join('')}</ul>`
}

function renderCases(items) {
  if (!items || !items.length) return '<p class="cmd-empty">—</p>'
  return `<ul class="cmd-cases">${items.map(c => `
    <li class="cmd-case">
      <span class="cmd-case-dot" aria-hidden="true"></span>
      <span>${c}</span>
    </li>`).join('')}</ul>`
}

function renderFaq(items) {
  if (!items || !items.length) return '<p class="cmd-empty">Aucune question disponible</p>'
  return `<div class="cmd-faq" id="cmd-faq-list">${items.map((item, i) => `
    <div class="cmd-faq-item${i === 0 ? ' open' : ''}" data-faq="${i}">
      <button class="cmd-faq-q" aria-expanded="${i === 0}" type="button">
        <span>${item.question || item.q}</span>
        <svg class="cmd-faq-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="cmd-faq-r" ${i === 0 ? '' : 'hidden'}>
        <p>${item.reponse || item.r}</p>
      </div>
    </div>`).join('')}</div>`
}

function buildContent(c) {
  const heroStyle = c.image
    ? `background-image:url(${c.image});background-size:cover;background-position:center 25%`
    : `background:${c.grad}`

  return `
    <div class="cmd-hero" style="--cmd-grad:${c.grad}">
      ${c.image
        ? `<img class="cmd-hero-img" src="${c.image}" alt="${c.nom}" loading="lazy" decoding="async"/>`
        : `<div class="cmd-hero-img-placeholder" style="background:${c.grad}"></div>`
      }
      <div class="cmd-hero-overlay"></div>
      <div class="cmd-hero-content">
        <span class="cmd-hero-tag">${c.tag}</span>
        <h2 class="cmd-hero-name">
          ${c.icone ? `<span class="cmd-hero-icone">${c.icone}</span>` : ''}
          ${c.nom}
        </h2>
        ${c.mission ? `<p class="cmd-hero-mission">${c.mission}</p>` : ''}
      </div>
    </div>

    <div class="cmd-body">
      <div class="cmd-grid">
        <div class="cmd-main">
          ${c.description_complete ? renderSection('Présentation', '📋', `<p class="cmd-prose">${c.description_complete}</p>`) : ''}
          ${renderSection('Ce que fait ce collaborateur', '⚡', renderFeatures(c.fonctionnalites))}
          ${(c.resultats_attendus && c.resultats_attendus.length) ? renderSection('Résultats attendus', '🎯', renderCases(c.resultats_attendus)) : ''}
          ${renderSection('Secteurs d\'activité', '🏢', renderTags(c.secteurs))}
          ${renderSection('Applications compatibles', '🔧', renderTags(c.outils_compatibles))}
          ${renderSection('Questions fréquentes', '❓', renderFaq(c.faq))}
        </div>

        <aside class="cmd-sidebar">
          <div class="cmd-price-card">
            <p class="cmd-price-label">À partir de</p>
            <div class="cmd-price-amount">
              <span class="cmd-price-num">${c.prix} €</span>
              <span class="cmd-price-unit">${c.unite}</span>
            </div>
            <p class="cmd-price-note">${c.prix_description}</p>

            <div class="cmd-price-meta">
              ${c.temps_installation ? `
              <div class="cmd-price-meta-item">
                <span class="cmd-price-meta-icon">⏱️</span>
                <div>
                  <span class="cmd-price-meta-label">Déploiement</span>
                  <span class="cmd-price-meta-val">${c.temps_installation}</span>
                </div>
              </div>` : ''}
              <div class="cmd-price-meta-item">
                <span class="cmd-price-meta-icon">✅</span>
                <div>
                  <span class="cmd-price-meta-label">Configuration</span>
                  <span class="cmd-price-meta-val">Incluse</span>
                </div>
              </div>
              <div class="cmd-price-meta-item">
                <span class="cmd-price-meta-icon">🔄</span>
                <div>
                  <span class="cmd-price-meta-label">Disponibilité</span>
                  <span class="cmd-price-meta-val">24h/24 · 7j/7</span>
                </div>
              </div>
            </div>

            <div class="cmd-cta-stack">
              <a href="/contact?sujet=activation&agent=${currentSlug}" class="cmd-btn-primary">
                ${c.cta_label}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h12M8 2l5 5-5 5"/></svg>
              </a>
              <a href="/contact?sujet=demo&agent=${currentSlug}" class="cmd-btn-secondary">
                ${c.cta_secondaire}
              </a>
              <a href="/contact?sujet=devis&agent=${currentSlug}" class="cmd-btn-ghost">
                Demander un devis
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>`
}

function buildLoading() {
  return `
    <div class="cmd-hero cmd-hero--loading" style="--cmd-grad:linear-gradient(135deg,rgba(0,102,255,.3),rgba(0,212,255,.15))">
      <div class="cmd-hero-overlay"></div>
    </div>
    <div class="cmd-loading-body">
      <div class="cmd-spinner"></div>
      <p>Chargement…</p>
    </div>`
}

// ── Open / Close ──────────────────────────────────────────────

function openCollabModal(slug) {
  currentSlug = slug
  const modal = document.getElementById('cmd-modal')
  const inner = document.getElementById('cmd-modal-inner')
  if (!modal || !inner) return

  // Si le fetch n'est pas terminé, afficher le spinner puis re-render
  if (!fetchDone) {
    inner.innerHTML = buildLoading()
    document.getElementById('cmd-modal-title-sr').textContent = 'Chargement…'
    modal.classList.add('open')
    document.body.style.overflow = 'hidden'

    const poll = setInterval(() => {
      if (!fetchDone) return
      clearInterval(poll)
      const c = resolveCollab(slug)
      if (c) {
        inner.innerHTML = buildContent(c)
        document.getElementById('cmd-modal-title-sr').textContent = c.nom
        wireAccordion()
      }
    }, 100)
    return
  }

  const c = resolveCollab(slug)
  if (!c) return

  inner.innerHTML = buildContent(c)
  document.getElementById('cmd-modal-title-sr').textContent = c.nom
  modal.classList.add('open')
  document.body.style.overflow = 'hidden'
  modal.querySelector('.cmd-panel')?.focus()
  wireAccordion()
}

function closeModal() {
  const modal = document.getElementById('cmd-modal')
  if (!modal) return
  modal.classList.remove('open')
  document.body.style.overflow = ''
  currentSlug = null
}

function wireAccordion() {
  const faqList = document.getElementById('cmd-faq-list')
  if (faqList) faqList.addEventListener('click', handleFaqClick)
}

function handleFaqClick(e) {
  const btn = e.target.closest('.cmd-faq-q')
  if (!btn) return
  const item   = btn.closest('.cmd-faq-item')
  const answer = item.querySelector('.cmd-faq-r')
  const isOpen = item.classList.contains('open')

  document.querySelectorAll('.cmd-faq-item.open').forEach(el => {
    el.classList.remove('open')
    el.querySelector('.cmd-faq-r').setAttribute('hidden', '')
    el.querySelector('.cmd-faq-q').setAttribute('aria-expanded', 'false')
  })

  if (!isOpen) {
    item.classList.add('open')
    answer.removeAttribute('hidden')
    btn.setAttribute('aria-expanded', 'true')
  }
}

// ── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Lancer le fetch en background dès le chargement de la page
  fetchCollaborateurs()

  document.getElementById('cmd-overlay')?.addEventListener('click', closeModal)
  document.getElementById('cmd-close')?.addEventListener('click', closeModal)

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal()
  })

  document.querySelectorAll('[data-collab]').forEach(el => {
    el.addEventListener('click', () => openCollabModal(el.getAttribute('data-collab')))
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openCollabModal(el.getAttribute('data-collab'))
      }
    })
  })
})

window.openCollabModal  = openCollabModal
window.closeCollabModal = closeModal
