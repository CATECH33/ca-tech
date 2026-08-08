import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Services.css'
import { usePageMeta } from '../lib/seo'
import { useJsonLd, webPageSchema, serviceSchema, breadcrumbSchema, faqSchema } from '../lib/schema'
import { SeoSection, SeoProse, SeoAdvice, SeoFaq, SeoRelated } from '../components/SeoContent'

const SERVICES_ADVICE = [
  { title: 'Commencez par le problème, pas par la solution',   desc: "Un CRM ne sert à rien si vos commerciaux ne veulent pas l'utiliser. Un site premium n'attire personne s'il n'a pas de plan de trafic. Nommez d'abord le problème business — le bon outil suit." },
  { title: "Ne cherchez pas le service le moins cher, cherchez celui qui s'amortit le plus vite", desc: "Un site à 590 € qui génère 3 clients en 6 mois est infiniment plus rentable qu'un site à 2 900 € qui reste vitrine. Mesurez le ROI attendu avant de comparer les devis." },
  { title: 'Priorisez ce que vous ne pouvez pas déléguer plus tard', desc: "Un site vitrine se refait. Un CRM mal cadré vous colle à la peau 5 ans. Investissez le temps de réflexion là où les décisions structurantes sont difficiles à défaire." },
  { title: "Choisissez l'intégration plutôt que la brique isolée", desc: "Un agent IA qui ne parle pas à votre CRM ni à votre boîte mail perd 80 % de sa valeur. Vérifiez toujours l'écosystème d'intégrations avant de valider un projet." },
  { title: 'Exigez un plan de maintenance dès le devis initial', desc: "80 % du coût réel d'un projet digital arrive après la livraison. Un devis sans plan de maintenance chiffré est un devis incomplet — quel que soit le prestataire." },
  { title: 'Testez le contact avant de tester le produit', desc: "Un prestataire qui répond en 24 h avant contrat répondra en 24 h après. Un qui répond en 4 jours en avant-vente répondra en 15 jours en production. Le premier échange prédit la relation entière." },
]

const SERVICES_FAQ = [
  { q: 'Quelle différence entre un site vitrine et une landing page ?', a: "Un site vitrine présente l'ensemble de votre activité (services, équipe, réalisations, blog) et sert votre référencement long terme. Une landing page est mono-message : elle convertit un trafic déjà qualifié (Google Ads, LinkedIn, campagne email) sur une seule action précise. Les deux sont complémentaires : la landing page transforme, le site vitrine rassure." },
  { q: 'CRM sur mesure ou SaaS du marché (HubSpot, Pipedrive, Salesforce) ?', a: "Un SaaS du marché convient à 80 % des PME jusqu'à 20 commerciaux — installation en 2 jours, tarif prévisible. Un CRM sur mesure devient rentable quand vos processus sont trop spécifiques (BTP, immobilier, santé) ou quand vous dépassez 15 000 € /an de licences. On vous aide à trancher pendant le diagnostic gratuit." },
  { q: 'Un agent IA remplace-t-il vraiment un salarié ?', a: "Non — il absorbe les tâches répétitives qui empêchent vos équipes de faire un vrai travail à valeur. Un agent IA de support ne remplace pas votre responsable client, il lui libère 60 à 80 % du temps consacré aux questions récurrentes pour qu'elle traite les cas complexes correctement." },
  { q: 'Combien de temps prend un audit SEO ?', a: "Entre 5 et 10 jours ouvrés pour un site de moins de 200 pages. Vous recevez un rapport écrit de 15 à 25 pages avec les 10 priorités classées par impact et effort, un plan d'action sur 90 jours et une session de restitution d'une heure. Prix à partir de 390 €." },
  { q: 'Vous hébergez chez qui ? Puis-je choisir mon hébergeur ?', a: "Notre hébergement managé tourne sur infrastructure française (OVH, Scaleway, Vercel selon les cas), avec sauvegardes chiffrées quotidiennes et monitoring 24 / 7. Si vous préférez conserver votre hébergeur actuel, aucun problème : le code vous appartient à 100 %, on installe où vous voulez." },
  { q: 'Que se passe-t-il si mon projet évolue en cours de route ?', a: "Chaque projet a un cadrage écrit avec périmètre validé. Les demandes hors-scope sont estimées séparément — vous décidez si vous les intégrez, les reportez ou les abandonnez. Aucune décision n'est cachée dans une facture surprise." },
  { q: 'Pouvez-vous reprendre un projet démarré par un autre prestataire ?', a: "Oui, on le fait régulièrement. On commence par un audit de code (400 €) qui identifie ce qui est réutilisable, ce qui doit être réécrit et les risques de sécurité éventuels. On vous fournit ensuite un plan de reprise chiffré, sans obligation de nous confier la suite." },
  { q: 'Quelle est la durée de garantie après livraison ?', a: "3 mois de garantie fonctionnelle sur tout projet : les bugs sont corrigés gratuitement. La maintenance évolutive (nouvelles fonctionnalités, adaptations) est facturée séparément à partir du 4e mois, soit à l'unité, soit en forfait mensuel." },
  { q: 'Travaillez-vous avec des freelances ou en équipe intégrée ?', a: "Notre équipe interne prend en charge le développement, la stratégie et la relation client. Pour des expertises spécifiques (photo produit, motion design, traduction), nous mobilisons un réseau de freelances de confiance — vous restez informé et validez chaque intervenant." },
  { q: 'Est-ce que je peux payer en plusieurs fois ?', a: "Oui, la plupart de nos clients paient en 3 fois : 30 % au démarrage, 40 % à mi-parcours, 30 % à la livraison. Pour les projets supérieurs à 5 000 €, un échelonnement personnalisé est possible sans frais supplémentaires." },
]

