import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './CollaborateursIA.css'

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

    /* ── Scroll reveal (IntersectionObserver) ── */
    const revealEls = document.querySelectorAll('.cai-reveal')
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.closest('.cai-bento')
            ? Array.from(revealEls).indexOf(entry.target) * 80
            : 0
          setTimeout(() => entry.target.classList.add('visible'), delay)
          revealObs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    revealEls.forEach(el => revealObs.observe(el))

    /* ── 3D tilt on cards ── */
    const cards = document.querySelectorAll('.cai-card')
    const cardRafs = new WeakMap()

    cards.forEach(card => {
      function onCardMouseMove(e) {
        if (cardRafs.get(card)) cancelAnimationFrame(cardRafs.get(card))
        cardRafs.set(card, requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect()
          const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)
          const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)
          card.style.transform = `perspective(1000px) rotateX(${-dy*5}deg) rotateY(${dx*5}deg) translateY(-6px)`
        }))
      }
      function onCardMouseLeave() {
        if (cardRafs.get(card)) cancelAnimationFrame(cardRafs.get(card))
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)'
      }
      function onCardClick() {
        const href = card.getAttribute('data-href')
        if (href) window.location.href = href
      }
      function onCardKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          window.location.href = card.getAttribute('data-href') || '/contact'
        }
      }
      card.addEventListener('mousemove', onCardMouseMove)
      card.addEventListener('mouseleave', onCardMouseLeave)
      card.addEventListener('click', onCardClick)
      card.addEventListener('keydown', onCardKeyDown)
    })

    return () => {
      if (animFrameCanvas) cancelAnimationFrame(animFrameCanvas)
      if (haloRaf) cancelAnimationFrame(haloRaf)
      if (h1) window.removeEventListener('mousemove', onMouseMove)
      revealObs.disconnect()
    }
  }, [])

  return (
    <>
      {/* ══════════════════════════════════════════════════════════ */}
      {/* HERO                                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="cai-hero">

        <canvas className="cai-canvas" id="caiCanvas" aria-hidden="true"></canvas>
        <div className="cai-grid" aria-hidden="true"></div>
        <div className="cai-halo cai-halo-1" id="halo1" aria-hidden="true"></div>
        <div className="cai-halo cai-halo-2" id="halo2" aria-hidden="true"></div>
        <div className="cai-halo cai-halo-3" id="halo3" aria-hidden="true"></div>

        <div className="cai-hero-inner">

          {/* Left: copy (55%) */}
          <div className="cai-hero-left">
            <p className="cai-kicker cai-anim-0">
              <span></span>Vos nouvelles recrues · Toujours disponibles<span></span>
            </p>

            <h1 className="cai-anim-1">
              Arrêtez de faire<br />
              <em>ce que l'IA peut faire.</em>
            </h1>

            <p className="cai-hero-sub cai-anim-2">
              Vos relances, vos réponses, vos contrats, vos factures. Vos agents s'en chargent. Vous, vous vous concentrez sur ce qui fait vraiment avancer votre entreprise.
              grâce à nos collaborateurs IA spécialisés.
            </p>

            <div className="cai-hero-btns cai-anim-3">
              <a
                href="#collaborateurs"
                className="btn-primary"
                onClick={(e) => { e.preventDefault(); document.getElementById('collaborateurs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              >
                Découvrir nos collaborateurs →
              </a>
              <Link to="/contact" className="btn-outline">Demander une démonstration</Link>
            </div>
          </div>

          {/* Right: photo premium + 3 offset metric tiles */}
          <div className="cai-hero-right" aria-hidden="true">
            <div className="cai-hero-photo-wrap">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=620&h=560&fit=crop&q=85&auto=format"
                alt="Équipe CA-TECH en réunion stratégique"
                loading="eager"
                decoding="async"
                width="620"
                height="560"
              />
              <div className="cai-hero-photo-overlay"></div>
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

      {/* ══════════════════════════════════════════════════════════ */}
      {/* NOS COLLABORATEURS IA — BENTO                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="cai-section" id="collaborateurs">
        <div className="sec-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=900&fit=crop&q=60&auto=format')", opacity: .12 }} aria-hidden="true"></div>
        <div className="cai-section-header cai-reveal">
          <p className="cai-section-label">Nos Collaborateurs IA</p>
          <h2 className="cai-section-title">Ils travaillent.<br /><em>Vous décidez.</em></h2>
          <p className="cai-section-desc">
            Chaque agent est spécialisé sur son domaine et opérationnel en 48h.
            Vous reprenez du temps. Vos résultats progressent.
          </p>
        </div>

        <div className="cai-bento">

          {/* Commercial IA — LARGE */}
          <article className="cai-card b-lg cai-reveal" data-href="/contact" tabIndex="0" role="button" aria-label="Découvrir le Collaborateur Commercial IA">
            <div className="cai-thumb grad-commercial">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&q=80&auto=format" alt="Commercial IA" loading="lazy" decoding="async" width="300" height="300" />
            </div>
            <div className="cai-card-body">
              <span className="cai-card-tag">Actif</span>
              <h3 className="cai-card-name">Commercial IA</h3>
              <p className="cai-card-desc">Vous recevez des leads qualifiés chaque matin. Sans décrocher. Sans relancer à la main. Sans rater une opportunité.</p>
              <span className="cai-card-arrow">
                Découvrir
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
              </span>
            </div>
          </article>

          {/* Support IA — LARGE */}
          <article className="cai-card b-lg cai-reveal" data-href="/contact" tabIndex="0" role="button" aria-label="Découvrir le Collaborateur Support IA">
            <div className="cai-thumb grad-support">
              <img src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=300&h=300&fit=crop&q=80&auto=format" alt="Support IA" loading="lazy" decoding="async" width="300" height="300" />
            </div>
            <div className="cai-card-body">
              <span className="cai-card-tag">Actif</span>
              <h3 className="cai-card-name">Support IA</h3>
              <p className="cai-card-desc">Vos clients ont toujours une réponse. Même à 23h, même le dimanche. Vous, vous dormez. Eux, ils sont satisfaits.</p>
              <span className="cai-card-arrow">
                Découvrir
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
              </span>
            </div>
          </article>

          {/* RH IA — SMALL */}
          <article className="cai-card b-sm cai-reveal" data-href="/contact" tabIndex="0" role="button" aria-label="Découvrir le Collaborateur RH IA">
            <div className="cai-thumb grad-rh">
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&q=80&auto=format" alt="RH IA" loading="lazy" decoding="async" width="200" height="200" />
            </div>
            <div className="cai-card-body">
              <span className="cai-card-tag">Actif</span>
              <h3 className="cai-card-name">RH IA</h3>
              <p className="cai-card-desc">Recrutez les bons profils plus vite. L'onboarding se fait sans vous. Vos équipes avancent, vous ne gérez plus les détails.</p>
              <span className="cai-card-arrow">
                Découvrir
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
              </span>
            </div>
          </article>

          {/* Juridique IA — SMALL */}
          <article className="cai-card b-sm cai-reveal" data-href="/contact" tabIndex="0" role="button" aria-label="Découvrir le Collaborateur Juridique IA">
            <div className="cai-thumb grad-juridique">
              <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=200&fit=crop&q=80&auto=format" alt="Juridique IA" loading="lazy" decoding="async" width="200" height="200" />
            </div>
            <div className="cai-card-body">
              <span className="cai-card-tag">Actif</span>
              <h3 className="cai-card-name">Juridique IA</h3>
              <p className="cai-card-desc">Signez en confiance. Vos contrats sont rédigés, vos risques analysés. Sans attendre un avocat, sans délai, sans erreur.</p>
              <span className="cai-card-arrow">
                Découvrir
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
              </span>
            </div>
          </article>

          {/* SEO IA — SMALL */}
          <article className="cai-card b-sm cai-reveal" data-href="/contact" tabIndex="0" role="button" aria-label="Découvrir le Collaborateur SEO IA">
            <div className="cai-thumb grad-seo">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop&q=80&auto=format" alt="SEO IA" loading="lazy" decoding="async" width="200" height="200" />
            </div>
            <div className="cai-card-body">
              <span className="cai-card-tag">Actif</span>
              <h3 className="cai-card-name">SEO IA</h3>
              <p className="cai-card-desc">Vos clients vous trouvent sur Google avant vos concurrents. Sans y passer vos nuits. Sans expertise SEO de votre côté.</p>
              <span className="cai-card-arrow">
                Découvrir
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
              </span>
            </div>
          </article>

          {/* Comptable IA — SMALL */}
          <article className="cai-card b-sm cai-reveal" id="comptable" data-href="/contact" tabIndex="0" role="button" aria-label="Découvrir le Collaborateur Comptable IA">
            <div className="cai-thumb grad-comptable">
              <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop&q=80&auto=format" alt="Comptable IA" loading="lazy" decoding="async" width="200" height="200" />
            </div>
            <div className="cai-card-body">
              <span className="cai-card-tag">Actif</span>
              <h3 className="cai-card-name">Comptable IA</h3>
              <p className="cai-card-desc">Vos fins de mois ne sont plus chaotiques. Factures, rapprochements, déclarations — gérés en temps réel, sans erreur.</p>
              <span className="cai-card-arrow">
                Découvrir
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
              </span>
            </div>
          </article>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CTA FINAL                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="cai-cta">
        <div className="cai-cta-inner cai-reveal">
          <p className="cai-cta-kicker">Passez à l'action</p>
          <h2>Arrêtez de faire <strong>ce que l'IA peut faire à votre place.</strong></h2>
          <p>Choisissez vos agents. Notre équipe les déploie en 48h. Vous récupérez du temps dès la première semaine — et vous le réinvestissez dans ce qui compte.</p>
          <div className="cai-cta-btns">
            <Link to="/contact" className="btn-cta-white">Demander une démonstration →</Link>
            <a
              href="#collaborateurs"
              className="btn-cta-outline"
              onClick={(e) => { e.preventDefault(); document.getElementById('collaborateurs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
            >
              Revoir les collaborateurs
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
