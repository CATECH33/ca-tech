/**
 * CA-TECH — Bridge Axeptio ↔ SPA React
 *
 * Le consentement est désormais géré par Axeptio (axeptio-consent.js).
 * Ce module expose uniquement les helpers utilisés depuis le SPA.
 */

declare global {
  interface Window {
    dataLayer:      unknown[]
    gtag:           (...args: unknown[]) => void
    axeptio?:       { openCookies?: () => void; userPreferences?: Record<string, boolean> }
    CATechConsent?: { openPreferences: () => void; getChoices: () => Record<string, boolean> }
  }
}

/** Rouvrir le widget Axeptio depuis n'importe quel composant React */
export function openCookiePreferences(): void {
  window.CATechConsent?.openPreferences()
}

/** Lire les choix courants de l'utilisateur */
export function getCookieChoices(): Record<string, boolean> {
  return window.CATechConsent?.getChoices() ?? {}
}
