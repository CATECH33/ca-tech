import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './CollaborateursIA.css'

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
    cta: { label: 'Tester Loïc', href: '/loic', variant: 'primary' },
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
    cta: { label: 'Découvrir', href: '/contact', variant: 'outline' },
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
    cta: { label: 'Découvrir', href: '/contact', variant: 'outline' },
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
    cta: { label: 'Découvrir', href: '/contact', variant: 'outline' },
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
    cta: { label: 'Découvrir', href: '/contact', variant: 'outline' },
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
    cta: { label: 'Découvrir', href: '/contact', variant: 'outline' },
  },
]

export default function CollaborateursIA() {
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

                {/* CTA */}
                <Link
                  to={c.cta.href}
                  className={`cai-col-cta${c.cta.variant === 'primary' ? ' cai-col-cta--primary' : ' cai-col-cta--outline'}`}
                >
                  {c.cta.label}
                  <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
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
    </>
  )
}
