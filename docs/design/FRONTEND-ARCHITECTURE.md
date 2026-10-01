# CA-TECH — Architecture Frontend
> Version 1.0 — Source de vérité pour la structure du code frontend  
> À lire avec DESIGN.md (tokens, composants, motion) et docs/design/ (IA, motion, showcase, visuel)

---

## 01. Contexte du projet

**Stack actuelle :**
- React 19 + Vite 8
- React Router 7
- Supabase JS (client auth/data)
- Resend + Stripe (backend uniquement, via api/)
- Node ≥ 20

**Backend intouchable :**
```
api/           ← Vercel serverless functions (devis, notifications, webhook, stripe)
supabase/      ← Edge functions + migrations
public/        ← Assets statiques (logos, vidéos, icons PWA, images)
```

**Src actuel :** vide après reset — construction from scratch.

**Routes SPA déclarées dans vite.config.js :**
```
/                   Homepage
/services
/loic
/collaborateurs-ia
/automatisations
/realisations
/blog
/contact
/catalogue
/tarifs
/a-propos
/expertises/ia
/expertises/automatisation
/expertises/web-saas
/expertises/infrastructure
```

---

## 02. Dépendances à ajouter

| Package | Version cible | Rôle |
|---------|--------------|------|
| `framer-motion` | ^12 | Animations — défini comme outil principal dans DESIGN.md §17 |
| `lucide-react` | ^0.470+ | Icons stroke-based — cohérent avec l'esthétique CA-TECH |
| `tailwindcss` | v4 | Utility CSS — config `@theme` définie dans DESIGN.md §26 |
| `@tailwindcss/vite` | v4 | Plugin Vite pour Tailwind v4 |

**Aucun autre package UI** (pas de Radix, pas de shadcn, pas de MUI) — les composants sont écrits from scratch pour respecter le design system à la lettre.

**Chunk Vite à ajouter dans vite.config.js :**
```js
if (id.includes('framer-motion')) return 'vendor-motion'
```

---

## 03. Architecture des fichiers

