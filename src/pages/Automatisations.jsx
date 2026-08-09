import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Automatisations.css'
import { usePageMeta } from '../lib/seo'
import { useJsonLd, webPageSchema, breadcrumbSchema, serviceSchema } from '../lib/schema'
import { SeoRelated } from '../components/SeoContent'

/* ══════════════════════════════════════════════════════════
   URLs Unsplash — photos business premium
══════════════════════════════════════════════════════════ */
const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`

/* ══════════════════════════════════════════════════════════
   14 SERVICES MÉTIER
══════════════════════════════════════════════════════════ */
const AUTO_RELATED = [
  { href: '/collaborateurs-ia',       label: 'Collaborateurs IA',          icon: '🤖', desc: '6 agents autonomes 24h/24' },
  { href: '/realisations',            label: 'Études de cas',              icon: '🏆', desc: 'ROI ×4 mesuré sur missions réelles' },
  { href: '/tarifs',                  label: 'Tarifs',                     icon: '💰', desc: 'À partir de 800 €' },
  { href: '/creation-site-vitrine',   label: 'Création de site vitrine',   icon: '🌐', desc: 'Site pro livré en 3 semaines' },
  { href: '/creation-site-ecommerce', label: 'Boutique e-commerce',        icon: '🛒', desc: 'Vente en ligne clé en main' },
  { href: '/maintenance-site-web',    label: 'Maintenance de site web',    icon: '🔧', desc: 'À partir de 49 €/mois' },
  { href: '/automatisation-pme',      label: 'Automatisation PME',         icon: '🏭', desc: 'Guide complet pour PME' },
  { href: '/contact',                 label: 'Diagnostic gratuit',         icon: '→',  desc: 'Identifiez vos 3 processus clés' },
]

const SERVICES = [
  {
    id: 'devis-auto',
    cat: 'commercial',
    image: U('1556761175-b413da4baf72'),
    name: 'Génération automatique de devis',
    benefit: 'Un devis professionnel envoyé en moins de 2 minutes, 24h/24 — sans ouvrir un fichier.',
    gains: [
      '−90 % de temps sur chaque devis',
      'Zéro erreur de calcul ou de saisie',
      'Devis envoyé avant que le concurrent décroche',
    ],
    result: '+35 % de taux de transformation',
    color: '#0066FF',
  },
  {
    id: 'qualification-prospects',
    cat: 'commercial',
    image: '/collaborateurs/commercial-ia.webp',
    name: 'Qualification automatique des prospects',
    benefit: 'Chaque lead est scoré, trié et assigné au bon commercial en temps réel.',
    gains: [
      'Aucun prospect qualifié manqué',
      'Priorisation automatique par potentiel',
      'Commercial prévenu en moins de 5 min',
    ],
    result: '+40 % d\'efficacité commerciale',
    color: '#7c3aed',
  },
  {
    id: 'relance-devis',
    cat: 'commercial',
    image: U('1552664730-d307ca884978'),
    name: 'Relance automatique des devis',
    benefit: 'Vos devis sans réponse sont relancés automatiquement au bon moment, avec le bon ton.',
    gains: [
      'Séquence de relance sur 7 à 21 jours',
      'Message adapté selon l\'avancement',
      'Zéro devis oublié dans la pile',
    ],
    result: '+25 % de devis signés récupérés',
    color: '#d97706',
  },
  {
    id: 'reponse-emails',
    cat: 'communication',
    image: '/automatisations/gmail.webp',
    name: 'Réponse automatique aux emails',
    benefit: 'Chaque email entrant reçoit une réponse personnalisée en moins de 5 minutes.',
    gains: [
      'Réponse 24h/24, 7j/7',
      'Contenu adapté au sujet détecté',
      'Transfert automatique aux bons interlocuteurs',
    ],
    result: '−80 % de temps de traitement email',
    color: '#0891b2',
  },
  {
    id: 'assistant-tel',
    cat: 'communication',
    image: U('1551836022-d5d88e9218df'),
    name: 'Assistant téléphonique IA',
    benefit: 'Un assistant vocal prend vos appels, qualifie et transfère selon vos règles — même en réunion.',
    gains: [
      'Aucun appel manqué, jamais',
      'Qualification vocale intelligente',
      'Rappel automatique programmé',
    ],
    result: '0 appel perdu — 100 % des leads traités',
    color: '#059669',
  },
  {
    id: 'support-client',
    cat: 'communication',
    image: '/collaborateurs/support-ia.webp',
    name: 'Support client 24h/24',
    benefit: 'Un agent IA répond à vos clients sur tous les canaux — email, chat, WhatsApp — sans interruption.',
    gains: [
      'Réponse instantanée à toute heure',
      'Résolution autonome des cas simples',
      'Escalade vers l\'humain si nécessaire',
    ],
    result: '−60 % de tickets non résolus',
    color: '#dc2626',
  },
  {
    id: 'facturation-auto',
    cat: 'finance',
    image: U('1554224155-8d04cb21cd6c'),
    name: 'Facturation automatique',
    benefit: 'Chaque paiement reçu génère automatiquement une facture conforme et l\'envoie au client.',
    gains: [
      'Facture envoyée en < 30 secondes',
      'Conformité légale garantie',
      'Comptabilité mise à jour en temps réel',
    ],
    result: 'Zéro facture manquante ou en retard',
    color: '#6366f1',
  },
  {
    id: 'signature-elec',
    cat: 'finance',
    image: '/collaborateurs/juridique-ia.webp',
    name: 'Signature électronique',
    benefit: 'Vos contrats et devis sont signés en quelques clics — sans impression, sans déplacement.',
    gains: [
      'Signature en moins de 5 minutes',
      'Valeur légale certifiée',
      'Archivage automatique du document signé',
    ],
    result: '−70 % de délai de closing',
    color: '#0066FF',
  },
  {
    id: 'prise-rdv',
    cat: 'commercial',
    image: '/automatisations/google-calendar.webp',
    name: 'Prise de rendez-vous automatique',
    benefit: 'Vos prospects réservent un créneau directement dans votre agenda — sans aller-retour d\'emails.',
    gains: [
      '−40 % de no-show grâce aux rappels',
      'Agenda synchronisé en temps réel',
      'Email de préparation envoyé automatiquement',
    ],
    result: '2× plus de rendez-vous qualifiés',
    color: '#0891b2',
  },
  {
    id: 'automatisation-rh',
    cat: 'rh',
    image: '/collaborateurs/rh-ia.webp',
    name: 'Automatisation RH',
    benefit: 'Onboarding, congés, notes de frais, contrats — tous vos processus RH en pilote automatique.',
    gains: [
      'Onboarding complet sans intervention manuelle',
      'Validation des congés en 1 clic',
      'Contrats générés et envoyés automatiquement',
    ],
    result: '−50 % de charge administrative RH',
    color: '#d97706',
  },
  {
    id: 'gestion-docs',
    cat: 'rh',
    image: U('1450101499163-c8848c66ca85'),
    name: 'Gestion documentaire',
    benefit: 'Vos documents sont classés, nommés et archivés automatiquement — retrouvables en 3 secondes.',
    gains: [
      'Classement automatique à la réception',
      'Nommage intelligent par IA',
      'Recherche instantanée par contenu',
    ],
    result: 'Zéro document perdu ou mal classé',
    color: '#059669',
  },
  {
    id: 'prospection-auto',
    cat: 'commercial',
    image: U('1560250097-0b93528c311a'),
    name: 'Prospection commerciale automatique',
    benefit: 'Votre pipeline est alimenté en continu avec des prospects qualifiés — sans prospection manuelle.',
    gains: [
      '500+ prospects qualifiés par semaine',
      'Séquence de contact multicanale',
      'Réponses positives remontées en priorité',
    ],
    result: '3× plus de leads sans effort supplémentaire',
    color: '#dc2626',
  },
  {
    id: 'reporting-auto',
    cat: 'reporting',
    image: U('1551288049-bebda4e38f71'),
    name: 'Reporting automatique',
    benefit: 'Vos KPIs et tableaux de bord sont générés et envoyés automatiquement, à la bonne fréquence.',
    gains: [
      'Rapport quotidien à l\'heure choisie',
      'Données consolidées de tous vos outils',
      'Alerte immédiate en cas d\'anomalie',
    ],
    result: 'Décisions toujours basées sur des données à jour',
    color: '#7c3aed',
  },
  {
    id: 'crm-intelligent',
    cat: 'commercial',
    image: '/automatisations/automatisation-hero.webp',
    name: 'CRM intelligent',
    benefit: 'Votre CRM se met à jour seul — chaque appel, email, réunion et action tracé automatiquement.',
    gains: [
      'Zéro saisie manuelle dans le CRM',
      'Historique client complet et toujours à jour',
      'Relances intelligentes basées sur le contexte',
    ],
    result: '−80 % de temps de saisie CRM',
    color: '#0066FF',
  },
]

const CATS = [
  { key: 'tous',          label: 'Tous les services' },
  { key: 'commercial',   label: 'Commercial & Vente' },
  { key: 'communication',label: 'Communication' },
  { key: 'finance',      label: 'Finance' },
  { key: 'rh',           label: 'RH & Admin' },
  { key: 'reporting',    label: 'Reporting' },
]

const TECHS = [
  { name: 'Make',             color: '#6c5ecf' },
  { name: 'n8n',              color: '#ea4b35' },
  { name: 'Zapier',           color: '#ff4a00' },
  { name: 'OpenAI',           color: '#10a37f' },
  { name: 'Google Workspace', color: '#4285F4' },
  { name: 'Microsoft 365',    color: '#0078D4' },
  { name: 'HubSpot',          color: '#FF7A59' },
  { name: 'Stripe',           color: '#635BFF' },
  { name: 'Calendly',         color: '#006BFF' },
  { name: 'WhatsApp Business',color: '#25D366' },
  { name: 'Slack',            color: '#4A154B' },
  { name: 'Notion',           color: '#191919' },
  { name: 'Airtable',         color: '#18bfff' },
  { name: 'Twilio',           color: '#F22F46' },
  { name: 'LinkedIn',         color: '#0A66C2' },
  { name: 'Brevo',            color: '#0B996E' },
]

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function Automatisations() {
  const [active, setActive] = useState('tous')
  const heroVideoRef = useRef(null)
  const heroVideoWrapRef = useRef(null)

  usePageMeta({
    title: "Automatisation d'entreprise — Récupérez 14h/semaine · CA-TECH",
    description: "Automatisations N8N, Make, Zapier pour PME. Workflows, intégrations API, synchro CRM. 14h récupérées par semaine dès le 1er mois. Déployé en 48h.",
    keywords: 'automatisation entreprise, automatisation processus métier, workflow n8n, Make, Zapier, intégration API, synchronisation CRM, RPA PME, gagner du temps, automatiser tâches répétitives',
    path: '/automatisations',
  })
  useJsonLd('auto-page', webPageSchema({
    name: "Automatisations N8N, Make, Zapier pour PME — CA-TECH",
    description: "Automatisations N8N, Make, Zapier pour PME. Workflows, intégrations API, synchro CRM. 14h récupérées par semaine dès le 1er mois. Déployé en 48h.",
    path: '/automatisations',
    image: '/automatisations/automatisation-hero.webp',
    speakableCssSelectors: ['h1', '.aut-hero-sub'],
  }))
  useJsonLd('breadcrumb', breadcrumbSchema([
    { name: 'Accueil', path: '/' },
    { name: 'Automatisations', path: '/automatisations' },
  ]))
  useJsonLd('service-auto', serviceSchema({
    name: "Automatisation d'entreprise — N8N, Make, Zapier",
    description: "Automatisation de workflows métier pour PME : intégrations, synchronisations, orchestration n8n / Make / Zapier. Résultats mesurables : 14 heures récupérées par semaine.",
    path: '/automatisations',
    serviceType: 'Business Process Automation',
    priceRange: '€€',
    offers: [
      { '@type': 'Offer', name: 'Automatisation sur mesure', price: '800', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: 'https://www.ca-tech.fr/automatisations' },
    ],
  }))

  const visible = useMemo(
    () => active === 'tous' ? SERVICES : SERVICES.filter(s => s.cat === active),
    [active]
  )

  useEffect(() => {
    const wrap = heroVideoWrapRef.current
    if (wrap) requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('ready')))
    const video = heroVideoRef.current
    if (!video) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => { if (mq.matches) video.pause(); else video.play().catch(() => {}) }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
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

    const revEls = document.querySelectorAll('.at-reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    revEls.forEach(el => obs.observe(el))

    return () => {
      if (animId) cancelAnimationFrame(animId)
      obs.disconnect()
    }
  }, [])

  return (
    <>
      {/* ════════ HERO ════════ */}
      <section className="at-hero">
        <canvas className="at-canvas" id="atCanvas" aria-hidden="true" />
        <div className="at-grid-bg" aria-hidden="true" />
        <div className="at-halo at-halo-1" aria-hidden="true" />
        <div className="at-halo at-halo-2" aria-hidden="true" />
        <div className="at-halo at-halo-3" aria-hidden="true" />

        <div className="at-hero-inner">
          {/* Colonne vidéo — GAUCHE */}
          <div className="at-hero-video-col" aria-hidden="true">
            <div className="at-hero-video-wrap" ref={heroVideoWrapRef}>
              <video
                ref={heroVideoRef}
                autoPlay muted loop playsInline preload="metadata"
                className="at-hero-video"
                poster="/automatisations/automatisation-hero.webp"
                aria-label="Démonstration des automatisations CA-TECH"
              >
                <source src="/automatisations/Automatisations.mp4" type="video/mp4" />
              </video>
              <div className="at-hero-video-overlay" />
            </div>
          </div>

          {/* Colonne contenu — DROITE */}
          <div className="at-hero-content">
            <p className="at-kicker at-a0"><span />Automatisations métier · CA-TECH<span /></p>
            <h1 className="at-a1">
              Automatisez vos processus —<br /><em>N8N, Make, Zapier : 14h récupérées/<wbr />semaine.</em>
            </h1>
            <p className="at-hero-sub at-a2">
              14 services d'automatisation prêts à déployer. Chaque heure récupérée, chaque lead traité, chaque facture envoyée — sans que vous leviez le petit doigt.
            </p>

            <div className="at-stats at-a3">
              <div>
                <div className="at-stat-val">14<em>+</em></div>
                <div className="at-stat-lbl">Services</div>
              </div>
              <div>
                <div className="at-stat-val">48<em>h</em></div>
                <div className="at-stat-lbl">Déploiement</div>
              </div>
              <div>
                <div className="at-stat-val">15<em>h</em></div>
                <div className="at-stat-lbl">Récupérées / semaine</div>
              </div>
              <div>
                <div className="at-stat-val">30<em>j</em></div>
                <div className="at-stat-lbl">ROI visible</div>
              </div>
            </div>

            <div className="at-hero-ctas at-a4">
              <a
                href="#services"
                className="btn-primary"
                onClick={e => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) }}
              >
                Voir les services →
              </a>
              <Link to="/contact" className="btn-outline">Demander une démo gratuite</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ SERVICES CATALOGUE ════════ */}
      <section className="aut-section" id="services">
        <div className="aut-inner">

          <div className="aut-header at-reveal">
            <span className="aut-label">14 services d'automatisation</span>
            <h2 className="aut-title">Choisissez votre <em>problème métier.</em></h2>
            <p className="aut-desc">
              Nous automatisons les tâches qui vous coûtent du temps, de l'argent et de l'énergie.<br />
              Aucune connaissance technique requise. Opérationnel en 48h.
            </p>
          </div>

          {/* Filtres */}
          <div className="aut-filters">
            <div className="aut-filters-inner">
              {CATS.map(c => (
                <button
                  key={c.key}
                  className={`aut-filter-btn${active === c.key ? ' aut-filter-btn--active' : ''}`}
                  onClick={() => setActive(c.key)}
                >
                  {c.label}
                </button>
              ))}
              <span className="aut-count">{visible.length} service{visible.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Grille de cartes */}
          <div className="aut-grid">
            {visible.map(s => (
              <article key={s.id} className="aut-card at-reveal">

                {/* Image premium */}
                <div className="aut-card-visual">
                  <img src={s.image} alt={s.name} loading="lazy" />
                  <div className="aut-card-visual-overlay" />
                  <span className="aut-card-cat-badge">
                    {CATS.find(c => c.key === s.cat)?.label ?? s.cat}
                  </span>
                </div>

                {/* Corps */}
                <div className="aut-card-body">
                  <h3 className="aut-card-name">{s.name}</h3>
                  <p className="aut-card-benefit">{s.benefit}</p>

                  <div className="aut-card-divider" />

                  <p className="aut-gains-label">Ce que vous gagnez</p>
                  <ul className="aut-gains">
                    {s.gains.map(g => (
                      <li key={g}>
                        <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <circle cx="7" cy="7" r="6.5" fill={s.color} fillOpacity=".12" />
                          <polyline points="3.5 7 5.5 9.5 10.5 4.5" stroke={s.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {g}
                      </li>
                    ))}
                  </ul>

                  <div className="aut-result" style={{ borderColor: s.color + '30', background: s.color + '08' }}>
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: s.color }}>
                      <polyline points="1 11 5 7 9 10 15 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="11 3 15 3 15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ color: s.color }}>{s.result}</span>
                  </div>

                  <Link to="/contact" className="aut-card-btn" style={{ background: s.color }}>
                    Découvrir ce service →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ POURQUOI ════════ */}
      <section className="at-why-section">
        <div className="at-why-inner">
          <div className="at-sec-head at-reveal">
            <p className="at-sec-label">Notre différence</p>
            <h2 className="at-sec-h">Ce que vous obtenez <em>concrètement.</em></h2>
          </div>
          <div className="at-why-grid">
            {[
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                title: 'Opérationnel en 48h',
                desc: 'Vous récupérez du temps dans les 2 jours. Pas dans 2 mois. Pas après une formation interminable.',
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
                title: 'Adapté à votre métier',
                desc: 'Vos outils, votre secteur, vos habitudes. On s\'adapte à vous — pas l\'inverse. Aucune solution générique.',
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>,
                title: 'Accompagnement inclus',
                desc: 'On configure, on monitore, on corrige. Si quelque chose déraille, on intervient sous 4h — avant même que vous le remarquiez.',
              },
              {
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
                title: 'Rentable dès le 1er mois',
                desc: '14 heures récupérées par semaine. Des relances automatiques. Des factures envoyées seules. Visible avant la fin du mois.',
              },
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

      {/* ════════ TECHNOLOGIES ════════ */}
      <section className="aut-tech-section">
        <div className="aut-tech-inner">
          <p className="aut-tech-label">Technologies utilisées</p>
          <p className="aut-tech-sub">Nous choisissons les meilleurs outils du marché — invisibles pour vous, puissants pour vos résultats.</p>
          <div className="aut-tech-grid">
            {TECHS.map(t => (
              <div key={t.name} className="aut-tech-chip">
                <span className="aut-tech-dot" style={{ background: t.color }} />
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoRelated
        eyebrow="Aller plus loin"
        title="Solutions complémentaires"
        links={AUTO_RELATED}
      />

      {/* ════════ CTA ════════ */}
      <section className="at-cta">
        <div className="at-cta-inner at-reveal">
          <p className="at-cta-kicker">Passez à l'action</p>
          <h2>Récupérez <strong>14 heures cette semaine.</strong></h2>
          <p>Dites-nous quel problème vous coûte le plus de temps. On l'automatise — opérationnel en 48h, résultats visibles ce mois-ci.</p>
          <div className="at-cta-btns">
            <Link to="/contact" className="btn-cta-white">Demander une démonstration gratuite →</Link>
            <a
              href="#services"
              className="btn-cta-outline"
              onClick={e => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Revoir les services
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
