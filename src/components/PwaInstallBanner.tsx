import { useState, useEffect, useRef } from 'react'
import './PwaInstallBanner.css'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios-iphone' | 'ios-ipad' | 'android' | 'windows' | 'mac' | 'other'
type View = 'banner' | 'instructions'

const STORAGE_KEY = 'ca-tech-pwa-later'
const DISMISS_DAYS = 30
const SHOW_DELAY_MS = 15000

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIPad) return 'ios-ipad'
  if (/iPhone|iPod/.test(ua)) return 'ios-iphone'
  if (/Android/.test(ua)) return 'android'
  if (/Windows/.test(ua)) return 'windows'
  if (/Macintosh/.test(ua)) return 'mac'
  return 'other'
}

function isAlreadyInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

function isDismissed(): boolean {
  const ts = localStorage.getItem(STORAGE_KEY)
  if (!ts) return false
  const days = (Date.now() - parseInt(ts, 10)) / 86400000
  return days < DISMISS_DAYS
}

const STEPS: Record<Platform, { icon: string; title: string; steps: string[] }> = {
  'ios-iphone': {
    icon: '📱',
    title: 'Installer sur iPhone',
    steps: [
      'Appuyez sur l\'icône Partager ⬆ en bas de Safari',
      'Faites défiler et choisissez « Sur l\'écran d\'accueil »',
      'Appuyez sur « Ajouter » en haut à droite',
    ],
  },
  'ios-ipad': {
    icon: '⬜',
    title: 'Installer sur iPad',
    steps: [
      'Appuyez sur l\'icône Partager ⬆ dans la barre d\'outils Safari',
      'Choisissez « Sur l\'écran d\'accueil »',
      'Appuyez sur « Ajouter » pour confirmer',
    ],
  },
  android: {
    icon: '🤖',
    title: 'Installer sur Android',
    steps: [
      'Appuyez sur ⋮ (menu) en haut à droite de Chrome',
      'Sélectionnez « Ajouter à l\'écran d\'accueil »',
      'Confirmez en appuyant sur « Ajouter »',
    ],
  },
  windows: {
    icon: '🖥',
    title: 'Installer sur Windows',
    steps: [
      'Cliquez sur l\'icône ⊕ dans la barre d\'adresse de Chrome ou Edge',
      'Cliquez sur « Installer »',
      'CA-TECH apparaîtra dans votre menu Démarrer',
    ],
  },
  mac: {
    icon: '💻',
    title: 'Installer sur Mac',
    steps: [
      'Dans Chrome : cliquez sur ⊕ dans la barre d\'adresse',
      'Dans Safari : Fichier → Partager → Ajouter au Dock',
      'Confirmez l\'installation',
    ],
  },
  other: {
    icon: '🌐',
    title: 'Installer l\'application',
    steps: [
      'Ouvrez le menu de votre navigateur',
      'Cherchez « Installer » ou « Ajouter à l\'écran d\'accueil »',
      'Confirmez l\'installation',
    ],
  },
}

export default function PwaInstallBanner() {
  const [visible, setVisible] = useState(false)
  const [view, setView] = useState<View>('banner')
  const [platform] = useState<Platform>(() => detectPlatform())
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const hasNativePrompt = useRef(false)

  useEffect(() => {
    if (isAlreadyInstalled() || isDismissed()) return

    // Capturer l'événement natif avant qu'il ne disparaisse
    const onPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      hasNativePrompt.current = true
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // Afficher après 15s
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS)

    // Ou après scroll significatif
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.25) {
        clearTimeout(timer)
        setVisible(true)
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Masquer si l'app est installée pendant la session
    const onInstalled = () => setVisible(false)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!visible) return null

  const handleInstall = async () => {
    if (hasNativePrompt.current && deferredPrompt.current) {
      await deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome === 'accepted') {
        setVisible(false)
        return
      }
    }
    setView('instructions')
  }

  const handleLater = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setVisible(false)
  }

  const info = STEPS[platform]

  return (
    <div className="pwa-overlay" role="dialog" aria-modal="true" aria-label="Installer CA-TECH">
      <div className={`pwa-banner ${view === 'instructions' ? 'pwa-banner--instr' : ''}`}>

        {/* ── Bannière principale ── */}
        {view === 'banner' && (
          <>
            <button className="pwa-close" onClick={handleLater} aria-label="Fermer">✕</button>
            <div className="pwa-inner">
              <div className="pwa-logo">
                <img src="/icons/icon-96x96.png" alt="CA-TECH" width="52" height="52"/>
              </div>
              <div className="pwa-content">
                <p className="pwa-title">Installez CA-TECH</p>
                <p className="pwa-desc">
                  Accédez plus rapidement à nos services et recevez les nouveautés directement depuis votre écran d'accueil.
                </p>
                <div className="pwa-actions">
                  <button className="pwa-btn-install" onClick={handleInstall}>
                    <span className="pwa-btn-icon">⊕</span> Installer
                  </button>
                  <button className="pwa-btn-later" onClick={handleLater}>
                    Plus tard
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Instructions plateforme ── */}
        {view === 'instructions' && (
          <>
            <button className="pwa-close" onClick={() => setView('banner')} aria-label="Retour">←</button>
            <div className="pwa-instr-inner">
              <p className="pwa-instr-icon">{info.icon}</p>
              <p className="pwa-instr-title">{info.title}</p>
              <ol className="pwa-steps">
                {info.steps.map((step, i) => (
                  <li key={i} className="pwa-step">
                    <span className="pwa-step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <button className="pwa-btn-done" onClick={handleLater}>
                Compris, merci !
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
