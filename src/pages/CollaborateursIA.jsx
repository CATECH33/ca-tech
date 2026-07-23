import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import DetailDrawer from '../components/DetailDrawer'
import './CollaborateursIA.css'

/* ══════════════════════════════════════════════════
   DONNÉES COLLABORATEURS
══════════════════════════════════════════════════ */
const COLLABORATEURS = [
  {
    id: 'commercial',
    name: 'Commercial IA',
    color: '#0066FF',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=640&h=380&fit=crop&q=85&auto=format',
    desc: 'Votre meilleur commercial — sans pause café, sans jours fériés. Il qualifie chaque lead entrant, relance automatiquement et personnalise chaque proposition pour maximiser vos conversions.',
    missions: [
      'Qualification automatique des leads entrants',
      'Séquences de relance personnalisées',
      'Scoring de leads de 0 à 100',
      'Propositions commerciales sur mesure',
    ],
    resultats: [
      { val: '−12h', lbl: '/semaine sur la prospection' },
      { val: '+38 %', lbl: 'de taux de réponse' },
    ],
    fonctionnalites: [
      'Scoring de leads de 0 à 100',
      'Propositions commerciales en < 10 min',
      'Séquences multicanal email · LinkedIn · WhatsApp',
      'Analyse des objections et réponses adaptées',
      'Mise à jour automatique du CRM',
      'Reporting commercial hebdomadaire',
    ],
    secteurs: ['PME & Startups', 'Agences', 'E-commerce', 'Conseil', 'BTP & Artisans'],
    exemples: [
      {
        ctx: 'Agence web — 5 collaborateurs',
        desc: 'Le Commercial IA reçoit chaque formulaire, score le lead, rédige une proposition sur mesure en 10 min et relance 3 fois en 7 jours. Résultat : +42 % de devis signés sans recruter.',
      },
      {
        ctx: 'Startup SaaS — 12 personnes',
        desc: 'Chaque lead Meta Ads est qualifié, nourri par 5 emails personnalisés et transmis au bon commercial au bon moment. Coût d\'acquisition divisé par 2 en 3 mois.',
      },
    ],
    integrationsCompatibles: ['HubSpot', 'Pipedrive', 'Gmail', 'LinkedIn', 'Slack', 'Calendly', 'WhatsApp'],
    faq: [
      {
        q: 'En combien de temps est-il opérationnel ?',
        a: 'Entre 24 et 48h. On configure vos offres, vos cibles et vos outils lors d\'une session initiale — ensuite tout tourne automatiquement.',
      },
      {
        q: 'Peut-il gérer plusieurs offres ou segments clients ?',
        a: 'Oui. On définit autant de profils d\'acheteur que vous avez d\'offres. Il adapte son discours à chaque segment automatiquement.',
      },
      {
        q: 'Que se passe-t-il si un lead pose une question complexe ?',
        a: 'Il escalade la conversation vers vous avec le contexte complet — vous n\'intervenez que quand c\'est vraiment nécessaire.',
      },
    ],
  },
  {
    id: 'support',
    name: 'Support IA',
    color: '#7c3aed',
    img: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=640&h=380&fit=crop&q=85&auto=format',
    desc: 'Disponible 24h/24, 7j/7, sans jamais perdre patience. Il répond, classe et résout les demandes clients instantanément pendant que vos équipes se concentrent sur les cas complexes.',
    missions: [
      'Réponse aux questions fréquentes 24/7',
      'Classement et priorisation des tickets',
      'Escalade automatique des cas critiques',
      'Enquêtes de satisfaction post-interaction',
    ],
    resultats: [
      { val: '−60 %', lbl: 'de tickets traités manuellement' },
      { val: '< 2 s', lbl: 'de temps de réponse moyen' },
    ],
    fonctionnalites: [
      'Réponse instantanée < 2 secondes',
      'Base de connaissance apprise sur vos docs',
      'Escalade intelligente vers l\'humain',
      'Support multicanal — email, chat, WhatsApp',
      'Enquêtes de satisfaction automatiques',
      'Tableau de bord des tickets en temps réel',
    ],
    secteurs: ['E-commerce', 'SaaS & Tech', 'Services B2B', 'Immobilier', 'Restauration & Hôtellerie'],
    exemples: [
      {
        ctx: 'E-commerce — 2 000 commandes/mois',
        desc: '80 % des questions sur les livraisons, retours et tailles sont résolues sans intervention humaine. L\'équipe ne traite plus que les cas réellement complexes.',
      },
      {
        ctx: 'SaaS — 5 000 utilisateurs actifs',
        desc: 'Le Support IA connaît la documentation, le changelog et les bugs connus. Il répond, crée les tickets critiques et avertit l\'équipe technique en temps réel.',
      },
    ],
    integrationsCompatibles: ['Zendesk', 'Intercom', 'WhatsApp', 'Gmail', 'Slack', 'Notion', 'Freshdesk'],
    faq: [
      {
        q: 'Comment l\'IA apprend-elle mon activité ?',
        a: 'On lui fournit vos FAQs, CGV, documentation produit et anciens tickets. Elle apprend en quelques heures et s\'améliore chaque semaine au fil des interactions.',
      },
      {
        q: 'Gère-t-il plusieurs langues ?',
        a: 'Oui — français, anglais et 20+ langues. Il détecte automatiquement la langue du client et répond dans la même langue sans configuration supplémentaire.',
      },
      {
        q: 'Que se passe-t-il sur un cas très complexe ?',
        a: 'Il escalade proprement : résume la conversation, identifie l\'urgence et notifie le bon membre de l\'équipe par Slack ou email avec tout le contexte.',
      },
    ],
  },
  {
    id: 'rh',
    name: 'RH IA',
    color: '#0891b2',
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=640&h=380&fit=crop&q=85&auto=format',
    desc: 'Recrutement, onboarding, congés, réponses aux équipes — votre RH IA prend en charge tout l\'administratif pour que vous vous consacriez au développement des talents.',
    missions: [
      'Analyse automatique des candidatures',
      'Parcours d\'onboarding J+1 à J+30',
      'Gestion des demandes de congés',
      'Réponses aux questions courantes des équipes',
    ],
    resultats: [
      { val: '−8h', lbl: '/semaine de tâches administratives' },
      { val: '100 CVs', lbl: 'traités en 10 minutes' },
    ],
    fonctionnalites: [
      'Tri et scoring automatique des CVs',
      'Parcours d\'onboarding J+1 à J+90',
      'Gestion des congés et absences',
      'Réponses aux questions RH des équipes',
      'Suivi des périodes d\'essai',
      'Reporting RH mensuel automatique',
    ],
    secteurs: ['PME', 'Agences', 'Retail & Distribution', 'Industrie', 'Services'],
    exemples: [
      {
        ctx: 'PME industrielle — 80 employés',
        desc: '100 CVs triés en 10 minutes pour un poste d\'opérateur. Le RH reçoit les 5 meilleurs profils avec un résumé comparatif — zéro lecture manuelle.',
      },
      {
        ctx: 'Agence marketing — 30 personnes',
        desc: 'L\'onboarding de chaque nouveau collaborateur est entièrement automatisé : contrats, accès, formation initiale et check-ins à J+15, J+30 et J+90.',
      },
    ],
    integrationsCompatibles: ['Google Workspace', 'Microsoft 365', 'Notion', 'Slack', 'BambooHR', 'Calendly'],
    faq: [
      {
        q: 'Est-ce conforme au RGPD ?',
        a: 'Oui. Les données des candidats sont traitées selon le RGPD : consentement explicite, durée de conservation définie et droit à l\'oubli automatiquement appliqué.',
      },
      {
        q: 'Peut-il gérer des conventions collectives spécifiques ?',
        a: 'Il peut être configuré avec vos accords d\'entreprise, conventions et règles internes pour répondre précisément à chaque situation particulière.',
      },
      {
        q: 'Remplace-t-il un DRH humain ?',
        a: 'Non — il gère l\'administratif et les questions courantes. Votre DRH se concentre sur le management, le développement des talents et les situations sensibles.',
      },
    ],
  },
  {
    id: 'juridique',
    name: 'Juridique IA',
    color: '#6d28d9',
    img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=640&h=380&fit=crop&q=85&auto=format',
    desc: 'Contrats, CGV, clauses spécifiques — rédigés et analysés en quelques secondes. Signez en confiance sans attendre un avocat ni payer 500 €/heure.',
    missions: [
      'Rédaction de contrats sur mesure',
      'Analyse des risques contractuels',
      'Mise en conformité RGPD',
      'Veille juridique sectorielle automatisée',
    ],
    resultats: [
      { val: '−80 %', lbl: 'de coûts juridiques courants' },
      { val: '< 5 min', lbl: 'pour un contrat complet' },
    ],
    fonctionnalites: [
      'Rédaction de contrats sur mesure en < 5 min',
      'Analyse des risques contractuels',
      'Conformité RGPD automatisée',
      'Veille juridique sectorielle hebdomadaire',
      'Bibliothèque de modèles personnalisables',
      'Révision et suggestions de clauses protectrices',
    ],
    secteurs: ['Agences & Freelances', 'Startups', 'E-commerce', 'Immobilier', 'Conseil'],
    exemples: [
      {
        ctx: 'Freelance consultant — activité solo',
        desc: 'Chaque proposition commerciale génère automatiquement un contrat adapté avec clauses de propriété intellectuelle et conditions de paiement sur mesure.',
      },
      {
        ctx: 'Startup en croissance — 20 personnes',
        desc: 'CGV, contrats de prestation, accords de confidentialité : tous générés et mis à jour automatiquement dès que la législation évolue.',
      },
    ],
    integrationsCompatibles: ['Google Drive', 'DocuSign', 'Gmail', 'Notion', 'Slack', 'HubSpot'],
    faq: [
      {
        q: 'L\'IA peut-elle remplacer un avocat ?',
        a: 'Pour les contrats courants, oui. Pour les litiges, fusions-acquisitions ou contentieux complexes, elle prépare le dossier mais un avocat reste indispensable.',
      },
      {
        q: 'Est-elle à jour des dernières lois ?',
        a: 'Elle est mise à jour chaque semaine. Dès qu\'une loi impactant votre secteur évolue, vous recevez une alerte avec les modifications à apporter à vos documents.',
      },
      {
        q: 'Peut-elle analyser des contrats reçus de partenaires ?',
        a: 'Oui — importez le document, elle identifie les clauses risquées, les zones d\'ambiguïté et suggère des modifications protectrices en quelques secondes.',
      },
    ],
  },
  {
    id: 'seo',
    name: 'SEO IA',
    color: '#059669',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=380&fit=crop&q=85&auto=format',
    desc: 'Articles de blog, pages et fiches optimisés pour Google chaque semaine. Vos clients vous trouvent avant vos concurrents — sans que vous écriviez une seule ligne.',
    missions: [
      'Rédaction d\'articles de blog SEO-optimisés',
      'Optimisation des pages existantes',
      'Recherche de mots-clés et opportunités',
      'Reporting de positionnement hebdomadaire',
    ],
    resultats: [
      { val: '91/100', lbl: 'score SEO moyen obtenu' },
      { val: '×3', lbl: 'de trafic organique en 6 mois' },
    ],
    fonctionnalites: [
      'Articles SEO publiés chaque semaine',
      'Audit et optimisation des pages existantes',
      'Recherche de mots-clés et opportunités',
      'Maillage interne automatisé',
      'Fiches produits et pages de service optimisées',
      'Reporting de positionnement hebdomadaire',
    ],
    secteurs: ['E-commerce', 'Services locaux', 'Startups SaaS', 'Professions libérales', 'Artisans'],
    exemples: [
      {
        ctx: 'E-commerce mode — 500 références',
        desc: 'Chaque fiche produit est réoptimisée avec les bons mots-clés, une description unique et le balisage structuré. Trafic organique ×2,8 en 4 mois.',
      },
      {
        ctx: 'Cabinet d\'expertise comptable',
        desc: '4 articles de blog publiés chaque mois sur des requêtes locales ciblées. 1ère page Google sur 12 mots-clés stratégiques en 90 jours.',
      },
    ],
    integrationsCompatibles: ['WordPress', 'Webflow', 'Google Search Console', 'Ahrefs', 'Notion', 'Slack'],
    faq: [
      {
        q: 'Le contenu est-il détectable comme IA par Google ?',
        a: 'Non, si produit avec notre méthode. Chaque article est personnalisé avec vos exemples, votre ton et votre expertise réelle. Google récompense la valeur, pas la source.',
      },
      {
        q: 'Combien de temps avant les premiers résultats ?',
        a: 'Entre 6 et 12 semaines pour les premières remontées, 3 à 6 mois pour un impact significatif. Le SEO est un investissement moyen terme, pas une campagne.',
      },
      {
        q: 'Peut-il travailler sur un site existant avec du contenu ?',
        a: 'Oui. Il commence par auditer ce qui existe, identifie ce qui freine votre positionnement et optimise avant de produire du nouveau contenu.',
      },
    ],
  },
  {
    id: 'comptable',
    name: 'Comptable IA',
    color: '#d97706',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=640&h=380&fit=crop&q=85&auto=format',
    desc: 'Factures, rapprochements bancaires, relances impayés, déclarations — gérés en temps réel. Vos fins de mois cessent d\'être chaotiques.',
    missions: [
      'Génération et envoi automatique des factures',
      'Rapprochement bancaire automatisé',
      'Relances impayés par séquences',
      'Tableaux de bord financiers mensuels',
    ],
    resultats: [
      { val: '−35 %', lbl: 'd\'impayés après 90 jours' },
      { val: '< 1 min', lbl: 'pour générer une facture' },
    ],
    fonctionnalites: [
      'Génération et envoi automatique des factures',
      'Rapprochement bancaire automatisé',
      'Séquences de relance impayés J+15, J+30, J+45',
      'Tableaux de bord financiers en temps réel',
      'Déclarations TVA préparées automatiquement',
      'Alertes trésorerie et seuils critiques',
    ],
    secteurs: ['Freelances & Indépendants', 'PME', 'E-commerce', 'Agences', 'Professions libérales'],
    exemples: [
      {
        ctx: 'Consultant indépendant',
        desc: 'Chaque mission terminée génère une facture automatique, envoyée par email avec relance à J+15, J+30 et J+45 si impayée. Temps passé sur la compta : zéro.',
      },
      {
        ctx: 'Agence de communication — 15 personnes',
        desc: 'Chaque fin de mois, le Comptable IA réconcilie les transactions, identifie les anomalies et prépare un tableau de bord complet pour le cabinet comptable.',
      },
    ],
    integrationsCompatibles: ['Stripe', 'Pennylane', 'QuickBooks', 'Gmail', 'Notion', 'Slack', 'Google Sheets'],
    faq: [
      {
        q: 'Remplace-t-il mon expert-comptable ?',
        a: 'Non — il gère l\'administratif et prépare les données. Votre expert-comptable travaille avec des dossiers propres et passe moins de temps sur les tâches de base.',
      },
      {
        q: 'Que se passe-t-il si une facture est contestée ?',
        a: 'Il vous alerte immédiatement, archive la réponse du client et vous propose un modèle d\'avoir ou de réponse adaptée selon la situation.',
      },
      {
        q: 'Est-ce sécurisé pour mes données financières ?',
        a: 'Oui. Toutes les données sont chiffrées AES-256, hébergées en France et traitées selon le RGPD. Aucune donnée ne transite vers des tiers sans votre accord.',
      },
    ],
  },
]