```
src/
├── main.jsx                    ← Entrée Vite — ReactDOM.render + providers
├── App.tsx                     ← Routes React Router (lazy imports)
│
├── styles/
│   ├── tokens.css              ← Toutes les CSS custom properties (DESIGN.md §26)
│   └── globals.css             ← Reset, base body, fonts chargement, scroll behavior
│
├── lib/
│   ├── motion.ts               ← Variants Framer Motion exportés (DESIGN.md §17)
│   ├── hooks/
│   │   ├── useReducedMotion.ts ← Wraps Framer useReducedMotion()
│   │   └── useScrollProgress.ts← Progress de scroll (articles longs)
│   ├── constants.ts            ← Nav items, routes nommées, données statiques
│   └── utils.ts                ← cn(), formatDate(), etc.
│
├── components/
│   │
│   ├── ui/                     ← Atoms : sans logique de contenu, purement visuels
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Tag.tsx             ← Tag technique mono (stack tech)
│   │   ├── Pill.tsx            ← Badge arrondi (catégorie, status)
│   │   ├── Eyebrow.tsx         ← Label overline (uppercase, accent, letter-spacing)
│   │   └── MetricStat.tsx      ← Valeur mono + label caption (stats, résultats)
│   │
│   ├── layout/                 ← Structure : wrappers sans contenu
│   │   ├── Container.tsx       ← max-width + padding horizontal responsive
│   │   ├── Section.tsx         ← wrapper <section> + padding vertical responsive
│   │   └── Grid.tsx            ← grille CSS 12 colonnes configurable
│   │
│   ├── navigation/             ← Header et navigation
│   │   ├── Header.tsx          ← Barre fixe : logo + NavDesktop + CTA — scroll-aware
│   │   ├── NavDesktop.tsx      ← Items horizontaux + dropdowns
│   │   ├── NavMobile.tsx       ← Drawer/fullscreen mobile avec animation
│   │   └── NavDropdown.tsx     ← Sous-menu desktop avec backdrop blur
│   │
│   ├── hero/                   ← Variants de hero (3 layouts selon DESIGN.md §12)
│   │   ├── Hero.tsx            ← Homepage — centré ou left-aligned, 100vh+
│   │   ├── HeroSplit.tsx       ← Split 50/50 — texte gauche, visuel droite
│   │   └── HeroText.tsx        ← Pages intérieures — textuel pur, 60–70vh
│   │
│   ├── showcase/               ← Système showcase (DESIGN.md §13)
│   │   ├── Showcase.tsx        ← Container principal : padding, radius, background
│   │   ├── ShowcaseBrowser.tsx ← Frame navigateur Chrome avec dots décoratifs
│   │   ├── ShowcaseGlow.tsx    ← Wrapper avec glow accent radial
│   │   └── ShowcaseGrid.tsx    ← Layout grille de showcases (2 ou 3 colonnes)
│   │
│   ├── slides/                 ← Système carousel/slides (DESIGN.md §14)
│   │   ├── SlideTrack.tsx      ← Logique carousel : state, swipe, keyboard, autoplay
│   │   ├── Slide.tsx           ← Item slide : visuel + label + titre + desc + CTA
│   │   └── SlideNavigation.tsx ← Dots animés + flèches (accessible keyboard)
│   │
│   ├── sections/               ← Blocs de section composés (pas de logique page)
│   │   ├── SectionHeading.tsx  ← Eyebrow + headline + description — réutilisé dans toutes les sections
│   │   ├── Features.tsx        ← Grille features/services (3 ou 4 colonnes)
│   │   ├── Workflow.tsx        ← Pipeline visuel étapes connectées (automatisation)
│   │   ├── Testimonials.tsx    ← Carousel témoignages clients
│   │   ├── CTA.tsx             ← Bloc appel à l'action fin/milieu de page
│   │   └── StickyCTA.tsx       ← Bouton fixe bas mobile (apparaît à 50% scroll)
│   │
│   ├── portfolio/              ← Réalisations et cas clients
│   │   ├── ProjectCard.tsx     ← Card portfolio (image + tag + titre + stack)
│   │   └── CaseStudy.tsx       ← Fiche complète cas client (hero + metrics + stack)
│   │
│   ├── media/                  ← Traitement des médias (DESIGN.md §16)
│   │   ├── MediaFrame.tsx      ← Image ou vidéo avec radius + shadow + glow optionnel
│   │   └── VideoLoop.tsx       ← Vidéo autoplay muette loopée (hero backgrounds)
│   │
│   └── footer/
│       └── Footer.tsx          ← Logo + 3 colonnes nav + barre légale
│
└── pages/                      ← Un fichier par route — lazy chargés
    ├── Home.tsx
    ├── Services.tsx
    ├── CollaborateursIA.tsx
    ├── Automatisations.tsx
    ├── Realisations.tsx
    ├── Contact.tsx
    ├── Catalogue.tsx
    ├── Tarifs.tsx
    ├── APropos.tsx
    ├── Loic.tsx
    ├── Blog.tsx
    ├── expertises/
    │   ├── ExpertiseIA.tsx
    │   ├── ExpertiseAutomatisation.tsx
    │   ├── ExpertiseWebSaaS.tsx
    │   └── ExpertiseInfrastructure.tsx
    └── NotFound.tsx
```

---

## 04. Responsabilités des composants

### Composants UI (atoms)

| Composant | Responsabilité | Props clés |
|-----------|---------------|------------|
| `Button` | Rendu d'un bouton avec 4 variants (primary, secondary, ghost, text) et 4 tailles | `variant`, `size`, `as`, `disabled`, `loading` |
| `Badge` | Label court avec fond coloré, non-interactif | `variant` (accent, muted, success, warning) |
| `Tag` | Label technique monospace (stack, catégorie) | `children` |
| `Pill` | Badge arrondi (catégorie, status) | `color` |
| `Eyebrow` | Texte overline uppercase — signature visuelle de chaque section | `children`, `as` |
| `MetricStat` | Valeur proéminente (mono) + label caption — métriques résultats | `value`, `label`, `unit` |

