/* CA-TECH — nav.js — composant header partagé
 * Injecte le menu uniforme sur toutes les pages.
 * Source unique : modifier ici = modifie toutes les pages.
 */
(function () {
  var nav = document.getElementById('nav');
  var mob = document.getElementById('mob');
  if (!nav || !mob) return;

  var isHome = location.pathname === '/' || location.pathname === '' ||
               /\/index\.html$/i.test(location.pathname);

  /* page courante — ex: "collaborateurs-ia" ou "" pour home */
  var slug = location.pathname.replace(/^\//, '').replace(/\.html$/i, '').replace(/\/$/, '');

  /* lien vers une section de la homepage */
  function sec(anchor, label) {
    var href = isHome ? '#' + anchor : 'index.html#' + anchor;
    var ds   = isHome ? ' data-s="' + anchor + '"' : '';
    return '<li><a href="' + href + '"' + ds + '>' + label + '</a></li>';
  }

  var devisHref = isHome ? '#contact' : 'index.html#contact';

  /* ── Desktop nav ──────────────────────────────────────────── */
  nav.innerHTML =
    '<a href="' + (isHome ? '/' : 'index.html') + '" class="logo">'
  +   '<img src="/assets/logos/logo-ca-tech.png" alt="CA-TECH" width="36" height="36"/>'
  +   '<div><span class="logo-name">CA-TECH</span><span class="logo-sub">Agence Web &amp; Design</span></div>'
  + '</a>'
  + '<ul class="nav-links">'
  +   sec('hero',          'Accueil')
  +   sec('services',      'Services')
  +   '<li><a href="collaborateurs-ia.html">Collaborateurs IA</a></li>'
  +   '<li><a href="automatisations.html">Automatisations</a></li>'
  +   sec('realisations',  'Réalisations')
  +   '<li><a href="tarifs.html">Tarifs</a></li>'
  +   sec('a-propos',      'À propos')
  +   sec('contact',       'Contact')
  +   '<li><button class="btn-nav" onclick="location.href=\'' + devisHref + '\'">Demander un devis</button></li>'
  + '</ul>'
  + '<button class="ham" id="ham"><span></span><span></span><span></span></button>';

  /* ── Mobile menu ───────────────────────────────────────────── */
  function ml(href, label, cls) {
    return '<a href="' + href + '"'
      + (cls ? ' class="' + cls + '"' : '')
      + ' onclick="closeMob()">' + label + '</a>';
  }

  mob.innerHTML =
    ml(isHome ? '#hero'         : 'index.html',                  'Accueil')
  + ml(isHome ? '#services'     : 'index.html#services',         'Services')
  + ml('collaborateurs-ia.html',                                  'Collaborateurs IA')
  + ml('automatisations.html',                                    'Automatisations')
  + ml(isHome ? '#realisations' : 'index.html#realisations',     'Réalisations')
  + ml('tarifs.html',                                             'Tarifs')
  + ml(isHome ? '#a-propos'     : 'index.html#a-propos',         'À propos')
  + ml(isHome ? '#contact'      : 'index.html#contact',          'Contact')
  + '<a href="' + devisHref + '" class="btn-mob" onclick="closeMob()">Demander un devis</a>';

  /* ── Lien actif ────────────────────────────────────────────── */
  /* Correspondance slug → sélecteur dans la nav desktop */
  var activeMap = {
    '':                   null,              /* home : pas de lien de page */
    'collaborateurs-ia':  'a[href="collaborateurs-ia.html"]',
    'automatisations':    'a[href="automatisations.html"]',
    'tarifs':             'a[href="tarifs.html"]',
  };
  /* pages dont le slug commence par un préfixe */
  var prefixMap = [
    ['creation-site', null],
    ['creation-logo', null],
    ['creation-flyer', null],
    ['creation-landing', null],
    ['identite-visuelle', null],
    ['refonte', null],
    ['maintenance', null],
    ['agence-web', null],
    ['site-internet', null],
    ['site-ecommerce', null],
    ['logo-', null],
    ['realisation', null],
    ['faq', null],
    ['mentions', null],
    ['politique', null],
  ];

  function markActive(selector) {
    if (!selector) return;
    var el = nav.querySelector(selector);
    if (el) el.classList.add('nav-active');
    /* mobile */
    var mob2 = document.getElementById('mob');
    if (mob2) {
      var mEl = mob2.querySelector(selector);
      if (mEl) mEl.classList.add('nav-active');
    }
  }

  if (isHome) {
    /* Accueil = premier lien de section */
    var homeLink = nav.querySelector('a[data-s="hero"]');
    if (homeLink) homeLink.classList.add('nav-active');
    var mobHome = document.getElementById('mob');
    if (mobHome) {
      var mh = mobHome.querySelector('a[href="#hero"]');
      if (mh) mh.classList.add('nav-active');
    }
  } else if (activeMap[slug] !== undefined) {
    markActive(activeMap[slug]);
  }

  /* ── Styles état actif ─────────────────────────────────────── */
  if (!document.getElementById('nav-active-style')) {
    var style = document.createElement('style');
    style.id = 'nav-active-style';
    style.textContent = [
      '.nav-links li a.nav-active {',
      '  color: #2563EB;',
      '  position: relative;',
      '}',
      '.nav-links li a.nav-active::after {',
      '  content: "";',
      '  position: absolute;',
      '  bottom: -4px;',
      '  left: 0;',
      '  width: 100%;',
      '  height: 2px;',
      '  background: #2563EB;',
      '  border-radius: 2px;',
      '  transform-origin: left;',
      '  animation: nav-bar-in .3s cubic-bezier(.4,0,.2,1) forwards;',
      '}',
      '@keyframes nav-bar-in {',
      '  from { transform: scaleX(0); opacity: 0; }',
      '  to   { transform: scaleX(1); opacity: 1; }',
      '}',
      '.mob-menu a.nav-active {',
      '  color: #2563EB;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Scroll — classe scrolled sur le header ───────────────── */
  /* La homepage gère son propre listener ; nav.js couvre toutes les autres pages */
  if (!isHome) {
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
  }

  /* ── Hamburger — re-wire après remplacement du innerHTML ──── */
  var ham = document.getElementById('ham');

  window.closeMob = function () {
    if (ham) ham.classList.remove('open');
    mob.classList.remove('open');
  };

  if (ham) {
    ham.addEventListener('click', function () {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
  }
})();
