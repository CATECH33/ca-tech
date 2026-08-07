/* ══════════════════════════════════════════════════════════════════════
   CA-TECH — Axeptio CMP v1.0
   ▸ Chargé en PREMIER, sans defer/async, avant tout script Google
   ▸ Compatible : GA4, Google Ads, Clarity, Meta Pixel, LinkedIn, Stripe
   ▸ Google Consent Mode v2 natif

   MISE EN PLACE :
   1. Créer un compte sur https://admin.axept.io
   2. Créer un projet pour ca-tech.fr, ajouter les services listés en §1
   3. Copier le Client ID dans CONFIG.axeptio.clientId ci-dessous
   4. Renseigner les IDs des services tiers activés
   ══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════
  // §1 — CONFIGURATION CENTRALE
  //      Tous les IDs à renseigner sont ici.
  //      Les clés de SERVICES (§2) doivent correspondre exactement
  //      aux noms de services déclarés dans votre dashboard Axeptio.
  // ══════════════════════════════════════════════════════════════════════

  var CONFIG = {
    axeptio: {
      clientId:       '686e8f86b80b5e7c51a0e5b9',
      cookiesVersion: 'ca-tech-fr',              // ← nom de version dans Axeptio
    },
    ga4:       { id: 'G-R526KDMC17' },
    googleAds: { id: '' },   // ex: 'AW-1234567890'
    clarity:   { id: '' },   // ex: 'abc123xyz'
    metaPixel: { id: '' },   // ex: '1234567890123456'
    linkedin:  { id: '' },   // ex: '1234567'
    // Stripe : chargé à la demande sur /devis, pas d'ID global nécessaire
  };

  // ══════════════════════════════════════════════════════════════════════
  // §2 — TABLE DES SERVICES
  //      Clé = nom exact du service dans votre dashboard Axeptio
  //      gcm  = signaux Consent Mode v2 accordés si le service est accepté
  //      init = fonction à appeler pour charger le script du service
  //
  //      Services à créer dans Axeptio (Cookies → Ajouter un service) :
  //        - google-analytics    (Analytique)
  //        - google-ads          (Marketing)
  //        - microsoft-clarity   (Analytique)
  //        - meta-pixel          (Marketing)
  //        - linkedin-insight    (Marketing)
  //        - stripe              (Fonctionnel)
  // ══════════════════════════════════════════════════════════════════════

  var SERVICES = {
    'google-analytics': {
      gcm:  { analytics_storage: 'granted' },
      init: function () { _loadGA4(); },
    },
    'google-ads': {
      gcm:  { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
      init: function () { _loadGoogleAds(); },
    },
    'microsoft-clarity': {
      gcm:  { analytics_storage: 'granted' },
      init: function () { _loadClarity(); },
    },
    'meta-pixel': {
      gcm:  { ad_storage: 'granted', ad_user_data: 'granted' },
      init: function () { _loadMetaPixel(); },
    },
    'linkedin-insight': {
      gcm:  { ad_storage: 'granted' },
      init: function () { _loadLinkedIn(); },
    },
    'stripe': {
      gcm:  { functionality_storage: 'granted' },
      init: function () { /* chargé à la demande sur /devis */ },
    },
  };

  // ══════════════════════════════════════════════════════════════════════
  // §3 — GOOGLE CONSENT MODE V2 — DÉFAUT DENIED
  //      Synchrone — s'exécute avant tout tag Google
  // ══════════════════════════════════════════════════════════════════════

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage:              'denied',
    analytics_storage:       'denied',
    ad_user_data:            'denied',
    ad_personalization:      'denied',
    functionality_storage:   'denied',
    personalization_storage: 'denied',
    wait_for_update:         500,
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough',    true);

  // ══════════════════════════════════════════════════════════════════════
  // §4 — INJECTION DES SCRIPTS TIERS
  //      Chaque fonction est idempotente (protégée par _loaded)
  // ══════════════════════════════════════════════════════════════════════

  var _loaded = {};

  function _injectScript(src, onload) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  function _loadGA4() {
    if (_loaded.ga4 || !CONFIG.ga4.id) return;
    _loaded.ga4 = true;
    _injectScript(
      'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4.id,
      function () {
        gtag('js', new Date());
        gtag('config', CONFIG.ga4.id, { anonymize_ip: true });
      }
    );
  }

  function _loadGoogleAds() {
    if (_loaded.gads || !CONFIG.googleAds.id) return;
    _loaded.gads = true;
    _injectScript(
      'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.googleAds.id,
      function () { gtag('config', CONFIG.googleAds.id); }
    );
  }

  function _loadClarity() {
    if (_loaded.clarity || !CONFIG.clarity.id) return;
    _loaded.clarity = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CONFIG.clarity.id);
  }

  function _loadMetaPixel() {
    if (_loaded.meta || !CONFIG.metaPixel.id) return;
    _loaded.meta = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', CONFIG.metaPixel.id);
    fbq('track', 'PageView');
  }

  function _loadLinkedIn() {
    if (_loaded.linkedin || !CONFIG.linkedin.id) return;
    _loaded.linkedin = true;
    window._linkedin_partner_id = CONFIG.linkedin.id;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(CONFIG.linkedin.id);
    _injectScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
  }

  // ══════════════════════════════════════════════════════════════════════
  // §5 — MOTEUR DE CONSENTEMENT
  //      Appelé par Axeptio à chaque choix (acceptation, refus, custom)
  // ══════════════════════════════════════════════════════════════════════

  function _applyChoices(choices) {
    var gcmUpdate = {};

    Object.keys(SERVICES).forEach(function (vendor) {
      if (!choices[vendor]) return;
      var svc = SERVICES[vendor];
      Object.assign(gcmUpdate, svc.gcm);
      svc.init();
    });

    if (Object.keys(gcmUpdate).length > 0) {
      gtag('consent', 'update', gcmUpdate);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // §6 — INITIALISATION AXEPTIO
  // ══════════════════════════════════════════════════════════════════════

  window.axeptioSettings = {
    clientId:       CONFIG.axeptio.clientId,
    cookiesVersion: CONFIG.axeptio.cookiesVersion,
  };

  // Callback : Axeptio appellera cette fonction après chaque décision
  void 0 === window._axcb && (window._axcb = []);
  window._axcb.push(function (sdk) {
    sdk.on('cookies:complete', function (choices) {
      _applyChoices(choices);
    });
  });

  // Chargement asynchrone du SDK Axeptio (ne bloque pas le rendu)
  (function (d, s) {
    var t = d.getElementsByTagName(s)[0];
    var e = d.createElement(s);
    e.async = true;
    e.src = '//static.axept.io/sdk-slim.js';
    t.parentNode.insertBefore(e, t);
  }(document, 'script'));

  // ══════════════════════════════════════════════════════════════════════
  // §7 — API PUBLIQUE window.CATechConsent
  //      Utilisable depuis toutes les pages (bouton "Gérer mes cookies",
  //      /gestion-des-cookies, etc.)
  // ══════════════════════════════════════════════════════════════════════

  window.CATechConsent = {
    /** Rouvrir le widget Axeptio */
    openPreferences: function () {
      if (window.axeptio && window.axeptio.openCookies) {
        window.axeptio.openCookies();
      }
    },
    /** Choix courants de l'utilisateur */
    getChoices: function () {
      return (window.axeptio && window.axeptio.userPreferences) || {};
    },
    /** Ajouter un callback quand le SDK est prêt */
    onReady: function (cb) {
      void 0 === window._axcb && (window._axcb = []);
      window._axcb.push(function (sdk) { cb(sdk); });
    },
  };

})();