### Composants Layout

| Composant | Responsabilité |
|-----------|---------------|
| `Container` | Applique `max-width` + `padding-x` responsive — wrappé autour de tout contenu centré |
| `Section` | `<section>` avec `padding-y` responsive et `background` configurable — séparation par fond |
| `Grid` | Grille CSS 12 colonnes avec `gap` et `cols` configurables |

### Navigation

| Composant | Responsabilité |
|-----------|---------------|
| `Header` | Barre fixe 64px avec `backdrop-filter`, scroll-aware (border opacity). Compose NavDesktop + NavMobile. |
| `NavDesktop` | Items horizontaux avec dropdowns. Actif sur route courante. |
| `NavMobile` | Drawer animé fullscreen (Framer Motion). Ferme au changement de route. |
| `NavDropdown` | Sous-menu positionné absolu, backdrop blur, fermé au clic extérieur. |

### Hero (3 variants)

| Composant | Usage | Layout |
|-----------|-------|--------|
| `Hero` | Homepage — section principale 100vh+ | Centré ou left-aligned, `staggerContainer` animation |
| `HeroSplit` | Page avec visuel fort (Collaborateurs IA, Automatisations) | 50/50 col 1–6 texte / 7–12 visuel |
| `HeroText` | Pages intérieures sans visuel (Contact, Blog, À propos) | 60–70vh, headline seule centrée |

### Showcase (4 composants)

| Composant | Responsabilité |
|-----------|---------------|
| `Showcase` | Container showcase : fond navy, radius-xl, padding-10, `scaleReveal` animation |
| `ShowcaseBrowser` | Frame Chrome simulée (barre 32px + 3 dots) au-dessus du contenu |
| `ShowcaseGlow` | `::after` pseudo-element radial gradient accent — wrappé autour d'un Showcase |
| `ShowcaseGrid` | Layout responsive 2 ou 3 colonnes de showcases avec gap correct |

### Slides (3 composants)

| Composant | Responsabilité |
|-----------|---------------|
| `SlideTrack` | State actif, logique défilement (translateX), handlers touch/keyboard/autoplay. Expose `currentSlide`, `goTo`, `goNext`, `goPrev`. |
| `Slide` | Item individuel : visuel pleine hauteur + contenu (label/titre/desc/CTA). Pas de logique. |
| `SlideNavigation` | Dots animés (6px → 24px pill active) + flèches circulaires. ARIA carousel complet. |

### Sections

| Composant | Responsabilité | Usage type |
|-----------|---------------|-----------|
| `SectionHeading` | Eyebrow + headline H2 + description paragraphe — pattern répété dans toutes les sections | Toutes les pages |
| `Features` | Grille configurable (3 ou 4 cols) de feature cards — icône + titre + texte | Homepage services, pages expertise |
| `Workflow` | Représentation visuelle pipeline : étapes numérotées connectées | Page Automatisations |
| `Testimonials` | Carousel clients avec citation, avatar, nom, titre | Homepage, pages services |
| `CTA` | Bloc de conversion : eyebrow + headline + description + 2 boutons | Fin de chaque page |
| `StickyCTA` | Bouton fixe bas sur mobile, apparaît après 50% scroll, disparaît si footer visible | Toutes les pages |

### Portfolio

| Composant | Responsabilité |
|-----------|---------------|
| `ProjectCard` | Card liste portfolio : image header 16:9 + tag category + titre + stack tags + CTA |
| `CaseStudy` | Fiche complète : hero image + eyebrow + titre + client + description + MetricStats + stack + CTA |

### Media

| Composant | Responsabilité |
|-----------|---------------|
| `MediaFrame` | Wrappeur image ou vidéo avec radius configurable, shadow défini, glow optionnel. Gère `alt` et `loading`. |
| `VideoLoop` | `<video autoPlay muted loop playsInline>` avec détection `prefers-reduced-motion` (pause si réduit). |

---

## 05. Assets existants utilisables

