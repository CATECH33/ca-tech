/* CA-TECH — footer.js — pied de page partagé
 * Source unique : modifier ici = modifie toutes les pages.
 */
(function () {
  'use strict';

  /* ── CSS ──────────────────────────────────────────────────── */
  if (!document.getElementById('footer-js-css')) {
    var s = document.createElement('style');
    s.id = 'footer-js-css';
    s.textContent =
      'footer{background:var(--dark,#020b18);border-top:1px solid rgba(255,255,255,.06);padding:80px 5% 0}'
      + '.f-top{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr 1fr;gap:2rem 2.5rem;padding-bottom:60px}'
      + '.f-brand{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;text-decoration:none}'
      + '.f-brand-name{font-family:Rajdhani,sans-serif;font-size:1.1rem;font-weight:700;letter-spacing:2px;color:#fff}'
      + '.f-brand-tag{font-size:.7rem;color:rgba(255,255,255,.35);letter-spacing:.5px}'
      + '.f-col-desc{font-size:.8rem;color:rgba(255,255,255,.38);line-height:1.85;margin-bottom:1.2rem;max-width:280px}'
      + '.f-col h5{font-size:.65rem;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--blue,#0066ff);margin-bottom:1.2rem;padding-bottom:.6rem;border-bottom:1px solid rgba(0,102,255,.18)}'
      + '.f-col ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.6rem}'
      + '.f-col ul a{color:rgba(255,255,255,.38);text-decoration:none;font-size:.82rem;transition:color .22s,padding-left .22s;display:block}'
      + '.f-col ul a:hover{color:#fff;padding-left:5px}'
      + '.f-zones{margin-top:1rem}'
      + '.f-zones-lbl{font-size:.6rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:.7rem}'
      + '.f-zones-cities{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.8rem}'
      + '.f-zones-cities a{font-size:.75rem;color:rgba(255,255,255,.3);text-decoration:none;padding:3px 10px;border:1px solid rgba(255,255,255,.08);border-radius:20px;transition:color .2s,border-color .2s}'
      + '.f-zones-cities a:hover{color:#fff;border-color:rgba(0,102,255,.4)}'
      + '.f-contact-item{display:flex;align-items:center;gap:.75rem;margin-bottom:.9rem}'
      + '.f-contact-icon{width:30px;height:30px;border-radius:7px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
      + '.f-contact-icon svg{width:13px;height:13px;stroke:rgba(255,255,255,.4);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
      + '.f-contact-txt{font-size:.8rem;color:rgba(255,255,255,.38)}'
      + '.f-contact-txt a{color:inherit;text-decoration:none;transition:color .2s}'
      + '.f-contact-txt a:hover{color:#fff}'
      + '.f-sep{height:1px;background:rgba(255,255,255,.06);margin:0}'
      + '.f-bottom{display:flex;align-items:center;justify-content:space-between;padding:22px 0;font-size:.72rem;color:rgba(255,255,255,.22);flex-wrap:wrap;gap:.8rem}'
      + '.f-bottom-logo{display:flex;align-items:center;gap:6px}'
      + '.f-bottom-logo img{height:20px;opacity:.4}'
      + '.f-bottom-logo span{font-family:Rajdhani,sans-serif;font-size:.75rem;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,.22)}'
      + '@media(max-width:1100px){.f-top{grid-template-columns:1fr 1fr 1fr 1fr;gap:1.5rem 2rem}}'
      + '@media(max-width:768px){.f-top{grid-template-columns:1fr 1fr;gap:1.5rem}}'
      + '@media(max-width:420px){.f-top{grid-template-columns:1fr}}'
    ;
    document.head.appendChild(s);
  }

  /* ── HTML ─────────────────────────────────────────────────── */
  var el = document.querySelector('footer');
  if (!el) return;

  /* SVG helpers */
  function svg(d) {
    return '<svg viewBox="0 0 24 24">' + d + '</svg>';
  }
  var iconEmail  = svg('<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>');
  var iconPhone  = svg('<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.06 1.22 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>');
  var iconLi     = svg('<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>');
  var iconWa     = svg('<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>');

  function ci(icon, html) {
    return '<div class="f-contact-item"><div class="f-contact-icon">' + icon + '</div>'
      + '<div class="f-contact-txt">' + html + '</div></div>';
  }

  function col(title, items) {
    var lis = items.map(function (i) {
      return '<li><a href="' + i[0] + '">' + i[1] + '</a></li>';
    }).join('');
    return '<div class="f-col"><h5>' + title + '</h5><ul>' + lis + '</ul></div>';
  }

  el.innerHTML =
    '<div class="f-top">'

    /* ── Col 1 : Brand ── */
    + '<div class="f-col">'
    +   '<a href="/index.html" class="f-brand">'
    +     '<img src="/assets/logos/logo-ca-tech.png" alt="CA-TECH" width="36" height="36" style="border-radius:8px"/>'
    +     '<div><div class="f-brand-name">CA-TECH</div>'
    +          '<div class="f-brand-tag">Agence Web &amp; IA</div></div>'
    +   '</a>'
    +   '<p class="f-col-desc">Agence Web &amp; IA spécialisée dans la création de sites, les collaborateurs IA et l\'automatisation des entreprises en France.</p>'
    +   '<div class="f-zones">'
    +     '<div class="f-zones-lbl">Zones d\'intervention</div>'
    +     '<div class="f-zones-cities">'
    +       '<a href="/agence-web-paris.html">Paris</a>'
    +       '<a href="/agence-web-lyon.html">Lyon</a>'
    +       '<a href="/agence-web-dijon.html">Dijon</a>'
    +       '<a href="/agence-web-troyes.html">Troyes</a>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    /* ── Col 2 : Création Web ── */
    + col('Création Web', [
        ['/creation-site-vitrine.html',  'Sites vitrines'],
        ['/creation-site-ecommerce.html','E-commerce'],
        ['/creation-landing-page.html',  'Landing Pages'],
        ['/refonte-site-internet.html',  'Refonte'],
        ['/maintenance-site-web.html',   'Maintenance'],
        ['/creation-logo.html',          'Logos'],
        ['/identite-visuelle.html',      'Identité visuelle'],
        ['/creation-flyer.html',         'Flyers'],
      ])

    /* ── Col 3 : Collaborateurs IA ── */
    + col('Collaborateurs IA', [
        ['/collaborateurs-ia.html',           'Vue d\'ensemble'],
        ['/collaborateurs-ia.html#commercial','Commercial IA'],
        ['/collaborateurs-ia.html#support',   'Support IA'],
        ['/collaborateurs-ia.html#rh',        'RH IA'],
        ['/collaborateurs-ia.html#juridique', 'Juridique IA'],
        ['/collaborateurs-ia.html#seo',       'SEO IA'],
        ['/collaborateurs-ia.html#comptable', 'Comptable IA'],
      ])

    /* ── Col 4 : Automatisations ── */
    + col('Automatisations', [
        ['/automatisations.html',                    'Vue d\'ensemble'],
        ['/automatisations.html?cat=commercial',     'Prospection IA'],
        ['/automatisations.html?cat=commercial',     'Lead Generation'],
        ['/automatisations.html',                    'Google Workspace'],
        ['/automatisations.html',                    'Microsoft 365'],
        ['/automatisations.html',                    'Slack / WhatsApp'],
        ['/automatisations.html',                    'n8n / Zapier / API'],
        ['/automatisations.html',                    'HubSpot / CRM'],
        ['/automatisations.html?cat=reporting',      'Reporting'],
        ['/automatisations.html',                    'LinkedIn / X / Maps'],
      ])

    /* ── Col 5 : Contact + Légal ── */
    + '<div class="f-col">'
    +   '<h5>Contact</h5>'
    +   ci(iconEmail, '<a href="mailto:contact@ca-tech.fr">contact@ca-tech.fr</a>')
    +   ci(iconPhone, '<a href="tel:+33775664975" onclick="if(window.trackPhoneCall)trackPhoneCall()">+33 7 75 66 49 75</a>')
    +   ci(iconLi,    '<a href="#">LinkedIn CA-TECH</a>')
    +   ci(iconWa,    '<a href="#" onclick="if(window.trackWhatsApp)trackWhatsApp()">WhatsApp</a>')
    +   '<ul style="margin-top:1.2rem">'
    +     '<li><a href="/tarifs.html">Tarifs</a></li>'
    +     '<li><a href="/faq.html">FAQ</a></li>'
    +     '<li><a href="/mentions-legales.html">Mentions légales</a></li>'
    +     '<li><a href="/politique-de-confidentialite.html">Confidentialité</a></li>'
    +   '</ul>'
    + '</div>'

    + '</div>'
    + '<div class="f-sep"></div>'
    + '<div class="f-bottom">'
    +   '<span>© 2026 CA-TECH — Agence Web &amp; IA · Tous droits réservés.</span>'
    +   '<div class="f-bottom-logo">'
    +     '<img src="/assets/logos/logo-ca-tech.png" alt="CA-TECH"/>'
    +     '<span>CA-TECH</span>'
    +   '</div>'
    + '</div>';

})();
