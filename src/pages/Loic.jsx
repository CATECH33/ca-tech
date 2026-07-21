import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Loic.css'

const SKILLS = [
  { emoji: '💼', title: 'Commercial IA', desc: 'Qualification de leads, réponses aux prospects, suivi de pipeline CRM — 24h/24 sans effort.' },
  { emoji: '🎧', title: 'Support Client', desc: 'Réponses aux questions fréquentes, résolution de tickets, escalade intelligente aux humains.' },
  { emoji: '📋', title: 'RH & Recrutement', desc: 'Tri de CV, questions fréquentes RH, onboarding automatisé, gestion des congés.' },
  { emoji: '⚖️', title: 'Juridique & Conformité', desc: 'Synthèse de contrats, vérification RGPD, rédaction de clauses standard.' },
  { emoji: '📈', title: 'SEO & Contenu', desc: 'Génération de contenu SEO, optimisation de fiches produits, rapport de positionnement.' },
  { emoji: '🔧', title: 'Intégrations sur mesure', desc: 'Connecté à votre CRM, vos emails, Slack, WhatsApp, Google Calendar et plus.' },
]

const STEPS = [
  { num: '01', title: 'Diagnostic', desc: 'Nous analysons vos processus pour identifier où Loïc peut vous faire gagner le plus de temps.' },
  { num: '02', title: 'Configuration', desc: 'On paramètre Loïc avec vos données : base de connaissances, ton, règles métier, intégrations.' },
  { num: '03', title: 'Déploiement', desc: 'Mise en production en 48h. Loïc commence à travailler immédiatement sur vos tâches répétitives.' },
  { num: '04', title: 'Optimisation', desc: "Suivi des performances, ajustements continus, reporting mensuel. Loïc s'améliore avec le temps." },
]

const STATS = [
  { val: '24/7', label: 'Disponibilité' },
  { val: '< 2s', label: 'Temps de réponse' },
  { val: '−70%', label: 'Tâches manuelles' },
  { val: '48h', label: 'Mise en production' },
]

export default function Loic() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const cx = cv.getContext('2d')
    let W, H, pts = [], raf

    function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight }
    window.addEventListener('resize', resize, { passive: true })
    resize()

    for (let i = 0; i < 40; i++) {
      pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, s: Math.random() * 1 + .5 })
    }

    function frame() {
      cx.clearRect(0, 0, W, H)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        cx.fillStyle = 'rgba(0,102,255,.4)'; cx.fill()
      })
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 100) {
          cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y)
          cx.strokeStyle = `rgba(0,102,255,${.15 * (1 - d / 100)})`; cx.lineWidth = .6; cx.stroke()
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('loic-vis')
      })
    }, { threshold: 0.15 })
    document.querySelectorAll('.loic-reveal').forEach(el => obs.observe(el))

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      obs.disconnect()
    }
  }, [])

  return (
    <>
      <section className="loic-hero">
        <canvas ref={canvasRef} className="loic-canvas" aria-hidden="true" />
        <div className="loic-grid-bg" aria-hidden="true" />

        <div className="loic-hero-inner">
          <div className="loic-hero-left">
            <p className="loic-kicker"><span></span>Collaborateur IA CA-TECH</p>
            <h1>Rencontrez <em>Loïc</em></h1>
            <p className="loic-sub">Loïc est votre collaborateur IA permanent. Il prend en charge les tâches répétitives — commercial, support, RH, contenu — pour que votre équipe se concentre sur ce qui compte vraiment.</p>
            <div className="loic-ctas">
              <Link to="/contact" className="btn-primary">Déployer Loïc →</Link>
              <Link to="/collaborateurs-ia" className="btn-outline">Tous les collaborateurs IA</Link>
            </div>
            <div className="loic-stats">
              {STATS.map(({ val, label }) => (
                <div key={label} className="loic-stat">
                  <span className="loic-stat-val">{val}</span>
                  <span className="loic-stat-lbl">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="loic-chat-demo" aria-hidden="true">
            <div className="loic-chat-bar">
              <div className="loic-chat-avatar">L</div>
              <div>
                <div className="loic-chat-name">Loïc</div>
                <div className="loic-chat-status"><span className="loic-dot"></span>En ligne</div>
              </div>
            </div>
            <div className="loic-messages">
              <div className="loic-msg loic-msg-bot">
                <span>Bonjour ! Je suis Loïc, votre collaborateur IA. Comment puis-je vous aider aujourd'hui ?</span>
              </div>
              <div className="loic-msg loic-msg-user">
                <span>Qualifie ce lead : startup SaaS, 20 salariés, budget ~5k€/mois</span>
              </div>
              <div className="loic-msg loic-msg-bot">
                <span>✓ Lead qualifié — Score : 87/100. J'envoie la proposition commerciale et bloque un créneau dans votre agenda pour lundi.</span>
              </div>
            </div>
            <div className="loic-chat-input">
              <div className="loic-input-mock">Votre message...</div>
              <div className="loic-send">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="loic-skills">
        <div className="loic-section-inner">
          <div className="loic-section-label">Compétences</div>
          <h2 className="loic-section-h2">Ce que Loïc fait pour vous</h2>
          <p className="loic-section-sub">Loïc s'adapte à votre métier et à vos outils. Chaque configuration est unique.</p>
          <div className="loic-skills-grid">
            {SKILLS.map(({ emoji, title, desc }) => (
              <div key={title} className="loic-skill-card loic-reveal">
                <div className="loic-skill-emoji">{emoji}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="loic-process">
        <div className="loic-section-inner">
          <div className="loic-section-label">Déploiement</div>
          <h2 className="loic-section-h2">De 0 à opérationnel en 48h</h2>
          <div className="loic-steps">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="loic-step loic-reveal">
                <div className="loic-step-num">{num}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="loic-cta-section">
        <div className="loic-cta-inner">
          <h2>Prêt à déployer Loïc dans votre entreprise ?</h2>
          <p>Diagnostic gratuit · Résultat en 24h · Mise en production en 48h</p>
          <div className="loic-cta-btns">
            <Link to="/contact" className="btn-cta-white">Démarrer le diagnostic gratuit →</Link>
            <Link to="/collaborateurs-ia" className="btn-cta-outline">Voir tous les cas d'usage</Link>
          </div>
        </div>
      </section>
    </>
  )
}
