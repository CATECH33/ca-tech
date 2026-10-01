# CA-TECH — FRONTEND ARCHITECTURE V2
> Document de référence pour la reconstruction du site — source de vérité opérationnelle

**Version :** 2.0  
**Date :** 2026-09-30  
**Statut :** VALIDÉ — prêt pour implémentation  
**Auteur :** Audit Claude Code  
**Sources :** VISUAL-DIRECTION.md · INFORMATION-ARCHITECTURE.md · SHOWCASE-SYSTEM.md · MOTION-SYSTEM.md · VISUAL-ASSET-PRODUCTION.md · FRONTEND-ARCHITECTURE.md · DESIGN.md · src/ actuel

---

## Table des matières

1. [Executive Summary](#1-executive-summary)
2. [Sources de vérité](#2-sources-de-vérité)
3. [Design Principles](#3-design-principles)
4. [Palette](#4-palette)
5. [Typography](#5-typography)
6. [Navigation](#6-navigation)
7. [Homepage Architecture](#7-homepage-architecture)
8. [Section-by-section Visual Architecture](#8-section-by-section-visual-architecture)
9. [Showcase Architecture](#9-showcase-architecture)
10. [Media Strategy](#10-media-strategy)
11. [Midjourney Asset Map](#11-midjourney-asset-map)
12. [HyperFrames Video Map](#12-hyperframes-video-map)
13. [Responsive Strategy](#13-responsive-strategy)
14. [Motion Strategy](#14-motion-strategy)
15. [Accessibility Principles](#15-accessibility-principles)
16. [Performance Strategy](#16-performance-strategy)
17. [Interior Pages](#17-interior-pages)
18. [Route Architecture](#18-route-architecture)
19. [Component Architecture](#19-component-architecture)
20. [Backend Boundaries](#20-backend-boundaries)
21. [SEO Architecture](#21-seo-architecture)
22. [Implementation Phases](#22-implementation-phases)
23. [Open Decisions](#23-open-decisions)
24. [Risks](#24-risks)
25. [Final Implementation Checklist](#25-final-implementation-checklist)

---

## 1. Executive Summary

CA-TECH est un cabinet IA-first fondé à Dijon en 2023. Le site doit incarner le positionnement : **exécution mesurable**, pas conseil générique. Le visiteur (dirigeant, fondateur, décideur) doit comprendre en 3 secondes ce que CA-TECH fait et pourquoi ça le concerne.

**Stack technique validée :**
```
React 19 · Vite 8 · React Router DOM 7
Framer Motion 13 · Tailwind CSS v4 · shadcn/ui
Supabase JS 2.49.0 · Stripe 17.4.0 · Resend 4.5.1
```

**État actuel post-reset :**
- 38+ assets visuels obsolètes supprimés de `public/`
- Références cassées corrigées (image: null, TOOL_ICONS supprimés)
- Build OK (0 erreurs) — 2 warnings bénins préexistants (axeptio, loic-widget)
- Toutes les pages intérieures sont en statut Stub — reconstruction à venir

**Deux décisions majeures à implémenter (non encore codées) :**
1. `--font-body: 'Manrope'` → **Inter** (confirmé VISUAL-DIRECTION.md [TYPE-B])
2. Routes `/expertises/*` → **/services/*** (confirmé INFORMATION-ARCHITECTURE.md)

**Asset hero validé, non encore matérialisé :**
- HOME-01 U1 = `https://platform2.cdn.acedata.cloud/midjourney/dacd21b3-561d-4220-a32d-457ba1069c5b.png?imageMogr2/cut/2944x1648x0x0`
- Cible : `public/hero/catech-hero-01.webp` (crop + WebP convert)

---

## 2. Sources de Vérité

| Document | Rôle | Priorité |
|----------|------|----------|
| `docs/design/VISUAL-DIRECTION.md` | Référence visuelle principale — 13 sections, tokens, specs layout | CRITIQUE |
| `docs/design/INFORMATION-ARCHITECTURE.md` | Routes, UX narrative, specs section-par-section | CRITIQUE |
| `docs/design/SHOWCASE-SYSTEM.md` | Composant showcase — props, states, responsive, a11y | CRITIQUE |
| `docs/design/MOTION-SYSTEM.md` | Variants Framer Motion, easing, durées, springs | CRITIQUE |
| `docs/design/VISUAL-ASSET-PRODUCTION.md` | Assets requis, prompts MJ, style suffix, priorités | HAUTE |
| `docs/design/FRONTEND-ARCHITECTURE.md` | Architecture composants, patterns de code | HAUTE |
| `memory/project_strategy_reference.md` | Stratégie business, vision 2029, slogan | RÉFÉRENCE |

**Règle de conflit :** En cas de divergence entre documents, l'ordre de priorité ci-dessus est appliqué. Ce document (V2) prend la décision finale et sert de source opérationnelle unique pour l'implémentation.

---

## 3. Design Principles

```
01. IA-FIRST, PAS GÉNÉRIQUE
    Chaque section prouve l'expertise, ne la déclare pas.
    Montrer des systèmes qui fonctionnent, pas des promesses.

02. LAYOUT DIFFÉRENT PAR SECTION
    Pas de répétition de pattern. Section 04 ≠ section 05 ≠ section 06.
    Le lecteur ne peut pas "scanner" — il doit lire.

03. TYPOGRAPHIE COMME ARCHITECTURE
    Les headlines sont des éléments graphiques.
    Font-size jusqu'à 80px, lettre-spacing négatif, contraste maximum.

04. ANIMATION AU SERVICE DU SENS
    Chaque animation révèle une information ou confirme une interaction.
    Jamais décorative. Jamais distrayante.

05. PALETTE FROIDE, PREMIUM, TECHNIQUE
    Deep Navy #05101E comme fond dominant.
    Accent bleu #359BD9 uniquement sur les éléments actifs et métriques.
    Aucun violet générique, aucun orange, aucun rose.

06. PERFORMANCE = CRÉDIBILITÉ
    Un cabinet IA ne peut pas avoir un site lent.
    LCP < 2.5s, CLS < 0.1, INP < 200ms.
```

---

## 4. Palette

### Couleurs de fond (surfaces)

| Token CSS | Hex | Usage |
|-----------|-----|-------|
| `--surface-canvas` | `#05101E` | Fond dominant — sections impaires |
| `--surface-panel` | `#102740` | Fond alternatif — sections paires |
| `--surface-elevated` | `#1A4066` | Cards, showcases, popups |
| `--surface-overlay` | `rgba(16,39,64,0.90)` | Nav scroll, dropdowns |
| `--surface-frosted` | `rgba(5,16,30,0.82)` | Header frosted glass |
| `--surface-glow` | `rgba(53,155,217,0.08)` | Background glow zones |

### Couleurs sémantiques

| Token CSS | Hex | Usage |
|-----------|-----|-------|
| `--color-accent` | `#359BD9` | CTAs primaires, liens actifs, métriques |
| `--color-accent-hover` | `#4AAEE0` | Hover état sur accent |
| `--color-accent-dim` | `#1E6A96` | Hover état sur fond sombre |
| `--color-cool-white` | `#F2F4F6` | Headlines, texte principal |
| `--color-silver` | `#A5ACB5` | Texte secondaire, descriptions |
| `--color-light-silver` | `#E0E0E3` | Texte tertiaire |
| `--color-success` | `#22C55E` | Métriques positives, checkmarks |
| `--color-warning` | `#F59E0B` | États d'alerte |
| `--color-error` | `#EF4444` | États d'erreur |

### Alternance fond sections (homepage)

```
Nav          → transparent → frosted glass (scroll)
Section 01   → Hero        → #05101E (canvas)
Section 02   → Position.   → #102740 (panel)
Section 03   → AI Showcase → #05101E (canvas)
Section 04   → Automation  → #102740 (panel)
Section 05   → LLM/MCP     → #05101E (canvas) + glow radial top
Section 06   → Digital Exp → #102740 (panel)
Section 07   → Systems     → #05101E (canvas)
Section 08   → Portfolio   → #102740 (panel)
Section 09   → Process     → #05101E (canvas)
Section 10   → Expertise   → #102740 (panel)
Section 11   → CTA         → #05101E (canvas) + glow centré
Footer       → #05101E (canvas)
```

---

## 5. Typography

### Familles retenues

| Rôle | Famille | Variable CSS | Décision |
|------|---------|-------------|----------|
| Display / Titres | Space Grotesk | `--font-display` | ✅ Inchangée |
| Body / Interface | **Inter** | `--font-body` | ⚠️ Changer Manrope → Inter |
| Mono / Code | JetBrains Mono | `--font-mono` | ✅ Inchangée |

**Action requise** : dans `src/styles/globals.css`, ligne 22 :
```css
/* AVANT */
--font-body: 'Manrope', 'Helvetica Neue', Arial, sans-serif;

/* APRÈS */
--font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
```

Et dans `index-src.html`, remplacer le lien Google Fonts Manrope par Inter :
```html
<!-- AVANT -->
<link href="...Manrope:wght@300;400;500;600;700..." />

<!-- APRÈS -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### Échelle typographique

| Token | Valeur | Usage |
|-------|--------|-------|
| `--text-hero` | 80px | H1 hero desktop |
| `--text-display` | 64px | Headlines LLM section |
| `--text-display-md` | 48px | Headlines section |
| `--text-heading-xl` | 40px | Sous-section titres |
| `--text-heading` | 32px | Headings intérieures |
| `--text-heading-sm` | 24px | Sous-titres |
| `--text-subheading` | 20px | Corps éditorial important |
| `--text-body-lg` | 18px | Sous-headline hero |
| `--text-body` | 16px | Corps standard |
| `--text-body-sm` | 14px | Labels, captions |
| `--text-label` | 13px | Tags, overlines |
| `--text-caption` | 12px | Mentions, métadonnées |
| `--text-overline` | 11px | Eyebrows en uppercase |

### Règles typographiques

- `letter-spacing: -0.04em` sur les headlines display (Space Grotesk)
- `letter-spacing: 0.06em` sur les eyebrows en uppercase (Inter)
- `line-height: 1.02` sur les H1 display, `1.6` sur le corps
- `text-wrap: balance` sur les headlines, `text-wrap: pretty` sur les paragraphes

---

## 6. Navigation

### Spécification header

```
Position : fixed, top: 0, left: 0, right: 0, z-index: 100
Height   : 64px desktop / 56px mobile
```

### Layout desktop

```
[Logo SVG]          [Expertises ▾] [Solutions IA] [Réalisations] [À propos]          [Parler à Loïc ▶]
```

### États du header

| État | Background | Backdrop | Border |
|------|-----------|----------|--------|
| Initial | transparent | none | transparent |
| Après scroll | rgba(5,16,30,0.82) | blur(24px) saturate(1.5) | rgba(165,172,181,0.10) |

**Seuil de déclenchement :** 60px (confirmé VISUAL-DIRECTION.md §01 — le code Header.jsx existant est correct)

### Items de navigation

```
Expertises          → dropdown avec 5 sous-items
├─ Intelligence Artificielle    /services/ia
├─ Automatisation               /services/automatisation
├─ Développement Web            /services/developpement
├─ SEO                          /services/seo
└─ Design & Identité            /services/design

Solutions IA        → /services/ia (direct)
Réalisations        → /projets
À propos            → /a-propos
```

### CTA header

- Label : "Parler à Loïc"
- Action : **ouvre le widget Loïc** (pas `/contact` — divergence actuelle à corriger)
- Style : `background: #359BD9`, `border-radius: 6px`, padding 8px 16px
- `hidden md:inline-flex`

### Mobile nav

- Icône burger (Menu 20px) — `background: rgba(255,255,255,0.06)`
- Drawer fullscreen : fond `#05101E`, animation slide depuis la droite
- Tous les items + CTA "Parler à Loïc"

### Divergences header actuelles (à corriger)

| Actuel | Cible | Fichier |
|--------|-------|---------|
| CTA navigue vers /contact | Ouvre widget Loïc | Header.jsx |
| Routes /expertises/* | /services/* | NavDesktop.jsx, NavMobile.jsx |

---

## 7. Homepage Architecture

### Logique narrative en 3 temps

```
TEMPS 1 — IMPACT IMMÉDIAT (sections 01–03)
  01. Hero          → Identité, valeur, CTA immédiat
  02. Positionnement → Différenciation vs agences classiques, métriques

TEMPS 2 — DÉMONSTRATION (sections 03–08)
  03. AI Showcase    → Agent Loïc en action
  04. Automation     → Workflow automatisé concret
  05. LLM / MCP      → Expertise technique avancée
  06. Digital Exp.   → Réalisations web (carousel)
  07. Systems        → Infrastructure & intégrations

TEMPS 3 — CONFIANCE & CONVERSION (sections 08–11)
  08. Portfolio      → 4 projets réels avec métriques
  09. Process        → 6 étapes, délais réels
  10. Expertise      → 5 cards (numérotées 01–05)
  11. CTA            → Ultime conversion Loïc
```

### Principe de layout différencié

Aucune section ne répète le layout d'une autre :
```
Hero          → Split 55/45, texte gauche, visuel droite
Positionnement → Texte gauche + bande métriques 4 cols + citation centrée
AI Showcase   → Sticky panel (texte défile, interface fixe)
Automation    → Full-width visual, diagramme nœuds animés
LLM/MCP       → Large typography centrée éditoriale
Digital Exp.  → Carousel horizontal avec peek
Systems       → Grille 2-3 cols cards techniques
Portfolio     → Showcase horizontal, 1.5 cartes visibles
Process       → Timeline verticale numérotée
Expertise     → Grille 5 cards numérotées
CTA           → Centré, glow radial, un seul bouton
```

---

## 8. Section-by-section Visual Architecture

### §01 — Hero

**Background :** `#05101E` + glow accent top-right + dot grid  
**Layout :** Split 12 colonnes — texte 5 col (lg:col-span-5) + visuel 7 col (lg:col-span-7)  
**H1 cible :** `"L'IA qui transforme votre croissance."` (⚠️ actuel : "votre entreprise.")  
**Eyebrow :** Badge animé `"Agence IA-First · Basé en France"` avec dot pulsant  
**Sous-headline :** 16px, `#A5ACB5`, max-width 420px  
**CTAs :**
- Primaire : "Parler à Loïc" → widget Loïc — `background: #359BD9`, shadow glow
- Secondaire : "Voir nos réalisations" → `/projets` — variant outline

**Visuel hero :**
- Asset : `public/hero/catech-hero-01.webp` (HOME-01 U1, à matérialiser)
- Dimensions : 2944×1648 cropped, converti WebP
- Poster fallback : `public/hero/catech-hero-poster.webp`
- Flottement : animation CSS `float` 7s ease-in-out infinite, amplitude 12px
- `border-radius: 24px`, `box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(53,155,217,0.12)`
- En attente matérialisation — utiliser HeroVisual (terminal console) comme fallback temporaire

**Stats bas de hero :**
```
[50+] Projets livrés  |  [< 24h] Délai réponse  |  [100%] Basé en France
```
Séparateur `rgba(165,172,181,0.08)` entre chaque stat

**Animation d'entrée :** staggerée `0.08s/élément` — eyebrow → H1 → sous-headline → CTAs → stats → visuel (delay 0.35s)

---

### §02 — Positionnement

**Background :** `#102740` (surface-panel)  
**Layout :** Texte pleine largeur haut + bande métriques 4 colonnes + citation éditoriale centrée bas  
**Headline :** "Pas une agence web. Un cabinet d'intelligence digitale."  
**Métriques :**
```
[48h]       Premier livrable IA opérationnel
[5]         Pôles d'expertise couverts
[2023]      Fondé à Dijon, actif en France
[< 1 sem.]  Prototype livré en sprint
```
Police métriques : `--font-mono`, font-size display-md (48px), `color: #F2F4F6`  
Animation : **count-up** au scroll — `1.2s`, ease-out

**Citation éditoriale :** italique, display-md centré, max-width 800px  
**CTA :** Lien texte "En savoir plus sur notre approche →" → `/a-propos`

---

### §03 — AI Showcase

**Background :** `#05101E` (canvas)  
**Layout :** Sticky panel — texte gauche défile (col 1-5), panel interface fixe droite (col 6-12)  
**Sticky :** `position: sticky, top: 64px` (hauteur nav) — panel visible pendant 3× height section  
**Asset principal :** à déterminer parmi :
- Option A : Vidéo `public/loic/loic-ia-new.mp4` (à recréer)
- Option B : Interface chat simulée en code (typing animation)
- Option C : Screenshot animé de l'interface Loïc

**Statut :** `loic/loic-ia.mp4` supprimé — nouveau recording requis  
**Fallback temporaire :** Simuler conversation via typing animation (code pur)  

**Tags capacités :**
```
[Qualification leads] [Diagnostic IA] [Génération devis] [Rapport automatique]
[RAG documentaire]   [Agents métier] [Intégration CRM]   [LLM sur-mesure]
```
**CTAs :** "Essayer Loïc" (widget) + lien "Voir tous nos agents IA →" `/services/ia`

---

### §04 — Automation

**Background :** `#102740` (surface-panel)  
**Layout :** Full-width visual — texte + diagramme pleine largeur + résultats bas  
**Diagramme :** Nœuds connectés animés (existant dans AutomationSection.jsx — KEEP)
```
[Trigger] → [Qualification] → [CRM Update] → [Email] → [Devis Auto]
```
**Résultat :** `"10h économisées / semaine en moyenne"` — badge vert `#22C55E`  
**Tags outils :** `[n8n] [Make] [Zapier] [Scripts Node] [Python] [APIs]`  
**Icons outils :** à reconstruire avec nouveaux assets Midjourney (gmail, slack, etc.) — actuels supprimés  
**CTA :** "Voir une démo d'automatisation" → `/services/automatisation`

---

### §05 — LLM / Agents / MCP

**Background :** `#05101E` (canvas) + `radial-gradient(ellipse at 50% 0%, rgba(53,155,217,0.10), transparent 60%)`  
**Layout :** Large typography centrée — 100% centré (seule section centrée)  
**Headline :** 64px, "Des systèmes qui pensent, connectés à vos outils."  
**Animation headline :** word-by-word reveal, stagger 0.04s/mot  
**3 blocs (sans cards) :**
```
01. LLM sur-mesure        Fine-tuning · RAG · prompt engineering · évaluation
02. Architectures agents   Multi-agents · mémoire · routage · orchestration
03. Protocoles MCP         Context servers · tool-calling · intégrations
```
**Tags :** `[OpenAI] [Anthropic] [Llama] [LangChain] [Supabase]`  
**CTA :** Lien texte "Voir notre expertise IA →" `/services/ia`

---

### §06 — Digital Experiences

**Background :** `#102740` (surface-panel)  
**Layout :** Carousel horizontal — headline gauche + carousel 1.5 cartes visibles + dots  
**Cards :** `width: 480px, height: 320px, border-radius: 16px`  
**4 projets :** CA-TECH Manager / CV Magic / Pasmal / Pemous Money  
**Assets :** SUPPRIMÉS → image: null → **REBUILD REQUIRED**  
Cibles : `public/portfolio/ca-tech-manager/dashboard.webp`, etc.  
**Interaction :** drag-to-scroll, swipe mobile, dots navigation  
**CTA :** "Voir tous les projets →" `/projets`

---

### §07 — Systems (Infrastructure)

**Background :** `#05101E` (canvas)  
**Layout :** Grille 2-3 colonnes — 6 domaines techniques  
**Cards système (existantes dans constants.js) :**
```
Cloud & Hébergement  Data & Pipelines   APIs & Intégrations
Cybersécurité        Monitoring         Scalabilité
```
**Style :** cards minimalistes, icônes Lucide, no border (ou border subtle au hover)

---

### §08 — Portfolio

**Background :** `#102740` (surface-panel)  
**Layout :** Showcase horizontal — 1.5 cartes visibles, scroll/drag  
**Même assets que Digital Experiences** — les deux sections partagent les mêmes screenshots  
**Métriques par projet :**
```
CA-TECH Manager   → "App interne"
CV Magic          → "+200 CVs générés"
Pasmal            → "Dashboard temps réel"
Pemous Money      → "+180% engagement"
```

---

### §09 — Process

**Background :** `#05101E` (canvas)  
**Layout :** Timeline verticale numérotée, 6 étapes  
**Étapes (PROCESS_STEPS de constants.js) :**
```
01. Diagnostic   1 semaine
02. Stratégie    3 jours
03. Sprint 1     Semaine 1
04. Exécution    2–4 semaines
05. Validation   1 semaine
06. Livraison    J-day
```

---

### §10 — Expertise Cards

**Background :** `#102740` (surface-panel)  
**Layout :** Grille 5 cards (numérotées 01–05)  
**Cards (EXPERTISE_CARDS de constants.js) :**
```
01. Intelligence Artificielle
02. Automatisation
03. Développement Web
04. SEO
05. Design & Identité
```
Chaque card : numéro mono en accent, icône Lucide, titre, description, tags, lien

---

### §11 — CTA

**Background :** `#05101E` (canvas) + glow radial centré `rgba(53,155,217,0.12)`  
**Layout :** Centré — headline + sous-texte + 1 bouton principal  
**Bouton :** "Démarrer avec Loïc" → widget Loïc (ou `/contact` comme fallback)  
**Design :** section la plus épurée — maximum de respiration, minimum de bruit

---

## 9. Showcase Architecture

### Trois registres visuels

| Registre | Description | Sections |
|----------|-------------|---------|
| **Opérationnel** | Interface en fonctionnement — fenêtre sur un vrai système | AI Showcase, MCP |
| **Architectural** | Schéma de système, diagramme de connexions | Automation, LLM |
| **Résultat** | Métriques, avant/après, livrables | Portfolio, Digital Exp. |

### Architecture du composant Showcase

```
<Showcase>
  ├── <ShowcaseTrack>          — scroll container, overflow-x: hidden
  │   ├── <ShowcaseSlide />   — role="group" aria-label="Slide N sur M"
  │   └── ...
  └── <ShowcaseNav>
      ├── <ShowcaseArrow direction="prev" />
      ├── <ShowcaseDots />
      └── <ShowcaseArrow direction="next" />
```

### Props requises

```typescript
interface ShowcaseProps {
  items: ShowcaseItem[]
  variant: 'full' | 'inline' | 'mini'
  register: 'operational' | 'architectural' | 'result'
  autoPlay?: boolean
  autoPlayInterval?: number   // ms, default 4000
  drag?: boolean               // touch/swipe support
  loop?: boolean
}
```

### Tokens de dimension

```css
--showcase-full-height-desktop:   560px
--showcase-full-height-tablet:    400px
--showcase-inline-height-desktop: 480px
--showcase-inline-height-tablet:  360px
--showcase-mini-width:            380px
--showcase-mini-height:           260px
```

### Tokens de surface

```css
--showcase-frame-radius:  24px  (--radius-xl)
--showcase-frame-shadow:  0 32px 80px rgba(0,0,0,0.45), 0 0 60px rgba(53,155,217,0.10)
--showcase-frame-border:  1px solid rgba(165,172,181,0.12)
```

### Navigation

- Flèches : 40×40px, fond `rgba(255,255,255,0.06)`, border subtle, hover avec border accent
- Dots : 6px circles, actif blanc, inactif `rgba(165,172,181,0.35)`
- Keyboard : ArrowLeft / ArrowRight pour navigation
- Touch : drag-to-slide (Framer Motion `drag="x"` ou pointer events natifs)

### Accessibilité showcase

```html
<section role="region" aria-label="Carousel [nom]" aria-roledescription="carousel">
  <div aria-live="polite" aria-atomic="true">Slide [N] sur [M]</div>
  <!-- boutons avec aria-label -->
</section>
```

---

## 10. Media Strategy

### Hiérarchie des médias

```
1. CSS pur + SVG    → Process, Systems, CTA, Positionnement
2. Animation code   → AutomationSection (nœuds), HeroVisual (fallback)
3. Images WebP      → Hero, Portfolio, DigitalExperiences, AIShowcase
4. Vidéo MP4        → AI Showcase (Loïc demo), Hero loop (optionnel)
```

### Règles de performance

- Format : **WebP** obligatoire pour toutes les images statiques
- Images hero : `width="2944" height="1648" loading="eager" fetchpriority="high"`
- Images off-screen : `loading="lazy"` + `decoding="async"`
- Vidéos : `preload="none"` par défaut, `preload="metadata"` pour hero loop
- Poster obligatoire pour toute vidéo visible above the fold
- `<picture>` avec sources pour mobile/desktop quand ratio différent

### Budgets

| Élément | Budget max |
|---------|-----------|
| Hero webp desktop | < 180 KB |
| Hero webp mobile | < 90 KB |
| Screenshot portfolio | < 80 KB/image |
| Vidéo AI showcase | < 6 MB |
| Total page initiale | < 1.2 MB |

---

## 11. Midjourney Asset Map

### Master style suffix (à ajouter à chaque prompt)

```
--style raw --v 7 --ar [RATIO]
cinematic editorial photography, deep navy background #05101E,
cold blue accent lighting #359BD9, premium tech aesthetic,
no people facing camera, no purple gradients, no neon,
no stock photography, no generic AI imagery,
depth of field, professional composition, 8K
```

### Assets à produire (par priorité)

| ID | Fichier cible | Section | Ratio | Dimensions | Poids max | Priorité |
|----|--------------|---------|-------|-----------|---------|---------|
| H-01 | `public/hero/catech-hero-01.webp` | Hero | 16:9 | 1920×1080 | < 180 KB | **CRITIQUE** |
| H-02 | `public/hero/catech-hero-poster.webp` | Hero poster | 16:9 | 1920×1080 | < 80 KB | **CRITIQUE** |
| H-03 | `public/hero/catech-hero-mobile.webp` | Hero mobile | 9:16 | 1080×1920 | < 90 KB | HAUTE |
| AI-01 | `public/ai/catech-ai-showcase-loic.webp` | AI Showcase | 4:3 | 1200×900 | < 150 KB | **CRITIQUE** |
| AI-02 | `public/ai/catech-ai-background.webp` | AI bg | 16:9 | 1920×600 | < 100 KB | MOYENNE |
| LLM-01 | `public/llm/catech-llm-neural-bg.webp` | LLM bg | 21:9 | 1920×600 | < 130 KB | HAUTE |
| PF-01 | `public/portfolio/ca-tech-manager/dashboard.webp` | Portfolio | 7:4 | 1400×875 | < 80 KB | **CRITIQUE** |
| PF-02 | `public/portfolio/cv-magic/home.webp` | Portfolio | ~2:1 | 1400×672 | < 60 KB | **CRITIQUE** |
| PF-03 | `public/portfolio/pasmal/home.webp` | Portfolio | ~2:1 | 1400×669 | < 70 KB | **CRITIQUE** |
| PF-04 | `public/portfolio/pemous-money/home.webp` | Portfolio | 3:2 | 1217×810 | < 70 KB | **CRITIQUE** |
| SEO-01 | `public/og-image.webp` | Open Graph | 1.91:1 | 1200×630 | < 120 KB | HAUTE |

### HOME-01 U1 — Matérialisation

**Source :** `https://platform2.cdn.acedata.cloud/midjourney/dacd21b3-561d-4220-a32d-457ba1069c5b.png?imageMogr2/cut/2944x1648x0x0`  
**Dimensions source :** 2944×1648 PNG  
**Opérations requises :**
1. Télécharger le PNG source
2. Convertir en WebP, qualité 85
3. Créer version mobile 1080×1920 (crop centré ou version dédiée)
4. Placer dans `public/hero/`

**Interdits visuels :**
```
Violet IA générique · Rose néon · Orange futuriste · Vert cyberpunk
Gaming aesthetic · Stock photo corporate · Robots génériques
Cerveaux holographiques · Personnes devant ordinateur (plan frontal)
```

---

## 12. HyperFrames Video Map

### Vidéos à produire

| ID | Fichier cible | Section | Format | Ratio | Poids max | Priorité |
|----|--------------|---------|--------|-------|---------|---------|
| V-AI-01 | `public/loic/loic-ia-new.mp4` | AI Showcase | MP4 H.265 | 4:3 | < 6 MB | HAUTE |
| V-HERO-01 | `public/hero/catech-hero-loop.mp4` | Hero bg loop | MP4 | 16:9 | < 3 MB | FAIBLE |
| V-LLM-01 | `public/llm/catech-llm-loop.mp4` | LLM bg | MP4 | 21:9 | < 3 MB | FAIBLE |

### Stratégie vidéo

- Toujours fournir un `poster` WebP (= première frame optimisée)
- `autoPlay muted loop playsInline` pour les vidéos ambient loop
- Pas de vidéo autoplay au-dessus du fold — utiliser image + poster
- AI Showcase : vidéo déclenchée uniquement quand section est visible (IntersectionObserver)
- Fallback : si vidéo non disponible, utiliser image AI-01 ou animation code

---

## 13. Responsive Strategy

### Breakpoints Tailwind v4

```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

### Règles Mobile First

```
Base (< 640px)   → Single column, textes centrés hero, nav burger
sm (640px)       → Légères améliorations spacing
md (768px)       → Nav desktop visible, split layouts commencent
lg (1024px)      → Grilles complètes, showcases pleine largeur
xl (1280px)      → Type scale maximale, max-width container
```

### Container

```css
max-width: 1200px  /* --grid-max-width */
padding-x: 24px    /* mobile */
padding-x: 48px    /* tablet */
padding-x: 80px    /* desktop */
```

### Section padding vertical

```
Mobile  : 64px top/bottom
Tablet  : 80px top/bottom
Desktop : 112px top/bottom (section-lg)
```

### Comportements spécifiques

| Section | Mobile | Desktop |
|---------|--------|---------|
| Hero | Colonne unique, visuel dessous | Split 55/45 |
| AI Showcase | No sticky, colonne | Sticky panel |
| Automation | Diagramme scroll horizontal | Pleine largeur |
| Portfolio | 1 carte à la fois | 1.5 cartes visibles |
| Expertise | 1 col (sm), 2 col (md), 3 col (lg) | 5 cartes en rangée |

---

## 14. Motion Strategy

### Trois registres d'animation

| Registre | Durée | Usage |
|----------|-------|-------|
| **Editorial** | 0.6–1.2s | Entrées sections, headlines, visuels hero |
| **Interface** | 0.15–0.35s | Hover, focus, feedback clavier |
| **Système** | variable | Compteurs, tracés SVG, typing |

### Easing tokens

```typescript
ease.smooth      = [0.16, 1, 0.3, 1]   // Entrées éditoriales
ease.decelerate  = [0, 0, 0.2, 1]       // Sorties de hors-frame
ease.accelerate  = [0.4, 0, 1, 1]       // Disparitions
ease.snap        = [0.2, 0, 0, 1]       // Transitions UI rapides
ease.gentle      = [0.25, 0.1, 0.25, 1] // Composants ambient
```

### Spring presets

```typescript
spring.snappy = { stiffness: 500, damping: 35, mass: 0.8 }  // Micro-interactions
spring.smooth = { stiffness: 300, damping: 30, mass: 1.0 }  // UI standard
spring.gentle = { stiffness: 180, damping: 25, mass: 1.2 }  // Editorial
spring.bounce = { stiffness: 400, damping: 15, mass: 0.8 }  // Rare, jamais sur texte
```

### Distance tokens

```typescript
distance.xs = 8    // Tooltips, badges
distance.sm = 16   // Éléments UI inline
distance.md = 24   // Sections standard ← défaut fadeUp
distance.lg = 40   // Headlines
distance.xl = 60   // Showcases, grands visuels
distance.hero = 80 // Hero principal uniquement
```

### Variants à ajouter à src/lib/motion.js

La version actuelle de `motion.js` est INCOMPLÈTE. Variants manquants (définis dans MOTION-SYSTEM.md) :

```typescript
spring (presets snappy/smooth/gentle/bounce)
distance (tokens xs/sm/md/lg/xl/hero)
fadeUp(yDistance, duration)         // Signature paramétrique
fadeIn(duration)
slideFromRight(xDistance)
slideFromLeft(xDistance)
scaleReveal()
wordReveal (per-word variant)
dropIn                              // Modals
popIn                               // Tooltips
slideUp                             // Drawers
counterReveal                       // Métriques
staggerNormal                       // stagger 0.08s
staggerGrid                         // stagger 0.06s, delay 0.20s
```

### viewport standard

```typescript
viewport = { once: true, amount: 0.10, margin: "0px 0px -80px 0px" }
```

### Règles réduced-motion

```typescript
const prefersReduced = useReducedMotion()
const variants = prefersReduced ? {} : targetVariant
// Désactiver toutes les animations CSS via @media (prefers-reduced-motion: reduce)
// ✅ Déjà en place dans globals.css
```

---

## 15. Accessibility Principles

### Niveau cible : WCAG 2.1 AA

### Contraintes critiques

- Contraste minimum 4.5:1 sur texte normal, 3:1 sur texte large
- `#A5ACB5` sur `#05101E` : ratio ~4.6:1 ✅ (limite — ne pas assombrir davantage)
- Focus visible sur tous les éléments interactifs (`:focus-visible` déjà stylé)
- Skip-link `.skip-link` déjà en place dans le HTML

### Navigation

- `aria-label="CA-TECH — Accueil"` sur le logo ✅
- `aria-expanded` sur le burger mobile ✅
- `aria-controls="mobile-menu"` ✅
- Dropdown nav : `role="navigation"`, items avec `aria-current="page"`

### Carousels / Showcases

```html
role="region"
aria-label="Carousel [description]"
aria-roledescription="carousel"
aria-live="polite" (pour annoncer le slide actif)
```

### Images

- Images décoratives : `alt=""` ou `aria-hidden="true"`
- Images informatives : alt descriptif
- Vidéos : transcript ou description disponible

### Motion

- `useReducedMotion()` hook sur chaque composant animé
- Animations désactivées via CSS `@media (prefers-reduced-motion: reduce)` ✅

---

## 16. Performance Strategy

### Objectifs Core Web Vitals

| Métrique | Cible | Critique |
|----------|-------|---------|
| LCP | < 2.5s | Hero WebP comme ressource critique |
| CLS | < 0.1 | Dimensions images déclarées |
| INP | < 200ms | Animations sur GPU (transform/opacity) |
| FID | < 100ms | — |

### Stratégies

**Images**
- `fetchpriority="high"` sur hero image (LCP element)
- `<link rel="preload" as="image" href="/hero/catech-hero-01.webp">` dans `<head>`
- `width` et `height` attributs sur toutes les images (CLS prevention)
- `loading="lazy"` sur images below-fold

**Fonts**
- `display=swap` sur Google Fonts ✅
- Préconnexion : `<link rel="preconnect" href="https://fonts.googleapis.com">` ✅

**JavaScript**
- Code splitting par route (React Router lazy loading)
- Framer Motion : tree-shakeable, importer seulement les variants utilisés
- Vercel déploiement : `cleanUrls: true`, SPA routing via custom Vite plugin

**Vidéos**
- `preload="none"` par défaut
- `autoPlay` uniquement sur vidéos ambient (muted, loop)
- Lazy-load vidéo AI Showcase via IntersectionObserver

**Build Vercel**
- `buildCommand: "sh build.sh"` → build manager + build site → dist
- `outputDirectory: "."` → Vercel sert depuis la racine
- SPA routing : copie `dist/index.html` vers chaque route HTML statique

---

## 17. Interior Pages

### Statut actuel de toutes les pages intérieures

| Route | Composant | Statut | Priorité rebuild |
|-------|-----------|--------|-----------------|
| `/services` | ServicesPage | Stub | Phase 2 |
| `/services/ia` | IAServicePage | Stub | Phase 2 |
| `/services/automatisation` | AutomationServicePage | Stub | Phase 2 |
| `/services/developpement` | DevServicePage | Stub | Phase 2 |
| `/services/seo` | SEOServicePage | Stub | Phase 2 |
| `/services/design` | DesignServicePage | Stub | Phase 2 |
| `/projets` | ProjetPage | Stub | Phase 2 |
| `/projets/ca-tech-manager` | CaseStudyPage | Stub | Phase 2 |
| `/a-propos` | AProposPage | Stub | Phase 2 |
| `/contact` | ContactPage | Stub (formulaire Supabase) | Phase 2 |
| `/devis` | DevisPage | Stub (multi-step) | Phase 2 |
| `/mentions-legales` | LegalPage | Stub | Phase 2 |
| `/politique-de-confidentialite` | PrivacyPage | Stub | Phase 2 |
| `/gestion-des-cookies` | CookiesPage | Stub | Phase 2 |
| `/blog` | BlogPage | Phase 3 | Phase 3 |

### Structure type page service

```
Header (fixe)
├── Hero section (full-width, H1 + description + CTA)
├── Showcase spécifique au service
├── Liste des livrables
├── Process / Méthode
├── Résultats / Métriques
├── FAQ
└── CTA final Loïc
```

### Routes SEO locales (Phase 3)

`/agence-ia-[ville]`, `/automatisation-[ville]`, `/creation-site-[ville]`, `/seo-[ville]`  
×10 villes : Paris, Lyon, Dijon, Troyes, Marseille, Bordeaux, Toulouse, Nantes, Lille, Strasbourg

---

## 18. Route Architecture

### Routes Phase 1 (homepage + légal)

```
/                               Home.jsx → 11 sections
/contact                        ContactPage (formulaire Supabase)
/devis                          DevisPage (multi-step)
/mentions-legales               LegalPage
/politique-de-confidentialite   PrivacyPage
/gestion-des-cookies            CookiesPage
```

### Routes Phase 2 (services + projets + about)

```
/services                       ServicesHub
/services/ia                    IAServicePage
/services/automatisation        AutomationServicePage
/services/developpement         DevServicePage
/services/seo                   SEOServicePage
/services/design                DesignServicePage

/projets                        ProjetPage
/projets/ca-tech-manager        CaseStudyPage
/projets/cv-magic               CaseStudyPage
/projets/pasmal                 CaseStudyPage
/projets/pemous-money           CaseStudyPage

/a-propos                       AProposPage
```

### Routes techniques (existantes — CONSERVER)

```
/manager/*                      CA-TECH Manager app (dist/manager/)
/admin/loic-ia/                 Interface admin Loïc IA
```

### Redirections Vercel à mettre à jour

Fichier `vercel.json` — redirects à corriger :
```json
// AVANT (incorrect)
{ "source": "/services/:path*", "destination": "/expertises/web-saas" }

// APRÈS (à construire selon routes Phase 2)
// Supprimer le redirect /services/ car ce sera une vraie route
// Ajouter redirects legacy: /expertises/* → /services/*
```

### Divergence actuelle : App.jsx

Routes dans `src/App.jsx` utilisent `/expertises/*` — à migrer vers `/services/*` en Phase 1.

**Liste des fichiers à modifier pour la migration routes :**
- `src/App.jsx` — définitions routes
- `src/lib/constants.js` — EXPERTISE_CARDS href
- `src/components/navigation/NavDesktop.jsx` — liens nav
- `src/components/navigation/NavMobile.jsx` — liens nav
- `src/components/sections/AutomationSection.jsx` — CTA href
- `src/components/sections/ExpertiseSection.jsx` (si existe) — CTAs
- `vercel.json` — redirects
- `public/sitemap.xml` — URLs

---

## 19. Component Architecture

### Arborescence complète

```
src/
├── App.jsx                    Router, routes, Suspense
├── main.jsx                   React mount, strict mode
│
├── pages/
│   ├── Home.jsx               Assemble 11 sections
│   ├── ServicesPage.jsx       [Phase 2]
│   ├── IAServicePage.jsx      [Phase 2]
│   ├── AutomationServicePage.jsx [Phase 2]
│   ├── DevServicePage.jsx     [Phase 2]
│   ├── SEOServicePage.jsx     [Phase 2]
│   ├── DesignServicePage.jsx  [Phase 2]
│   ├── ProjetPage.jsx         [Phase 2]
│   ├── CaseStudyPage.jsx      [Phase 2]
│   ├── AProposPage.jsx        [Phase 2]
│   ├── ContactPage.jsx        [Phase 2]
│   ├── DevisPage.jsx          [Phase 2]
│   └── legal/                 [Phase 2]
│
├── components/
│   ├── layout/
│   │   ├── Section.jsx        bg prop (canvas|panel), id, children
│   │   ├── Container.jsx      max-width, padding responsive
│   │   └── Grid.jsx           12-col grid utilities
│   │
│   ├── navigation/
│   │   ├── Header.jsx         Fixed, scroll glass effect
│   │   ├── NavDesktop.jsx     Dropdown Expertises
│   │   └── NavMobile.jsx      Fullscreen drawer
│   │
│   ├── sections/
│   │   ├── HeroSection.jsx    [REBUILD avec HOME-01 U1]
│   │   ├── PositionnementSection.jsx
│   │   ├── AIShowcaseSection.jsx [REBUILD — video Loïc]
│   │   ├── AutomationSection.jsx [UPDATE — icons à reconstruire]
│   │   ├── LLMSection.jsx
│   │   ├── DigitalExperiencesSection.jsx [UPDATE — images null]
│   │   ├── SystemsSection.jsx
│   │   ├── PortfolioSection.jsx [UPDATE — images null]
│   │   ├── ProcessSection.jsx
│   │   ├── ExpertiseSection.jsx
│   │   ├── CTASection.jsx
│   │   └── SectionHeading.jsx [Partagé — eyebrow + headline + description]
│   │
│   ├── showcase/
│   │   ├── Showcase.jsx       Composant générique [REBUILD]
│   │   ├── ShowcaseSlide.jsx
│   │   ├── ShowcaseNav.jsx
│   │   └── ShowcaseDots.jsx
│   │
│   ├── ui/
│   │   ├── Tag.jsx
│   │   ├── Badge.jsx          (shadcn/ui)
│   │   ├── button-link.jsx    React Router + shadcn Button
│   │   ├── button.jsx         (shadcn/ui)
│   │   └── [autres shadcn...]
│   │
│   └── footer/
│       └── Footer.jsx
│
├── lib/
│   ├── constants.js           NAV_ITEMS, METRICS, EXPERTISE_CARDS, PROCESS_STEPS, PORTFOLIO_PROJECTS
│   ├── motion.js              [COMPLÉTER avec variants manquants]
│   ├── hooks/
│   │   ├── useReducedMotion.js
│   │   └── useIntersection.js [AJOUTER si pas présent]
│   └── utils.js               cn(), formatters
│
└── styles/
    └── globals.css            [METTRE À JOUR : Manrope → Inter]
```

### Shadcn — Composants installés (CONSERVER, ne pas en ajouter)

D'après la session précédente, shadcn est installé et diverge partiellement de la spec. Règle :  
**Utiliser les composants shadcn existants. Ne pas en installer de nouveaux sauf besoin explicite.**

### Règles composants

1. Toujours passer `prefersReduced = useReducedMotion()` dans les composants animés
2. Variants Framer Motion déclarés en dehors du composant (pas inline)
3. Styles inline pour les tokens CSS custom (`background: 'var(--surface-panel)'`)
4. Classes Tailwind pour layout, spacing, responsive
5. `Section` + `Container` pour toutes les sections — pas de div arbitraire

---

## 20. Backend Boundaries

### Règle fondamentale

**Le frontend ne communique jamais directement avec un LLM.** Toutes les interactions IA passent par Supabase Edge Functions ou l'API `/api/`.

### Ce que le frontend PEUT faire

```
✅ Appeler Supabase JS client (auth, queries, realtime)
✅ Appeler /api/* routes pour Stripe checkout
✅ Déclencher des Edge Functions via supabase.functions.invoke()
✅ Afficher des données retournées par le backend
✅ Widget Loïc (script externe /loic-widget.js)
```

### Ce que le frontend NE DOIT PAS faire

```
❌ Appeler directement OpenAI, Anthropic, etc.
❌ Exposer des clés API dans le bundle client
❌ Accéder à process.env.OPENAI_API_KEY dans le code React
❌ Gérer des tokens de paiement Stripe côté client (hors Stripe.js)
```

### Supabase — Périmètre protégé

```
supabase/
├── functions/    15 Edge Functions — NE PAS MODIFIER sans déploiement Supabase
└── migrations/   22 migrations — NE PAS MODIFIER

Variables d'environnement (Vercel + .env) :
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY   ← seuls exposés au client
SUPABASE_SERVICE_ROLE_KEY                   ← JAMAIS dans le bundle
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET    ← JAMAIS dans le bundle
```

### Manager — App séparée

```
manager/           Application React TypeScript distincte
                   24 pages, son propre package.json
                   Build séparé : dist/manager/
                   Route Vercel : /manager/*
                   NE PAS MODIFIER le code Manager depuis le site principal
```

### Loïc Widget

- Script : `public/js/loic-widget.js` (référencé dans `index-src.html`)
- Intégration : `<script src="/loic-widget.js"></script>` — non-module, intentionnel
- L'action "Parler à Loïc" dans le header doit **appeler ce widget**, pas naviguer vers /contact

---

## 21. SEO Architecture

### Métadonnées globales (index-src.html)

```html
<title>CA-TECH — Cabinet IA, Automatisation & Développement Web | Dijon</title>
<meta name="description" content="Cabinet IA-first...">
<link rel="canonical" href="https://www.ca-tech.fr/">

<!-- Open Graph -->
<meta property="og:image" content="https://www.ca-tech.fr/og-image.webp">
<!-- ⚠️ og:image actuel pointe vers logo — à remplacer par SEO-01 quand disponible -->

<!-- JSON-LD Organization — EXISTANT, CORRECT -->
```

### Sitemap

- `public/sitemap.xml` — à mettre à jour lors de chaque ajout de route Phase 2
- robots.txt : déjà configuré `public/robots.txt`
- llms.txt : déjà configuré `public/llms.txt`

### Google Search Console

- Meta tag vérification déjà en place dans index-src.html
- GBP (Google Business Profile) en attente validation — statut au 2026-09-30

### Structure URLs

```
/                               → "CA-TECH — Cabinet IA, Automatisation, Dijon"
/services/ia                    → "Intelligence Artificielle & LLM — CA-TECH"
/services/automatisation        → "Automatisation n8n Make — CA-TECH Dijon"
/projets                        → "Nos réalisations — CA-TECH"
/a-propos                       → "L'équipe CA-TECH — Loïc, cabinet IA"
```

### SEO local (Phase 3)

10 villes × 4 services = 40 pages SEO local  
Pattern : `/agence-ia-dijon`, `/creation-site-paris`, etc.

---

## 22. Implementation Phases

### Phase 1 — Fondations + Homepage V2 (priorité immédiate)

**Durée estimée :** 2–3 semaines

```
1. Mettre à jour --font-body: Manrope → Inter
   Fichiers : globals.css + index-src.html

2. Matérialiser HOME-01 U1
   → Télécharger PNG source
   → Convertir en WebP 85%
   → public/hero/catech-hero-01.webp + catech-hero-mobile.webp

3. Migrer routes /expertises/* → /services/*
   Fichiers : App.jsx, constants.js, NavDesktop.jsx, NavMobile.jsx,
              vercel.json, sitemap.xml + tous les href dans sections

4. Corriger CTA "Parler à Loïc" → ouvre widget Loïc
   Fichier : Header.jsx

5. Corriger H1 hero → "votre croissance" (était "votre entreprise")
   Fichier : HeroSection.jsx

6. Compléter src/lib/motion.js avec variants manquants
   (spring, distance, dropIn, popIn, slideUp, counterReveal, wordReveal, etc.)

7. Rebuild HeroSection.jsx avec HOME-01 U1
   (remplacer HeroVisual terminal console par image réelle)

8. Rebuild AutomationSection.jsx avec nouveaux icons outils

9. Produire screenshots portfolio (PF-01 à PF-04) et brancher les images

10. npm run build → vérifier 0 erreur → test complet site
```

### Phase 2 — Pages intérieures (services, projets, about, contact)

**Durée estimée :** 3–4 semaines

```
- Rebuild Showcase.jsx (drag, touch, loop, a11y)
- AIShowcaseSection.jsx (nouveau recording Loïc ou animation code)
- Pages services (5 pages × layout type service)
- Pages projets (4 case studies)
- Page à propos
- Page contact (formulaire Supabase existant)
- Page devis (multi-step existant)
```

### Phase 3 — SEO local + Blog (futur)

```
- 40 pages SEO local (10 villes × 4 services)
- Blog (index + articles)
- Open Graph image SEO-01
```

---

## 23. Open Decisions

| # | Décision | Options | Recommandation | Statut |
|---|----------|---------|---------------|--------|
| OD-01 | Fallback hero si HOME-01 U1 non disponible | Terminal console (actuel) vs Placeholder WebP | Garder terminal console jusqu'à matérialisation U1 | OPEN |
| OD-02 | AI Showcase — vidéo vs animation code | Nouveau recording Loïc vs Chat simulé en code | Animation code plus robuste comme première version | OPEN |
| OD-03 | Automation icons — Midjourney vs logiciels officiels | MJ icons flat | Vérifier droits logos officiels (n8n, Make) avant MJ | OPEN |
| OD-04 | Count-up animation — library vs code custom | countUp.js vs Framer Motion custom | Code custom dans motion.js (cohérence) | OPEN |
| OD-05 | Loïc widget — script externe vs composant React | Script JS actuel | Garder script existant, ne pas réécrire | RECOMMANDÉ |
| OD-06 | Drag carousel — Framer Motion vs embla-carousel | Framer Motion drag="x" | Framer Motion pour cohérence du système motion | RECOMMANDÉ |
| OD-07 | HOME-02 — concept à définir | À partir de U1 re-shoot ou nouvelle session MJ | Pas de décision avant que U1 soit en prod | BLOQUÉ sur OD-01 |

---

## 24. Risks

| # | Risque | Probabilité | Impact | Mitigation |
|---|--------|------------|--------|-----------|
| R-01 | HOME-01 U1 URL CDN devient indisponible | MOYENNE | CRITIQUE | Télécharger et auto-héberger immédiatement |
| R-02 | Screenshots portfolio non disponibles → sections vides | HAUTE | HAUTE | Fallback placeholder CSS branded jusqu'aux vrais screenshots |
| R-03 | Font Inter cause divergence de rendu vs Manrope | FAIBLE | FAIBLE | Tester sur toutes sections avant commit font change |
| R-04 | Migration routes /expertises/ → /services/ casse des liens indexés | HAUTE | HAUTE | Ajouter redirects 301 dans vercel.json en même temps |
| R-05 | Loïc widget indisponible → CTA header ne fait rien | MOYENNE | HAUTE | Fallback : naviguer vers /contact si widget.open non trouvé |
| R-06 | Vidéo AI Showcase non disponible → section vide | HAUTE | HAUTE | Utiliser animation code comme version V1 |
| R-07 | Build se casse avec inter dans globals.css | FAIBLE | BASSE | Tester en développement avant merge |
| R-08 | vercel.json redirects incomplets → 404 sur anciennes URLs | MOYENNE | HAUTE | Auditer toutes les routes /expertises/* avant déploiement |

---

## 25. Final Implementation Checklist

### Pré-conditions (avant de coder)

- [ ] HOME-01 U1 téléchargé et converti en WebP → `public/hero/catech-hero-01.webp`
- [ ] Screenshot placeholder pour portfolio si vrais screenshots non disponibles
- [ ] Decision prise sur AI Showcase : animation code ou nouveau recording Loïc
- [ ] npm run build vérifié OK dans l'état actuel (0 erreurs)

### Phase 1 — Code changes

- [ ] `src/styles/globals.css` : `Manrope` → `Inter`
- [ ] `index-src.html` : Google Fonts Manrope → Inter
- [ ] `src/App.jsx` : routes `/expertises/*` → `/services/*`
- [ ] `src/lib/constants.js` : EXPERTISE_CARDS href `/expertises/` → `/services/`
- [ ] `src/components/navigation/NavDesktop.jsx` : href nav `/services/*`
- [ ] `src/components/navigation/NavMobile.jsx` : href nav `/services/*`
- [ ] `src/components/navigation/Header.jsx` : CTA → widget Loïc (pas /contact)
- [ ] `src/components/sections/HeroSection.jsx` : H1 "votre entreprise" → "votre croissance"
- [ ] `src/components/sections/HeroSection.jsx` : CTA secondaire → `/projets` (pas /realisations)
- [ ] `src/lib/motion.js` : ajouter spring, distance, dropIn, popIn, slideUp, counterReveal, wordReveal, staggerNormal, staggerGrid
- [ ] `vercel.json` : mettre à jour redirects (ajouter 301 `/expertises/:path*` → `/services/:path*`)
- [ ] `public/sitemap.xml` : mettre à jour URLs `/expertises/` → `/services/`

### Phase 1 — Assets

- [ ] `public/hero/catech-hero-01.webp` — HOME-01 U1 matérialisé
- [ ] `public/hero/catech-hero-mobile.webp` — version mobile
- [ ] `public/hero/catech-hero-poster.webp` — poster vidéo fallback
- [ ] `public/portfolio/ca-tech-manager/dashboard.webp` — screenshot
- [ ] `public/portfolio/cv-magic/home.webp` — screenshot
- [ ] `public/portfolio/pasmal/home.webp` — screenshot
- [ ] `public/portfolio/pemous-money/home.webp` — screenshot

### Phase 1 — Sections rebuild

- [ ] `HeroSection.jsx` : remplacer HeroVisual terminal par image HOME-01 U1
- [ ] `AutomationSection.jsx` : reconstruire section icons outils
- [ ] `PortfolioSection.jsx` : brancher les images quand disponibles
- [ ] `DigitalExperiencesSection.jsx` : brancher les images quand disponibles

### Phase 1 — Tests

- [ ] `npm run build` sans erreurs ni warnings nouveaux
- [ ] Vérifier toutes les routes en développement (npm run dev)
- [ ] Test responsive mobile (375px / 768px / 1280px)
- [ ] Test reduced-motion (System Preferences → Accessibility)
- [ ] Test navigation complète : tous les liens cliquables et corrects
- [ ] Vérifier Core Web Vitals sur Lighthouse (LCP < 2.5s)

### Phase 1 — Deploy (après approbation)

- [ ] git add + git commit avec message descriptif
- [ ] git push → Vercel déploiement automatique
- [ ] Vérifier `https://www.ca-tech.fr/` en production
- [ ] Vérifier redirects 301 fonctionnels (anciens liens /expertises/)
- [ ] Vérifier Google Search Console — pas d'erreurs nouvelles

---

*Document généré le 2026-09-30 — Source de vérité unique pour l'implémentation CA-TECH V2.*  
*Toute modification de décision technique doit être reflétée dans ce document.*
