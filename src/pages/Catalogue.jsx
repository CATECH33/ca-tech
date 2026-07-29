import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Catalogue.css'

const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`

/* ══════════════════════════════════════════════════════════
   Images par catégorie — fallback Supabase
══════════════════════════════════════════════════════════ */
const CAT_IA_IMAGE = {
  assistant:    '/collaborateurs/commercial-ia.webp',
  agent:        '/collaborateurs/support-ia.webp',
  analyste:     '/collaborateurs/rh-ia.webp',
  createur:     '/collaborateurs/seo-ia.webp',
  automatiseur: '/automatisations/automatisation-hero.webp',
  autre:        '/collaborateurs/commercial-ia.webp',
}

const CAT_SVC_IMAGE = {
  web:         '/services/site-vitrine.webp',
  ecommerce:   '/services/ecommerce.webp',
  seo:         U('1432888498266-38ffec3eaf0a'),
  ia:          '/automatisations/automatisation-hero.webp',
  branding:    '/services/branding.webp',
  application: U('1461749280684-dccba630e2f6'),
  autre:       '/services/site-vitrine.webp',
}

/* ══════════════════════════════════════════════════════════
   Mapping catégories DB → affichage
══════════════════════════════════════════════════════════ */
const CAT_META = {
  assistant:    { label: 'Assistant IA',   color: '#0066FF' },
  agent:        { label: 'Agent autonome', color: '#7c3aed' },
  analyste:     { label: 'Analyste IA',    color: '#0891b2' },
  createur:     { label: 'Créateur IA',    color: '#059669' },
  automatiseur: { label: 'Automatiseur',   color: '#d97706' },
  autre:        { label: 'Autre',          color: '#6b7280' },
}

const SVC_META = {
  web:         { label: 'Site vitrine',        color: '#0066FF' },
  ecommerce:   { label: 'E-commerce',          color: '#7c3aed' },
  seo:         { label: 'SEO & Référencement', color: '#0891b2' },
  ia:          { label: 'IA & Automatisation', color: '#059669' },
  branding:    { label: 'Branding & Design',   color: '#d97706' },
  application: { label: 'Application métier',  color: '#dc2626' },
  autre:       { label: 'Autre',               color: '#6b7280' },
}

function mapIARow(r) {
  const meta = CAT_META[r.categorie] ?? CAT_META.autre
  return {
    id:         r.id,
    cat:        meta.label,
    color:      meta.color,
    image:      r.image_url || CAT_IA_IMAGE[r.categorie] || CAT_IA_IMAGE.autre,
    name:       r.nom,
    desc:       r.description,
    metric:     Array.isArray(r.resultats_attendus) && r.resultats_attendus[0]
                  ? r.resultats_attendus[0] : '',
    price:      String(r.prix),
    priceLabel: '/mois',
    popular:    r.prix_barre != null,
  }
}

function mapSvcRow(r) {
  const meta = SVC_META[r.categorie] ?? SVC_META.autre
  return {
    id:         r.id,
    cat:        meta.label,
    color:      meta.color,
    image:      r.image_url || CAT_SVC_IMAGE[r.categorie] || CAT_SVC_IMAGE.autre,
    name:       r.nom,
    desc:       r.description,
    metric:     '',
    price:      String(r.prix),
    priceLabel: '/projet',
    popular:    r.prix_barre != null,
  }
}

/* ══════════════════════════════════════════════════════════
   Fallback — Collaborateurs IA
══════════════════════════════════════════════════════════ */
const IA_FALLBACK = [
  { id:1,  cat:'Assistant IA',   color:'#0066FF', image:'/collaborateurs/commercial-ia.webp',
    name:'Loïc Commercial',
    desc:"Qualification de leads, scoring IA, propositions personnalisées et relances automatiques.",
    metric:'−12h/semaine sur la prospection', price:'490', priceLabel:'/mois', popular:true },
  { id:2,  cat:'Assistant IA',   color:'#0066FF', image:U('1552664730-d307ca884978'),
    name:'Séquences de relance',
    desc:"Emails de relance personnalisés envoyés automatiquement selon le comportement du prospect.",
    metric:'+38 % de taux de réponse', price:'190', priceLabel:'/mois' },
  { id:3,  cat:'Assistant IA',   color:'#0066FF', image:U('1551288049-bebda4e38f71'),
    name:'Scoring de leads',
    desc:"Évaluation automatique de chaque lead entrant avec un score de 0 à 100 et recommandation d'action.",
    metric:'×2 sur le taux de conversion', price:'190', priceLabel:'/mois' },
  { id:4,  cat:'Assistant IA',   color:'#0066FF', image:U('1556761175-b413da4baf72'),
    name:'CRM IA',
    desc:"Enrichissement automatique des contacts, synchronisation multi-sources et alertes d'opportunités.",
    metric:'100 % des contacts enrichis', price:'290', priceLabel:'/mois' },
  { id:5,  cat:'Agent autonome', color:'#7c3aed', image:'/collaborateurs/support-ia.webp',
    name:'Loïc Support',
    desc:"Répond aux questions fréquentes 24h/24, classe les tickets et escalade les cas critiques.",
    metric:'−60 % de tickets traités manuellement', price:'390', priceLabel:'/mois', popular:true },
  { id:6,  cat:'Agent autonome', color:'#7c3aed', image:U('1553484771-371a816b2aaf'),
    name:'Chatbot multicanal',
    desc:"Présent sur votre site, WhatsApp Business et email — réponses instantanées à toute heure.",
    metric:'Répond en moins de 2 secondes', price:'290', priceLabel:'/mois' },
  { id:7,  cat:'Agent autonome', color:'#7c3aed', image:U('1560250097-0b93528c311a'),
    name:'Gestion de tickets',
    desc:"Priorisation intelligente des demandes entrantes et routage automatique vers le bon agent.",
    metric:'−45 % de temps de traitement', price:'190', priceLabel:'/mois' },
  { id:8,  cat:'Agent autonome', color:'#7c3aed', image:U('1522202176988-66273c2fd55f'),
    name:'Satisfaction client',
    desc:"Enquêtes NPS automatisées après chaque interaction avec analyse des verbatims.",
    metric:'+22 points NPS en moyenne', price:'90', priceLabel:'/mois' },
  { id:9,  cat:'Analyste IA',    color:'#0891b2', image:'/collaborateurs/rh-ia.webp',
    name:'Loïc RH',
    desc:"Gère les congés, trie les CVs, automatise l'onboarding et répond aux questions des équipes.",
    metric:'−8h/semaine de tâches administratives', price:'390', priceLabel:'/mois', popular:true },
  { id:10, cat:'Analyste IA',    color:'#0891b2', image:U('1573496359142-b8d87734a5a2'),
    name:'Tri de CVs',
    desc:"Analyse automatique des candidatures selon vos critères avec rapport de présélection.",
    metric:'100 CVs traités en 10 minutes', price:'190', priceLabel:'/mois' },
  { id:11, cat:'Analyste IA',    color:'#0891b2', image:U('1450101499163-c8848c66ca85'),
    name:'Onboarding IA',
    desc:"Parcours d'intégration automatisé : documents, accès, planning et suivi J+1 à J+30.",
    metric:'100 % des arrivées suivies', price:'190', priceLabel:'/mois' },
  { id:12, cat:'Analyste IA',    color:'#0891b2', image:U('1554224155-8d04cb21cd6c'),
    name:'Gestion des congés',
    desc:"Demandes en ligne, vérification automatique des soldes et validation selon vos règles.",
    metric:'Zéro email RH pour les congés', price:'90', priceLabel:'/mois' },
  { id:13, cat:'Créateur IA',    color:'#059669', image:'/collaborateurs/seo-ia.webp',
    name:'Rédaction SEO',
    desc:"Articles de blog, fiches produits et pages de vente optimisés pour Google chaque semaine.",
    metric:'Score SEO moyen : 91/100', price:'290', priceLabel:'/mois' },
  { id:14, cat:'Créateur IA',    color:'#059669', image:U('1611162617474-5b21e879e113'),
    name:'Social media auto',
    desc:"Publication automatique sur LinkedIn, Instagram et Facebook avec calendrier éditorial IA.",
    metric:'×3 publications mensuelles', price:'190', priceLabel:'/mois' },
  { id:15, cat:'Créateur IA',    color:'#059669', image:U('1596526130481-e0135e62f039'),
    name:'Newsletter intelligente',
    desc:"Segmentation automatique de vos abonnés et personnalisation du contenu par profil.",
    metric:"+45 % de taux d'ouverture", price:'190', priceLabel:'/mois' },
  { id:16, cat:'Créateur IA',    color:'#059669', image:U('1432888498266-38ffec3eaf0a'),
    name:'Veille sectorielle',
    desc:"Monitoring automatique de votre secteur, de vos concurrents et des tendances clés.",
    metric:'Rapport hebdomadaire en 1 clic', price:'90', priceLabel:'/mois' },
  { id:17, cat:'Analyste IA',    color:'#0891b2', image:U('1460925895917-afdab827c52f'),
    name:'Facturation IA',
    desc:"Génération et envoi automatique de vos factures dès la validation de la prestation.",
    metric:"Facture envoyée en moins d'1 minute", price:'190', priceLabel:'/mois' },
  { id:18, cat:'Analyste IA',    color:'#0891b2', image:U('1551836022-d5d88e9218df'),
    name:'Relances impayés',
    desc:"Séquences de recouvrement automatisées : rappels amiables, mise en demeure, suivi.",
    metric:"−35 % d'impayés après 90 jours", price:'90', priceLabel:'/mois' },
  { id:19, cat:'Analyste IA',    color:'#0891b2', image:U('1551288049-bebda4e38f71'),
    name:'Reporting financier',
    desc:"Tableaux de bord mensuels générés automatiquement depuis vos données comptables.",
    metric:'Vision 360° en moins de 5 minutes', price:'190', priceLabel:'/mois' },
  { id:20, cat:'Analyste IA',    color:'#0891b2', image:U('1556761175-b413da4baf72'),
    name:'Prévisions trésorerie',
    desc:"IA prédictive sur vos données historiques pour anticiper vos besoins de trésorerie.",
    metric:'Précision à ±8 % sur 90 jours', price:'290', priceLabel:'/mois' },
  { id:21, cat:'Automatiseur',   color:'#d97706', image:'/automatisations/automatisation-hero.webp',
    name:'Connecteur multi-outils',
    desc:"Synchronisation de Google Workspace, Slack, HubSpot, Notion et 40+ autres outils.",
    metric:'50+ intégrations disponibles', price:'290', priceLabel:'/mois' },
  { id:22, cat:'Automatiseur',   color:'#d97706', image:U('1461749280684-dccba630e2f6'),
    name:'Workflows sur mesure',
    desc:"Automatisations 100 % personnalisées entre vos applications métier, sans code.",
    metric:'+3h récupérées par workflow', price:'390', priceLabel:'/mois' },
  { id:23, cat:'Automatiseur',   color:'#d97706', image:U('1460925895917-afdab827c52f'),
    name:'Rapports automatiques',
    desc:"Centralisation hebdomadaire de vos données clés depuis toutes vos sources.",
    metric:'Un seul rapport pour tout piloter', price:'90', priceLabel:'/mois' },
  { id:24, cat:'Automatiseur',   color:'#d97706', image:U('1522202176988-66273c2fd55f'),
    name:'Alertes intelligentes',
    desc:"Notifications en temps réel sur vos métriques clés, seuils critiques et anomalies.",
    metric:'Alertes en moins de 30 secondes', price:'90', priceLabel:'/mois' },
]

/* ══════════════════════════════════════════════════════════
   Fallback — Services Web
══════════════════════════════════════════════════════════ */
const SVC_FALLBACK = [
  { id:'s1', cat:'Site vitrine',        color:'#0066FF', image:'/services/site-vitrine.webp',
    name:'Site vitrine premium',
    desc:"Design moderne, responsive et SEO-ready. Livré en 2 semaines avec hébergement inclus 1 an.",
    metric:'Score PageSpeed ≥ 90', price:'990', priceLabel:'/projet', popular:true },
  { id:'s2', cat:'Site vitrine',        color:'#0066FF', image:'/services/landing-page.webp',
    name:'Landing page',
    desc:"Page de conversion haute performance pour vos campagnes publicitaires et générateurs de leads.",
    metric:'Taux de conversion optimisé', price:'490', priceLabel:'/projet' },
  { id:'s3', cat:'Site vitrine',        color:'#0066FF', image:U('1467232004584-a241de8bcf5d'),
    name:'Refonte de site',
    desc:"Modernisation complète de votre site existant : design, performance, SEO et accessibilité.",
    metric:'Performance ×3 garantie', price:'1 290', priceLabel:'/projet' },
  { id:'s4', cat:'E-commerce',          color:'#7c3aed', image:'/services/ecommerce.webp',
    name:'Boutique en ligne',
    desc:"Catalogue produits, paiement sécurisé, gestion des commandes et tableau de bord vendeur.",
    metric:"Jusqu'à 10 000 produits", price:'1 990', priceLabel:'/projet', popular:true },
  { id:'s5', cat:'SEO & Référencement', color:'#0891b2', image:U('1432888498266-38ffec3eaf0a'),
    name:'Audit SEO complet',
    desc:"Analyse technique, contenu, backlinks et plan d'action priorisé pour dominer Google.",
    metric:'Rapport 60+ critères analysés', price:'390', priceLabel:'/audit', popular:true },
  { id:'s6', cat:'SEO & Référencement', color:'#0891b2', image:U('1460925895917-afdab827c52f'),
    name:'SEO mensuel',
    desc:"Optimisation continue, création de contenus, link building et suivi de positions chaque mois.",
    metric:'+68 % de trafic organique en 6 mois', price:'490', priceLabel:'/mois' },
  { id:'s7', cat:'Branding & Design',   color:'#d97706', image:'/services/logo-design.webp',
    name:'Logo & Charte graphique',
    desc:"Identité visuelle professionnelle : logo, palette couleurs, typographies et guide d'utilisation.",
    metric:'5 concepts proposés', price:'690', priceLabel:'/projet' },
  { id:'s8', cat:'Branding & Design',   color:'#d97706', image:'/services/branding.webp',
    name:'Identité visuelle complète',
    desc:"Logo, charte, carte de visite, en-tête email, réseaux sociaux et tous les formats print.",
    metric:'20+ déclinaisons livrées', price:'990', priceLabel:'/projet', popular:true },
  { id:'s9', cat:'Branding & Design',   color:'#d97706', image:U('1611162617474-5b21e879e113'),
    name:'Pack réseaux sociaux',
    desc:"Visuels, stories, bannières et templates pour LinkedIn, Instagram et Facebook.",
    metric:'Pack 30 visuels livrés', price:'290', priceLabel:'/mois' },
  { id:'s10', cat:'Application métier', color:'#dc2626', image:U('1461749280684-dccba630e2f6'),
    name:'Application sur mesure',
    desc:"Développement d'outils internes, CRM, dashboards et applications métier adaptées à votre secteur.",
    metric:'Devis selon cahier des charges', price:'2 990', priceLabel:'/projet' },
]

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function Catalogue() {
  const [tab,          setTab]          = useState('ia')
  const [activeIA,     setActiveIA]     = useState('Tous')
  const [activeSvc,    setActiveSvc]    = useState('Tous')
  const [liveIA,       setLiveIA]       = useState(null)
  const [liveServices, setLiveServices] = useState(null)

  useEffect(() => {
    supabase
      .from('catalogue_collaborateurs')
      .select('id, nom, description, categorie, icone, prix, prix_barre, resultats_attendus, ordre, image_url')
      .eq('visible', true)
      .order('ordre', { ascending: true })
      .then(({ data }) => setLiveIA(data && data.length > 0 ? data.map(mapIARow) : []))
      .catch(() => setLiveIA([]))
  }, [])

  useEffect(() => {
    supabase
      .from('catalogue_services')
      .select('id, nom, description, categorie, icone, prix, prix_barre, ordre, image_url')
      .eq('visible', true)
      .order('ordre', { ascending: true })
      .then(({ data }) => setLiveServices(data && data.length > 0 ? data.map(mapSvcRow) : []))
      .catch(() => setLiveServices([]))
  }, [])

  const iaData  = liveIA       && liveIA.length       > 0 ? liveIA       : IA_FALLBACK
  const svcData = liveServices && liveServices.length > 0 ? liveServices : SVC_FALLBACK

  const iaCats  = useMemo(() => ['Tous', ...new Set(iaData.map(s => s.cat))],  [iaData])
  const svcCats = useMemo(() => ['Tous', ...new Set(svcData.map(s => s.cat))], [svcData])

  useEffect(() => {
    if (activeIA  !== 'Tous' && !iaCats.includes(activeIA))   setActiveIA('Tous')
  }, [iaCats,  activeIA])
  useEffect(() => {
    if (activeSvc !== 'Tous' && !svcCats.includes(activeSvc)) setActiveSvc('Tous')
  }, [svcCats, activeSvc])

  const visibleIA  = useMemo(
    () => activeIA  === 'Tous' ? iaData  : iaData.filter(s => s.cat === activeIA),
    [activeIA, iaData]
  )
  const visibleSvc = useMemo(
    () => activeSvc === 'Tous' ? svcData : svcData.filter(s => s.cat === activeSvc),
    [activeSvc, svcData]
  )

  const currentCats    = tab === 'ia' ? iaCats    : svcCats
  const currentActive  = tab === 'ia' ? activeIA  : activeSvc
  const currentVisible = tab === 'ia' ? visibleIA : visibleSvc
  const isLoading      = tab === 'ia' ? liveIA === null : liveServices === null

  useEffect(() => {
    document.title = `Catalogue — ${iaData.length + svcData.length} solutions · CA-TECH`
  }, [iaData.length, svcData.length])

  return (
    <>
      {/* ════════════════════════════════════════ HERO */}
      <section className="cat-hero">
        <div className="cat-hero-grid" aria-hidden="true" />
        <div className="cat-halo cat-halo-1" aria-hidden="true" />
        <div className="cat-halo cat-halo-2" aria-hidden="true" />
        <div className="cat-hero-inner">
          <p className="cat-kicker">
            <span />Catalogue de solutions · CA-TECH
          </p>
          <h1 className="cat-h1">Choisissez votre <em>solution.</em></h1>
          <p className="cat-sub">
            Solutions IA et services web prêts à déployer dans votre entreprise. Chacun est opérationnel, mesurable et accompagné pendant 30 jours.
          </p>
          <div className="cat-hero-stats">
            {[
              { val: String(iaData.length),  lbl: 'Solutions IA' },
              { val: String(svcData.length), lbl: 'Services Web' },
              { val: '48h',                  lbl: 'Déploiement' },
              { val: '30j',                  lbl: 'Accompagnement' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="cat-hs-item">
                <span className="cat-hs-val">{val}</span>
                <span className="cat-hs-lbl">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════ FILTERS */}
      <div className="cat-filters">
        <div className="cat-tab-row">
          <div className="cat-tab-inner">
            <button
              className={`cat-tab${tab === 'ia' ? ' cat-tab--active' : ''}`}
              onClick={() => setTab('ia')}
            >
              🤖 Collaborateurs IA
              <span className="cat-tab-badge">{iaData.length}</span>
            </button>
            <button
              className={`cat-tab${tab === 'services' ? ' cat-tab--active' : ''}`}
              onClick={() => setTab('services')}
            >
              💻 Services Web
              <span className="cat-tab-badge">{svcData.length}</span>
            </button>
          </div>
        </div>

        <div className="cat-filters-inner">
          {currentCats.map(c => (
            <button
              key={c}
              className={`cat-filter-btn${currentActive === c ? ' cat-filter-btn--active' : ''}`}
              onClick={() => tab === 'ia' ? setActiveIA(c) : setActiveSvc(c)}
            >
              {c}
            </button>
          ))}
          <span className="cat-count">
            {currentVisible.length} solution{currentVisible.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════ GRID */}
      <section className="cat-section">
        <div className="cat-section-inner">
          {isLoading ? (
            <div className="cat-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="cat-card cat-card--skeleton" aria-hidden="true">
                  <div className="cat-sk-img" />
                  <div className="cat-card-body">
                    <div className="cat-sk-line" />
                    <div className="cat-sk-line cat-sk-line--lg" />
                    <div className="cat-sk-line cat-sk-line--sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cat-grid">
              {currentVisible.map(s => (
                <div
                  key={s.id}
                  className={`cat-card${s.popular ? ' cat-card--popular' : ''}`}
                  style={s.popular ? { '--card-accent': s.color } : {}}
                >
                  {/* Image premium */}
                  <div className="cat-card-visual">
                    <img src={s.image} alt={s.name} loading="lazy" />
                    <div className="cat-card-visual-overlay" />
                    <div className="cat-card-visual-meta">
                      <span
                        className="cat-card-badge"
                        style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.25)' }}
                      >
                        {s.cat}
                      </span>
                      {s.popular && <span className="cat-card-pop">★ Populaire</span>}
                    </div>
                  </div>

                  {/* Corps */}
                  <div className="cat-card-body">
                    <h3 className="cat-card-name">{s.name}</h3>
                    <p className="cat-card-desc">{s.desc}</p>

                    {s.metric && (
                      <p className="cat-card-metric">
                        <span className="cat-check" style={{ color: s.color }}>✓</span>
                        {s.metric}
                      </p>
                    )}

                    <div className="cat-card-divider" />

                    <div className="cat-card-bottom">
                      <div className="cat-card-price">
                        <span className="cat-price-from">À partir de</span>
                        <span className="cat-price-val">
                          {s.price} €<small>{s.priceLabel ?? '/mois'}</small>
                        </span>
                      </div>
                      <Link
                        to="/contact"
                        className="cat-card-btn"
                        style={{ background: s.color }}
                      >
                        Demander →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════ CTA */}
      <section className="cat-cta">
        <div className="cat-cta-inner">
          <p className="cat-cta-label">Pas sûr de la solution ?</p>
          <h2 className="cat-cta-h2">Diagnostic gratuit en <strong>20 minutes.</strong></h2>
          <p className="cat-cta-sub">
            Nos experts analysent vos processus et vous recommandent les solutions les plus adaptées à votre activité.
          </p>
          <div className="cat-cta-btns">
            <Link to="/contact" className="cat-btn-main">Prendre rendez-vous →</Link>
            <Link to="/loic" className="cat-btn-ghost">Tester Loïc gratuitement</Link>
          </div>
        </div>
      </section>
    </>
  )
}
