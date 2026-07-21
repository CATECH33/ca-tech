import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Loic.css'

/* ── Simulated response database ── */
const RESPONSES = [
  {
    keywords: ['bonjour', 'hello', 'salut', 'hé', 'hey', 'coucou'],
    text: 'Bonjour ! Je suis Loïc, le collaborateur IA de CA-TECH. Je suis spécialisé en ventes, support client, RH et création de contenu.\n\nQue puis-je faire pour vous aujourd\'hui ?',
  },
  {
    keywords: ['qualif', 'lead', 'prospect', 'startup', 'scoring', 'score'],
    text: '✓ **Analyse du lead effectuée**\n\nProfil détecté : Startup SaaS, ~20 salariés\nBudget estimé : 3 000–5 000 €/mois\nScore de qualification : **84/100** — fort potentiel\n\n**Actions déclenchées automatiquement :**\n— Proposition commerciale personnalisée envoyée\n— Créneau de démo bloqué (lundi 14h, votre agenda est libre)\n— Lead ajouté au pipeline CRM en phase « Proposition »\n\nVoulez-vous que je rédige un email de suivi ?',
  },
  {
    keywords: ['email', 'relance', 'inactif', 'prospect inactif', 'mail'],
    text: '**Email de relance généré**\n\n---\nObjet : Suite à notre échange — une question rapide\n\nBonjour [Prénom],\n\nJe me permets de revenir vers vous. Avez-vous eu l\'occasion d\'étudier notre proposition ?\n\nNous venons d\'aider une entreprise similaire à la vôtre à réduire de 40 % son temps de traitement des demandes clients. Je serais ravi d\'échanger 15 minutes pour voir si ce résultat s\'applique à votre contexte.\n\nBonne semaine,\n[Votre signature]\n---\n\nEmail prêt. Voulez-je l\'envoyer directement ou l\'adapter ?',
  },
  {
    keywords: ['proposition', 'commerciale', 'devis', 'offre'],
    text: '**Proposition commerciale générée**\n\nClient : [Nom de l\'entreprise]\nDate : ' + new Date().toLocaleDateString('fr-FR') + '\n\n**Périmètre proposé :**\n— Collaborateur IA Commercial (qualification + relances)\n— Intégration CRM HubSpot + Gmail\n— Tableau de bord de performance\n\n**Investissement :** 490 €/mois (engagement 3 mois)\n**Délai de déploiement :** 48h\n**ROI estimé :** +12h/semaine récupérées dès le mois 1\n\nDocument PDF prêt à envoyer. Signature électronique incluse.',
  },
  {
    keywords: ['support', 'client', 'ticket', 'service client', 'week-end', 'nuit', 'urgent'],
    text: 'Pour le support client, voici ce que je fais concrètement :\n\n— Je réponds aux **questions fréquentes** instantanément (FAQ, commandes, délais…)\n— Je **classe et priorise** les tickets entrants par urgence\n— J\'escalade automatiquement les cas **critiques** à votre équipe\n— Je suis disponible **24h/24, 7j/7** — week-end et jours fériés inclus\n— Je rédige des réponses avec **le ton de votre marque**\n\nRésultat moyen chez nos clients : **−60 % de temps** passé sur le support.\n\nVoulez-vous voir un exemple de ticket traité ?',
  },
  {
    keywords: ['rh', 'ressources humaines', 'cv', 'recrutement', 'congé', 'onboarding', 'embauche'],
    text: 'En RH, je prends en charge :\n\n— **Tri de CV** automatique selon vos critères (poste, expérience, compétences)\n— Réponses aux **questions fréquentes** (congés, bulletins, politique interne)\n— Gestion des **demandes de congés** et vérification des soldes\n— **Onboarding** automatisé : documents, accès, planning J+1\n— Rédaction d\'**offres d\'emploi** optimisées pour les job boards\n\nSur quel aspect voulez-vous que je me concentre ?',
  },
  {
    keywords: ['seo', 'contenu', 'article', 'blog', 'rédige', 'texte', 'fiche', 'produit'],
    text: '**Article SEO généré — aperçu**\n\nTitre : « 5 façons d\'automatiser votre prospection B2B en 2025 »\n\n**Structure :**\n1. Le temps perdu en prospection manuelle (chiffres clés)\n2. L\'IA pour qualifier les leads entrants\n3. Les emails de relance automatisés\n4. Le scoring de leads en temps réel\n5. L\'intégration CRM sans friction\n\nMots-clés : automatisation prospection, IA commerciale, CRM automatisé\nLongueur : 1 200 mots · Lecture : 5 min · Score SEO estimé : 91/100\n\nVoulez-vous l\'article complet ou une version courte pour les réseaux ?',
  },
  {
    keywords: ['integr', 'connecter', 'crm', 'slack', 'gmail', 'whatsapp', 'notion', 'outlook', 'teams', 'hubspot'],
    text: 'Je suis compatible avec tous vos outils actuels :\n\n📧 **Email** — Gmail, Outlook, Apple Mail\n📅 **Agenda** — Google Calendar, Outlook Calendar\n💬 **Messagerie** — Slack, WhatsApp Business, Teams\n📊 **CRM** — HubSpot, Salesforce, Pipedrive, Notion\n📁 **Stockage** — Google Drive, OneDrive, Dropbox\n🧾 **Facturation** — Pennylane, QuickBooks, Sage\n\nAucune installation pour vos équipes. Je me connecte en lecture/écriture sur ce que vous avez déjà, en moins de 30 minutes.',
  },
  {
    keywords: ['coût', 'prix', 'tarif', 'combien', 'abonnement', 'forfait'],
    text: 'Le tarif dépend du rôle et du niveau d\'intégration :\n\n**Starter** — 290 €/mois\n1 rôle métier · Intégrations email + agenda · Support inclus\n\n**Pro** — 490 €/mois\nMulti-rôles · CRM + email + agenda · Reporting mensuel\n\n**Enterprise** — sur devis\nAccès API complet · SLA garanti · Account manager dédié\n\nTous les plans incluent un **diagnostic gratuit** et 30 jours d\'accompagnement. Le ROI moyen de nos clients est visible dès le premier mois.\n\nVoulez-vous planifier un appel de 20 minutes ?',
  },
  {
    keywords: ['temps', 'délai', 'opérationnel', 'combien de temps', '48h', 'rapidement', 'vite', 'quand'],
    text: '**Déploiement en 48h — planning type :**\n\n🕐 Heure 0 — Appel de diagnostic (30 min)\n🕒 Heure 2 — Configuration de votre base de connaissances\n🕙 Jour 1 soir — Tests avec vos vraies données\n🕗 Jour 2 — Ajustements et validation\n🚀 Jour 2 soir — Mise en production\n\nVous recevez un accès tableau de bord dès le jour 1. L\'accompagnement est inclus pendant 30 jours. Nos clients sont systématiquement opérationnels sous 48h.',
  },
  {
    keywords: ['faire', 'capable', 'fonctions', 'compétences', 'aide', 'montre', 'exemple', 'quoi', 'peux'],
    text: 'Voici ce que je fais concrètement :\n\n**Commercial**\n— Qualifier et scorer vos leads entrants\n— Envoyer des propositions personnalisées\n— Relancer automatiquement vos prospects\n\n**Support client**\n— Répondre aux questions 24h/24\n— Trier et prioriser les tickets\n— Escalader les cas complexes\n\n**RH**\n— Gérer les demandes de congés\n— Trier des CVs automatiquement\n— Automatiser l\'onboarding\n\n**Contenu**\n— Rédiger des articles SEO\n— Générer des emails de campagne\n— Créer des fiches produits optimisées\n\nVoulez-vous un exemple concret sur l\'un de ces domaines ?',
  },
]

