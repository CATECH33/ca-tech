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
    gains:      [],
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
    gains:      [],
    price:      String(r.prix),
    priceLabel: '/projet',
    popular:    r.prix_barre != null,
  }
}

/* ══════════════════════════════════════════════════════════
   Fallback — Collaborateurs IA
══════════════════════════════════════════════════════════ */
const IA_FALLBACK = [
  { id:1, cat:'Assistant IA', color:'#0066FF', image:'/collaborateurs/commercial-ia.webp',
    popular:true, price:'490', priceLabel:'/mois',
    name:'Votre commercial IA disponible 24h/24',
    desc:"Loïc qualifie vos leads, priorise les meilleures opportunités et relance automatiquement. Votre pipeline ne dort jamais.",
    gains:['−12h/semaine récupérées sur la prospection','Aucun lead qualifié ne passe entre les mailles','+38 % de taux de réponse sur les relances'] },

  { id:2, cat:'Assistant IA', color:'#0066FF', image:U('1552664730-d307ca884978'),
    price:'190', priceLabel:'/mois',
    name:'Relancez sans effort, signez plus',
    desc:"Vos prospects reçoivent la bonne relance au bon moment. Vous n'avez plus à y penser — les deals avancent seuls.",
    gains:['Séquences envoyées automatiquement','Ton personnalisé selon le comportement','Pipeline qui avance sans vous'] },

  { id:3, cat:'Assistant IA', color:'#0066FF', image:U('1551288049-bebda4e38f71'),
    price:'190', priceLabel:'/mois',
    name:'Concentrez-vous sur les prospects qui valent le coup',
    desc:"Chaque lead reçoit un score automatique. Vos commerciaux ne passent plus de temps sur des contacts froids.",
    gains:['Score 0–100 calculé en temps réel','Priorisation automatique du pipeline','×2 sur le taux de conversion'] },

  { id:4, cat:'Assistant IA', color:'#0066FF', image:U('1556761175-b413da4baf72'),
    price:'290', priceLabel:'/mois',
    name:'Un CRM qui se met à jour tout seul',
    desc:"Fini la saisie manuelle. Chaque contact est enrichi et synchronisé automatiquement depuis toutes vos sources.",
    gains:['100 % des contacts enrichis automatiquement','Synchronisation multi-sources en temps réel','Alertes sur les opportunités à saisir'] },

  { id:5, cat:'Agent autonome', color:'#7c3aed', image:'/collaborateurs/support-ia.webp',
    popular:true, price:'390', priceLabel:'/mois',
    name:'Un support client sans file d\'attente',
    desc:"Loïc répond à vos clients en moins de 30 secondes, 24h/24. Il règle seul les cas simples et escalade les urgences.",
    gains:['−60 % de tickets traités manuellement','Réponse en moins de 30 secondes','Disponible 24h/24 sans surcoût'] },

  { id:6, cat:'Agent autonome', color:'#7c3aed', image:U('1553484771-371a816b2aaf'),
    price:'290', priceLabel:'/mois',
    name:'Soyez présent partout, sans effort',
    desc:"Votre chatbot répond instantanément sur votre site, WhatsApp et email — même quand votre équipe est indisponible.",
    gains:['Réponse en moins de 2 secondes','Présent sur 3 canaux simultanément','Aucune demande sans réponse'] },

  { id:7, cat:'Agent autonome', color:'#7c3aed', image:U('1560250097-0b93528c311a'),
    price:'190', priceLabel:'/mois',
    name:'Chaque demande traitée au bon endroit',
    desc:"Les demandes entrantes sont automatiquement priorisées et routées vers le bon agent. Fini le chaos et les oublis.",
    gains:['−45 % de temps de traitement','Priorisation automatique par urgence','Zéro ticket perdu ou oublié'] },

  { id:8, cat:'Agent autonome', color:'#7c3aed', image:U('1522202176988-66273c2fd55f'),
    price:'90', priceLabel:'/mois',
    name:'Sachez ce que pensent vraiment vos clients',
    desc:"Enquêtes NPS envoyées automatiquement après chaque interaction. Problèmes détectés avant qu'ils ne s'aggravent.",
    gains:['+22 points NPS en moyenne','Alertes sur les clients insatisfaits','Rapport mensuel automatique'] },

  { id:9, cat:'Analyste IA', color:'#0891b2', image:'/collaborateurs/rh-ia.webp',
    popular:true, price:'390', priceLabel:'/mois',
    name:'Libérez votre équipe des tâches RH chronophages',
    desc:"Loïc gère congés, CVs et onboarding automatiquement. Votre RH peut enfin se concentrer sur l'essentiel : les gens.",
    gains:['−8h/semaine de tâches administratives','100 % des arrivées suivies','Réponses RH disponibles 24h/24'] },

  { id:10, cat:'Analyste IA', color:'#0891b2', image:U('1573496359142-b8d87734a5a2'),
    price:'190', priceLabel:'/mois',
    name:'Voyez uniquement les candidats qui correspondent',
    desc:"100 CVs analysés en 10 minutes selon vos critères. Vous recevez une présélection prête à l'emploi, sans biais.",
    gains:['100 CVs traités en 10 minutes','Rapport de présélection immédiat','Zéro biais dans le tri'] },

  { id:11, cat:'Analyste IA', color:'#0891b2', image:U('1450101499163-c8848c66ca85'),
    price:'190', priceLabel:'/mois',
    name:'Chaque collaborateur opérationnel plus vite',
    desc:"Documents, accès, planning, suivi J+1 à J+30 : tout est préparé et envoyé automatiquement. Zéro oubli.",
    gains:['100 % des arrivées suivies automatiquement','Parcours d\'intégration sans accroc','Productif plus vite, sans effort RH'] },

  { id:12, cat:'Analyste IA', color:'#0891b2', image:U('1554224155-8d04cb21cd6c'),
    price:'90', priceLabel:'/mois',
    name:'Zéro email pour les congés',
    desc:"Demandes en ligne, soldes vérifiés automatiquement, validation selon vos règles. Votre équipe RH respire enfin.",
    gains:['Validation automatique selon vos règles','Soldes toujours à jour','Zéro échange email pour les congés'] },

  { id:13, cat:'Créateur IA', color:'#059669', image:'/collaborateurs/seo-ia.webp',
    price:'290', priceLabel:'/mois',
    name:'Du contenu Google sans y passer des heures',
    desc:"Articles de blog et fiches produits optimisés pour Google, publiés chaque semaine. Votre trafic augmente seul.",
    gains:['Score SEO moyen : 91/100','Contenu publié chaque semaine automatiquement','Trafic Google augmenté durablement'] },

  { id:14, cat:'Créateur IA', color:'#059669', image:U('1611162617474-5b21e879e113'),
    price:'190', priceLabel:'/mois',
    name:'Publiez 3× plus sans y passer plus de temps',
    desc:"Votre calendrier éditorial tourne automatiquement sur LinkedIn, Instagram et Facebook. Vous validez, l'IA publie.",
    gains:['×3 publications mensuelles','Calendrier géré automatiquement','Image de marque cohérente sur tous les réseaux'] },

  { id:15, cat:'Créateur IA', color:'#059669', image:U('1596526130481-e0135e62f039'),
    price:'190', priceLabel:'/mois',
    name:'Une newsletter que vos abonnés attendent vraiment',
    desc:"Contenu personnalisé selon le profil de chaque abonné, envoyé au bon moment, au bon segment.",
    gains:['+45 % de taux d\'ouverture','Segmentation automatique de votre base','Contenu adapté à chaque profil'] },

  { id:16, cat:'Créateur IA', color:'#059669', image:U('1432888498266-38ffec3eaf0a'),
    price:'90', priceLabel:'/mois',
    name:'Ne ratez plus jamais une opportunité de marché',
    desc:"Votre secteur, vos concurrents, les tendances clés — surveillés automatiquement et résumés chaque semaine.",
    gains:['Rapport de veille hebdomadaire automatique','Alertes sur les signaux importants','Décisions toujours informées'] },

  { id:17, cat:'Analyste IA', color:'#0891b2', image:U('1460925895917-afdab827c52f'),
    price:'190', priceLabel:'/mois',
    name:'Envoyez vos factures sans jamais y penser',
    desc:"Chaque prestation validée déclenche automatiquement la génération et l'envoi de la facture. En moins d'une minute.",
    gains:['Facture envoyée en moins d\'1 minute','Aucune facture oubliée ou en retard','Comptabilité toujours à jour'] },

  { id:18, cat:'Analyste IA', color:'#0891b2', image:U('1551836022-d5d88e9218df'),
    price:'90', priceLabel:'/mois',
    name:'Récupérez vos impayés sans vous dégrader',
    desc:"Vos relances partent automatiquement au bon moment, avec le bon ton — du rappel amiable à la mise en demeure.",
    gains:['−35 % d\'impayés après 90 jours','Séquence de relance automatique','Relation client préservée'] },

  { id:19, cat:'Analyste IA', color:'#0891b2', image:U('1551288049-bebda4e38f71'),
    price:'190', priceLabel:'/mois',
    name:'Pilotez votre activité sans courir après les chiffres',
    desc:"Vos tableaux de bord financiers sont générés et envoyés automatiquement chaque mois. Vous avez enfin une vision claire.",
    gains:['Vision 360° en moins de 5 minutes','Données toujours fraîches et fiables','Décisions éclairées sans effort'] },

  { id:20, cat:'Analyste IA', color:'#0891b2', image:U('1556761175-b413da4baf72'),
    price:'290', priceLabel:'/mois',
    name:'Anticipez votre trésorerie avant qu\'il soit trop tard',
    desc:"L'IA analyse vos données pour vous dire exactement ce qui se passe dans 30, 60 et 90 jours. Plus de mauvaises surprises.",
    gains:['Précision à ±8 % sur 90 jours','Alertes avant les points de tension','Sérénité financière garantie'] },

  { id:21, cat:'Automatiseur', color:'#d97706', image:'/automatisations/automatisation-hero.webp',
    price:'290', priceLabel:'/mois',
    name:'Vos outils travaillent enfin ensemble',
    desc:"Plus de double saisie, plus d'informations perdues entre les applications. Tout est synchronisé en temps réel.",
    gains:['50+ intégrations disponibles','Synchronisation en temps réel','Zéro donnée perdue entre les outils'] },

  { id:22, cat:'Automatiseur', color:'#d97706', image:U('1461749280684-dccba630e2f6'),
    price:'390', priceLabel:'/mois',
    name:'Automatisez n\'importe quel processus sans coder',
    desc:"Vos processus répétitifs tournent seuls, 24h/24. Chaque workflow libère du temps dès la première semaine.",
    gains:['+3h récupérées par workflow','Conçu pour votre métier précis','Opérationnel en 48h'] },

  { id:23, cat:'Automatiseur', color:'#d97706', image:U('1460925895917-afdab827c52f'),
    price:'90', priceLabel:'/mois',
    name:'Un seul rapport pour tout piloter',
    desc:"Toutes vos données clés centralisées et envoyées automatiquement à la fréquence que vous choisissez.",
    gains:['Données consolidées de toutes vos sources','Envoyé à l\'heure que vous choisissez','Décisions basées sur des données fraîches'] },

  { id:24, cat:'Automatiseur', color:'#d97706', image:U('1522202176988-66273c2fd55f'),
    price:'90', priceLabel:'/mois',
    name:'Soyez alerté avant que ça devienne un problème',
    desc:"Vos métriques clés surveillées en permanence. Une alerte en moins de 30 secondes si quelque chose déraille.",
    gains:['Alerte en moins de 30 secondes','Seuils personnalisables par métrique','Jamais pris de court'] },
]

