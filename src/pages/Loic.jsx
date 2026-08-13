import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Loic.css'
import { usePageMeta, SITE_URL } from '../lib/seo'
import { useJsonLd, webPageSchema, breadcrumbSchema } from '../lib/schema'
import { SeoRelated } from '../components/SeoContent'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      ?? 'https://jhcyooksjeivajdjicka.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const LOIC_RELATED = [
  { href: '/collaborateurs-ia', label: '6 Collaborateurs IA',      icon: '🤖', desc: 'Voir tous les agents disponibles' },
  { href: '/tarifs',            label: 'Tarifs & Pricing',          icon: '💰', desc: 'À partir de 290 €/mois' },
  { href: '/realisations',      label: 'Études de cas',             icon: '🏆', desc: 'ROI mesuré sur missions réelles' },
  { href: '/services',          label: 'Nos services',              icon: '✨', desc: 'Web, IA, automatisations' },
  { href: '/automatisations',   label: 'Automatisations',           icon: '⚙️', desc: 'Complémentaires à vos agents IA' },
  { href: '/contact',           label: 'Planifier un appel',        icon: '→',  desc: 'Gratuit · 30 min · Sans engagement' },
]

const DIAGNOSTIC_STEPS = [
  { label: "Activité & secteur" },
  { label: "Taille de l'équipe" },
  { label: "Tâches chronophages" },
  { label: "Outils actuels" },
  { label: "Expérience IA" },
  { label: "Défi principal" },
  { label: "Budget envisagé" },
  { label: "Priorités 6 mois" },
]

const STARTER_QUESTIONS = [
  'Faire le diagnostic IA de mon entreprise',
  'Quels processus peut-on automatiser ?',
  'Combien coûte un agent IA ?',
  'Vous avez des références dans mon secteur ?',
]

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function fmt(text) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

