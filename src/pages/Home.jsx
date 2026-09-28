import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import { usePageMeta } from '../lib/seo'
import { useJsonLd, organizationSchema, websiteSchema } from '../lib/schema'

const EXPERTISES = [
  {
    href: '/expertises/ia',
    title: 'Intelligence Artificielle',
    desc: 'Agents conversationnels, RAG, automatisation décisionnelle. Des systèmes qui pensent avec votre équipe, pas à sa place.',
  },
  {
    href: '/expertises/automatisation',
    title: 'Automatisation',
    desc: 'N8N, Make, scripts sur mesure. Vos processus répétitifs disparaissent. Vos équipes se concentrent sur ce qui compte.',
  },
  {
    href: '/expertises/web-saas',
    title: 'Web & SaaS',
    desc: 'Sites vitrines, e-commerce, applications métier. Du code propre, livrable en semaines, pas en mois.',
  },
  {
    href: '/expertises/infrastructure',
    title: 'Infrastructure IT',
    desc: "Cloud, sécurité, sauvegardes, supervision. La technique qui s'oublie parce qu'elle ne tombe jamais.",
  },
]

const WORKS = [
  {
    title: 'CA-TECH Manager',
    client: 'CA-TECH',
    desc: 'CRM et outil de gestion interne développé entièrement sur mesure — devis, contrats, clients, trésorerie et suivi de projet en temps réel.',
    tags: ['React', 'Supabase', 'Stripe'],
    href: '/realisations',
    img: '/assets/realisations/ca-tech-manager.webp',
    featured: true,
  },
  {
    title: 'CV Magic',
    client: 'CV Magic',
    desc: 'Application SaaS de création de CV assistée par IA.',
    tags: ['Next.js', 'OpenAI'],
    href: '/realisations',
    img: '/assets/realisations/cv-magic.webp',
    featured: false,
  },
  {
    title: 'Pemous Money',
    client: 'Pemous',
    desc: 'Application de suivi financier personnel avec catégorisation automatique.',
    tags: ['React', 'Supabase'],
    href: '/realisations',
    img: '/assets/realisations/pemous-money.webp',
    featured: false,
  },
]

const METHOD = [
  {
    n: '01',
    title: 'Comprendre',
    desc: 'Audit de votre activité, vos processus, vos contraintes. On pose les bonnes questions avant de proposer des solutions.',
  },
  {
    n: '02',
    title: 'Concevoir',
    desc: "Architecture technique, maquettes, roadmap chiffrée. Vous validez avant qu'une ligne de code est écrite.",
  },
  {
    n: '03',
    title: 'Construire',
    desc: 'Développement itératif, premières livraisons rapides. Vous voyez le projet avancer chaque semaine.',
  },
  {
    n: '04',
    title: 'Déployer',
    desc: 'Mise en production supervisée, tests en conditions réelles, documentation remise à vos équipes.',
  },
  {
    n: '05',
    title: 'Améliorer',
    desc: "Monitoring, optimisations continues, évolutions priorisées. Le projet ne s'arrête pas à la mise en ligne.",
  },
]

