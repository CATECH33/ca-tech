import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../../css/main.css'

export default function Home() {
  useEffect(() => {
    document.title = 'CA-TECH — Cabinet de Développement Digital · Sites Internet, Applications Web, CRM, SaaS'
  }, [])

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
      }, { threshold: 0.12 })
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
                <span className="pill pill-dark">✦ Cabinet de Développement Digital</span>
              </div>
              <h1 className="hero-h1" id="hero-h1" style={{ opacity: 0, transform: 'translateY(16px)' }}>
                Nous développons les outils qui font grandir votre entreprise.
              </h1>
              <p className="hero-subtitle" id="hero-sub" style={{ opacity: 0, transform: 'translateY(12px)' }}>
                Sites Internet • Applications Web • CRM • Plateformes SaaS • Intelligence Artificielle • Automatisations • SEO
              </p>
              <p className="hero-desc" id="hero-desc" style={{ opacity: 0, transform: 'translateY(8px)', color: 'rgba(255,255,255,.65)', fontSize: '1rem', lineHeight: 1.65, maxWidth: '520px', marginBottom: '2rem' }}>
                CA-TECH conçoit des solutions digitales sur mesure pour automatiser votre activité, attirer plus de clients et accompagner votre croissance.
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
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: '24px',
              listStyle: 'none',
              padding: 0,
              margin: '56px 0 0',
            }}
          >
            {/* Développement Web */}
            <li className="reveal">
              <Link
                to="/services"
                style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface, #fff)', borderRadius: '16px', border: '1px solid var(--color-border, #e5e7eb)', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 200ms, transform 200ms', color: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,102,255,.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                aria-label="Développement Web — Découvrir"
              >
                <div style={{ background: 'linear-gradient(135deg, #0066FF18 0%, #0A254010 100%)', padding: '36px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#0066FF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,102,255,.35)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '10px', color: 'var(--color-text, #0A2540)' }}>Développement Web</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-gray-600, #6b7280)', marginBottom: '20px' }}>Sites vitrines, e-commerce, landing pages haute conversion. Livrés en 5 à 42 jours, mobile-first, Lighthouse ≥ 95.</p>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0066FF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Découvrir
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                  </span>
                </div>
              </Link>
            </li>

            {/* Applications Métier */}
            <li className="reveal d1">
              <Link
                to="/services"
                style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface, #fff)', borderRadius: '16px', border: '1px solid var(--color-border, #e5e7eb)', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 200ms, transform 200ms', color: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                aria-label="Applications Métier — Découvrir"
              >
                <div style={{ background: 'linear-gradient(135deg, #6366F118 0%, #4F46E510 100%)', padding: '36px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,.35)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '10px', color: 'var(--color-text, #0A2540)' }}>Applications Métier</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-gray-600, #6b7280)', marginBottom: '20px' }}>Plateformes SaaS, outils internes, dashboards sur mesure. Des solutions qui s'adaptent exactement à vos processus.</p>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6366F1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Découvrir
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                  </span>
                </div>
              </Link>
            </li>

            {/* CRM sur mesure */}
            <li className="reveal d2">
              <Link
                to="/services"
                style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface, #fff)', borderRadius: '16px', border: '1px solid var(--color-border, #e5e7eb)', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 200ms, transform 200ms', color: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                aria-label="CRM sur mesure — Découvrir"
              >
                <div style={{ background: 'linear-gradient(135deg, #8B5CF618 0%, #7C3AED10 100%)', padding: '36px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(139,92,246,.35)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '10px', color: 'var(--color-text, #0A2540)' }}>CRM sur mesure</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-gray-600, #6b7280)', marginBottom: '20px' }}>Gérez vos clients, prospects et opportunités dans un outil pensé pour votre métier. Fini les tableurs Excel.</p>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8B5CF6', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Découvrir
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                  </span>
                </div>
              </Link>
            </li>

            {/* Solutions IA */}
            <li className="reveal d3">
              <Link
                to="/collaborateurs-ia"
                style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface, #fff)', borderRadius: '16px', border: '1px solid var(--color-border, #e5e7eb)', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 200ms, transform 200ms', color: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,102,255,.15)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                aria-label="Solutions IA — Découvrir"
              >
                <div style={{ background: 'linear-gradient(135deg, #0066FF22 0%, #0A254015 100%)', padding: '36px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '11px', fontWeight: '700', letterSpacing: '.05em', background: '#0066FF', color: '#fff', borderRadius: '6px', padding: '3px 8px' }}>N°1</span>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #0066FF, #0A2540)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,102,255,.40)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M8 8V5a4 4 0 0 1 8 0v3" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="10" y1="15" x2="14" y2="15" /></svg>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '10px', color: 'var(--color-text, #0A2540)' }}>Solutions IA</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-gray-600, #6b7280)', marginBottom: '20px' }}>Agents IA sur mesure, assistants RAG, chatbots qualifiants. L'IA déployée là où elle génère un ROI mesurable.</p>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0066FF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Découvrir
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                  </span>
                </div>
              </Link>
            </li>

            {/* Automatisations */}
            <li className="reveal d1">
              <Link
                to="/automatisations"
                style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface, #fff)', borderRadius: '16px', border: '1px solid var(--color-border, #e5e7eb)', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 200ms, transform 200ms', color: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                aria-label="Automatisations — Découvrir"
              >
                <div style={{ background: 'linear-gradient(135deg, #10B98118 0%, #059F6B10 100%)', padding: '36px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(16,185,129,.35)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '10px', color: 'var(--color-text, #0A2540)' }}>Automatisations</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-gray-600, #6b7280)', marginBottom: '20px' }}>Workflows N8N, Make, Zapier, scripts Python. Vos processus répétitifs tournent seuls — 14h récupérées/semaine en moyenne.</p>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Découvrir
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                  </span>
                </div>
              </Link>
            </li>

            {/* Référencement SEO */}
            <li className="reveal d2">
              <Link
                to="/services"
                style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface, #fff)', borderRadius: '16px', border: '1px solid var(--color-border, #e5e7eb)', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 200ms, transform 200ms', color: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,158,11,.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                aria-label="Référencement SEO — Découvrir"
              >
                <div style={{ background: 'linear-gradient(135deg, #F59E0B18 0%, #D9770610 100%)', padding: '36px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245,158,11,.35)' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '10px', color: 'var(--color-text, #0A2540)' }}>Référencement SEO</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--color-gray-600, #6b7280)', marginBottom: '20px' }}>Audit technique, stratégie de contenu, SEO local et national. Trafic organique ×3.4 en 6 mois en moyenne.</p>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Découvrir
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                  </span>
                </div>
              </Link>
            </li>
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 460px), 1fr))',
              gap: '32px',
              marginTop: '56px',
            }}
          >
            {/* Collaborateurs IA */}
            <article
              className="reveal-l"
              style={{
                borderRadius: '20px',
                border: '1px solid rgba(0,102,255,.15)',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 2px 16px rgba(0,102,255,.06)',
              }}
              aria-label="Collaborateurs IA"
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #0A2540 0%, #0066FF 100%)',
                  padding: '48px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minHeight: '220px',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M8 8V5a4 4 0 0 1 8 0v3" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="10" y1="15" x2="14" y2="15" /></svg>
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Collaborateurs IA</h3>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>Des assistants IA qui répondent à vos clients, qualifient vos leads et automatisent votre SAV — 24h/24, sans pause.</p>
              </div>
              <div style={{ padding: '32px 40px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: 'var(--color-gray-700, #374151)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    Chatbot qualifiant intégré à votre site
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: 'var(--color-gray-700, #374151)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    Agent SAV — 73% des tickets traités sans humain
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: 'var(--color-gray-700, #374151)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    À partir de 800 € — premier livrable en 72h
                  </li>
                </ul>
                <Link to="/collaborateurs-ia" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Découvrir les Collaborateurs IA →
                </Link>
              </div>
            </article>

            {/* Automatisations */}
            <article
              className="reveal-r"
              style={{
                borderRadius: '20px',
                border: '1px solid rgba(16,185,129,.15)',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 2px 16px rgba(16,185,129,.06)',
              }}
              aria-label="Automatisations"
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
                  padding: '48px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minHeight: '220px',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Automatisations</h3>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>Connectez vos outils, éliminez les tâches répétitives et récupérez 14h par semaine en moyenne grâce à nos workflows sur mesure.</p>
              </div>
              <div style={{ padding: '32px 40px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: 'var(--color-gray-700, #374151)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    N8N, Make, Zapier, scripts Python sur mesure
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: 'var(--color-gray-700, #374151)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    Devis, relances, facturation — 100% automatiques
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: 'var(--color-gray-700, #374151)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    À partir de 800 € — ROI moyen ×4 en 3 mois
                  </li>
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
