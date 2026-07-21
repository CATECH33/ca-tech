import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import './Catalogue.css'

const SOLUTIONS = [
  // ── Commercial ──────────────────────────────────────────────
  { id:1,  cat:'Commercial',    color:'#0066FF', icon:'💼', name:'Loïc Commercial',
    desc:"Qualification de leads, scoring IA, propositions personnalisées et relances automatiques.",
    metric:'−12h/semaine sur la prospection', price:'490', popular:true },
  { id:2,  cat:'Commercial',    color:'#0066FF', icon:'📧', name:'Séquences de relance',
    desc:"Emails de relance personnalisés envoyés automatiquement selon le comportement du prospect.",
    metric:'+38 % de taux de réponse', price:'190' },
  { id:3,  cat:'Commercial',    color:'#0066FF', icon:'📊', name:'Scoring de leads',
    desc:"Évaluation automatique de chaque lead entrant avec un score de 0 à 100 et recommandation d'action.",
    metric:'×2 sur le taux de conversion', price:'190' },
  { id:4,  cat:'Commercial',    color:'#0066FF', icon:'🤝', name:'CRM IA',
    desc:"Enrichissement automatique des contacts, synchronisation multi-sources et alertes d'opportunités.",
    metric:'100 % des contacts enrichis', price:'290' },

  // ── Support ──────────────────────────────────────────────────
  { id:5,  cat:'Support',       color:'#7c3aed', icon:'🎧', name:'Loïc Support',
    desc:"Répond aux questions fréquentes 24h/24, classe les tickets et escalade les cas critiques.",
    metric:'−60 % de tickets traités manuellement', price:'390', popular:true },
  { id:6,  cat:'Support',       color:'#7c3aed', icon:'💬', name:'Chatbot multicanal',
    desc:"Présent sur votre site, WhatsApp Business et email — réponses instantanées à toute heure.",
    metric:'Répond en moins de 2 secondes', price:'290' },
  { id:7,  cat:'Support',       color:'#7c3aed', icon:'🎫', name:'Gestion de tickets',
    desc:"Priorisation intelligente des demandes entrantes et routage automatique vers le bon agent.",
    metric:'−45 % de temps de traitement', price:'190' },
  { id:8,  cat:'Support',       color:'#7c3aed', icon:'⭐', name:'Satisfaction client',
    desc:"Enquêtes NPS automatisées après chaque interaction avec analyse des verbatims.",
    metric:'+22 points NPS en moyenne', price:'90' },

  // ── RH ───────────────────────────────────────────────────────
  { id:9,  cat:'RH',            color:'#0891b2', icon:'👥', name:'Loïc RH',
    desc:"Gère les congés, trie les CVs, automatise l'onboarding et répond aux questions des équipes.",
    metric:'−8h/semaine de tâches administratives', price:'390', popular:true },
  { id:10, cat:'RH',            color:'#0891b2', icon:'📋', name:'Tri de CVs',
    desc:"Analyse automatique des candidatures selon vos critères avec rapport de présélection.",
    metric:'100 CVs traités en 10 minutes', price:'190' },
  { id:11, cat:'RH',            color:'#0891b2', icon:'🚀', name:'Onboarding IA',
    desc:"Parcours d'intégration automatisé : documents, accès, planning et suivi J+1 à J+30.",
    metric:'100 % des arrivées suivies', price:'190' },
  { id:12, cat:'RH',            color:'#0891b2', icon:'📅', name:'Gestion des congés',
    desc:"Demandes en ligne, vérification automatique des soldes et validation selon vos règles.",
    metric:'Zéro email RH pour les congés', price:'90' },

  // ── Contenu & SEO ────────────────────────────────────────────
  { id:13, cat:'Contenu & SEO', color:'#059669', icon:'✍️', name:'Rédaction SEO',
    desc:"Articles de blog, fiches produits et pages de vente optimisés pour Google chaque semaine.",
    metric:'Score SEO moyen : 91/100', price:'290' },
  { id:14, cat:'Contenu & SEO', color:'#059669', icon:'📱', name:'Social media auto',
    desc:"Publication automatique sur LinkedIn, Instagram et Facebook avec calendrier éditorial IA.",
    metric:'×3 publications mensuelles', price:'190' },
  { id:15, cat:'Contenu & SEO', color:'#059669', icon:'📨', name:'Newsletter intelligente',
    desc:"Segmentation automatique de vos abonnés et personnalisation du contenu par profil.",
    metric:"+45 % de taux d'ouverture", price:'190' },
  { id:16, cat:'Contenu & SEO', color:'#059669', icon:'🔍', name:'Veille sectorielle',
    desc:"Monitoring automatique de votre secteur, de vos concurrents et des tendances clés.",
    metric:'Rapport hebdomadaire en 1 clic', price:'90' },

  // ── Finance ──────────────────────────────────────────────────
  { id:17, cat:'Finance',       color:'#dc2626', icon:'🧾', name:'Facturation IA',
    desc:"Génération et envoi automatique de vos factures dès la validation de la prestation.",
    metric:"Facture envoyée en moins d'1 minute", price:'190' },
  { id:18, cat:'Finance',       color:'#dc2626', icon:'📩', name:'Relances impayés',
    desc:"Séquences de recouvrement automatisées : rappels amiables, mise en demeure, suivi.",
    metric:"−35 % d'impayés après 90 jours", price:'90' },
  { id:19, cat:'Finance',       color:'#dc2626', icon:'📈', name:'Reporting financier',
    desc:"Tableaux de bord mensuels générés automatiquement depuis vos données comptables.",
    metric:'Vision 360° en moins de 5 minutes', price:'190' },
  { id:20, cat:'Finance',       color:'#dc2626', icon:'🔮', name:'Prévisions trésorerie',
    desc:"IA prédictive sur vos données historiques pour anticiper vos besoins de trésorerie.",
    metric:'Précision à ±8 % sur 90 jours', price:'290' },

  // ── Automatisations ──────────────────────────────────────────
  { id:21, cat:'Automatisations', color:'#d97706', icon:'🔗', name:'Connecteur multi-outils',
    desc:"Synchronisation de Google Workspace, Slack, HubSpot, Notion et 40+ autres outils.",
    metric:'50+ intégrations disponibles', price:'290' },
  { id:22, cat:'Automatisations', color:'#d97706', icon:'⚙️', name:'Workflows sur mesure',
    desc:"Automatisations 100 % personnalisées entre vos applications métier, sans code.",
    metric:'+3h récupérées par workflow', price:'390' },
  { id:23, cat:'Automatisations', color:'#d97706', icon:'📊', name:'Rapports automatiques',
    desc:"Centralisation hebdomadaire de vos données clés depuis toutes vos sources.",
    metric:'Un seul rapport pour tout piloter', price:'90' },
  { id:24, cat:'Automatisations', color:'#d97706', icon:'🔔', name:'Alertes intelligentes',
    desc:"Notifications en temps réel sur vos métriques clés, seuils critiques et anomalies.",
    metric:'Alertes en moins de 30 secondes', price:'90' },
]

