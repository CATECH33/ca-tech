import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Automatisations.css'

/* ══════════════════════════════════════════════════════════
   LOGOS SVG (inline — représentations brand)
══════════════════════════════════════════════════════════ */
const L = {
  'google-workspace': (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M24 20v7h11c-.5 2.5-2 4.7-4.2 6.1l6.6 5.1C41 34.6 43 29.7 43 24c0-1.4-.1-2.8-.4-4H24z" fill="#4285F4"/>
      <path d="M11.5 28.1l-1.5 1.2L4.3 33C7.5 39.3 15.2 43.5 24 43.5c5.6 0 10.3-1.9 13.8-5.1l-6.6-5.1c-1.9 1.3-4.3 2-7.2 2-5.5 0-10.2-3.7-11.9-8.7l-.6.5z" fill="#34A853"/>
      <path d="M4.3 15C3 17.6 2.5 20.6 2.5 24s.5 6.4 1.8 9l7.2-5.6c-.4-1.3-.6-2.5-.6-3.9s.2-2.6.6-3.9L4.3 15z" fill="#FBBC05"/>
      <path d="M24 10.5c3.1 0 5.9 1.1 8.1 3.2l6.1-6.1C34.5 4.2 29.6 2.5 24 2.5 15.2 2.5 7.5 6.7 4.3 13l7.2 5.6C13 13.8 18 10.5 24 10.5z" fill="#EA4335"/>
    </svg>
  ),
  'microsoft-365': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3"  width="19" height="19" rx="2" fill="#F25022"/>
      <rect x="26" y="3" width="19" height="19" rx="2" fill="#7FBA00"/>
      <rect x="3" y="26" width="19" height="19" rx="2" fill="#00A4EF"/>
      <rect x="26" y="26" width="19" height="19" rx="2" fill="#FFB900"/>
    </svg>
  ),
  'whatsapp': (
    <svg viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#25D366"/>
      <path d="M34.5 28.1c-.6-.3-3.4-1.7-4-1.9-.5-.2-.9-.3-1.3.3-.4.6-1.7 1.9-2.1 2.2-.4.4-.7.4-1.3.1-.6-.3-2.5-.9-4.7-2.9-1.7-1.6-2.9-3.5-3.2-4.1-.4-.6 0-.9.3-1.2l.8-.9c.2-.3.3-.6.5-1 .2-.3.1-.6-.1-.9-.2-.3-1.3-3.2-1.8-4.3-.5-1.1-1-.9-1.4-.9h-1.1c-.4 0-.9.1-1.4.7-.5.6-1.9 1.8-1.9 4.5s2 5.2 2.2 5.6c.2.4 3.8 5.8 9.2 8.1 1.3.6 2.3.9 3.1 1.1 1.3.4 2.5.3 3.4.2 1-.1 3.2-1.3 3.7-2.7.5-1.3.5-2.4.3-2.6z" fill="white"/>
    </svg>
  ),
  'slack': (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M17 29.5A3.5 3.5 0 0113.5 26V14a3.5 3.5 0 017 0v12a3.5 3.5 0 01-3.5 3.5z" fill="#E01E5A"/>
      <path d="M31 34.5A3.5 3.5 0 0127.5 31V19a3.5 3.5 0 017 0v12a3.5 3.5 0 01-3.5 3.5z" fill="#36C5F0"/>
      <path d="M20 34.5a3.5 3.5 0 01-3.5-3.5v-3.5H24a3.5 3.5 0 010 7H20z" fill="#2EB67D"/>
      <path d="M21.5 17A3.5 3.5 0 0125 13.5h3.5V17A3.5 3.5 0 0121.5 17z" fill="#ECB22E"/>
      <path d="M28 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" fill="#2EB67D"/>
      <path d="M17 41.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" fill="#ECB22E"/>
      <path d="M12.5 20.5H9a3.5 3.5 0 000 7h3.5v-7z" fill="#E01E5A"/>
      <path d="M27.5 27.5H31a3.5 3.5 0 000-7h-3.5v7z" fill="#36C5F0"/>
    </svg>
  ),
  'hubspot': (
    <svg viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#FF7A59"/>
      <circle cx="31" cy="17" r="5" fill="white"/>
      <circle cx="31" cy="17" r="2.5" fill="#FF7A59"/>
      <path d="M26 17h-8v3h8v-3z" fill="white"/>
      <circle cx="18" cy="24" r="8" fill="white"/>
      <circle cx="18" cy="24" r="4" fill="#FF7A59"/>
    </svg>
  ),
  'notion': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="6" fill="#191919"/>
      <path d="M14 12h16l8 10v14H34V22l-8-8H14V12z" fill="white"/>
      <rect x="14" y="12" width="3" height="22" fill="#191919"/>
      <rect x="14" y="32" width="20" height="2" fill="white"/>
    </svg>
  ),
  'stripe': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#635BFF"/>
      <path d="M22 18c0-1.3 1.1-1.8 2.8-1.8 2.5 0 5.6.8 8 2V11c-2.6-1.4-5.3-2-8-2-6.4 0-10.7 3.3-10.7 9 0 8.7 12 7.3 12 11 0 1.5-1.4 2-3.2 2-2.7 0-6.1-1.1-8.8-2.6v6.7c3 1.3 6 1.8 8.8 1.8 6.5 0 11-3.2 11-8.8C33.9 19.3 22 21 22 18z" fill="white"/>
    </svg>
  ),
  'meta': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#0082FB"/>
      <path d="M10 30c0 2.8 1.8 5 4.2 5S18 32.8 18 30V23c0-2.8-1.8-5-3.8-5S10 20.2 10 23v7zm3-7c0-1.5.8-2.5 1.8-2.5S17 21.5 17 23v7c0 1.5-.8 2.5-1.8 2.5S13 31.5 13 30v-7z" fill="white"/>
      <path d="M24 18c0-2.8 1.9-5 4.3-5 1.8 0 3.4 1.1 4.1 2.7.7-1.7 2.3-2.7 4.1-2.7v3c-1.4 0-2 1-2 2.5v8.5h-3V22c0-1.4-.8-2.5-2-2.5S27 20.6 27 22v7c0 2.8-1.9 5-4.3 5S18 31.7 18 29v-5h3v5c0 1.4.8 2.5 2 2.5s2-1.1 2-2.5V18z" fill="white"/>
    </svg>
  ),
  'linkedin': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="8" fill="#0A66C2"/>
      <rect x="10" y="19" width="7" height="19" fill="white"/>
      <circle cx="13.5" cy="13.5" r="4" fill="white"/>
      <path d="M26 26.5c0-2 1.4-3.5 3.5-3.5S33 24.5 33 26.5V38h7V25.5c0-5.5-3.5-8.5-8-8.5-2.5 0-4.5 1-6 2.8V17h-7v21h7v-11.5z" fill="white"/>
    </svg>
  ),
  'calendly': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#006BFF"/>
      <rect x="10" y="17" width="28" height="22" rx="3" fill="white"/>
      <rect x="10" y="13" width="28" height="8" rx="3" fill="#4BA3FF"/>
      <path d="M19 30l3.5 3.5L30 26" stroke="#006BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'apify': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#00C2B2"/>
      <path d="M14 36L24 12l10 24H14z" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
      <line x1="17.5" y1="28" x2="30.5" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  'google-maps': (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M24 4C16.3 4 10 10.3 10 18c0 9.5 14 26 14 26s14-16.5 14-26c0-7.7-6.3-14-14-14z" fill="#EA4335"/>
      <circle cx="24" cy="18" r="6" fill="white"/>
      <circle cx="24" cy="18" r="3" fill="#EA4335"/>
      <ellipse cx="24" cy="42" rx="7" ry="2.5" fill="#34A853" opacity="0.4"/>
    </svg>
  ),
  'telegram': (
    <svg viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#2AABEE"/>
      <path d="M35.6 13.4L7.5 24.5c-1.9.8-1.9 1.9-.3 2.4l7 2.2 2.7 8.4c.3 1 .6 1.4 1.4 1.4.6 0 .9-.3 1.3-.7l3.1-3 6.4 4.7c1.2.7 2 .3 2.3-.9l4.2-19.8c.4-1.9-.7-2.8-2-2.2z" fill="white"/>
      <path d="M16.7 28.5l12.5-7.8L19.8 30.8l-.5 3.4-2.6-5.7z" fill="#CAE9F5"/>
    </svg>
  ),
  'discord': (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="3" y="3" width="42" height="42" rx="10" fill="#5865F2"/>
      <path d="M34 15.5A27 27 0 0027.4 13.5c-.3.5-.6 1.2-.8 1.8a25 25 0 00-6.8 0 16 16 0 00-.9-1.8 27 27 0 00-6.6 2c-4.1 6.2-5.2 12.2-4.7 18.1a27.5 27.5 0 008.3 4.2c.7-.9 1.3-2 1.8-3.1a17.6 17.6 0 01-2.8-1.4l.7-.5c5.4 2.5 11.2 2.5 16.4 0l.7.5c-.9.5-1.9 1-2.9 1.4.5 1.1 1.1 2.2 1.8 3.1a27.4 27.4 0 008.3-4.2c.7-7-1.1-13-4.9-18.1zM19.2 30c-1.5 0-2.7-1.4-2.7-3.1s1.2-3.1 2.7-3.1 2.8 1.4 2.7 3.1c0 1.7-1.2 3.1-2.7 3.1zm9.6 0c-1.5 0-2.7-1.4-2.7-3.1s1.2-3.1 2.7-3.1 2.8 1.4 2.7 3.1c0 1.7-1.2 3.1-2.7 3.1z" fill="white"/>
    </svg>
  ),
}

