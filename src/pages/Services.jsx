import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Services.css'

export default function Services() {
  useEffect(() => {
    /* ── Canvas particles ── */
    const canvasSetup = (function () {
      const cv = document.getElementById('solCanvas')
      if (!cv) return null
      const cx = cv.getContext('2d')
      let W, H, pts = []
      const N = 45, LK = 110
      function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight }
      window.addEventListener('resize', resize, { passive: true })
      resize()
      function r(a, b) { return a + Math.random() * (b - a) }
      for (let i = 0; i < N; i++) pts.push({ x: r(0, W), y: r(0, H), vx: r(-.2, .2), vy: r(-.2, .2), s: r(.8, 1.6) })
      let rafId
      function frame() {
        cx.clearRect(0, 0, W, H)
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
          cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
          cx.fillStyle = 'rgba(0,102,255,.4)'; cx.fill()
        })
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < LK) {
            cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y)
            cx.strokeStyle = `rgba(0,102,255,${.08 * (1 - d / LK)})`; cx.lineWidth = 1; cx.stroke()
          }
        }
        rafId = requestAnimationFrame(frame)
      }
      frame()
      return { stop: () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafId) } }
    })()

    /* ── Scroll reveal why-cards ── */
    const obsWhy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = Array.from(document.querySelectorAll('.sol-why-card'))
          const idx = cards.indexOf(entry.target)
          setTimeout(() => {
            entry.target.style.transition = 'opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1), box-shadow .4s, border-color .3s'
            entry.target.classList.add('visible')
          }, (idx % 3) * 90)
          obsWhy.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.sol-why-card').forEach(el => obsWhy.observe(el))

    /* ── Scroll reveal cards ── */
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(document.querySelectorAll('.sol-card')).indexOf(entry.target)
          setTimeout(() => {
            entry.target.classList.add('visible')
          }, (idx % 3) * 100)
          obs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.sol-card').forEach(el => obs.observe(el))

    /* ── Premium timeline animation ── */
    const timelineSetup = (function () {
      const body = document.querySelector('.ptl-body')
      const fill = document.getElementById('ptlFill')
      const cards = document.querySelectorAll('.ptl-card')
      if (!body || !cards.length) return null

      function updateFill() {
        const rect = body.getBoundingClientRect()
        const wh = window.innerHeight
        const progress = Math.min(1, Math.max(0, (wh - rect.top) / (rect.height + wh)))
        if (fill) fill.style.height = (progress * 100) + '%'
      }
      window.addEventListener('scroll', updateFill, { passive: true })
      updateFill()

      const obsCard = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('ptl-vis')
            obsCard.unobserve(entry.target)
          }
        })
      }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' })

      cards.forEach(function (card, i) {
        card.style.transitionDelay = (i * 0.04) + 's,' + (i * 0.04) + 's,0s,0s'
        obsCard.observe(card)
      })

      return { stop: () => window.removeEventListener('scroll', updateFill) }
    })()

    /* ── Stat counters ── */
    const statsEl = document.getElementById('ptlStats')
    let statsObs = null
    if (statsEl) {
      let done = false
      function ease(t) { return 1 - Math.pow(1 - t, 3) }
      function countUp(el, target, duration, delay) {
        setTimeout(function () {
          const start = performance.now()
          function frame(now) {
            const t = Math.min((now - start) / duration, 1)
            el.textContent = Math.round(target * ease(t))
            if (t < 1) requestAnimationFrame(frame)
          }
          requestAnimationFrame(frame)
        }, delay)
      }
      statsObs = new IntersectionObserver(function (entries) {
        if (done) return
        if (!entries[0].isIntersecting) return
        done = true
        statsEl.classList.add('ptl-vis')
        statsEl.querySelectorAll('.ptl-count').forEach(function (el, i) {
          countUp(el, parseInt(el.dataset.target, 10), 1100, i * 110)
        })
        statsObs.disconnect()
      }, { threshold: 0.4 })
      statsObs.observe(statsEl)
    }

    /* ── Section header reveal ── */
    const obs2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); obs2.unobserve(e.target) }
      })
    }, { threshold: 0.15 })
    document.querySelectorAll('.sol-section-header,.sol-cta-inner').forEach(el => {
      el.style.opacity = '0'; el.style.transform = 'translateY(18px)'
      el.style.transition = 'opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)'
      el.classList.add('sol-reveal')
      obs2.observe(el)
    })
    const styleTag = document.createElement('style')
    styleTag.textContent = '.sol-reveal.vis{opacity:1!important;transform:none!important;}'
    document.head.appendChild(styleTag)

    /* ── FAQ accordion ── */
    const faqSetup = (function () {
      const items = document.querySelectorAll('.faq-item')
      if (!items.length) return null

      const obsFaq = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('vis'); obsFaq.unobserve(e.target) }
        })
      }, { threshold: 0.1 })
      items.forEach(function (item, i) {
        item.style.setProperty('--fi', (i * 0.07) + 's')
        obsFaq.observe(item)
      })

      items.forEach(function (item) {
        const btn = item.querySelector('.faq-q')
        const body = item.querySelector('.faq-body')

        function handleClick() {
          const isOpen = item.classList.contains('open')
          items.forEach(function (it) {
            if (it !== item && it.classList.contains('open')) {
              const b = it.querySelector('.faq-body')
              b.style.height = b.scrollHeight + 'px'
              b.offsetHeight
              b.style.height = '0'
              it.classList.remove('open')
              it.querySelector('.faq-q').setAttribute('aria-expanded', 'false')
            }
          })
          if (isOpen) {
            body.style.height = body.scrollHeight + 'px'
            body.offsetHeight
            body.style.height = '0'
            item.classList.remove('open')
            btn.setAttribute('aria-expanded', 'false')
          } else {
            item.classList.add('open')
            btn.setAttribute('aria-expanded', 'true')
            body.style.height = '0'
            body.offsetHeight
            body.style.height = body.scrollHeight + 'px'
            body.addEventListener('transitionend', function () {
              if (item.classList.contains('open')) body.style.height = 'auto'
            }, { once: true })
          }
        }

        function handleKeydown(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click() }
        }

        btn.addEventListener('click', handleClick)
        btn.addEventListener('keydown', handleKeydown)
      })

      return null
    })()

    /* ── Results counter ── */
    const resultsSection = document.getElementById('resultats')
    let obsRes = null
    if (resultsSection) {
      const resCards = resultsSection.querySelectorAll('.res-card')
      const counters = resultsSection.querySelectorAll('[data-count]')

      function animCount(el, target) {
        let elapsed = 0; const dur = 1600, interval = 16
        const t = setInterval(function () {
          elapsed += interval
          const pct = Math.min(elapsed / dur, 1)
          const easeVal = 1 - Math.pow(1 - pct, 4)
          el.textContent = Math.round(easeVal * target)
          if (pct >= 1) clearInterval(t)
        }, interval)
      }

      obsRes = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            resCards.forEach(function (c) { c.classList.add('vis') })
            counters.forEach(function (el) {
              const target = parseInt(el.getAttribute('data-count'), 10)
              animCount(el, target)
            })
            obsRes.unobserve(e.target)
          }
        })
      }, { threshold: 0.15 })
      obsRes.observe(resultsSection)
    }

    /* ── Ecosystem diagram ── */
    const diagram = document.getElementById('ecoDiagram')
    let obsEco = null
    if (diagram) {
      const nodes = diagram.querySelectorAll('.eco-node')
      obsEco = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            diagram.classList.add('go')
            nodes.forEach(function (n) { n.classList.add('vis') })
            obsEco.unobserve(entry.target)
          }
        })
      }, { threshold: 0.15 })
      obsEco.observe(diagram)
    }

    return () => {
      if (canvasSetup) canvasSetup.stop()
      if (timelineSetup) timelineSetup.stop()
      obsWhy.disconnect()
      obs.disconnect()
      obs2.disconnect()
      if (statsObs) statsObs.disconnect()
      if (obsRes) obsRes.disconnect()
      if (obsEco) obsEco.disconnect()
      if (styleTag && styleTag.parentNode) styleTag.parentNode.removeChild(styleTag)
    }
  }, [])

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════════════ */}
      <section className="sol-hero">
        <canvas className="sol-canvas" id="solCanvas" aria-hidden="true"></canvas>
        <div className="sol-grid-bg" aria-hidden="true"></div>
        <div className="sol-halo sol-halo-1" aria-hidden="true"></div>
        <div className="sol-halo sol-halo-2" aria-hidden="true"></div>

        <div className="sol-hero-inner">
          <p className="sol-kicker"><span></span>Catalogue · Toutes nos offres<span></span></p>

          <h1 className="sol-h1">
            Des solutions IA qui travaillent<br />
            <em>pour votre entreprise.</em>
          </h1>

          <p className="sol-sub">
            Des collaborateurs IA, des automatisations et des applications sur mesure pour développer votre activité.
          </p>

          <div className="sol-hero-btns">
            <a
              href="#solutions"
              className="sol-btn-main"
              onClick={(e) => { e.preventDefault(); document.getElementById('solutions').scrollIntoView({ behavior: 'smooth' }) }}
            >
              Découvrir les solutions
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </a>
            <a href="/contact" className="sol-btn-ghost">Prendre contact →</a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CARDS
          ════════════════════════════════════════════════════════════ */}
      <section className="sol-section" id="solutions">
        <div className="sol-section-header">
          <p className="sol-section-label">Nos offres</p>
          <h2 className="sol-section-title">Choisissez ce dont vous avez besoin.</h2>
          <p className="sol-section-sub">Six pôles d'expertise pour couvrir tous les leviers de croissance de votre entreprise.</p>
        </div>

        <div className="sol-grid">

          {/* 1 · Collaborateurs IA */}
          <article className="sol-card sol-card-1">
            <div className="sol-card-img">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop&q=80&auto=format" alt="Collaborateurs IA" loading="lazy" decoding="async" width="600" height="400" />
              <div className="sol-card-img-overlay"></div>
              <div className="sol-card-badge">🤖</div>
            </div>
            <div className="sol-card-body">
              <h3 className="sol-card-title">Collaborateurs IA</h3>
              <p className="sol-card-desc">Des agents spécialisés qui travaillent pour vous 24h/24. Ventes, support, RH, juridique — sans embaucher, sans former.</p>
              <Link to="/collaborateurs-ia" className="sol-card-btn">
                Découvrir
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </div>
          </article>

          {/* 2 · Automatisations */}
          <article className="sol-card sol-card-2">
            <div className="sol-card-img">
              <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop&q=80&auto=format" alt="Automatisations" loading="lazy" decoding="async" width="600" height="400" />
              <div className="sol-card-img-overlay"></div>
              <div className="sol-card-badge">⚡</div>
            </div>
            <div className="sol-card-body">
              <h3 className="sol-card-title">Automatisations</h3>
              <p className="sol-card-desc">Récupérez 15 heures par semaine. Relances, devis, reporting, transferts de données — automatisés en 48h, sans code.</p>
              <Link to="/automatisations" className="sol-card-btn">
                Découvrir
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </div>
          </article>

          {/* 3 · Création de sites Web */}
          <article className="sol-card sol-card-3">
            <div className="sol-card-img">
              <img src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop&q=80&auto=format" alt="Création de sites Web" loading="lazy" decoding="async" width="600" height="400" />
              <div className="sol-card-img-overlay"></div>
              <div className="sol-card-badge">🌐</div>
            </div>
            <div className="sol-card-body">
              <h3 className="sol-card-title">Création de sites Web</h3>
              <p className="sol-card-desc">Sites vitrines, e-commerce et landing pages qui convertissent. Design premium, mobile-first, livraison rapide.</p>
              <a href="creation-site-vitrine.html" className="sol-card-btn">
                Découvrir
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </a>
            </div>
          </article>

          {/* 4 · SEO IA */}
          <article className="sol-card sol-card-4">
            <div className="sol-card-img">
              <img src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop&q=80&auto=format" alt="SEO IA" loading="lazy" decoding="async" width="600" height="400" />
              <div className="sol-card-img-overlay"></div>
              <div className="sol-card-badge">📈</div>
            </div>
            <div className="sol-card-body">
              <h3 className="sol-card-title">SEO IA</h3>
              <p className="sol-card-desc">Votre site remonte sur Google. Contenu optimisé par IA, stratégie locale, mots-clés ciblés — résultats mesurables chaque mois.</p>
              <a href="/#services" className="sol-card-btn">
                Découvrir
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </a>
            </div>
          </article>

          {/* 5 · Applications métier */}
          <article className="sol-card sol-card-5">
            <div className="sol-card-img">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80&auto=format" alt="Applications métier" loading="lazy" decoding="async" width="600" height="400" />
              <div className="sol-card-img-overlay"></div>
              <div className="sol-card-badge">🖥</div>
            </div>
            <div className="sol-card-body">
              <h3 className="sol-card-title">Applications métier</h3>
              <p className="sol-card-desc">Des outils sur mesure pour vos équipes. CRM, tableaux de bord, portails clients — adaptés à votre secteur et vos habitudes.</p>
              <a href="refonte-site-internet.html" className="sol-card-btn">
                Découvrir
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </a>
            </div>
          </article>

          {/* 6 · Support informatique */}
          <article className="sol-card sol-card-6">
            <div className="sol-card-img">
              <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop&q=80&auto=format" alt="Support informatique" loading="lazy" decoding="async" width="600" height="400" />
              <div className="sol-card-img-overlay"></div>
              <div className="sol-card-badge">🛠</div>
            </div>
            <div className="sol-card-body">
              <h3 className="sol-card-title">Support informatique</h3>
              <p className="sol-card-desc">Assistance technique réactive. Infogérance, maintenance, cybersécurité — on s'occupe de votre parc informatique à votre place.</p>
              <a href="maintenance-site-web.html" className="sol-card-btn">
                Découvrir
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </a>
            </div>
          </article>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          COMMENT ÇA FONCTIONNE
          ════════════════════════════════════════════════════════════ */}
      <section className="sol-tl" id="comment-ca-fonctionne">
        <div className="sol-tl-bg-grid" aria-hidden="true"></div>

        <div className="sol-section-header" style={{ position: 'relative', zIndex: 1 }}>
          <p className="sol-section-label">Notre méthode</p>
          <h2 className="sol-section-title">De la découverte au support.</h2>
          <p className="sol-section-sub">Sept étapes pour passer de zéro à une solution opérationnelle — sans friction, sans surprise.</p>
        </div>

        {/* Compteurs animés */}
        <div className="ptl-stats" id="ptlStats">
          <div className="ptl-stat">
            <div className="ptl-stat-n">
              <span className="ptl-count" data-target="7">0</span>
            </div>
            <div className="ptl-stat-l">Étapes structurées</div>
          </div>
          <div className="ptl-stat">
            <div className="ptl-stat-n">
              <span className="ptl-count" data-target="24">0</span><span className="ptl-stat-suf">h</span>
            </div>
            <div className="ptl-stat-l">Premier rapport</div>
          </div>
          <div className="ptl-stat">
            <div className="ptl-stat-n">
              <span className="ptl-count" data-target="100">0</span><span className="ptl-stat-suf">%</span>
            </div>
            <div className="ptl-stat-l">Accompagnement inclus</div>
          </div>
          <div className="ptl-stat">
            <div className="ptl-stat-n">
              <span className="ptl-count" data-target="4">0</span><span className="ptl-stat-suf">h</span>
            </div>
            <div className="ptl-stat-l">SLA support garanti</div>
          </div>
        </div>

        <div className="ptl-body">

          {/* axe vertical */}
          <div className="ptl-axis" aria-hidden="true">
            <div className="ptl-axis-bg"></div>
            <div className="ptl-axis-fill" id="ptlFill"></div>
          </div>

          {/* 1 · Découverte — gauche */}
          <div className="ptl-row">
            <div className="ptl-card">
              <p className="ptl-tag">Étape 01</p>
              <div className="ptl-icon"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></div>
              <h3 className="ptl-title">Découverte</h3>
              <p className="ptl-desc">On écoute vos enjeux, vos objectifs et vos contraintes. Un appel de 30 minutes suffit pour cartographier votre situation.</p>
              <span className="ptl-badge"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>30 min</span>
            </div>
            <div className="ptl-node"><div className="ptl-dot">01</div></div>
            <div className="ptl-spc"></div>
          </div>

          {/* 2 · Audit — droite */}
          <div className="ptl-row">
            <div className="ptl-spc"></div>
            <div className="ptl-node"><div className="ptl-dot">02</div></div>
            <div className="ptl-card">
              <p className="ptl-tag">Étape 02</p>
              <div className="ptl-icon"><svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><polyline points="9 12 11 14 15 10" /></svg></div>
              <h3 className="ptl-title">Audit</h3>
              <p className="ptl-desc">Analyse complète de votre activité, vos outils et vos processus. Un rapport détaillé vous est remis sous 24h, gratuitement.</p>
              <span className="ptl-badge"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>24h</span>
            </div>
          </div>

          {/* 3 · Proposition — gauche */}
          <div className="ptl-row">
            <div className="ptl-card">
              <p className="ptl-tag">Étape 03</p>
              <div className="ptl-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg></div>
              <h3 className="ptl-title">Proposition</h3>
              <p className="ptl-desc">Périmètre, délais, budget — tout est cadré avant qu'on commence. Aucune surprise en cours de mission, tout est contractualisé.</p>
              <span className="ptl-badge"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>48h</span>
            </div>
            <div className="ptl-node"><div className="ptl-dot">03</div></div>
            <div className="ptl-spc"></div>
          </div>

          {/* 4 · Développement — droite */}
          <div className="ptl-row">
            <div className="ptl-spc"></div>
            <div className="ptl-node"><div className="ptl-dot">04</div></div>
            <div className="ptl-card">
              <p className="ptl-tag">Étape 04</p>
              <div className="ptl-icon"><svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg></div>
              <h3 className="ptl-title">Développement</h3>
              <p className="ptl-desc">Construction sur mesure avec des itérations rapides et des validations régulières à chaque étape clé du projet.</p>
              <span className="ptl-badge"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>5–10 jours</span>
            </div>
          </div>

          {/* 5 · Formation — gauche */}
          <div className="ptl-row">
            <div className="ptl-card">
              <p className="ptl-tag">Étape 05</p>
              <div className="ptl-icon"><svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg></div>
              <h3 className="ptl-title">Formation</h3>
              <p className="ptl-desc">Une session dédiée pour vos équipes. Maîtrise complète de votre nouvelle solution en moins d'une heure, garantie.</p>
              <span className="ptl-badge"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>1h</span>
            </div>
            <div className="ptl-node"><div className="ptl-dot">05</div></div>
            <div className="ptl-spc"></div>
          </div>

          {/* 6 · Déploiement — droite */}
          <div className="ptl-row">
            <div className="ptl-spc"></div>
            <div className="ptl-node"><div className="ptl-dot">06</div></div>
            <div className="ptl-card">
              <p className="ptl-tag">Étape 06</p>
              <div className="ptl-icon"><svg viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg></div>
              <h3 className="ptl-title">Déploiement</h3>
              <p className="ptl-desc">Mise en production en 48h. Votre solution est live et les résultats sont mesurables dès la première semaine.</p>
              <span className="ptl-badge"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>48h</span>
            </div>
          </div>

          {/* 7 · Support — gauche */}
          <div className="ptl-row">
            <div className="ptl-card">
              <p className="ptl-tag">Étape 07</p>
              <div className="ptl-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg></div>
              <h3 className="ptl-title">Support</h3>
              <p className="ptl-desc">Monitoring continu, ajustements proactifs et intervention garantie sous 4h. On ne disparaît pas après la livraison.</p>
              <span className="ptl-badge"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>Continu</span>
            </div>
            <div className="ptl-node"><div className="ptl-dot">07</div></div>
            <div className="ptl-spc"></div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          ECOSYSTEM — ILS PEUVENT TRAVAILLER ENSEMBLE
          ════════════════════════════════════════════════════════════ */}
      <section className="sol-eco" id="ecosystem">
        <div className="sol-section-header" style={{ position: 'relative', zIndex: 1 }}>
          <p className="sol-section-label">Notre écosystème</p>
          <h2 className="sol-section-title">Ils peuvent travailler ensemble</h2>
          <p className="sol-section-sub">Chaque outil parle au suivant — un écosystème fluide, sans friction, sans rupture.</p>
        </div>

        <div className="eco-diagram" id="ecoDiagram">

          {/* n1 : Commercial IA */}
          <div className="eco-node eco-n1" style={{ '--eco-rgb': '0,102,255', '--enter-delay': '.0s' }}>
            <div className="eco-ibox">
              <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <div className="eco-ntxt">
              <span className="eco-badge">CA-TECH</span>
              <h3 className="eco-name">Commercial IA</h3>
              <p className="eco-sub">Prospecte et qualifie automatiquement</p>
            </div>
          </div>

          {/* h-conn 1 : Commercial IA → CRM */}
          <div className="eco-hconn eco-hc1" style={{ '--td': '.25s', '--dd': '1.1s' }} aria-hidden="true">
            <div className="eco-ctrack"></div>
            <div className="eco-cdot"></div>
            <span className="eco-harrow">›</span>
          </div>

          {/* n2 : CRM */}
          <div className="eco-node eco-n2" style={{ '--eco-rgb': '99,102,241', '--enter-delay': '.5s' }}>
            <div className="eco-ibox">
              <svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
            </div>
            <div className="eco-ntxt">
              <span className="eco-badge">Intégration</span>
              <h3 className="eco-name">CRM</h3>
              <p className="eco-sub">Centralise contacts et pipeline</p>
            </div>
          </div>

          {/* v-conn 1 (col droite : CRM ↓ Support IA) */}
          <div className="eco-vconn eco-vc1" style={{ '--td': '.75s', '--dd': '1.6s' }} aria-hidden="true">
            <div className="eco-ctrack"></div>
            <div className="eco-cdot"></div>
          </div>

          {/* n3 : Support IA */}
          <div className="eco-node eco-n3" style={{ '--eco-rgb': '6,182,212', '--enter-delay': '1.0s' }}>
            <div className="eco-ibox">
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </div>
            <div className="eco-ntxt">
              <span className="eco-badge">CA-TECH</span>
              <h3 className="eco-name">Support IA</h3>
              <p className="eco-sub">Répond aux clients 24h/24</p>
            </div>
          </div>

          {/* h-conn 2 (inversé : Support IA → Automatisation) */}
          <div className="eco-hconn eco-hc2 rev" style={{ '--td': '1.2s', '--dd': '2.0s' }} aria-hidden="true">
            <div className="eco-ctrack"></div>
            <div className="eco-cdot"></div>
            <span className="eco-harrow">‹</span>
          </div>

          {/* n4 : Automatisation */}
          <div className="eco-node eco-n4" style={{ '--eco-rgb': '139,92,246', '--enter-delay': '1.45s' }}>
            <div className="eco-ibox">
              <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <div className="eco-ntxt">
              <span className="eco-badge">N8N / Zapier</span>
              <h3 className="eco-name">Automatisation</h3>
              <p className="eco-sub">Orchestre les flux entre outils</p>
            </div>
          </div>

          {/* v-conn 2 (col gauche : Automatisation ↓ Google Workspace) */}
          <div className="eco-vconn eco-vc2" style={{ '--td': '1.65s', '--dd': '2.45s' }} aria-hidden="true">
            <div className="eco-ctrack"></div>
            <div className="eco-cdot"></div>
          </div>

          {/* n5 : Google Workspace */}
          <div className="eco-node eco-n5" style={{ '--eco-rgb': '16,185,129', '--enter-delay': '1.9s' }}>
            <div className="eco-ibox">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
            </div>
            <div className="eco-ntxt">
              <span className="eco-badge">Google</span>
              <h3 className="eco-name">Google Workspace</h3>
              <p className="eco-sub">Emails, Drive, Calendar synchro</p>
            </div>
          </div>

          {/* h-conn 3 : Google Workspace → Client */}
          <div className="eco-hconn eco-hc3" style={{ '--td': '2.1s', '--dd': '2.9s' }} aria-hidden="true">
            <div className="eco-ctrack"></div>
            <div className="eco-cdot"></div>
            <span className="eco-harrow">›</span>
          </div>

          {/* n6 : Client */}
          <div className="eco-node eco-n6" style={{ '--eco-rgb': '251,191,36', '--enter-delay': '2.35s' }}>
            <div className="eco-ibox">
              <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <div className="eco-ntxt">
              <span className="eco-badge">Résultat</span>
              <h3 className="eco-name">Client</h3>
              <p className="eco-sub">Expérience fluide, satisfaction maximale</p>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          RESULTS — EXEMPLES DE RÉSULTATS
          ════════════════════════════════════════════════════════════ */}
      <section className="sol-results" id="resultats">
        <div className="sol-section-header" style={{ position: 'relative', zIndex: 1 }}>
          <p className="sol-section-label">Preuves concrètes</p>
          <h2 className="sol-section-title">Exemples de résultats</h2>
          <p className="sol-section-sub">Des transformations mesurables, vécues par nos clients.</p>
        </div>

        <div className="res-grid">

          {/* Card 1 : Devis */}
          <div className="res-card" style={{ '--rd': '.0s' }}>
            <div className="res-card-top">
              <span className="res-ctx">Création de devis</span>
              <div className="res-ibox">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              </div>
            </div>
            <div className="res-panels">
              <div className="res-bfr">
                <span className="res-tag">Avant</span>
                <span className="res-big">5</span>
                <span className="res-unit">heures de devis</span>
              </div>
              <div className="res-div"><span className="res-arr">↓</span></div>
              <div className="res-aft">
                <span className="res-tag">Après</span>
                <span className="res-big" data-count="15">0</span>
                <span className="res-unit">minutes</span>
              </div>
            </div>
            <div className="res-foot">
              <span className="res-badge">−95%</span>
              <span className="res-fdesc">de temps économisé</span>
            </div>
          </div>

          {/* Card 2 : Suivi */}
          <div className="res-card" style={{ '--rd': '.15s' }}>
            <div className="res-card-top">
              <span className="res-ctx">Suivi commercial</span>
              <div className="res-ibox">
                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.06 1.22 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
              </div>
            </div>
            <div className="res-panels">
              <div className="res-bfr">
                <span className="res-tag">Avant</span>
                <span className="res-big">0</span>
                <span className="res-unit">aucun suivi</span>
              </div>
              <div className="res-div"><span className="res-arr">↓</span></div>
              <div className="res-aft">
                <span className="res-tag">Après</span>
                <span className="res-big res-txt">Auto</span>
                <span className="res-unit">relances automatiques</span>
              </div>
            </div>
            <div className="res-foot">
              <span className="res-badge">24/7</span>
              <span className="res-fdesc">actif sans intervention</span>
            </div>
          </div>

          {/* Card 3 : Emails */}
          <div className="res-card" style={{ '--rd': '.3s' }}>
            <div className="res-card-top">
              <span className="res-ctx">Gestion des emails</span>
              <div className="res-ibox">
                <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg>
              </div>
            </div>
            <div className="res-panels">
              <div className="res-bfr">
                <span className="res-tag">Avant</span>
                <span className="res-big">2h</span>
                <span className="res-unit">emails manuels</span>
              </div>
              <div className="res-div"><span className="res-arr">↓</span></div>
              <div className="res-aft">
                <span className="res-tag">Après</span>
                <span className="res-big res-txt">0h</span>
                <span className="res-unit">automatisation complète</span>
              </div>
            </div>
            <div className="res-foot">
              <span className="res-badge">+3×</span>
              <span className="res-fdesc">de réactivité client</span>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          WHY CA-TECH
          ════════════════════════════════════════════════════════════ */}
      <section className="sol-why">
        <div className="sol-section-header" style={{ position: 'relative', zIndex: 1 }}>
          <p className="sol-section-label">Nos engagements</p>
          <h2 className="sol-section-title">Pourquoi choisir CA-TECH ?</h2>
          <p className="sol-section-sub">Des résultats concrets, une équipe disponible, des solutions qui s'adaptent à vous.</p>
        </div>

        <div className="sol-why-grid">

          {/* 1 · Gain de temps */}
          <div className="sol-why-card" style={{ '--why-color': 'rgba(0,102,255,.18)', '--why-glow': 'rgba(0,102,255,.2)', '--why-stroke': '#6ab4ff' }}>
            <div className="sol-why-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <h3 className="sol-why-title">Gain de temps</h3>
            <p className="sol-why-desc">Vos tâches répétitives disparaissent. Vous récupérez en moyenne 15 heures par semaine pour vous concentrer sur ce qui compte.</p>
          </div>

          {/* 2 · Réduction des coûts */}
          <div className="sol-why-card" style={{ '--why-color': 'rgba(16,185,129,.18)', '--why-glow': 'rgba(16,185,129,.2)', '--why-stroke': '#6ee7b7' }}>
            <div className="sol-why-icon">
              <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
            </div>
            <h3 className="sol-why-title">Réduction des coûts</h3>
            <p className="sol-why-desc">Un collaborateur IA coûte moins qu'un salarié à temps partiel. Le ROI est visible dès le premier mois d'utilisation.</p>
          </div>

          {/* 3 · Disponible 24h/24 */}
          <div className="sol-why-card" style={{ '--why-color': 'rgba(124,58,237,.18)', '--why-glow': 'rgba(124,58,237,.2)', '--why-stroke': '#c4b5fd' }}>
            <div className="sol-why-icon">
              <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            </div>
            <h3 className="sol-why-title">Disponible 24h/24</h3>
            <p className="sol-why-desc">Vos agents IA répondent à vos clients, traitent vos demandes et génèrent des rapports même quand vous dormez.</p>
          </div>

          {/* 4 · Installation rapide */}
          <div className="sol-why-card" style={{ '--why-color': 'rgba(245,158,11,.18)', '--why-glow': 'rgba(245,158,11,.2)', '--why-stroke': '#fde68a' }}>
            <div className="sol-why-icon">
              <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <h3 className="sol-why-title">Installation rapide</h3>
            <p className="sol-why-desc">Opérationnel en 48h. Pas de formation, pas de code, pas de mois d'intégration. On configure tout — vous validez et c'est parti.</p>
          </div>

          {/* 5 · Support français */}
          <div className="sol-why-card" style={{ '--why-color': 'rgba(239,68,68,.18)', '--why-glow': 'rgba(239,68,68,.2)', '--why-stroke': '#fca5a5' }}>
            <div className="sol-why-icon">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <h3 className="sol-why-title">Support français</h3>
            <p className="sol-why-desc">Une équipe basée en France, joignable par téléphone et email. En cas de problème, on intervient sous 4h — pas un chatbot.</p>
          </div>

          {/* 6 · Solutions personnalisées */}
          <div className="sol-why-card" style={{ '--why-color': 'rgba(6,182,212,.18)', '--why-glow': 'rgba(6,182,212,.2)', '--why-stroke': '#67e8f9' }}>
            <div className="sol-why-icon">
              <svg viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
            </div>
            <h3 className="sol-why-title">Solutions personnalisées</h3>
            <p className="sol-why-desc">Chaque solution est adaptée à votre secteur, vos outils et vos habitudes. Rien de générique — tout est pensé pour vous.</p>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════════════════════ */}
      <section className="sol-faq" id="faq">
        <div className="sol-section-header" style={{ position: 'relative', zIndex: 1 }}>
          <p className="sol-section-label">Questions fréquentes</p>
          <h2 className="sol-section-title">Vous avez des questions ?</h2>
          <p className="sol-section-sub">Tout ce qu'il faut savoir avant de démarrer.</p>
        </div>

        <ul className="faq-list" role="list">

          <li className="faq-item">
            <div className="faq-q" role="button" aria-expanded="false" tabIndex="0">
              <span className="faq-qtxt">Combien coûte un collaborateur IA ?</span>
              <span className="faq-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg></span>
            </div>
            <div className="faq-body" role="region">
              <div className="faq-inner">
                <p className="sol-faq-a">À partir de <strong>290 €/mois</strong> selon le rôle et le niveau d'intégration. Un audit gratuit vous permet de savoir exactement ce dont vous avez besoin avant tout engagement.</p>
              </div>
            </div>
          </li>

          <li className="faq-item">
            <div className="faq-q" role="button" aria-expanded="false" tabIndex="0">
              <span className="faq-qtxt">Combien de temps pour l'installation ?</span>
              <span className="faq-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg></span>
            </div>
            <div className="faq-body" role="region">
              <div className="faq-inner">
                <p className="sol-faq-a">Entre <strong>48h et 5 jours</strong> selon la complexité de votre environnement. Dans la majorité des cas, votre collaborateur IA est opérationnel en <strong>72h</strong>.</p>
              </div>
            </div>
          </li>

          <li className="faq-item">
            <div className="faq-q" role="button" aria-expanded="false" tabIndex="0">
              <span className="faq-qtxt">Puis-je garder mes outils actuels ?</span>
              <span className="faq-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg></span>
            </div>
            <div className="faq-body" role="region">
              <div className="faq-inner">
                <p className="sol-faq-a">Oui, <strong>aucune migration requise</strong>. On se connecte directement à vos outils existants — CRM, messagerie, agenda, comptabilité. Votre équipe ne change rien à ses habitudes.</p>
              </div>
            </div>
          </li>

          <li className="faq-item">
            <div className="faq-q" role="button" aria-expanded="false" tabIndex="0">
              <span className="faq-qtxt">Travaillez-vous avec Microsoft 365 ?</span>
              <span className="faq-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg></span>
            </div>
            <div className="faq-body" role="region">
              <div className="faq-inner">
                <p className="sol-faq-a">Oui. <strong>Outlook, Teams, SharePoint, OneDrive</strong> — tout l'écosystème Microsoft 365 est intégrable. Nos collaborateurs IA fonctionnent nativement avec vos licences existantes.</p>
              </div>
            </div>
          </li>

          <li className="faq-item">
            <div className="faq-q" role="button" aria-expanded="false" tabIndex="0">
              <span className="faq-qtxt">Travaillez-vous avec Google Workspace ?</span>
              <span className="faq-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg></span>
            </div>
            <div className="faq-body" role="region">
              <div className="faq-inner">
                <p className="sol-faq-a">Oui. <strong>Gmail, Drive, Calendar, Sheets, Meet</strong> — tous synchronisés avec votre collaborateur IA. La configuration prend moins d'une heure.</p>
              </div>
            </div>
          </li>

          <li className="faq-item">
            <div className="faq-q" role="button" aria-expanded="false" tabIndex="0">
              <span className="faq-qtxt">Puis-je connecter WhatsApp ?</span>
              <span className="faq-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg></span>
            </div>
            <div className="faq-body" role="region">
              <div className="faq-inner">
                <p className="sol-faq-a">Oui, via l'<strong>API WhatsApp Business</strong>. Relances, confirmations de rendez-vous, support client automatisé — votre collaborateur IA répond directement sur WhatsApp, 24h/24.</p>
              </div>
            </div>
          </li>

        </ul>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA
          ════════════════════════════════════════════════════════════ */}
      <section className="sol-cta">
        <div className="sol-cta-inner">
          <p className="sol-cta-label">Passez à l'action</p>
          <h2 className="sol-cta-title">Vous ne savez pas par <strong>où commencer ?</strong></h2>
          <p className="sol-cta-sub">On analyse votre situation gratuitement et on vous recommande la solution la plus rentable pour vous — en 30 minutes.</p>
          <div className="sol-cta-btns">
            <Link to="/contact" className="sol-btn-main">Demander un audit gratuit →</Link>
            <a href="/tarifs" className="sol-btn-ghost">Voir les tarifs</a>
          </div>
        </div>
      </section>
    </>
  )
}