const CATS = ['Tous', 'Commercial', 'Support', 'RH', 'Contenu & SEO', 'Finance', 'Automatisations']

const HERO_STATS = [
  { val: '24', lbl: 'Solutions' },
  { val: '6',  lbl: 'Catégories' },
  { val: '48h', lbl: 'Déploiement' },
  { val: '30j', lbl: 'Accompagnement' },
]

export default function Catalogue() {
  const [active, setActive] = useState('Tous')

  const visible = useMemo(
    () => active === 'Tous' ? SOLUTIONS : SOLUTIONS.filter(s => s.cat === active),
    [active]
  )

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
          <h1 className="cat-h1">Choisissez votre <em>solution IA.</em></h1>
          <p className="cat-sub">
            24 solutions prêtes à déployer dans votre entreprise en 48h. Chacune est opérationnelle, mesurable et accompagnée pendant 30 jours.
          </p>
          <div className="cat-hero-stats">
            {HERO_STATS.map(({ val, lbl }) => (
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
        <div className="cat-filters-inner">
          {CATS.map(c => (
            <button
              key={c}
              className={`cat-filter-btn${active === c ? ' cat-filter-btn--active' : ''}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
          <span className="cat-count">
            {visible.length} solution{visible.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════ GRID */}
      <section className="cat-section">
        <div className="cat-section-inner">
          <div className="cat-grid">
            {visible.map(s => (
              <div
                key={s.id}
                className={`cat-card${s.popular ? ' cat-card--popular' : ''}`}
                style={s.popular ? { '--card-accent': s.color } : {}}
              >
                <div className="cat-card-top">
                  <span
                    className="cat-card-badge"
                    style={{ background: s.color + '18', color: s.color }}
                  >
                    {s.cat}
                  </span>
                  {s.popular && <span className="cat-card-pop">★ Populaire</span>}
                </div>

                <div className="cat-card-icon">{s.icon}</div>
                <h3 className="cat-card-name">{s.name}</h3>
                <p className="cat-card-desc">{s.desc}</p>

                <p className="cat-card-metric">
                  <span className="cat-check">✓</span>
                  {s.metric}
                </p>

                <div className="cat-card-divider" />

                <div className="cat-card-bottom">
                  <div className="cat-card-price">
                    <span className="cat-price-from">À partir de</span>
                    <span className="cat-price-val">
                      {s.price} €<small>/mois</small>
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
            ))}
          </div>
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