/* ══════════════════════════════════════════════════════════
   DONNÉES — 14 INTÉGRATIONS
══════════════════════════════════════════════════════════ */
const INTEGRATIONS = [
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    category: 'google',
    color: '#4285F4',
    desc: 'Gmail, Drive, Sheets, Calendar et Forms connectés à l\'ensemble de vos outils métier.',
    useCases: [
      'Email entrant → Lead CRM + réponse automatique',
      'Formulaire → Fiche Sheets + alerte Slack',
      'Fichier Drive → Classement IA + notification équipe',
    ],
    timeSaved: '−8h / semaine',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    category: 'microsoft',
    color: '#0078D4',
    desc: 'Outlook, Teams, OneDrive et SharePoint intégrés dans vos workflows métier sans effort.',
    useCases: [
      'Email Outlook → Lead CRM + alerte Teams',
      'Réunion Teams → Compte-rendu auto Notion',
      'Fichier OneDrive → Classement et archivage auto',
    ],
    timeSaved: '−6h / semaine',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'communication',
    color: '#25D366',
    desc: 'Transformez chaque message WhatsApp en lead qualifié et gérez le support client 24/7.',
    useCases: [
      'Message entrant → Ticket support + assignation',
      'Prospect → CRM + email de bienvenue immédiat',
      'Commande → Confirmation livraison automatique',
    ],
    timeSaved: '−4h / semaine',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    color: '#4A154B',
    desc: 'Centralisez toutes vos alertes métier et notifications dans les bons canaux Slack.',
    useCases: [
      'Nouveau lead → Alerte canal #commercial en temps réel',
      'Paiement reçu → Notification automatique #finance',
      'Rapport 18h → Résumé quotidien dans votre canal',
    ],
    timeSaved: '−3h / semaine',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    color: '#FF7A59',
    desc: 'Synchronisez votre pipeline HubSpot avec tous vos outils marketing et de communication.',
    useCases: [
      'Deal → étape → Alerte Slack + tâche calendrier auto',
      'Formulaire site → Séquence email HubSpot déclenchée',
      'Contact enrichi → Campagne personnalisée lancée',
    ],
    timeSaved: '−5h / semaine',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'outils',
    color: '#191919',
    desc: 'Notion devient le hub central de vos projets — alimenté automatiquement par vos autres outils.',
    useCases: [
      'Nouveau client signé → Espace Notion dédié créé',
      'Tâche terminée → Base de données mise à jour',
      'RDV Calendly → Note de réunion ajoutée auto',
    ],
    timeSaved: '−3h / semaine',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'finance',
    color: '#635BFF',
    desc: 'Automatisez tout votre cycle de paiement — de la confirmation à la relance d\'impayés.',
    useCases: [
      'Paiement confirmé → Facture PDF envoyée automatiquement',
      'Abonnement créé → CRM mis à jour + email client',
      'Échec paiement → Séquence de relance déclenchée',
    ],
    timeSaved: 'Instantané',
  },
  {
    id: 'meta',
    name: 'Meta (Facebook & Instagram)',
    category: 'crm',
    color: '#0082FB',
    desc: 'Connectez vos publicités et pages Meta à votre CRM pour capturer chaque lead instantanément.',
    useCases: [
      'Lead Ad → CRM + email de bienvenue immédiat',
      'Commentaire → Réponse automatique personnalisée',
      'DM entrant → Ticket support créé et assigné',
    ],
    timeSaved: '−4h / semaine',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'crm',
    color: '#0A66C2',
    desc: 'Extrayez, enrichissez et contactez vos prospects LinkedIn en pilote automatique.',
    useCases: [
      'Nouveau contact → Séquence email 7 jours déclenchée',
      'Profil ciblé → Ajout CRM + enrichissement données',
      'Post publié → Partage multicanal automatique',
    ],
    timeSaved: '−5h / semaine',
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'outils',
    color: '#006BFF',
    desc: 'Transformez chaque rendez-vous Calendly en opportunité commerciale qualifiée.',
    useCases: [
      'RDV pris → Lead CRM + séquence pré-RDV',
      'RDV confirmé → Rappel email et SMS automatique',
      'Après RDV → Email de suivi + proposition envoyée',
    ],
    timeSaved: '−2h / semaine',
  },
  {
    id: 'apify',
    name: 'Apify',
    category: 'outils',
    color: '#00C2B2',
    desc: 'Scrapez n\'importe quelle source web et alimentez votre pipeline commercial automatiquement.',
    useCases: [
      'Scraping LinkedIn → Prospects qualifiés → CRM',
      'Google Maps → Établissements → Prospection locale',
      'Veille concurrentielle → Rapport hebdo automatique',
    ],
    timeSaved: '−10h / semaine',
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    category: 'google',
    color: '#EA4335',
    desc: 'Extrayez des milliers de leads locaux qualifiés depuis Google Maps automatiquement.',
    useCases: [
      'Secteur ciblé → Liste prospects + emails extraits',
      'Établissement → Fiche CRM enrichie automatiquement',
      'Zone géo → Campagne de prospection ciblée lancée',
    ],
    timeSaved: '−8h / semaine',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'communication',
    color: '#2AABEE',
    desc: 'Recevez toutes vos alertes métier critiques en temps réel via un bot Telegram dédié.',
    useCases: [
      'Nouveau lead → Notification instantanée sur votre bot',
      'Paiement reçu → Alerte avec détails de la transaction',
      'Rapport 18h → Résumé quotidien de vos KPIs',
    ],
    timeSaved: '−2h / semaine',
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    color: '#5865F2',
    desc: 'Pilotez vos opérations et communauté depuis Discord avec des bots métier sur mesure.',
    useCases: [
      'Nouvelle commande → Alerte canal #ventes auto',
      'Ticket support → Thread Discord dédié créé',
      'KPI hebdo → Rapport automatique dans #reporting',
    ],
    timeSaved: '−2h / semaine',
  },
]