```
public/
├── hero-ca-tech.mp4                   → VideoLoop dans Hero homepage
├── logos/
│   ├── logo-ca-tech-icon.svg          → Logo Header (SVG inline ou img)
│   └── logo-ca-tech-icon.png          → Fallback
├── automatisations/
│   ├── automatisation-hero.webp       → Hero page Automatisations
│   ├── Automatisations.mp4            → VideoLoop showcase automatisations
│   └── gmail|slack|telegram|whatsapp|google-calendar.webp  → Icons workflow
├── collaborateurs/
│   ├── collaborateur-ia-hero.webp     → Hero page Collaborateurs IA
│   ├── Collaborateurs IA.mp4          → VideoLoop showcase collab
│   └── commercial|comptable|juridique|rh|seo|support-ia.webp → Cards agents
└── loic/
    └── loic-ia.mp4                    → Page Loïc

assets/logos/
└── logo-ca-tech.webp                  → Logo Footer ou usage éditorial (plus grand)
```

---

## 06. Stratégie Motion

**Bibliothèque :** Framer Motion uniquement. Pas de CSS `@keyframes` pour les animations UI.

### Fichier `src/lib/motion.ts`

Exporte tous les variants définis dans DESIGN.md §17 :
- `fadeUp` — entrée standard scroll (opacity 0→1, y 24→0)
- `fadeIn` — simple opacity
- `staggerContainer` — parent pour stagger enfants (0.08s)
- `slideFromRight` — slides système
- `scaleReveal` — showcases (scale 0.96→1)
- `headlineReveal` — headlines avec délai par mot
- `ease` — objet des 5 courbes (smooth, decelerate, accelerate, snap, spring)
- `duration` — objet des 7 durées (instant → storytelling)

### Règles d'application

**Entrées au scroll (`whileInView`) :**
```tsx
<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.1 }}
/>
```
- `once: true` — pas de replay
- `amount: 0.1` — déclenche dès 10% visible
- Distance max : 24–32px (jamais 80px+)

**Stagger sections :**
```tsx
<motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(item => <motion.div key={item.id} variants={fadeUp} />)}
</motion.div>
```

**Slides :** `AnimatePresence` + `motion.div` avec `x` animé, easing `snap`.

**Navigation mobile :** `AnimatePresence` + drawer `x: -100% → 0` ou `y: -100% → 0`.

### `prefers-reduced-motion`

Hook `useReducedMotion` dans chaque composant animé :
```tsx
const prefersReduced = useReducedMotion()
const variants = prefersReduced ? {} : fadeUp
```

---

## 07. Stratégie Responsive

**Approche :** Mobile First. Tout CSS commence mobile, surcharge vers le haut.

**Breakpoints (DESIGN.md §05) :**
```
mobile  : 0–767px     → md:  (768px)
tablet  : 768–1023px  → lg:  (1024px)  
laptop  : 1024–1279px → xl:  (1280px)
desktop : 1280px+     → 2xl: (1440px)
```

**Container :** Composant `Container` applique automatiquement :
```
mobile  → padding-x: 24px
tablet  → padding-x: 48px
desktop → padding-x: 80px
```

**Grille :**
- Mobile : 1 colonne pour cards, sections, showcases
- Tablet : 2 colonnes pour cards, showcases côte à côte
- Desktop : 12 colonnes — layouts complexes, split screens

**Typography responsive :**
- `--text-hero` : 40px mobile → 56px tablet → 80px desktop
- Géré en CSS custom properties avec `@media` dans `tokens.css`

**Slides :**
- Desktop : 1 large ou 2 partiellement visibles
- Mobile : pleine largeur, swipe tactile

**Vidéos :**
- `prefers-reduced-motion: reduce` → arrêt des vidéos loop
- Mobile avec connexion lente → fallback image statique (poster attribute)

---

## 08. Stratégie Performance

### Découpage des bundles (vite.config.js à mettre à jour)