// ── Score card rendu inline dans le chat ──────────────────────────────────────
function ScoreCard({ data }) {
  const { score, level, level_description, dimensions, recommandations } = data
  const color = score >= 70 ? '#059669' : score >= 45 ? '#0066FF' : '#F59E0B'
  const dimEntries = [
    { key: 'processus',   label: 'Processus' },
    { key: 'donnees',     label: 'Données & Outils' },
    { key: 'maturite_ia', label: 'Maturité IA' },
    { key: 'ambition',    label: 'Ambition & Budget' },
  ]
  return (
    <div className="lv2-score-card">
      <div className="lv2-score-top">
        <div className="lv2-score-circle" style={{ borderColor: color }}>
          <span className="lv2-score-num" style={{ color }}>{score}</span>
          <span className="lv2-score-max">/100</span>
        </div>
        <div>
          <p className="lv2-score-level" style={{ color }}>{level}</p>
          <p className="lv2-score-desc">{level_description}</p>
        </div>
      </div>
      <div className="lv2-dims">
        {dimEntries.map(({ key, label }) => (
          <div key={key} className="lv2-dim-row">
            <span className="lv2-dim-label">{label}</span>
            <div className="lv2-dim-bar-wrap">
              <div className="lv2-dim-bar-fill" style={{ width: `${Math.round((dimensions[key] ?? 0) / 25 * 100)}%`, background: color }} />
            </div>
            <span className="lv2-dim-val">{dimensions[key] ?? 0}/25</span>
          </div>
        ))}
      </div>
      <div className="lv2-recos">
        <p className="lv2-recos-title">3 actions prioritaires</p>
        {(recommandations ?? []).map((r, i) => (
          <div key={i} className="lv2-reco-item">
            <span className="lv2-reco-num">{i + 1}</span>
            <span className="lv2-reco-text">{r}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loic() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Bonjour ! Je suis Loïc, consultant IA de CA-TECH.\n\nJe réalise des diagnostics de maturité IA pour les entreprises — 8 questions, 5 minutes, et vous repartez avec un score et 3 recommandations personnalisées.\n\nOn commence votre diagnostic ?',
      time: getTime(),
    },
  ])
  const [input, setInput]             = useState('')
  const [isTyping, setIsTyping]       = useState(false)
  const [conversationId, setConvId]   = useState(null)
  const [apiMessages, setApiMessages] = useState([])
  const [scoreData, setScoreData]     = useState(null)
  const [reportSent, setReportSent]   = useState(false)
  const [diagStep, setDiagStep]       = useState(0)
  const [error, setError]             = useState(null)

  const scrollRef       = useRef(null)
  const inputRef        = useRef(null)
  const heroVideoRef    = useRef(null)
  const heroVideoWrapRef = useRef(null)

  usePageMeta({
    title: 'Loïc — Diagnostic IA gratuit en 5 minutes · CA-TECH',
    description: "Obtenez votre score de maturité IA en 5 minutes : 8 questions, analyse personnalisée, 3 recommandations actionnables. Diagnostic gratuit par Loïc, consultant IA CA-TECH.",
    keywords: 'diagnostic maturité IA, score IA entreprise, consultant IA gratuit, audit IA PME, automatisation entreprise, agent IA conversationnel',
    path: '/loic',
  })
  useJsonLd('loic-page', webPageSchema({
    name: 'Loïc — Diagnostic IA gratuit en 5 minutes · CA-TECH',
    description: "Obtenez votre score de maturité IA en 5 minutes. Diagnostic personnalisé, rapport PDF gratuit.",
    path: '/loic',
    image: '/collaborateurs/commercial-ia.webp',
    speakableCssSelectors: ['h1', '.ldemo-tagline'],
  }))
  useJsonLd('breadcrumb', breadcrumbSchema([
    { name: 'Accueil', path: '/' },
    { name: 'Diagnostic IA — Loïc', path: '/loic' },
  ]))

  useEffect(() => {
    const wrap = heroVideoWrapRef.current
    if (wrap) requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('ready')))
    const video = heroVideoRef.current
    if (!video) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => { if (mq.matches) video.pause(); else video.play().catch(() => {}) }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const send = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    setInput('')
    setError(null)

    const userMsg = { role: 'user', text: trimmed, time: getTime() }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    const nextApiMessages = [...apiMessages, { role: 'user', content: trimmed }]
    setApiMessages(nextApiMessages)

    // Incrémenter le step du diagnostic (heuristique : chaque message user avance d'une question)
    setDiagStep(prev => Math.min(prev + 1, DIAGNOSTIC_STEPS.length))

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/loic-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages:        nextApiMessages,
          conversation_id: conversationId,
          metadata:        { source: 'loic-page' },
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      if (data.conversation_id && !conversationId) {
        setConvId(data.conversation_id)
      }

      const botText = data.message ?? ''
      const action  = data.action ?? null

      if (action?.type === 'show_score') {
        setScoreData(action)
        setDiagStep(DIAGNOSTIC_STEPS.length)
      }
      if (action?.type === 'send_report') {
        setReportSent(true)
      }

      const botApiMsg = { role: 'assistant', content: botText }
      setApiMessages(prev => [...prev, botApiMsg])

      setMessages(prev => [...prev, {
        role:      'bot',
        text:      botText,
        time:      getTime(),
        scoreData: action?.type === 'show_score' ? action : null,
      }])
    } catch (err) {
      console.error('[Loic]', err)
      setError('La connexion a échoué. Réessayez ou écrivez à contact@ca-tech.fr')
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Je rencontre une difficulté technique. Vous pouvez me réécrire ou contacter CA-TECH directement à contact@ca-tech.fr',
        time: getTime(),
      }])
    } finally {
      setIsTyping(false)
    }
  }, [isTyping, apiMessages, conversationId])

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const diagProgress = Math.min(Math.round((diagStep / DIAGNOSTIC_STEPS.length) * 100), 100)
  const diagStarted  = diagStep > 0

  return (
    <>
      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="ldemo-hero">
        <div className="ldemo-hero-grid" aria-hidden="true" />
        <div className="ldemo-halo ldemo-halo-1" aria-hidden="true" />
        <div className="ldemo-halo ldemo-halo-2" aria-hidden="true" />
        <div className="ldemo-hero-inner">
          <div className="ldemo-hero-video-col" aria-hidden="true">
            <div className="ldemo-hero-video-wrap" ref={heroVideoWrapRef}>
              <video
                ref={heroVideoRef}
                autoPlay muted loop playsInline preload="metadata"
                className="ldemo-hero-video"
                poster="/collaborateurs/commercial-ia.webp"
                aria-label="Démonstration de Loïc, consultant IA CA-TECH"
              >
                <source src="/loic/loic-ia.mp4" type="video/mp4" />
              </video>
              <div className="ldemo-hero-video-overlay" />
            </div>
          </div>
          <div className="ldemo-hero-content">
            <p className="ldemo-kicker">
              <span className="ldemo-kicker-dot" aria-hidden="true" />
              Diagnostic IA gratuit · CA-TECH
            </p>
            <h1 className="ldemo-h1">Quel est votre score de<br /><em>maturité IA</em> ?</h1>
            <p className="ldemo-sub">8 questions · 5 minutes · Score personnalisé + rapport envoyé par email. Loïc analyse votre situation et identifie vos meilleures opportunités IA.</p>
            <div className="ldemo-hero-btns">
              <button className="ldemo-btn-main" onClick={() => document.getElementById('diagnostic')?.scrollIntoView({ behavior: 'smooth' })}>
                Démarrer le diagnostic
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <Link to="/contact" className="ldemo-btn-ghost">Parler à un expert →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════ */}
      <div className="ldemo-strip">
        {[
          { val: '5 min',  label: 'Durée du diagnostic' },
          { val: '8',      label: 'Questions ciblées' },
          { val: '100 pts',label: 'Score de maturité' },
          { val: 'Gratuit',label: 'Sans engagement' },
        ].map(({ val, label }) => (
          <div key={label} className="ldemo-strip-item">
            <span className="ldemo-strip-val">{val}</span>
            <span className="ldemo-strip-lbl">{label}</span>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════
          DIAGNOSTIC
      ════════════════════════════════════════ */}
      <section className="ldemo-section" id="diagnostic">
        <div className="ldemo-layout">

          {/* ── Sidebar ── */}
          <aside className="ldemo-sidebar">
            <div className="ldemo-about">
              <div className="ldemo-avatar-lg">L</div>
              <div>
                <p className="ldemo-about-name">Loïc</p>
                <p className="ldemo-about-role">Consultant IA · CA-TECH</p>
                <p className="ldemo-online"><span className="ldemo-dot" />En ligne · Répond instantanément</p>
              </div>
            </div>

            {/* Étapes du diagnostic */}
            <div className="lv2-steps-block">
              <p className="lv2-steps-title">Le diagnostic en 3 temps</p>
              <div className="lv2-step-item">
                <span className="lv2-step-num" style={{ background: '#0066FF' }}>1</span>
                <div>
                  <p className="lv2-step-label">8 questions</p>
                  <p className="lv2-step-sub">Activité, processus, outils, budget</p>
                </div>
              </div>
              <div className="lv2-step-item">
                <span className="lv2-step-num" style={{ background: '#7c3aed' }}>2</span>
                <div>
                  <p className="lv2-step-label">Score de maturité</p>
                  <p className="lv2-step-sub">4 dimensions · /100 points</p>
                </div>
              </div>
              <div className="lv2-step-item">
                <span className="lv2-step-num" style={{ background: '#059669' }}>3</span>
                <div>
                  <p className="lv2-step-label">Rapport par email</p>
                  <p className="lv2-step-sub">Analyse + plan d'action personnalisé</p>
                </div>
              </div>
            </div>

            {/* Thèmes couverts */}
            <div className="ldemo-use-cases">
              <p className="ldemo-uc-title">Thèmes analysés</p>
              <div className="ldemo-uc-list">
                {[
                  { icon: '⚙️', label: 'Processus & tâches répétitives' },
                  { icon: '🗄️', label: 'Outils & organisation des données' },
                  { icon: '🤖', label: 'Maturité IA actuelle' },
                  { icon: '🎯', label: 'Priorités & budget' },
                  { icon: '💡', label: 'Opportunités identifiées' },
                  { icon: '📋', label: "Plan d'action personnalisé" },
                ].map(({ icon, label }) => (
                  <div key={label} className="ldemo-uc-item">
                    <span>{icon}</span><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Chat ── */}
          <div className="ldemo-chat">
            <div className="ldemo-chat-header">
              <div className="ldemo-chat-avatar">L</div>
              <div className="ldemo-chat-info">
                <p className="ldemo-chat-name">Loïc — Consultant IA</p>
                <p className="ldemo-chat-status"><span className="ldemo-dot" />En ligne · Diagnostic IA gratuit</p>
              </div>
              {diagStarted && !scoreData && (
                <div className="lv2-progress-wrap" title={`Question ${diagStep}/${DIAGNOSTIC_STEPS.length}`}>
                  <div className="lv2-progress-label">Question {Math.min(diagStep, DIAGNOSTIC_STEPS.length)}/{DIAGNOSTIC_STEPS.length}</div>
                  <div className="lv2-progress-bar">
                    <div className="lv2-progress-fill" style={{ width: `${diagProgress}%` }} />
                  </div>
                </div>
              )}
              {scoreData && (
                <div className="lv2-score-badge" style={{ color: scoreData.score >= 70 ? '#059669' : scoreData.score >= 45 ? '#0066FF' : '#F59E0B' }}>
                  Score : {scoreData.score}/100
                </div>
              )}
            </div>

            <div className="ldemo-messages" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`ldemo-msg ldemo-msg--${m.role}`}>
                  {m.role === 'bot' && <div className="ldemo-msg-av">L</div>}
                  <div className="ldemo-msg-body">
                    {m.text && (
                      <div className="ldemo-msg-bubble" dangerouslySetInnerHTML={{ __html: fmt(m.text) }} />
                    )}
                    {m.scoreData && (
                      <ScoreCard data={m.scoreData} />
                    )}
                    <div className="ldemo-msg-meta">
                      {m.role === 'bot' ? 'Loïc' : 'Vous'} · {m.time}
                      {m.role === 'bot' && <span className="ldemo-check">✓✓</span>}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="ldemo-msg ldemo-msg--bot">
                  <div className="ldemo-msg-av">L</div>
                  <div className="ldemo-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {reportSent && (
                <div className="lv2-report-confirm">
                  <span className="lv2-report-icon">✅</span>
                  Rapport envoyé par email · Vérifiez votre boîte de réception (et vos spams).
                </div>
              )}
            </div>

            <div className="ldemo-input-area">
              {!diagStarted && (
                <div className="ldemo-chips-row">
                  {STARTER_QUESTIONS.map(q => (
                    <button key={q} className="ldemo-chip-quick" onClick={() => { send(q); inputRef.current?.focus() }}>{q}</button>
                  ))}
                </div>
              )}
              <div className="ldemo-input-row">
                <input
                  ref={inputRef}
                  type="text"
                  className="ldemo-input"
                  placeholder={scoreData ? 'Entrez votre email pour recevoir le rapport...' : 'Répondez à Loïc...'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={isTyping}
                />
                <button
                  className="ldemo-send"
                  onClick={() => send(input)}
                  disabled={isTyping || !input.trim()}
                  aria-label="Envoyer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="ldemo-disclaimer">Diagnostic confidentiel · Données utilisées uniquement pour votre rapport · Aucun engagement</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
      <SeoRelated
        eyebrow="Aller plus loin"
        title="De l'analyse à l'exécution"
        links={LOIC_RELATED}
      />

      <section className="ldemo-cta">
        <div className="ldemo-cta-inner">
          <p className="ldemo-cta-label">Après le diagnostic</p>
          <h2 className="ldemo-cta-h2">Passez de l'analyse à l'<strong>action en 48h.</strong></h2>
          <p className="ldemo-cta-sub">Appel découverte gratuit · Plan d'action personnalisé · Première livraison visible dès la semaine 1</p>
          <div className="ldemo-cta-btns">
            <Link to="/contact" className="ldemo-btn-main">Planifier un appel →</Link>
            <Link to="/services" className="ldemo-btn-ghost">Voir nos services</Link>
          </div>
        </div>
      </section>
    </>
  )
}
