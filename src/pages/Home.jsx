import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../../css/main.css'
import { usePageMeta } from '../lib/seo'
import { useJsonLd, organizationSchema, websiteSchema, itemListSchema } from '../lib/schema'

/* ── Carte expertise réutilisable ───────────────────────────────────────── */
function ExpertiseCard({ img, alt, badge, badgeColor, title, desc, benefits, href, className }) {
  function onEnter(e) {
    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,.13)'
    e.currentTarget.style.transform = 'translateY(-5px)'
    const z = e.currentTarget.querySelector('[data-zoom]')
    if (z) z.style.transform = 'scale(1.07)'
  }
  function onLeave(e) {
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.transform = 'none'
    const z = e.currentTarget.querySelector('[data-zoom]')
    if (z) z.style.transform = 'none'
  }
  return (
    <Link
      to={href}
      className={className}
      style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 250ms ease, transform 250ms cubic-bezier(.16,1,.3,1)', height: '100%' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0 }}>
        <img data-zoom="1" src={img} alt={alt} loading="lazy" decoding="async" width="640" height="360"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 600ms cubic-bezier(.16,1,.3,1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.42) 100%)', pointerEvents: 'none' }} />
      </div>
      {/* Contenu */}
      <div style={{ padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', gap: '11px', flex: 1 }}>
        <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: badgeColor }}>{badge}</span>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.25, color: '#0A2540', margin: 0, letterSpacing: '-.01em' }}>{title}</h3>
        <p style={{ fontSize: '.875rem', lineHeight: 1.65, color: '#4a5568', margin: 0 }}>{desc}</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {benefits.map((b, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '.83rem', color: '#374151' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={badgeColor} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              {b}
            </li>
          ))}
        </ul>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '.875rem', fontWeight: 700, color: '#0A2540', marginTop: 'auto', paddingTop: '8px' }}>
          Découvrir
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </span>
      </div>
    </Link>
  )
}

/* ── Données expertises ─────────────────────────────────────────────────── */
const EXPERTISES = [
  {
    img: '/services/site-vitrine.webp',
    alt: 'Site vitrine professionnel',
    badge: 'Développement Web',
    badgeColor: '#0066FF',
    title: 'Un site qui attire et convertit vos clients',
    desc: 'Sites vitrines, e-commerce, landing pages. Design premium, chargement ultra-rapide, SEO intégré dès le départ.',
    benefits: ['Chargement < 2 secondes', 'Compatible mobile & tablette', 'Livré en 1 à 6 semaines'],
    href: '/services',
    className: 'reveal',
  },
  {
    img: '/portfolio/ca-tech-manager/dashboard.webp',
    alt: 'Application métier sur mesure',
    badge: 'Applications Métier',
    badgeColor: '#6366F1',
    title: 'Des outils métier adaptés à vos processus',
    desc: 'CRM, ERP, portails clients, dashboards. Des logiciels sur mesure pour piloter votre activité et gagner en efficacité.',
    benefits: ['Interface intuitive, prise en main < 1h', 'Données en temps réel', 'Intégration avec vos outils'],
    href: '/services',
    className: 'reveal d1',
  },
  {
    img: '/portfolio/ca-tech-manager/clients.webp',
    alt: 'CRM sur mesure',
    badge: 'CRM sur mesure',
    badgeColor: '#8B5CF6',
    title: 'Gérez vos clients et prospects sans effort',
    desc: 'Un CRM pensé pour votre secteur. Suivi des opportunités, relances automatiques, tableaux de bord — fini les tableurs.',
    benefits: ['Adapté à votre métier', 'Relances automatisées', 'Accès équipe illimité'],
    href: '/services',
    className: 'reveal d2',
  },
  {
    img: '/collaborateurs/collaborateur-ia-hero.webp',
    alt: 'Collaborateurs IA',
    badge: 'Solutions IA',
    badgeColor: '#0066FF',
    title: 'Un collaborateur IA opérationnel en 48h',
    desc: 'Agents IA qui qualifient vos leads, répondent à vos clients et automatisent votre SAV — disponibles 24h/24 sans pause.',
    benefits: ['ROI visible dès le 1er mois', '+180% satisfaction client', 'À partir de 800 €'],
    href: '/collaborateurs-ia',
    className: 'reveal d3',
  },
  {
    img: '/automatisations/automatisation-hero.webp',
    alt: 'Automatisations de processus',
    badge: 'Automatisations',
    badgeColor: '#10B981',
    title: '14h récupérées par semaine en moyenne',
    desc: 'Workflows N8N, Make, Zapier. Vos tâches répétitives tournent seules — devis, relances, reporting, synchro — en 48h.',
    benefits: ['ROI ×4 en 3 mois', 'Sans coder ni former vos équipes', 'N8N · Make · Zapier · Python'],
    href: '/automatisations',
    className: 'reveal d1',
  },
  {
    img: '/collaborateurs/seo-ia.webp',
    alt: 'Référencement SEO',
    badge: 'Marketing Digital',
    badgeColor: '#F59E0B',
    title: 'Soyez trouvé avant vos concurrents',
    desc: 'Audit technique, contenu optimisé, SEO local et national. Trafic organique ×3.4 en 6 mois en moyenne.',
    benefits: ['Audit SEO offert au démarrage', 'Reporting mensuel inclus', 'Résultats sous 90 jours'],
    href: '/services',
    className: 'reveal d2',
  },
]

