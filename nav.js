/* CA-TECH — nav.js — header unifié (identique au composant React Header.tsx)
 * Menu : Accueil | Solutions▼ | Collaborateurs IA | Automatisations |
 *         Réalisations | Blog | Tarifs | À propos | Contact | [Demander un devis]
 */
(function () {
  var nav = document.getElementById('nav');
  var mob = document.getElementById('mob');
  if (!nav || !mob) return;

  /* ── Slug courant ─────────────────────────────────────────────── */
  var slug = location.pathname
    .replace(/^\//, '')
    .replace(/\.html$/i, '')
    .replace(/\/$/, '');

  /* ── Données Solutions dropdown ───────────────────────────────── */
  var SOLUTIONS = [
    ['/creation-site-vitrine',   'Création de site Web'],
    ['/creation-site-ecommerce', 'E-commerce'],
    ['/services#apps',           'Applications Métier'],
    ['/services#apps',           'CRM sur mesure'],
    ['/services#seo',            'SEO & Visibilité'],
    ['/maintenance-site-web',    'Maintenance'],
  ];

  /* ── Items desktop (hors Solutions) ──────────────────────────── */
  var ITEMS = [
    ['/collaborateurs-ia', 'Collaborateurs IA'],
    ['/automatisations',   'Automatisations'],
    ['/realisations',      'Réalisations'],
    ['/blog',              'Blog'],
    ['/tarifs',            'Tarifs'],
    ['/contact',           'Contact'],
  ];

  /* ── CSS injecté (dropdown + active + mobile sub) ─────────────── */
  if (!document.getElementById('nav-unified-style')) {
    var st = document.createElement('style');
    st.id = 'nav-unified-style';
    st.textContent = [
      /* Solutions panel */
      '.nav-dropdown{position:relative}',
      '.nav-dd-trigger{display:flex;align-items:center;gap:4px;cursor:pointer;',
        'color:rgba(255,255,255,.7);padding:6px 9px;font-size:.78rem;font-weight:500;',
        'border-radius:6px;border:none;background:none;font-family:inherit;',
        'transition:color .25s,background .25s;white-space:nowrap}',
      '.nav-dd-trigger:hover{color:#00D4FF;background:rgba(0,212,255,.08)}',
      '.nav-caret{font-size:.62rem;opacity:.65;transition:transform .22s;display:inline-block;line-height:1}',
      '.nav-dropdown:hover .nav-caret,.nav-dropdown:focus-within .nav-caret{transform:rotate(180deg)}',
      '.nav-sol-panel{position:absolute;top:calc(100% + 8px);left:50%;',
        'transform:translateX(-50%) translateY(-8px);min-width:210px;',
        'background:rgba(5,13,26,.97);border:1px solid rgba(255,255,255,.1);',
        'border-radius:12px;backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);',
        'box-shadow:0 8px 32px rgba(0,0,0,.55),0 0 0 1px rgba(0,102,255,.06);',
        'padding:.5rem;opacity:0;visibility:hidden;',
        'transition:opacity .22s,transform .22s,visibility .22s;z-index:999}',
      '.nav-dropdown:hover .nav-sol-panel,.nav-dropdown:focus-within .nav-sol-panel{',
        'opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}',
      '.nav-sol-link{display:block;color:rgba(255,255,255,.7);text-decoration:none;',
        'font-size:.8rem;padding:.6rem .9rem;border-radius:7px;',
        'transition:color .2s,background .2s,transform .15s}',
      '.nav-sol-link:hover{color:#fff;background:rgba(0,102,255,.12);transform:translateX(3px)}',
      /* Active state */
      '.nav-links li a.nav-active{color:#00D4FF;position:relative}',
      '.nav-links li a.nav-active::after{content:"";position:absolute;bottom:-4px;left:9px;right:9px;',
        'height:2px;background:#00D4FF;border-radius:2px;',
        'animation:nav-bar-in .3s cubic-bezier(.4,0,.2,1) forwards}',
      '@keyframes nav-bar-in{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}',
      '.nav-dd-trigger.nav-active{color:#00D4FF!important}',
      '.mob-menu a.nav-active{color:#00D4FF}',
      '.mob-sol-hd.nav-active{color:#00D4FF}',
      /* Mobile Solutions */
      '.mob-sol-hd{display:flex;align-items:center;justify-content:space-between;',
        'color:rgba(255,255,255,.7);font-size:.88rem;font-weight:500;',
        'padding:.7rem 0;border:none;border-bottom:1px solid rgba(255,255,255,.08);',
        'background:none;cursor:pointer;width:100%;font-family:inherit;transition:color .25s}',
      '.mob-sol-hd:hover{color:#00D4FF}',
      '.mob-sol-hd .nav-caret{transition:transform .3s}',
      '.mob-sol-hd.open .nav-caret{transform:rotate(180deg)}',
      '.mob-sol-sub{display:none;flex-direction:column}',
      '.mob-sol-sub.open{display:flex}',
      '.mob-dd-item{display:block!important;color:rgba(255,255,255,.5)!important;',
        'text-decoration:none;font-size:.82rem;padding:.5rem 0 .5rem 1rem!important;',
        'border-bottom:1px solid rgba(255,255,255,.08);transition:color .25s}',
      '.mob-dd-item:hover{color:#00D4FF!important}',
    ].join('');
    document.head.appendChild(st);
  }

  /* ── Solutions dropdown HTML ──────────────────────────────────── */
  var solLinks = SOLUTIONS.map(function (s) {
    return '<a href="' + s[0] + '" class="nav-sol-link">' + s[1] + '</a>';
  }).join('');

  var solItem =
    '<li class="nav-dropdown">'
  + '<button class="nav-dd-trigger" aria-haspopup="true">'
  + 'Solutions <span class="nav-caret" aria-hidden="true">&#9662;</span>'
  + '</button>'
  + '<div class="nav-sol-panel" role="menu">' + solLinks + '</div>'
  + '</li>';

  /* ── Desktop nav items ───────────────────────────────────────── */
  var desktopItems = ITEMS.map(function (i) {
    return '<li><a href="' + i[0] + '">' + i[1] + '</a></li>';
  }).join('');

  /* ── Inject desktop nav ──────────────────────────────────────── */
  nav.innerHTML =
    '<a href="/" class="logo" aria-label="CA-TECH — Retour à l\'accueil">'
  + '<picture>'
  + '<source srcset="/assets/logos/logo-ca-tech.webp" type="image/webp"/>'
  + '<img src="/assets/logos/logo-ca-tech.png" alt="Logo CA-TECH — Agence Web &amp; IA"'
  + ' width="36" height="36" decoding="async" fetchpriority="high"/>'
  + '</picture>'
  + '<div><span class="logo-name">CA-TECH</span>'
  + '<span class="logo-sub">Agence Web &amp; Design</span></div>'
  + '</a>'
  + '<ul class="nav-links">'
  + '<li><a href="/">Accueil</a></li>'
  + solItem
  + desktopItems
  + '<li><a href="/contact" class="btn-nav">Demander un devis</a></li>'
  + '</ul>'
  + '<button class="ham" id="ham" aria-label="Ouvrir le menu" aria-expanded="false">'
  + '<span></span><span></span><span></span></button>';

  /* ── Mobile Solutions sub-items ─────────────────────────────── */
  var mobSolSub = SOLUTIONS.map(function (s) {
    return '<a href="' + s[0] + '" class="mob-dd-item" onclick="closeMob()">' + s[1] + '</a>';
  }).join('');

  /* ── Inject mobile menu ──────────────────────────────────────── */
  mob.innerHTML =
    '<a href="/" onclick="closeMob()">Accueil</a>'
  + '<button class="mob-sol-hd" id="mob-sol-btn" aria-expanded="false">'
  + 'Solutions <span class="nav-caret" aria-hidden="true">&#9662;</span>'
  + '</button>'
  + '<div class="mob-sol-sub" id="mob-sol-sub">' + mobSolSub + '</div>'
  + ITEMS.map(function (i) {
      return '<a href="' + i[0] + '" onclick="closeMob()">' + i[1] + '</a>';
    }).join('')
  + '<a href="/contact" class="btn-mob" onclick="closeMob()">Demander un devis</a>';

  /* ── Mobile Solutions toggle ─────────────────────────────────── */
  var mobSolBtn = document.getElementById('mob-sol-btn');
  var mobSolSubEl = document.getElementById('mob-sol-sub');
  if (mobSolBtn && mobSolSubEl) {
    mobSolBtn.addEventListener('click', function () {
      var open = mobSolBtn.classList.toggle('open');
      mobSolSubEl.classList.toggle('open', open);
      mobSolBtn.setAttribute('aria-expanded', String(open));
    });
  }

  /* ── Lien actif ──────────────────────────────────────────────── */
  var slugMap = {
    '':                            '/',
    'index':                       '/',
    'collaborateurs-ia':           '/collaborateurs-ia',
    'automatisations':             '/automatisations',
    'realisations':                '/realisations',
    'cas-clients':                 '/realisations',
    'blog':                        '/blog',
    'tarifs':                      '/tarifs',
    'loic':                        '/loic',
    'contact':                     '/contact',
    'devis':                       '/contact',
    'services':                    null,
    'solutions':                   null,
    'catalogue':                   null,
    'creation-site-vitrine':       '/creation-site-vitrine',
    'creation-site-ecommerce':     '/creation-site-ecommerce',
    'maintenance-site-web':        '/maintenance-site-web',
    'methodologie':                null,
    'technologies':                null,
    'faq':                         null,
    'glossaire-ia':                null,
    'mentions-legales':            null,
    'politique-de-confidentialite':null,
  };

  var prefixMap = [
    ['agence-web-',     null],
    ['site-internet-',  null],
    ['site-ecommerce-', null],
    ['logo-',           null],
    ['auto-',           '/automatisations'],
    ['realisation-',    '/realisations'],
    ['ressources/',     '/blog'],
  ];

  var activeHref = slugMap.hasOwnProperty(slug) ? slugMap[slug] : undefined;
  if (activeHref === undefined) {
    for (var pi = 0; pi < prefixMap.length; pi++) {
      if (slug.indexOf(prefixMap[pi][0]) === 0) {
        activeHref = prefixMap[pi][1];
        break;
      }
    }
  }

  if (activeHref) {
    var sel = 'a[href="' + activeHref + '"]';
    var elD = nav.querySelector(sel);
    if (elD) elD.classList.add('nav-active');
    var elM = mob.querySelector(sel);
    if (elM) elM.classList.add('nav-active');
  }

  /* ── Solutions button actif sur pages Solutions ─────────────── */
  var SOL_HREFS = SOLUTIONS.map(function (s) { return s[0].split('#')[0]; });
  var isSolPage = activeHref && SOL_HREFS.indexOf(activeHref.split('#')[0]) !== -1;
  if (isSolPage) {
    var solTrigger = nav.querySelector('.nav-dd-trigger');
    if (solTrigger) solTrigger.classList.add('nav-active');
    var mobSolHd = mob.querySelector('.mob-sol-hd');
    if (mobSolHd) mobSolHd.classList.add('nav-active');
  }

  /* ── Scroll ──────────────────────────────────────────────────── */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        nav.classList.toggle('scrolled', window.scrollY > 80);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ── Hamburger ───────────────────────────────────────────────── */
  var ham = document.getElementById('ham');
  window.closeMob = function () {
    if (ham) { ham.classList.remove('open'); ham.setAttribute('aria-expanded', 'false'); }
    mob.classList.remove('open');
  };
  if (ham) {
    ham.addEventListener('click', function () {
      var open = ham.classList.toggle('open');
      ham.setAttribute('aria-expanded', String(open));
      mob.classList.toggle('open');
    });
  }
})();
