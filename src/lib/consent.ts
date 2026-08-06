/**
 * Google Consent Mode v2 — CA-TECH
 *
 * Architecture : le default 'denied' est posé dans index.html avant tout tag
 * Google. Ce module applique les signaux après un choix utilisateur et charge
 * les scripts GA4 / Ads uniquement si le consentement est donné.
 *
 * Pour activer GA4 : remplacer GA_ID par le vrai Measurement ID (G-XXXXXXXX).
 * Pour activer Google Ads : renseigner AW_ID.
 */

const GA_ID = 'G-R526KDMC17'
const AW_ID = ''   // ex: 'AW-1234567890' ← à renseigner si Google Ads

const STORAGE_KEY = 'ca-tech-cookies-consent'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConsentChoices {
  statistics:      boolean
  marketing:       boolean
  personalization: boolean
  functional:      boolean
}

type ConsentValue = 'granted' | 'denied'

interface ConsentSignals {
  analytics_storage:  ConsentValue
  ad_storage:         ConsentValue
  ad_user_data:       ConsentValue
  ad_personalization: ConsentValue
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag:      (...args: unknown[]) => void
  }
}

// ── dataLayer helper ─────────────────────────────────────────────────────────

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}

// ── Mapping choix → signaux Consent Mode v2 ──────────────────────────────────

function toSignals(choices: ConsentChoices): ConsentSignals {
  return {
    analytics_storage:  choices.statistics     ? 'granted' : 'denied',
    ad_storage:         choices.marketing       ? 'granted' : 'denied',
    ad_user_data:       choices.marketing       ? 'granted' : 'denied',
    ad_personalization: choices.personalization ? 'granted' : 'denied',
  }
}

// ── Injection dynamique des scripts Google ────────────────────────────────────

let _gaLoaded = false
let _awLoaded = false

function injectGA4() {
  if (_gaLoaded || !GA_ID) return
  _gaLoaded = true

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  s.onload = () => {
    gtag('js', new Date())
    gtag('config', GA_ID, { anonymize_ip: true })
  }
}

function injectAds() {
  if (_awLoaded || !AW_ID) return
  _awLoaded = true

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${AW_ID}`
  document.head.appendChild(s)
}

// ── API publique ──────────────────────────────────────────────────────────────

/**
 * Applique les signaux Consent Mode v2 et charge les scripts si consentement
 * donné. Appelé à chaque choix utilisateur (acceptAll / refuseAll / saveCustom).
 */
export function applyConsent(choices: ConsentChoices) {
  const signals = toSignals(choices)
  gtag('consent', 'update', signals)

  if (choices.statistics) injectGA4()
  if (choices.marketing)  injectAds()
}

/**
 * Relit le localStorage au démarrage et applique le consentement stocké.
 * Appelé une fois au montage de l'app (useEffect dans CookieBanner).
 */
export function initConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const s = JSON.parse(raw)
    if ((s.v ?? 0) < 2) return                             // ancien schéma → ignoré
    if ((Date.now() - s.ts) / 86400000 > 180) return      // expiré → ignoré

    applyConsent({
      statistics:      !!s.statistics,
      marketing:       !!s.marketing,
      personalization: !!s.personalization,
      functional:      !!s.functional,
    })
  } catch { /* silently ignore */ }
}
