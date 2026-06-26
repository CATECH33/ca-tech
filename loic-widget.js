/**
 * Loïc — Assistant commercial CA-TECH
 * Widget de chat flottant autonome
 */
;(function () {
  'use strict'

  // ── Config ─────────────────────────────────────────────────────
  var FN_URL  = 'https://jhcyooksjeivajdjicka.supabase.co/functions/v1/loic-chat'
  var BRAND   = '#0066FF'
  var DARK    = '#0A2540'
  var WELCOME = 'Bonjour ! Je suis Loïc, le conseiller commercial de CA-TECH 👋\n\nJe peux vous présenter nos services, calculer un devis gratuit et répondre à toutes vos questions.\n\nComment puis-je vous aider ?'

  // ── Demo mode responses (fallback si API indisponible) ──────────
  var DEMO_RESPONSES = [
    'Bien sûr ! CA-TECH propose : création de sites vitrines (à partir de 590€), sites e-commerce (à partir de 1 090€), logos et identités visuelles (à partir de 180€) et des solutions IA sur mesure.\n\nQuel type de projet vous intéresse ?',
    'Pour vous faire une estimation précise, j\'ai besoin de quelques informations. Quel est votre projet ? (site vitrine, e-commerce, logo, application...)',
    'Très bien ! Nos délais moyens : 2 à 3 semaines pour un site vitrine, 4 à 6 semaines pour un e-commerce. Nous travaillons en méthode agile avec validation à chaque étape.\n\nVoulez-vous qu\'on planifie un appel découverte gratuit de 30 minutes ?',
    'Je transmets votre demande à notre équipe. Vous pouvez aussi nous contacter directement :\n• Email : contact@ca-tech.fr\n• Tél : +33 7 75 66 49 75\n\nNous répondons sous 24h !',
  ]
  var demoIdx = 0

  // ── State ──────────────────────────────────────────────────────
  var isOpen   = false
  var convId   = null
  var msgs     = []
  var meta     = { source: 'widget' }
  var isTyping = false
  var leadDone = false
  var unread   = 0
  var demoMode = false

  try { convId = sessionStorage.getItem('loic_conv') || null } catch(e) {}

  // ── SVG Icons ──────────────────────────────────────────────────
  var IC_BOT   = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/><path d="M5 14v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>'
  var IC_CHAT  = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  var IC_CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  var IC_SEND  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
  var IC_CAL   = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  var IC_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'

  // ── CSS ────────────────────────────────────────────────────────
  var CSS = [
    '#loic-btn{position:fixed!important;bottom:24px!important;right:24px!important;z-index:2147483646!important;',
    'width:60px!important;height:60px!important;border-radius:50%!important;background:'+BRAND+'!important;border:none!important;cursor:pointer!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;',
    'box-shadow:0 8px 30px rgba(0,102,255,.35)!important;',
    'transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s!important;',
    'animation:loic-pulse 3s ease-in-out 3s infinite!important;}',

    '#loic-btn:hover{transform:scale(1.09)!important;box-shadow:0 12px 40px rgba(0,102,255,.45)!important;}',
    '#loic-btn.loic-open{animation:none!important;background:'+DARK+'!important;}',

    '#loic-badge{position:absolute!important;top:-3px!important;right:-3px!important;background:#EF4444!important;color:#fff!important;',
    'font-size:10px!important;font-weight:700!important;min-width:18px!important;height:18px!important;border-radius:9px!important;padding:0 4px!important;',
    'display:none;align-items:center!important;justify-content:center!important;border:2px solid #fff!important;',
    'font-family:Inter,-apple-system,sans-serif!important;}',

    '@keyframes loic-pulse{0%,100%{box-shadow:0 8px 30px rgba(0,102,255,.35);}',
    '50%{box-shadow:0 8px 48px rgba(0,102,255,.6),0 0 0 10px rgba(0,102,255,.07);}}',

    '#loic-panel{position:fixed!important;bottom:96px!important;right:24px!important;z-index:2147483645!important;',
    'width:380px!important;height:560px!important;background:#fff!important;border-radius:20px!important;',
    'box-shadow:0 24px 80px rgba(0,0,0,.16),0 4px 16px rgba(0,0,0,.07)!important;',
    'display:flex!important;flex-direction:column!important;overflow:hidden!important;',
    'transform:scale(.9) translateY(24px)!important;opacity:0!important;pointer-events:none!important;',
    'transition:transform .28s cubic-bezier(.34,1.56,.64,1),opacity .2s!important;',
    'transform-origin:bottom right!important;}',

    '#loic-panel.loic-open{transform:scale(1) translateY(0)!important;opacity:1!important;pointer-events:all!important;}',

    '#loic-hdr{background:linear-gradient(135deg,'+DARK+' 0%,'+BRAND+' 100%)!important;',
    'padding:14px 14px 12px!important;display:flex!important;align-items:center!important;gap:11px!important;flex-shrink:0!important;}',

    '#loic-av{width:42px!important;height:42px!important;border-radius:50%!important;background:rgba(255,255,255,.18)!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;flex-shrink:0!important;}',
    '#loic-av::after{content:""!important;position:absolute!important;bottom:1px!important;right:1px!important;',
    'width:11px!important;height:11px!important;background:#22C55E!important;border-radius:50%!important;border:2px solid rgba(10,37,64,.8)!important;}',

    '#loic-info{flex:1!important;min-width:0!important;}',
    '#loic-nm{color:#fff!important;font-size:14px!important;font-weight:600!important;font-family:Inter,-apple-system,sans-serif!important;}',
    '#loic-st{color:rgba(255,255,255,.65)!important;font-size:11px!important;margin-top:1px!important;font-family:Inter,-apple-system,sans-serif!important;}',

    '#loic-cls{width:30px!important;height:30px!important;border-radius:50%!important;border:none!important;cursor:pointer!important;color:rgba(255,255,255,.75)!important;',
    'background:rgba(255,255,255,.1)!important;display:flex!important;align-items:center!important;justify-content:center!important;',
    'transition:background .15s,color .15s!important;flex-shrink:0!important;}',
    '#loic-cls:hover{background:rgba(255,255,255,.2)!important;color:#fff!important;}',

    '#loic-msgs{flex:1!important;overflow-y:auto!important;padding:14px 14px 6px!important;display:flex!important;flex-direction:column!important;gap:2px!important;}',
    '#loic-msgs::-webkit-scrollbar{width:4px;}',
    '#loic-msgs::-webkit-scrollbar-track{background:transparent;}',
    '#loic-msgs::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:2px;}',

    '.lm{display:flex!important;gap:8px!important;align-items:flex-end!important;margin-bottom:6px!important;}',
    '.lm.lu{flex-direction:row-reverse!important;}',

    '.lb{max-width:76%!important;padding:9px 13px!important;border-radius:18px!important;font-size:13.5px!important;',
    'line-height:1.55!important;white-space:pre-wrap!important;font-family:Inter,-apple-system,sans-serif!important;',
    'word-break:break-word!important;}',
    '.lm.lb-w .lb{background:#F1F5F9!important;color:#0F172A!important;border-bottom-left-radius:4px!important;}',
    '.lm.lu .lb{background:'+BRAND+'!important;color:#fff!important;border-bottom-right-radius:4px!important;}',

    '.lav{width:28px!important;height:28px!important;border-radius:50%!important;background:'+BRAND+'!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;}',
    '.lt{font-size:10px!important;color:#94A3B8!important;margin-top:2px!important;padding:0 2px!important;',
    'font-family:Inter,-apple-system,sans-serif!important;}',
    '.lu .lt{text-align:right!important;}',

    '#loic-typing{display:none;gap:8px!important;align-items:flex-end!important;margin-bottom:6px!important;}',
    '.ltb{background:#F1F5F9!important;padding:12px 15px!important;border-radius:18px!important;',
    'border-bottom-left-radius:4px!important;display:flex!important;gap:5px!important;align-items:center!important;}',
    '.ld{width:7px!important;height:7px!important;border-radius:50%!important;background:#94A3B8!important;',
    'animation:loic-dot 1.3s infinite ease-in-out!important;}',
    '.ld:nth-child(2){animation-delay:.2s!important}.ld:nth-child(3){animation-delay:.4s!important}',
    '@keyframes loic-dot{0%,60%,100%{transform:translateY(0);opacity:.4;}30%{transform:translateY(-6px);opacity:1;}}',

    '.lq{background:linear-gradient(135deg,#EFF6FF,#EEF2FF)!important;border:1px solid #BFDBFE!important;',
    'border-radius:12px!important;padding:13px!important;margin:2px 36px 6px 0!important;}',
    '.lq-ttl{font-size:10px!important;font-weight:700!important;color:#3B82F6!important;text-transform:uppercase!important;',
    'letter-spacing:.6px!important;margin-bottom:8px!important;font-family:Inter,-apple-system,sans-serif!important;}',
    '.lq-row{display:flex!important;justify-content:space-between!important;font-size:12.5px!important;color:#1E40AF!important;',
    'padding:2px 0!important;font-family:Inter,-apple-system,sans-serif!important;}',
    '.lq-tot{border-top:1px solid #BFDBFE!important;margin-top:8px!important;padding-top:8px!important;',
    'display:flex!important;justify-content:space-between!important;font-size:14px!important;font-weight:700!important;',
    'color:'+BRAND+'!important;font-family:Inter,-apple-system,sans-serif!important;}',

    '.lcta{display:flex!important;align-items:center!important;gap:10px!important;background:#F8FAFC!important;',
    'border:1px solid #E2E8F0!important;border-radius:10px!important;padding:9px 12px!important;',
    'margin:2px 36px 6px 0!important;text-decoration:none!important;cursor:pointer!important;transition:background .15s!important;}',
    '.lcta:hover{background:#EFF6FF!important;border-color:#BFDBFE!important;}',
    '.lcta-ic{width:32px!important;height:32px!important;border-radius:8px!important;background:#EEF2FF!important;',
    'display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;color:'+BRAND+'!important;}',
    '.lcta-tx{font-size:12.5px!important;font-weight:500!important;color:#1E293B!important;font-family:Inter,-apple-system,sans-serif!important;}',
    '.lcta-sb{font-size:11px!important;color:#64748B!important;margin-top:1px!important;font-family:Inter,-apple-system,sans-serif!important;}',

    '.lloic-ok{display:flex!important;align-items:center!important;gap:8px!important;background:#F0FDF4!important;',
    'border:1px solid #BBF7D0!important;border-radius:10px!important;padding:9px 12px!important;',
    'margin:2px 36px 6px 0!important;font-size:12.5px!important;color:#15803D!important;',
    'font-family:Inter,-apple-system,sans-serif!important;}',

    '#loic-prog{padding:7px 14px 5px!important;border-top:1px solid #F1F5F9!important;',
    'background:#FAFAFA!important;flex-shrink:0!important;display:none;}',
    '#loic-prog-lbl{font-size:10px!important;color:#94A3B8!important;margin-bottom:4px!important;',
    'font-family:Inter,-apple-system,sans-serif!important;display:flex!important;justify-content:space-between!important;}',
    '#loic-prog-bar{display:flex!important;gap:3px!important;}',
    '.lpb{height:3px!important;flex:1!important;border-radius:2px!important;background:#E2E8F0!important;transition:background .4s!important;}',
    '.lpb.done{background:'+BRAND+'!important;}',

    '#loic-inp-area{padding:10px 12px 12px!important;border-top:1px solid #F1F5F9!important;',
    'flex-shrink:0!important;display:flex!important;gap:8px!important;align-items:flex-end!important;background:#fff!important;}',

    '#loic-inp{flex:1!important;border:1.5px solid #E2E8F0!important;border-radius:12px!important;',
    'padding:9px 13px!important;font-size:13.5px!important;color:#1E293B!important;resize:none!important;outline:none!important;',
    'line-height:1.45!important;min-height:44px!important;max-height:100px!important;font-family:Inter,-apple-system,sans-serif!important;',
    'transition:border-color .15s!important;background:#fff!important;}',
    '#loic-inp:focus{border-color:'+BRAND+'!important;}',
    '#loic-inp::placeholder{color:#94A3B8!important;}',

    '#loic-snd{width:42px!important;height:42px!important;border-radius:12px!important;border:none!important;background:'+BRAND+'!important;',
    'color:#fff!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;',
    'transition:background .15s,transform .1s!important;flex-shrink:0!important;}',
    '#loic-snd:hover{background:#0052CC!important;}',
    '#loic-snd:active{transform:scale(.94)!important;}',
    '#loic-snd:disabled{background:#E2E8F0!important;cursor:not-allowed!important;}',

    '#loic-ft{text-align:center!important;padding:4px 8px 6px!important;font-size:10px!important;color:#CBD5E1!important;',
    'flex-shrink:0!important;font-family:Inter,-apple-system,sans-serif!important;}',

    '@media(max-width:480px){',
    '#loic-panel{width:calc(100vw - 16px)!important;height:calc(100dvh - 88px)!important;',
    'bottom:78px!important;right:8px!important;border-radius:16px!important;}',
    '#loic-btn{bottom:14px!important;right:14px!important;}}',
  ].join('')

  // ── Helpers ────────────────────────────────────────────────────
  function fmtTime(ts) {
    var d = ts ? new Date(ts) : new Date()
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  function fmt(n) {
    return new Intl.NumberFormat('fr-FR').format(n) + '€'
  }

  // ── DOM Refs ───────────────────────────────────────────────────
  var btn, badge, panel, msgsEl, typingEl, progEl, inp, snd

  // ── Inject CSS ─────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('loic-styles')) return
    var s = document.createElement('style')
    s.id = 'loic-styles'
    s.textContent = CSS
    document.head.appendChild(s)
  }

  // ── Build DOM ──────────────────────────────────────────────────
  function buildDOM() {
    if (document.getElementById('loic-btn')) return

    // Button
    btn = document.createElement('button')
    btn.id = 'loic-btn'
    btn.setAttribute('aria-label', 'Ouvrir le chat')
    badge = document.createElement('span')
    badge.id = 'loic-badge'
    btn.innerHTML = IC_CHAT
    btn.appendChild(badge)

    // Panel
    panel = document.createElement('div')
    panel.id = 'loic-panel'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', 'Chat avec Loïc')
    panel.setAttribute('aria-hidden', 'true')

    // Header
    var hdr = document.createElement('div')
    hdr.id = 'loic-hdr'
    hdr.innerHTML = [
      '<div id="loic-av">', IC_BOT, '</div>',
      '<div id="loic-info">',
        '<div id="loic-nm">Loïc — CA-TECH</div>',
        '<div id="loic-st">● En ligne · Répond en quelques secondes</div>',
      '</div>',
      '<button id="loic-cls" aria-label="Fermer">', IC_CLOSE, '</button>',
    ].join('')

    // Messages
    msgsEl = document.createElement('div')
    msgsEl.id = 'loic-msgs'

    // Typing indicator
    typingEl = document.createElement('div')
    typingEl.id = 'loic-typing'
    typingEl.innerHTML = [
      '<div class="lav" style="width:28px;height:28px">',
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
          '<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>',
          '<path d="M5 14v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/>',
          '<circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
        '</svg>',
      '</div>',
      '<div class="ltb"><div class="ld"></div><div class="ld"></div><div class="ld"></div></div>',
    ].join('')

    // Progress bar
    progEl = document.createElement('div')
    progEl.id = 'loic-prog'
    progEl.innerHTML = [
      '<div id="loic-prog-lbl"><span>Qualification</span><span id="loic-prog-cnt">0/6</span></div>',
      '<div id="loic-prog-bar">',
        ['Nom', 'Email', 'Tél.', 'Entreprise', 'Projet', 'Budget'].map(function(l) {
          return '<div class="lpb" title="' + l + '"></div>'
        }).join(''),
      '</div>',
    ].join('')

    // Input area
    inp = document.createElement('textarea')
    inp.id = 'loic-inp'
    inp.placeholder = 'Écrire un message… (Entrée pour envoyer)'
    inp.rows = 1

    snd = document.createElement('button')
    snd.id = 'loic-snd'
    snd.setAttribute('aria-label', 'Envoyer')
    snd.innerHTML = IC_SEND
    snd.disabled = true

    var inpArea = document.createElement('div')
    inpArea.id = 'loic-inp-area'
    inpArea.appendChild(inp)
    inpArea.appendChild(snd)

    var ft = document.createElement('div')
    ft.id = 'loic-ft'
    ft.textContent = 'Propulsé par CA-TECH · IA Loïc'

    panel.appendChild(hdr)
    panel.appendChild(msgsEl)
    panel.appendChild(typingEl)
    panel.appendChild(progEl)
    panel.appendChild(inpArea)
    panel.appendChild(ft)

    document.body.appendChild(btn)
    document.body.appendChild(panel)

    // Events
    btn.addEventListener('click', toggle)
    panel.querySelector('#loic-cls').addEventListener('click', closePanel)
    snd.addEventListener('click', sendMsg)
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() }
    })
    inp.addEventListener('input', function() {
      snd.disabled = !inp.value.trim()
      this.style.height = 'auto'
      this.style.height = Math.min(this.scrollHeight, 96) + 'px'
    })

  }

  // ── Render ─────────────────────────────────────────────────────
  function addBubble(role, content, timestamp, action) {
    var isBot = role === 'assistant'
    var wrap = document.createElement('div')
    wrap.className = 'lm ' + (isBot ? 'lb-w' : 'lu')

    if (isBot) {
      var av = document.createElement('div')
      av.className = 'lav'
      av.style.cssText = 'width:28px;height:28px;flex-shrink:0'
      av.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/><path d="M5 14v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>'
      wrap.appendChild(av)
    }

    var col = document.createElement('div')
    col.style.cssText = 'display:flex;flex-direction:column;max-width:76%;' + (!isBot ? 'align-items:flex-end' : '')

    var bub = document.createElement('div')
    bub.className = 'lb'
    bub.textContent = content
    col.appendChild(bub)

    // Action cards
    if (action) {
      if (action.type === 'show_quote' && action.items) {
        var qc = document.createElement('div')
        qc.className = 'lq'
        var rows = action.items.map(function(it) {
          return '<div class="lq-row"><span>' + it.service + '</span><span>' + fmt(it.prix) + '</span></div>'
        }).join('')
        qc.innerHTML = '<div class="lq-ttl">📊 Estimation de devis</div>' + rows +
          '<div class="lq-tot"><span>Total TTC</span><span>' + fmt(action.total_ttc || 0) + '</span></div>'
        col.appendChild(qc)
      }

      if (action.type === 'propose_appointment') {
        var cta = document.createElement('a')
        cta.className = 'lcta'
        cta.href = 'https://ca-tech.fr/#contact'
        cta.innerHTML = '<div class="lcta-ic">' + IC_CAL + '</div><div><div class="lcta-tx">Prendre un rendez-vous</div><div class="lcta-sb">Appel découverte gratuit · 30 min</div></div>'
        col.appendChild(cta)
      }

      if (action.type === 'create_lead' || action.type === 'escalate') {
        var ok = document.createElement('div')
        ok.className = 'lloic-ok'
        ok.innerHTML = IC_CHECK + (action.type === 'create_lead'
          ? ' Dossier enregistré — notre équipe vous contacte sous 24h'
          : " Demande transmise à l'équipe CA-TECH")
        col.appendChild(ok)
      }
    }

    var ts = document.createElement('div')
    ts.className = 'lt'
    ts.textContent = fmtTime(timestamp)
    col.appendChild(ts)

    wrap.appendChild(col)
    msgsEl.appendChild(wrap)
    scrollBottom()
  }

  function scrollBottom() {
    setTimeout(function() { msgsEl.scrollTop = msgsEl.scrollHeight }, 30)
  }

  function showTyping() {
    isTyping = true
    typingEl.style.display = 'flex'
    scrollBottom()
    snd.disabled = true
  }

  function hideTyping() {
    isTyping = false
    typingEl.style.display = 'none'
    snd.disabled = !inp.value.trim()
  }

  function updateProgress() {
    var fields = [
      !!(meta.prenom || meta.nom),
      !!meta.email,
      !!meta.telephone,
      !!meta.entreprise,
      !!meta.projet,
      meta.budget !== undefined,
    ]
    var count = fields.filter(Boolean).length
    if (count === 0) { progEl.style.display = 'none'; return }
    progEl.style.display = 'block'
    var cnt = document.getElementById('loic-prog-cnt')
    if (cnt) cnt.textContent = count + '/6'
    var bars = progEl.querySelectorAll('.lpb')
    bars.forEach(function(b, i) { b.className = 'lpb' + (fields[i] ? ' done' : '') })
  }

  function showBadge(n) {
    if (!badge) return
    if (n > 0) {
      badge.textContent = n > 9 ? '9+' : String(n)
      badge.style.display = 'flex'
    } else {
      badge.style.display = 'none'
    }
  }

  // ── Toggle ─────────────────────────────────────────────────────
  function toggle() { isOpen ? closePanel() : openPanel() }

  function openPanel() {
    isOpen = true
    btn.classList.add('loic-open')
    btn.innerHTML = IC_CLOSE
    btn.appendChild(badge)
    panel.classList.add('loic-open')
    panel.setAttribute('aria-hidden', 'false')
    unread = 0
    showBadge(0)
    if (msgs.length === 0) startChat()
    else setTimeout(function() { inp.focus() }, 300)
  }

  function closePanel() {
    isOpen = false
    btn.classList.remove('loic-open')
    btn.innerHTML = IC_CHAT
    btn.appendChild(badge)
    panel.classList.remove('loic-open')
    panel.setAttribute('aria-hidden', 'true')
  }

  // ── Chat ────────────────────────────────────────────────────────
  function startChat() {
    var welcomeMsg = { role: 'assistant', content: WELCOME, timestamp: new Date().toISOString() }
    msgs.push(welcomeMsg)
    addBubble('assistant', WELCOME, welcomeMsg.timestamp, null)
    setTimeout(function() { inp.focus() }, 400)
  }

  function demoReply() {
    var reply = DEMO_RESPONSES[demoIdx % DEMO_RESPONSES.length]
    demoIdx++
    return reply
  }

  function sendMsg() {
    var text = inp.value.trim()
    if (!text || isTyping) return

    var userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    msgs.push(userMsg)
    addBubble('user', text, userMsg.timestamp, null)
    inp.value = ''
    inp.style.height = 'auto'
    snd.disabled = true
    showTyping()

    if (demoMode) {
      setTimeout(function() {
        hideTyping()
        var reply = demoReply()
        var botMsg = { role: 'assistant', content: reply, timestamp: new Date().toISOString(), action: null }
        msgs.push(botMsg)
        addBubble('assistant', reply, botMsg.timestamp, null)
        if (!isOpen) { unread++; showBadge(unread) }
      }, 900 + Math.random() * 600)
      return
    }

    var apiMsgs = msgs
      .filter(function(m) { return m.role !== 'system' })
      .map(function(m) { return { role: m.role, content: m.content } })

    fetch(FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMsgs, metadata: meta, conversation_id: convId }),
    })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return r.json()
    })
    .then(function(data) {
      hideTyping()
      if (data.error) throw new Error(data.error)

      var botMsg = {
        role: 'assistant',
        content: data.message || '',
        timestamp: new Date().toISOString(),
        action: data.action || null,
      }
      msgs.push(botMsg)
      addBubble('assistant', botMsg.content, botMsg.timestamp, botMsg.action)

      if (data.conversation_id && !convId) {
        convId = data.conversation_id
        try { sessionStorage.setItem('loic_conv', convId) } catch(e) {}
      }

      if (data.action) {
        var a = data.action
        if (a.type === 'create_lead' && a.data) {
          meta = Object.assign({}, meta, a.data, { lead_created: true })
          leadDone = true
        }
        if (a.type === 'escalate') meta.escalated = true
        if (a.data) {
          var d = a.data
          if (d.prenom)   meta.prenom    = d.prenom
          if (d.nom)      meta.nom       = d.nom
          if (d.email)    meta.email     = d.email
          if (d.telephone) meta.telephone = d.telephone
          if (d.entreprise) meta.entreprise = d.entreprise
          if (d.projet)   meta.projet    = d.projet
          if (d.budget !== undefined) meta.budget = d.budget
        }
      }

      updateProgress()
      if (!isOpen) { unread++; showBadge(unread) }
    })
    .catch(function(err) {
      hideTyping()
      console.warn('[Loïc] API indisponible, passage en mode démo :', err.message)
      demoMode = true
      var reply = demoReply()
      var botMsg = { role: 'assistant', content: reply, timestamp: new Date().toISOString(), action: null }
      msgs.push(botMsg)
      addBubble('assistant', reply, botMsg.timestamp, null)
      if (!isOpen) { unread++; showBadge(unread) }
    })
  }

  // ── Init ────────────────────────────────────────────────────────
  function init() {
    injectStyles()
    buildDOM()

    setTimeout(function() {
      if (!isOpen) { unread = 1; showBadge(1) }
    }, 8000)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()
