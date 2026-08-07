/* ══════════════════════════════════════════════════════════════════════
   CA-TECH — Enterprise Tracking System v3.0
   ▸ Chargé en PREMIER, sans defer/async, avant tout tag Google
   ▸ 12 services | 3 catégories | priorité de chargement (high/normal/low)
   ▸ Google Consent Mode v2 — 7 signaux RGPD strict (défaut : denied)
   ▸ Axeptio CMP — consentement granulaire par service
   ▸ Isolation d'erreur par service — un crash n'en bloque pas d'autres
   ▸ Event bus ca:tracking:* — hooks pour modules externes
   ▸ requestIdleCallback — services low priority sans impact LCP/TBT
   ▸ Preconnect dynamique — injecté juste avant chaque script

   ┌─────────────────────────────────────────────────────────────────┐
   │  §1  CONFIG       — IDs & clés de tous les services            │
   │  §2  REGISTRY     — déclaration des 12 services tiers          │
   │  §3  GCM v2       — signaux consentement (défaut : denied)     │
   │  §4  ENGINE       — chargeur, isolateur d'erreurs, event bus   │
   │  §5  AXEPTIO      — initialisation CMP                         │
   │  §6  THEME        — CSS glassmorphism CA-TECH                  │
   │  §7  API          — window.CATechTracking + alias CATechConsent│
   └─────────────────────────────────────────────────────────────────┘

   AJOUTER UN SERVICE :
     1. Déclarer l'ID dans §1 CONFIG
     2. Créer une entrée dans §2 REGISTRY (clé = nom exact Axeptio)
     3. Publier le service dans le dashboard admin.axeptio.eu

   SERVICES AXEPTIO À CRÉER (Cookies → Ajouter) :
     google-analytics | microsoft-clarity | hotjar
     google-ads       | meta-pixel        | linkedin-insight | tiktok-pixel
     stripe           | youtube           | google-maps      | calendly
   ══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════
  // §1 — CONFIGURATION CENTRALE
  //
  //  Remplir les IDs pour activer les services.
  //  Une valeur vide ('') désactive le service sans erreur.
  //  debug: true → logs console (désactiver en production).
  //
  //  NOTE Google Tag Manager :
  //    Si CONFIG.gtm.id est renseigné, GTM est chargé SANS consentement
  //    (c'est le conteneur qui lit les signaux GCM, pas un tracker).
  //    Dans ce cas, GA4 et Google Ads doivent être gérés VIA GTM —
  //    les entrées google-analytics / google-ads sont automatiquement
  //    désactivées pour éviter le double chargement.
  // ══════════════════════════════════════════════════════════════════════

  /** @type {Object} Configuration globale — modifier ici uniquement */
  var CONFIG = {
    axeptio:    { clientId: '686e8f86b80b5e7c51a0e5b9', cookiesVersion: 'ca-tech-fr' },

    // ── Analytique ───────────────────────────────────────────────────
    ga4:        { id:  'G-R526KDMC17' },   // Measurement ID GA4
    gtm:        { id:  '' },               // GTM-XXXXXXX (charge sans consentement)
    clarity:    { id:  '' },               // Microsoft Clarity project ID
    hotjar:     { id:  '' },               // Hotjar Site ID (ex: 1234567)

    // ── Publicité ────────────────────────────────────────────────────
    googleAds:  { id:  '' },               // AW-XXXXXXXXXX
    metaPixel:  { id:  '' },               // Pixel ID (16 chiffres)
    linkedin:   { id:  '' },               // Partner ID numérique
    tiktok:     { id:  '' },               // TikTok Pixel ID

    // ── Fonctionnel ──────────────────────────────────────────────────
    googleMaps: { key: '' },               // Clé API Google Maps
    calendly:   { url: '' },               // https://calendly.com/votre-nom

    // ── Debug ────────────────────────────────────────────────────────
    debug: false,
  };

  // ══════════════════════════════════════════════════════════════════════
  // §2 — REGISTRE ENTERPRISE DES SERVICES
  //
  //  Champs obligatoires :
  //    label       — nom affiché dans le centre de préférences
  //    category    — 'analytics' | 'advertising' | 'functional'
  //    purpose     — finalité RGPD lisible par l'utilisateur
  //    retention   — durée de conservation des données
  //    partner     — URL politique de confidentialité partenaire
  //    gcm         — signaux GCM v2 à accorder si le service est accepté
  //    priority    — 'high' | 'normal' | 'low' (ordre de chargement)
  //    active()    — false → service ignoré (ID absent / condition)
  //    load()      — injection du script ; appelée UNE SEULE FOIS max
  //
  //  Champs optionnels :
  //    preconnect  — tableau d'URL(s) preconnect injectées avant load()
  //    page(p)     — filtre de page ; false → ignoré hors la page cible
  // ══════════════════════════════════════════════════════════════════════

  var REGISTRY = {

    // ══ ANALYTIQUE ═══════════════════════════════════════════════════════

    /**
     * Google Analytics 4 — mesure d'audience.
     * Ignoré si GTM est configuré (GTM gère GA4 via son conteneur).
     */
    'google-analytics': {
      label:      'Google Analytics 4',
      category:   'analytics',
      purpose:    "Mesure l'audience, les pages visitées, la durée des sessions et la provenance des visiteurs.",
      retention:  '13 mois',
      partner:    'https://policies.google.com/privacy',
      gcm:        { analytics_storage: 'granted' },
      priority:   'high',
      preconnect: ['https://www.googletagmanager.com', 'https://www.google-analytics.com'],
      active:     function () { return !!CONFIG.ga4.id && !CONFIG.gtm.id; },
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

    /**
     * Microsoft Clarity — enregistrements de sessions et heatmaps.
     */
    'microsoft-clarity': {
      label:      'Microsoft Clarity',
      category:   'analytics',
      purpose:    'Enregistre les sessions de navigation (mouvements, clics, scrolls) pour identifier les points de friction.',
      retention:  '13 mois',
      partner:    'https://privacy.microsoft.com/fr-fr/privacystatement',
      gcm:        { analytics_storage: 'granted' },
      priority:   'low',
      preconnect: ['https://www.clarity.ms'],
      active:     function () { return !!CONFIG.clarity.id; },
      load: function () {
        (function (c, l, a, r, i, t, y) {
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
          t = l.createElement(r); t.async = 1;
          t.src = 'https://www.clarity.ms/tag/' + i;
          y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', CONFIG.clarity.id);
      },
    },

    /**
     * Hotjar — heatmaps, enregistrements et sondages visiteurs.
     */
    'hotjar': {
      label:      'Hotjar',
      category:   'analytics',
      purpose:    'Génère des heatmaps et des enregistrements de sessions pour comprendre le comportement des visiteurs.',
      retention:  '365 jours',
      partner:    'https://www.hotjar.com/legal/policies/privacy/',
      gcm:        { analytics_storage: 'granted' },
      priority:   'low',
      preconnect: ['https://static.hotjar.com', 'https://script.hotjar.com'],
      active:     function () { return !!CONFIG.hotjar.id; },
      load: function () {
        (function (h, o, t, j, a, r) {
          h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
          h._hjSettings = { hjid: CONFIG.hotjar.id, hjsv: 6 };
          a = o.getElementsByTagName('head')[0];
          r = o.createElement('script'); r.async = 1;
          r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
          a.appendChild(r);
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
      },
    },

    // ══ PUBLICITÉ ════════════════════════════════════════════════════════

    /**
     * Google Ads — mesure des conversions et remarketing.
     * Ignoré si GTM est configuré.
     */
    'google-ads': {
      label:      'Google Ads',
      category:   'advertising',
      purpose:    "Mesure l'efficacité des campagnes publicitaires Google et permet le reciblage publicitaire.",
      retention:  '13 mois',
      partner:    'https://policies.google.com/privacy',
      gcm:        { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' },
      priority:   'high',
      preconnect: ['https://www.googletagmanager.com'],
      active:     function () { return !!CONFIG.googleAds.id && !CONFIG.gtm.id; },
      load: function () {
        _script(
          'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.googleAds.id,
          function () { gtag('config', CONFIG.googleAds.id); }
        );
      },
    },

    /**
     * Meta Pixel — conversions Facebook / Instagram et ciblage publicitaire.
     */
    'meta-pixel': {
      label:      'Meta Pixel',
      category:   'advertising',
      purpose:    'Mesure les conversions des publicités Facebook/Instagram et permet le ciblage publicitaire.',
      retention:  '6 mois',
      partner:    'https://www.facebook.com/privacy/policy/',
      gcm:        { ad_storage: 'granted', ad_user_data: 'granted' },
      priority:   'normal',
      preconnect: ['https://connect.facebook.net'],
      active:     function () { return !!CONFIG.metaPixel.id; },
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

    /**
     * LinkedIn Insight Tag — conversions B2B et reciblage LinkedIn.
     */
    'linkedin-insight': {
      label:      'LinkedIn Insight Tag',
      category:   'advertising',
      purpose:    'Mesure les conversions des campagnes LinkedIn et permet le reciblage publicitaire B2B.',
      retention:  '7 jours (détaillé) / 90 jours (agrégé)',
      partner:    'https://www.linkedin.com/legal/privacy-policy',
      gcm:        { ad_storage: 'granted', ad_user_data: 'granted' },
      priority:   'normal',
      preconnect: ['https://snap.licdn.com'],
      active:     function () { return !!CONFIG.linkedin.id; },
      load: function () {
        window._linkedin_partner_id = CONFIG.linkedin.id;
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(CONFIG.linkedin.id);
        _script('https://snap.licdn.com/li.lms-analytics/insight.min.js');
      },
    },

    /**
     * TikTok Pixel — conversions TikTok Ads et reciblage.
     */
    'tiktok-pixel': {
      label:      'TikTok Pixel',
      category:   'advertising',
      purpose:    'Mesure les conversions des publicités TikTok et permet le reciblage publicitaire.',
      retention:  '13 mois',
      partner:    'https://www.tiktok.com/legal/page/row/privacy-policy/en',
      gcm:        { ad_storage: 'granted', ad_user_data: 'granted' },
      priority:   'normal',
      preconnect: ['https://analytics.tiktok.com'],
      active:     function () { return !!CONFIG.tiktok.id; },
      load: function () {
        (function (w, d, t) {
          w.TiktokAnalyticsObject = t;
          var ttq = w[t] = w[t] || [];
          ttq.methods = ['page','track','identify','instances','debug','on','off','once',
                         'ready','alias','group','enableCookie','disableCookie',
                         'holdConsent','revokeConsent','grantConsent'];
          ttq.setAndDefer = function (t, e) {
            t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
          };
          for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
          ttq.instance = function (t) {
            for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
            return e;
          };
          ttq.load = function (e, n) {
            var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
            ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r;
            ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
            ttq._o = ttq._o || {}; ttq._o[e] = n || {};
            var s = d.createElement('script'); s.type = 'text/javascript'; s.async = !0;
            s.src = r + '?sdkid=' + e + '&lib=' + t;
            var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(s, a);
          };
          ttq.load(CONFIG.tiktok.id);
          ttq.page();
        })(window, document, 'ttq');
      },
    },

    // ══ FONCTIONNEL ══════════════════════════════════════════════════════

    /**
     * Stripe — sécurisation des paiements et anti-fraude.
     * Chargé uniquement sur les pages /devis*.
     */
    'stripe': {
      label:      'Stripe',
      category:   'functional',
      purpose:    'Sécurise les transactions de paiement en ligne et prévient la fraude.',
      retention:  'Durée de la session',
      partner:    'https://stripe.com/fr/privacy',
      gcm:        { functionality_storage: 'granted', security_storage: 'granted' },
      priority:   'high',
      preconnect: ['https://js.stripe.com'],
      active:     function () { return true; },
      page:       function (p) { return p === '/devis' || p.indexOf('/devis/') === 0; },
      load: function () {
        _script('https://js.stripe.com/v3/');
      },
    },

    /**
     * YouTube — vidéos intégrées via placeholder data-yt-src.
     * Usage HTML : <div data-yt-src="https://www.youtube-nocookie.com/embed/ID"
     *                   data-width="560" data-height="315"></div>
     */
    'youtube': {
      label:     'YouTube',
      category:  'functional',
      purpose:   'Permet la lecture de vidéos YouTube intégrées au site.',
      retention: '6 mois',
      partner:   'https://policies.google.com/privacy',
      gcm:       { functionality_storage: 'granted' },
      priority:  'normal',
      active:    function () { return !!document.querySelector('[data-yt-src]'); },
      load: function () {
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

    /**
     * Google Maps — cartes interactives.
     * Init côté app via window._gmInit() après chargement.
     */
    'google-maps': {
      label:      'Google Maps',
      category:   'functional',
      purpose:    'Affiche des cartes interactives Google Maps sur le site.',
      retention:  '6 mois',
      partner:    'https://policies.google.com/privacy',
      gcm:        { functionality_storage: 'granted' },
      priority:   'normal',
      preconnect: ['https://maps.googleapis.com', 'https://maps.gstatic.com'],
      active:     function () { return !!CONFIG.googleMaps.key; },
      load: function () {
        _script(
          'https://maps.googleapis.com/maps/api/js?key=' + CONFIG.googleMaps.key +
          '&loading=async&callback=_gmInit'
        );
      },
    },

    /**
     * Calendly — widget de prise de rendez-vous en ligne.
     * Usage HTML : <div class="calendly-inline-widget" data-url="..."></div>
     * Ou auto-injection si CONFIG.calendly.url est défini.
     */
    'calendly': {
      label:      'Calendly',
      category:   'functional',
      purpose:    'Permet la prise de rendez-vous en ligne via le widget Calendly.',
      retention:  '6 mois',
      partner:    'https://calendly.com/privacy',
      gcm:        { functionality_storage: 'granted' },
      priority:   'low',
      preconnect: ['https://assets.calendly.com'],
      active:     function () {
        return !!CONFIG.calendly.url || !!document.querySelector('.calendly-inline-widget');
      },
      load: function () {
        _script('https://assets.calendly.com/assets/external/widget.js');
      },
    },

  };

  // ══════════════════════════════════════════════════════════════════════
  // §3 — GOOGLE CONSENT MODE V2 — DÉFAUT DENIED (7 signaux)
  //
  //  Synchrone — s'exécute avant tout tag Google et avant GTM.
  //  Recommandations Google 2026 (RGPD / CNIL strict) :
  //    • Tous signaux denied par défaut
  //    • wait_for_update 500ms — GTM / SDK attend le CMP avant de tirer
  //    • ads_data_redaction  — masque IDs pub quand ad_storage denied
  //    • url_passthrough     — préserve gclid/fbclid sans cookie
  // ══════════════════════════════════════════════════════════════════════

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    analytics_storage:       'denied',   // GA4, Clarity, Hotjar
    ad_storage:              'denied',   // Google Ads, Meta, LinkedIn, TikTok
    ad_user_data:            'denied',   // envoi données utilisateurs vers Google Ads
    ad_personalization:      'denied',   // remarketing / publicité personnalisée
    functionality_storage:   'denied',   // Stripe, Maps, YouTube, Calendly
    personalization_storage: 'denied',   // personnalisation de contenu
    security_storage:        'denied',   // anti-fraude Stripe
    wait_for_update:         500,
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough',    true);

  // ══════════════════════════════════════════════════════════════════════
  // §4 — ENGINE ENTERPRISE
  //
  //  _log(...)            — logs conditionnels (CONFIG.debug)
  //  _emit(evt, detail)   — CustomEvent ca:tracking:<evt> sur document
  //  _preconnect(url)     — <link rel="preconnect"> idempotent
  //  _script(src, onload) — injecteur de script idempotent
  //  _load(vendor, svc)   — charge un service avec isolation d'erreur
  //  _applyChoices(ch)    — dispatche les services par priorité
  //  _loadGTM()           — charge GTM sans consentement si configuré
  // ══════════════════════════════════════════════════════════════════════

  var _done = {};
  var _sdk  = null;

  function _log() {
    if (!CONFIG.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[CA-TECH Tracking]');
    console.log.apply(console, args);
  }

  function _emit(event, detail) {
    try {
      document.dispatchEvent(new CustomEvent('ca:tracking:' + event, {
        bubbles: false,
        detail:  detail || {},
      }));
    } catch (e) { /* environnement sans CustomEvent */ }
  }

  function _preconnect(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel  = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Injecte un script de façon idempotente (une seule fois par URL).
   * @param {string}    src     — URL du script tiers
   * @param {Function} [onload] — callback après chargement
   */
  function _script(src, onload) {
    if (_done[src]) return;
    _done[src] = true;
    var s = document.createElement('script');
    s.async = true;
    s.src   = src;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  /**
   * Charge un service avec isolation d'erreur et preconnect préalable.
   * @param {string} vendor — clé du service dans REGISTRY
   * @param {Object} svc    — entrée du REGISTRY
   */
  function _load(vendor, svc) {
    if (svc.preconnect) {
      svc.preconnect.forEach(function (url) { _preconnect(url); });
    }
    try {
      svc.load();
      _emit('loaded', { vendor: vendor, category: svc.category });
      _log('✓ loaded', vendor);
    } catch (e) {
      _emit('error', { vendor: vendor, error: e });
      _log('✗ error', vendor, e);
    }
  }

  /**
   * Applique les choix de consentement Axeptio.
   * Services chargés dans l'ordre : high → normal → low (idle).
   * @param {Object} choices — {vendor: bool, ...}
   */
  function _applyChoices(choices) {
    var gcmUpdate = {};
    var path = window.location.pathname;
    var high = [], normal = [], low = [];

    Object.keys(REGISTRY).forEach(function (vendor) {
      if (!choices[vendor])              return;  // non consenti
      var svc = REGISTRY[vendor];
      if (!svc.active())                 return;  // ID absent
      if (svc.page && !svc.page(path))   return;  // hors page cible

      Object.assign(gcmUpdate, svc.gcm);

      var fn = (function (v, s) { return function () { _load(v, s); }; })(vendor, svc);
      if (svc.priority === 'high')       { high.push(fn);   }
      else if (svc.priority === 'low')   { low.push(fn);    }
      else                               { normal.push(fn); }
    });

    if (Object.keys(gcmUpdate).length > 0) {
      gtag('consent', 'update', gcmUpdate);
      _emit('consent-update', { signals: gcmUpdate });
      _log('GCM update', gcmUpdate);
    }

    high.forEach(function (fn) { fn(); });
    normal.forEach(function (fn) { fn(); });

    if (low.length > 0) {
      var runLow = function () { low.forEach(function (fn) { fn(); }); };
      if (window.requestIdleCallback) {
        window.requestIdleCallback(runLow, { timeout: 3000 });
      } else {
        setTimeout(runLow, 1500);
      }
    }
  }

  /**
   * Charge Google Tag Manager sans attendre de consentement.
   * GTM lit les signaux GCM définis en §3 pour gérer ses propres tags.
   */
  function _loadGTM() {
    if (!CONFIG.gtm.id) return;
    _log('Loading GTM', CONFIG.gtm.id);
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0];
      var j = d.createElement(s);
      var dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src   = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', CONFIG.gtm.id);
    _emit('gtm-loaded', { id: CONFIG.gtm.id });
  }

  if (CONFIG.gtm.id) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _loadGTM);
    } else {
      _loadGTM();
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // §5 — INITIALISATION AXEPTIO CMP
  // ══════════════════════════════════════════════════════════════════════

  window.axeptioSettings = {
    clientId:       CONFIG.axeptio.clientId,
    cookiesVersion: CONFIG.axeptio.cookiesVersion,
  };

  void 0 === window._axcb && (window._axcb = []);
  window._axcb.push(function (sdk) {
    _sdk = sdk;
    sdk.on('cookies:complete', function (choices) {
      _log('choices received', choices);
      _emit('consent', { choices: choices });
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
  // §6 — PERSONNALISATION VISUELLE AXEPTIO (glassmorphism CA-TECH)
  //      Idempotent — vérifie l'id "ca-axeptio-theme" avant injection.
  // ══════════════════════════════════════════════════════════════════════

  (function () {
    if (document.getElementById('ca-axeptio-theme')) return;
    var css = [
      '#axeptio_overlay {',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
      '}',
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
      '#axeptio_overlay .ax-widget h1,',
      '#axeptio_overlay .ax-widget h2,',
      '#axeptio_overlay .ax-widget h3 {',
      '  color: #FFFFFF !important; font-weight: 700 !important;',
      '}',
      '#axeptio_overlay .ax-widget p,',
      '#axeptio_overlay .ax-widget span,',
      '#axeptio_overlay .ax-widget label,',
      '#axeptio_overlay .ax-widget a { color: rgba(255,255,255,0.75) !important; }',
      '#axeptio_overlay .ax-widget a:hover { color: #00D4FF !important; }',
      '#axeptio_overlay .ax-widget button[data-type="accept"],',
      '#axeptio_overlay .ax-widget .ax-accept-all,',
      '#axeptio_overlay .ax-widget [class*="accept"]:not([class*="refuse"]):not([class*="personalize"]) {',
      '  background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%) !important;',
      '  color: #FFFFFF !important; border: none !important; border-radius: 10px !important;',
      '  font-weight: 600 !important; font-size: 0.875rem !important; padding: 12px 20px !important;',
      '  cursor: pointer !important; transition: opacity 0.15s ease, transform 0.15s ease !important;',
      '  box-shadow: 0 4px 16px rgba(0,102,255,0.35) !important;',
      '}',
      '#axeptio_overlay .ax-widget button[data-type="accept"]:hover,',
      '#axeptio_overlay .ax-widget .ax-accept-all:hover {',
      '  opacity: 0.88 !important; transform: translateY(-1px) !important;',
      '}',
      '#axeptio_overlay .ax-widget button[data-type="refuse"],',
      '#axeptio_overlay .ax-widget .ax-refuse-all,',
      '#axeptio_overlay .ax-widget [class*="refuse"] {',
      '  background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.80) !important;',
      '  border: 1px solid rgba(255,255,255,0.15) !important; border-radius: 10px !important;',
      '  font-weight: 600 !important; font-size: 0.875rem !important; padding: 12px 20px !important;',
      '  cursor: pointer !important; transition: background 0.15s ease !important;',
      '}',
      '#axeptio_overlay .ax-widget button[data-type="refuse"]:hover,',
      '#axeptio_overlay .ax-widget .ax-refuse-all:hover { background: rgba(255,255,255,0.10) !important; }',
      '#axeptio_overlay .ax-widget button[data-type="personalize"],',
      '#axeptio_overlay .ax-widget .ax-customize,',
      '#axeptio_overlay .ax-widget [class*="personalize"],',
      '#axeptio_overlay .ax-widget [class*="customize"] {',
      '  background: transparent !important; color: #00D4FF !important;',
      '  border: 1px solid rgba(0,212,255,0.30) !important; border-radius: 10px !important;',
      '  font-weight: 600 !important; font-size: 0.875rem !important; padding: 12px 20px !important;',
      '  cursor: pointer !important; transition: border-color 0.15s ease, background 0.15s ease !important;',
      '}',
      '#axeptio_overlay .ax-widget button[data-type="personalize"]:hover,',
      '#axeptio_overlay .ax-widget .ax-customize:hover {',
      '  background: rgba(0,212,255,0.08) !important; border-color: rgba(0,212,255,0.55) !important;',
      '}',
      '#axeptio_overlay .ax-widget input[type="checkbox"]:checked + *,',
      '#axeptio_overlay .ax-widget [class*="toggle"][class*="active"],',
      '#axeptio_overlay .ax-widget [class*="switch"][class*="on"] { background: #0066FF !important; }',
      '#axeptio_overlay .ax-widget hr,',
      '#axeptio_overlay .ax-widget [class*="divider"],',
      '#axeptio_overlay .ax-widget [class*="separator"] { border-color: rgba(255,255,255,0.08) !important; }',
      '#axeptio_overlay .ax-widget [class*="close"] { color: rgba(255,255,255,0.45) !important; }',
      '#axeptio_overlay .ax-widget [class*="close"]:hover { color: rgba(255,255,255,0.80) !important; }',
      '@keyframes caTechSlideUp {',
      '  from { opacity: 0; transform: translateY(24px) scale(0.97); }',
      '  to   { opacity: 1; transform: translateY(0)    scale(1);    }',
      '}',
      '#axeptio_overlay .ax-widget {',
      '  animation: caTechSlideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both !important;',
      '}',
      '@media (max-width: 520px) {',
      '  #axeptio_overlay .ax-widget {',
      '    border-radius: 16px 16px 0 0 !important; left: 0 !important; right: 0 !important;',
      '    bottom: 0 !important; width: 100% !important; max-width: 100% !important; margin: 0 !important;',
      '  }',
      '}',
    ].join('\n');

    var style = document.createElement('style');
    style.id          = 'ca-axeptio-theme';
    style.textContent = css;
    document.head.appendChild(style);
  })();

  // ══════════════════════════════════════════════════════════════════════
  // §7 — API PUBLIQUE
  //
  //  window.CATechTracking — namespace Enterprise (référence principale)
  //  window.CATechConsent  — alias de compatibilité (nom précédent)
  //
  //  Méthodes :
  //    openPreferences()       — rouvre le widget Axeptio
  //    getChoices()            — {vendor: bool} des choix courants
  //    onReady(cb)             — callback quand le SDK Axeptio est prêt
  //    acceptAll()             — accepte tous les services actifs + GCM
  //    refuseAll()             — refuse tous les services
  //    saveChoices(choices)    — {vendor: bool} — sauvegarde & applique
  //    loadService(vendor)     — charge un service manuellement
  //    getRegistry()           — registre enrichi (UI / debug)
  //    debug()                 — active les logs console
  //    on(event, cb)           — écoute ca:tracking:<event>
  //
  //  Événements ca:tracking:* émis sur document :
  //    consent                 — {choices}           après validation CMP
  //    consent-update          — {signals}           mise à jour GCM
  //    loaded                  — {vendor, category}  service chargé
  //    error                   — {vendor, error}     erreur au chargement
  //    gtm-loaded              — {id}                GTM chargé
  // ══════════════════════════════════════════════════════════════════════

  var _api = {

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

    acceptAll: function () {
      var choices = {};
      Object.keys(REGISTRY).forEach(function (k) { choices[k] = true; });
      this.saveChoices(choices);
    },

    refuseAll: function () {
      var choices = {};
      Object.keys(REGISTRY).forEach(function (k) { choices[k] = false; });
      this.saveChoices(choices);
    },

    saveChoices: function (choices) {
      if (_sdk && typeof _sdk.complete === 'function') {
        _sdk.complete(choices);
      } else if (_sdk && typeof _sdk.setCookies === 'function') {
        _sdk.setCookies(choices);
        _applyChoices(choices);
      } else {
        _applyChoices(choices);
        this.openPreferences();
      }
    },

    loadService: function (vendor) {
      var svc = REGISTRY[vendor];
      if (!svc) return;
      var choices = this.getChoices();
      if (!choices[vendor]) { this.openPreferences(); return; }
      if (!svc.active()) return;
      _load(vendor, svc);
    },

    getRegistry: function () {
      var out = {};
      Object.keys(REGISTRY).forEach(function (k) {
        var s = REGISTRY[k];
        out[k] = {
          label:     s.label,
          category:  s.category,
          purpose:   s.purpose,
          retention: s.retention,
          partner:   s.partner,
          active:    s.active(),
          priority:  s.priority,
          gcm:       s.gcm,
        };
      });
      return out;
    },

    debug: function () {
      CONFIG.debug = true;
      console.log('[CA-TECH Tracking] Debug activé. Registre :', this.getRegistry());
      console.log('[CA-TECH Tracking] Choix courants :', this.getChoices());
      console.log('[CA-TECH Tracking] GTM :', CONFIG.gtm.id || 'non configuré');
    },

    on: function (event, cb) {
      document.addEventListener('ca:tracking:' + event, function (e) { cb(e.detail); });
    },

  };

  window.CATechTracking = _api;
  window.CATechConsent  = _api;

})();
