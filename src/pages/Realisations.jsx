import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Realisations.css'

export default function Realisations() {
  useEffect(() => {
    /* ── Particles ── */
    (function () {
      var cv = document.getElementById('ccCanvas')
      if (!cv) return
      var cx = cv.getContext('2d'), W, H, pts = [], N = 38, LK = 95
      function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight }
      window.addEventListener('resize', resize, { passive: true }); resize()
      function r(a, b) { return a + Math.random() * (b - a) }
      for (var i = 0; i < N; i++) pts.push({ x: r(0, W), y: r(0, H), vx: r(-.14, .14), vy: r(-.14, .14), s: r(.6, 1.4) })
      var rafId
      ;(function frame() {
        cx.clearRect(0, 0, W, H)
        pts.forEach(function (p) {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
          cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
          cx.fillStyle = 'rgba(0,102,255,.32)'; cx.fill()
        })
        for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
          var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy)
          if (d < LK) { cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y); cx.strokeStyle = 'rgba(0,102,255,' + (0.06 * (1 - d / LK)) + ')'; cx.lineWidth = 1; cx.stroke() }
        }
        rafId = requestAnimationFrame(frame)
      })()
      cv._cancelParticles = function () { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize) }
    })()

    /* ── Count-up ── */
    ;(function () {
      function ease(t) { return 1 - Math.pow(1 - t, 3) }
      function countUp(el, target, dur, delay) {
        setTimeout(function () {
          var start = performance.now();
          (function frame(now) {
            var t = Math.min((now - start) / dur, 1)
            el.textContent = Math.round(target * ease(t))
            if (t < 1) requestAnimationFrame(frame)
          })(performance.now())
        }, delay)
      }
      var seen = new WeakSet()
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || seen.has(e.target)) return
          seen.add(e.target)
          e.target.querySelectorAll('.cc-cnt').forEach(function (el, i) {
            countUp(el, parseInt(el.dataset.target, 10), 1200, i * 110)
          })
          obs.unobserve(e.target)
        })
      }, { threshold: 0.3 })
      document.querySelectorAll('#ccSbar,.cc-featured,.cc-card').forEach(function (el) { obs.observe(el) })
    })()

    /* ── Scroll reveal ── */
    ;(function () {
      var obsR = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('cc-vis'); obsR.unobserve(e.target) }
        })
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' })
      document.querySelectorAll('.cc-featured,.cc-card,.cc-sbar,.cc-cta-inner').forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.06) + 's,' + (i * 0.06) + 's,0s,0s'
        obsR.observe(el)
      })
    })()

    /* ── Filters ── */
    ;(function () {
      var filters = document.querySelectorAll('.cc-filter')
      var items = document.querySelectorAll('.cc-item')
      filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filters.forEach(function (b) { b.classList.remove('active') })
          btn.classList.add('active')
          var f = btn.dataset.filter
          items.forEach(function (item) {
            if (f === 'all' || item.dataset.sector === f) {
              item.style.display = ''
              setTimeout(function () { item.style.opacity = '1'; item.style.transform = 'translateY(0)' }, 20)
            } else {
              item.style.opacity = '0'; item.style.transform = 'translateY(8px)'
              setTimeout(function () { item.style.display = 'none' }, 320)
            }
          })
        })
      })
    })()

    return () => {
      var cv = document.getElementById('ccCanvas')
      if (cv && cv._cancelParticles) cv._cancelParticles()
    }
  }, [])

  return (
    <>
      {/* ════════════ HERO ════════════ */}
      <section className="cc-hero">
        <canvas className="cc-canvas" id="ccCanvas" aria-hidden="true"></canvas>
        <div className="cc-grid-bg" aria-hidden="true"></div>
        <div className="cc-halo cc-halo-1" aria-hidden="true"></div>
        <div className="cc-halo cc-halo-2" aria-hidden="true"></div>

        <div className="cc-hero-inner">
          <p className="cc-eyebrow"><span></span>Études de cas · Résultats réels<span></span></p>
          <h1 className="cc-h1">Ils ont transformé<br />leur activité <em>avec nous</em></h1>
          <p className="cc-sub">Des résultats concrets. Des témoignages authentiques. Des transformations mesurables — pas des promesses.</p>

          <div className="cc-hband">
            <div className="cc-hstat">
              <div className="cc-hstat-n"><em>200</em>+</div>
              <div className="cc-hstat-l">Projets livrés</div>
            </div>
            <div className="cc-hstat">
              <div className="cc-hstat-n"><em>4.9</em>★</div>
              <div className="cc-hstat-l">Satisfaction client</div>
            </div>
            <div className="cc-hstat">
              <div className="cc-hstat-n">−<em>60</em>%</div>
              <div className="cc-hstat-l">Temps moyen économisé</div>
            </div>
            <div className="cc-hstat">
              <div className="cc-hstat-n">+<em>250</em>%</div>
              <div className="cc-hstat-l">ROI moyen constaté</div>
            </div>
          </div>

          <div className="cc-filters" id="ccFilters">
            <button className="cc-filter active" data-filter="all">Tous les secteurs</button>
            <button className="cc-filter" data-filter="ecommerce">E-commerce</button>
            <button className="cc-filter" data-filter="sante">Santé</button>
            <button className="cc-filter" data-filter="immobilier">Immobilier</button>
            <button className="cc-filter" data-filter="conseil">Conseil</button>
            <button className="cc-filter" data-filter="restauration">Restauration</button>
          </div>
        </div>
      </section>

      {/* ════════════ MAIN ════════════ */}
      <section className="cc-section">
        <div className="cc-wrap">

          {/* Stats bar */}
          <div className="cc-sbar" id="ccSbar">
            <div className="cc-sblock">
              <div className="cc-sblock-n"><em className="cc-cnt" data-target="5">0</em> études</div>
              <div className="cc-sblock-l">Cas clients documentés</div>
            </div>
            <div className="cc-sblock">
              <div className="cc-sblock-n">+<em className="cc-cnt" data-target="280">0</em>%</div>
              <div className="cc-sblock-l">Croissance CA moyenne</div>
            </div>
            <div className="cc-sblock">
              <div className="cc-sblock-n"><em className="cc-cnt" data-target="61">0</em>h</div>
              <div className="cc-sblock-l">Économisées / sem. cumulé</div>
            </div>
            <div className="cc-sblock">
              <div className="cc-sblock-n"><em className="cc-cnt" data-target="100">0</em>%</div>
              <div className="cc-sblock-l">Clients satisfaits</div>
            </div>
          </div>

          {/* ── FEATURED: E-commerce ── */}
          <article className="cc-featured cc-item" data-sector="ecommerce">
            <div className="cc-feat-body">
              <div style={{ display: 'flex', gap: '.7rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="cc-badge" style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.2)', color: '#a78bfa' }}>
                  <span className="cc-badge-dot" style={{ background: '#7c3aed' }}></span>E-commerce
                </div>
                <div className="cc-timepill">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  12h / semaine économisées
                </div>
              </div>

              <div>
                <h2 className="cc-feat-title">De 0 à <strong>+280% de CA</strong><br />en 16 semaines</h2>
                <p className="cc-feat-company">Boutique de mode &amp; accessoires · Région parisienne</p>
              </div>

              <div className="cc-ps">
                <div className="cc-prob">
                  <span className="cc-ps-label">Problème</span>
                  <p>Aucune présence en ligne, 100% des ventes en boutique physique, forte saisonnalité, perte de clients à chaque fermeture.</p>
                </div>
                <div className="cc-sol">
                  <span className="cc-ps-label">Solution</span>
                  <p>Site e-commerce Stripe + SEO local + automatisation commandes &amp; stocks + Google Shopping.</p>
                </div>
              </div>

              <div className="cc-kpis">
                <div className="cc-kpi">
                  <div className="cc-kpi-n">+<span className="cc-cnt" data-target="280">0</span>%</div>
                  <div className="cc-kpi-l">Chiffre d'affaires</div>
                </div>
                <div className="cc-kpi">
                  <div className="cc-kpi-n"><span className="cc-cnt" data-target="12">0</span>h</div>
                  <div className="cc-kpi-l">Économisées / sem.</div>
                </div>
                <div className="cc-kpi">
                  <div className="cc-kpi-n"><span className="cc-cnt" data-target="4">0</span> sem.</div>
                  <div className="cc-kpi-l">Délai de lancement</div>
                </div>
              </div>

              <div className="cc-quote">
                <p className="cc-quote-txt">"On pensait que le digital était compliqué et cher. CA-TECH nous a montré le contraire. Aujourd'hui notre boutique en ligne génère plus que la boutique physique — et on dort tranquilles."</p>
                <p className="cc-quote-author">Camille D. — Fondatrice</p>
              </div>
            </div>

            {/* Screen mockup */}
            <div className="cc-feat-screen">
              <div className="cc-screen-wrap">
                <div className="cc-bbar">
                  <div className="cc-dots"><span className="cc-dot cc-dot-r"></span><span className="cc-dot cc-dot-y"></span><span className="cc-dot cc-dot-g"></span></div>
                  <div className="cc-url">boutique-camille.fr</div>
                </div>
                <div className="cc-sbody cc-s-ecom">
                  <div className="cc-ui-egrid">
                    <div className="cc-ui-ecard"><div className="cc-ui-ecard-img"></div><div className="cc-ui-ecard-b"><div className="cc-ui-el"></div><div className="cc-ui-el" style={{ width: '60%' }}></div><div className="cc-ui-ep"></div></div></div>
                    <div className="cc-ui-ecard"><div className="cc-ui-ecard-img" style={{ background: 'rgba(124,58,237,.12)' }}></div><div className="cc-ui-ecard-b"><div className="cc-ui-el"></div><div className="cc-ui-el" style={{ width: '60%' }}></div><div className="cc-ui-ep"></div></div></div>
                    <div className="cc-ui-ecard"><div className="cc-ui-ecard-img" style={{ background: 'rgba(37,99,235,.1)' }}></div><div className="cc-ui-ecard-b"><div className="cc-ui-el"></div><div className="cc-ui-el" style={{ width: '60%' }}></div><div className="cc-ui-ep"></div></div></div>
                    <div className="cc-ui-ecard"><div className="cc-ui-ecard-img" style={{ background: 'rgba(124,58,237,.08)' }}></div><div className="cc-ui-ecard-b"><div className="cc-ui-el"></div><div className="cc-ui-el" style={{ width: '60%' }}></div><div className="cc-ui-ep"></div></div></div>
                    <div className="cc-ui-ecard"><div className="cc-ui-ecard-img"></div><div className="cc-ui-ecard-b"><div className="cc-ui-el"></div><div className="cc-ui-el" style={{ width: '60%' }}></div><div className="cc-ui-ep"></div></div></div>
                    <div className="cc-ui-ecard"><div className="cc-ui-ecard-img" style={{ background: 'rgba(37,99,235,.08)' }}></div><div className="cc-ui-ecard-b"><div className="cc-ui-el"></div><div className="cc-ui-el" style={{ width: '60%' }}></div><div className="cc-ui-ep"></div></div></div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* ── GRID 4 CARDS ── */}
          <div className="cc-grid" id="ccGrid">

            {/* Santé */}
            <article className="cc-card cc-item" data-sector="sante">
              <div className="cc-card-screen">
                <div className="cc-bbar" style={{ padding: '8px 12px' }}>
                  <div className="cc-dots"><span className="cc-dot cc-dot-r"></span><span className="cc-dot cc-dot-y"></span><span className="cc-dot cc-dot-g"></span></div>
                  <div className="cc-url">cabinet-laurent.fr/rdv</div>
                </div>
                <div className="cc-sbody cc-s-sante">
                  <div className="cc-ui-cal">
                    <div className="cc-ui-cal-h"><div className="cc-ui-cal-ht"></div><div className="cc-ui-cal-hn"><div className="cc-ui-cal-nb"></div><div className="cc-ui-cal-nb"></div></div></div>
                    <div className="cc-ui-cal-g">
                      <div className="cc-ui-cc"></div><div className="cc-ui-cc bk"></div><div className="cc-ui-cc"></div><div className="cc-ui-cc td"></div><div className="cc-ui-cc bk"></div><div className="cc-ui-cc op"></div><div className="cc-ui-cc"></div>
                      <div className="cc-ui-cc bk"></div><div className="cc-ui-cc"></div><div className="cc-ui-cc op"></div><div className="cc-ui-cc bk"></div><div className="cc-ui-cc"></div><div className="cc-ui-cc bk"></div><div className="cc-ui-cc op"></div>
                      <div className="cc-ui-cc"></div><div className="cc-ui-cc bk"></div><div className="cc-ui-cc bk"></div><div className="cc-ui-cc"></div><div className="cc-ui-cc op"></div><div className="cc-ui-cc bk"></div><div className="cc-ui-cc"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="cc-card-body">
                <div className="cc-badge" style={{ background: 'rgba(8,145,178,.1)', border: '1px solid rgba(8,145,178,.2)', color: '#22d3ee' }}>
                  <span className="cc-badge-dot" style={{ background: '#0891b2' }}></span>Santé
                </div>
                <div className="cc-card-title">−75% d'appels entrants,<br />agenda complet en permanence</div>
                <div className="cc-card-company">Cabinet dentaire · Paris 15e</div>
                <div className="cc-card-div"></div>
                <div className="cc-ps" style={{ gap: '.6rem', marginBottom: '.9rem' }}>
                  <div className="cc-prob"><span className="cc-ps-label">Problème</span><p>Agenda 100% tél., secrétaire surchargée, 30% de no-shows.</p></div>
                  <div className="cc-sol"><span className="cc-ps-label">Solution</span><p>RDV en ligne + rappels SMS auto + fiche patient digitale.</p></div>
                </div>
                <div className="cc-kpis" style={{ marginBottom: '.9rem' }}>
                  <div className="cc-kpi"><div className="cc-kpi-n">−<span className="cc-cnt" data-target="75">0</span>%</div><div className="cc-kpi-l">Appels entrants</div></div>
                  <div className="cc-kpi"><div className="cc-kpi-n">−<span className="cc-cnt" data-target="90">0</span>%</div><div className="cc-kpi-l">No-shows</div></div>
                  <div className="cc-kpi"><div className="cc-kpi-n"><span className="cc-cnt" data-target="15">0</span>h</div><div className="cc-kpi-l">Libérées / sem.</div></div>
                </div>
                <div className="cc-quote cc-card-quote">
                  <p>"Notre secrétaire peut enfin se concentrer sur l'accueil. Les rappels automatiques ont transformé notre organisation."</p>
                  <span>Dr. Laurent M. — Chirurgien-dentiste</span>
                </div>
              </div>
              <div className="cc-card-foot">
                <div className="cc-card-time"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>15h / sem. récupérées</div>
                <div className="cc-card-cta">Étude complète →</div>
              </div>
            </article>

            {/* Immobilier */}
            <article className="cc-card cc-item" data-sector="immobilier">
              <div className="cc-card-screen">
                <div className="cc-bbar" style={{ padding: '8px 12px' }}>
                  <div className="cc-dots"><span className="cc-dot cc-dot-r"></span><span className="cc-dot cc-dot-y"></span><span className="cc-dot cc-dot-g"></span></div>
                  <div className="cc-url">agence-bordelais.fr</div>
                </div>
                <div className="cc-sbody cc-s-immo">
                  <div className="cc-ui-listings">
                    <div className="cc-ui-li"><div className="cc-ui-li-th"></div><div className="cc-ui-li-i"><div className="cc-ui-li-ln"></div><div className="cc-ui-li-ls"></div></div><div className="cc-ui-li-p"></div></div>
                    <div className="cc-ui-li"><div className="cc-ui-li-th" style={{ background: 'rgba(217,119,6,.18)' }}></div><div className="cc-ui-li-i"><div className="cc-ui-li-ln"></div><div className="cc-ui-li-ls"></div></div><div className="cc-ui-li-p"></div></div>
                    <div className="cc-ui-li"><div className="cc-ui-li-th" style={{ background: 'rgba(217,119,6,.12)' }}></div><div className="cc-ui-li-i"><div className="cc-ui-li-ln"></div><div className="cc-ui-li-ls"></div></div><div className="cc-ui-li-p"></div></div>
                  </div>
                </div>
              </div>
              <div className="cc-card-body">
                <div className="cc-badge" style={{ background: 'rgba(217,119,6,.1)', border: '1px solid rgba(217,119,6,.2)', color: '#fbbf24' }}>
                  <span className="cc-badge-dot" style={{ background: '#d97706' }}></span>Immobilier
                </div>
                <div className="cc-card-title">+315% de leads qualifiés,<br />−60% coût d'acquisition</div>
                <div className="cc-card-company">Agence immobilière · Toulouse</div>
                <div className="cc-card-div"></div>
                <div className="cc-ps" style={{ gap: '.6rem', marginBottom: '.9rem' }}>
                  <div className="cc-prob"><span className="cc-ps-label">Problème</span><p>Site dépassé, 0 trafic organique, 100% dépendant des portails payants.</p></div>
                  <div className="cc-sol"><span className="cc-ps-label">Solution</span><p>Refonte premium + SEO + 3 landing pages locales + tracking.</p></div>
                </div>
                <div className="cc-kpis" style={{ marginBottom: '.9rem' }}>
                  <div className="cc-kpi"><div className="cc-kpi-n">+<span className="cc-cnt" data-target="315">0</span>%</div><div className="cc-kpi-l">Leads organiques</div></div>
                  <div className="cc-kpi"><div className="cc-kpi-n">−<span className="cc-cnt" data-target="60">0</span>%</div><div className="cc-kpi-l">Coût d'acquisition</div></div>
                  <div className="cc-kpi"><div className="cc-kpi-n"><span className="cc-cnt" data-target="8">0</span>h</div><div className="cc-kpi-l">Économisées / sem.</div></div>
                </div>
                <div className="cc-quote cc-card-quote">
                  <p>"En 6 mois, on est passés de 0 lead organique à des appels de prospects qui nous trouvent directement sur Google."</p>
                  <span>Maxime B. — Directeur d'agence</span>
                </div>
              </div>
              <div className="cc-card-foot">
                <div className="cc-card-time"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>8h / sem. récupérées</div>
                <div className="cc-card-cta">Étude complète →</div>
              </div>
            </article>

            {/* Conseil */}
            <article className="cc-card cc-item" data-sector="conseil">
              <div className="cc-card-screen">
                <div className="cc-bbar" style={{ padding: '8px 12px' }}>
                  <div className="cc-dots"><span className="cc-dot cc-dot-r"></span><span className="cc-dot cc-dot-y"></span><span className="cc-dot cc-dot-g"></span></div>
                  <div className="cc-url">cabinet-rh-lyon.fr/dashboard</div>
                </div>
                <div className="cc-sbody cc-s-conseil">
                  <div className="cc-ui-dash">
                    <div className="cc-ui-chart">
                      <div className="cc-ui-bar" style={{ height: '42%' }}></div>
                      <div className="cc-ui-bar" style={{ height: '58%' }}></div>
                      <div className="cc-ui-bar" style={{ height: '33%' }}></div>
                      <div className="cc-ui-bar" style={{ height: '72%' }}></div>
                      <div className="cc-ui-bar" style={{ height: '48%' }}></div>
                      <div className="cc-ui-bar" style={{ height: '88%', background: 'linear-gradient(180deg,rgba(0,102,255,.85),rgba(0,102,255,.35))' }}></div>
                    </div>
                    <div className="cc-ui-mets">
                      <div className="cc-ui-met"><div className="cc-ui-met-n"></div><div className="cc-ui-met-l"></div></div>
                      <div className="cc-ui-met"><div className="cc-ui-met-n" style={{ background: 'rgba(0,102,255,.5)' }}></div><div className="cc-ui-met-l"></div></div>
                      <div className="cc-ui-met"><div className="cc-ui-met-n" style={{ background: 'rgba(16,185,129,.45)' }}></div><div className="cc-ui-met-l"></div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="cc-card-body">
                <div className="cc-badge" style={{ background: 'rgba(79,70,229,.1)', border: '1px solid rgba(79,70,229,.2)', color: '#a5b4fc' }}>
                  <span className="cc-badge-dot" style={{ background: '#4f46e5' }}></span>Conseil RH
                </div>
                <div className="cc-card-title">−80% de temps de reporting,<br />+40% de missions signées</div>
                <div className="cc-card-company">Cabinet de conseil RH · Lyon</div>
                <div className="cc-card-div"></div>
                <div className="cc-ps" style={{ gap: '.6rem', marginBottom: '.9rem' }}>
                  <div className="cc-prob"><span className="cc-ps-label">Problème</span><p>Reporting 100% manuel (Excel), propositions reconstruites à chaque fois.</p></div>
                  <div className="cc-sol"><span className="cc-ps-label">Solution</span><p>Automatisation reporting + templates intelligents + CRM intégré.</p></div>
                </div>
                <div className="cc-kpis" style={{ marginBottom: '.9rem' }}>
                  <div className="cc-kpi"><div className="cc-kpi-n">−<span className="cc-cnt" data-target="80">0</span>%</div><div className="cc-kpi-l">Temps reporting</div></div>
                  <div className="cc-kpi"><div className="cc-kpi-n">+<span className="cc-cnt" data-target="40">0</span>%</div><div className="cc-kpi-l">Missions signées</div></div>
                  <div className="cc-kpi"><div className="cc-kpi-n"><span className="cc-cnt" data-target="20">0</span>h</div><div className="cc-kpi-l">Récupérées / mois</div></div>
                </div>
                <div className="cc-quote cc-card-quote">
                  <p>"On a l'impression d'avoir embauché un assistant invisible. Le reporting d'une journée se génère maintenant en 10 minutes."</p>
                  <span>Sophie L. — Associée fondatrice</span>
                </div>
              </div>
              <div className="cc-card-foot">
                <div className="cc-card-time"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>20h / mois récupérées</div>
                <div className="cc-card-cta">Étude complète →</div>
              </div>
            </article>

            {/* Restauration */}
            <article className="cc-card cc-item" data-sector="restauration">
              <div className="cc-card-screen">
                <div className="cc-bbar" style={{ padding: '8px 12px' }}>
                  <div className="cc-dots"><span className="cc-dot cc-dot-r"></span><span className="cc-dot cc-dot-y"></span><span className="cc-dot cc-dot-g"></span></div>
                  <div className="cc-url">restaurant-antoine.fr</div>
                </div>
                <div className="cc-sbody cc-s-resto">
                  <div className="cc-ui-resto-h"><div className="cc-ui-resto-logo"></div></div>
                  <div className="cc-ui-menu">
                    <div className="cc-ui-dish"><div className="cc-ui-dn"></div><div className="cc-ui-dp"></div></div>
                    <div className="cc-ui-dish"><div className="cc-ui-dn"></div><div className="cc-ui-dp"></div></div>
                    <div className="cc-ui-dish"><div className="cc-ui-dn"></div><div className="cc-ui-dp"></div></div>
                    <div className="cc-ui-dish"><div className="cc-ui-dn"></div><div className="cc-ui-dp"></div></div>
                  </div>
                </div>
              </div>
              <div className="cc-card-body">
                <div className="cc-badge" style={{ background: 'rgba(225,29,72,.1)', border: '1px solid rgba(225,29,72,.2)', color: '#fb7185' }}>
                  <span className="cc-badge-dot" style={{ background: '#e11d48' }}></span>Restauration
                </div>
                <div className="cc-card-title">+220% de réservations,<br />complet tous les week-ends</div>
                <div className="cc-card-company">Restaurant gastronomique · Bordeaux</div>
                <div className="cc-card-div"></div>
                <div className="cc-ps" style={{ gap: '.6rem', marginBottom: '.9rem' }}>
                  <div className="cc-prob"><span className="cc-ps-label">Problème</span><p>Réservations uniquement par tél., 0 présence en ligne structurée.</p></div>
                  <div className="cc-sol"><span className="cc-ps-label">Solution</span><p>Site premium + réservation en ligne + identité visuelle + avis Google.</p></div>
                </div>
                <div className="cc-kpis" style={{ marginBottom: '.9rem' }}>
                  <div className="cc-kpi"><div className="cc-kpi-n">+<span className="cc-cnt" data-target="220">0</span>%</div><div className="cc-kpi-l">Réservations</div></div>
                  <div className="cc-kpi"><div className="cc-kpi-n" style={{ fontSize: '1.2rem' }}>4.9★</div><div className="cc-kpi-l">Note Google</div></div>
                  <div className="cc-kpi"><div className="cc-kpi-n"><span className="cc-cnt" data-target="6">0</span>h</div><div className="cc-kpi-l">Économisées / sem.</div></div>
                </div>
                <div className="cc-quote cc-card-quote">
                  <p>"La salle se remplit toute seule maintenant. CA-TECH a créé quelque chose qui correspond exactement à l'image qu'on voulait donner."</p>
                  <span>Antoine R. — Propriétaire</span>
                </div>
              </div>
              <div className="cc-card-foot">
                <div className="cc-card-time"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>6h / sem. récupérées</div>
                <div className="cc-card-cta">Étude complète →</div>
              </div>
            </article>

          </div>{/* /cc-grid */}
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="cc-cta">
        <div className="cc-cta-inner" id="ccCta">
          <p className="cc-cta-ey">Votre entreprise, demain</p>
          <h2 className="cc-cta-title">Votre succès pourrait être<br />la prochaine étude de cas</h2>
          <p className="cc-cta-sub">Prenons 30 minutes pour analyser votre situation. On vous dit exactement ce qu'on peut accomplir ensemble — et ce que ça vous rapportera.</p>
          <div className="cc-cta-btns">
            <Link to="/contact" className="cc-btn-w">Demander un audit gratuit →</Link>
            <Link to="/services" className="cc-btn-g">Voir toutes les solutions</Link>
          </div>
        </div>
      </section>
    </>
  )
}