const FALLBACK = 'Dans un déploiement réel, je serais connecté à votre base de connaissances et je vous répondrais avec une précision totale.\n\nPour cette démonstration, les réponses couvrent les cas d\'usage les plus fréquents. Essayez par exemple :\n— « Qualifie ce lead »\n— « Rédige un email de relance »\n— « Que peux-tu faire pour mon équipe ? »\n\nOu contactez-nous pour un diagnostic gratuit et je vous montrerai ce que je peux faire avec vos vraies données.'

const CATEGORIES = [
  {
    label: 'Commercial',
    color: '#0066FF',
    questions: [
      'Que peux-tu faire pour mon équipe ?',
      'Qualifie ce lead : startup SaaS, 20 salariés, budget 3k€',
      'Génère une proposition commerciale pour un hôtel',
      'Rédige un email de relance pour un prospect inactif',
    ],
  },
  {
    label: 'Support & RH',
    color: '#7c3aed',
    questions: [
      'Comment gères-tu les tickets urgents ?',
      'Peux-tu répondre à mes clients le week-end ?',
      'Que fais-tu pour le recrutement ?',
    ],
  },
  {
    label: 'Contenu & SEO',
    color: '#0891b2',
    questions: [
      'Rédige un article de blog SEO',
      'Avec quels outils peux-tu t\'intégrer ?',
    ],
  },
  {
    label: 'Tarifs & Déploiement',
    color: '#059669',
    questions: [
      'Combien ça coûte ?',
      'En combien de temps es-tu opérationnel ?',
    ],
  },
]

const STATS = [
  { val: '24/7', label: 'Disponibilité' },
  { val: '< 2s', label: 'Temps de réponse' },
  { val: '−70 %', label: 'Tâches manuelles' },
  { val: '48h', label: 'Déploiement' },
]

