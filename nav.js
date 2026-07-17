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
  +   sec('realisations',  'Réalisations')
  +   '<li><a href="tarifs.html">Tarifs</a></li>'
  +   sec('notre-methode', 'Notre méthode')
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
  + ml(isHome ? '#realisations' : 'index.html#realisations',     'Réalisations')
  + ml('tarifs.html',                                             'Tarifs')
  + ml(isHome ? '#notre-methode': 'index.html#notre-methode',    'Notre méthode')
  + ml(isHome ? '#a-propos'     : 'index.html#a-propos',         'À propos')
  + ml(isHome ? '#contact'      : 'index.html#contact',          'Contact')
  + '<a href="' + devisHref + '" class="btn-mob" onclick="closeMob()">Demander un devis</a>';

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