const SERVICES_RELATED = [
  { href: '/tarifs',            label: 'Nos tarifs',           icon: '💰', desc: 'Devis à partir de 270 €' },
  { href: '/realisations',      label: 'Nos réalisations',     icon: '🏆', desc: 'Études de cas avec ROI mesuré' },
  { href: '/collaborateurs-ia', label: 'Collaborateurs IA',    icon: '🤖', desc: '6 agents autonomes 24h/24' },
  { href: '/automatisations',   label: 'Automatisations',      icon: '⚙️', desc: 'N8N · Make · Zapier' },
  { href: '/loic',              label: 'Tester Loïc',          icon: '💬', desc: 'Démo agent IA gratuite' },
  { href: '/catalogue',         label: 'Catalogue complet',    icon: '📋', desc: 'Toutes nos solutions' },
]

const U_W = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&h=520&q=85`

const NAV_ITEMS = [
  { id: 'dev-web',      label: 'Développement Web' },
  { id: 'apps-metier',  label: 'Applications Métier' },
  { id: 'solutions-ia', label: 'Solutions IA' },
  { id: 'marketing',    label: 'Marketing Digital' },
  { id: 'support',      label: 'Support & Conseil' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

/* ── Data ── */
const DEV_WEB = [
  {
    img: '/services/site-vitrine.webp',
    alt: 'Site vitrine professionnel',
    title: 'Un site qui génère des clients',
    desc: 'Votre site devient votre meilleur commercial. Design premium, chargement ultra-rapide, optimisé SEO dès le départ.',
    benefits: ['Inspire confiance et crédibilité', 'Génère des demandes en continu', 'Compatible mobile, tablette, desktop'],
    price: 'À partir de 590 €',
    href: '/contact',
  },
  {
    img: '/services/ecommerce.webp',
    alt: 'Site e-commerce',
    title: 'Une boutique qui vend sans vous',
    desc: 'Catalogue produits, paiement sécurisé Stripe, gestion des stocks. Vos clients commandent à toute heure — vous encaissez.',
    benefits: ['Paiement sécurisé intégré', 'Gestion des stocks automatisée', 'Livré en 4 à 6 semaines'],
    price: 'À partir de 1 090 €',
    href: '/contact',
  },
  {
    img: '/services/landing-page.webp',
    alt: 'Landing page haute conversion',
    title: 'Une page qui convertit vos visiteurs',
    desc: 'Conçue pour une seule action : convertir. Message percutant, design épuré, appel à l\'action optimisé pour votre cible.',
    benefits: ['Taux de conversion optimisé', 'Livraison en 5 à 7 jours', 'Connectée à votre CRM'],
    price: 'À partir de 270 €',
    href: '/contact',
  },
  {
    img: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=640&h=360&fit=crop&q=80&auto=format',
    alt: 'Refonte de site internet',
    title: 'Votre site modernisé, votre SEO protégé',
    desc: 'On transforme votre site existant en profondeur. Nouveau design, nouvelles performances — sans perdre vos positions Google.',
    benefits: ['Redirections SEO sécurisées', 'Migration de contenu incluse', 'Livré en 1 à 2 semaines'],
    price: 'À partir de 590 €',
    href: '/contact',
  },
  {
    img: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=640&h=360&fit=crop&q=80&auto=format',
    alt: 'Maintenance et support technique',
    title: 'Votre site protégé et à jour en permanence',
    desc: 'Mises à jour hebdomadaires, sauvegardes quotidiennes, monitoring 24h/24. Vous n\'avez plus à y penser.',
    benefits: ['Sauvegardes automatiques', 'Support français sous 4h', 'Rapport mensuel inclus'],
    price: 'À partir de 89,99 €/mois',
    href: '/contact',
  },
]

const APPS_METIER = [
  {
    img: '/portfolio/ca-tech-manager/dashboard.webp',
    alt: 'CRM sur mesure',
    title: 'Gérez vos clients comme jamais',
    desc: 'Un CRM pensé pour votre secteur, pas pour un usage générique. Suivi des prospects, relances automatiques, tableaux de bord en temps réel.',
    benefits: ['Adapté à vos processus métier', 'Accès équipe illimité', 'Formation et support inclus'],
    price: 'Sur devis',
    href: '/contact',
  },
  {
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop&q=80&auto=format',
    alt: 'ERP sur mesure',
    title: 'Pilotez toute votre activité depuis un seul outil',
    desc: 'Stock, facturation, RH, achats — centralisés dans une plateforme unique. Fini les tableurs, les oublis et les erreurs de saisie.',
    benefits: ['Intégration avec vos outils existants', 'Interface intuitive, prise en main < 1h', 'Données en temps réel'],
    price: 'Sur devis',
    href: '/contact',
  },
  {
    img: '/portfolio/ca-tech-manager/clients.webp',
    alt: 'Portail client',
    title: 'Offrez à vos clients un espace premium',
    desc: 'Un espace en ligne privé où vos clients consultent leurs documents, suivent leurs commandes et vous contactent directement.',
    benefits: ['Accès sécurisé par client', 'Notifications automatiques', 'Compatible mobile'],
    price: 'Sur devis',
    href: '/contact',
  },
  {
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=640&h=360&fit=crop&q=80&auto=format',
    alt: 'Extranet collaboratif',
    title: 'Collaborez efficacement avec vos partenaires',
    desc: 'Partagez des documents, coordonnez vos équipes externes et gérez vos fournisseurs dans un espace sécurisé et centralisé.',
    benefits: ['Gestion des droits d\'accès', 'Messagerie interne intégrée', 'Stockage sécurisé RGPD'],
    price: 'Sur devis',
    href: '/contact',
  },
  {
    img: '/portfolio/ca-tech-manager/home.webp',
    alt: 'Dashboard analytics',
    title: 'Vos données métier en un coup d\'œil',
    desc: 'Tableaux de bord sur mesure pour piloter votre activité en temps réel. KPI, graphiques, alertes — tout pour décider vite et bien.',
    benefits: ['Données en temps réel', 'Alertes automatiques', 'Export PDF et Excel inclus'],
    price: 'Sur devis',
    href: '/contact',
  },
]

const SOLUTIONS_IA = [
  {
    img: '/collaborateurs/collaborateur-ia-hero.webp',
    alt: 'Collaborateurs IA',
    title: 'Un employé IA disponible 24h/24',
    desc: 'Agent IA spécialisé dans votre métier. Il répond à vos clients, qualifie vos leads et traite votre SAV — sans pause ni congé.',
    benefits: ['Opérationnel en 48h', '+180% satisfaction client', 'À partir de 800 €'],
    price: 'À partir de 800 €',
    href: '/collaborateurs-ia',
    featured: true,
  },
  {
    img: '/automatisations/automatisation-hero.webp',
    alt: 'Automatisations de processus',
    title: '14h récupérées par semaine en moyenne',
    desc: 'Vos processus répétitifs tournent seuls. Relances, devis, reporting, synchronisation — automatisés et déployés en 48h.',
    benefits: ['N8N, Make, Zapier, Python', 'ROI ×4 en 3 mois', 'Sans coder, sans formation'],
    price: 'À partir de 800 €',
    href: '/automatisations',
    featured: true,
  },
  {
    img: '/collaborateurs/commercial-ia.webp',
    alt: 'Assistant IA Loïc',
    title: 'Votre commercial IA sur votre site',
    desc: 'Loïc accueille vos visiteurs, présente vos services, qualifie les prospects et crée les leads automatiquement dans votre CRM.',
    benefits: ['Intégré en 1 ligne de code', '24h/24 — 7j/7', 'Leads créés automatiquement'],
    price: 'Inclus dans Collaborateurs IA',
    href: '/collaborateurs-ia',
  },
  {
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=640&h=360&fit=crop&q=80&auto=format',
    alt: 'Analyse documentaire IA',
    title: 'Analysez 1 000 documents en quelques secondes',
    desc: 'IA entraînée sur vos contrats, factures, rapports. Extraction de données, résumés automatiques, recherche sémantique.',
    benefits: ['Tout format (PDF, Word, Excel)', 'Précision > 95%', 'RGPD compliant, hébergement EU'],
    price: 'À partir de 1 500 €',
    href: '/contact',
  },
  {
    img: '/collaborateurs/support-ia.webp',
    alt: 'Qualification automatique des prospects',
    title: 'Plus aucun lead ne tombe dans les oubliettes',
    desc: 'Agent IA qui qualifie, score et oriente chaque prospect entrant. Votre équipe ne s\'occupe que des leads vraiment chauds.',
    benefits: ['Qualification 24h/24', 'Score de priorité automatique', 'Connexion CRM directe'],
    price: 'Inclus dans Collaborateurs IA',
    href: '/collaborateurs-ia',
  },
]

const MARKETING = [
  {
    img: '/collaborateurs/seo-ia.webp',
    alt: 'Référencement SEO',
    title: 'Soyez trouvé avant vos concurrents',
    desc: 'Stratégie SEO pilotée par les données. Audit technique, production de contenu, backlinks — trafic organique ×3.4 en 6 mois en moyenne.',
    benefits: ['Audit SEO complet offert', 'Reporting mensuel inclus', 'SEO local et national'],
    price: '+200 € sur tout projet web',
    href: '/contact',
  },
  {
    img: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=640&h=360&fit=crop&q=80&auto=format',
    alt: 'Google Business et référencement local',
    title: 'Dominez les résultats locaux Google',
    desc: 'Fiche Google Business optimisée, avis clients gérés, visuels premium. Vous apparaissez en premier quand vos clients vous cherchent.',
    benefits: ['Optimisation complète de la fiche', 'Stratégie d\'avis clients', 'Photos et visuels pro inclus'],
    price: 'À partir de 290 €',
    href: '/contact',
  },
  {
    img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=640&h=360&fit=crop&q=80&auto=format',
    alt: 'Optimisation des performances web',
    title: 'Un site rapide convertit mieux',
    desc: 'Core Web Vitals, Lighthouse, temps de chargement. On optimise chaque milliseconde pour améliorer votre classement et vos conversions.',
    benefits: ['Score Lighthouse ≥ 95', 'Chargement < 2 secondes', 'Rapport complet inclus'],
    price: 'À partir de 490 €',
    href: '/contact',
  },
  {
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=640&h=360&fit=crop&q=80&auto=format',
    alt: 'Stratégie digitale',
    title: 'Un plan d\'action digital sur mesure',
    desc: 'Audit de votre présence digitale, définition de la roadmap et priorisation des actions à ROI maximal pour votre secteur.',
    benefits: ['Audit de présence offert', 'Roadmap sur 90 jours', 'Accompagnement mensuel disponible'],
    price: 'À partir de 490 €',
    href: '/contact',
  },
]

function ServiceCard({ card, badge, badgeColor }) {
  return (
    <article className={`srv2-card${card.featured ? ' srv2-card--featured' : ''}`}>
      <div className="srv2-card-img">
        <img src={card.img} alt={card.alt} loading="lazy" decoding="async" width="640" height="360" />
      </div>
      <div className="srv2-card-body">
        <span className="srv2-card-badge" style={{ color: badgeColor }}>{badge}</span>
        <h3 className="srv2-card-title">{card.title}</h3>
        <p className="srv2-card-desc">{card.desc}</p>
        <ul className="srv2-card-benefits">
          {card.benefits.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        {card.price && <p className="srv2-card-price">{card.price}</p>}
        <Link to={card.href} className={`srv2-card-btn${card.featured ? ' srv2-card-btn--featured' : ''}`}>
          Découvrir
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </article>
  )
}

export default function Services() {
  usePageMeta({
    title: 'Services — Sites, CRM, SaaS, Automatisations & IA · CA-TECH',
    description: "13 services web et IA : sites vitrines, e-commerce, CRM sur mesure, agents IA et automatisations pour PME. Devis gratuit sous 24h, livraison express.",
    keywords: 'agence développement web, création site internet, e-commerce, application métier, CRM sur mesure, développement SaaS, automatisation entreprise, agents IA, SEO, maintenance site web, hébergement web, audit digital, conseil IA',
    path: '/services',
  })
  useJsonLd('services-page', webPageSchema({
    name: 'Services — Sites, CRM, SaaS, Automatisations & IA · CA-TECH',
    description: "13 services web et IA : sites vitrines, e-commerce, CRM sur mesure, agents IA et automatisations pour PME. Devis gratuit sous 24h, livraison express.",
    path: '/services',
    image: '/services/site-vitrine.webp',
    speakableCssSelectors: ['h1', '.sol-sub'],
  }))
  useJsonLd('breadcrumb', breadcrumbSchema([
    { name: 'Accueil', path: '/' },
    { name: 'Services', path: '/services' },
  ]))
  useJsonLd('service-dev-web', serviceSchema({
    name: 'Développement web — Sites vitrines, e-commerce, landing pages',
    description: 'Sites vitrines premium, boutiques e-commerce Stripe, landing pages haute conversion et refontes SEO-safe. Livrés en 1 à 6 semaines.',
    path: '/services#dev-web',
    serviceType: 'Web Development',
    priceRange: '€€',
    offers: [
      { '@type': 'Offer', name: 'Landing page',  price: '270',  priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `https://www.ca-tech.fr/tarifs` },
      { '@type': 'Offer', name: 'Site vitrine',  price: '590',  priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `https://www.ca-tech.fr/tarifs` },
      { '@type': 'Offer', name: 'Site e-commerce', price: '1090', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `https://www.ca-tech.fr/tarifs` },
    ],
  }))
  useJsonLd('service-apps-metier', serviceSchema({
    name: 'Applications métier, CRM sur mesure & SaaS',
    description: 'Outils métier internes, CRM sur mesure, plateformes SaaS multi-tenants, back-offices et portails clients adaptés à vos processus.',
    path: '/services#apps-metier',
    serviceType: 'Custom Software Development',
    priceRange: '€€€',
  }))
  useJsonLd('service-ia', serviceSchema({
    name: 'Solutions IA — Agents IA & Collaborateurs IA',
    description: 'Agents IA conversationnels et collaborateurs IA autonomes (Commercial, Support, RH, Juridique, SEO, Comptable). Déployés en 48h avec ROI mesurable.',
    path: '/services#solutions-ia',
    serviceType: 'AI Consulting',
    priceRange: '€€€',
  }))
  useJsonLd('service-marketing', serviceSchema({
    name: 'SEO & Marketing digital',
    description: 'Audit SEO, optimisation on-page, contenu, Google Business, suivi de positionnement. Trafic organique multiplié en 6 mois.',
    path: '/services#marketing',
    serviceType: 'SEO',
    priceRange: '€€',
  }))
  useJsonLd('service-support', serviceSchema({
    name: 'Maintenance, hébergement, audit digital & conseil IA',
    description: 'Maintenance corrective et évolutive, hébergement managé, audit digital complet (SEO, performance, sécurité, opportunités IA) et conseil IA stratégique.',
    path: '/services#support',
    serviceType: 'IT Support & Consulting',
    priceRange: '€',
  }))
  useJsonLd('services-faq', faqSchema(SERVICES_FAQ))
  useEffect(() => {
    /* ── Scroll reveal ── */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('srv-vis'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('[data-srv]').forEach(el => obs.observe(el))

    /* ── Active nav link ── */
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const link = document.querySelector(`.srv-nav-link[href="#${e.target.id}"]`)
        if (link) link.classList.toggle('active', e.isIntersecting)
      })
    }, { rootMargin: '-40% 0px -40% 0px' })
    NAV_ITEMS.forEach(({ id }) => { const el = document.getElementById(id); if (el) navObs.observe(el) })

    return () => { obs.disconnect(); navObs.disconnect() }
  }, [])

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="sol-hero">
        <video
          autoPlay muted loop playsInline preload="metadata"
          className="sol-hero-video"
          aria-hidden="true"
        >
          <source src="/videos/hero-solutions.webm" type="video/webm" />
          <source src="/videos/hero-solutions.mp4" type="video/mp4" />
        </video>
        <div className="sol-hero-overlay" aria-hidden="true" />
        <div className="sol-hero-inner">
          <p className="sol-kicker"><span />Nos services · CA-TECH<span /></p>
          <h1 className="sol-h1">Sites, applications &amp; IA —<br /><em>13 services pour votre croissance.</em></h1>
          <p className="sol-sub">Développement web, e-commerce, applications métier, CRM sur mesure, SaaS, automatisations, agents IA, SEO, maintenance, hébergement, audit digital et conseil IA. CA-TECH conçoit, déploie et maintient les outils qui accélèrent votre entreprise.</p>
          <div className="sol-hero-btns">
            <button className="sol-btn-main" onClick={() => scrollTo('dev-web')}>
              Explorer nos services
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <Link to="/contact" className="sol-btn-ghost">Demander un devis gratuit →</Link>
          </div>
          <div className="srv-hero-trust">
            <span>✓ Devis sous 24h</span>
            <span>✓ Sans engagement</span>
            <span>✓ Premier livrable en 72h</span>
          </div>
        </div>
      </section>

      {/* ── STICKY NAV ───────────────────────────────────────────────── */}
      <nav className="srv-nav" aria-label="Accès rapide aux services">
        <div className="srv-nav-track">
          {NAV_ITEMS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className="srv-nav-link" onClick={e => { e.preventDefault(); scrollTo(id) }}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── 01 · DÉVELOPPEMENT WEB ──────────────────────────────────── */}
      <section className="srv2-section" id="dev-web" data-srv>
        <div className="srv2-inner">
          <header className="srv2-header">
            <div className="srv2-header-left">
              <span className="srv2-pre">01 — Développement Web</span>
              <h2 className="srv2-h2">Votre présence digitale,<br />conçue pour convertir</h2>
            </div>
            <p className="srv2-header-desc">Sites vitrines, boutiques en ligne, landing pages et refontes. Chaque projet est pensé pour attirer, convaincre et fidéliser vos clients — livrés en 1 à 6 semaines.</p>
          </header>
          <div className="srv2-cover">
            <img src={U_W('1498050108023-c5249f4df085')} alt="Développeur travaillant sur un site web moderne" loading="lazy" />
            <div className="srv2-cover-overlay" />
            <div className="srv2-cover-caption">
              <span className="srv2-cover-tag">Développement Web</span>
              <p className="srv2-cover-line">Sites & boutiques livrés en 1 à 6 semaines</p>
            </div>
          </div>
          <ul className="srv2-grid" role="list">
            {DEV_WEB.map((card, i) => (
              <li key={i}>
                <ServiceCard card={card} badge="Développement Web" badgeColor="#0066FF" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 02 · APPLICATIONS MÉTIER ───────────────────────────────── */}
      <section className="srv2-section srv2-section--alt" id="apps-metier" data-srv>
        <div className="srv2-inner">
          <header className="srv2-header">
            <div className="srv2-header-left">
              <span className="srv2-pre">02 — Applications Métier</span>
              <h2 className="srv2-h2">Des outils sur mesure<br />pour vos équipes</h2>
            </div>
            <p className="srv2-header-desc">CRM, ERP, portails clients, extranets, dashboards. Des logiciels conçus pour vos processus, pas pour un usage générique. Évolutions et maintenance incluses.</p>
          </header>
          <div className="srv2-cover">
            <img src={U_W('1460925895917-afdab827c52f')} alt="Dashboard professionnel sur plusieurs écrans" loading="lazy" />
            <div className="srv2-cover-overlay" />
            <div className="srv2-cover-caption">
              <span className="srv2-cover-tag" style={{ color: '#a5b4fc' }}>Applications Métier</span>
              <p className="srv2-cover-line">CRM, ERP, portails — adaptés à vos processus</p>
            </div>
          </div>
          <ul className="srv2-grid" role="list">
            {APPS_METIER.map((card, i) => (
              <li key={i}>
                <ServiceCard card={card} badge="Applications Métier" badgeColor="#6366F1" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 03 · SOLUTIONS IA ──────────────────────────────────────── */}
      <section className="srv2-section srv2-section--dark" id="solutions-ia" data-srv>
        <div className="srv2-inner">
          <header className="srv2-header srv2-header--dark">
            <div className="srv2-header-left">
              <span className="srv2-pre srv2-pre--dark">03 — Solutions IA</span>
              <h2 className="srv2-h2 srv2-h2--dark">L'intelligence artificielle<br />au service de votre croissance</h2>
            </div>
            <p className="srv2-header-desc srv2-header-desc--dark">Collaborateurs IA, automatisations, analyse documentaire, qualification de prospects — des solutions déployées en 48h avec un ROI mesurable dès le premier mois.</p>
          </header>
          <div className="srv2-cover">
            <img src={U_W('1600880292203-757bb62b4baf')} alt="Équipe professionnelle utilisant des outils numériques" loading="lazy" />
            <div className="srv2-cover-overlay" />
            <div className="srv2-cover-caption">
              <span className="srv2-cover-tag" style={{ color: '#93c5fd' }}>Solutions IA</span>
              <p className="srv2-cover-line">Collaborateurs IA &amp; automatisations — ROI dès le 1er mois</p>
            </div>
          </div>
          <ul className="srv2-grid" role="list">
            {SOLUTIONS_IA.map((card, i) => (
              <li key={i}>
                <ServiceCard card={card} badge="Solutions IA" badgeColor="#60A5FA" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 04 · MARKETING DIGITAL ─────────────────────────────────── */}
      <section className="srv2-section" id="marketing" data-srv>
        <div className="srv2-inner">
          <header className="srv2-header">
            <div className="srv2-header-left">
              <span className="srv2-pre">04 — Marketing Digital</span>
              <h2 className="srv2-h2">Visibilité en ligne,<br />trafic qualifié, résultats mesurables</h2>
            </div>
            <p className="srv2-header-desc">SEO, Google Business, optimisation des performances, stratégie digitale. On s'assure que vos clients vous trouvent avant vos concurrents — et qu'ils restent.</p>
          </header>
          <div className="srv2-cover">
            <img src={U_W('1551288049-bebda4e38f71')} alt="Dashboard analytics marketing — métriques de performance en temps réel" loading="lazy" />
            <div className="srv2-cover-overlay" />
            <div className="srv2-cover-caption">
              <span className="srv2-cover-tag" style={{ color: '#fcd34d' }}>Marketing Digital</span>
              <p className="srv2-cover-line">SEO, Google Business — trafic organique ×3.4 en 6 mois</p>
            </div>
          </div>
          <ul className="srv2-grid" role="list">
            {MARKETING.map((card, i) => (
              <li key={i}>
                <ServiceCard card={card} badge="Marketing Digital" badgeColor="#F59E0B" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 05 · SUPPORT & CONSEIL ─────────────────────────────────── */}
      <section className="srv2-section srv2-section--alt" id="support" data-srv>
        <div className="srv2-inner">
          <header className="srv2-header">
            <div className="srv2-header-left">
              <span className="srv2-pre">05 — Support &amp; Conseil</span>
              <h2 className="srv2-h2">Vos outils protégés,<br />optimisés et améliorés</h2>
            </div>
            <p className="srv2-header-desc">Maintenance, hébergement managé, audit digital complet et conseil IA stratégique. Vos plateformes restent rapides, sécurisées et alignées sur votre business — sans que vous ayez à y penser.</p>
          </header>
          <ul className="srv2-grid" role="list">
            {[
              { id: 'maintenance', title: 'Maintenance web', desc: 'Mises à jour de sécurité, correctifs, sauvegardes automatiques, monitoring 24/7. Votre site reste rapide, protégé et à jour — vous ne pensez plus à rien.', bullets: ['Sauvegardes chiffrées quotidiennes', 'Mises à jour CMS & plugins', 'Monitoring uptime & alertes'], price: 'À partir de 49 €/mois', cta: 'Souscrire' },
              { id: 'hebergement', title: 'Hébergement managé', desc: 'Infrastructure haute performance en France, SSL inclus, CDN mondial, uptime 99,9 % garanti. Hébergement optimisé pour Google et pensé pour la vitesse.', bullets: ['Serveurs en France (RGPD)', 'CDN & cache global', 'Certificat SSL & HTTP/3'], price: 'À partir de 19 €/mois', cta: 'Découvrir' },
              { id: 'audit', title: 'Audit digital complet', desc: 'Analyse SEO, performance, UX, sécurité et opportunités IA de votre site. Vous recevez un rapport actionnable avec les 10 priorités classées par impact et effort.', bullets: ['Audit SEO on-page & technique', 'Diagnostic performance Core Web Vitals', 'Recommandations IA sur mesure'], price: 'À partir de 390 €', cta: 'Commander' },
              { id: 'conseil-ia', title: 'Conseil IA stratégique', desc: "Roadmap d'adoption IA, sélection d'outils, formation équipes, cadrage projets. On identifie où l'IA fait vraiment gagner du temps et de l'argent dans votre activité.", bullets: ['Cartographie des opportunités IA', 'Roadmap 6-12 mois priorisée', 'Formation & accompagnement équipes'], price: 'À partir de 590 € (½ journée)', cta: 'Réserver' },
            ].map(c => (
              <li key={c.id}>
                <article className="srv2-card" id={c.id}>
                  <div className="srv2-card-body">
                    <span className="srv2-card-badge" style={{ color: '#6366F1' }}>Support &amp; Conseil</span>
                    <h3 className="srv2-card-title">{c.title}</h3>
                    <p className="srv2-card-desc">{c.desc}</p>
                    <ul className="srv2-card-benefits">
                      {c.bullets.map(b => <li key={b}>{b}</li>)}
                    </ul>
                    <p className="srv2-card-price">{c.price}</p>
                    <Link to={`/contact?service=${c.id}`} className="srv2-card-link" aria-label={`${c.cta} — ${c.title}`}>
                      {c.cta} →
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SEO · CONSEILS ────────────────────────────────────────── */}
      <SeoSection
        variant="gray"
        eyebrow="Comment choisir"
        title="6 conseils pour choisir le bon service digital (et éviter les erreurs qui coûtent cher)"
        intro="Ces principes sont issus de 120 projets menés pour des PME françaises. Ils ne remplacent pas un diagnostic, mais ils évitent les erreurs les plus courantes."
      >
        <SeoAdvice items={SERVICES_ADVICE} />
      </SeoSection>

      {/* ── SEO · CONVICTIONS ─────────────────────────────────────── */}
      <SeoSection
        variant="tint"
        eyebrow="Notre méthode"
        title="Nos convictions méthodologiques, en trois principes"
      >
        <SeoProse columns={2}>
          <h3>Le cadrage vaut plus que le code</h3>
          <p>
            Un projet réussi tient à 70 % à la clarté du cadrage initial. Nous investissons du temps à comprendre votre modèle économique, vos processus, vos contraintes réglementaires, avant d'écrire quoi que ce soit. Ce diagnostic évite les projets qui dérivent, les cahiers des charges qui gonflent, les livraisons qui déçoivent. <strong>Il est gratuit et n'engage à rien.</strong>
          </p>
          <h3>Le mieux est l'ennemi du livré</h3>
          <p>
            Nous préférons livrer une V1 solide en 3 semaines et itérer, plutôt qu'une V2 parfaite en 6 mois. Chaque semaine de retard, c'est une semaine sans retour utilisateur, sans revenu généré, sans apprentissage. Nous appliquons cette règle à nos propres projets — c'est pour cela que nous refusons systématiquement les scopes qui explosent en cours de route.
          </p>
          <h3>Ce qui compte, c'est ce qui reste après nous</h3>
          <p>
            Nous écrivons du code que d'autres pourront lire, maintenir, adapter. Documentation, tests automatisés, dépendances stables, choix technologiques mainstream. Le jour où vous voudrez reprendre le projet en interne ou changer de prestataire, aucun blocage. <strong>La technologie ne doit jamais vous retenir prisonnier.</strong>
          </p>
        </SeoProse>
      </SeoSection>

      {/* ── SEO · FAQ SERVICES ────────────────────────────────────── */}
      <SeoSection
        variant="light"
        eyebrow="Questions fréquentes"
        title="Les 10 questions qui reviennent le plus sur nos services"
        intro="Sites, CRM, agents IA, audit, maintenance — voici les réponses aux interrogations récurrentes en avant-vente. Cliquez pour dérouler."
      >
        <SeoFaq items={SERVICES_FAQ} />
      </SeoSection>

      <SeoRelated
        eyebrow="Aller plus loin"
        title="Nos services associés"
        links={SERVICES_RELATED}
      />

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="sol-cta">
        <div className="sol-cta-inner">
          <p className="sol-cta-label">Passons à l'action</p>
          <h2 className="sol-cta-title">Vous ne savez pas par <strong>où commencer ?</strong></h2>
          <p className="sol-cta-sub">On analyse votre situation gratuitement et on vous recommande le service le plus adapté — en 30 minutes, sans engagement.</p>
          <div className="sol-cta-btns">
            <Link to="/contact" className="sol-btn-main">Demander un audit gratuit →</Link>
            <Link to="/realisations" className="sol-btn-ghost">Voir nos réalisations</Link>
          </div>
        </div>
      </section>
    </>
  )
}