const CATEGORIES = [
  { key: 'tous',          label: 'Toutes' },
  { key: 'google',        label: 'Google' },
  { key: 'microsoft',     label: 'Microsoft' },
  { key: 'communication', label: 'Communication' },
  { key: 'crm',          label: 'CRM & Sales' },
  { key: 'finance',       label: 'Finance' },
  { key: 'outils',        label: 'Outils' },
]

const CAT_COLORS = {
  google:        { bg: 'rgba(66,133,244,.1)',  color: '#4285F4' },
  microsoft:     { bg: 'rgba(0,120,212,.1)',   color: '#0078D4' },
  communication: { bg: 'rgba(37,211,102,.1)',  color: '#18A050' },
  crm:           { bg: 'rgba(255,122,89,.1)',  color: '#D95A30' },
  finance:       { bg: 'rgba(99,91,255,.1)',   color: '#635BFF' },
  outils:        { bg: 'rgba(0,107,255,.1)',   color: '#006BFF' },
}

export default function Automatisations() {
  const [active, setActive] = useState('tous')

  const visible = useMemo(
    () => active === 'tous' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === active),
    [active]
  )

  useEffect(() => {
    /* ── Canvas particles ── */
    const cv = document.getElementById('atCanvas')
    let animId
    if (cv) {
      const cx = cv.getContext('2d')
      let W, H, pts = []
      const N = 55, LK = 115
      function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight }
      window.addEventListener('resize', resize, { passive: true })
      resize()
      function r(a, b) { return a + Math.random() * (b - a) }
      for (let i = 0; i < N; i++) pts.push({ x: r(0, W), y: r(0, H), vx: r(-.22, .22), vy: r(-.22, .22), s: r(.9, 1.8) })
      function frame() {
        cx.clearRect(0, 0, W, H)
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
          cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
          cx.fillStyle = 'rgba(0,102,255,.45)'; cx.fill()
        })
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < LK) {
            cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y)
            cx.strokeStyle = `rgba(0,102,255,${.09 * (1 - d / LK)})`; cx.lineWidth = 1; cx.stroke()
          }
        }
        animId = requestAnimationFrame(frame)
      }
      frame()
    }

    /* ── Halo parallax ── */
    const h1 = document.getElementById('halo1'), h2 = document.getElementById('halo2'), h3 = document.getElementById('halo3')
    let t1x=0,t1y=0,t2x=0,t2y=0,t3x=0,t3y=0,c1x=0,c1y=0,c2x=0,c2y=0,c3x=0,c3y=0,hRaf=null
    function lerp(a, b, t) { return a + (b - a) * t }
    function hTick() {
      hRaf = null
      c1x=lerp(c1x,t1x,.06);c1y=lerp(c1y,t1y,.06)
      c2x=lerp(c2x,t2x,.04);c2y=lerp(c2y,t2y,.04)
      c3x=lerp(c3x,t3x,.05);c3y=lerp(c3y,t3y,.05)
      if(h1)h1.style.transform=`translate(${c1x}px,${c1y}px)`
      if(h2)h2.style.transform=`translate(${c2x}px,${c2y}px)`
      if(h3)h3.style.transform=`translate(${c3x}px,${c3y}px)`
      if(Math.abs(c1x-t1x)>.4)hRaf=requestAnimationFrame(hTick)
    }
    function onMouseMove(e) {
      const mx=(e.clientX/window.innerWidth-.5)*2,my=(e.clientY/window.innerHeight-.5)*2
      t1x=mx*-26;t1y=my*-16;t2x=mx*16;t2y=my*12;t3x=mx*-12;t3y=my*-20
      if(!hRaf)hRaf=requestAnimationFrame(hTick)
    }
    if(h1)window.addEventListener('mousemove',onMouseMove,{passive:true})

    /* ── Scroll reveal ── */
    const revEls = document.querySelectorAll('.at-reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.08 })
    revEls.forEach(el => obs.observe(el))

    return () => {
      if (animId) cancelAnimationFrame(animId)
      if (hRaf) cancelAnimationFrame(hRaf)
      if (h1) window.removeEventListener('mousemove', onMouseMove)
      obs.disconnect()
    }
  }, [])

  return (
    <>
      {/* ════════════════════════════════ HERO */}
      <section className="at-hero">
        <canvas className="at-canvas" id="atCanvas" aria-hidden="true" />
        <div className="at-grid-bg" aria-hidden="true" />
        <div className="at-halo at-halo-1" id="halo1" aria-hidden="true" />
        <div className="at-halo at-halo-2" id="halo2" aria-hidden="true" />
        <div className="at-halo at-halo-3" id="halo3" aria-hidden="true" />

        <div className="at-hero-inner">
          <p className="at-kicker at-a0"><span />Bibliothèque d'intégrations · CA-TECH<span /></p>
          <h1 className="at-a1">
            Connectez vos outils.<br />
            <em>Automatisez vos processus.</em>
          </h1>
          <p className="at-hero-sub at-a2">
            14 intégrations prêtes à déployer. De Google Workspace à Discord — vos outils travaillent ensemble en 48h, sans code, sans formation.
          </p>

          <div className="at-stats at-a3">
            <div>
              <div className="at-stat-val">14<em>+</em></div>
              <div className="at-stat-lbl">Intégrations</div>
            </div>
            <div>
              <div className="at-stat-val">200<em>+</em></div>
              <div className="at-stat-lbl">Workflows</div>
            </div>
            <div>
              <div className="at-stat-val">48<em>h</em></div>
              <div className="at-stat-lbl">Déploiement</div>
            </div>
            <div>
              <div className="at-stat-val">15<em>h</em></div>
              <div className="at-stat-lbl">Récupérées / semaine</div>
            </div>
          </div>

          <div className="at-hero-ctas at-a4">
            <a
              href="#integrations"
              className="btn-primary"
              onClick={e => { e.preventDefault(); document.getElementById('integrations')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Explorer les intégrations →
            </a>
            <Link to="/contact" className="btn-outline">Demander une démo</Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ CATALOGUE */}
      <section className="at-int-section" id="integrations">
        <div className="at-int-inner">

          <div className="at-int-header at-reveal">
            <p className="at-int-label">Bibliothèque d'intégrations</p>
            <h2 className="at-int-title">Vos outils, <em>connectés.</em></h2>
            <p className="at-int-desc">
              Sélectionnez une intégration pour découvrir les workflows disponibles et le temps que vous récupérez dès la première semaine.
            </p>
          </div>

          {/* Filter bar */}
          <div className="at-int-filters">
            <div className="at-int-filters-inner">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  className={`at-int-filter-btn${active === c.key ? ' at-int-filter-btn--active' : ''}`}
                  onClick={() => setActive(c.key)}
                >
                  {c.label}
                </button>
              ))}
              <span className="at-int-count">
                {visible.length} intégration{visible.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="at-int-grid">
            {visible.map(int => {
              const catStyle = CAT_COLORS[int.category] || { bg: 'rgba(0,0,0,.06)', color: '#374151' }
              return (
                <article key={int.id} className="at-int-card at-reveal">

                  {/* Header: logo + name + cat */}
                  <div className="at-int-card-header">
                    <div className="at-int-logo" style={{ borderColor: int.color + '30' }}>
                      {L[int.id]}
                    </div>
                    <div className="at-int-card-meta">
                      <h3 className="at-int-name">{int.name}</h3>
                      <span
                        className="at-int-cat"
                        style={{ background: catStyle.bg, color: catStyle.color }}
                      >
                        {CATEGORIES.find(c => c.key === int.category)?.label}
                      </span>
                    </div>
                  </div>

                  <p className="at-int-desc-text">{int.desc}</p>

                  <div className="at-int-divider" />

                  {/* Use cases */}
                  <p className="at-int-uses-label">Cas d'usage</p>
                  <ul className="at-int-uses">
                    {int.useCases.map(uc => (
                      <li key={uc}>
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8l3 3 7-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {uc}
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="at-int-footer">
                    <div className="at-int-time">
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {int.timeSaved}
                    </div>
                    <Link to="/contact" className="at-int-btn" style={{ '--int-color': int.color }}>
                      Voir le workflow
                      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ POURQUOI */}
      <section className="at-why-section">
        <div className="at-why-inner">
          <div className="at-sec-head at-reveal">
            <p className="at-sec-label">Notre différence</p>
            <h2 className="at-sec-h">Ce que vous obtenez <em>concrètement.</em></h2>
          </div>
          <div className="at-why-grid">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Opérationnel en 48h', desc: 'Vous récupérez du temps dans les 2 jours. Pas dans 2 mois. Pas après une formation interminable.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>, title: 'Adapté à votre métier', desc: 'Vos outils, votre secteur, vos habitudes. On s\'adapte à vous — pas l\'inverse. Aucune solution générique.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>, title: 'Accompagnement inclus', desc: 'On configure, on monitore, on corrige. Si quelque chose déraille, on intervient sous 4h — avant même que vous le remarquiez.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, title: 'Rentable dès le 1er mois', desc: '15 heures récupérées par semaine. Des relances automatiques. Des factures envoyées seules. Visible avant la fin du mois.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="at-why-card at-reveal">
                <div className="at-why-icon">{icon}</div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ CTA */}
      <section className="at-cta">
        <div className="at-cta-inner at-reveal">
          <p className="at-cta-kicker">Passez à l'action</p>
          <h2>Récupérez <strong>15 heures cette semaine.</strong></h2>
          <p>Dites-nous quels outils vous utilisez. On connecte tout — opérationnel en 48h, résultats visibles ce mois-ci.</p>
          <div className="at-cta-btns">
            <Link to="/contact" className="btn-cta-white">Demander une démonstration gratuite →</Link>
            <a
              href="#integrations"
              className="btn-cta-outline"
              onClick={e => { e.preventDefault(); document.getElementById('integrations')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Revoir les intégrations
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