export default function Home() {
  usePageMeta({
    title: 'CA-TECH — Agence Web & IA · Sites, CRM, SaaS, Agents IA à Paris',
    description: "Agence web et cabinet de conseil IA à Paris, Lyon, Dijon. Sites vitrines, e-commerce, applications métier, CRM sur mesure, SaaS, automatisations et agents IA pour PME. Diagnostic gratuit sous 24h.",
    keywords: 'agence web, agence IA, développement site internet, site vitrine, e-commerce, application métier, CRM sur mesure, SaaS, automatisation entreprise, agents IA, collaborateurs IA, SEO, conseil IA, Paris, Lyon, Dijon',
    path: '/',
  })
  useJsonLd('organization', organizationSchema)
  useJsonLd('website', websiteSchema)
  useJsonLd('home-services', itemListSchema([
    { name: 'Sites vitrines',            path: '/services#dev-web' },
    { name: 'Sites e-commerce',          path: '/services#dev-web' },
    { name: 'Applications métier',       path: '/services#apps-metier' },
    { name: 'CRM sur mesure',            path: '/services#apps-metier' },
    { name: 'Développement SaaS',        path: '/services#apps-metier' },
    { name: 'Automatisation entreprise', path: '/automatisations' },
    { name: 'Agents IA',                 path: '/services#solutions-ia' },
    { name: 'Collaborateurs IA',         path: '/collaborateurs-ia' },
    { name: 'SEO',                       path: '/services#marketing' },
    { name: 'Maintenance & Hébergement', path: '/services#maintenance' },
    { name: 'Audit digital',             path: '/services#audit' },
    { name: 'Conseil IA',                path: '/services#conseil-ia' },
  ]))

  useEffect(() => {
    /* ── HERO ENTRANCE ANIMATION ─────────────────────────────────────── */
    ;(function () {
      if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        ;['hero-h1', 'hero-sub', 'hero-desc', 'hero-ctas', 'hero-micro', 'hero-demo'].forEach(function (id) {
          var el = document.getElementById(id)
          if (el) { el.style.opacity = '1'; el.style.transform = 'none' }
        })
        return
      }
      var pill = document.querySelector('.hero-pill')
      function animate(el, delay) {
        if (!el) return
        el.style.transition = 'opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1)'
        setTimeout(function () { el.style.opacity = '1'; el.style.transform = 'none' }, delay)
      }
      if (pill) {
        pill.style.opacity = '0'
        pill.style.transform = 'translateY(12px)'
        pill.style.transition = 'opacity 400ms ease, transform 400ms ease'
        setTimeout(function () { pill.style.opacity = '1'; pill.style.transform = 'none' }, 0)
      }
      animate(document.getElementById('hero-h1'), 100)
      animate(document.getElementById('hero-sub'), 250)
      animate(document.getElementById('hero-desc'), 350)
      animate(document.getElementById('hero-ctas'), 450)
      animate(document.getElementById('hero-micro'), 550)
      animate(document.getElementById('hero-demo'), 650)

      var msgs = document.getElementById('chat-messages')
      if (!msgs) return
      var seq = [
        { role: 'loic', text: 'Bonjour ! Je suis Loïc, votre consultant IA chez CA-TECH. 👋', delay: 800 },
        { role: 'user', text: "Combien d'heures mon équipe perd-elle sur des tâches répétitives ?", delay: 3200 },
        { role: 'loic', text: 'En moyenne, nos clients récupèrent 14h/semaine dès le premier mois. 🚀', delay: 5200 },
        { role: 'user', text: 'Vous faites aussi des sites internet ?', delay: 8400 },
        { role: 'loic', text: 'Oui — vitrines, e-commerce, applications métier. Livré en 1 à 6 semaines. ✅', delay: 10400 },
        { role: 'user', text: "C'est quoi exactement un collaborateur IA ?", delay: 13800 },
        { role: 'loic', text: 'Un agent qui répond à vos clients, traite vos tickets et relance vos prospects — 24h/24, sans congé. 🤖', delay: 15800 },
        { role: 'user', text: 'Et pour le SEO et le marketing ?', delay: 19600 },
        { role: 'loic', text: 'Notre SEO IA publie du contenu optimisé chaque semaine. Résultat moyen : ×3 de trafic en 6 mois. 📈', delay: 21600 },
        { role: 'user', text: 'Quel est le prix pour démarrer ?', delay: 25200 },
        { role: 'loic', text: 'À partir de 800 € — ROI dès le 1er mois. 🎯', delay: 27200 },
      ]
      seq.forEach(function (m) {
        setTimeout(function () {
          var t = document.createElement('div')
          t.className = 'chat-typing show'
          t.innerHTML = '<span></span><span></span><span></span>'
          msgs.appendChild(t)
          msgs.scrollTop = msgs.scrollHeight
          setTimeout(function () {
            msgs.removeChild(t)
            var b = document.createElement('div')
            b.className = 'chat-bubble ' + m.role
            b.textContent = m.text
            msgs.appendChild(b)
            requestAnimationFrame(function () { b.classList.add('show') })
            msgs.scrollTop = msgs.scrollHeight
          }, 900)
        }, m.delay)
      })
      setTimeout(function () {
        var cta = document.createElement('a')
        cta.href = '/contact'
        cta.className = 'chat-bubble loic show'
        cta.innerHTML = '<strong>→ Lancer mon diagnostic gratuit</strong>'
        cta.style.cursor = 'pointer'
        msgs.appendChild(cta)
        msgs.scrollTop = msgs.scrollHeight
      }, 30000)
    })()

    /* ── SCROLL REVEAL ────────────────────────────────────────────────── */
    ;(function () {
      if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(function (el) { el.classList.add('visible') })
        return
      }
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
        })
      }, { threshold: 0.10 })
      document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(function (el) { obs.observe(el) })
    })()

    /* ── COUNT-UP ─────────────────────────────────────────────────────── */
    ;(function () {
      if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          obs.unobserve(entry.target)
          var el = entry.target
          var count = parseInt(el.dataset.count, 10)
          if (isNaN(count)) return
          var prefix = el.dataset.prefix || ''
          var suffix = el.dataset.suffix || ''
          var duration = 1200
          var start = performance.now()
          function update(now) {
            var p = Math.min((now - start) / duration, 1)
            var ease = 1 - Math.pow(1 - p, 3)
            el.textContent = prefix + Math.round(ease * count) + suffix
            if (p < 1) requestAnimationFrame(update)
          }
          requestAnimationFrame(update)
        })
      }, { threshold: 0.3 })
      document.querySelectorAll('.proof-value[data-count]').forEach(function (el) { obs.observe(el) })
    })()
  }, [])

  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" aria-label="Bienvenue sur CA-TECH">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-pill">
                <span className="pill pill-dark">✦ Agence Web &amp; Cabinet IA</span>
              </div>
              <h1 className="hero-h1" id="hero-h1" style={{ opacity: 0, transform: 'translateY(16px)' }}>
                Agence Web &amp; IA — les outils qui font grandir votre entreprise.
              </h1>
              <p className="hero-subtitle" id="hero-sub" style={{ opacity: 0, transform: 'translateY(12px)' }}>
                Sites vitrines • E-commerce • Applications métier • CRM sur mesure • SaaS • Automatisations • Agents IA • SEO • Maintenance
              </p>
              <p className="hero-desc" id="hero-desc" style={{ opacity: 0, transform: 'translateY(8px)', color: 'rgba(255,255,255,.65)', fontSize: '1rem', lineHeight: 1.65, maxWidth: '520px', marginBottom: '2rem' }}>
                CA-TECH conçoit, déploie et maintient les solutions digitales et IA qui automatisent votre activité, attirent plus de clients et accompagnent votre croissance. À Paris, Lyon, Dijon &amp; Troyes.
              </p>
              <div className="hero-ctas" id="hero-ctas" style={{ opacity: 0, transform: 'translateY(8px)' }}>
                <a href="/devis" className="btn btn-white btn-xl" aria-label="Créer mon projet">Créer mon projet →</a>
                <Link to="/services" className="btn btn-ghost-white btn-xl">Découvrir nos solutions</Link>
              </div>
              <p className="hero-micro" id="hero-micro" style={{ opacity: 0 }}>Gratuit · Sans engagement · Premier livrable en 72h</p>
            </div>
            <div className="hero-demo" aria-hidden="true" id="hero-demo" style={{ opacity: 0, transform: 'scale(.96)' }}>
              <div className="chat-frame">
                <div className="chat-bar">
                  <div className="chat-dots"><span></span><span></span><span></span></div>
                  <span className="chat-bar-title">Loïc — Consultant IA</span>
                  <span className="chat-bar-status">En ligne</span>
                </div>
                <div className="chat-messages" id="chat-messages"></div>
                <div className="chat-input-bar">
                  <div className="chat-input-mock">Votre message...</div>
                  <div className="chat-send">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. NOS EXPERTISES ───────────────────────────────────────────────── */}
      <section id="expertises" aria-labelledby="expertises-title" style={{ padding: '96px 0' }}>
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Nos expertises</span>
            <h2 className="section-h2" id="expertises-title">Des solutions pour chaque défi digital</h2>
            <p className="section-intro">De la vitrine au système complet — CA-TECH maîtrise toute la chaîne du digital.</p>
          </div>
          <ul
            role="list"
            aria-label="Nos expertises"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '24px', listStyle: 'none', padding: 0, margin: '56px 0 0' }}
          >
            {EXPERTISES.map((card, i) => (
              <li key={i} style={{ display: 'flex' }}>
                <ExpertiseCard {...card} />
              </li>
            ))}
          </ul>
          <div style={{ textAlign: 'center', marginTop: '48px' }} className="reveal">
            <Link to="/services" className="btn btn-secondary">Voir toutes nos solutions →</Link>
          </div>
        </div>
      </section>

      {/* ── 3. POURQUOI CHOISIR CA-TECH ─────────────────────────────────────── */}
      <section id="why" aria-labelledby="why-title" style={{ background: 'var(--color-bg-alt, #F8FAFF)', padding: '96px 0' }}>
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Pourquoi CA-TECH</span>
            <h2 className="section-h2" id="why-title">Des résultats mesurables, pas des promesses</h2>
            <p className="section-intro">Chaque chiffre est issu de missions réelles, vérifiables.</p>
          </div>
          <dl className="proof-grid" style={{ marginTop: '56px' }}>
            <div className="proof-stat reveal">
              <dd className="proof-value" data-count="200" data-prefix="" data-suffix="+">200+</dd>
              <dt className="proof-label">Projets réalisés<br />depuis notre création</dt>
            </div>
            <div className="proof-stat reveal d1">
              <dd className="proof-value" data-count="98" data-prefix="" data-suffix="%">98%</dd>
              <dt className="proof-label">Clients satisfaits<br />selon notre NPS</dt>
            </div>
            <div className="proof-stat reveal d2">
              <dd className="proof-value" data-count="250" data-prefix="+" data-suffix="%">+250%</dd>
              <dt className="proof-label">ROI moyen constaté<br />sur nos missions IA</dt>
            </div>
            <div className="proof-stat reveal d3">
              <dd className="proof-value" style={{ fontSize: '2.25rem' }}>24h/24</dd>
              <dt className="proof-label">Support & Collaborateurs IA<br />disponibles en permanence</dt>
            </div>
          </dl>
          <div className="reassurance-bar reveal" style={{ marginTop: '56px' }}>
            <div className="reassurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Devis gratuit et sans engagement
            </div>
            <div className="reassurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Réponse sous 24h
            </div>
            <div className="reassurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Résultats mesurables garantis
            </div>
            <div className="reassurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              Pas de contrat long terme
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. NOS SOLUTIONS IA ──────────────────────────────────────────────── */}
      <section id="solutions-ia" aria-labelledby="solutions-ia-title" style={{ padding: '96px 0' }}>
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Intelligence Artificielle</span>
            <h2 className="section-h2" id="solutions-ia-title">Nos solutions IA qui travaillent pour vous</h2>
            <p className="section-intro">Deux produits phares. Des résultats concrets dès la première semaine.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))', gap: '28px', marginTop: '56px' }}>

            {/* Collaborateurs IA */}
            <article
              className="reveal-l"
              style={{ borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden', background: '#fff', transition: 'box-shadow 250ms ease, transform 250ms cubic-bezier(.16,1,.3,1)' }}
              aria-label="Collaborateurs IA"
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,102,255,.15)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                const z = e.currentTarget.querySelector('[data-zoom]')
                if (z) z.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'none'
                const z = e.currentTarget.querySelector('[data-zoom]')
                if (z) z.style.transform = 'none'
              }}
            >
              {/* Image avec texte overlay */}
              <div style={{ position: 'relative', aspectRatio: '16/8', overflow: 'hidden' }}>
                <img data-zoom="1" src="/collaborateurs/collaborateur-ia-hero.webp" alt="Collaborateurs IA" loading="lazy" decoding="async" width="960" height="480"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 600ms cubic-bezier(.16,1,.3,1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.1) 0%, rgba(5,15,40,.82) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 32px' }}>
                  <span style={{ display: 'inline-block', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: '10px' }}>Solutions IA · N°1</span>
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-.02em', lineHeight: 1.15 }}>Un employé IA disponible 24h/24</h3>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem', lineHeight: 1.6, margin: 0 }}>Il répond à vos clients, qualifie vos leads et traite votre SAV — sans pause ni congé.</p>
                </div>
              </div>
              {/* Corps */}
              <div style={{ padding: '28px 32px 32px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Chatbot qualifiant intégré à votre site', 'Agent SAV — 73% des tickets traités sans humain', 'À partir de 800 € — premier livrable en 72h'].map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '.9rem', color: '#374151' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link to="/collaborateurs-ia" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Découvrir les Collaborateurs IA →
                </Link>
              </div>
            </article>

            {/* Automatisations */}
            <article
              className="reveal-r"
              style={{ borderRadius: '20px', border: '1px solid #e5e7eb', overflow: 'hidden', background: '#fff', transition: 'box-shadow 250ms ease, transform 250ms cubic-bezier(.16,1,.3,1)' }}
              aria-label="Automatisations"
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(16,185,129,.15)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                const z = e.currentTarget.querySelector('[data-zoom]')
                if (z) z.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'none'
                const z = e.currentTarget.querySelector('[data-zoom]')
                if (z) z.style.transform = 'none'
              }}
            >
              {/* Image avec texte overlay */}
              <div style={{ position: 'relative', aspectRatio: '16/8', overflow: 'hidden' }}>
                <img data-zoom="1" src="/automatisations/automatisation-hero.webp" alt="Automatisations" loading="lazy" decoding="async" width="960" height="480"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 600ms cubic-bezier(.16,1,.3,1)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.1) 0%, rgba(3,30,20,.82) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 32px' }}>
                  <span style={{ display: 'inline-block', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: '10px' }}>Automatisations · N8N · Make · Zapier</span>
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-.02em', lineHeight: 1.15 }}>14h récupérées par semaine en moyenne</h3>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem', lineHeight: 1.6, margin: 0 }}>Vos processus répétitifs tournent seuls. Déployé en 48h, ROI ×4 en 3 mois.</p>
                </div>
              </div>
              {/* Corps */}
              <div style={{ padding: '28px 32px 32px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['N8N, Make, Zapier, scripts Python sur mesure', 'Devis, relances, facturation — 100% automatiques', 'À partir de 800 € — ROI moyen ×4 en 3 mois'].map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '.9rem', color: '#374151' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link to="/automatisations" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', borderColor: '#10B981', color: '#10B981' }}>
                  Découvrir les Automatisations →
                </Link>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ── 5. ÉTUDES DE CAS ─────────────────────────────────────────────────── */}
      <section id="cas-clients" aria-labelledby="cases-title" style={{ background: 'var(--color-bg-alt, #F8FAFF)', padding: '96px 0' }}>
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Études de cas</span>
            <h2 className="section-h2" id="cases-title">Des résultats réels, vérifiables</h2>
            <p className="section-intro">Trois missions récentes. Des chiffres issus de projets livrés.</p>
          </div>
          <ul className="cases-grid" role="list" aria-label="Études de cas clients" style={{ marginTop: '56px' }}>
            <li>
              <article className="case-card reveal" aria-label="Agent IA SAV — e-commerce">
                <div className="case-tags">
                  <span className="case-tag ia">Intelligence Artificielle</span>
                  <span className="case-sector">E-commerce · Mode</span>
                </div>
                <h3 className="case-title">Agent IA SAV — 3 000 tickets/mois traités automatiquement</h3>
                <p className="case-desc">Un commerçant en ligne recevait 3 000 demandes SAV par mois. Son équipe était débordée. En 72h, nous avons déployé un agent qui traite 73% des tickets sans intervention humaine.</p>
                <div className="case-kpis">
                  <div className="case-kpi"><span className="case-kpi-value">+180%</span><div className="case-kpi-label">Satisfaction client</div></div>
                  <div className="case-kpi"><span className="case-kpi-value">-73%</span><div className="case-kpi-label">Tickets humains</div></div>
                  <div className="case-kpi"><span className="case-kpi-value">72h</span><div className="case-kpi-label">Déploiement</div></div>
                </div>
                <Link to="/realisations" className="why-link" style={{ marginTop: '20px' }}>
                  Lire l'étude de cas <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </article>
            </li>
            <li>
              <article className="case-card reveal d1" aria-label="Automatisation devis — BTP">
                <div className="case-tags">
                  <span className="case-tag auto">Automatisation</span>
                  <span className="case-sector">BTP · Artisanat</span>
                </div>
                <h3 className="case-title">Devis automatisés — 14h récupérées par semaine</h3>
                <p className="case-desc">Un artisan passait 14h par semaine à rédiger des devis manuellement. Nous avons automatisé le processus de A à Z : réception demande → calcul → envoi PDF signable en ligne.</p>
                <div className="case-kpis">
                  <div className="case-kpi"><span className="case-kpi-value">-14h</span><div className="case-kpi-label">Par semaine</div></div>
                  <div className="case-kpi"><span className="case-kpi-value">×4</span><div className="case-kpi-label">ROI en 3 mois</div></div>
                  <div className="case-kpi"><span className="case-kpi-value">0</span><div className="case-kpi-label">Erreur calcul</div></div>
                </div>
                <Link to="/realisations" className="why-link" style={{ marginTop: '20px' }}>
                  Lire l'étude de cas <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </article>
            </li>
            <li>
              <article className="case-card reveal d2" aria-label="SEO — Cabinet conseil B2B">
                <div className="case-tags">
                  <span className="case-tag seo">SEO</span>
                  <span className="case-sector">Services B2B · Conseil</span>
                </div>
                <h3 className="case-title">Trafic organique ×3.4 en 6 mois</h3>
                <p className="case-desc">Un cabinet de conseil B2B était invisible sur Google. Audit technique + stratégie de contenu IA + piliers thématiques : ×3.4 de trafic en 6 mois, sans budget publicitaire.</p>
                <div className="case-kpis">
                  <div className="case-kpi"><span className="case-kpi-value">×3.4</span><div className="case-kpi-label">Trafic organique</div></div>
                  <div className="case-kpi"><span className="case-kpi-value">+12</span><div className="case-kpi-label">Positions gagnées</div></div>
                  <div className="case-kpi"><span className="case-kpi-value">+67%</span><div className="case-kpi-label">Leads SEO</div></div>
                </div>
                <Link to="/realisations" className="why-link" style={{ marginTop: '20px' }}>
                  Lire l'étude de cas <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              </article>
            </li>
          </ul>
          <div style={{ textAlign: 'center', marginTop: '48px' }} className="reveal">
            <Link to="/realisations" className="btn btn-secondary">→ Voir toutes nos réalisations</Link>
          </div>
        </div>
      </section>

      {/* ── 6. CTA FINAL ─────────────────────────────────────────────────────── */}
      <section id="cta-final" aria-labelledby="cta-final-title">
        <div className="container">
          <div className="cta-final-pre"><span className="pill pill-dark">✦ Prêt à démarrer ?</span></div>
          <h2 className="cta-final-h2" id="cta-final-title">Parlons de votre projet.</h2>
          <p className="cta-final-sub">Diagnostic gratuit · Devis sous 24h · Premier livrable en 72h.<br />Pas d'engagement, des résultats mesurables.</p>
          <div className="cta-final-btns">
            <a href="/devis" className="btn btn-white btn-xl">Demander un devis →</a>
            <a href="/contact" className="btn btn-ghost-white btn-xl">Planifier un rendez-vous</a>
          </div>
          <p className="cta-final-micro">Gratuit · Sans engagement · Réponse sous 24h</p>
        </div>
      </section>
    </>
  )
}
