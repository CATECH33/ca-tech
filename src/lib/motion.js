// Framer Motion — système d'animation CA-TECH V2
// Source : MOTION-SYSTEM.md · CA-TECH-FRONTEND-ARCHITECTURE-V2.md

// ─── Easing ───────────────────────────────────────────────────────────────────
export const ease = {
  smooth:     [0.16, 1, 0.3, 1],   // Entrées éditoriales
  decelerate: [0, 0, 0.3, 1],       // Sorties de hors-frame
  accelerate: [0.7, 0, 1, 1],       // Disparitions
  snap:       [0.32, 0, 0.16, 1],   // Transitions UI rapides
  gentle:     [0.4, 0, 0.2, 1],     // Éléments ambient
}

// ─── Durées ───────────────────────────────────────────────────────────────────
export const duration = {
  // Micro-interactions (registre Interface)
  instant:      0.10,
  fast:         0.18,
  quick:        0.25,
  // Transitions standard
  normal:       0.35,
  medium:       0.50,
  // Transitions éditoriales (registre Éditorial)
  slow:         0.65,
  editorial:    0.80,
  storytelling: 1.00,
  // Systèmes animés (registre Système)
  countUp:      1.20,
  draw:         1.50,
  drawSlow:     2.00,
}

// ─── Spring presets ───────────────────────────────────────────────────────────
export const spring = {
  snappy: { type: 'spring', stiffness: 500, damping: 35, mass: 0.8 },
  smooth: { type: 'spring', stiffness: 300, damping: 30, mass: 1.0 },
  gentle: { type: 'spring', stiffness: 180, damping: 25, mass: 1.2 },
}

// ─── Distances ────────────────────────────────────────────────────────────────
export const distance = {
  xs:   8,
  sm:  16,
  md:  24,
  lg:  40,
  xl:  60,
  hero: 80,
}

// ─── Viewport (whileInView standard) ─────────────────────────────────────────
export const viewport = {
  once: true,
  amount: 0.10,
  margin: '0px 0px -80px 0px',
}

// ─── Variants — Entrées scroll ────────────────────────────────────────────────

// fadeUp — entrée standard (registre Éditorial)
export const fadeUp = {
  hidden:  { opacity: 0, y: distance.md },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.smooth } },
}

// fadeUpHeadline — pour les grandes headlines (y plus grand)
export const fadeUpHeadline = {
  hidden:  { opacity: 0, y: distance.lg },
  visible: { opacity: 1, y: 0, transition: { duration: duration.editorial, ease: ease.smooth } },
}

// fadeIn — fondu simple
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.normal, ease: ease.gentle } },
}

// scaleReveal — showcases, visuels (légère mise à l'échelle)
export const scaleReveal = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease: ease.smooth } },
}

// imageReveal — révélation image hero/section
export const imageReveal = {
  hidden:  { opacity: 0, scale: 1.02 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.editorial, ease: ease.decelerate } },
}

// slideFromRight — entrée depuis la droite
export const slideFromRight = {
  hidden:  { opacity: 0, x: distance.lg },
  visible: { opacity: 1, x: 0, transition: { duration: duration.medium, ease: ease.snap } },
  exit:    { opacity: 0, x: -distance.lg, transition: { duration: duration.medium, ease: ease.accelerate } },
}

// slideFromLeft — entrée depuis la gauche
export const slideFromLeft = {
  hidden:  { opacity: 0, x: -distance.lg },
  visible: { opacity: 1, x: 0, transition: { duration: duration.medium, ease: ease.snap } },
  exit:    { opacity: 0, x: distance.lg, transition: { duration: duration.medium, ease: ease.accelerate } },
}

// dropIn — chute depuis le haut (modals, notifications)
export const dropIn = {
  hidden:  { opacity: 0, y: -distance.sm, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring.smooth },
  exit:    { opacity: 0, y: distance.sm, scale: 0.98, transition: { duration: duration.fast, ease: ease.accelerate } },
}

// popIn — apparition rapide (tooltips, badges)
export const popIn = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: spring.snappy },
  exit:    { opacity: 0, scale: 0.85, transition: { duration: duration.fast } },
}

// slideUp — entrée depuis le bas (drawers, sheets)
export const slideUp = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: duration.medium, ease: ease.decelerate } },
  exit:    { y: '100%', opacity: 0, transition: { duration: duration.normal, ease: ease.accelerate } },
}

// counterReveal — métrique avec entrée scale (section Positionnement)
export const counterReveal = {
  hidden:  { opacity: 0, scale: 0.90 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease: ease.smooth } },
}

// showcaseSlide — transition entre slides showcase
export const showcaseSlide = {
  enter:   (dir) => ({ opacity: 0, x: dir > 0 ? distance.xl : -distance.xl }),
  center:  { opacity: 1, x: 0, transition: { duration: duration.medium, ease: ease.snap } },
  exit:    (dir) => ({ opacity: 0, x: dir > 0 ? -distance.xl : distance.xl,
                       transition: { duration: duration.medium, ease: ease.accelerate } }),
}

// ─── Variants — Stagger containers ────────────────────────────────────────────

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.10 } },
}

export const staggerFast = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

export const staggerNormal = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.10 } },
}

export const staggerSlow = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

export const staggerGrid = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.20 } },
}

// ─── Variants — Texte éditorial ───────────────────────────────────────────────

// wordReveal — révélation mot par mot (à utiliser avec stagger container)
export const wordReveal = {
  hidden:  { opacity: 0, y: distance.sm, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: duration.editorial, ease: ease.smooth },
  },
}

// ctaPulse — entrée CTA (une seule fois)
export const ctaPulse = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.normal, ease: ease.smooth } },
}

// ─── Variants pour reduced-motion ─────────────────────────────────────────────
export const staticVariants = {
  hidden:  { opacity: 1 },
  visible: { opacity: 1 },
}

export const staticContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0 } },
}
