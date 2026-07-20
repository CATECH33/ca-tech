# Design System — CA-TECH
> Référence unique pour tous les futurs développements · Version 1.0 · Juillet 2026
> Sources : BRAND_GUIDELINES.md · COMPONENT_GUIDELINES.md · UX_UI_SPECIFICATION.md · HOMEPAGE_SPECIFICATION.md

Ce document est **la seule source de vérité** pour l'identité visuelle et les composants d'interface de CA-TECH. Tout développement ou design doit s'y conformer. Aucun écart n'est autorisé sans validation explicite.

---

## Table des matières

1. [Palette de couleurs](#1-palette-de-couleurs)
2. [Typographie](#2-typographie)
3. [Espacements](#3-espacements)
4. [Grille](#4-grille)
5. [Breakpoints](#5-breakpoints)
6. [Boutons](#6-boutons)
7. [Champs de formulaire](#7-champs-de-formulaire)
8. [Cards](#8-cards)
9. [Badges](#9-badges)
10. [Tableaux](#10-tableaux)
11. [Navbar](#11-navbar)
12. [Footer](#12-footer)
13. [Icônes](#13-icônes)
14. [Ombres](#14-ombres)
15. [Bordures](#15-bordures)
16. [États](#16-états)
17. [Animations](#17-animations)
18. [Responsive](#18-responsive)
19. [Accessibilité](#19-accessibilité)
20. [Exemples d'utilisation](#20-exemples-dutilisation)

---

## 1. Palette de couleurs

### 1.1 Variables CSS — Déclaration complète

```css
:root {
  /* Couleurs primaires */
  --color-primary:       #0066FF;   /* CTA, accents, liens actifs, icônes feature */
  --color-primary-dark:  #0A2540;   /* Hero fond, titres forts, footer, logo */
  --color-primary-light: #E8F0FF;   /* Fonds de cards, badges, hover states */

  /* Couleurs neutres */
  --color-white:         #FFFFFF;   /* Fond principal, texte inversé */
  --color-gray-50:       #F9FAFB;   /* Sections alternées */
  --color-gray-100:      #F3F4F6;   /* Fonds inputs, hover subtil */
  --color-gray-200:      #E5E7EB;   /* Bordures, séparateurs */
  --color-gray-300:      #D1D5DB;   /* Bordures actives, hover inputs */
  --color-gray-400:      #9CA3AF;   /* Placeholders — jamais pour texte courant */
  --color-gray-500:      #6B7280;   /* Texte nav, descriptions secondes */
  --color-gray-600:      #4B5563;   /* Texte secondaire, corps */
  --color-gray-700:      #374151;   /* Texte nav standard */
  --color-gray-900:      #111827;   /* Titres, texte principal, footer fond */

  /* Couleurs sémantiques */
  --color-success:       #10B981;   /* Confirmation, champ valide */
  --color-warning:       #F59E0B;   /* Alerte non critique */
  --color-error:         #EF4444;   /* Erreur formulaire, action destructive */

  /* Dégradés */
  --gradient-primary:    linear-gradient(135deg, #0066FF 0%, #0A2540 100%);
  --gradient-subtle:     linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
}
```

### 1.2 Tableau de référence

| Token | Valeur HEX | Usage principal |
|-------|-----------|----------------|
| `--color-primary` | `#0066FF` | Boutons CTA, liens actifs, accents |
| `--color-primary-dark` | `#0A2540` | Heroes sombres, footer, logo |
| `--color-primary-light` | `#E8F0FF` | Fonds cards, badges, hover |
| `--color-white` | `#FFFFFF` | Fond pages, texte sur fond sombre |
| `--color-gray-50` | `#F9FAFB` | Sections alternées |
| `--color-gray-100` | `#F3F4F6` | Fonds champs de saisie |
| `--color-gray-200` | `#E5E7EB` | Bordures, séparateurs |
| `--color-gray-400` | `#9CA3AF` | Placeholders uniquement |
| `--color-gray-600` | `#4B5563` | Texte secondaire, descriptions |
| `--color-gray-900` | `#111827` | Titres, texte principal |
| `--color-success` | `#10B981` | États validés |
| `--color-warning` | `#F59E0B` | Alertes |
| `--color-error` | `#EF4444` | Erreurs |

### 1.3 Ratios de contraste WCAG AA

| Combinaison | Ratio | Résultat |
|-------------|-------|----------|
| `#FFFFFF` sur `--color-primary` | 4.6:1 | ✓ AA |
| `#FFFFFF` sur `--color-primary-dark` | 16.5:1 | ✓ AAA |
| `--color-gray-900` sur `#FFFFFF` | 19.5:1 | ✓ AAA |
| `--color-gray-600` sur `#FFFFFF` | 7.1:1 | ✓ AA |
| `--color-primary` sur `--color-primary-light` | 4.7:1 | ✓ AA |
| `--color-gray-400` sur `#FFFFFF` | 2.9:1 | ✗ Interdit pour texte |

**Règle absolue :** `--color-gray-400` n'est jamais utilisé comme couleur de texte courant. Réservé aux placeholders et timestamps non critiques.

### 1.4 Associations fond/texte

| Fond de section | Titres | Texte courant | Style CTA |
|-----------------|--------|---------------|-----------|
| `#FFFFFF` | `--color-gray-900` | `--color-gray-600` | `primary` |
| `--color-gray-50` | `--color-gray-900` | `--color-gray-600` | `primary` |
| `--color-primary-light` | `--color-primary-dark` | `--color-primary` | `primary` |
| `--gradient-primary` | `#FFFFFF` | `rgba(255,255,255,0.80)` | `white` |
| `--color-primary-dark` | `#FFFFFF` | `rgba(255,255,255,0.80)` | `white` |
| `--color-gray-900` | `#FFFFFF` | `rgba(255,255,255,0.70)` | `white` |

### 1.5 Couleurs par service (tags et accents)

| Service | Fond badge | Texte badge |
|---------|-----------|------------|
| Intelligence Artificielle | `rgba(0,102,255,0.10)` | `#0066FF` |
| Automatisation | `rgba(245,158,11,0.10)` | `#D97706` |
| SEO | `rgba(16,185,129,0.10)` | `#059669` |
| Développement Web | `rgba(99,102,241,0.10)` | `#4F46E5` |
| Design & Identité | `rgba(236,72,153,0.10)` | `#DB2777` |

### 1.6 Glow hero

```css
/* Utilisé dans le hero homepage et les sections sombres premium */
background:
  radial-gradient(ellipse 80% 60% at 30% 50%, rgba(0,102,255,0.25) 0%, transparent 70%),
  var(--gradient-primary);
```

### 1.7 Pattern d'alternance des sections

```
Hero            → --gradient-primary
Proof bar       → --color-primary-dark
Stats           → --color-white
Expertises      → --color-gray-50
Loïc            → --gradient-primary
Process         → --color-white
Cas clients     → --color-gray-50
Témoignages     → --color-white
CTA final       → --gradient-primary
Footer          → --color-gray-900
```

---

## 2. Typographie

### 2.1 Police

**Inter — Google Fonts uniquement. Aucune exception.**

Graisses chargées : `400` · `600` · `800`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'">
```

**Ne jamais charger :** 100, 200, 300 (trop léger) · 500, 700, 900 (redondant)

### 2.2 Tokens de taille

```css
:root {
  --text-xs:   12px;   /* Légal, timestamps */
  --text-sm:   14px;   /* Labels, badges, micro-copy */
  --text-base: 16px;   /* Corps standard */
  --text-lg:   18px;   /* Sous-titres, intros de section */
  --text-xl:   20px;   /* H3, citations témoignages */
  --text-2xl:  24px;   /* Titres cards, sous-sections */
  --text-3xl:  30px;   /* H2 secondaires */
  --text-4xl:  36px;   /* H2 principales */
  --text-5xl:  48px;   /* Stats, chiffres clés */
  --text-6xl:  60px;   /* H1 pages internes */
  --text-7xl:  72px;   /* H1 homepage */
}
```

### 2.3 Échelle complète desktop → mobile

| Token | Desktop | Mobile | Weight | Line-height | Usage |
|-------|---------|--------|--------|-------------|-------|
| `--text-xs` | 12px | 12px | 400 | 1.4 | Légal, timestamps |
| `--text-sm` | 14px | 14px | 400/600 | 1.5 | Labels, micro-copy |
| `--text-base` | 16px | 16px | 400 | 1.6 | Corps |
| `--text-lg` | 18px | 18px | 400/600 | 1.6 | Intros, sous-titres |
| `--text-xl` | 20px | 18px | 600 | 1.5 | H3, citations |
| `--text-2xl` | 24px | 22px | 600 | 1.4 | Titres cards |
| `--text-3xl` | 30px | 26px | 700 | 1.3 | H2 secondaires |
| `--text-4xl` | 36px | 30px | 700 | 1.2 | H2 principales |
| `--text-5xl` | 48px | 36px | 800 | 1.1 | Stats / KPI |
| `--text-6xl` | 60px | 42px | 800 | 1.05 | H1 pages internes |
| `--text-7xl` | 72px | 48px | 800 | 1.0 | H1 homepage |

### 2.4 Règles d'usage typographique

| Élément | Taille | Weight | Couleur | Notes |
|---------|--------|--------|---------|-------|
| H1 homepage | `--text-7xl` | 800 | `#FFFFFF` | Sur gradient |
| H1 pages internes | `--text-6xl` | 800 | `--color-gray-900` | Sur fond clair |
| H2 section | `--text-4xl` | 700 | `--color-gray-900` | Mobile → `--text-3xl` |
| H3 | `--text-xl` | 600 | `--color-gray-900` | — |
| Corps | `--text-base` | 400 | `--color-gray-600` | line-height 1.6 |
| Sous-titre section | `--text-sm` | 600 | `--color-primary` | uppercase · letter-spacing 0.08em |
| Micro-copy CTA | `--text-sm` | 400 | `--color-gray-400` | Centré sous le bouton |
| Lien inline | `--text-base` | 400 | `--color-primary` | text-underline-offset 3px |

### 2.5 Letter-spacing

| Usage | Valeur |
|-------|--------|
| Grands titres H1 (≥ 48px) | `-0.03em` |
| Pills de section (uppercase) | `0.08em` |
| Corps, titres courants | `normal` (0) |
| Labels UPPERCASE | `0.05em` minimum |

### 2.6 Règles immuables

- **Police unique :** Inter exclusivement — pas d'exception
- **Hiérarchie stricte :** H1 → H2 → H3, jamais de saut de niveau
- **Pas d'italique systématique :** réservé aux citations de témoignages
- **Max 2 graisses par bloc :** un titre + un corps
- **Jamais `--color-gray-400` pour du texte courant**
- **Minimum 14px** pour tout texte informatif

---

## 3. Espacements

### 3.1 Tokens d'espacement

```css
:root {
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-32:  128px;
  --space-40:  160px;
}
```

### 3.2 Espacements de sections

| Contexte | Desktop | Mobile |
|----------|---------|--------|
| Section standard (padding haut/bas) | `96px` | `64px` |
| Hero (padding haut) | `160px` | `120px` |
| Hero (padding bas) | `120px` | `80px` |
| Hero dark (padding haut) | `128px` | `96px` |
| Hero minimal (padding haut) | `64px` | `48px` |
| Proof bar | `32px` haut/bas | `24px` haut/bas |
| Footer | `64px` haut / `40px` bas | `48px` haut / `32px` bas |

### 3.3 Espacements internes — Composants

| Élément | Valeur |
|---------|--------|
| Padding card standard | `28px` |
| Padding testimonial | `40px 48px` desktop · `28px 24px` mobile |
| Gap grille cards (3 cols) | `24px` desktop · `16px` mobile |
| Gap grille cards (2 cols) | `24px` desktop · `12px` mobile |
| Pill → H2 (section header) | `margin-bottom: 12px` |
| H2 → Paragraphe (section header) | `margin-bottom: 16px` |
| Section header → Premier contenu | `margin-bottom: 48px` desktop · `32px` mobile |
| Breadcrumb → H1 | `margin-bottom: 24px` |
| Gap icône-label bouton | `8px` |
| Gap label-input | `margin-bottom: 6px` |
| Gap input-message aide | `margin-top: 6px` |

### 3.4 Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;   /* desktop */
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }
}
```

---

## 4. Grille

### 4.1 Système de colonnes

| Breakpoint | Colonnes | Gouttière | Marges latérales |
|-----------|---------|-----------|-----------------|
| Mobile 375px | 4 | 16px | 20px |
| Tablette 768px | 8 | 20px | 32px |
| Desktop 1280px | 12 | 24px | auto (centrage) |

### 4.2 Patterns de layout

| Pattern | Configuration CSS | Usage |
|---------|-----------------|-------|
| **50/50** | `grid-template-columns: 1fr 1fr; gap: 48px` | Section Loïc, Avant/Après |
| **55/45** | `grid-template-columns: 55fr 45fr; gap: 64px` | Hero homepage |
| **3 colonnes** | `grid-template-columns: repeat(3, 1fr); gap: 24px` | Services, features |
| **4 colonnes** | `grid-template-columns: repeat(4, 1fr); gap: 24px` | Stats, équipe |
| **Pleine largeur** | `grid-column: 1 / -1` | Hero, CTA final, proof bar |
| **Sidebar** | `grid-template-columns: 8fr 4fr; gap: 48px` | Blog, formulaire multi-étapes |
| **2 colonnes** | `grid-template-columns: repeat(2, 1fr); gap: 24px` | Tablette / mobile ≥ 640px |

### 4.3 Comportement responsive de la grille

```
Desktop (≥ 1280px)  → 3 colonnes (services/features) · 4 colonnes (stats)
Tablette (768–1279px) → 2 colonnes
Mobile (< 768px)    → 1 colonne, stack vertical
```

**Exception :** la grille stats (`4 colonnes`) passe à `2×2` à la tablette et `2×2` sur mobile (jamais 1 seule colonne pour les stats).

---

## 5. Breakpoints

### 5.1 Tokens de breakpoints

```css
/* Mobile First — les media queries sont toujours min-width */
:root {
  --bp-xs:   375px;   /* Mobile compact — base de design */
  --bp-sm:   428px;   /* Mobile large (iPhone Pro Max) */
  --bp-md:   768px;   /* Tablette portrait — pivot principal */
  --bp-lg:   1024px;  /* Tablette landscape / petit laptop */
  --bp-xl:   1280px;  /* Desktop — référence maquettes */
  --bp-2xl:  1440px;  /* Desktop large — max-width container */
}
```

### 5.2 Usage en CSS

```css
/* Mobile first — toujours partir du mobile, étendre vers le haut */
.element { /* styles mobile par défaut */ }

@media (min-width: 768px)  { .element { /* tablette */ } }
@media (min-width: 1024px) { .element { /* laptop */ } }
@media (min-width: 1280px) { .element { /* desktop */ } }
```

### 5.3 Points de rupture critiques par composant

| Composant | Rupture principale | Comportement |
|-----------|------------------|-------------|
| Navigation | 768px | Desktop nav ↔ Hamburger + Drawer |
| Hero homepage | 768px | Side-by-side ↔ Stack vertical |
| Grille services | 768px | 3 cols ↔ 1 col |
| Grille stats | 640px | 4 cols → 2×2 |
| Footer | 768px | 4 cols ↔ 2 cols → 1 col |
| Testimonial | 768px | Horizontal ↔ Vertical |
| Widget Loïc (ouvert) | 640px | Fenêtre 380×520 ↔ Plein écran |
| Stepper | 768px | Horizontal ↔ Vertical |
| Tableau | 640px | Scroll horizontal ou cards |

---

## 6. Boutons

### 6.1 Variantes

| Variante | Fond | Texte | Bordure | Usage |
|----------|------|-------|---------|-------|
| `primary` | `--color-primary` `#0066FF` | `#FFFFFF` | aucune | CTA principal de page |
| `secondary` | transparent | `--color-primary` | `2px solid --color-primary` | CTA alternatif |
| `ghost` | transparent | `--color-gray-600` | aucune | Action tertiaire |
| `ghost-white` | transparent | `rgba(255,255,255,0.85)` | `1px solid rgba(255,255,255,0.30)` | Sur fond sombre |
| `white` | `#FFFFFF` | `--color-primary-dark` | aucune | Sur fond gradient/sombre |
| `danger` | `--color-error` `#EF4444` | `#FFFFFF` | aucune | Action destructive |

### 6.2 Tailles

| Taille | Padding (H × V) | Font-size | Weight | Hauteur min | Border-radius |
|--------|----------------|-----------|--------|-------------|---------------|
| `sm` | `16px × 8px` | 14px | 500 | 36px | `--radius-sm` (6px) |
| `md` | `24px × 12px` | 16px | 500 | 44px | `--radius-md` (10px) |
| `lg` | `32px × 16px` | 18px | 600 | 52px | `--radius-md` (10px) |
| `xl` | `40px × 20px` | 20px | 600 | 60px | `--radius-md` (10px) |

**Règle :** hauteur minimale tactile toujours `44px`, quelle que soit la taille déclarée (WCAG 2.5.5).

### 6.3 Anatomie

```
[Icône gauche 16–18px?]   Label   [Icône droite 16–18px?]
```

- Icône : optionnelle · `16px` pour sm/md · `18px` pour lg/xl
- Gap icône-label : `8px`
- Label : `white-space: nowrap` · centré
- Icônes Lucide uniquement · `aria-hidden="true"` sur l'icône

### 6.4 États

| État | Transformation | Transition |
|------|---------------|-----------|
| Repos | Style de base | — |
| Hover | `translateY(-1px)` + shadow renforcée | `150ms --ease-out` |
| Active/Pressed | `translateY(0)` + shadow réduite | `100ms` |
| Focus | `outline: 2px solid --color-primary; outline-offset: 3px` | `150ms` |
| Loading | Spinner (16px, rotation 700ms) + label grisé + `cursor: wait` | `150ms` |
| Disabled | `opacity: 0.4` + `cursor: not-allowed` + `pointer-events: none` | — |

### 6.5 Ombres par variante

| Variante | Repos | Hover |
|----------|-------|-------|
| `primary` | `0 2px 8px rgba(0,102,255,0.20)` | `0 4px 16px rgba(0,102,255,0.35)` |
| `white` | `0 2px 8px rgba(0,0,0,0.12)` | `0 4px 16px rgba(0,0,0,0.20)` |
| Autres | aucune | `0 2px 8px rgba(0,0,0,0.08)` |

### 6.6 Règles d'usage

- **Jamais deux `primary` côte à côte** sur une même page
- Si deux boutons côte à côte : `primary` + `ghost-white` OU `primary` + `secondary`
- `type="button"` explicite hors `<form>` (évite les soumissions accidentelles)
- Bouton icon-only : `aria-label` descriptif obligatoire sur l'élément
- Micro-copy sous les CTA de conversion : `--text-sm` · `--color-gray-400` · centré

### 6.7 Micro-copy CTA

```
[Lancer mon Diagnostic IA →]
Gratuit · Sans engagement · Résultat en 10 min

[Demander un devis gratuit →]
Réponse sous 24h · Devis détaillé · Sans engagement
```

---

## 7. Champs de formulaire

### 7.1 Input (champ texte)

**Anatomie**
```
[Label *]                          ← --text-sm · weight 500 · --color-gray-700
[Input field]                      ← hauteur 44px · --text-base · --color-gray-900
[⚠ Message d'erreur ou aide]       ← --text-sm · --color-error ou --color-gray-400
```

**États**

| État | Fond | Bordure | Box-shadow |
|------|------|---------|-----------|
| Repos | `--color-gray-100` | `1px solid --color-gray-200` | aucune |
| Hover | `--color-gray-50` | `1px solid --color-gray-300` | aucune |
| Focus | `#FFFFFF` | `2px solid --color-primary` | `0 0 0 3px rgba(0,102,255,0.15)` |
| Valide | `#FFFFFF` | `1px solid --color-success` | `0 0 0 3px rgba(16,185,129,0.12)` |
| Erreur | `#FFFFFF` | `2px solid --color-error` | `0 0 0 3px rgba(239,68,68,0.12)` |
| Disabled | `--color-gray-50` | `1px solid --color-gray-200` | aucune |

**Styles fixes**
- Border-radius : `--radius-sm` (6px)
- Padding : `12px 16px`
- Hauteur : `44px`
- Transition : `border-color, box-shadow 150ms --ease-out`
- Icône optionnelle gauche/droite : `20px` · `--color-gray-400`

### 7.2 Textarea

- Même états que `Input`
- Padding : `12px 16px`
- `resize: vertical` uniquement
- `min-height: 120px` · `max-height: 400px`
- `line-height: 1.6`
- Compteur caractères optionnel : `--text-xs` · `--color-gray-400` · aligné droite

### 7.3 Select (custom)

**Anatomie**
```
[Label]
[Option sélectionnée ▼]   ← ChevronDown Lucide · rotation 180° à l'ouverture

[Dropdown]
  Option 1
  Option 2  [✓]   ← sélectionnée : fond --color-primary-light · check --color-primary
  Option 3
```

**Comportement :** ouverture click/Enter/Space · navigation ↑↓ · sélection Enter · fermeture Escape/clic extérieur

**Accessibilité :** `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` sur le trigger · `role="listbox"` sur la liste · `role="option"` + `aria-selected` sur chaque item

**Recommandation :** pour moins de 6 options dans un formulaire multi-étapes, préférer des **boutons de choix visuels** (cards cliquables) au select.

### 7.4 Checkbox

```
[☐]  Label texte    ← repos : fond --color-gray-100 · bordure --color-gray-300
[☑]  Label texte    ← coché : fond --color-primary · check blanc
```

- Taille : `20×20px` · `--radius-sm`
- Gap checkbox-label : `10px`
- Zone cliquable : `44px` minimum (label inclus)
- Input natif masqué visuellement (clip, pas display:none)

### 7.5 Radio

```
(○) Option A     ← repos : fond blanc · bordure --color-gray-300
(●) Option B     ← sélectionné : cercle interne 10px --color-primary
```

- Taille : `20×20px` · `--radius-full`
- Groupe : `role="radiogroup"` + `aria-labelledby`

### 7.6 Cards de choix (variante formulaire)

```
┌─────────────────────┐   ┌─────────────────────┐
│  [Icône]            │   │  [Icône]           ✓ │  ← sélectionnée
│  Label option       │   │  Label option       │
└─────────────────────┘   └─────────────────────┘
  Repos : bordure gray-200   Sélectionnée :
  fond blanc                 fond --color-primary-light
                             bordure 2px --color-primary
```

- `--radius-md` · padding `16px 20px` · transition `150ms`

### 7.7 Progress Bar (formulaires multi-étapes)

```
Étape 2 sur 4          ← --text-sm · weight 500 · --color-gray-600
████████░░░░░░         ← hauteur 6px · fond --color-gray-200 · fill --color-primary · --radius-full
```

- Transition remplissage : `width 400ms --ease-out`
- `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` + `aria-label`

### 7.8 Champs requis et messages

- Champ requis : astérisque `*` rouge après le label (`--color-error`) + `aria-required="true"` + `required`
- Champ optionnel : mention `(optionnel)` en texte si ambiguïté
- Message d'erreur : `--text-sm` · `--color-error` · poids `500` · icône `AlertCircle 14px` · `aria-describedby` + `aria-invalid="true"`

### 7.9 Types HTML et attributs recommandés

| Champ | `type` | `inputmode` | `autocomplete` |
|-------|--------|------------|----------------|
| Email | `email` | `email` | `email` |
| Téléphone | `tel` | `tel` | `tel` |
| Prénom | `text` | `text` | `given-name` |
| Nom | `text` | `text` | `family-name` |
| Entreprise | `text` | `text` | `organization` |
| Numérique | `number` | `numeric` | — |

---

## 8. Cards

### 8.1 Card `default`

```
┌──────────────────────────────────────┐
│  [Icône 40px · --color-primary]      │
│  [Badge optionnel]                   │
│  Titre card                          │  --text-2xl · weight 600 · --color-gray-900
│  Description 2–3 lignes max          │  --text-base · --color-gray-600
│  Lien → texte d'action               │  --text-base · --color-primary · weight 500
└──────────────────────────────────────┘
```

- Fond : `--color-white` · Bordure : `1px solid --color-gray-200` (sur fond blanc seulement)
- `--shadow-sm` · `--radius-lg` (16px) · padding `28px`
- Hover : `--shadow-md` + `translateY(-4px)` en `250ms --ease-out`
- Flèche du lien : `translateX(4px)` au hover

### 8.2 Card `highlight` (premium)

```
┌──────────────────────────────────────┐  ← bordure 2px --color-primary
│  [Badge "Recommandé"]                │
│  Titre                               │
│  Sous-titre                          │
│  ✓ Bénéfice 1                       │
│  ✓ Bénéfice 2                       │
│  [Button primary lg · 100%]          │
└──────────────────────────────────────┘
```

- Fond : `--color-primary-light` · `--shadow-blue` · `--radius-lg`

### 8.3 Card `case-study`

```
┌──────────────────────────────────────┐
│  [Tag service]    [Secteur]          │
│  Titre du projet                     │  --text-xl · weight 600
│  ┌────────┬────────┬────────┐        │
│  │ +240%  │  -14h  │  ×3.4 │        │  --text-3xl · weight 800 · --color-primary
│  │ leads  │/semaine│ trafic │        │  --text-sm · --color-gray-600
│  └────────┴────────┴────────┘        │
│  Durée · [Lire l'étude de cas →]    │
└──────────────────────────────────────┘
```

- KPI séparés par `|` (`--color-gray-200`) · gap `24px`

### 8.4 Card `blog`

```
┌──────────────────────────────────────┐
│  [Image 16:9 · --radius-md en haut] │
│  [Tag service]   [Temps lecture]     │
│  Titre article                       │  --text-xl · weight 600 · max 2 lignes
│  Extrait court…                      │  --text-sm · --color-gray-600
│  [Avatar 24px]  Prénom · Date        │  --text-xs · --color-gray-400
└──────────────────────────────────────┘
```

- Image : `aspect-ratio: 16/9` · `object-fit: cover` · `loading="lazy"`
- `<article>` élément HTML

### 8.5 Card `agent`

```
┌──────────────────────────────────────┐
│  [En-tête gradient 80px]             │
│  [Icône agent 36px · blanc]          │
│  Nom de l'agent                      │  --text-xl · weight 700
│  [● Disponible]                      │
│  Description courte                  │
│  ✓ Capacité 1                        │
│  ✓ Capacité 2                        │
│  [Essayer l'agent →]                 │
└──────────────────────────────────────┘
```

### 8.6 Card `stat`

```
┌──────────────────────────────────────┐
│  [Icône 32px · --color-primary]      │
│  +240%                               │  --text-5xl · weight 800 · --color-primary
│  de leads générés en moyenne         │  --text-base · --color-gray-600
└──────────────────────────────────────┘
```

- Animation countUp à l'entrée dans le viewport (`IntersectionObserver` seuil 0.3, durée 1200ms)

### 8.7 Card `horizontal` (témoignage long)

```
[Photo 64px]  [★★★★★]
Prénom Nom    « Citation courte sur une ligne »
Poste, Co.
```

Pour les sections avec 3 témoignages côte à côte.

### 8.8 Règles communes à toutes les cards

- Card entière cliquable si un seul lien interne : `cursor: pointer`
- `focus-within` : outline visible si un élément interne est focusé
- Jamais de lien imbriqué dans un lien
- `<article>` pour les cards blog et cas client · `<div>` pour les autres
- `alt` descriptif non vide sur toutes les images

---

## 9. Badges

### 9.1 Variantes

| Variante | Fond | Texte | Bordure | Usage |
|----------|------|-------|---------|-------|
| `pill-primary` | `--color-primary-light` | `--color-primary` | aucune | Sous-titre de section, catégorie |
| `pill-dark` | `rgba(255,255,255,0.12)` | `rgba(255,255,255,0.90)` | `1px solid rgba(255,255,255,0.20)` | Sur fond sombre |
| `tag-service` | Couleur service (§1.5) | Couleur service | aucune | Tags articles, cas clients |
| `tag-gray` | `--color-gray-100` | `--color-gray-600` | aucune | Tag neutre |
| `badge-new` | `--color-primary` | `#FFFFFF` | aucune | Nouveauté produit |
| `badge-status` | `rgba(16,185,129,0.12)` | `#10B981` | aucune | Statut Loïc en ligne |
| `checkmark` | transparent | hérite | aucune | Liste de bénéfices |

### 9.2 Tailles

| Taille | Padding | Font-size | Border-radius |
|--------|---------|-----------|---------------|
| `sm` | `4px 10px` | 12px | `--radius-full` |
| `md` | `6px 14px` | 14px | `--radius-full` |

### 9.3 Pill de section (règle typographique)

```css
.pill-section {
  font-size: 14px;          /* --text-sm */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  margin-bottom: 12px;      /* toujours au-dessus du H2 */
}
```

**Sur fond sombre :** couleur `rgba(255,255,255,0.90)` + fond `rgba(255,255,255,0.12)` + bordure `1px solid rgba(255,255,255,0.20)`

### 9.4 Point de statut animé

```
● Disponible   ← point 6px · fond --color-success · pulse 2s infini (opacity 0.6→1)
```

---

## 10. Tableaux

### 10.1 Tableau standard

```
┌──────────────┬────────────┬────────────┬──────────────┐
│ En-tête 1    │ En-tête 2  │ En-tête 3  │ En-tête 4    │  ← fond --color-primary-dark · texte blanc
├──────────────┼────────────┼────────────┼──────────────┤
│ Donnée       │ Donnée     │ Donnée     │ Donnée       │  ← fond --color-white
├──────────────┼────────────┼────────────┼──────────────┤
│ Donnée       │ Donnée     │ Donnée     │ Donnée       │  ← fond --color-gray-50 (alternance)
└──────────────┴────────────┴────────────┴──────────────┘
```

### 10.2 Styles

```css
table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);      /* 14px */
}

thead th {
  background: var(--color-primary-dark);
  color: #FFFFFF;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
}

tbody td {
  padding: 12px 16px;
  color: var(--color-gray-600);
  border-bottom: 1px solid var(--color-gray-200);
}

tbody tr:nth-child(even) {
  background: var(--color-gray-50);
}

tbody tr:hover {
  background: var(--color-primary-light);
}
```

### 10.3 Tableau comparatif (pricing / fonctionnalités)

| Colonne | En-tête | Valeur ✓ | Valeur ✗ | Valeur neutre |
|---------|---------|----------|----------|---------------|
| Style | weight 700 · `--color-primary` sur colonne recommandée | `Check` vert + texte | `X` gris | Texte seul |

- Colonne "Recommandée" : fond `--color-primary-light` · bordure `2px solid --color-primary` sur la colonne entière

### 10.4 Tableau responsive

Sur mobile (< 640px) : deux options acceptées
1. **Scroll horizontal** : `overflow-x: auto` + `white-space: nowrap` sur les cellules + ombre pour indiquer le scroll
2. **Cards empilées** : chaque ligne devient une card verticale

---

## 11. Navbar

### 11.1 Structure desktop

```
┌────────────────────────────────────────────────────────────┐
│  [Logo CA-TECH]  Services ▾  Loïc  Réalisations  Blog  [Diagnostic IA →]  │
└────────────────────────────────────────────────────────────┘
Hauteur : 72px · sticky · backdrop-blur(12px) au scroll
```

**Styles**
- Position : `position: sticky; top: 0; z-index: 100`
- Scroll = 0 (sur hero sombre) : fond transparent · liens `rgba(255,255,255,0.85)`
- Scroll > 60px : fond `rgba(255,255,255,0.92)` + `backdrop-filter: blur(12px)` · liens `--color-gray-700` · ombre `0 1px 0 rgba(0,0,0,0.08)`
- Transition : `background, backdrop-filter, box-shadow 200ms --ease-in-out`

**Liens**
- `--text-base` · weight `500` · `--color-gray-700`
- Hover : `--color-gray-900` + underline `2px solid --color-primary` slide-in (width 0→100%)
- Lien actif : `--color-primary` + underline visible

**Logo**
- `max-width: 130px` · SVG inline ou `<img>` avec `alt="CA-TECH"`

### 11.2 Méga-menu Services

```
┌──────────────────────────────────────────────────────┐
│  [🤖] Intelligence Artificielle  [⚡] Automatisation │
│       Agents IA, copilotes, RAG       Workflows      │
│                                                       │
│  [📈] SEO                        [💻] Dev Web        │
│       Audits, piliers, local          Sites, apps    │
│                                                       │
│  [🎨] Design & Identité                              │
│       Logos, chartes, flyers                         │
└──────────────────────────────────────────────────────┘
```

- Largeur : `520px` · fond `--color-white` · `--shadow-lg` · `--radius-lg` · padding `24px`
- Grille : 2 colonnes · `gap: 4px`
- Chaque item : padding `12px 16px` · `--radius-md` · hover fond `--color-gray-50`
- Titre item : `--text-base` · weight `600` · `--color-gray-900`
- Description item : `--text-sm` · `--color-gray-500`
- Animation : `opacity 0→1` + `translateY(-8px→0)` en `200ms --ease-out`
- Déclenchement : hover ET focus (accessibilité clavier)
- Fermeture : Escape · mouse leave avec délai 200ms

### 11.3 Header mobile

```
┌────────────────────────────┐
│  [Logo]              [☰]  │  Hauteur : 60px
└────────────────────────────┘
```

- Bouton hamburger : `44×44px` · icône `Menu` (Lucide) `24px`
- `aria-label="Ouvrir le menu"` + `aria-expanded` + `aria-controls`

### 11.4 Drawer mobile

```
┌────────────────────────────┐
│ [✕]                        │
│ Services                ›  │  Accordion in-drawer
│   Intelligence Artificielle│
│   Automatisation           │
│   SEO                      │
│   Développement Web        │
│   Design & Identité        │
│                            │
│ Loïc                       │
│ Réalisations               │
│ Blog                       │
│ ─────────────────────────  │
│ [  Diagnostic IA →       ] │  Button primary lg · margin 16px
└────────────────────────────┘
```

- Largeur : `min(320px, 80vw)` · fond `--color-white` · `--shadow-lg`
- Animation : `translateX(100%→0)` en `300ms --ease-out`
- Overlay : `rgba(0,0,0,0.4)` · `opacity 0→1` en `300ms`
- Fermeture : bouton ✕ · clic overlay · swipe droit · Escape
- Hauteur min liens : `48px` · `--text-lg` · weight `500` · padding `0 24px`
- Séparateurs : `1px solid --color-gray-100`
- **Focus trap actif** tant que le drawer est ouvert

### 11.5 Accessibilité navbar

```html
<header role="banner">
  <a href="/" aria-label="CA-TECH — Retour à l'accueil">[Logo]</a>
  <nav aria-label="Navigation principale">
    <button aria-haspopup="true" aria-expanded="false">Services</button>
    <!-- méga-menu -->
    <a href="/loic">Loïc</a>
    <a href="/nos-realisations">Réalisations</a>
    <a href="/blog">Blog</a>
  </nav>
  <button aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu">☰</button>
  <nav id="mobile-menu" aria-label="Menu mobile" hidden><!-- drawer --></nav>
</header>
```

---

## 12. Footer

### 12.1 Structure desktop

```
┌──────────────┬────────────────┬──────────────┬──────────────┐
│ [Logo blanc] │ Expertises     │ Villes       │ Contact      │
│              │                │              │              │
│ Slogan       │ Intelligence IA│ Paris        │ Email        │
│ description  │ Automatisation │ Lyon         │ LinkedIn     │
│ 2–3 lignes   │ SEO            │ Dijon        │ Téléphone    │
│              │ Dev Web        │ Troyes       │              │
│              │ Design         │              │ [LinkedIn →] │
└──────────────┴────────────────┴──────────────┴──────────────┘
────────────────────────────────────────────────────────────────
© 2026 CA-TECH     Mentions légales     CGV     Confidentialité
```

### 12.2 Styles

```css
footer {
  background: var(--color-gray-900);  /* #111827 */
  padding: 64px 0 40px;
}

/* Titres colonnes */
.footer-heading {
  font-size: 14px;             /* --text-sm */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.40);
  margin-bottom: 16px;
}

/* Liens */
.footer-link {
  font-size: 14px;
  color: rgba(255,255,255,0.70);
  transition: color 150ms;
}
.footer-link:hover { color: rgba(255,255,255,1); }

/* Logo */
.footer-logo { max-width: 110px; }

/* Slogan */
.footer-slogan {
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  margin-top: 12px;
  max-width: 200px;
}

/* Séparateur barre basse */
.footer-divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin: 32px 0 24px;
}

/* Copyright */
.footer-copyright {
  font-size: 12px;             /* --text-xs */
  color: rgba(255,255,255,0.40);
}
```

### 12.3 Structure mobile

Stack vertical : Logo + Slogan → Liens en 2 colonnes → Légal → Copyright

### 12.4 Accessibilité footer

```html
<footer role="contentinfo">
  <nav aria-label="Navigation footer — Expertises">…</nav>
  <nav aria-label="Navigation footer — Villes">…</nav>
  <nav aria-label="Navigation footer — Contact">…</nav>
  <nav aria-label="Navigation légale">…</nav>
</footer>
```

---

## 13. Icônes

### 13.1 Bibliothèque

**Lucide Icons exclusivement.** Jamais mélanger avec Font Awesome, Material Icons, Heroicons ou autre.

- Site de référence : `lucide.dev`
- Style : `stroke` (linéaire) — jamais `fill` sauf étoiles de notation
- `stroke-width: 2` par défaut · `1.5` pour les icônes ≥ 32px
- `stroke-linecap: round` · `stroke-linejoin: round` (valeurs par défaut Lucide)
- Couleur : `currentColor` — hérite du parent

### 13.2 Tailles standard

| Contexte | Taille | Stroke-width |
|----------|--------|-------------|
| Inline texte (boutons sm) | 16px | 2 |
| Composants courants (boutons md/lg, inputs) | 20px | 2 |
| Navigation, header, menu mobile | 24px | 2 |
| Feature cards | 32px | 1.5 |
| Process stepper, illustrations section | 48px | 1.5 |

### 13.3 Icônes par service (officielles)

| Service | Icône Lucide |
|---------|-------------|
| Intelligence Artificielle | `Bot` |
| Automatisation | `Zap` |
| SEO | `TrendingUp` |
| Développement Web | `Code2` |
| Design & Identité | `Pen` |
| Loïc (consultant) | `MessageCircle` |
| Diagnostic IA | `Stethoscope` |
| Rapport | `FileText` |
| Résultats | `BarChart2` |
| Confiance / Sécurité | `Shield` |
| Vitesse / Délai | `Clock` |
| Clients / Équipe | `Users` |

### 13.4 Icônes d'interface (réservées composants)

| Icône | Usage |
|-------|-------|
| `ChevronDown` | Dropdown, accordéon fermé |
| `ChevronLeft` / `ChevronRight` | Navigation carousel |
| `ChevronUp` | Retour haut de page |
| `X` | Fermer (modal, drawer, toast) |
| `Menu` | Hamburger mobile |
| `Send` | Envoyer message Loïc |
| `Check` | Validation, succès, liste bénéfices |
| `AlertCircle` | Erreur formulaire |
| `Info` | Toast information |
| `AlertTriangle` | Toast avertissement |
| `CheckCircle` | Toast succès |
| `XCircle` | Toast erreur |
| `Plus` | Accordéon fermé (alternative) |
| `Search` | Champ de recherche |
| `ArrowRight` | CTA directionnel |
| `ExternalLink` | Lien sortant |
| `Home` | Breadcrumb |
| `Star` | Étoile notation (fill — exception) |

### 13.5 Accessibilité iconographique

- Icône **décorative** (accompagne du texte) : `aria-hidden="true"` obligatoire
- Icône **fonctionnelle** (bouton icon-only) : `aria-label` descriptif sur l'élément parent
- Jamais `alt=""` sur une icône fonctionnelle
- Taille minimale zone cliquable : `44×44px`

---

## 14. Ombres

### 14.1 Tokens

```css
:root {
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:   0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg:   0 8px 32px rgba(0,0,0,0.12);
  --shadow-xl:   0 16px 48px rgba(0,0,0,0.16);
  --shadow-blue: 0 4px 16px rgba(0,102,255,0.20);   /* Cards highlight */
  --shadow-blue-lg: 0 8px 32px rgba(0,102,255,0.25); /* Bouton primary hover */
}
```

### 14.2 Ombres boutons

| Variante | Repos | Hover |
|----------|-------|-------|
| `primary` | `0 2px 8px rgba(0,102,255,0.20)` | `0 4px 16px rgba(0,102,255,0.35)` |
| `white` | `0 2px 8px rgba(0,0,0,0.12)` | `0 4px 16px rgba(0,0,0,0.20)` |
| Autres | aucune | `0 2px 8px rgba(0,0,0,0.08)` |

### 14.3 Ombres par composant

| Composant | Repos | Hover/Actif |
|-----------|-------|-------------|
| Card default | `--shadow-sm` | `--shadow-md` |
| Card highlight | `--shadow-blue` | `--shadow-blue-lg` |
| Méga-menu dropdown | `--shadow-lg` | — |
| Drawer mobile | `--shadow-lg` | — |
| Modal | `--shadow-xl` | — |
| Widget Loïc (ouvert) | `--shadow-lg` | — |
| Boutons carousel prev/next | `--shadow-md` | fond `--color-gray-50` |

### 14.4 Règles d'usage

- Jamais d'ombre sur les textes (text-shadow interdit)
- Jamais d'ombre colorée sauf `--shadow-blue` sur les éléments `--color-primary`
- Les ombres s'appliquent via `box-shadow` uniquement (pas de `filter: drop-shadow`)
- Sur fond sombre, les ombres ne sont pas visibles — ne pas en appliquer

---

## 15. Bordures

### 15.1 Tokens de border-radius

```css
:root {
  --radius-sm:   6px;      /* Inputs, petits composants */
  --radius-md:   10px;     /* Boutons, dropdowns */
  --radius-lg:   16px;     /* Cards standard */
  --radius-xl:   24px;     /* Sections, grands containers */
  --radius-full: 9999px;   /* Badges, pills, avatars, dots */
}
```

### 15.2 Tableau d'application

| Composant | Border-radius |
|-----------|---------------|
| Input, Textarea, Select | `--radius-sm` (6px) |
| Boutons | `--radius-md` (10px) |
| Cards | `--radius-lg` (16px) |
| Dropdown méga-menu | `--radius-lg` (16px) |
| Modal | `--radius-xl` (24px) |
| Testimonial | `--radius-xl` (24px) |
| Drawer mobile | `--radius-xl` sur coins gauche |
| Badges / Pills | `--radius-full` (9999px) |
| Avatars | `--radius-full` (9999px) |
| Dots carousel | `--radius-full` (8px → 24px actif) |
| Progress bar | `--radius-full` (6px) |
| Favicon | `border-radius: 20%` |

### 15.3 Tokens de bordure

```css
:root {
  --border-default: 1px solid var(--color-gray-200);
  --border-strong:  1px solid var(--color-gray-300);
  --border-focus:   2px solid var(--color-primary);
  --border-error:   2px solid var(--color-error);
  --border-success: 1px solid var(--color-success);
  --border-primary: 2px solid var(--color-primary);
  --border-white:   1px solid rgba(255,255,255,0.20);
}
```

### 15.4 Règles d'application

- Bordure sur card default : uniquement si la card est sur fond blanc (pas sur `--color-gray-50`)
- Séparateur footer : `1px solid rgba(255,255,255,0.08)` (ton sur ton discret)
- Séparateur FAQ items : `1px solid --color-gray-200`
- Séparateur nav footer : `1px solid --color-gray-100`
- Outline focus : `2px solid --color-primary; outline-offset: 3px` (jamais de `outline: none`)

---

## 16. États

### 16.1 Hover

```css
/* Règle générale */
transition: all → INTERDIT (trop large)
transition: transform, opacity, box-shadow, color, background-color

/* Cards */
:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

/* Bouton primary */
:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,102,255,0.35); }

/* Liens */
:hover { color: var(--color-primary); text-decoration: underline; }

/* Liens nav */
:hover { color: var(--color-gray-900); }
/* + underline slide-in : width 0→100% via pseudo-element */

/* FAQ item */
:hover { color: var(--color-primary); }

/* Footer liens */
:hover { color: rgba(255,255,255,1); }
```

Durée : `150ms --ease-out` pour tous les hovers simples · `250ms --ease-out` pour les cartes

### 16.2 Active / Pressed

```css
/* Boutons */
:active {
  transform: translateY(0);
  box-shadow: [version réduite du hover];
  transition-duration: 100ms;
}

/* Liens nav, items menu */
:active { opacity: 0.8; }
```

### 16.3 Focus

```css
/* Règle universelle — jamais de outline: none sans remplacement */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: inherit; /* suit la forme du composant */
}

/* Focus dans les inputs */
input:focus {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0,102,255,0.15);
  outline: none; /* remplacement par box-shadow pour les inputs */
}

/* Focus sur card entière */
.card:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
```

**Règle absolue :** le focus est toujours visible. `outline: 0` ou `outline: none` sans remplacement est interdit.

### 16.4 Disabled

```css
:disabled,
[aria-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* Input disabled */
input:disabled {
  background: var(--color-gray-50);
  border-color: var(--color-gray-200);
  color: var(--color-gray-400);
}
```

### 16.5 Loading

```css
/* Sur les boutons */
.button--loading {
  cursor: wait;
  pointer-events: none;
}

/* Spinner */
.spinner {
  width: 16px; height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
```

### 16.6 Sélectionné / Actif

```css
/* Lien nav actif */
.nav-link--active {
  color: var(--color-primary);
  font-weight: 600;
}
/* + underline visible */

/* Card de choix sélectionnée */
.choice-card--selected {
  background: var(--color-primary-light);
  border: 2px solid var(--color-primary);
}

/* Option dropdown sélectionnée */
.dropdown-option--selected {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
/* + icône Check à droite */
```

---

## 17. Animations

### 17.1 Tokens

```css
:root {
  /* Durées */
  --duration-fast:   150ms;   /* Hover, focus, états */
  --duration-normal: 250ms;   /* Composants (dropdown, modal) */
  --duration-slow:   400ms;   /* Reveals scroll, transitions */
  --duration-slower: 600ms;   /* Séquences hero */

  /* Courbes */
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);   /* Éléments entrants */
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);    /* Éléments sortants */
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Widget Loïc, cards */
}
```

### 17.2 Propriétés animables

**Autorisées :**
- `transform` (translate, scale, rotate)
- `opacity`
- `filter: blur()` — avec parcimonie

**Interdites (provoquent des recalculs layout = jank) :**
- `width` / `height`
- `top` / `left` / `right` / `bottom`
- `margin` / `padding`
- `background-color` en continu (acceptable uniquement à `150ms` pour les hover)

### 17.3 Patterns d'animation

**Scroll reveal (fadeUp)**
```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 400ms var(--ease-out), transform 400ms var(--ease-out);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```
Déclencheur : `IntersectionObserver` · seuil `0.15` · `once: true`

**Stagger (grille/liste)**
- Enfant 1 : `transition-delay: 0ms`
- Enfant 2 : `transition-delay: 80ms`
- Enfant 3 : `transition-delay: 160ms`
- Maximum 4 éléments staggerés

**Hover card**
```css
.card {
  transition: transform 250ms var(--ease-out), box-shadow 250ms var(--ease-out);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

**CountUp (stats)**
- Durée : `1200ms` · ease-out · décélère vers la valeur finale
- Préfixes/suffixes (`+`, `%`, `×`) : affichés directement, non animés
- Déclenché par `IntersectionObserver` seuil `0.3`
- Valeur finale présente dans le DOM dès le rendu (SEO + a11y)

**Dropdown / Modal entrant**
- `opacity: 0→1` + `translateY(-8px→0)` en `200ms --ease-out`

**Drawer mobile**
- `translateX(100%→0)` en `300ms --ease-out`
- Overlay : `opacity: 0→0.4` en `300ms`

**Widget Loïc (bouton)**
- Apparition : `scale(0)→scale(1)` en `400ms --ease-spring`

**FAQ accordéon**
- Ouverture : `max-height: 0→calculée` + `opacity: 0→1` en `250ms --ease-out`
- Icône + : `rotate(0→45deg)` en `250ms`

### 17.4 prefers-reduced-motion — Règle absolue

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Comportements spéciaux :**
- CountUp → afficher la valeur finale directement
- Carousel → désactiver l'auto-advance
- Hero sequence → afficher l'état final directement
- Scroll reveal → afficher les éléments visibles immédiatement

### 17.5 Ce qu'on n'anime jamais

- Texte qui se tape lettre par lettre (typewriter)
- Éléments qui rebondissent excessivement
- Fonds avec particules en mouvement continu
- Rotations 3D sur des éléments de contenu
- Animations déclenchées à l'infini sans interaction utilisateur

---

## 18. Responsive

### 18.1 Approche Mobile First

Tout le code est écrit pour `375px` en base. Les media queries `min-width` étendent ensuite vers les écrans plus larges.

```css
/* ✓ Correct — Mobile First */
.element { font-size: 14px; }
@media (min-width: 768px) { .element { font-size: 16px; } }

/* ✗ Incorrect — Desktop First */
.element { font-size: 16px; }
@media (max-width: 768px) { .element { font-size: 14px; } }
```

### 18.2 Comportements par composant

| Composant | Mobile (< 768px) | Tablette (768–1279px) | Desktop (≥ 1280px) |
|-----------|-----------------|----------------------|-------------------|
| Navigation | Hamburger + Drawer | Hamburger + Drawer | Nav inline + Méga-menu |
| Hero homepage | Stack 1 colonne | Stack 1 colonne | Grid 55/45 |
| Grille services | 1 colonne | 2 colonnes | 3 colonnes |
| Grille stats | 2×2 | 2×2 ou 4 inline | 4 inline |
| Section Loïc | Stack 1 col | Stack 1 col | Split 50/50 |
| Stepper | Vertical | Vertical | Horizontal |
| Carousel | Swipe natif, dots | Swipe + boutons | Boutons prev/next |
| Footer | 1 colonne | 2 colonnes | 4 colonnes |
| Widget Loïc (ouvert) | Plein écran | Fenêtre 380×520 | Fenêtre 380×520 |
| Tableaux | Scroll horizontal | Scroll horizontal | Complet |
| Breadcrumb | Tronqué si > 3 niveaux | Complet | Complet |

### 18.3 Typographie responsive

```css
/* H1 homepage */
h1.hero { font-size: 48px; }
@media (min-width: 768px) { h1.hero { font-size: 60px; } }
@media (min-width: 1280px) { h1.hero { font-size: 72px; } }

/* H2 sections */
h2 { font-size: 30px; }
@media (min-width: 1280px) { h2 { font-size: 36px; } }
```

### 18.4 Images responsive

```html
<img
  src="image-800.webp"
  srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
  width="800"
  height="450"
  alt="Description de l'image"
  loading="lazy"
>
<!-- Image hero uniquement : loading="eager" fetchpriority="high" -->
```

### 18.5 Tactile et touch

- Zone cliquable minimale : `44×44px` sur tous les éléments interactifs
- Swipe horizontal sur carousels et drawers
- Pas de `:hover`-only sans fallback touch
- Espacement suffisant entre éléments cliquables sur mobile : `8px` minimum

---

## 19. Accessibilité

### 19.1 Standard cible : WCAG 2.1 AA

Tous les composants et pages doivent respecter WCAG 2.1 niveau AA minimum.

### 19.2 Structure HTML

```html
<!-- Skip link — premier élément du body -->
<a href="#main-content" class="skip-link">Aller au contenu principal</a>

<!-- Landmark principale -->
<main id="main-content">…</main>
```

- `<main id="main-content">` sur chaque page
- 1 seul `<h1>` par page, dans le hero
- Hiérarchie H1→H2→H3 stricte, aucun saut de niveau
- `<header role="banner">` · `<footer role="contentinfo">` · `<nav aria-label="…">`

### 19.3 Focus management

```css
/* Focus toujours visible */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

/* Jamais */
:focus { outline: none; }   /* ✗ interdit sans remplacement */
```

**Focus trap :** obligatoire dans :
- Modal / Dialog
- Drawer mobile
- Widget Loïc (état ouvert)
- Dropdown méga-menu

**Fermeture au clavier :** Escape ferme toute modale / drawer / dropdown.

### 19.4 Images et médias

```html
<!-- Image informative -->
<img src="…" alt="Description précise du contenu" width="800" height="450">

<!-- Image décorative -->
<img src="…" alt="" role="presentation">

<!-- Icône décorative -->
<svg aria-hidden="true">…</svg>

<!-- Icône fonctionnelle (bouton icon-only) -->
<button aria-label="Fermer la fenêtre">
  <svg aria-hidden="true">…</svg>
</button>
```

### 19.5 Formulaires

```html
<!-- Champ standard -->
<label for="email">Email <span aria-hidden="true">*</span></label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-error"
  autocomplete="email"
>
<div id="email-error" role="alert" aria-live="polite">
  <!-- Message d'erreur injecté dynamiquement -->
</div>

<!-- Groupe de radios -->
<fieldset>
  <legend>Choisissez votre service</legend>
  <div role="radiogroup" aria-labelledby="service-legend">
    <input type="radio" id="ia" name="service" value="ia">
    <label for="ia">Intelligence Artificielle</label>
    <!-- … -->
  </div>
</fieldset>
```

### 19.6 ARIA patterns obligatoires

| Composant | ARIA requis |
|-----------|------------|
| Accordéon FAQ | `aria-expanded` + `aria-controls` sur le bouton déclencheur |
| Dropdown / Select custom | `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` |
| Carousel | `role="region"` + `aria-label` + `aria-live="polite"` sur la slide active |
| Progress Bar | `role="progressbar"` + `aria-valuenow/min/max` + `aria-label` |
| Toast | `role="alert"` + `aria-live="assertive"` (erreur) ou `"polite"` (info) |
| Drawer mobile | `aria-expanded` sur le bouton hamburger + `aria-hidden` sur le contenu principal |
| Stat countUp | Valeur finale dans le DOM dès le rendu (pas d'`aria-live`) |
| Lien actif nav | `aria-current="page"` |
| Breadcrumb | `<nav aria-label="Fil d'Ariane"><ol>…</ol></nav>` + `aria-current="page"` sur le dernier item |

### 19.7 Contraste (rappel)

| Paire | Ratio | Conformité |
|-------|-------|-----------|
| Blanc sur `#0066FF` | 4.6:1 | ✓ AA |
| Blanc sur `#0A2540` | 16.5:1 | ✓ AAA |
| `#111827` sur blanc | 19.5:1 | ✓ AAA |
| `#4B5563` sur blanc | 7.1:1 | ✓ AA |
| `#9CA3AF` sur blanc | 2.9:1 | ✗ Interdit pour texte |

### 19.8 Lighthouse — Critères de livraison

| Métrique | Cible minimum |
|----------|--------------|
| Performance | ≥ 90 |
| Accessibilité | ≥ 95 |
| Best Practices | ≥ 90 |
| SEO | 100 |

### 19.9 Core Web Vitals cibles

| Métrique | Cible |
|----------|-------|
| LCP (Largest Contentful Paint) | < 2.5s sur mobile |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |

---

## 20. Exemples d'utilisation

### 20.1 Section Hero — Homepage

```
FOND : --gradient-primary + glow radial gauche
LAYOUT : grid 55/45 · gap 64px · padding 160px haut

GAUCHE :
  [Pill dark] « Cabinet IA-First »
  [H1 · --text-7xl · weight 800 · blanc]
  "L'Intelligence Artificielle au service de votre croissance."
  [Sous-titre · --text-xl · rgba(255,255,255,0.80)]
  "Nous déployons l'IA, l'automatisation et le SEO pour les dirigeants qui veulent croître."
  [Groupe CTA]
    [Button white xl] "Lancer mon Diagnostic IA →"
    [Button ghost-white xl] "Voir nos réalisations →"
  [Micro-copy · --text-sm · rgba(255,255,255,0.60)]
  "Gratuit · Sans engagement · Résultat en 10 min"

DROITE :
  [Illustration Loïc / UI mockup]
```

### 20.2 Section Header — Section standard

```
[Pill primary] "INTELLIGENCE ARTIFICIELLE"        ← uppercase · --text-sm · --color-primary
[H2 · --text-4xl · weight 700]                    ← --color-gray-900
"Déployez l'IA au cœur de votre activité"
[Paragraphe · --text-lg · --color-gray-600]
"Agents IA, automatisation des processus, copilotes métier…"
                                    margin-bottom: 48px vers le contenu suivant
```

### 20.3 Bouton CTA — Exemple complet

```
[Lancer mon Diagnostic IA →]
  - Variante : primary · Taille : xl
  - Icône ArrowRight 18px à droite · aria-hidden="true"
  - type="button"
  
Gratuit · Sans engagement · Résultat en 10 min
  - --text-sm · --color-gray-400 · centré · margin-top: 12px
```

### 20.4 Card service — Exemple complet

```
┌─────────────────────────────────────────────┐
│  [Bot 40px · --color-primary]               │
│  [Pill primary] "INTELLIGENCE ARTIFICIELLE" │
│                                             │
│  Agents IA sur mesure                       │  --text-2xl · weight 600 · --color-gray-900
│                                             │
│  Déployez des agents qui qualifient vos     │  --text-base · --color-gray-600
│  leads, répondent aux clients et génèrent  │
│  des devis en autonomie.                    │
│                                             │
│  En savoir plus →                           │  --text-base · --color-primary · weight 500
└─────────────────────────────────────────────┘

États :
  Repos : --shadow-sm · bordure 1px --color-gray-200 · --radius-lg
  Hover : --shadow-md · translateY(-4px) · 250ms
         + flèche du lien translateX(4px)
```

### 20.5 Champ de saisie — Exemple complet

```
Email *                                        ← --text-sm · weight 500 · --color-gray-700
┌──────────────────────────────────────────┐
│  john@exemple.fr                   [✓]  │  ← état : valid · icône Check --color-success
└──────────────────────────────────────────┘
  Fond #FFFFFF · bordure 1px --color-success
  box-shadow: 0 0 0 3px rgba(16,185,129,0.12)
  --radius-sm · padding 12px 16px · hauteur 44px
```

### 20.6 Toast — Exemples

```
[✓] Votre diagnostic a bien été envoyé.          ← success : --color-success · fond rgba(16,185,129,0.10)
[⚠] Une erreur est survenue. Réessayez.          ← error   : --color-error   · fond rgba(239,68,68,0.10)
[ℹ] Votre rapport sera disponible sous 24h.      ← info    : --color-primary · fond rgba(0,102,255,0.08)
```

- Position : bas-droite desktop · bas-centre mobile
- Auto-disparition : 4000ms (succès/info) · persistant (erreur, nécessite fermeture manuelle)
- `role="alert"` + `aria-live="assertive"` (erreur) ou `"polite"` (succès/info)

### 20.7 Breadcrumb — Exemple

```html
<nav aria-label="Fil d'Ariane">
  <ol>
    <li><a href="/">Accueil</a></li>         <!-- lien · --color-gray-500 -->
    <li>/</li>                               <!-- séparateur · --color-gray-300 · margin 0 8px -->
    <li><a href="/seo">SEO</a></li>          <!-- lien · --color-gray-500 -->
    <li>/</li>
    <li aria-current="page">Agence SEO Paris</li>  <!-- texte · --color-gray-900 · non cliquable -->
  </ol>
</nav>
```

### 20.8 Alternance de sections — Page service type

```
1. Header sticky               → backdrop-blur · bg rgba(255,255,255,0.92)
2. Hero (blanc)                → padding 96px · pill + H1 + sous-titre + CTA + 3 stats
3. Avant / Après (gray-50)     → split 50/50 · 96px
4. Features 3×2 (blanc)        → 6 cards · 96px
5. Process stepper (gray-50)   → 4 étapes horizontales · 96px
6. Cas clients (blanc)         → 3 cards case-study · 96px
7. Témoignages (gray-50)       → carousel · 96px
8. FAQ (blanc)                 → 6 questions · FAQPage Schema.org · 96px
9. CTA final (gradient-primary)→ Button white xl + micro-copy · 96px
10. Footer (gray-900)
```

### 20.9 Checklist de livraison

Avant de livrer une page ou un composant, vérifier :

**Design**
- [ ] Tokens CSS utilisés (pas de valeurs en dur sauf exceptions documentées)
- [ ] Inter uniquement, graisses 400/600/800
- [ ] 1 seul `Button primary` visible au premier plan
- [ ] Micro-copy sous les CTA de conversion
- [ ] Contrastes WCAG AA vérifiés

**Accessibilité**
- [ ] 1 seul `<h1>`, hiérarchie H1→H2→H3 sans saut
- [ ] Skip link présent
- [ ] Focus toujours visible (jamais `outline: none` sans remplacement)
- [ ] ARIA obligatoires en place (aria-expanded, aria-label, aria-current…)
- [ ] Focus trap dans modales/drawers/widget Loïc
- [ ] Escape ferme toutes les modales/drawers/dropdowns
- [ ] `alt` sur toutes les images (descriptif ou `""` si décoratif)

**Performance**
- [ ] Images en WebP · `width`+`height` définis · `loading="lazy"` hors hero
- [ ] `fetchpriority="high"` + `loading="eager"` sur l'image hero
- [ ] `prefers-reduced-motion` respecté sur toutes les animations
- [ ] Aucune animation sur `width`/`height`/`margin`/`top`/`left`

**SEO**
- [ ] `<title>` unique 50–60 chars
- [ ] `<meta description>` unique 145–155 chars
- [ ] Open Graph complet
- [ ] `<link rel="canonical">`
- [ ] Schema.org adapté à la page
- [ ] Breadcrumb `BreadcrumbList` (hors homepage)

**Lighthouse cibles**
- [ ] Performance ≥ 90
- [ ] Accessibilité ≥ 95
- [ ] SEO = 100

---

*Document maintenu à jour · Sources : BRAND_GUIDELINES.md · COMPONENT_GUIDELINES.md · UX_UI_SPECIFICATION.md · HOMEPAGE_SPECIFICATION.md*  
*Toute modification de ce document doit être validée avant implémentation.*
