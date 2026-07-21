import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../../css/main.css'

export default function Home() {
  useEffect(() => {
    /* ── 4. HERO ENTRANCE ANIMATION ─────────────────────────────────────── */
    (function () {
      if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        ;['hero-h1', 'hero-sub', 'hero-ctas', 'hero-micro', 'hero-demo'].forEach(function (id) {
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
      animate(document.getElementById('hero-ctas'), 400)
      animate(document.getElementById('hero-micro'), 500)
      animate(document.getElementById('hero-demo'), 600)

      /* Hero chat sequence */
      var msgs = document.getElementById('chat-messages')
      if (!msgs) return
      var seq = [
        { role: 'loic', text: 'Bonjour ! Je suis Loïc, consultant IA chez CA-TECH.', delay: 800 },
        { role: 'user', text: "Combien d'heures votre équipe perd-elle sur des tâches répétitives ?", delay: 3200 },
        { role: 'loic', text: 'En moyenne, nos clients récupèrent 8h/semaine dès le premier mois. 🚀', delay: 5200 },
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
      /* CTA bubble in chat */
      setTimeout(function () {
        var cta = document.createElement('a')
        cta.href = '/contact'
        cta.className = 'chat-bubble loic show'
        cta.innerHTML = '<strong>→ Lancer mon diagnostic gratuit</strong>'
        cta.style.cursor = 'pointer'
        msgs.appendChild(cta)
        msgs.scrollTop = msgs.scrollHeight
      }, 8000)
    })()

    /* ── 5. LOÏC DEMO SECTION CHAT ───────────────────────────────────────── */
    ;(function () {
      var reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches
      var msgs = document.getElementById('loic-chat-messages')
      var choices = document.getElementById('loic-choices')
      if (!msgs) return

      function addBubble(role, text, delay) {
        if (reduced) {
          var b = document.createElement('div')
          b.className = 'chat-bubble ' + role + ' show'
          b.textContent = text
          msgs.appendChild(b)
          return
        }
        setTimeout(function () {
          var t = document.createElement('div')
          t.className = 'chat-typing show'
          t.innerHTML = '<span></span><span></span><span></span>'
          msgs.appendChild(t)
          setTimeout(function () {
            msgs.removeChild(t)
            var b = document.createElement('div')
            b.className = 'chat-bubble ' + role
            b.textContent = text
            msgs.appendChild(b)
            requestAnimationFrame(function () { b.classList.add('show') })
          }, 900)
        }, delay)
      }

      var loicDemoEl = document.getElementById('loic-demo')
      if (!loicDemoEl) return
      var obs = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return
        obs.disconnect()
        addBubble('loic', "Bonjour ! Je suis Loïc. Pour vous aider efficacement, j'ai besoin de comprendre votre activité.", reduced ? 0 : 600)
        addBubble('loic', 'Quel est votre principal défi en ce moment ?', reduced ? 0 : 3200)
        setTimeout(function () {
          if (choices) choices.style.opacity = '1'
        }, reduced ? 0 : 4800)
      }, { threshold: 0.3 })
      obs.observe(loicDemoEl)
    })()

    /* ── 7. SCROLL REVEAL ────────────────────────────────────────────────── */
    ;(function () {
      if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(function (el) { el.classList.add('visible') })
        return
      }
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
        })
      }, { threshold: 0.12 })
      document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(function (el) { obs.observe(el) })
    })()

    /* ── 8. COUNT-UP ─────────────────────────────────────────────────────── */
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

    /* ── 9. FAQ ACCORDION ────────────────────────────────────────────────── */
    ;(function () {
      document.querySelectorAll('.faq-question').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = btn.closest('.faq-item')
          var isOpen = item.classList.contains('open')
          document.querySelectorAll('.faq-item.open').forEach(function (i) {
            i.classList.remove('open')
            i.querySelector('.faq-question').setAttribute('aria-expanded', 'false')
          })
          if (!isOpen) {
            item.classList.add('open')
            btn.setAttribute('aria-expanded', 'true')
          }
        })
      })
    })()

    /* ── 10. TESTIMONIAL CAROUSEL ────────────────────────────────────────── */
    var carouselTimer
    ;(function () {
      var track = document.getElementById('carousel-track')
      var dots = document.querySelectorAll('.carousel-dot')
      var prev = document.getElementById('carousel-prev')
      var next = document.getElementById('carousel-next')
      if (!track || !prev || !next) return
      var total = dots.length
      var cur = 0

      function goTo(idx) {
        cur = ((idx % total) + total) % total
        track.style.transform = 'translateX(-' + cur * 100 + '%)'
        dots.forEach(function (d, i) {
          d.classList.toggle('active', i === cur)
          d.setAttribute('aria-selected', i === cur ? 'true' : 'false')
        })
      }
      function startTimer() { carouselTimer = setInterval(function () { goTo(cur + 1) }, 6000) }
      function stopTimer() { clearInterval(carouselTimer) }

      prev.addEventListener('click', function () { stopTimer(); goTo(cur - 1); startTimer() })
      next.addEventListener('click', function () { stopTimer(); goTo(cur + 1); startTimer() })
      dots.forEach(function (d) {
        d.addEventListener('click', function () { stopTimer(); goTo(parseInt(d.dataset.index, 10)); startTimer() })
      })
      track.parentElement.addEventListener('mouseenter', stopTimer)
      track.parentElement.addEventListener('mouseleave', startTimer)

      /* Swipe */
      var sx = 0
      track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX }, { passive: true })
      track.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - sx
        if (Math.abs(dx) > 40) { stopTimer(); goTo(dx < 0 ? cur + 1 : cur - 1); startTimer() }
      }, { passive: true })

      startTimer()
    })()

    return () => {
      clearInterval(carouselTimer)
    }
  }, [])

  function openLoicWidget(prefill) {
    var msg = prefill ? 'Loïc : ' + prefill : ''
    console.log('Open Loïc widget', msg)
    window.location.href = '/contact'
  }

  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" aria-label="Bienvenue sur CA-TECH">
        <div className="container">
          <div className="hero-inner">
            {/* Content */}
            <div className="hero-content">
              <div className="hero-pill">
                <span className="pill pill-dark">✦ Cabinet de conseil IA-first</span>
              </div>
              <h1 className="hero-h1" id="hero-h1" style={{ opacity: 0, transform: 'translateY(16px)' }}>
                L'Intelligence Artificielle<br />au service de votre croissance.
              </h1>
              <p className="hero-subtitle" id="hero-sub" style={{ opacity: 0, transform: 'translateY(12px)' }}>
                CA-TECH déploie des agents IA, des automatisations sur mesure et des stratégies SEO pour transformer votre activité en résultats mesurables.
              </p>
              <div className="hero-ctas" id="hero-ctas" style={{ opacity: 0, transform: 'translateY(8px)' }}>
                <a href="/devis" className="btn btn-white btn-xl" aria-label="Lancer mon diagnostic IA gratuit">Lancer mon Diagnostic IA →</a>
                <Link to="/realisations" className="btn btn-ghost-white btn-xl">Voir nos réalisations</Link>
              </div>
              <p className="hero-micro" id="hero-micro" style={{ opacity: 0 }}>Gratuit · Sans engagement · Résultat en 10 minutes</p>
            </div>
            {/* Chat demo (desktop) */}
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

      {/* ── 2. PROOF BAR ─────────────────────────────────────────────────────── */}
      <section id="proof-bar" aria-label="Chiffres clés CA-TECH">
        <div className="container">
          <dl className="proof-grid">
            <div className="proof-stat reveal">
              <dd className="proof-value" data-count="240" data-prefix="+" data-suffix="%">+240%</dd>
              <dt className="proof-label">de leads qualifiés<br />générés en moyenne</dt>
            </div>
            <div className="proof-stat reveal d1">
              <dd className="proof-value" data-text="72h">72h</dd>
              <dt className="proof-label">pour un premier<br />agent IA livrable</dt>
            </div>
            <div className="proof-stat reveal d2">
              <dd className="proof-value" data-count="50" data-prefix="+" data-suffix="">+50</dd>
              <dt className="proof-label">entreprises<br />accompagnées</dt>
            </div>
            <div className="proof-stat reveal d3">
              <dd className="proof-value" data-count="97" data-prefix="" data-suffix="">97</dd>
              <dt className="proof-label">score Lighthouse<br />en performance</dt>
            </div>
          </dl>
        </div>
      </section>

      {/* ── 3. POURQUOI CA-TECH ─────────────────────────────────────────────── */}
      <section id="why" aria-labelledby="why-title">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Notre différence</span>
            <h2 className="section-h2" id="why-title">Pourquoi les dirigeants choisissent CA-TECH</h2>
            <p className="section-intro">Pas une agence de plus. Un cabinet qui mesure chaque euro investi.</p>
          </div>
          <ul className="why-grid" role="list">
            <li>
              <article className="why-card reveal">
                <div className="why-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                </div>
                <h3 className="why-title">Chaque mission se mesure</h3>
                <p className="why-text">Aucun rapport vague. Chaque projet démarre avec des KPI définis et se termine avec une preuve de ROI. +240% de leads en moyenne sur nos missions IA.</p>
                <div className="why-proof">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                  Étude de cas : Agent IA SAV → +180% satisfaction client
                </div>
                <a href="/realisations" className="why-link">Voir nos cas clients <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></a>
              </article>
            </li>
            <li>
              <article className="why-card reveal d1">
                <div className="why-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <h3 className="why-title">72h pour un premier livrable</h3>
                <p className="why-text">Nous livrons un premier résultat concret en 72 heures. Pas de phase de cadrage de 3 mois. L'action d'abord, l'optimisation ensuite.</p>
                <div className="why-proof">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                  50 projets livrés. Délai moyen d'activation : 72h
                </div>
                <a href="#processus" className="why-link">Comment nous travaillons <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></a>
              </article>
            </li>
            <li>
              <article className="why-card reveal d2">
                <div className="why-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M8 8V5a4 4 0 0 1 8 0v3" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="10" y1="15" x2="14" y2="15" /></svg>
                </div>
                <h3 className="why-title">L'IA qui travaille vraiment</h3>
                <p className="why-text">Nous ne faisons pas de présentations PowerPoint sur l'IA. Nous déployons des agents qui travaillent dans votre SI, dès la semaine 1.</p>
                <div className="why-proof">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                  Loïc, notre consultant IA, qualifie vos projets en temps réel
                </div>
                <Link to="/collaborateurs-ia" className="why-link">Découvrir Loïc <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></Link>
              </article>
            </li>
            <li>
              <article className="why-card reveal d3">
                <div className="why-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h3 className="why-title">Un interlocuteur unique</h3>
                <p className="why-text">Pas de rotation d'équipe. Votre consultant CA-TECH connaît votre dossier de A à Z et répond en moins de 24h.</p>
                <div className="why-proof">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                  NPS moyen de nos clients : 74 (best-in-class B2B)
                </div>
                <a href="#temoignages" className="why-link">Voir les témoignages <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></a>
              </article>
            </li>
          </ul>
          {/* Reassurance bar */}
          <div className="reassurance-bar reveal">
            <div className="reassurance-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Devis gratuit et sans engagement</div>
            <div className="reassurance-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Réponse sous 24h</div>
            <div className="reassurance-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Résultats mesurables garantis</div>
            <div className="reassurance-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Pas de contrat long terme</div>
          </div>
        </div>
      </section>

      {/* ── 4. EXPERTISES ────────────────────────────────────────────────────── */}
      <section id="expertises" aria-labelledby="expertises-title">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Nos expertises</span>
            <h2 className="section-h2" id="expertises-title">Quatre leviers pour votre croissance</h2>
            <p className="section-intro">De l'agent IA à la page qui convertit — CA-TECH maîtrise toute la chaîne.</p>
          </div>
          <ul className="expertises-grid" role="list" aria-label="Nos expertises">
            <li>
              <Link to="/collaborateurs-ia" className="expertise-card featured reveal" aria-label="Intelligence Artificielle — Découvrir l'offre IA">
                <div className="expertise-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M8 8V5a4 4 0 0 1 8 0v3" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="10" y1="15" x2="14" y2="15" /></svg>
                </div>
                <div className="expertise-badge"><span className="pill pill-primary">N°1 — Cœur de métier</span></div>
                <h3 className="expertise-title">Intelligence Artificielle</h3>
                <p className="expertise-text">Agents IA métier, copilotes, assistants RAG, automatisation cognitive. Nous déployons l'IA là où elle génère un retour mesurable dès les premières semaines.</p>
                <ul className="expertise-kpis" aria-label="Indicateurs clés">
                  <li>Agents déployés : 12+</li>
                  <li>Gain moyen : +180% productivité équipes</li>
                  <li>Délai premier livrable : 72h</li>
                </ul>
                <span className="expertise-cta">Découvrir l'offre IA <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></span>
              </Link>
            </li>
            <li>
              <Link to="/automatisations" className="expertise-card reveal d1" aria-label="Automatisation — Automatiser mes processus">
                <div className="expertise-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <h3 className="expertise-title">Automatisation</h3>
                <p className="expertise-text">Workflows N8N, Zapier, scripts Python. Vos processus répétitifs tournent seuls pendant que votre équipe se concentre sur ce qui compte vraiment.</p>
                <ul className="expertise-kpis" aria-label="Indicateurs clés">
                  <li>Processus automatisés : 80+</li>
                  <li>Temps récupéré : -14h/semaine en moyenne</li>
                  <li>ROI moyen : ×4 en 3 mois</li>
                </ul>
                <span className="expertise-cta">Automatiser mes processus <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></span>
              </Link>
            </li>
            <li>
              <a href="/services" className="expertise-card reveal d2" aria-label="SEO — Auditer mon SEO">
                <div className="expertise-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                </div>
                <h3 className="expertise-title">SEO</h3>
                <p className="expertise-text">Audits techniques, piliers de contenu, SEO local et national. Vous êtes trouvé avant vos concurrents sur les requêtes qui convertissent.</p>
                <ul className="expertise-kpis" aria-label="Indicateurs clés">
                  <li>Trafic moyen ×3.4 en 6 mois</li>
                  <li>100% des clients en page 1</li>
                  <li>Score technique moyen : 97/100</li>
                </ul>
                <span className="expertise-cta">Auditer mon SEO <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></span>
              </a>
            </li>
            <li>
              <Link to="/realisations" className="expertise-card reveal d3" aria-label="Développement Web — Voir nos réalisations web">
                <div className="expertise-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                </div>
                <h3 className="expertise-title">Développement Web</h3>
                <p className="expertise-text">Sites vitrines, e-commerce, applications métier. Chaque ligne de code sert un objectif business précis. Lighthouse ≥ 90, mobile-first, WCAG AA.</p>
                <ul className="expertise-kpis" aria-label="Indicateurs clés">
                  <li>Sites livrés : 30+</li>
                  <li>Score Lighthouse moyen : 97</li>
                  <li>Délai de livraison : 2 à 6 semaines</li>
                </ul>
                <span className="expertise-cta">Voir nos réalisations web <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></span>
              </Link>
            </li>
          </ul>
          <div className="expertises-footer reveal">
            <a href="/services" className="btn btn-secondary">Voir toutes nos expertises</a>
          </div>
        </div>
      </section>

      {/* ── 5. LOÏC DEMO ─────────────────────────────────────────────────────── */}
      <section id="loic-demo" aria-labelledby="loic-demo-title">
        <div className="container">
          <div className="loic-inner">
            {/* Chat demo */}
            <div className="loic-visual reveal-l">
              <div className="chat-frame">
                <div className="chat-bar">
                  <div className="chat-dots"><span></span><span></span><span></span></div>
                  <span className="chat-bar-title">Loïc — Consultant IA</span>
                  <span className="chat-bar-status">En ligne</span>
                </div>
                <div className="chat-messages" id="loic-chat-messages" style={{ minHeight: '220px' }}></div>
                {/* Quick choices */}
                <div id="loic-choices" style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0, transition: 'opacity 300ms' }}>
                  <button className="loic-choice-btn" onClick={() => openLoicWidget('Générer plus de leads')}>Générer plus de leads</button>
                  <button className="loic-choice-btn" onClick={() => openLoicWidget('Automatiser mes processus')}>Automatiser mes processus</button>
                  <button className="loic-choice-btn" onClick={() => openLoicWidget('Améliorer mon référencement')}>Améliorer mon référencement</button>
                  <button className="loic-choice-btn" onClick={() => openLoicWidget('Autre chose')}>Autre chose</button>
                </div>
              </div>
            </div>
            {/* Benefits */}
            <div className="loic-content reveal-r">
              <span className="section-pre on-dark">Loïc — Consultant IA</span>
              <h2 className="section-h2 on-dark" id="loic-demo-title">Rencontrez Loïc, votre consultant IA disponible 24h/7j</h2>
              <ul className="loic-benefits" aria-label="Ce que Loïc fait pour vous">
                <li className="loic-benefit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Analyse votre secteur et vos concurrents</li>
                <li className="loic-benefit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Qualifie votre projet en 10 minutes</li>
                <li className="loic-benefit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Prépare un rapport personnalisé sous 24h</li>
                <li className="loic-benefit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Vous oriente vers la solution la plus rentable</li>
                <li className="loic-benefit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Disponible 7j/7, répond en quelques secondes</li>
              </ul>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.30)', marginBottom: '28px' }} aria-label="Loïc est en ligne">
                <span id="loic-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'block' }}></span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,.85)' }}>Loïc est en ligne — Répond en quelques secondes</span>
              </div>
              <button className="btn btn-white btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openLoicWidget()} aria-label="Démarrer une conversation avec Loïc">Démarrer avec Loïc →</button>
              <p style={{ marginTop: '12px', fontSize: '14px', color: 'rgba(255,255,255,.55)', textAlign: 'center' }}>Gratuit · Aucune inscription requise</p>
              <p style={{ marginTop: '12px', textAlign: 'center' }}>
                <Link to="/collaborateurs-ia" style={{ fontSize: '14px', color: 'rgba(255,255,255,.65)', transition: 'color 150ms' }}>Ou découvrir comment fonctionne Loïc →</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PROCESSUS ─────────────────────────────────────────────────────── */}
      <section id="processus" aria-labelledby="process-title">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Notre méthode</span>
            <h2 className="section-h2" id="process-title">De la première conversation au premier résultat — en 4 étapes</h2>
            <p className="section-intro">Un processus transparent, des livrables concrets, un calendrier tenu.</p>
          </div>
          <ol className="steps-grid" aria-label="Notre processus de travail">
            <li className="step reveal">
              <div className="step-circle" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <span className="step-delay pill pill-primary">Jour 1</span>
              <h3 className="step-title">Diagnostic</h3>
              <p className="step-text">Loïc analyse votre activité, vos processus et vos objectifs. Vous recevez un rapport de diagnostic personnalisé sous 24h.</p>
              <span className="step-delay" style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '12px' }}>✓ Gratuit</span>
            </li>
            <li className="step reveal d1">
              <div className="step-circle" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
              </div>
              <span className="step-delay pill pill-primary">Jour 2–3</span>
              <h3 className="step-title">Stratégie</h3>
              <p className="step-text">Nous définissons ensemble les actions prioritaires, le budget, le calendrier et les KPI de succès de votre mission.</p>
              <span className="step-delay" style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '12px' }}>En 48h</span>
            </li>
            <li className="step reveal d2">
              <div className="step-circle" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
              </div>
              <span className="step-delay pill pill-primary">Semaine 1+</span>
              <h3 className="step-title">Exécution</h3>
              <p className="step-text">Notre équipe déploie, teste et affine. Vous avez accès à un dashboard de suivi en temps réel et un point hebdomadaire.</p>
              <span className="step-delay" style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '12px' }}>Premier livrable : 72h</span>
            </li>
            <li className="step reveal d3">
              <div className="step-circle" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              </div>
              <span className="step-delay pill pill-primary">Continu</span>
              <h3 className="step-title">Résultats</h3>
              <p className="step-text">Mesure des KPI, optimisation continue, rapport de ROI mensuel. Nous ne disparaissons pas après la livraison.</p>
              <span className="step-delay" style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '12px' }}>ROI mesuré</span>
            </li>
          </ol>
          {/* Reassurance */}
          <div className="reassurance-bar reveal" style={{ marginTop: '48px' }}>
            <div className="reassurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Premier livrable en 72h
            </div>
            <div className="reassurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
              Dashboard de suivi inclus
            </div>
            <div className="reassurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Point hebdomadaire
            </div>
            <div className="reassurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              Rapport ROI mensuel
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <a href="/devis" className="btn btn-primary btn-lg reveal">Démarrer mon Diagnostic →</a>
          </div>
        </div>
      </section>

      {/* ── 7. CAS CLIENTS ────────────────────────────────────────────────────── */}
      <section id="cas-clients" aria-labelledby="cases-title">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Cas clients</span>
            <h2 className="section-h2" id="cases-title">Des résultats qui parlent d'eux-mêmes</h2>
            <p className="section-intro">Trois missions récentes. Des chiffres réels, vérifiables.</p>
          </div>
          <ul className="cases-grid" role="list" aria-label="Études de cas clients">
            <li>
              <article className="case-card reveal" aria-label="Agent IA SAV — e-commerce">
                <div className="case-tags">
                  <span className="case-tag ia">Intelligence Artificielle</span>
                  <span className="case-sector">E-commerce · Mode</span>
                </div>
                <h3 className="case-title">Agent IA SAV — 3 000 tickets/mois traités automatiquement</h3>
                <p className="case-desc">Un commerçant en ligne recevait 3 000 demandes SAV par mois. Son équipe était débordée. En 72h, Loïc a déployé un agent qui traite 73% des tickets sans intervention humaine.</p>
                <div className="case-kpis">
                  <div className="case-kpi"><span className="case-kpi-value">+180%</span><div className="case-kpi-label">Satisfaction client</div></div>
                  <div className="case-kpi"><span className="case-kpi-value">-73%</span><div className="case-kpi-label">Tickets humains</div></div>
                  <div className="case-kpi"><span className="case-kpi-value">72h</span><div className="case-kpi-label">Déploiement</div></div>
                </div>
                <Link to="/realisations" className="why-link" style={{ marginTop: '16px' }}>Lire l'étude de cas <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></Link>
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
                <Link to="/realisations" className="why-link" style={{ marginTop: '16px' }}>Lire l'étude de cas <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></Link>
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
                <Link to="/realisations" className="why-link" style={{ marginTop: '16px' }}>Lire l'étude de cas <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg></Link>
              </article>
            </li>
          </ul>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/realisations" className="btn btn-secondary reveal">→ Voir toutes nos réalisations</Link>
          </div>
        </div>
      </section>

      {/* ── 8. TÉMOIGNAGES ────────────────────────────────────────────────────── */}
      <section id="temoignages" aria-labelledby="testimonials-title" aria-roledescription="carousel">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Ils nous font confiance</span>
            <h2 className="section-h2" id="testimonials-title">Ce que nos clients disent de CA-TECH</h2>
          </div>
          <div className="carousel-wrap reveal">
            <div className="carousel-track" id="carousel-track" aria-live="polite" aria-atomic="false">
              {/* Slide 1 */}
              <div className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-stars" aria-label="5 étoiles sur 5">★★★★★</div>
                  <blockquote className="testimonial-quote">« En 3 semaines, Loïc a automatisé tout notre processus de relance client. On a récupéré 12h par semaine et nos leads ne tombent plus dans les oubliettes. »</blockquote>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" aria-hidden="true">T</div>
                    <div>
                      <div className="testimonial-name">Thomas M.</div>
                      <div className="testimonial-role">Directeur commercial, PME industrie · 35 salariés</div>
                    </div>
                    <span className="case-tag auto" style={{ marginLeft: 'auto' }}>Automatisation</span>
                  </div>
                </div>
              </div>
              {/* Slide 2 */}
              <div className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-stars" aria-label="5 étoiles sur 5">★★★★★</div>
                  <blockquote className="testimonial-quote">« Je craignais que l'IA soit trop complexe pour notre structure. CA-TECH nous a prouvé le contraire en 72h. Premier agent livré, premiers résultats mesurés. »</blockquote>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" aria-hidden="true">S</div>
                    <div>
                      <div className="testimonial-name">Sophie L.</div>
                      <div className="testimonial-role">Fondatrice, startup SaaS RH · 12 salariés</div>
                    </div>
                    <span className="case-tag ia" style={{ marginLeft: 'auto' }}>IA</span>
                  </div>
                </div>
              </div>
              {/* Slide 3 */}
              <div className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-stars" aria-label="5 étoiles sur 5">★★★★★</div>
                  <blockquote className="testimonial-quote">« Notre trafic organique a été multiplié par 3.4 en 6 mois. Sans une seule campagne payante. L'équipe CA-TECH sait exactement ce qu'elle fait en SEO. »</blockquote>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" aria-hidden="true">M</div>
                    <div>
                      <div className="testimonial-name">Marc D.</div>
                      <div className="testimonial-role">Directeur marketing, cabinet conseil B2B</div>
                    </div>
                    <span className="case-tag seo" style={{ marginLeft: 'auto' }}>SEO</span>
                  </div>
                </div>
              </div>
              {/* Slide 4 */}
              <div className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-stars" aria-label="5 étoiles sur 5">★★★★★</div>
                  <blockquote className="testimonial-quote">« Ce qui m'a convaincu, c'est leur honnêteté. Ils m'ont dit exactement ce qui était faisable et ce qui ne l'était pas. Et ils ont livré. »</blockquote>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" aria-hidden="true">I</div>
                    <div>
                      <div className="testimonial-name">Isabelle R.</div>
                      <div className="testimonial-role">Gérante, commerce de détail · Paris</div>
                    </div>
                    <span className="case-tag dev" style={{ marginLeft: 'auto' }}>Dev Web</span>
                  </div>
                </div>
              </div>
              {/* Slide 5 */}
              <div className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-stars" aria-label="5 étoiles sur 5">★★★★★</div>
                  <blockquote className="testimonial-quote">« Loïc répond à 3h du matin quand j'en ai besoin. Ce niveau de réactivité avec un résultat aussi concret, je n'avais jamais connu ça. »</blockquote>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" aria-hidden="true">K</div>
                    <div>
                      <div className="testimonial-name">Karim B.</div>
                      <div className="testimonial-role">CEO, agence événementielle</div>
                    </div>
                    <span className="case-tag ia" style={{ marginLeft: 'auto' }}>IA</span>
                  </div>
                </div>
              </div>
              {/* Slide 6 */}
              <div className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-stars" aria-label="5 étoiles sur 5">★★★★★</div>
                  <blockquote className="testimonial-quote">« NPS de 74 pour CA-TECH dans notre baromètre fournisseurs. C'est le meilleur score de toute notre liste de prestataires tech. »</blockquote>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" aria-hidden="true">D</div>
                    <div>
                      <div className="testimonial-name">Directrice des opérations</div>
                      <div className="testimonial-role">Groupe retail national (confidentiel)</div>
                    </div>
                    <span className="case-tag auto" style={{ marginLeft: 'auto' }}>Auto + IA</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="carousel-controls">
              <button className="carousel-btn" id="carousel-prev" aria-label="Témoignage précédent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="carousel-dots" role="tablist" aria-label="Témoignages">
                <button className="carousel-dot active" role="tab" aria-selected="true" aria-label="Témoignage 1" data-index="0"></button>
                <button className="carousel-dot" role="tab" aria-selected="false" aria-label="Témoignage 2" data-index="1"></button>
                <button className="carousel-dot" role="tab" aria-selected="false" aria-label="Témoignage 3" data-index="2"></button>
                <button className="carousel-dot" role="tab" aria-selected="false" aria-label="Témoignage 4" data-index="3"></button>
                <button className="carousel-dot" role="tab" aria-selected="false" aria-label="Témoignage 5" data-index="4"></button>
                <button className="carousel-dot" role="tab" aria-selected="false" aria-label="Témoignage 6" data-index="5"></button>
              </div>
              <button className="carousel-btn" id="carousel-next" aria-label="Témoignage suivant">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. TARIFS ─────────────────────────────────────────────────────────── */}
      <section id="tarifs" aria-labelledby="pricing-title">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="section-pre">Tarifs</span>
            <h2 className="section-h2" id="pricing-title">Des formats adaptés à votre projet</h2>
            <p className="section-intro">Aucune surprise. Devis détaillé sous 24h, sans engagement.</p>
          </div>
          <div className="pricing-grid">
            {/* Card 1 */}
            <div className="pricing-card reveal">
              <div className="pricing-name">Entrée</div>
              <div className="pricing-price">490 <sub>€</sub></div>
              <div className="pricing-period">À partir de · Livré en 48h</div>
              <p className="pricing-desc">Pour démarrer sans risque et comprendre où l'IA peut vous aider.</p>
              <ul className="pricing-features">
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Audit complet de votre activité par Loïc</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Rapport de 15 à 20 pages personnalisé</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Recommandations prioritaires actionnables</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Appel de restitution 45 minutes</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Plan d'action sur 90 jours</span></li>
              </ul>
              <a href="/devis" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Demander mon audit →</a>
              <p className="pricing-note">Audit &amp; Diagnostic</p>
            </div>
            {/* Card 2 — Featured */}
            <div className="pricing-card featured reveal d1">
              <div className="pricing-featured-badge">Recommandé</div>
              <div className="pricing-name">Sprint</div>
              <div className="pricing-price">1 900 <sub>€</sub></div>
              <div className="pricing-period">À partir de · Premier livrable en 72h</div>
              <p className="pricing-desc">Pour aller de l'idée au premier résultat en moins d'une semaine.</p>
              <ul className="pricing-features">
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Tout ce qui est dans l'Audit</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Déploiement d'un agent ou automatisation</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Formation de votre équipe (2h)</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Suivi 30 jours post-lancement</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Dashboard de KPI inclus</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Interlocuteur dédié</span></li>
              </ul>
              <a href="/devis" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Démarrer mon Sprint →</a>
              <p className="pricing-note">Sprint IA</p>
            </div>
            {/* Card 3 */}
            <div className="pricing-card reveal d2">
              <div className="pricing-name">Avancé</div>
              <div className="pricing-price" style={{ fontSize: '2rem' }}>Sur devis</div>
              <div className="pricing-period">Selon périmètre</div>
              <p className="pricing-desc">Pour une transformation profonde et mesurable de votre activité.</p>
              <ul className="pricing-features">
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Audit + Sprint + itérations</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Intégrations SI personnalisées</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Agents IA sur mesure</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Accompagnement 3 à 12 mois</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Reporting mensuel ROI</span></li>
                <li className="pricing-feature"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg><span>Accès prioritaire à Loïc</span></li>
              </ul>
              <a href="/devis" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Parlons de votre projet →</a>
              <p className="pricing-note">Projet complet</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-gray-400)', marginTop: '28px' }} className="reveal">
            💡 Ces tarifs sont indicatifs. Chaque projet est devisé sur mesure après un diagnostic gratuit.<br />
            Loïc peut vous orienter vers le format le plus adapté à votre budget.
          </p>
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a href="/devis" className="btn btn-primary reveal">Demander un devis gratuit →</a>
            <p style={{ fontSize: '13px', color: 'var(--color-gray-400)', marginTop: '10px' }}>Réponse sous 24h · Devis détaillé · Zéro engagement</p>
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" aria-labelledby="faq-title">
        <div className="container">
          <div className="faq-inner">
            <div className="faq-sidebar reveal-l">
              <h2 className="faq-sidebar-title" id="faq-title">Les questions que vous vous posez</h2>
              <p className="faq-sidebar-text">Nous répondons franchement. Parce que la transparence est la base d'une relation commerciale solide.</p>
              <a href="/devis" className="btn btn-primary">Lancer mon Diagnostic →</a>
            </div>
            <div className="faq-list reveal-r" role="list">
              <div className="faq-item" role="listitem">
                <button className="faq-question" aria-expanded="false">
                  Combien de temps faut-il pour démarrer un projet avec CA-TECH ?
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                </button>
                <div className="faq-answer"><div className="faq-answer-inner">En moins de 48h. Après votre diagnostic gratuit avec Loïc, vous recevez un rapport et une proposition dans la journée. Si vous validez, nous commençons dès le lendemain. Premier livrable en 72h dans la plupart des cas.</div></div>
              </div>
              <div className="faq-item" role="listitem">
                <button className="faq-question" aria-expanded="false">
                  Faut-il avoir une équipe technique pour travailler avec vous ?
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                </button>
                <div className="faq-answer"><div className="faq-answer-inner">Non. Nous nous adaptons à votre niveau de maturité digitale. Que vous ayez une DSI structurée ou un seul ordinateur, nous livrons une solution qui s'intègre à votre environnement actuel. Loïc évalue ça dès le diagnostic.</div></div>
              </div>
              <div className="faq-item" role="listitem">
                <button className="faq-question" aria-expanded="false">
                  Vos tarifs sont-ils transparents ou y a-t-il des coûts cachés ?
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                </button>
                <div className="faq-answer"><div className="faq-answer-inner">Nos tarifs affichés sont des points d'entrée. Votre devis est établi après le diagnostic et détaille chaque poste au centime près. Aucun surcoût sans votre accord écrit. Et le diagnostic est gratuit.</div></div>
              </div>
              <div className="faq-item" role="listitem">
                <button className="faq-question" aria-expanded="false">
                  Garantissez-vous des résultats ?
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                </button>
                <div className="faq-answer"><div className="faq-answer-inner">Nous garantissons le respect des KPI définis ensemble au démarrage. Si les objectifs ne sont pas atteints au terme de la mission, nous prolongeons notre accompagnement sans frais supplémentaires jusqu'à ce qu'ils le soient. Nos engagements sont contractuels.</div></div>
              </div>
              <div className="faq-item" role="listitem">
                <button className="faq-question" aria-expanded="false">
                  Mes données sont-elles en sécurité avec Loïc ?
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                </button>
                <div className="faq-answer"><div className="faq-answer-inner">Oui. Loïc ne stocke aucune donnée sensible. Les conversations sont chiffrées en transit, non utilisées pour l'entraînement de modèles tiers et supprimées sur demande. Nous respectons le RGPD et travaillons exclusivement avec des hébergements européens.</div></div>
              </div>
              <div className="faq-item" role="listitem">
                <button className="faq-question" aria-expanded="false">
                  En quoi CA-TECH est-il différent d'une agence web classique ?
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                </button>
                <div className="faq-answer"><div className="faq-answer-inner">Une agence web crée des sites. CA-TECH déploie des systèmes qui génèrent de la croissance. Nous démarrons toujours par un diagnostic ROI, pas par une maquette. Et nous mesurons chaque euro investi avec des KPI définis contractuellement.</div></div>
              </div>
              <div className="faq-item" role="listitem">
                <button className="faq-question" aria-expanded="false">
                  Travaillez-vous avec tous les secteurs d'activité ?
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                </button>
                <div className="faq-answer"><div className="faq-answer-inner">Nous travaillons principalement avec des PME (5 à 200 salariés) dans les services B2B, le commerce, l'artisanat, les professions libérales et les startups. Certains secteurs réglementés (finance, santé) demandent une qualification spécifique — Loïc vous indiquera si c'est votre cas.</div></div>
              </div>
              <div className="faq-item" role="listitem">
                <button className="faq-question" aria-expanded="false">
                  Puis-je arrêter à tout moment ?
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </span>
                </button>
                <div className="faq-answer"><div className="faq-answer-inner">Pour les missions Sprint et Audit, le paiement est intégral à la commande. Pour les projets longs (3 mois et plus), chaque mois est facturé séparément avec un préavis de 30 jours. Pas de contrat longue durée imposé.</div></div>
              </div>
              <div style={{ textAlign: 'center', padding: '32px 0 0' }}>
                <p style={{ fontSize: '15px', color: 'var(--color-gray-600)', marginBottom: '16px' }}>Vous avez une autre question ?</p>
                <button className="btn btn-primary" onClick={() => openLoicWidget()}>Posez-la à Loïc →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. CTA FINAL ──────────────────────────────────────────────────────── */}
      <section id="cta-final" aria-labelledby="cta-final-title">
        <div className="container">
          <div className="cta-final-pre"><span className="pill pill-dark">✦ Prêt à démarrer ?</span></div>
          <h2 className="cta-final-h2" id="cta-final-title">Votre premier résultat IA<br />est à 72 heures.</h2>
          <p className="cta-final-sub">Diagnostic gratuit · Rapport personnalisé · Premier livrable en 72h.<br />Pas d'engagement, pas de jargon — juste des résultats mesurables.</p>
          <div className="cta-final-btns">
            <a href="/devis" className="btn btn-white btn-xl">Lancer mon Diagnostic IA →</a>
          </div>
          <p className="cta-final-micro">Gratuit · Sans engagement · Réponse sous 24h</p>
          <p style={{ marginTop: '16px' }}>
            <button onClick={() => openLoicWidget()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: 'rgba(255,255,255,.65)', fontFamily: 'inherit', transition: 'color 150ms' }}>Ou parler à Loïc maintenant →</button>
          </p>
        </div>
      </section>
    </>
  )
}