/* ══════════════════════════════════════════════════════════
   Fallback — Services Web
══════════════════════════════════════════════════════════ */
const SVC_FALLBACK = [
  { id:'s1', cat:'Site vitrine', color:'#0066FF', image:'/services/site-vitrine.webp',
    popular:true, price:'990', priceLabel:'/projet',
    name:'Un site qui attire et convertit',
    desc:"Vos futurs clients vous trouvent sur Google, arrivent sur votre site et vous contactent. Tout seul, 24h/24.",
    gains:['Visible sur Google dès le lancement','Design qui inspire confiance immédiatement','Génère des demandes sans publicité'] },

  { id:'s2', cat:'Site vitrine', color:'#0066FF', image:'/services/landing-page.webp',
    price:'490', priceLabel:'/projet',
    name:'Transformez vos publicités en rendez-vous',
    desc:"Chaque visiteur qui clique sur votre pub arrive sur une page conçue pour le faire passer à l'action — pas pour le faire fuir.",
    gains:['Taux de conversion maximisé dès le lancement','Compatible Google Ads, Meta Ads, LinkedIn','Prête à lancer en 5 jours'] },

  { id:'s3', cat:'Site vitrine', color:'#0066FF', image:U('1467232004584-a241de8bcf5d'),
    price:'1 290', priceLabel:'/projet',
    name:'Donnez une seconde vie à votre site',
    desc:"Votre site actuel ne reflète plus votre niveau. On le transforme en outil commercial qui travaille pour vous.",
    gains:['Chargement 3× plus rapide','Expérience mobile irréprochable','Classement Google amélioré'] },

  { id:'s4', cat:'E-commerce', color:'#7c3aed', image:'/services/ecommerce.webp',
    popular:true, price:'1 990', priceLabel:'/projet',
    name:'Vendez 24h/24 sans vous épuiser',
    desc:"Vos clients commandent, paient et reçoivent leur confirmation automatiquement — même quand vous dormez.",
    gains:['Paiements sécurisés intégrés','Commandes gérées automatiquement','Fonctionne sur mobile et tablette'] },

  { id:'s5', cat:'SEO & Référencement', color:'#0891b2', image:U('1432888498266-38ffec3eaf0a'),
    popular:true, price:'390', priceLabel:'/audit',
    name:'Découvrez pourquoi Google ne vous trouve pas',
    desc:"Un diagnostic complet de votre visibilité en ligne, avec un plan d'action priorisé pour remonter en première page.",
    gains:['60+ points analysés en détail','Priorités classées par impact business','Plan applicable dès la livraison'] },

  { id:'s6', cat:'SEO & Référencement', color:'#0891b2', image:U('1460925895917-afdab827c52f'),
    price:'490', priceLabel:'/mois',
    name:'Soyez en première page de Google',
    desc:"Attirez chaque mois plus de clients qualifiés qui cherchent exactement ce que vous proposez — sans payer de publicité.",
    gains:['+68 % de trafic organique en 6 mois','Contenus SEO créés et publiés chaque mois','Rapport de positions hebdomadaire'] },

  { id:'s7', cat:'Branding & Design', color:'#d97706', image:'/services/logo-design.webp',
    price:'690', priceLabel:'/projet',
    name:'Une identité qui marque les esprits',
    desc:"Vos clients jugent votre entreprise en 0,05 seconde. Donnez-leur une raison de vous faire confiance dès le premier regard.",
    gains:['5 concepts uniques présentés','Fichiers prêts pour le web et le print','Valeur perçue de votre marque augmentée'] },

  { id:'s8', cat:'Branding & Design', color:'#d97706', image:'/services/branding.webp',
    popular:true, price:'990', priceLabel:'/projet',
    name:'Une marque forte qui rassure et fidélise',
    desc:"Vos clients vous reconnaissent partout, vous font confiance plus vite et reviennent plus souvent.",
    gains:['20+ déclinaisons livrées clé en main','Cohérence visuelle sur tous les supports','Branding qui crée de l\'attachement'] },

  { id:'s9', cat:'Branding & Design', color:'#d97706', image:U('1611162617474-5b21e879e113'),
    price:'290', priceLabel:'/mois',
    name:'Des réseaux sociaux qui font venir des clients',
    desc:"Publiez du contenu professionnel qui donne envie de vous contacter — sans passer des heures à designer.",
    gains:['30 visuels prêts à publier','Identité cohérente sur tous les réseaux','Engagement et crédibilité augmentés'] },

  { id:'s10', cat:'Application métier', color:'#dc2626', image:U('1461749280684-dccba630e2f6'),
    price:'2 990', priceLabel:'/projet',
    name:'Un outil qui automatise votre métier',
    desc:"Gagnez des heures chaque semaine avec une application pensée pour vos processus, votre équipe et votre secteur.",
    gains:['Développé sur mesure pour vos besoins','Interface simple, formation incluse','Intégré à vos outils existants'] },
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

                    {s.gains && s.gains.length > 0 && (
                      <ul className="cat-card-gains">
                        {s.gains.map(g => (
                          <li key={g}>
                            <span className="cat-gain-check" style={{ color: s.color }}>✓</span>
                            {g}
                          </li>
                        ))}
                      </ul>
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
