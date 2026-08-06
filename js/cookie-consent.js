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
/* ── Cookie Consent CA-TECH v3 ── */
.ck-banner{position:fixed;bottom:24px;left:24px;z-index:9998;max-width:360px;width:calc(100% - 48px);animation:ck-appear .5s cubic-bezier(.16,1,.3,1) both}
@keyframes ck-appear{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(prefers-reduced-motion:reduce){.ck-banner,.ck-modal-overlay,.ck-modal,.ck-float-btn{animation:none!important;transition:none!important}}
.ck-inner{background:rgba(5,13,26,.96);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:1px solid rgba(255,255,255,.08);border-top:1px solid rgba(0,102,255,.22);border-radius:16px;box-shadow:0 0 0 1px rgba(255,255,255,.03) inset,0 8px 32px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.3);padding:18px 18px 14px;display:flex;flex-direction:column;gap:12px}
.ck-header{display:flex;align-items:center;gap:9px}
.ck-icon{flex-shrink:0;width:28px;height:28px;border-radius:8px;background:rgba(0,102,255,.15);border:1px solid rgba(0,102,255,.2);display:flex;align-items:center;justify-content:center;color:#4d9fff}
.ck-icon svg{width:13px;height:13px}
.ck-title{font-size:13px;font-weight:700;color:#fff;margin:0;letter-spacing:-.01em;line-height:1.3}
.ck-body{font-size:12px;color:rgba(255,255,255,.52);margin:0;line-height:1.65}
.ck-body a{color:rgba(255,255,255,.65);text-decoration:underline;text-decoration-color:rgba(255,255,255,.2);text-underline-offset:2px;transition:color .15s}
.ck-body a:hover{color:#fff;text-decoration-color:rgba(255,255,255,.5)}
.ck-actions{display:flex;flex-direction:column;gap:7px}
.ck-actions-row{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.ck-btn{border:none;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer;padding:8px 14px;white-space:nowrap;transition:filter .15s,transform .1s;letter-spacing:-.01em;line-height:1.3;font-family:inherit}
.ck-btn:focus-visible{outline:2px solid #0066ff;outline-offset:2px}
.ck-btn:hover{filter:brightness(1.1)}
.ck-btn:active{transform:scale(.97);filter:brightness(.95)}
.ck-btn-primary{background:linear-gradient(135deg,#1a7aff,#0052cc);color:#fff;box-shadow:0 1px 8px rgba(0,102,255,.4),0 0 0 1px rgba(255,255,255,.08) inset}
.ck-btn-secondary{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.1)}
.ck-btn-secondary:hover{background:rgba(255,255,255,.12);filter:none}
.ck-btn-link{background:none;border:none;color:rgba(255,255,255,.35);font-size:11.5px;font-weight:500;cursor:pointer;padding:4px 0;text-align:center;transition:color .15s;letter-spacing:0;font-family:inherit;display:block;width:100%}
.ck-btn-link:hover{color:rgba(255,255,255,.65);filter:none;transform:none}
.ck-modal-overlay{position:fixed;inset:0;z-index:9999;background:rgba(2,8,18,.7);backdrop-filter:blur(8px) saturate(140%);-webkit-backdrop-filter:blur(8px) saturate(140%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:env(safe-area-inset-bottom,0);animation:ck-fade .22s ease both}
@keyframes ck-fade{from{opacity:0}to{opacity:1}}
@media(min-width:640px){.ck-modal-overlay{align-items:center;padding:20px}}
.ck-modal{position:relative;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;background:#06111f;border:1px solid rgba(255,255,255,.07);border-bottom:none;border-radius:20px 20px 0 0;padding:28px 24px 24px;box-shadow:0 -20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.03) inset;animation:ck-modal-up .4s cubic-bezier(.16,1,.3,1) both;scrollbar-width:thin;scrollbar-color:rgba(0,102,255,.35) transparent}
.ck-modal::-webkit-scrollbar{width:3px}.ck-modal::-webkit-scrollbar-track{background:transparent}.ck-modal::-webkit-scrollbar-thumb{background:rgba(0,102,255,.35);border-radius:2px}
@keyframes ck-modal-up{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:640px){.ck-modal{border-radius:20px;border:1px solid rgba(255,255,255,.08);border-top:1px solid rgba(0,102,255,.18)}}
.ck-modal-close{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:50%;width:28px;height:28px;color:rgba(255,255,255,.45);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;padding:0;font-family:inherit}
.ck-modal-close:hover{background:rgba(255,255,255,.12);color:#fff}
.ck-modal-close:focus-visible{outline:2px solid #0066ff;outline-offset:2px}
.ck-modal-title{font-size:16px;font-weight:700;color:#fff;margin:0 0 5px;letter-spacing:-.02em}
.ck-modal-sub{font-size:12.5px;color:rgba(255,255,255,.42);margin:0 0 20px;line-height:1.6}
.ck-cats{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.ck-cat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:13px 14px 9px;transition:border-color .2s,background .2s}
.ck-cat--open{border-color:rgba(0,102,255,.22);background:rgba(0,102,255,.03)}
.ck-cat-header{display:flex;align-items:flex-start;gap:14px;justify-content:space-between}
.ck-cat-info{flex:1}
.ck-cat-label{font-size:13px;font-weight:600;color:#fff;margin:0 0 3px;letter-spacing:-.01em}
.ck-cat-desc{font-size:11.5px;color:rgba(255,255,255,.4);margin:0;line-height:1.55}
.ck-cat-expand-btn{background:none;border:none;color:rgba(0,102,255,.65);font-size:11px;font-weight:500;cursor:pointer;padding:5px 0 0;transition:color .15s;display:block;font-family:inherit}
.ck-cat-expand-btn:hover{color:#4d9fff}
.ck-cat-details{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.05);display:flex;flex-direction:column;gap:6px}
.ck-detail-row{display:flex;gap:10px;font-size:11.5px;line-height:1.5}
.ck-detail-key{flex-shrink:0;width:72px;color:rgba(255,255,255,.28);font-weight:500}
.ck-detail-val{color:rgba(255,255,255,.55)}
.ck-toggle{flex-shrink:0;width:40px;height:22px;border-radius:11px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);cursor:pointer;position:relative;transition:background .22s,border-color .22s;padding:0;margin-top:1px}
.ck-toggle.on{background:#0066FF;border-color:#0066FF}
.ck-toggle.required{opacity:.45;cursor:not-allowed}
.ck-toggle:focus-visible{outline:2px solid #4d9fff;outline-offset:3px}
.ck-toggle-thumb{position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .22s cubic-bezier(.16,1,.3,1);box-shadow:0 1px 3px rgba(0,0,0,.35)}
.ck-toggle.on .ck-toggle-thumb{transform:translateX(18px)}
.ck-modal-actions{display:flex;flex-direction:column;gap:7px}
.ck-modal-actions .ck-btn-primary{padding:10px 14px;font-size:13px}
.ck-modal-actions-row{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.ck-float-btn{position:fixed;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:20px;z-index:9990;display:flex;align-items:center;gap:7px;height:36px;padding:0 12px 0 10px;border-radius:18px;background:rgba(5,13,26,.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.09);box-shadow:0 2px 12px rgba(0,0,0,.35);cursor:pointer;color:rgba(255,255,255,.5);font-size:11.5px;font-weight:500;transition:border-color .2s,box-shadow .2s,color .2s;font-family:inherit}
.ck-float-btn:hover{border-color:rgba(0,102,255,.35);box-shadow:0 4px 20px rgba(0,102,255,.2);color:rgba(255,255,255,.8)}
.ck-float-btn:focus-visible{outline:2px solid #0066ff;outline-offset:2px}
.ck-float-icon{width:14px;height:14px;color:rgba(0,102,255,.7);flex-shrink:0}
@media(max-width:520px){.ck-banner{bottom:0;left:0;right:0;max-width:none;width:100%;animation:ck-appear-mobile .45s cubic-bezier(.16,1,.3,1) both}@keyframes ck-appear-mobile{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.ck-inner{border-radius:16px 16px 0 0;border-bottom:none;padding:16px 16px calc(12px + env(safe-area-inset-bottom,0px))}.ck-modal{padding:22px 16px 20px}}
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

  var SHIELD_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';

  function buildBanner() {
    var el = document.createElement('div');
    el.className = 'ck-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Gestion des cookies');
    el.innerHTML = '<div class="ck-inner">'
      + '<div class="ck-header">'
      + '<div class="ck-icon" aria-hidden="true">' + SHIELD_SVG + '</div>'
      + '<p class="ck-title">Respect de votre vie privée</p>'
      + '</div>'
      + '<p class="ck-body">CA-TECH utilise des cookies pour améliorer votre expérience, mesurer l\'audience, personnaliser certains contenus et optimiser nos services. Vous gardez le contrôle de vos choix. <a href="/politique-de-confidentialite">En savoir plus</a></p>'
      + '<div class="ck-actions">'
      + '<div class="ck-actions-row">'
      + '<button class="ck-btn ck-btn-primary" id="ck-accept-all">Tout accepter</button>'
      + '<button class="ck-btn ck-btn-secondary" id="ck-refuse-all">Tout refuser</button>'
      + '</div>'
      + '<button class="ck-btn-link" id="ck-customize">Personnaliser mes choix</button>'
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
      + '<div class="ck-modal-actions-row">'
      + '<button class="ck-btn ck-btn-secondary" id="ck-modal-refuse">Tout refuser</button>'
      + '<button class="ck-btn ck-btn-secondary" id="ck-modal-accept">Tout accepter</button>'
      + '</div>'
      + '</div>'
      + '</div>';
    return el;
  }

  function buildFloat() {
    var el = document.createElement('button');
    el.className = 'ck-float-btn';
    el.setAttribute('aria-label', 'Gérer mes préférences cookies');
    el.title = 'Gérer mes cookies';
    el.innerHTML = '<svg class="ck-float-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Cookies';
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