function fmt(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function findResponse(input) {
  const t = input.toLowerCase()
  for (const r of RESPONSES) {
    if (r.keywords.some(kw => t.includes(kw))) return r.text
  }
  return FALLBACK
}

export default function Loic() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Bonjour ! Je suis Loïc, votre démonstrateur IA CA-TECH.\n\nJe peux traiter vos leads, rédiger vos emails, gérer votre support client et bien plus encore. Posez-moi une question ou choisissez un exemple à gauche.', time: getTime() },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const send = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: trimmed, time: getTime() }])
    setIsTyping(true)
    const delay = 1000 + Math.random() * 700
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: findResponse(trimmed), time: getTime() }])
      setIsTyping(false)
    }, delay)
  }, [isTyping])

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

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
          <p className="ldemo-kicker">
            <span className="ldemo-kicker-dot" aria-hidden="true" />
            Centre de démonstration IA · CA-TECH
          </p>
          <h1 className="ldemo-h1">Discutez avec <em>Loïc</em>,<br />notre collaborateur IA.</h1>
          <p className="ldemo-sub">Posez n'importe quelle question commerciale, support ou RH. Loïc vous répond en temps réel — exactement comme il le ferait dans votre entreprise.</p>
          <div className="ldemo-hero-btns">
            <button className="ldemo-btn-main" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
              Tester gratuitement
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <Link to="/contact" className="ldemo-btn-ghost">Déployer Loïc →</Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════ */}
      <div className="ldemo-strip">
        {STATS.map(({ val, label }) => (
          <div key={label} className="ldemo-strip-item">
            <span className="ldemo-strip-val">{val}</span>
            <span className="ldemo-strip-lbl">{label}</span>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════
          DEMO
      ════════════════════════════════════════ */}
      <section className="ldemo-section" id="demo">
        <div className="ldemo-layout">

          {/* ── Sidebar ── */}
          <aside className="ldemo-sidebar">
            <div className="ldemo-about">
              <div className="ldemo-avatar-lg">L</div>
              <div>
                <p className="ldemo-about-name">Loïc</p>
                <p className="ldemo-about-role">Collaborateur IA · CA-TECH</p>
                <p className="ldemo-online"><span className="ldemo-dot" />En ligne · Répond instantanément</p>
              </div>
            </div>

            <div className="ldemo-use-cases">
              <p className="ldemo-uc-title">Cas d'usage</p>
              <div className="ldemo-uc-list">
                {[
                  { icon: '💼', label: 'Qualification de leads' },
                  { icon: '📧', label: 'Emails de relance' },
                  { icon: '🎧', label: 'Support client 24/7' },
                  { icon: '📋', label: 'RH & Recrutement' },
                  { icon: '📈', label: 'Contenu SEO' },
                  { icon: '🔗', label: '50+ intégrations' },
                ].map(({ icon, label }) => (
                  <div key={label} className="ldemo-uc-item">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ldemo-examples">
              <p className="ldemo-ex-title">Exemples de questions</p>
              {CATEGORIES.map(({ label, color, questions }) => (
                <div key={label} className="ldemo-cat">
                  <p className="ldemo-cat-label" style={{ color }}>{label}</p>
                  {questions.map(q => (
                    <button key={q} className="ldemo-chip" onClick={() => { send(q); inputRef.current?.focus() }}>{q}</button>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* ── Chat ── */}
          <div className="ldemo-chat">
            <div className="ldemo-chat-header">
              <div className="ldemo-chat-avatar">L</div>
              <div className="ldemo-chat-info">
                <p className="ldemo-chat-name">Loïc — Collaborateur IA</p>
                <p className="ldemo-chat-status"><span className="ldemo-dot" />En ligne · Répond en moins de 2s</p>
              </div>
              <div className="ldemo-badge-demo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Démonstration
              </div>
            </div>

            <div className="ldemo-messages" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`ldemo-msg ldemo-msg--${m.role}`}>
                  {m.role === 'bot' && <div className="ldemo-msg-av">L</div>}
                  <div className="ldemo-msg-body">
                    <div className="ldemo-msg-bubble" dangerouslySetInnerHTML={{ __html: fmt(m.text) }} />
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
            </div>

            <div className="ldemo-input-area">
              <div className="ldemo-chips-row">
                <button className="ldemo-chip-quick" onClick={() => send('Que peux-tu faire pour mon équipe ?')}>Que peux-tu faire ?</button>
                <button className="ldemo-chip-quick" onClick={() => send('Combien ça coûte ?')}>Tarifs</button>
                <button className="ldemo-chip-quick" onClick={() => send('En combien de temps es-tu opérationnel ?')}>Délai de déploiement</button>
              </div>
              <div className="ldemo-input-row">
                <input
                  ref={inputRef}
                  type="text"
                  className="ldemo-input"
                  placeholder="Posez une question à Loïc..."
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

            <p className="ldemo-disclaimer">Démonstration avec réponses simulées. Le vrai Loïc est connecté à votre base de données et vos outils.</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
      <section className="ldemo-cta">
        <div className="ldemo-cta-inner">
          <p className="ldemo-cta-label">Prêt à passer en production ?</p>
          <h2 className="ldemo-cta-h2">Déployez Loïc dans votre entreprise en <strong>48h.</strong></h2>
          <p className="ldemo-cta-sub">Diagnostic gratuit · Configuration sur mesure · Accompagnement 30 jours inclus</p>
          <div className="ldemo-cta-btns">
            <Link to="/contact" className="ldemo-btn-main">Tester gratuitement →</Link>
            <Link to="/collaborateurs-ia" className="ldemo-btn-ghost">Voir tous les collaborateurs IA</Link>
          </div>
        </div>
      </section>
    </>
  )
}
