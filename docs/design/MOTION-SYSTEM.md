# CA-TECH — Motion System
> Système d'animation Framer Motion — spécification complète

**Version :** 1.0  
**Dépendances :** DESIGN.md v1.0 · Framer Motion 11+  
**Statut :** Source de vérité pour toutes les animations du site

---

## Table des matières

1. [Philosophie motion](#1-philosophie-motion)
2. [Tokens d'animation](#2-tokens-danimation)
3. [Variants — Bibliothèque complète](#3-variants--bibliothèque-complète)
4. [Scroll animations](#4-scroll-animations)
5. [Hover & Interaction](#5-hover--interaction)
6. [Slide transitions](#6-slide-transitions)
7. [Page transitions](#7-page-transitions)
8. [Effets spéciaux](#8-effets-spéciaux)
9. [Drag](#9-drag)
10. [Parallax](#10-parallax)
11. [Scroll progress](#11-scroll-progress)
12. [Stagger patterns](#12-stagger-patterns)
13. [Reduced motion](#13-reduced-motion)
14. [Implémentation — Guide pratique](#14-implémentation--guide-pratique)

---

## 1. Philosophie motion

**Trois registres d'animation CA-TECH :**

| Registre | Durée | Caractère | Usage |
|----------|-------|-----------|-------|
| **Editorial** | 0.6–1.2s | Lent, fluide, intentionnel | Reveals au scroll, entrées hero, transitions page |
| **Interface** | 0.15–0.35s | Rapide, précis, réactif | Boutons, hovers, feedbacks UI |
| **Système** | Variable | Précis, mécanique | Tracé de graphes, compteurs, workflows |

**Ce que l'animation fait chez CA-TECH :**
- Elle **guide** l'attention vers ce qui compte
- Elle **confirme** les actions de l'utilisateur
- Elle **raconte** la progression de l'interface
- Elle **ancre** la crédibilité technique (mouvements précis = système maîtrisé)

**Ce qu'elle ne fait jamais :**
- Animer pour animer (chaque mouvement a un rôle)
- Ralentir la navigation (transitions page < 0.5s)
- Distraire pendant la lecture
- Tourner en boucle sur du texte

---

## 2. Tokens d'animation

### Easing curves

```typescript
// src/lib/motion.ts

export const ease = {
  // Entrées principales — spring-like, très fluide
  smooth:     [0.16, 1, 0.3, 1]       as const,
  
  // Éléments arrivant depuis l'extérieur (drop-in)
  decelerate: [0, 0, 0.3, 1]          as const,
  
  // Éléments quittant (exit rapide)
  accelerate: [0.7, 0, 1, 1]          as const,
  
  // Slides, transitions directes (mécanique)
  snap:       [0.32, 0, 0.16, 1]      as const,
  
  // Transitions douces (fade, crossfade)
  gentle:     [0.4, 0, 0.2, 1]        as const,
  
  // Standard CSS
  linear:     'linear'                 as const,
  easeOut:    'easeOut'                as const,
  easeIn:     'easeIn'                 as const,
  easeInOut:  'easeInOut'              as const,
}
```

### Durées

```typescript
export const duration = {
  // Micro-interactions UI
  instant:      0.10,   // Toggle, ripple, checkbox
  fast:         0.18,   // Hover bouton, feedback clic
  quick:        0.25,   // Tooltip, badge, icône
  
  // Transitions standard
  normal:       0.35,   // Modal open, dropdown, accordéon
  medium:       0.50,   // Slide carousel, drawer
  
  // Transitions éditoriales
  slow:         0.65,   // Reveal section au scroll
  editorial:    0.80,   // Headline principale, hero visuel
  storytelling: 1.00,   // Page transition, grand reveal
  
  // Systèmes (compteurs, tracés)
  countUp:      1.20,   // Compteurs animés
  draw:         1.50,   // Tracé SVG paths
  drawSlow:     2.00,   // Tracé complexe (workflow)
}
```

### Spring presets

```typescript
export const spring = {
  // Micro-interaction vive
  snappy: {
    type:      'spring' as const,
    stiffness: 500,
    damping:   35,
    mass:      0.8,
  },
  
  // UI standard — fluide sans rebond
  smooth: {
    type:      'spring' as const,
    stiffness: 300,
    damping:   30,
    mass:      1.0,
  },
  
  // Éditorial — plus lent, plus doux
  gentle: {
    type:      'spring' as const,
    stiffness: 180,
    damping:   25,
    mass:      1.2,
  },
  
  // Rebond léger (usage très rare — jamais sur texte)
  bounce: {
    type:      'spring' as const,
    stiffness: 400,
    damping:   15,
    mass:      0.8,
  },
}
```

### Distances de translation

```typescript
export const distance = {
  xs:   8,    // Tooltips, badges
  sm:  16,    // Éléments UI inline
  md:  24,    // Éléments de section standard
  lg:  40,    // Headlines, éléments hero
  xl:  60,    // Showcases, grands visuals
  hero: 80,   // Hero principal uniquement
}
```

---

## 3. Variants — Bibliothèque complète

### fadeUp — Entrée standard au scroll

```typescript
export const fadeUp = (
  yDistance = distance.md,
  durationVal = duration.slow
): Variants => ({
  hidden: {
    opacity: 0,
    y: yDistance,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durationVal,
      ease: ease.smooth,
    },
  },
})

// Usage standard
const sectionVariants = fadeUp()                  // y: 24, 0.65s
const headlineVariants = fadeUp(distance.lg, 0.8) // y: 40, 0.8s
const captionVariants = fadeUp(distance.sm, 0.5)  // y: 16, 0.5s
```

### fadeIn — Fondu simple

```typescript
export const fadeIn = (durationVal = duration.normal): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durationVal, ease: ease.gentle },
  },
})
```

### slideFromRight — Entrée depuis la droite

```typescript
export const slideFromRight = (xDistance = 40): Variants => ({
  hidden: { opacity: 0, x: xDistance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.medium, ease: ease.snap },
  },
  exit: {
    opacity: 0,
    x: -xDistance,
    transition: { duration: duration.medium, ease: ease.accelerate },
  },
})
```

### slideFromLeft — Entrée depuis la gauche

```typescript
export const slideFromLeft = (xDistance = 40): Variants => ({
  hidden: { opacity: 0, x: -xDistance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.medium, ease: ease.snap },
  },
  exit: {
    opacity: 0,
    x: xDistance,
    transition: { duration: duration.medium, ease: ease.accelerate },
  },
})
```

### scaleReveal — Apparition avec légère mise à l'échelle

```typescript
export const scaleReveal = (): Variants => ({
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.slow,
      ease: ease.smooth,
    },
  },
})
```

### staggerContainer — Conteneur de stagger

```typescript
export const staggerContainer = (
  staggerDelay = 0.08,
  delayChildren = 0.1
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
})

// Variantes prédéfinies
export const staggerFast    = staggerContainer(0.05, 0.05)
export const staggerNormal  = staggerContainer(0.08, 0.10)
export const staggerSlow    = staggerContainer(0.12, 0.15)
export const staggerGrid    = staggerContainer(0.06, 0.20) // Grilles 3-4 colonnes
```

### headlineReveal — Révélation mot par mot

```typescript
// Le composant parent utilise staggerContainer
// Chaque <motion.span> est un mot

export const wordReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: duration.editorial,
      ease: ease.smooth,
    },
  },
}

// Composant utilitaire
const HeadlineReveal = ({ text, className }: { text: string; className?: string }) => {
  const words = text.split(' ')
  return (
    <motion.h2
      className={className}
      variants={staggerContainer(0.06, 0.05)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordReveal}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h2>
  )
}
```

### dropIn — Chute depuis le haut (modals, notifications)

```typescript
export const dropIn: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: spring.smooth,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: { duration: duration.fast, ease: ease.accelerate },
  },
}
```

### popIn — Apparition rapide (tooltips, badges)

```typescript
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: duration.fast },
  },
}
```

### slideUp — Entrée depuis le bas (drawers, sheets)

```typescript
export const slideUp: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: duration.medium, ease: ease.decelerate },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: duration.normal, ease: ease.accelerate },
  },
}
```

### counterReveal — Métrique avec entrée scale

```typescript
export const counterReveal: Variants = {
  hidden: { opacity: 0, scale: 0.90 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.slow,
      ease: ease.smooth,
    },
  },
}
```

---

## 4. Scroll animations

### Pattern `whileInView` standard

```typescript
// Règle universelle
const scrollReveal = {
  initial: "hidden",
  whileInView: "visible",
  viewport: {
    once: true,        // Ne joue qu'une seule fois
    amount: 0.10,      // 10% visible = déclenchement
    margin: "0px 0px -80px 0px",  // Déclenche 80px avant d'entrer
  },
}

// Usage
<motion.div
  variants={fadeUp()}
  {...scrollReveal}
>
```

### Variantes de seuil selon l'élément

```typescript
// Éléments petits (labels, badges) — déclenche tôt
const viewportSmall = { once: true, amount: 0.3 }

// Sections standard — déclenche quand bien visible
const viewportDefault = { once: true, amount: 0.1 }

// Grandes sections (hero-height) — déclenche très tôt
const viewportLarge = { once: true, amount: 0.05 }

// Éléments en bas de section — déclenche seulement quand bien dans le viewport
const viewportStrict = { once: true, amount: 0.5 }
```

### Section reveal pattern — Stagger complet

```typescript
// Pattern complet pour une section avec stagger
const SectionWithReveal = ({ eyebrow, headline, description, children }) => (
  <motion.section
    variants={staggerNormal}
    initial="hidden"
    whileInView="visible"
    viewport={viewportDefault}
  >
    <motion.span variants={fadeUp(distance.sm, 0.5)} className="eyebrow">
      {eyebrow}
    </motion.span>
    
    <motion.h2 variants={fadeUp(distance.lg, 0.8)} className="headline">
      {headline}
    </motion.h2>
    
    <motion.p variants={fadeUp(distance.md, 0.6)} className="description">
      {description}
    </motion.p>
    
    {/* children héritent du stagger du parent */}
    {children}
  </motion.section>
)
```

---

## 5. Hover & Interaction

### Bouton primaire

```typescript
export const buttonPrimary = {
  whileHover: {
    backgroundColor: '#4AAEE0',   // --color-accent-hover
    y: -1,
    transition: { duration: duration.fast, ease: ease.easeOut },
  },
  whileTap: {
    backgroundColor: '#1E6A96',   // --color-accent-dim
    y: 0,
    scale: 0.98,
    transition: { duration: 0.08 },
  },
}
```

### Bouton secondaire (outlined)

```typescript
export const buttonSecondary = {
  whileHover: {
    backgroundColor: 'rgba(53, 155, 217, 0.08)',
    borderColor: '#4AAEE0',
    color: '#4AAEE0',
    y: -1,
    transition: { duration: duration.fast },
  },
  whileTap: {
    scale: 0.97,
    transition: { duration: 0.08 },
  },
}
```

### Card hover

```typescript
export const cardHover = {
  whileHover: {
    y: -3,
    borderColor: 'rgba(53, 155, 217, 0.30)',
    backgroundColor: 'rgba(53, 155, 217, 0.04)',
    transition: { duration: duration.quick, ease: ease.easeOut },
  },
}
```

### Card portfolio / image hover

```typescript
export const cardPortfolioHover = {
  whileHover: 'hover',
}

export const cardPortfolioImageHover: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: { duration: 0.4, ease: ease.gentle },
  },
}

export const cardPortfolioOverlayHover: Variants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: duration.normal },
  },
}
```

### Link texte hover

```typescript
export const textLinkHover = {
  whileHover: {
    x: 3,
    transition: { duration: duration.fast, ease: ease.easeOut },
  },
}

// Pour les liens avec flèche "→"
export const arrowLinkHover = {
  whileHover: 'hover',
}
export const arrowVariants: Variants = {
  rest:  { x: 0 },
  hover: { x: 5, transition: { duration: duration.fast } },
}
```

### Showcase node hover (workflow)

```typescript
export const workflowNodeHover = {
  whileHover: {
    borderColor: 'rgba(53, 155, 217, 0.60)',
    boxShadow: '0 0 0 3px rgba(53, 155, 217, 0.15)',
    transition: { duration: duration.quick },
  },
}
```

### Nav item hover

```typescript
export const navItemHover = {
  whileHover: {
    color: '#F2F4F6',    // --color-cool-white
    transition: { duration: duration.fast },
  },
}
```

---

## 6. Slide transitions

### Transition horizontale standard (carousels)

```typescript
// Dans le composant Showcase
const getSlideTransition = (direction: 'next' | 'prev') => ({
  initial: {
    x: direction === 'next' ? '100%' : '-100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: duration.medium,     // 0.50s
      ease: ease.snap,               // [0.32, 0, 0.16, 1]
    },
  },
  exit: {
    x: direction === 'next' ? '-100%' : '100%',
    opacity: 0,
    transition: {
      duration: duration.medium,
      ease: ease.accelerate,
    },
  },
})
```

### Transition crossfade (SaaS Showcase)

```typescript
export const crossfade: Variants = {
  initial: { opacity: 0, scale: 0.99 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.medium, ease: ease.gentle },
  },
  exit: {
    opacity: 0,
    scale: 1.01,
    transition: { duration: duration.normal, ease: ease.accelerate },
  },
}
```

### Transition verticale (Case Study scroll-driven)

```typescript
export const slideVertical: Variants = {
  initial: { y: '30px', opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: duration.slow, ease: ease.smooth },
  },
  exit: {
    y: '-30px',
    opacity: 0,
    transition: { duration: duration.normal, ease: ease.accelerate },
  },
}
```

### Direction aware slide

```typescript
// Slide qui sait de quel côté il arrive
type Direction = 1 | -1  // 1 = next, -1 = prev

const slideVariants = (direction: Direction): Variants => ({
  enter: {
    x: direction * 300,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: duration.medium,
      ease: ease.snap,
    },
  },
  exit: (exitDirection: Direction) => ({
    x: exitDirection * -300,
    opacity: 0,
    transition: {
      duration: duration.medium,
      ease: ease.accelerate,
    },
  }),
})
```

---

## 7. Page transitions

### Transition de page standard (React Router / Next.js)

```typescript
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,     // 0.35s — assez rapide pour ne pas frustrer
      ease: ease.decelerate,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: duration.quick,      // 0.25s
      ease: ease.accelerate,
    },
  },
}

// Wrapper dans App.tsx
const PageWrapper = ({ children }: { children: ReactNode }) => (
  <AnimatePresence mode="wait">
    <motion.main
      key={location.pathname}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.main>
  </AnimatePresence>
)
```

### Layout animation (reordering de liste)

```typescript
// Pour les filtres de portfolio (Framer Motion layout prop)
<motion.div layout layoutId={`project-${id}`} />

// Transition de layout
const layoutTransition = {
  layout: {
    duration: duration.medium,
    ease: ease.smooth,
  },
}
```

---

## 8. Effets spéciaux

### Typing animation (Loïc conversation)

```typescript
interface TypingProps {
  text: string
  speed?: number        // ms par caractère
  startDelay?: number   // délai avant de commencer
  onComplete?: () => void
}

// Hook
const useTypingAnimation = ({ text, speed = 30, startDelay = 0, onComplete }: TypingProps) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
          setIsComplete(true)
          onComplete?.()
        }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)
    
    return () => clearTimeout(timeout)
  }, [text, speed, startDelay])
  
  return { displayedText, isComplete }
}
```

### Cursor blinking (champ de saisie Loïc)

```css
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor-blink {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background: var(--color-accent);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursor-blink 1s step-end infinite;
}

@media (prefers-reduced-motion: reduce) {
  .cursor-blink { animation: none; opacity: 1; }
}
```

### Count-up animation (métriques)

```typescript
interface CountUpProps {
  from?: number
  to: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  easing?: (t: number) => number
}

// Easing custom pour count-up (accélère au début, ralentit à la fin)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

const useCountUp = ({
  from = 0,
  to,
  duration: durationMs = 1200,
  decimals = 0,
  easing = easeOutCubic,
}: CountUpProps) => {
  const [value, setValue] = useState(from)
  const frameRef = useRef<number>()
  const startTime = useRef<number>()
  
  const animate = (timestamp: number) => {
    if (!startTime.current) startTime.current = timestamp
    const progress = Math.min((timestamp - startTime.current) / durationMs, 1)
    const easedProgress = easing(progress)
    setValue(from + (to - from) * easedProgress)
    
    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate)
    }
  }
  
  const start = () => {
    startTime.current = undefined
    frameRef.current = requestAnimationFrame(animate)
  }
  
  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }, [])
  
  return { value: parseFloat(value.toFixed(decimals)), start }
}
```

### SVG path draw (workflow connections, timeline)

```typescript
// Hook pour animer un SVG path
const useSVGDraw = (duration = 1.5, delay = 0, easing = 'easeInOut') => {
  const pathRef = useRef<SVGPathElement>(null)
  
  const startDraw = () => {
    const path = pathRef.current
    if (!path) return
    
    const length = path.getTotalLength()
    path.style.strokeDasharray = `${length}`
    path.style.strokeDashoffset = `${length}`
    
    // Framer Motion animate
    animate(path, { strokeDashoffset: 0 }, { duration, delay, ease: easing })
  }
  
  return { pathRef, startDraw }
}

// Ou directement avec Framer Motion motion.path
const DrawablePath = ({ d, ...props }) => (
  <motion.path
    d={d}
    initial={{ pathLength: 0, opacity: 0 }}
    whileInView={{ pathLength: 1, opacity: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 1.5, ease: ease.smooth, delay: 0.2 }}
    {...props}
  />
)
```

### Float animation (hero visual)

```typescript
// Animation flottement infini — hero visuel
export const floatAnimation = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
}

// Variante plus subtile pour éléments secondaires
export const floatSubtle = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 8,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
}
```

### Glow pulse (indicateur actif)

```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0   rgba(53, 155, 217, 0.40); }
  50%       { box-shadow: 0 0 0 8px rgba(53, 155, 217, 0); }
}

.indicator-active {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: glow-pulse 2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .indicator-active { animation: none; }
}
```

### CTA breath pulse (one-shot à l'entrée)

```typescript
// Pulsation unique quand le bouton entre dans le viewport
export const ctaBreath = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: [0.95, 1.02, 1.0],
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: ease.smooth,
      times: [0, 0.6, 1],     // Keyframe timing
    },
  },
}
```

---

## 9. Drag

### Carousel drag horizontal

```typescript
interface DragCarouselProps {
  onDragEnd: (direction: 'next' | 'prev') => void
  dragThreshold?: number      // px pour déclencher le changement
  dragElastic?: number        // résistance aux bords (0-1)
}

const DragCarousel = ({ onDragEnd, dragThreshold = 80, dragElastic = 0.1 }) => {
  const constraintsRef = useRef(null)
  
  return (
    <div ref={constraintsRef} style={{ overflow: 'hidden' }}>
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={dragElastic}
        dragMomentum={false}
        onDragEnd={(event, info) => {
          const { offset, velocity } = info
          
          // Déclenche si assez de déplacement OU vitesse suffisante
          if (offset.x < -dragThreshold || velocity.x < -500) {
            onDragEnd('next')
          } else if (offset.x > dragThreshold || velocity.x > 500) {
            onDragEnd('prev')
          }
        }}
        style={{ cursor: 'grab' }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        {/* slides */}
      </motion.div>
    </div>
  )
}
```

### Cursor style drag

```css
.draggable {
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.draggable:active,
.dragging {
  cursor: grabbing;
}
```

---

## 10. Parallax

### Règles strictes

- Maximum **20% de décalage** par rapport au scroll
- Uniquement sur des **éléments de fond** (pas de texte, pas de CTA)
- **Jamais en boucle permanente** — uniquement scroll-driven
- Désactivé si `prefers-reduced-motion`

### Implémentation useScroll + useTransform

```typescript
import { useScroll, useTransform, motion } from 'framer-motion'

const ParallaxElement = ({ children, speed = 0.15, className }) => {
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  
  // speed = 0.15 = 15% de décalage par rapport au scroll de la section
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [`${speed * -100}px`, `${speed * 100}px`]
  )
  
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}
```

### Parallax glow (fond hero)

```typescript
const ParallaxGlow = () => {
  const { scrollYProgress } = useScroll()
  const prefersReducedMotion = useReducedMotion()
  
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3],
    prefersReducedMotion ? [0.12, 0.12] : [0.12, 0]
  )
  
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3],
    prefersReducedMotion ? [1, 1] : [1, 1.2]
  )
  
  return (
    <motion.div
      className="hero-glow"
      style={{ opacity, scale }}
      aria-hidden="true"
    />
  )
}
```

---

## 11. Scroll progress

### Progress bar de page

```typescript
const PageProgressBar = () => {
  const { scrollYProgress } = useScroll()
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <motion.div
      className="progress-bar"
      style={{
        scaleX: prefersReducedMotion ? 1 : scrollYProgress,
        transformOrigin: 'left',
        // Styling
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background: 'var(--color-accent)',
        zIndex: 200,
      }}
    />
  )
}
```

### Section progress (Case Study)

```typescript
const SectionProgress = ({ sectionRef }: { sectionRef: RefObject<HTMLElement> }) => {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center'],
  })
  
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  
  return (
    <div className="section-progress-track">
      <motion.div className="section-progress-fill" style={{ width }} />
    </div>
  )
}
```

### Sticky section scroll-driven

```typescript
// Section sticky avec progression (pour AI Showcase)
const StickyShowcase = ({ children, totalPanels }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  
  // Dériver l'index du panel actif depuis scrollYProgress
  const panelIndex = useTransform(
    scrollYProgress,
    Array.from({ length: totalPanels + 1 }, (_, i) => i / totalPanels),
    Array.from({ length: totalPanels + 1 }, (_, i) => Math.min(i, totalPanels - 1))
  )
  
  return (
    <div
      ref={ref}
      style={{ height: `${totalPanels * 100}vh` }}   // 1 viewport par panel
    >
      <div style={{ position: 'sticky', top: '64px', height: '100vh' }}>
        {children({ panelIndex })}
      </div>
    </div>
  )
}
```

---

## 12. Stagger patterns

### Grid stagger (cartes expertise 3×2)

```typescript
// Stagger en vague — de gauche à droite, ligne par ligne
const getGridItemDelay = (index: number, columns: number, baseDelay = 0.06) => {
  const row = Math.floor(index / columns)
  const col = index % columns
  return (row * columns * baseDelay) + (col * baseDelay)
}

// Usage dans le composant
const ExpertiseGrid = ({ items }) => (
  <motion.div
    className="grid"
    variants={staggerGrid}
    initial="hidden"
    whileInView="visible"
    viewport={viewportDefault}
  >
    {items.map((item, i) => (
      <motion.div
        key={item.id}
        variants={scaleReveal()}
        custom={getGridItemDelay(i, 3)}  // 3 colonnes
      >
        <ExpertiseCard {...item} />
      </motion.div>
    ))}
  </motion.div>
)
```

### Section stagger — Ordre sémantique

```typescript
// Ordre : eyebrow → headline → body → CTA
const sectionStaggerOrder = {
  eyebrow:     0,
  headline:    1,
  subheadline: 2,
  body:        3,
  cta:         4,
}

// Délais correspondants
const sectionDelays = {
  eyebrow:     0,
  headline:    0.08,
  subheadline: 0.16,
  body:        0.22,
  cta:         0.30,
}
```

### List stagger (témoignages, services)

```typescript
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.slow,
      ease: ease.smooth,
      delay,
    },
  }),
}

// Usage
{items.map((item, i) => (
  <motion.li
    key={item.id}
    variants={listItemVariants}
    custom={i * 0.07}
  >
    {item.content}
  </motion.li>
))}
```

---

## 13. Reduced motion

### Hook `useMotionConfig`

```typescript
// Hook centralisé pour toutes les décisions motion
const useMotionConfig = () => {
  const prefersReducedMotion = useReducedMotion()
  
  return {
    // Désactive les animations non-essentielles
    shouldAnimate: !prefersReducedMotion,
    
    // Durées adaptées
    duration: prefersReducedMotion
      ? { instant: 0, fast: 0, quick: 0, normal: 0, medium: 0, slow: 0 }
      : duration,
    
    // Variants adaptés
    getVariant: <T extends Record<string, unknown>>(
      animated: T,
      static_: T
    ): T => prefersReducedMotion ? static_ : animated,
    
    // Transition de slide
    slideTransition: prefersReducedMotion
      ? { duration: 0 }
      : { duration: duration.medium, ease: ease.snap },
    
    // Float (hero visual)
    floatProps: prefersReducedMotion
      ? {}
      : floatAnimation,
  }
}
```

### Variants static (fallback reduced motion)

```typescript
// Fallback pour tout variant : visible immédiatement, sans transform
export const staticReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
}

// Usage
const { shouldAnimate } = useMotionConfig()

<motion.div
  variants={shouldAnimate ? fadeUp() : staticReveal}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
```

### CSS fallbacks

```css
/* Règle globale */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Exceptions pour les transitions essentielles (focus, disclosure) */
  :focus-visible {
    transition-duration: 0.15s !important;
  }
}
```

---

## 14. Implémentation — Guide pratique

### Structure du fichier motion.ts

```
src/lib/motion.ts
├── ease {}                  — Courbes d'easing nommées
├── duration {}              — Durées sémantiques
├── spring {}                — Spring presets
├── distance {}              — Distances de translation
│
├── Variants génériques
│   ├── fadeUp()
│   ├── fadeIn()
│   ├── slideFromRight()
│   ├── slideFromLeft()
│   ├── scaleReveal()
│   ├── staggerContainer()
│   ├── wordReveal
│   ├── dropIn
│   ├── popIn
│   ├── slideUp
│   └── counterReveal
│
├── Hover & interaction
│   ├── buttonPrimary
│   ├── buttonSecondary
│   ├── cardHover
│   ├── cardPortfolioHover
│   ├── textLinkHover
│   ├── arrowLinkHover
│   ├── workflowNodeHover
│   └── navItemHover
│
├── Slide transitions
│   ├── getSlideTransition()
│   ├── crossfade
│   └── slideVertical
│
├── Page transitions
│   └── pageTransition
│
├── Effets spéciaux
│   ├── floatAnimation
│   ├── floatSubtle
│   └── ctaBreath
│
├── Presets viewport
│   ├── viewportSmall
│   ├── viewportDefault
│   ├── viewportLarge
│   └── viewportStrict
│
└── staggerGrid, staggerNormal, staggerFast, staggerSlow
```

### Checklist par composant animé

```
Avant d'implémenter une animation :
□ Quel est le rôle de cette animation ? (guide, confirme, raconte)
□ Est-ce que prefers-reduced-motion est pris en compte ?
□ L'animation joue-t-elle une seule fois ou en boucle ?
□ Est-ce que la durée correspond au registre (editorial / interface / système) ?
□ L'animation n'interfère-t-elle pas avec la lisibilité ?
□ Le composant est-il accessible sans animation ?
```

### Erreurs courantes à éviter

```typescript
// ❌ Mal — transform sur des propriétés non GPU
<motion.div animate={{ top: 100, left: 100 }} />

// ✅ Bien — transform GPU uniquement
<motion.div animate={{ x: 100, y: 100 }} />

// ❌ Mal — animation en boucle sur du texte
<motion.h1 animate={{ opacity: [1, 0.8, 1] }} transition={{ repeat: Infinity }} />

// ✅ Bien — animation de texte one-shot au scroll
<motion.h1 variants={fadeUp()} initial="hidden" whileInView="visible" viewport={{ once: true }} />

// ❌ Mal — oublier mode="wait" sur AnimatePresence (superposition de pages)
<AnimatePresence>
  <motion.div key={pathname}>

// ✅ Bien
<AnimatePresence mode="wait">
  <motion.div key={pathname}>

// ❌ Mal — layout animé sans layoutId cohérent
<motion.div layout />

// ✅ Bien — layoutId stable et unique
<motion.div layout layoutId={`card-${item.id}`} />
```

### Performance

```typescript
// Utiliser will-change avec parcimonie — seulement sur les éléments les plus animés
// Framer Motion le gère automatiquement via transform, mais en CSS manuel :
.frequently-animated {
  will-change: transform, opacity;
}

// Toujours utiliser transform et opacity — jamais width, height, top, left pour animer
// ✅ : transform: translateX(), translateY(), scale(), rotate()
// ✅ : opacity
// ❌ : width, height, top, right, bottom, left, margin, padding

// Désactiver les animations sur les éléments hors viewport
// Framer Motion whileInView gère ça automatiquement avec IntersectionObserver
```