/* ══════════════════════════════════════════════════
   FAQ ITEM — accordion
══════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════
   COLLABORATEUR PANEL — contenu du drawer
══════════════════════════════════════════════════ */
function CollaborateurPanel({ collab, onClose }) {
  const CheckIcon = () => (
    <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

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

        {/* Hero image */}
        <div className="dd-hero-img-wrap">
          <img src={collab.img} alt={collab.name} className="dd-hero-img" loading="eager" />
          <div className="dd-hero-fade" />
        </div>

        <div className="dd-hero-info">
          <div className="dd-badge dd-badge--active">
            <span className="dd-badge-dot" />
            Actif 24/7
          </div>
          <h2 className="dd-title">{collab.name}</h2>
          <p className="dd-lead">{collab.desc}</p>
        </div>

        {/* Missions */}
        <div className="dd-section">
          <p className="dd-section-title">Missions</p>
          <ul className="dd-list">
            {collab.missions.map(m => (
              <li key={m}>
                <span className="dd-list-dot"><CheckIcon /></span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Fonctionnalités */}
        <div className="dd-section">
          <p className="dd-section-title">Fonctionnalités</p>
          <div className="dd-chips">
            {collab.fonctionnalites.map(f => (
              <span key={f} className="dd-chip">{f}</span>
            ))}
          </div>
        </div>

        {/* Secteurs */}
        <div className="dd-section">
          <p className="dd-section-title">Secteurs concernés</p>
          <div className="dd-sectors">
            {collab.secteurs.map(s => (
              <span key={s} className="dd-sector">{s}</span>
            ))}
          </div>
        </div>

        {/* Gains */}
        <div className="dd-section">
          <p className="dd-section-title">Gains estimés</p>
          <div className="dd-metrics">
            {collab.resultats.map(r => (
              <div key={r.lbl} className="dd-metric">
                <span className="dd-metric-val">{r.val}</span>
                <span className="dd-metric-lbl">{r.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exemples */}
        <div className="dd-section">
          <p className="dd-section-title">Exemples d&apos;utilisation</p>
          <div className="dd-examples">
            {collab.exemples.map(ex => (
              <div key={ex.ctx} className="dd-example">
                <p className="dd-example-ctx">📌 {ex.ctx}</p>
                <p className="dd-example-desc">{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Intégrations */}
        <div className="dd-section">
          <p className="dd-section-title">Intégrations compatibles</p>
          <div className="dd-int-chips">
            {collab.integrationsCompatibles.map(i => (
              <span key={i} className="dd-int-chip">{i}</span>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="dd-section">
          <p className="dd-section-title">Questions fréquentes</p>
          <div className="dd-faq">
            {collab.faq.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        <div className="dd-spacer" />
      </div>

      {/* Footer CTAs */}
      <div className="dd-footer">
        <Link to="/contact" className="dd-btn dd-btn--primary" onClick={onClose}>
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M1 5l6 4 6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Demander une démonstration
        </Link>
        <Link to="/contact" className="dd-btn dd-btn--outline" onClick={onClose}>
          Demander un devis
        </Link>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function CollaborateursIA() {
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    /* ── Canvas particle network ── */
    const canvas = document.getElementById('caiCanvas')
    let animFrameCanvas
    if (canvas) {
      const ctx = canvas.getContext('2d')
      let W, H, pts = []
      const N = 60, LINK = 120

      function resize() {
        W = canvas.width  = canvas.offsetWidth
        H = canvas.height = canvas.offsetHeight
      }
      window.addEventListener('resize', resize, { passive: true })
      resize()

      function rnd(a, b) { return a + Math.random() * (b - a) }
      for (let i = 0; i < N; i++) {
        pts.push({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-.25, .25), vy: rnd(-.25, .25), r: rnd(1, 2) })
      }

      function frame() {
        ctx.clearRect(0, 0, W, H)
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x = W
          if (p.x > W) p.x = 0
          if (p.y < 0) p.y = H
          if (p.y > H) p.y = 0
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0,102,255,.5)'
          ctx.fill()
        })
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d < LINK) {
              ctx.beginPath()
              ctx.moveTo(pts[i].x, pts[i].y)
              ctx.lineTo(pts[j].x, pts[j].y)
              ctx.strokeStyle = `rgba(0,102,255,${.10 * (1 - d / LINK)})`
              ctx.lineWidth = 1
              ctx.stroke()
            }
          }
        }
        animFrameCanvas = requestAnimationFrame(frame)
      }
      frame()
    }

    /* ── Mouse parallax on halos ── */
    let haloRaf
    const h1 = document.getElementById('halo1')
    const h2 = document.getElementById('halo2')
    const h3 = document.getElementById('halo3')
    let t1x=0,t1y=0, t2x=0,t2y=0, t3x=0,t3y=0
    let c1x=0,c1y=0, c2x=0,c2y=0, c3x=0,c3y=0

    function lerp(a, b, t) { return a + (b - a) * t }
    function haloTick() {
      haloRaf = null
      c1x = lerp(c1x, t1x, .06); c1y = lerp(c1y, t1y, .06)
      c2x = lerp(c2x, t2x, .04); c2y = lerp(c2y, t2y, .04)
      c3x = lerp(c3x, t3x, .05); c3y = lerp(c3y, t3y, .05)
      if (h1) h1.style.transform = `translate(${c1x}px,${c1y}px)`
      if (h2) h2.style.transform = `translate(${c2x}px,${c2y}px)`
      if (h3) h3.style.transform = `translate(${c3x}px,${c3y}px)`
      const done = Math.abs(c1x-t1x)<.4 && Math.abs(c1y-t1y)<.4
      if (!done) haloRaf = requestAnimationFrame(haloTick)
    }

    function onMouseMove(e) {
      const mx = (e.clientX / window.innerWidth  - .5) * 2
      const my = (e.clientY / window.innerHeight - .5) * 2
      t1x = mx * -28; t1y = my * -18
      t2x = mx *  18; t2y = my *  14
      t3x = mx * -14; t3y = my * -22
      if (!haloRaf) haloRaf = requestAnimationFrame(haloTick)
    }
    if (h1) window.addEventListener('mousemove', onMouseMove, { passive: true })

    /* ── Scroll reveal ── */
    const revealEls = document.querySelectorAll('.cai-reveal')
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(revealEls).indexOf(entry.target)
          setTimeout(() => entry.target.classList.add('visible'), idx * 80)
          revealObs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    revealEls.forEach(el => revealObs.observe(el))

    return () => {
      if (animFrameCanvas) cancelAnimationFrame(animFrameCanvas)
      if (haloRaf) cancelAnimationFrame(haloRaf)
      if (h1) window.removeEventListener('mousemove', onMouseMove)
      revealObs.disconnect()
    }
  }, [])

  const openDrawer = useCallback(c => setSelected(c), [])
  const closeDrawer = useCallback(() => setSelected(null), [])

  return (
    <>
      {/* ════════════════════════════ HERO */}
      <section className="cai-hero">
        <canvas className="cai-canvas" id="caiCanvas" aria-hidden="true" />
        <div className="cai-grid" aria-hidden="true" />
        <div className="cai-halo cai-halo-1" id="halo1" aria-hidden="true" />
        <div className="cai-halo cai-halo-2" id="halo2" aria-hidden="true" />
        <div className="cai-halo cai-halo-3" id="halo3" aria-hidden="true" />

        <div className="cai-hero-inner">
          <div className="cai-hero-left">
            <p className="cai-kicker cai-anim-0">
              <span />Vos nouvelles recrues · Toujours disponibles<span />
            </p>
            <h1 className="cai-anim-1">
              Arrêtez de faire<br />
              <em>ce que l'IA peut faire.</em>
            </h1>
            <p className="cai-hero-sub cai-anim-2">
              Vos relances, vos réponses, vos contrats, vos factures. Nos collaborateurs IA s'en chargent. Vous vous concentrez sur ce qui fait vraiment avancer votre entreprise.
            </p>
            <div className="cai-hero-btns cai-anim-3">
              <a
                href="#collaborateurs"
                className="btn-primary"
                onClick={e => { e.preventDefault(); document.getElementById('collaborateurs')?.scrollIntoView({ behavior: 'smooth' }) }}
              >
                Découvrir nos collaborateurs →
              </a>
              <Link to="/contact" className="btn-outline">Demander une démo</Link>
            </div>
          </div>

          <div className="cai-hero-right" aria-hidden="true">
            <div className="cai-hero-photo-wrap">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=620&h=560&fit=crop&q=85&auto=format"
                alt="Équipe CA-TECH"
                loading="eager" decoding="async" width="620" height="560"
              />
              <div className="cai-hero-photo-overlay" />
            </div>
            <div className="cai-metric m-1">
              <span className="cai-metric-num">847</span>
              <span className="cai-metric-lbl">tickets résolus ce mois</span>
            </div>
            <div className="cai-metric m-2">
              <span className="cai-metric-num"><em>×3</em></span>
              <span className="cai-metric-lbl">leads générés</span>
            </div>
            <div className="cai-metric m-3">
              <span className="cai-metric-num">98<em>%</em></span>
              <span className="cai-metric-lbl">satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════ COLLABORATEURS */}
      <section className="cai-section" id="collaborateurs">
        <div className="cai-section-header cai-reveal">
          <p className="cai-section-label">Nos Collaborateurs IA</p>
          <h2 className="cai-section-title">Ils travaillent.<br /><em>Vous décidez.</em></h2>
          <p className="cai-section-desc">
            Chaque agent est spécialisé sur son domaine et opérationnel en 48h. Vous récupérez du temps dès la première semaine.
          </p>
        </div>

        <div className="cai-col-grid">
          {COLLABORATEURS.map(c => (
            <article key={c.id} className="cai-col-card cai-reveal" style={{ '--col-color': c.color }}>

              {/* Image */}
              <div className="cai-col-img">
                <img src={c.img} alt={c.name} loading="lazy" decoding="async" width="640" height="380" />
                <div className="cai-col-img-overlay" />
                <span className="cai-col-status">
                  <span className="cai-col-dot" />
                  Actif
                </span>
              </div>

              {/* Body */}
              <div className="cai-col-body">
                <h3 className="cai-col-name">{c.name}</h3>
                <p className="cai-col-desc">{c.desc}</p>

                {/* Missions */}
                <p className="cai-col-missions-label">Missions</p>
                <ul className="cai-col-missions">
                  {c.missions.map(m => (
                    <li key={m}>
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M4 8l2.5 2.5L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {m}
                    </li>
                  ))}
                </ul>

                {/* Résultats */}
                <div className="cai-col-resultats">
                  {c.resultats.map(r => (
                    <div key={r.lbl} className="cai-col-resultat">
                      <span className="cai-col-res-val">{r.val}</span>
                      <span className="cai-col-res-lbl">{r.lbl}</span>
                    </div>
                  ))}
                </div>

                {/* CTA — ouvre le drawer */}
                <button
                  className="cai-col-cta cai-col-cta--outline"
                  onClick={() => openDrawer(c)}
                  aria-label={`Voir la fiche complète — ${c.name}`}
                >
                  Voir la fiche complète
                  <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════════════════ CTA */}
      <section className="cai-cta">
        <div className="cai-cta-inner cai-reveal">
          <p className="cai-cta-kicker">Passez à l'action</p>
          <h2>Arrêtez de faire <strong>ce que l'IA peut faire à votre place.</strong></h2>
          <p>Choisissez vos agents. Notre équipe les déploie en 48h. Vous récupérez du temps dès la première semaine et vous le réinvestissez dans ce qui compte.</p>
          <div className="cai-cta-btns">
            <Link to="/contact" className="btn-cta-white">Demander une démonstration →</Link>
            <a
              href="#collaborateurs"
              className="btn-cta-outline"
              onClick={e => { e.preventDefault(); document.getElementById('collaborateurs')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Revoir les collaborateurs
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════ DRAWER */}
      <DetailDrawer open={!!selected} onClose={closeDrawer} accentColor={selected?.color}>
        {selected && <CollaborateurPanel collab={selected} onClose={closeDrawer} />}
      </DetailDrawer>
    </>
  )
}
