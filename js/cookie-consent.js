/* ══════════════════════════════════════════════════════════════════════
   CA-TECH — Cookie Consent + GA4 (vanilla JS, pages statiques)
   Doit être chargé SANS defer/async en premier script du <head>.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const GA_ID       = 'G-R526KDMC17';
  const STORAGE_KEY = 'ca-tech-cookies-consent';
  const SCHEMA_V    = 2;
  const DAYS        = 180;

  // ── 1. Consent Mode v2 — défaut denied (synchrone, avant tout tag Google) ──

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage:         'denied',
    analytics_storage:  'denied',
    ad_user_data:       'denied',
    ad_personalization: 'denied',
    wait_for_update:    500,
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough',    true);

  // ── 2. Helpers localStorage ──

  function loadStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if ((s.v || 0) < SCHEMA_V)                        { localStorage.removeItem(STORAGE_KEY); return null; }
      if ((Date.now() - s.ts) / 86400000 > DAYS)        { localStorage.removeItem(STORAGE_KEY); return null; }
      return s;
    } catch (e) { return null; }
  }

  function saveConsent(prefs, source) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      v: SCHEMA_V, ts: Date.now(),
      source:          source || 'unknown',
      statistics:      !!prefs.statistics,
      marketing:       !!prefs.marketing,
      personalization: !!prefs.personalization,
      functional:      !!prefs.functional,
    }));
  }

  // ── 3. Injection GA4 ──

  var _gaLoaded = false;
  function injectGA4() {
    if (_gaLoaded || !GA_ID) return;
    _gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    s.onload = function () {
      gtag('js', new Date());
      gtag('config', GA_ID, { anonymize_ip: true });
    };
  }

  // ── 4. Activation des scripts déclaratifs bloqués ──
  //
  // Usage dans les pages HTML :
  //   <script type="text/plain" data-consent="statistics" data-src="https://..."></script>
  //   <script type="text/plain" data-consent="marketing">/* inline code */</script>
  //
  // Le navigateur ignore type="text/plain".
  // Cette fonction clone les scripts bloqués en vrais <script> après consentement.

  function activateConsentScripts(prefs) {
    var granted = [];
    if (prefs.statistics)      granted.push('statistics');
    if (prefs.marketing)       granted.push('marketing');
    if (prefs.personalization) granted.push('personalization');
    if (prefs.functional)      granted.push('functional');

    var blocked = document.querySelectorAll('script[type="text/plain"][data-consent]');
    for (var i = 0; i < blocked.length; i++) {
      var s = blocked[i];
      if (s.getAttribute('data-activated') === 'true') continue;
      var cat = s.getAttribute('data-consent');
      if (granted.indexOf(cat) === -1) continue;

      var live = document.createElement('script');
      for (var j = 0; j < s.attributes.length; j++) {
        var a = s.attributes[j];
        if (a.name !== 'type' && a.name !== 'data-consent' && a.name !== 'data-src') {
          live.setAttribute(a.name, a.value);
        }
      }
      var src = s.getAttribute('data-src');
      if (src) live.src = src;
      else live.textContent = s.textContent;

      s.setAttribute('data-activated', 'true');
      s.parentNode.insertBefore(live, s.nextSibling);
    }
  }

  // ── 5. Application des signaux ──

  function applyConsent(prefs) {
    gtag('consent', 'update', {
      analytics_storage:  prefs.statistics      ? 'granted' : 'denied',
      ad_storage:         prefs.marketing        ? 'granted' : 'denied',
      ad_user_data:       prefs.marketing        ? 'granted' : 'denied',
      ad_personalization: prefs.personalization  ? 'granted' : 'denied',
    });
    if (prefs.statistics) injectGA4();
    // Active les scripts déclaratifs — seulement si le DOM est prêt
    if (document.readyState !== 'loading') activateConsentScripts(prefs);
  }

  // ── 6. Application immédiate si consentement déjà stocké ──
  // (GA4 s'injecte ici ; activateConsentScripts attend DOMContentLoaded via init())

  var _stored = loadStored();
  if (_stored) applyConsent(_stored);

  // ── 6. Bannière + Modal (injectées après DOMContentLoaded) ──

  var CATS = [
    {
      id: 'necessary', label: 'Cookies strictement nécessaires',
      desc: 'Indispensables au fonctionnement du site. Ne peuvent pas être désactivés.',
      purpose: 'Navigation, authentification, sécurité de session, mémorisation de vos préférences de cookies.',
      duration: 'Session ou jusqu\'à 1 an', providers: 'CA-TECH (interne)', required: true,
    },
    {
      id: 'statistics', label: 'Cookies statistiques',
      desc: 'Mesure d\'audience anonymisée pour comprendre comment le site est utilisé.',
      purpose: 'Analyser le trafic, identifier les pages populaires, détecter les problèmes techniques.',
      duration: '13 mois', providers: 'Google Analytics 4 (Google LLC)', required: false,
    },
    {
      id: 'marketing', label: 'Cookies marketing',
      desc: 'Suivi publicitaire pour vous proposer des annonces pertinentes sur d\'autres sites.',
      purpose: 'Mesurer l\'efficacité des campagnes, cibler des audiences similaires.',
      duration: '13 mois', providers: 'Google Ads (Google LLC) · Meta Pixel (Meta Platforms Inc.)', required: false,
    },
    {
      id: 'personalization', label: 'Cookies de personnalisation',
      desc: 'Mémorisation de vos préférences et adaptation des contenus selon votre parcours.',
      purpose: 'Afficher un contenu adapté à vos intérêts, mémoriser vos choix de navigation.',
      duration: '6 mois', providers: 'CA-TECH (interne)', required: false,
    },
    {
      id: 'functional', label: 'Cookies fonctionnels',
      desc: 'Fonctionnalités enrichies : vidéos intégrées, chat, partage sur les réseaux sociaux.',
      purpose: 'Activer les fonctionnalités interactives optionnelles du site.',
      duration: '12 mois', providers: 'YouTube (Google LLC) · LinkedIn (LinkedIn Corporation)', required: false,
    },
  ];

  var CSS = `
/* ── Cookie Consent CA-TECH ── */
.ck-banner{position:fixed;bottom:0;left:0;right:0;z-index:9998;padding:0 0 env(safe-area-inset-bottom,0);animation:ck-slide-up .45s cubic-bezier(.16,1,.3,1) both}
@keyframes ck-slide-up{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
.ck-inner{background:rgba(10,37,64,.92);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-top:1px solid rgba(0,102,255,.2);box-shadow:0 -8px 40px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.04) inset;display:flex;align-items:center;gap:32px;padding:20px 32px;flex-wrap:wrap}
.ck-text{flex:1;min-width:260px}
.ck-title{font-size:15px;font-weight:700;color:#fff;margin:0 0 6px;letter-spacing:-.01em}
.ck-body{font-size:13px;color:rgba(255,255,255,.6);margin:0;line-height:1.55;max-width:640px}
.ck-actions{display:flex;gap:10px;flex-shrink:0;align-items:center;flex-wrap:wrap}
.ck-btn{border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;padding:9px 20px;white-space:nowrap;transition:filter .15s,transform .1s,background .15s;letter-spacing:-.01em;font-family:inherit}
.ck-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
.ck-btn:active{transform:translateY(0);filter:brightness(.95)}
.ck-btn-primary{background:linear-gradient(135deg,#0066FF,#0052cc);color:#fff;box-shadow:0 2px 12px rgba(0,102,255,.35)}
.ck-btn-secondary{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.18)}
.ck-btn-secondary:hover{background:rgba(255,255,255,.2);filter:none}
.ck-btn-ghost{background:transparent;color:rgba(255,255,255,.45);padding:9px 12px;font-size:13px;font-weight:500}
.ck-btn-ghost:hover{color:rgba(255,255,255,.75);filter:none;transform:none}
.ck-modal-overlay{position:fixed;inset:0;z-index:9999;background:rgba(5,13,26,.75);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;padding:0 0 env(safe-area-inset-bottom,0);animation:ck-fade-in .25s ease both}
@keyframes ck-fade-in{from{opacity:0}to{opacity:1}}
.ck-modal{position:relative;width:100%;max-width:580px;max-height:85vh;overflow-y:auto;background:rgba(10,37,64,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(0,102,255,.2);border-bottom:none;border-radius:20px 20px 0 0;padding:32px 28px 28px;box-shadow:0 -16px 64px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04) inset;animation:ck-modal-up .38s cubic-bezier(.16,1,.3,1) both;scrollbar-width:thin;scrollbar-color:rgba(0,102,255,.4) transparent}
.ck-modal::-webkit-scrollbar{width:4px}.ck-modal::-webkit-scrollbar-track{background:transparent}.ck-modal::-webkit-scrollbar-thumb{background:rgba(0,102,255,.4);border-radius:2px}
@keyframes ck-modal-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:640px){.ck-modal-overlay{align-items:center;padding:24px}.ck-modal{border-radius:20px;border:1px solid rgba(0,102,255,.2)}}
.ck-modal-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:50%;width:30px;height:30px;color:rgba(255,255,255,.5);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;padding:0;font-family:inherit}
.ck-modal-close:hover{background:rgba(255,255,255,.14);color:#fff}
.ck-modal-title{font-size:17px;font-weight:700;color:#fff;margin:0 0 6px;letter-spacing:-.01em}
.ck-modal-sub{font-size:13px;color:rgba(255,255,255,.5);margin:0 0 24px;line-height:1.5}
.ck-cats{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.ck-cat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 16px 10px;transition:border-color .2s}
.ck-cat--open{border-color:rgba(0,102,255,.25);background:rgba(0,102,255,.04)}
.ck-cat-header{display:flex;align-items:flex-start;gap:16px;justify-content:space-between}
.ck-cat-info{flex:1}
.ck-cat-label{font-size:13.5px;font-weight:600;color:#fff;margin:0 0 3px}
.ck-cat-desc{font-size:12px;color:rgba(255,255,255,.45);margin:0;line-height:1.5}
.ck-cat-expand-btn{background:none;border:none;color:rgba(0,102,255,.7);font-size:11px;font-weight:500;cursor:pointer;padding:6px 0 0;letter-spacing:.01em;transition:color .15s;display:block;font-family:inherit}
.ck-cat-expand-btn:hover{color:#0066FF}
.ck-cat-details{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;gap:7px}
.ck-detail-row{display:flex;gap:12px;font-size:12px;line-height:1.5}
.ck-detail-key{flex-shrink:0;width:80px;color:rgba(255,255,255,.35);font-weight:500}
.ck-detail-val{color:rgba(255,255,255,.6)}
.ck-toggle{flex-shrink:0;width:44px;height:24px;border-radius:12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);cursor:pointer;position:relative;transition:background .2s,border-color .2s;padding:0;margin-top:2px}
.ck-toggle.on{background:linear-gradient(135deg,#0066FF,#0052cc);border-color:#0066FF}
.ck-toggle.required{opacity:.5;cursor:not-allowed}
.ck-toggle-thumb{position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s cubic-bezier(.16,1,.3,1);box-shadow:0 1px 4px rgba(0,0,0,.3);pointer-events:none}
.ck-toggle.on .ck-toggle-thumb{transform:translateX(20px)}
.ck-modal-actions{display:flex;gap:8px;flex-wrap:wrap}
.ck-modal-actions .ck-btn-primary{flex:1;min-width:180px}
.ck-float-btn{position:fixed;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:20px;z-index:9990;width:40px;height:40px;border-radius:50%;background:rgba(10,37,64,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(0,102,255,.25);box-shadow:0 4px 20px rgba(0,0,0,.3);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;padding:0}
.ck-float-btn:hover{transform:scale(1.12);box-shadow:0 6px 28px rgba(0,102,255,.35)}
@media(max-width:640px){.ck-inner{padding:16px 20px 20px;gap:16px;flex-direction:column;align-items:stretch}.ck-text{min-width:unset}.ck-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ck-btn-ghost{grid-column:1/-1;text-align:center}.ck-modal{padding:24px 16px 24px}.ck-modal-actions{flex-direction:column}.ck-modal-actions .ck-btn-primary{min-width:unset}}
`;

  function injectStyles() {
    if (document.getElementById('ck-styles')) return;
    var style = document.createElement('style');
    style.id = 'ck-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ── 7. État de la bannière ──

  var _prefs = {
    statistics: false, marketing: false,
    personalization: false, functional: false,
  };
  var _expanded = null;
  var _bannerEl = null;
  var _modalEl  = null;
  var _floatEl  = null;

  function buildBanner() {
    var el = document.createElement('div');
    el.className = 'ck-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Gestion des cookies');
    el.innerHTML = '<div class="ck-inner">'
      + '<div class="ck-text">'
      + '<p class="ck-title">🍪 Respect de votre vie privée</p>'
      + '<p class="ck-body">CA-TECH utilise des cookies pour améliorer votre expérience, mesurer l\'audience, personnaliser certains contenus et optimiser nos services. Vous gardez le contrôle de vos choix. <a href="/politique-de-confidentialite" style="color:inherit;text-decoration:underline">En savoir plus</a></p>'
      + '</div>'
      + '<div class="ck-actions">'
      + '<button class="ck-btn ck-btn-primary" id="ck-accept-all">Tout accepter</button>'
      + '<button class="ck-btn ck-btn-secondary" id="ck-refuse-all">Tout refuser</button>'
      + '<button class="ck-btn ck-btn-ghost" id="ck-customize">Personnaliser</button>'
      + '</div>'
      + '</div>';
    return el;
  }

  function buildCatHTML(cat) {
    var isOn = cat.required || !!_prefs[cat.id];
    return '<div class="ck-cat" id="ck-cat-' + cat.id + '">'
      + '<div class="ck-cat-header">'
      + '<div class="ck-cat-info">'
      + '<p class="ck-cat-label">' + cat.label + '</p>'
      + '<p class="ck-cat-desc">' + cat.desc + '</p>'
      + '</div>'
      + '<button role="switch" aria-checked="' + isOn + '" aria-label="' + cat.label + '" class="ck-toggle' + (isOn ? ' on' : '') + (cat.required ? ' required' : '') + '" id="ck-toggle-' + cat.id + '"' + (cat.required ? ' disabled' : '') + '><span class="ck-toggle-thumb"></span></button>'
      + '</div>'
      + '<button class="ck-cat-expand-btn" id="ck-exp-' + cat.id + '" aria-expanded="false">Voir les détails ▼</button>'
      + '<div class="ck-cat-details" id="ck-det-' + cat.id + '" style="display:none">'
      + '<div class="ck-detail-row"><span class="ck-detail-key">Finalité</span><span class="ck-detail-val">' + cat.purpose + '</span></div>'
      + '<div class="ck-detail-row"><span class="ck-detail-key">Durée</span><span class="ck-detail-val">' + cat.duration + '</span></div>'
      + '<div class="ck-detail-row"><span class="ck-detail-key">Fournisseurs</span><span class="ck-detail-val">' + cat.providers + '</span></div>'
      + '</div>'
      + '</div>';
  }

  function buildModal() {
    var el = document.createElement('div');
    el.className = 'ck-modal-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Gérer mes préférences cookies');
    var catsHTML = CATS.map(buildCatHTML).join('');
    el.innerHTML = '<div class="ck-modal">'
      + '<button class="ck-modal-close" id="ck-modal-close" aria-label="Fermer">✕</button>'
      + '<p class="ck-modal-title">Gérer mes préférences</p>'
      + '<p class="ck-modal-sub">Activez ou désactivez chaque catégorie. Les cookies strictement nécessaires sont toujours actifs.</p>'
      + '<div class="ck-cats">' + catsHTML + '</div>'
      + '<div class="ck-modal-actions">'
      + '<button class="ck-btn ck-btn-primary" id="ck-save-custom">Enregistrer mes préférences</button>'
      + '<button class="ck-btn ck-btn-secondary" id="ck-modal-refuse">Tout refuser</button>'
      + '<button class="ck-btn ck-btn-ghost" id="ck-modal-accept">Tout accepter</button>'
      + '</div>'
      + '</div>';
    return el;
  }

  function buildFloat() {
    var el = document.createElement('button');
    el.className = 'ck-float-btn';
    el.setAttribute('aria-label', 'Gérer mes préférences cookies');
    el.title = 'Gérer mes cookies';
    el.textContent = '🍪';
    return el;
  }

  function updateToggleUI(catId, isOn) {
    var btn = document.getElementById('ck-toggle-' + catId);
    if (!btn) return;
    btn.setAttribute('aria-checked', isOn);
    if (isOn) btn.classList.add('on'); else btn.classList.remove('on');
  }

  function toggleExpand(catId) {
    var det = document.getElementById('ck-det-' + catId);
    var exp = document.getElementById('ck-exp-' + catId);
    var cat = document.getElementById('ck-cat-' + catId);
    if (!det) return;
    var open = _expanded === catId;
    if (_expanded) {
      var prevDet = document.getElementById('ck-det-' + _expanded);
      var prevExp = document.getElementById('ck-exp-' + _expanded);
      var prevCat = document.getElementById('ck-cat-' + _expanded);
      if (prevDet) prevDet.style.display = 'none';
      if (prevExp) { prevExp.textContent = 'Voir les détails ▼'; prevExp.setAttribute('aria-expanded', 'false'); }
      if (prevCat) prevCat.classList.remove('ck-cat--open');
    }
    if (!open) {
      _expanded = catId;
      det.style.display = 'flex';
      if (exp) { exp.textContent = 'Masquer les détails ▲'; exp.setAttribute('aria-expanded', 'true'); }
      if (cat) cat.classList.add('ck-cat--open');
    } else {
      _expanded = null;
    }
  }

  function openModal() {
    if (_modalEl) return;
    _modalEl = buildModal();
    document.body.appendChild(_modalEl);

    // Overlay click
    _modalEl.addEventListener('click', function (e) {
      if (e.target === _modalEl) closeModal();
    });

    // Fermer
    var closeBtn = document.getElementById('ck-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Toggles
    CATS.forEach(function (cat) {
      if (cat.required) return;
      var btn = document.getElementById('ck-toggle-' + cat.id);
      if (!btn) return;
      btn.addEventListener('click', function () {
        _prefs[cat.id] = !_prefs[cat.id];
        updateToggleUI(cat.id, _prefs[cat.id]);
      });
      var exp = document.getElementById('ck-exp-' + cat.id);
      if (exp) exp.addEventListener('click', function () { toggleExpand(cat.id); });
    });

    // Bouton expand nécessaire
    var expNec = document.getElementById('ck-exp-necessary');
    if (expNec) expNec.addEventListener('click', function () { toggleExpand('necessary'); });

    // Actions modal
    var saveBtn   = document.getElementById('ck-save-custom');
    var refuseBtn = document.getElementById('ck-modal-refuse');
    var acceptBtn = document.getElementById('ck-modal-accept');
    if (saveBtn)   saveBtn.addEventListener('click',   saveCustom);
    if (refuseBtn) refuseBtn.addEventListener('click', function() { refuseAll('modal'); });
    if (acceptBtn) acceptBtn.addEventListener('click', function() { acceptAll('modal'); });
  }

  function closeModal() {
    if (_modalEl) { document.body.removeChild(_modalEl); _modalEl = null; _expanded = null; }
  }

  function showBanner() {
    if (_bannerEl) return;
    _bannerEl = buildBanner();
    document.body.appendChild(_bannerEl);
    document.getElementById('ck-accept-all').addEventListener('click',  function() { acceptAll('banner'); });
    document.getElementById('ck-refuse-all').addEventListener('click',  function() { refuseAll('banner'); });
    document.getElementById('ck-customize').addEventListener('click',   openModal);
  }

  function hideBanner() {
    if (_bannerEl) { document.body.removeChild(_bannerEl); _bannerEl = null; }
  }

  function showFloat() {
    if (_floatEl) return;
    _floatEl = buildFloat();
    _floatEl.addEventListener('click', openModal);
    document.body.appendChild(_floatEl);
  }

  function acceptAll(source) {
    _prefs = { statistics: true, marketing: true, personalization: true, functional: true };
    saveConsent(_prefs, typeof source === 'string' ? source : 'accept-all'); applyConsent(_prefs);
    hideBanner(); closeModal(); showFloat();
  }

  function refuseAll(source) {
    _prefs = { statistics: false, marketing: false, personalization: false, functional: false };
    saveConsent(_prefs, typeof source === 'string' ? source : 'refuse-all'); applyConsent(_prefs);
    hideBanner(); closeModal(); showFloat();
  }

  function saveCustom() {
    saveConsent(_prefs, 'modal-custom'); applyConsent(_prefs);
    hideBanner(); closeModal(); showFloat();
  }

  // ── 9. Init après DOM ready ──

  function init() {
    // Sur la page dédiée /gestion-des-cookies, ne pas afficher la bannière ni le float
    var noUi = document.body && document.body.hasAttribute('data-no-cookie-banner');

    injectStyles();
    var s = loadStored();
    if (!s) {
      if (!noUi) showBanner();
    } else {
      _prefs = { statistics: !!s.statistics, marketing: !!s.marketing, personalization: !!s.personalization, functional: !!s.functional };
      activateConsentScripts(_prefs);
      if (!noUi) showFloat();
    }

    window.addEventListener('ca-tech:open-cookie-prefs', function () { openModal(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── 10. API publique (utilisée par /gestion-des-cookies) ──

  window.CATechConsent = {
    apply:     applyConsent,
    save:      saveConsent,
    load:      loadStored,
    acceptAll: acceptAll,
    refuseAll: refuseAll,
  };

})();