export default function Home() {
  usePageMeta({
    title: 'CA-TECH — Cabinet technologique français',
    description: 'Cabinet technologique spécialisé en intelligence artificielle, automatisation, développement web et infrastructure IT pour les PME françaises.',
    canonical: 'https://www.ca-tech.fr/',
  })

  useJsonLd('home-org', organizationSchema)
  useJsonLd('home-web', websiteSchema)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const els = document.querySelectorAll('.home-page .reveal')
    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    )

    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="home-page">

      {/* ── 01 HERO ── */}
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-meta reveal">
            <span className="home-hero-num" aria-hidden="true">01</span>
            <span className="home-hero-eyebrow">CA-TECH / TECHNOLOGIE · IA · AUTOMATISATION</span>
          </div>
          <div className="home-hero-divider" aria-hidden="true" />
          <h1 className="home-hero-headline reveal" data-delay="1">
            LA TECHNOLOGIE{' '}
            <br className="hero-break" />
            AU TRAVAIL.
          </h1>
          <p className="home-hero-body reveal" data-delay="2">
            CA-TECH conçoit, automatise et déploie des systèmes numériques
            adaptés aux besoins réels des entreprises.
          </p>
          <div className="home-hero-actions reveal" data-delay="3">
            <Link to="/contact" className="btn-primary">Parler de votre projet</Link>
            <Link to="/realisations" className="btn-ghost">Voir les réalisations</Link>
          </div>
        </div>
      </section>

      {/* ── 02 POSITIONNEMENT ── */}
      <section className="home-position">
        <div className="container home-position-inner">
          <p className="eyebrow reveal">Positionnement</p>
          <h2 className="home-position-headline reveal" data-delay="1">
            Un cabinet, pas une agence.
          </h2>
          <div className="home-position-body-wrap">
            <p className="home-position-body reveal" data-delay="2">
              Une agence livre un site. Nous livrons un système&nbsp;— conçu pour durer,
              documenté pour être repris, pensé pour s'intégrer dans vos processus réels.
            </p>
            <p className="home-position-body reveal" data-delay="2">
              Nous cadrons avant de coder. Nous mesurons après avoir livré. Et nous restons
              disponibles quand le vrai travail commence — quand les utilisateurs arrivent.
            </p>
          </div>
        </div>
      </section>

      {/* ── 03 EXPERTISES ── */}
      <section className="home-expertises">
        <div className="container">
          <div className="home-section-header">
            <p className="eyebrow reveal">Nos domaines</p>
            <h2 className="home-section-title reveal" data-delay="1">Quatre expertises, une équipe.</h2>
          </div>
          <ol className="expertises-list">
            {EXPERTISES.map((exp, i) => (
              <li key={exp.href} className="expertise-row reveal" data-delay={String(i % 2)}>
                <Link to={exp.href} className="expertise-row-link">
                  <span className="expertise-row-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="expertise-row-content">
                    <span className="expertise-row-title">{exp.title}</span>
                    <span className="expertise-row-desc">{exp.desc}</span>
                  </span>
                  <span className="expertise-row-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 04 RÉALISATIONS ── */}
      <section className="home-works">
        <div className="container">
          <div className="home-section-header">
            <p className="eyebrow reveal">Projets livrés</p>
            <h2 className="home-section-title reveal" data-delay="1">Ce que nous avons construit.</h2>
          </div>
          <div className="works-grid">
            {WORKS.map((w, i) => (
              <Link
                key={w.title}
                to={w.href}
                className={`work-card reveal${w.featured ? ' work-card--featured' : ''}`}
                data-delay={String(i % 3)}
              >
                <div className="work-card-img-wrap">
                  <img
                    src={w.img}
                    alt={`Aperçu du projet ${w.title}`}
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="500"
                    className="work-card-img"
                  />
                </div>
                <div className="work-card-body">
                  <span className="work-card-client">{w.client}</span>
                  <h3 className="work-card-title">{w.title}</h3>
                  {w.featured && <p className="work-card-desc">{w.desc}</p>}
                  <div className="work-card-tags">
                    {w.tags.map(t => (
                      <span key={t} className="work-card-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="home-works-foot reveal">
            <Link to="/realisations" className="btn-ghost">Voir toutes les réalisations&nbsp;→</Link>
          </div>
        </div>
      </section>

      {/* ── 05 MÉTHODE ── */}
      <section className="home-method">
        <div className="container">
          <div className="home-section-header">
            <p className="eyebrow reveal">Notre méthode</p>
            <h2 className="home-section-title reveal" data-delay="1">Comment nous travaillons.</h2>
          </div>
          <ol className="method-parcours">
            {METHOD.map((step, i) => (
              <li key={step.n} className="method-parcours-step reveal" data-delay={String(i % 3)}>
                <span className="method-parcours-num" aria-hidden="true">{step.n}</span>
                <h3 className="method-parcours-title">{step.title}</h3>
                <p className="method-parcours-desc">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 06 À PROPOS ── */}
      <section className="home-about">
        <div className="container home-about-inner">
          <div className="home-about-content">
            <p className="eyebrow reveal">À propos</p>
            <h2 className="home-about-title reveal" data-delay="1">
              Nous sommes des technologues, pas des vendeurs de solutions.
            </h2>
            <p className="home-about-body reveal" data-delay="2">
              CA-TECH est un cabinet technologique fondé en 2023, basé à Dijon, qui intervient en France entière.
              Notre équipe conçoit et livre des systèmes pour les PME — de la création de site au déploiement
              d'agents IA en production.
            </p>
            <p className="home-about-body reveal" data-delay="2">
              Nous n'avons pas de catalogue générique. Chaque projet commence par un diagnostic —
              gratuit, 30 minutes, avec un compte-rendu écrit remis dans les 24h.
            </p>
            <div className="home-about-founder reveal" data-delay="3">
              <span className="home-about-founder-name">Jean Kevin PEMOU</span>
              <span className="home-about-founder-role">Consultant en technologie, IA et infrastructure.</span>
            </div>
            <Link to="/a-propos" className="btn-ghost reveal" data-delay="4">
              En savoir plus sur CA-TECH&nbsp;→
            </Link>
          </div>
        </div>
      </section>

      {/* ── 07 CTA FINAL ── */}
      <section className="home-cta-final">
        <div className="container home-cta-final-inner">
          <p className="home-cta-final-eyebrow reveal">Un projet à construire&nbsp;?</p>
          <h2 className="home-cta-final-title reveal" data-delay="1">
            Parlons de votre prochain système numérique.
          </h2>
          <Link to="/contact" className="btn-primary btn-primary--lg reveal" data-delay="2">
            Parler de votre projet
          </Link>
        </div>
      </section>

    </div>
  )
}