```js
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('@supabase'))        return 'vendor-supabase'
    if (id.includes('react-router'))     return 'vendor-router'
    if (id.includes('framer-motion'))    return 'vendor-motion'    // ← ajouter
    if (id.includes('lucide-react'))     return 'vendor-icons'     // ← ajouter
    if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/'))
                                         return 'vendor-react'
  }
}
```

### Lazy loading des pages

```tsx
// App.tsx
const Home              = lazy(() => import('./pages/Home'))
const CollaborateursIA  = lazy(() => import('./pages/CollaborateursIA'))
// ...

// Wrapper Suspense dans App
<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```

### Images

- Format WebP (déjà en place dans public/)
- `loading="lazy"` sur toutes les images hors fold
- `fetchpriority="high"` sur l'image hero au-dessus du fold
- `width` + `height` explicites pour éviter layout shift (CLS)

### Fonts

À mettre à jour dans `index-src.html` :
- Remplacer IBM Plex par les 3 fonts DESIGN.md : Space Grotesk + Inter + JetBrains Mono
- Garder `rel="preload"` + `onload` pour chargement non-bloquant
- `display=swap` assuré

### Vidéos

- Attribut `poster` sur tous les `<video>` — image statique pendant chargement
- Pas d'autoplay sans `muted` + `playsinline`
- Arrêt vidéo si `prefers-reduced-motion`

---

## 09. Stratégie SEO

**Géré côté `index-src.html` :**
- Meta defaults (title, description, canonical, robots)
- Structured data Organization + WebSite déjà en place
- OG + Twitter Cards

**Géré côté pages React :**
- Hook `usePageMeta` (à créer dans `lib/`) — met à jour dynamiquement `document.title`, `meta[name=description]`, `link[rel=canonical]`
- Chaque page passe ses propres métadonnées

**Contenu :**
- `<h1>` unique par page — dans le composant Hero
- `<h2>` dans SectionHeading — une par section sémantique
- Ordre de tabulation logique via structure DOM naturelle

---

## 10. Points d'attention avant le code

### index-src.html — mise à jour requise
Les fonts IBM Plex Condensed/Serif actuellement dans `index-src.html` doivent être remplacées par :
```
Space+Grotesk:wght@300;400;500;600;700
Inter:wght@300;400;500;600;700
JetBrains+Mono:wght@400;500;600
```
Cette mise à jour fait partie du premier commit de setup.

### vite.config.js — chunk motion
Ajouter le chunk `vendor-motion` pour framer-motion une fois installé.

### Pas de composants formulaire génériques
Le formulaire Contact sera self-contained dans `pages/Contact.tsx`. Pas de `<Input>` ou `<Form>` abstraits — ils n'apparaissent pas ailleurs et une abstraction prématurée compliquerait la maintenance.

### Pas de composant `Modal` standalone
Inutile à ce stade. Si besoin futur, créer then.

### Séparation contenu / présentation
Les données (textes, listes de services, items nav) vont dans `lib/constants.ts` — jamais hardcodées dans les composants. Facilite la traduction et les mises à jour éditoriales.

---

## 11. Résumé des choix

| Décision | Choix | Raison |
|----------|-------|--------|
| Styles | Tailwind v4 + CSS custom properties | DESIGN.md §26 — tokens CSS pour runtime, Tailwind pour utility rapid |
| Animations | Framer Motion exclusivement | DESIGN.md §17 — variants, whileInView, AnimatePresence |
| Icons | Lucide React | Stroke-based, cohérent, tree-shakeable |
| Lazy loading | React.lazy par page | Bundle splitting — pages lourdes ne bloquent pas la homepage |
| State | Local React state | Pas de Redux ni Zustand — state UI simple, contenu statique |
| Hero variants | 3 composants séparés | Layouts trop différents pour un composant avec 10 props conditionnelles |
| Showcase | 4 composants composables | Combinaisons browser + glow + grid requises dans DESIGN.md §13 |
| Navigation | 3 composants séparés | Desktop/mobile trop divergents, dropdown isolé pour testabilité |
| Pas de design system externe | Components from scratch | Respect du design system custom CA-TECH à la lettre |
