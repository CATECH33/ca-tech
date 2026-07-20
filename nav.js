/* CA-TECH — nav.js — navigation unifiée
 * URLs propres, nav plate, cohérente sur toutes les pages.
 * Modifier ici = modifie toutes les pages (sauf index.html qui a sa propre nav).
 */
(function () {
  var nav = document.getElementById('nav');
  var mob = document.getElementById('mob');
  if (!nav || !mob) return;

  /* slug courant : "collaborateurs-ia", "tarifs", "" pour home, etc. */
  var slug = location.pathname
    .replace(/^\//, '')
    .replace(/\.html$/i, '')
    .replace(/\/$/, '');

  /* ── Items de navigation ───────────────────────────────────── */
  var items = [
    ['/',                  'Accueil'],
    ['/services',         'Services'],
    ['/loic',             'Loïc'],
    ['/collaborateurs-ia','Collaborateurs IA'],
    ['/automatisations',  'Automatisations'],
    ['/realisations',     'Réalisations'],
    ['/blog',             'Blog'],
    ['/tarifs',           'Tarifs'],
    ['/a-propos',         'À propos'],
    ['/contact',          'Contact'],
  ];

  /* ── Desktop nav ───────────────────────────────────────────── */
  nav.innerHTML =
    '<a href="/" class="logo" aria-label="CA-TECH — Retour à l\'accueil">'
  + '<img src="/assets/logos/logo-ca-tech.png" alt="CA-TECH" width="36" height="36"/>'
  + '<div><span class="logo-name">CA-TECH</span><span class="logo-sub">Agence Web &amp; Design</span></div>'
  + '</a>'
  + '<ul class="nav-links">'
  + items.map(function (i) {
      return '<li><a href="' + i[0] + '">' + i[1] + '</a></li>';
    }).join('')
  + '<li><a href="/contact" class="btn-nav">Demander un devis</a></li>'
  + '</ul>'
  + '<button class="ham" id="ham" aria-label="Ouvrir le menu" aria-expanded="false">'
  + '<span></span><span></span><span></span></button>';

  /* ── Mobile menu ───────────────────────────────────────────── */
  mob.innerHTML =
    items.map(function (i) {
      return '<a href="' + i[0] + '" onclick="closeMob()">' + i[1] + '</a>';
    }).join('')
  + '<a href="/contact" class="btn-mob" onclick="closeMob()">Demander un devis</a>';

  /* ── Lien actif ────────────────────────────────────────────── */
  var slugMap = {
    '':                  '/',
    'index':             '/',
    'services':          '/services',
    'solutions':         '/services',
    'catalogue':         '/services',
    'creation-site-vitrine': '/services',
    'creation-site-ecommerce': '/services',
    'creation-flyer':    '/services',
    'creation-landing-page': '/services',
    'creation-logo':     '/services',
    'identite-visuelle': '/services',
    'refonte-site-internet': '/services',
    'maintenance-site-web': '/services',
    'loic':              '/loic',
    'collaborateurs-ia': '/collaborateurs-ia',
    'automatisations':   '/automatisations',
    'realisations':      '/realisations',
    'cas-clients':       '/realisations',
    'blog':              '/blog',
    'tarifs':            '/tarifs',
    'a-propos':          '/a-propos',
    'contact':           '/contact',
    'devis':             '/contact',
    'faq':               null,
    'mentions-legales':  null,
    'politique-de-confidentialite': null,
  };

  var prefixMap = [
    ['creation-',      '/services'],
    ['agence-web-',    '/services'],
    ['site-internet-', '/services'],
    ['site-ecommerce-','/services'],
    ['logo-',          '/services'],
    ['realisation-',   '/realisations'],
    ['auto-',          '/automatisations'],
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

  /* ── Styles état actif ─────────────────────────────────────── */
  if (!document.getElementById('nav-active-style')) {
    var st = document.createElement('style');
    st.id = 'nav-active-style';
    st.textContent =
      '.nav-links li a.nav-active{color:var(--cyan,#00d4ff);position:relative}'
    + '.nav-links li a.nav-active::after{content:"";position:absolute;bottom:-4px;left:0;'
    + 'width:100%;height:2px;background:var(--cyan,#00d4ff);border-radius:2px;'
    + 'transform-origin:left;animation:nav-bar-in .3s cubic-bezier(.4,0,.2,1) forwards}'
    + '@keyframes nav-bar-in{from{transform:scaleX(0);opacity:0}to{transform:scaleX(1);opacity:1}}'
    + '.mob-menu a.nav-active{color:var(--cyan,#00d4ff)}';
    document.head.appendChild(st);
  }

  /* ── Scroll ────────────────────────────────────────────────── */
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

  /* ── Hamburger ─────────────────────────────────────────────── */
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
