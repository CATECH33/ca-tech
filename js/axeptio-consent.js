/* ══════════════════════════════════════════════════════════════════════
   CA-TECH — Script Manager v2.0
   ▸ Chargé en PREMIER, sans defer/async, avant tout script Google
   ▸ Registre centralisé de tous les scripts tiers
   ▸ Blocage automatique jusqu'au consentement Axeptio
   ▸ Chargement dynamique, conditionnel (page, ID configuré)
   ▸ Google Consent Mode v2 — 7 signaux (recommandations 2026)

   SIGNAUX GCM v2 (tous denied par défaut) :
     analytics_storage      — cookies analytiques      (GA4, Clarity)
     ad_storage             — cookies publicitaires     (Ads, Meta, LinkedIn)
     ad_user_data           — envoi données vers Google Ads
     ad_personalization     — publicités personnalisées
     functionality_storage  — cookies fonctionnels      (Stripe, Maps, YouTube)
     personalization_storage— personnalisation de contenu
     security_storage       — sécurité / anti-fraude    (Stripe)

   AJOUTER UN SERVICE :
     1. Déclarer l'ID dans §1 CONFIG
     2. Ajouter une entrée dans §2 REGISTRY
     3. Créer le service dans le dashboard Axeptio (même clé)
   ══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════
  // §1 — CONFIGURATION CENTRALE
  //      Un seul endroit pour tous les IDs tiers.
  //      Laisser vide ('') = service ignoré, aucun script chargé.
  // ══════════════════════════════════════════════════════════════════════

  var CONFIG = {
    axeptio: {
      clientId:       '686e8f86b80b5e7c51a0e5b9',
      cookiesVersion: 'ca-tech-fr',
    },
    ga4:        { id:  'G-R526KDMC17' },
    googleAds:  { id:  '' },          // ex: 'AW-1234567890'
    clarity:    { id:  '' },          // ex: 'abc123xyz'
    metaPixel:  { id:  '' },          // ex: '1234567890123456'
    linkedin:   { id:  '' },          // ex: '1234567'
    googleMaps: { key: '' },          // ex: 'AIzaSy...'
    // Stripe : pas d'ID global — JS chargé sur /devis uniquement
    // YouTube : pas d'ID — activé par présence de [data-yt-src] dans le DOM
  };

  // ══════════════════════════════════════════════════════════════════════
  // §2 — REGISTRE CENTRALISÉ DES SCRIPTS
  //
  //  Chaque entrée = un service tiers. Clé = nom exact dans Axeptio.
  //
  //  Champs :
  //    label    — nom lisible (pour debug / CATechConsent.getRegistry())
  //    category — 'analytics' | 'advertising' | 'functional'
  //    gcm      — signaux GCM v2 à accorder si le service est accepté
  //    active() — false → service ignoré (ID absent ou condition non remplie)
  //    page(p)  — (optionnel) false → ignoré hors de la page cible
  //    load()   — injection du script ; appelée une seule fois max
  //
  //  Services à créer dans Axeptio (dashboard → Cookies → Ajouter) :
  //    google-analytics  (Analytique)
  //    microsoft-clarity (Analytique)
  //    google-ads        (Marketing)
  //    meta-pixel        (Marketing)
  //    linkedin-insight  (Marketing)
  //    stripe            (Fonctionnel)
  //    youtube           (Fonctionnel)
  //    google-maps       (Fonctionnel)
  // ══════════════════════════════════════════════════════════════════════

  var REGISTRY = {

    // ── Analytique ───────────────────────────────────────────────────────

    'google-analytics': {
      label:    'Google Analytics 4',
      category: 'analytics',
      gcm:      { analytics_storage: 'granted' },
      active:   function () { return !!CONFIG.ga4.id; },
      load: function () {
        _script(
          'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4.id,
          function () {
            gtag('js', new Date());
            gtag('config', CONFIG.ga4.id, { anonymize_ip: true });
          }
        );
      },
    },

    'microsoft-clarity': {
      label:    'Microsoft Clarity',
      category: 'analytics',
      gcm:      { analytics_storage: 'granted' },
      active:   function () { return !!CONFIG.clarity.id; },
      load: function () {
        (function (c, l, a, r, i, t, y) {
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
          t = l.createElement(r); t.async = 1;
          t.src = 'https://www.clarity.ms/tag/' + i;
          y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', CONFIG.clarity.id);
      },
    },

    // ── Publicité ────────────────────────────────────────────────────────

    'google-ads': {
      label:    'Google Ads',
      category: 'advertising',
      gcm:      { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
      active:   function () { return !!CONFIG.googleAds.id; },
      load: function () {
        _script(
          'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.googleAds.id,
          function () { gtag('config', CONFIG.googleAds.id); }
        );
      },
    },

    'meta-pixel': {
      label:    'Meta Pixel',
      category: 'advertising',
      gcm:      { ad_storage: 'granted', ad_user_data: 'granted' },
      active:   function () { return !!CONFIG.metaPixel.id; },
      load: function () {
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
      },
    },

    'linkedin-insight': {
      label:    'LinkedIn Insight Tag',
      category: 'advertising',
      gcm:      { ad_storage: 'granted', ad_user_data: 'granted' },
      active:   function () { return !!CONFIG.linkedin.id; },
      load: function () {
        window._linkedin_partner_id = CONFIG.linkedin.id;
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(CONFIG.linkedin.id);
        _script('https://snap.licdn.com/li.lms-analytics/insight.min.js');
      },
    },

    // ── Fonctionnel ──────────────────────────────────────────────────────

    'stripe': {
      label:    'Stripe',
      category: 'functional',
      gcm:      { functionality_storage: 'granted', security_storage: 'granted' },
      active:   function () { return true; },
      page:     function (p) { return p === '/devis' || p.indexOf('/devis/') === 0; },
      load: function () {
        _script('https://js.stripe.com/v3/');
      },
    },

    'youtube': {
      label:    'YouTube',
      category: 'functional',
      gcm:      { functionality_storage: 'granted' },
      // Se déclenche seulement si des placeholders [data-yt-src] existent
      active:   function () {
        return !!document.querySelector('[data-yt-src]');
      },
      load: function () {
        // Remplace chaque placeholder par une vraie iframe YouTube
        // Usage HTML : <div data-yt-src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
        //                   data-width="560" data-height="315"></div>
        document.querySelectorAll('[data-yt-src]').forEach(function (el) {
          var iframe = document.createElement('iframe');
          iframe.src             = el.getAttribute('data-yt-src');
          iframe.width           = el.getAttribute('data-width')  || '560';
          iframe.height          = el.getAttribute('data-height') || '315';
          iframe.frameBorder     = '0';
          iframe.allow           = 'accelerometer; autoplay; clipboard-write; ' +
                                   'encrypted-media; gyroscope; picture-in-picture; web-share';
          iframe.allowFullscreen = true;
          iframe.loading         = 'lazy';
          el.parentNode.replaceChild(iframe, el);
        });
      },
    },

    'google-maps': {
      label:    'Google Maps',
      category: 'functional',
      gcm:      { functionality_storage: 'granted' },
      active:   function () { return !!CONFIG.googleMaps.key; },
      load: function () {
        _script(
          'https://maps.googleapis.com/maps/api/js?key=' + CONFIG.googleMaps.key +
          '&loading=async&callback=_gmInit'
        );
      },
    },

  };

  // ══════════════════════════════════════════════════════════════════════
  // §3 — GOOGLE CONSENT MODE V2 — DÉFAUT DENIED (7 signaux)
  //      Synchrone — s'exécute avant tout tag Google
  //
  //      Recommandations Google 2026 :
  //        • Tous les signaux denied par défaut (RGPD / CNIL strict)
  //        • wait_for_update 500 ms — GTM attend le CMP avant de charger
  //        • ads_data_redaction — masque IDs pub quand ad_storage denied
  //        • url_passthrough — préserve gclid/fbclid en URL sans cookie
  // ══════════════════════════════════════════════════════════════════════

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    analytics_storage:       'denied',   // GA4, Clarity
    ad_storage:              'denied',   // Google Ads, Meta, LinkedIn
    ad_user_data:            'denied',   // envoi données users vers Google Ads
    ad_personalization:      'denied',   // remarketing / publicité personnalisée
    functionality_storage:   'denied',   // Stripe, Maps, YouTube
    personalization_storage: 'denied',   // personnalisation de contenu
    security_storage:        'denied',   // anti-fraude Stripe
    wait_for_update:         500,
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough',    true);

  // ══════════════════════════════════════════════════════════════════════
  // §4 — MOTEUR DE CHARGEMENT
  //      _script()        — injecteur générique, idempotent (clé = URL)
  //      _applyChoices()  — appelé par Axeptio après chaque décision
  // ══════════════════════════════════════════════════════════════════════

  var _done = {};

  function _script(src, onload) {
    if (_done[src]) return;
    _done[src] = true;
    var s = document.createElement('script');
    s.async = true;
    s.src   = src;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  function _applyChoices(choices) {
    var gcmUpdate = {};
    var path = window.location.pathname;

    Object.keys(REGISTRY).forEach(function (vendor) {
      if (!choices[vendor])         return;   // non consenti par l'utilisateur
      var svc = REGISTRY[vendor];
      if (!svc.active())            return;   // ID absent ou condition non remplie
      if (svc.page && !svc.page(path)) return; // hors de la page cible

      Object.assign(gcmUpdate, svc.gcm);
      svc.load();
    });

    if (Object.keys(gcmUpdate).length > 0) {
      gtag('consent', 'update', gcmUpdate);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // §5 — INITIALISATION AXEPTIO
  // ══════════════════════════════════════════════════════════════════════

  window.axeptioSettings = {
    clientId:       CONFIG.axeptio.clientId,
    cookiesVersion: CONFIG.axeptio.cookiesVersion,
  };

  void 0 === window._axcb && (window._axcb = []);
  window._axcb.push(function (sdk) {
    sdk.on('cookies:complete', function (choices) {
      _applyChoices(choices);
    });
  });

  (function (d, s) {
    var t = d.getElementsByTagName(s)[0];
    var e = d.createElement(s);
    e.async = true;
    e.src   = '//static.axept.io/sdk-slim.js';
    t.parentNode.insertBefore(e, t);
  }(document, 'script'));

  // ══════════════════════════════════════════════════════════════════════
  // §6 — PERSONNALISATION VISUELLE AXEPTIO
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

      /* ── Séparateurs ──────────────────────────────────────────── */
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
      '    left: 0 !important; right: 0 !important; bottom: 0 !important;',
      '    width: 100% !important; max-width: 100% !important; margin: 0 !important;',
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
  // §7 — API PUBLIQUE window.CATechConsent
  //
  //  openPreferences()         — rouvre le widget Axeptio
  //  getChoices()              — choix courants de l'utilisateur
  //  onReady(cb)               — callback quand le SDK est prêt
  //  loadService(vendor)       — charge manuellement un service consenti
  //                              (ex: bouton "Activer YouTube" sur la page)
  //  getRegistry()             — retourne le registre pour debug
  //                              (console.table(CATechConsent.getRegistry()))
  // ══════════════════════════════════════════════════════════════════════

  window.CATechConsent = {

    openPreferences: function () {
      if (window.axeptio && window.axeptio.openCookies) {
        window.axeptio.openCookies();
      }
    },

    getChoices: function () {
      return (window.axeptio && window.axeptio.userPreferences) || {};
    },

    onReady: function (cb) {
      void 0 === window._axcb && (window._axcb = []);
      window._axcb.push(function (sdk) { cb(sdk); });
    },

    loadService: function (vendor) {
      var svc = REGISTRY[vendor];
      if (!svc) return;
      var choices = this.getChoices();
      if (!choices[vendor]) {
        this.openPreferences();
        return;
      }
      if (!svc.active()) return;
      svc.load();
    },

    getRegistry: function () {
      var out = {};
      Object.keys(REGISTRY).forEach(function (k) {
        var s = REGISTRY[k];
        out[k] = { label: s.label, category: s.category, active: s.active(), gcm: s.gcm };
      });
      return out;
    },

  };

})();
