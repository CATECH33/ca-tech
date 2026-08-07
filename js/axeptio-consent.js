/* ══════════════════════════════════════════════════════════════════════
   CA-TECH — Axeptio CMP v1.1
   ▸ Chargé en PREMIER, sans defer/async, avant tout script Google
   ▸ Compatible : GA4, Google Ads, Clarity, Meta Pixel, LinkedIn, Stripe
   ▸ Google Consent Mode v2 — 7 signaux complets (recommandations 2026)

   SIGNAUX GCM v2 (tous denied par défaut) :
     analytics_storage      — cookies analytiques (GA4, Clarity)
     ad_storage             — cookies publicitaires (Ads, Meta, LinkedIn)
     ad_user_data           — envoi de données utilisateur à Google Ads
     ad_personalization     — publicités personnalisées
     functionality_storage  — cookies fonctionnels (Stripe, préférences)
     personalization_storage— personnalisation de contenu
     security_storage       — sécurité / anti-fraude (Stripe)

   MISE EN PLACE :
   1. Créer un compte sur https://admin.axept.io
   2. Créer un projet pour ca-tech.fr, ajouter les services listés en §2
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
    //  analytics_storage ────────────────────────────────────────────────
    'google-analytics': {
      gcm:  { analytics_storage: 'granted' },
      init: function () { _loadGA4(); },
    },
    'microsoft-clarity': {
      gcm:  { analytics_storage: 'granted' },
      init: function () { _loadClarity(); },
    },
    //  ad_storage + ad_user_data + ad_personalization ───────────────────
    'google-ads': {
      gcm:  { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
      init: function () { _loadGoogleAds(); },
    },
    'meta-pixel': {
      gcm:  { ad_storage: 'granted', ad_user_data: 'granted' },
      init: function () { _loadMetaPixel(); },
    },
    'linkedin-insight': {
      gcm:  { ad_storage: 'granted', ad_user_data: 'granted' },
      init: function () { _loadLinkedIn(); },
    },
    //  functionality_storage + security_storage ─────────────────────────
    'stripe': {
      gcm:  { functionality_storage: 'granted', security_storage: 'granted' },
      init: function () { /* chargé à la demande sur /devis */ },
    },
    //  personalization_storage ──────────────────────────────────────────
    //  (réservé pour une future fonctionnalité de personnalisation)
    // 'personalization': { gcm: { personalization_storage: 'granted' }, init: function () {} },
  };

  // ══════════════════════════════════════════════════════════════════════
  // §3 — GOOGLE CONSENT MODE V2 — DÉFAUT DENIED (7 signaux)
  //      Synchrone — s'exécute avant tout tag Google
  //      Recommandations Google 2026 :
  //        • Tous les signaux denied par défaut (RGPD / CNIL strict)
  //        • wait_for_update : 500 ms max avant que GTM charge en mode dégradé
  //        • ads_data_redaction : masque les données d'identification côté Google
  //        • url_passthrough : préserve gclid/fbclid dans l'URL sans cookie
  // ══════════════════════════════════════════════════════════════════════

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    analytics_storage:       'denied',  // GA4, Clarity
    ad_storage:              'denied',  // Google Ads, Meta, LinkedIn
    ad_user_data:            'denied',  // envoi données users vers Google Ads
    ad_personalization:      'denied',  // remarketing / publicité personnalisée
    functionality_storage:   'denied',  // préférences, Stripe paiement
    personalization_storage: 'denied',  // personnalisation de contenu
    security_storage:        'denied',  // anti-fraude Stripe (accordé si Stripe accepté)
    wait_for_update:         500,       // ms — GTM attend le signal CMP avant de charger
  });

  // Quand ad_storage est denied : redacte les identifiants publicitaires
  // côté Google et préserve gclid/fbclid via URL (sans cookie tiers)
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
  // §7 — PERSONNALISATION VISUELLE AXEPTIO
  //      Injecte un <style> qui surcharge le thème Axeptio par défaut.
  //      Sélecteurs à partir de #axeptio_overlay (pas d'iframe).
  // ══════════════════════════════════════════════════════════════════════

  (function () {
    var css = [
      /* ── Overlay backdrop ─────────────────────────────────────── */
      '#axeptio_overlay {',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
      '}',

      /* ── Widget container ─────────────────────────────────────── */
      '#axeptio_overlay .ax-widget {',
      '  background: rgba(5, 13, 26, 0.97) !important;',
      '  backdrop-filter: blur(24px) saturate(180%) !important;',
      '  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;',
      '  border: 1px solid rgba(0, 102, 255, 0.20) !important;',
      '  border-top: 2px solid #0066FF !important;',
      '  border-radius: 16px !important;',
      '  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.60), 0 0 40px rgba(0, 102, 255, 0.10) !important;',
      '  color: #FFFFFF !important;',
      '  overflow: hidden !important;',
      '}',

      /* ── Titres ───────────────────────────────────────────────── */
      '#axeptio_overlay .ax-widget h1,',
      '#axeptio_overlay .ax-widget h2,',
      '#axeptio_overlay .ax-widget h3 {',
      '  color: #FFFFFF !important;',
      '  font-weight: 700 !important;',
      '}',

      /* ── Texte courant ────────────────────────────────────────── */
      '#axeptio_overlay .ax-widget p,',
      '#axeptio_overlay .ax-widget span,',
      '#axeptio_overlay .ax-widget label,',
      '#axeptio_overlay .ax-widget a {',
      '  color: rgba(255, 255, 255, 0.75) !important;',
      '}',
      '#axeptio_overlay .ax-widget a:hover {',
      '  color: #00D4FF !important;',
      '}',

      /* ── Bouton principal : Tout accepter ─────────────────────── */
      '#axeptio_overlay .ax-widget button[data-type="accept"],',
      '#axeptio_overlay .ax-widget .ax-accept-all,',
      '#axeptio_overlay .ax-widget [class*="accept"]:not([class*="refuse"]):not([class*="personalize"]) {',
      '  background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%) !important;',
      '  color: #FFFFFF !important;',
      '  border: none !important;',
      '  border-radius: 10px !important;',
      '  font-weight: 600 !important;',
      '  font-size: 0.875rem !important;',
      '  padding: 12px 20px !important;',
      '  cursor: pointer !important;',
      '  transition: opacity 0.15s ease, transform 0.15s ease !important;',
      '  box-shadow: 0 4px 16px rgba(0, 102, 255, 0.35) !important;',
      '}',
      '#axeptio_overlay .ax-widget button[data-type="accept"]:hover,',
      '#axeptio_overlay .ax-widget .ax-accept-all:hover {',
      '  opacity: 0.88 !important;',
      '  transform: translateY(-1px) !important;',
      '}',

      /* ── Bouton secondaire : Tout refuser ─────────────────────── */
      '#axeptio_overlay .ax-widget button[data-type="refuse"],',
      '#axeptio_overlay .ax-widget .ax-refuse-all,',
      '#axeptio_overlay .ax-widget [class*="refuse"] {',
      '  background: rgba(255, 255, 255, 0.06) !important;',
      '  color: rgba(255, 255, 255, 0.80) !important;',
      '  border: 1px solid rgba(255, 255, 255, 0.15) !important;',
      '  border-radius: 10px !important;',
      '  font-weight: 600 !important;',
      '  font-size: 0.875rem !important;',
      '  padding: 12px 20px !important;',
      '  cursor: pointer !important;',
      '  transition: background 0.15s ease !important;',
      '}',
      '#axeptio_overlay .ax-widget button[data-type="refuse"]:hover,',
      '#axeptio_overlay .ax-widget .ax-refuse-all:hover {',
      '  background: rgba(255, 255, 255, 0.10) !important;',
      '}',

      /* ── Bouton tertiaire : Personnaliser ─────────────────────── */
      '#axeptio_overlay .ax-widget button[data-type="personalize"],',
      '#axeptio_overlay .ax-widget .ax-customize,',
      '#axeptio_overlay .ax-widget [class*="personalize"],',
      '#axeptio_overlay .ax-widget [class*="customize"] {',
      '  background: transparent !important;',
      '  color: #00D4FF !important;',
      '  border: 1px solid rgba(0, 212, 255, 0.30) !important;',
      '  border-radius: 10px !important;',
      '  font-weight: 600 !important;',
      '  font-size: 0.875rem !important;',
      '  padding: 12px 20px !important;',
      '  cursor: pointer !important;',
      '  transition: border-color 0.15s ease, background 0.15s ease !important;',
      '}',
      '#axeptio_overlay .ax-widget button[data-type="personalize"]:hover,',
      '#axeptio_overlay .ax-widget .ax-customize:hover {',
      '  background: rgba(0, 212, 255, 0.08) !important;',
      '  border-color: rgba(0, 212, 255, 0.55) !important;',
      '}',

      /* ── Toggles / switches ───────────────────────────────────── */
      '#axeptio_overlay .ax-widget input[type="checkbox"]:checked + *,',
      '#axeptio_overlay .ax-widget [class*="toggle"][class*="active"],',
      '#axeptio_overlay .ax-widget [class*="switch"][class*="on"] {',
      '  background: #0066FF !important;',
      '}',

      /* ── Séparateurs / dividers ───────────────────────────────── */
      '#axeptio_overlay .ax-widget hr,',
      '#axeptio_overlay .ax-widget [class*="divider"],',
      '#axeptio_overlay .ax-widget [class*="separator"] {',
      '  border-color: rgba(255, 255, 255, 0.08) !important;',
      '}',

      /* ── Close / X button ─────────────────────────────────────── */
      '#axeptio_overlay .ax-widget [class*="close"] {',
      '  color: rgba(255, 255, 255, 0.45) !important;',
      '}',
      '#axeptio_overlay .ax-widget [class*="close"]:hover {',
      '  color: rgba(255, 255, 255, 0.80) !important;',
      '}',

      /* ── Animation d'entrée (spring) ──────────────────────────── */
      '@keyframes caTechSlideUp {',
      '  from { opacity: 0; transform: translateY(24px) scale(0.97); }',
      '  to   { opacity: 1; transform: translateY(0)    scale(1);    }',
      '}',
      '#axeptio_overlay .ax-widget {',
      '  animation: caTechSlideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both !important;',
      '}',

      /* ── Mobile ───────────────────────────────────────────────── */
      '@media (max-width: 520px) {',
      '  #axeptio_overlay .ax-widget {',
      '    border-radius: 16px 16px 0 0 !important;',
      '    left: 0 !important;',
      '    right: 0 !important;',
      '    bottom: 0 !important;',
      '    width: 100% !important;',
      '    max-width: 100% !important;',
      '    margin: 0 !important;',
      '  }',
      '}',
    ].join('\n');

    var style = document.getElementById('ca-axeptio-theme');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ca-axeptio-theme';
      style.textContent = css;
      document.head.appendChild(style);
    }
  })();

  // ══════════════════════════════════════════════════════════════════════
  // §8 — API PUBLIQUE window.CATechConsent
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
