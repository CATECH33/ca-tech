# CA-TECH — Design System
> Digital Intelligence Studio — where complex technology becomes clear, powerful, and human.

**Version:** 1.0  
**Theme:** Dark-primary  
**Status:** Source of Absolute Truth — do not modify without explicit validation

---

## 01. Design Philosophy

CA-TECH est un studio d'intelligence numérique premium. L'interface doit le montrer sans le dire.

**Principes fondateurs :**

**Précision éditoriale** — Chaque section est une composition, pas un composant. Les espaces négatifs sont des décisions, pas des oublis. La typographie est l'outil principal d'impact.

**Technologie lisible** — L'IA, l'automatisation, les systèmes complexes doivent paraître maîtrisés, pas intimidants. L'interface traduit la complexité en clarté.

**Confiance par la sobriété** — Pas d'animations gadgets, pas de dégradés violets génériques, pas d'illustrations IA abstraites. La retenue signale la compétence.

**Immersion progressive** — Le scroll raconte une histoire. Chaque section approfondit la compréhension de CA-TECH. Le visiteur comprend la valeur avant d'atteindre le CTA.

**Mouvement signifiant** — Chaque animation a un rôle sémantique. Les transitions guident, les micro-interactions confirment, les scroll effects révèlent.

---

## 02. Brand Identity

**Nom :** CA-TECH  
**Positionnement :** Digital Intelligence Studio — IA, Automatisation, Développement Web, SaaS, Infrastructure, Data, Cybersécurité, SEO  
**Ton :** Expert, direct, confidentiel, moderne  
**Territoire :** Entre le cabinet de conseil tech haut de gamme et l'atelier de création numérique

**Le logo CA-TECH existe** dans le projet. Ne pas le recréer, ni le redessiner, ni le simuler en CSS.

**Domaines d'expertise représentés visuellement :**
- Intelligence Artificielle & LLM
- Automatisation & Workflows
- Agents IA & MCP
- Développement Web & SaaS
- Infrastructure Cloud & IT
- Data & Systèmes
- Cybersécurité
- SEO & Croissance digitale

---

## 03. Color System

### Palette principale CA-TECH

| Name | Hex | Token CSS | Rôle |
|------|-----|-----------|------|
| Deep Navy | `#05101E` | `--color-deep-navy` | Canvas principal — fond des sections dark, backgrounds primaires |
| Navy | `#102740` | `--color-navy` | Surfaces élevées sur fond dark — cards, panels, sections intermédiaires |
| Technical Blue | `#1A4066` | `--color-tech-blue` | Surfaces tertiaires — hover states sur dark, bordures actives |
| Light Tech Blue | `#359BD9` | `--color-accent` | Couleur d'accent principale — CTAs primaires, highlights, liens actifs, icônes accent |
| Silver | `#A5ACB5` | `--color-silver` | Texte secondaire, labels, placeholders, éléments UI muted |
| Light Silver | `#E0E0E3` | `--color-light-silver` | Bordures subtiles, séparateurs, dividers légers |
| Cool White | `#F2F4F6` | `--color-cool-white` | Texte principal sur dark, surfaces claires, contenu éditorial |

### Couleurs fonctionnelles

| Name | Hex | Token CSS | Rôle |
|------|-----|-----------|------|
| Pure White | `#FFFFFF` | `--color-white` | Texte blanc pur sur accent, logo sur fond dark |
| Success | `#22C55E` | `--color-success` | États de validation, métriques positives |
| Warning | `#F59E0B` | `--color-warning` | Alertes, états d'attention |
| Error | `#EF4444` | `--color-error` | Erreurs, états critiques |
| Accent Hover | `#4AAEE0` | `--color-accent-hover` | Hover sur --color-accent |
| Accent Dim | `#1E6A96` | `--color-accent-dim` | Accent atténué pour backgrounds subtils |

### Règles d'utilisation des couleurs

**Le noir pur (#000000) est INTERDIT comme canvas.** Deep Navy (#05101E) est le fond de référence.

**L'accent (#359BD9)** s'utilise pour :
- Boutons CTA primaires (rempli)
- Liens actifs et highlights
- Icônes d'accent
- Bordures actives et focus states
- Métriques et chiffres mis en valeur
- Underlines de sections

**L'accent ne s'utilise PAS pour :**
- Backgrounds de sections entières
- Texte long (corps de texte)
- Décorations ou patterns

**Dégradés autorisés :**
- `linear-gradient(135deg, #05101E 0%, #102740 100%)` — fond hero ou section majeure
- `linear-gradient(180deg, #102740 0%, #05101E 100%)` — transition de section
- `radial-gradient(ellipse at 30% 50%, #1A4066 0%, #05101E 70%)` — ambiance lumineuse tech
- Glow subtil : `radial-gradient(circle at 50% 0%, rgba(53, 155, 217, 0.12) 0%, transparent 60%)` — accent glow sur hero

---

## 04. Typography

### Familles

| Famille | Usage | Import Google Fonts |
|---------|-------|---------------------|
| Space Grotesk | Display, grandes headlines, titres de sections | `Space+Grotesk:wght@300;400;500;600;700` |
| Inter | Body, UI, navigation, labels, boutons | `Inter:wght@300;400;500;600;700` |
| JetBrains Mono | Code, métriques, labels techniques, données | `JetBrains+Mono:wght@400;500;600` |

### Tokens typographiques

```css
--font-display: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;
--font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

### Échelle typographique

| Token | Famille | Taille | Line-height | Letter-spacing | Weight | Usage |
|-------|---------|--------|-------------|----------------|--------|-------|
| `--text-hero` | Display | 80px | 1.0 | -0.04em | 700 | Hero principal (desktop) |
| `--text-display` | Display | 64px | 1.05 | -0.03em | 700 | Grands titres de section |
| `--text-display-md` | Display | 48px | 1.08 | -0.02em | 600 | Titres section mid |
| `--text-heading-xl` | Display | 40px | 1.1 | -0.02em | 600 | Heading large |
| `--text-heading` | Display | 32px | 1.2 | -0.01em | 600 | Heading standard |
| `--text-heading-sm` | Inter | 24px | 1.3 | -0.01em | 600 | Sous-titres, cards heading |
| `--text-subheading` | Inter | 20px | 1.4 | 0em | 500 | Descriptions intro |
| `--text-body-lg` | Inter | 18px | 1.6 | 0em | 400 | Corps long, paragraphes clés |
| `--text-body` | Inter | 16px | 1.6 | 0em | 400 | Corps standard |
| `--text-body-sm` | Inter | 14px | 1.5 | 0em | 400 | Textes UI, sous-labels |
| `--text-label` | Inter | 13px | 1.4 | 0.04em | 500 | Labels, navigation items |
| `--text-caption` | Inter | 12px | 1.4 | 0.02em | 400 | Captions, meta, footnotes |
| `--text-overline` | Inter | 11px | 1.3 | 0.12em | 600 | Eyebrows uppercase, category labels |
| `--text-mono-sm` | Mono | 13px | 1.5 | 0em | 400 | Code inline, valeurs techniques |
| `--text-mono` | Mono | 14px | 1.5 | 0em | 400 | Blocs code, métriques |
| `--text-mono-lg` | Mono | 18px | 1.4 | -0.01em | 500 | Grandes métriques chiffrées |

### Responsive hero text

```css
--text-hero-mobile: 40px;
--text-hero-tablet: 56px;
--text-hero-desktop: 80px;
```

### Conventions typographiques

**Eyebrows / Labels de section** : Toujours en uppercase, `--text-overline`, couleur `--color-accent`, espacement `letter-spacing: 0.12em`.

**Headlines principales** : `--font-display`, `--text-display` ou `--text-hero`, couleur `--color-cool-white`.

**Corps** : `--font-body`, `--text-body` ou `--text-body-lg`, couleur `--color-silver` ou `--color-cool-white` selon contexte.

**Métriques / Chiffres techniques** : `--font-mono`, `--text-mono-lg`, couleur `--color-accent` ou `--color-cool-white`.

**Labels techniques courts** : `--font-mono`, `--text-mono-sm`, couleur `--color-silver`.

---

## 05. Grid

### Layout principal

```css
--grid-max-width: 1200px;
--grid-max-width-wide: 1440px;
--grid-max-width-editorial: 960px;
--grid-max-width-narrow: 720px;
--grid-padding-mobile: 24px;
--grid-padding-tablet: 48px;
--grid-padding-desktop: 80px;
--grid-columns: 12;
--grid-gutter: 24px;
```

### Breakpoints

| Name | Valeur | Token |
|------|--------|-------|
| Mobile | 0–767px | `--bp-mobile` |
| Tablet | 768–1023px | `--bp-tablet` |
| Laptop | 1024–1279px | `--bp-laptop` |
| Desktop | 1280–1439px | `--bp-desktop` |
| Wide | 1440px+ | `--bp-wide` |

### Grilles communes

- **12 colonnes** — layouts complexes, showcases, dashboards
- **2 colonnes** — split screens éditoriaux (50/50, 40/60, 60/40)
- **3 colonnes** — services, features, case studies
- **4 colonnes** — grilles de tags, petites cards
- **Auto-flow** — carousels, slides, galeries

---

## 06. Spacing

### Base unit : 4px

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
--space-40: 160px;
```

### Espacement des sections

| Context | Valeur |
|---------|--------|
| Padding section desktop | `--space-32` (128px) haut, `--space-32` bas |
| Padding section tablet | `--space-20` (80px) haut, `--space-20` bas |
| Padding section mobile | `--space-16` (64px) haut, `--space-16` bas |
| Gap between text elements | `--space-4` à `--space-6` (16–24px) |
| Gap intra-section | `--space-8` à `--space-12` (32–48px) |
| Gap entre sections | Défini par changement de fond, pas de margin visible |

---

## 07. Surfaces

| Niveau | Nom | Valeur | Usage |
|--------|-----|--------|-------|
| 0 | Canvas | `#05101E` | Background page — fond profond sections dark |
| 1 | Panel | `#102740` | Cards, panels élevés, sections contrastées |
| 2 | Surface | `#1A4066` | Éléments interactifs, hover states, inputs |
| 3 | Overlay | `rgba(16, 39, 64, 0.9)` | Modals, overlays, drawers |
| 4 | Frosted | `rgba(5, 16, 30, 0.8)` | Navigation sticky, backgrounds flottants |
| 5 | Glow | `rgba(53, 155, 217, 0.08)` | Background subtil sections accent |
| 6 | Light Section | `#F2F4F6` | Sections claires (usage ponctuel) |
| 7 | Light Panel | `#FFFFFF` | Cards sur fond clair, modals light |

### Séparation de sections

Les sections se séparent **uniquement** par changement de background. Zéro dividers, zéro `<hr>`, zéro `border-top`.

Séquences possibles :
- `Canvas` → `Panel` → `Canvas` → `Surface`
- `Canvas` → `Light Section` → `Canvas` (rare — pour rupture visuelle forte)
- `Gradient` → `Canvas` → `Gradient`

---

## 08. Borders

```css
--border-subtle: 1px solid rgba(165, 172, 181, 0.12);  /* Très discret */
--border-default: 1px solid rgba(165, 172, 181, 0.20);  /* Standard */
--border-strong: 1px solid rgba(165, 172, 181, 0.35);   /* Prononcé */
--border-accent: 1px solid rgba(53, 155, 217, 0.40);    /* Accent discret */
--border-accent-strong: 1px solid #359BD9;               /* Accent plein — focus, actif */
--border-light: 1px solid rgba(224, 224, 227, 0.15);    /* Sur surface light */
```

**Règle** : Les bordures sont des indications, pas des structures. Elles ne délimitent pas des zones — elles suggèrent des séparations.

---

## 09. Border Radius

Système à niveaux — mélanger les radii selon le contexte est voulu.

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-none` | 0px | Sections pleine largeur, nav, hero backgrounds |
| `--radius-xs` | 4px | Tags inline, badges, chips petits |
| `--radius-sm` | 6px | Boutons primaires, inputs, petits éléments UI |
| `--radius-md` | 10px | Cards standard, panels, thumbnails |
| `--radius-lg` | 16px | Cards larges, media frames, panels showcase |
| `--radius-xl` | 24px | Grands panneaux, sections avec fond arrondi |
| `--radius-2xl` | 32px | Grands showcase panels, hero visuals |
| `--radius-pill` | 999px | Labels type, indicators, progress bars, badges ronds |

### Attribution par composant

| Composant | Radius |
|-----------|--------|
| Bouton primaire | `--radius-sm` (6px) |
| Bouton secondaire | `--radius-sm` (6px) |
| Bouton ghost | `--radius-sm` (6px) |
| Pill / Badge | `--radius-pill` (999px) |
| Input / Textarea | `--radius-sm` (6px) |
| Card standard | `--radius-md` (10px) |
| Card large | `--radius-lg` (16px) |
| Media frame / Screenshot | `--radius-lg` (16px) |
| Showcase panel | `--radius-xl` (24px) |
| Modal | `--radius-xl` (24px) |
| Drawer | `--radius-xl` (24px) côté ouverture |
| Navigation | `--radius-none` (0px) |
| Sections | `--radius-none` (0px) |
| Tooltip | `--radius-xs` (4px) |

---

## 10. Buttons

### Bouton primaire (Filled)

```css
background: #359BD9;
color: #FFFFFF;
border: none;
border-radius: var(--radius-sm); /* 6px */
padding: 12px 24px;
font-family: var(--font-body);
font-size: var(--text-label); /* 13px */
font-weight: 600;
letter-spacing: 0.01em;
transition: background 0.18s ease, transform 0.15s ease;
cursor: pointer;
```

**Hover :** `background: #4AAEE0`, `transform: translateY(-1px)`
**Active :** `background: #1E6A96`, `transform: translateY(0)`
**Disabled :** `opacity: 0.4`, `cursor: not-allowed`

### Bouton secondaire (Outlined)

```css
background: transparent;
color: #359BD9;
border: 1px solid #359BD9;
border-radius: var(--radius-sm);
padding: 11px 23px;
font-family: var(--font-body);
font-size: var(--text-label);
font-weight: 600;
letter-spacing: 0.01em;
transition: background 0.18s ease, color 0.18s ease;
```

**Hover :** `background: rgba(53, 155, 217, 0.08)`, `color: #4AAEE0`

### Bouton ghost (Dark surface)

```css
background: rgba(255, 255, 255, 0.06);
color: #F2F4F6;
border: 1px solid rgba(165, 172, 181, 0.20);
border-radius: var(--radius-sm);
padding: 11px 23px;
```

**Hover :** `background: rgba(255, 255, 255, 0.10)`, `border-color: rgba(165, 172, 181, 0.35)`

### Bouton texte (Link-style)

```css
background: transparent;
color: #359BD9;
border: none;
padding: 0;
font-weight: 500;
display: inline-flex;
align-items: center;
gap: 6px;
```

**Hover :** `color: #4AAEE0`, underline optionnel

### Sizing

| Size | Padding | Font size | Token |
|------|---------|-----------|-------|
| Small (sm) | 8px 16px | 12px | `--btn-sm` |
| Default (md) | 12px 24px | 13px | `--btn-md` |
| Large (lg) | 16px 32px | 15px | `--btn-lg` |
| XL | 20px 40px | 16px | `--btn-xl` |

### Paires de boutons CTA

Primaire + Secondaire : `gap: 12px`, alignement `center` ou `flex-start` selon contexte.
Sur hero : `gap: 16px`, toujours centrés sur mobile, gauche ou centré sur desktop.

---

## 11. Navigation

### Specs techniques

```css
height: 64px;
position: fixed;
top: 0;
width: 100%;
z-index: 100;
background: rgba(5, 16, 30, 0.80);
backdrop-filter: blur(20px) saturate(1.6);
-webkit-backdrop-filter: blur(20px) saturate(1.6);
border-bottom: 1px solid rgba(165, 172, 181, 0.10);
border-radius: 0;
transition: background 0.3s ease, border-color 0.3s ease;
```

**Au scroll (>80px) :** `border-bottom-color: rgba(165, 172, 181, 0.18)`

### Structure nav desktop

```
[Logo CA-TECH] — [Expertises] [Solutions] [IA & Agents] [Réalisations] [Blog] — [Nous contacter]
```

- Logo à gauche
- Items centraux : `--text-label` (13px), `font-weight: 500`, couleur `--color-silver`, hover `--color-cool-white`
- CTA à droite : bouton primaire sm
- Dropdown : `background: rgba(16, 39, 64, 0.95)`, `backdrop-filter: blur(20px)`, `border-radius: --radius-md`

### Nav mobile

Hauteur 56px. Hamburger icon 24px. Menu fullscreen ou drawer avec :
- `background: rgba(5, 16, 30, 0.97)`
- Items à `--text-heading-sm` pour lisibilité
- CTA pleine largeur en bas

---

## 12. Hero System

### Hero principal (Homepage)

**Layout :** Centré ou left-aligned (voir section par section)  
**Hauteur :** 100vh minimum, 110vh maximum sur desktop  
**Background :** Dégradé Canvas → Panel ou glow accent

**Structure verticale :**
```
[Eyebrow label — uppercase, accent color]
[Headline H1 — --text-hero — Cool White]
[Sous-headline — --text-display-md — Silver]
[Paragraph intro — --text-body-lg — Silver]
[Button pair — gap 16px]
[Scroll indicator ou visual anchor]
```

**Visuel hero :**
- Interface dashboard, workflow, ou système IA flottant
- Pas d'illustration stock, pas d'humains génériques
- Peut être : screenshot avec profondeur, composition 3D, animation de données
- Frame : `--radius-xl` ou `--radius-2xl` avec glow accent subtil

### Hero variante — Textuel pur

Pour pages intérieures, cas clients, articles :
- 60–70vh
- Headline seule, grande, centrée
- Eyebrow + titre + description courte
- Pas de visuel annexe

### Hero variante — Split (50/50)

```
[Texte à gauche — jusqu'à col 6]  [Visuel à droite — col 7–12]
```
Visuel légèrement débordant du cadre vers le haut.

---

## 13. Showcase System

Le showcase est le composant visuel central de CA-TECH — il présente les systèmes, interfaces, et réalisations.

### Showcase standard

**Dimensions desktop :**
- Largeur : 100% de la section (max `--grid-max-width-wide`)
- Hauteur : auto, minimum 400px, maximum 600px
- Padding interne : `--space-10` (40px)
- Border radius : `--radius-xl` (24px)
- Background : `--color-navy` ou gradient subtil

**Showcase avec fenêtre navigateur :**
```css
/* Chrome frame */
.showcase-browser-bar {
  height: 32px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 6px;
}
.showcase-browser-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
}
```

**Showcase avec caption :**
- Eyebrow en dessous : `--text-overline`, couleur `--color-accent`
- Titre : `--text-heading-sm`
- Description : `--text-body-sm`, couleur `--color-silver`

### Showcase en grille

- 2 showcases côte à côte : `gap: --space-6`, chacun `--radius-lg`
- 3 showcases : largeur réduite, `--radius-md`
- Showcase large + showcase petit : ratio 60/40

### Showcase flottant avec glow

```css
.showcase-glow {
  position: relative;
}
.showcase-glow::after {
  content: '';
  position: absolute;
  inset: -20px;
  background: radial-gradient(ellipse at 50% 50%, rgba(53, 155, 217, 0.15), transparent 70%);
  z-index: -1;
  pointer-events: none;
}
```

---

## 14. Slides System

### Specs générales

**Dimensionnement :**

| Contexte | Largeur | Hauteur |
|---------|---------|---------|
| Slide hero fullscreen | 100vw | 100vh |
| Slide showcase intégré | 100% section | 480px desktop / auto mobile |
| Slide mini carousel | col 4 | 280px |
| Slide cas client | 100% max-width | auto |

**Navigation :**

```css
/* Dots de pagination */
.slide-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(165, 172, 181, 0.30);
  transition: all 0.3s ease;
}
.slide-dot--active {
  width: 24px;
  border-radius: 3px;
  background: #359BD9;
}

/* Flèches */
.slide-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(16, 39, 64, 0.80);
  border: 1px solid rgba(165, 172, 181, 0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}
.slide-arrow:hover {
  background: rgba(53, 155, 217, 0.20);
  border-color: rgba(53, 155, 217, 0.40);
}
```

**Transitions :**
- Type : `transform: translateX()` — pas de `opacity` seul
- Durée : 500ms
- Easing : `cubic-bezier(0.32, 0, 0.16, 1)`
- Avec Framer Motion : `type: "tween"`, `ease: [0.32, 0, 0.16, 1]`, `duration: 0.5`

**Interaction :**
- Desktop : clic sur flèches, clic sur dots
- Tablet/Mobile : swipe horizontal (touch events)
- Clavier : `ArrowLeft` / `ArrowRight`
- Autoplay : désactivé par défaut, optionnel avec `interval: 5000ms`, pause on hover

**Contenu des slides :**

Chaque slide représente une expertise ou un système CA-TECH :

```
Slide 01 — AI SYSTEM       : interface agent IA, LLM pipeline
Slide 02 — AUTOMATION       : workflow n8n/Make, schéma d'automatisation
Slide 03 — LLM & MCP        : architecture de modèles, context window
Slide 04 — DIGITAL EXPERIENCE : site client, landing page
Slide 05 — SaaS             : dashboard produit, interface app
Slide 06 — INFRASTRUCTURE   : schéma cloud, monitoring
Slide 07 — DATA             : visualisation données, dashboard analytics
Slide 08 — CYBERSECURITY    : interface audit, protection
```

**Structure d'un slide :**
```html
<div class="slide" data-index="N">
  <div class="slide__visual">  <!-- screenshot, mockup, ou composition -->
  </div>
  <div class="slide__content">
    <span class="slide__label">CATÉGORIE</span>  <!-- overline mono -->
    <h3 class="slide__title">Titre du système</h3>
    <p class="slide__desc">Description courte</p>
    <a class="slide__cta">Voir plus →</a>
  </div>
</div>
```

**Responsive slides :**
- Desktop : 1 slide large, ou 2 partiellement visibles (peek)
- Tablet : 1 slide avec peek 10% du suivant
- Mobile : 1 slide pleine largeur, no peek

---

## 15. Cards

### Card standard

```css
background: var(--color-navy);       /* #102740 */
border: 1px solid rgba(165, 172, 181, 0.12);
border-radius: var(--radius-md);     /* 10px */
padding: 32px;
transition: border-color 0.2s ease, transform 0.2s ease;
```
**Hover :** `border-color: rgba(53, 155, 217, 0.30)`, `transform: translateY(-2px)`

### Card avec accent top

Bordure colorée en haut de card — `border-top: 2px solid #359BD9`

### Card feature (grande)

```css
border-radius: var(--radius-lg);     /* 16px */
padding: 48px;
background: linear-gradient(135deg, #102740 0%, #1A4066 100%);
```

### Card metric / stat

```css
border-radius: var(--radius-sm);     /* 6px */
padding: 20px 24px;
background: rgba(26, 64, 102, 0.40);
border: 1px solid rgba(53, 155, 217, 0.20);
```

**Valeur :** `--font-mono`, `--text-mono-lg`, couleur `--color-accent`  
**Label :** `--text-caption`, `--color-silver`

### Card cas client / portfolio

```css
border-radius: var(--radius-lg);     /* 16px */
overflow: hidden;
```
- Image en header, pleine largeur
- Contenu en bas avec fond `--color-navy`
- Tag category : `--radius-pill`, fond `rgba(53,155,217,0.15)`, texte `--color-accent`

### Card témoignage

```css
border-radius: var(--radius-md);
padding: 32px;
background: rgba(16, 39, 64, 0.60);
border: 1px solid rgba(165, 172, 181, 0.10);
```
- Citation en italic, `--text-body-lg`
- Avatar + nom + titre en bas

---

## 16. Media

### Traitement des images

**Screenshots / interfaces :**
- Border-radius : `--radius-lg` (16px) minimum, `--radius-xl` (24px) pour grands panels
- Fond sous l'image : contexte de la section
- Ombre : `0 24px 64px rgba(0, 0, 0, 0.40)` — élévation forte
- Glow accent optionnel : `0 0 40px rgba(53, 155, 217, 0.12)`
- Jamais de bordure blanche ou cadre générique

**Images style CA-TECH :**
- Interfaces sombres sur fond dark (cohérence)
- Dashboards, workflows, agents IA
- Compositions 3D techniques
- Mockups device (MacBook, iPhone, écran)
- Jamais : photos stock de personnes devant ordinateurs, illustrations IA clichées

**Videos :**
- Autoplay silencieux pour backgrounds hero
- Loop infini
- `object-fit: cover`
- Overlay semi-transparent si du texte par-dessus

### Midjourney — Directives de prompt

**Style pour CA-TECH :**
```
dark navy background, technical UI interface, 
blue accent lighting, premium digital dashboard,
ultra-clean minimal design, depth of field,
studio lighting, 8k, no people, no stock photography feel,
--ar 16:9 --style raw --v 6
```

**Pour agents IA / LLM :**
```
neural network visualization, node graph, 
deep blue palette, glowing connections, 
abstract data flow, premium tech aesthetic,
no cartoon, photorealistic render --ar 16:9
```

**Pour automatisation :**
```
workflow diagram, connected nodes, 
dark interface, teal accent, 
clean technical layout, isometric view,
professional SaaS design --ar 4:3
```

### Règles media responsive

- Images : `max-width: 100%`, `height: auto`
- Showcases : `border-radius` réduit sur mobile (`--radius-lg` → `--radius-md`)
- Videos background : masqués sur mobile si impact perf > seuil

---

## 17. Motion System

CA-TECH utilise **Framer Motion** comme bibliothèque d'animation principale.

### Valeurs d'easing

```typescript
// Easing tokens
export const ease = {
  smooth:    [0.16, 1, 0.3, 1],    // Entrée de page, reveals principaux
  decelerate:[0, 0, 0.3, 1],        // Éléments qui arrivent depuis l'extérieur
  accelerate:[0.7, 0, 1, 1],        // Éléments qui partent
  snap:      [0.32, 0, 0.16, 1],    // Slides, transitions directes
  spring:    { type: 'spring', stiffness: 260, damping: 28 }, // Micro-interactions
}
```

### Durées

```typescript
export const duration = {
  instant:    0.1,   // Hover states, toggles
  fast:       0.18,  // Boutons, UI feedback
  normal:     0.30,  // Transitions UI standard
  medium:     0.50,  // Slides, modals, drawers
  slow:       0.70,  // Reveals éditoriaux
  storytelling: 1.0, // Entrées hero, grandes transitions
}
```

### Variants Framer Motion — Bibliothèque

```typescript
// Fade up — entrée standard d'éléments au scroll
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}

// Stagger container
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

// Fade in simple
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

// Slide depuis la droite (slides système)
export const slideFromRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, x: 0,
    transition: { duration: 0.5, ease: [0.32, 0, 0.16, 1] }
  }
}

// Scale reveal
export const scaleReveal = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}

// Headline grande — split par mots
export const headlineReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.05 
    }
  })
}
```

### Règles motion

**Entrées au scroll (IntersectionObserver ou `whileInView`) :**
- Seuil : `threshold: 0.1` — déclencher dès que 10% visible
- `once: true` — jouer une seule fois
- Distance de translation : 20–32px maximum (pas 80px+ comme beaucoup font)

**Hover states :**
- Boutons : `scale: 1.01` + couleur — jamais de scale > 1.05
- Cards : `translateY(-2px)` — pas de scale
- Links : couleur seule, pas de transform

**Scroll storytelling :**
- Sticky sections : `position: sticky`, `top: 64px` (hauteur nav)
- Parallax : atténué, jamais > 20% de décalage
- Progress bar de scroll : optionnel sur articles longs

**Interdits :**
- `bounce` easing sur éléments éditoriaux
- Animations en boucle sur du texte
- Transitions de couleur > 0.5s
- `transform: rotate()` sans but précis
- Parallax permanent sur hero — une fois suffit

### `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
En Framer Motion : toujours vérifier `useReducedMotion()`.

---

## 18. Interaction

### Focus states

```css
:focus-visible {
  outline: 2px solid #359BD9;
  outline-offset: 3px;
  border-radius: var(--radius-xs);
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid #359BD9;
  outline-offset: 3px;
}
```

### Curseurs

- Par défaut : `cursor: default`
- Liens et boutons : `cursor: pointer`
- Éléments disabled : `cursor: not-allowed`
- Drag sur slides : `cursor: grab` / `cursor: grabbing`

### États interactifs

| État | Durée transition | Type |
|------|-----------------|------|
| Hover | 0.18s | ease |
| Active (click) | 0.1s | ease |
| Focus | 0.15s | ease |
| Disabled | — | Pas de transition |

### Tooltips

```css
border-radius: var(--radius-xs);
background: rgba(16, 39, 64, 0.95);
border: 1px solid rgba(165, 172, 181, 0.20);
padding: 6px 10px;
font-size: var(--text-caption);
backdrop-filter: blur(8px);
```

---

## 19. Forms

### Input standard

```css
height: 44px;
background: rgba(26, 64, 102, 0.30);
border: 1px solid rgba(165, 172, 181, 0.20);
border-radius: var(--radius-sm);
padding: 0 16px;
font-family: var(--font-body);
font-size: var(--text-body-sm);
color: var(--color-cool-white);
transition: border-color 0.2s ease, background 0.2s ease;
outline: none;
```

**Placeholder :** `color: rgba(165, 172, 181, 0.50)`  
**Focus :** `border-color: #359BD9`, `background: rgba(53, 155, 217, 0.06)`

### Textarea

Idem Input, hauteur auto, `min-height: 120px`, `padding: 12px 16px`, `resize: vertical`.

### Label

```css
font-size: var(--text-label);
font-weight: 500;
color: var(--color-cool-white);
margin-bottom: 6px;
```

### Message d'erreur

```css
font-size: var(--text-caption);
color: var(--color-error);
margin-top: 4px;
```

---

## 20. Portfolio / Case Studies

### Grid cas clients

**Desktop :** 2 colonnes, cards grandes  
**Tablet :** 2 colonnes, cards réduites  
**Mobile :** 1 colonne  

### Structure d'une fiche cas client

```
[Image hero — 16:9, border-radius: --radius-lg]
[Category tag — pill accent]
[Titre projet — --text-heading]
[Client + Secteur — --text-caption mono]
[Description courte — --text-body]
[Stack technique — tags mono]
[Résultats metrics — stat cards]
[CTA voir la réalisation]
```

### Tags techniques

```css
.tag-tech {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  background: rgba(53, 155, 217, 0.12);
  border: 1px solid rgba(53, 155, 217, 0.25);
  color: #359BD9;
  letter-spacing: 0.02em;
}
```

### Metrics / résultats

Afficher sous forme de `--card-metric` :
- Valeur prominente en `--font-mono`
- Label descriptif en `--text-caption`
- Contexte comparatif si possible (`vs. avant`)

---

## 21. CTA System

### CTA section — Blocs d'appel à l'action

**CTA principal (fin de page ou mid-page) :**

```
Background : dégradé Navy → Canvas ou Canvas avec glow accent
Eyebrow    : "TRAVAILLONS ENSEMBLE" ou "COMMENCER" — --text-overline accent
Headline   : Grande, centrée — --text-display-md
Description : --text-body-lg, --color-silver
Button pair : Primaire + Secondaire, gap 16px, centrés
```

**CTA inline (milieu de section) :**
- Texte bouton court et actionnable : "Voir la réalisation", "Discutons de votre projet", "Demander un devis"
- Toujours accompagné de contexte (pourquoi cliquer)

**CTA sticky (mobile) :**
- Position `fixed bottom: 0`
- Pleine largeur
- Background `rgba(5, 16, 30, 0.95)`, `backdrop-filter: blur(12px)`
- Apparaît après 50% de scroll
- Disparaît si footer visible

---

## 22. Footer

### Structure

```
[Logo CA-TECH]  [Nav Expertises]  [Nav Solutions]  [Nav Légal]
[Tagline]
[Réseaux sociaux]
[Barre légale : © 2024 CA-TECH · Mentions légales · Politique cookies · SIRET]
```

### Specs

```css
background: #05101E;
border-top: 1px solid rgba(165, 172, 181, 0.10);
padding: 80px 0 40px;
```

**Titres colonnes :** `--text-label`, `--color-cool-white`, `font-weight: 600`  
**Liens :** `--text-body-sm`, `--color-silver`, hover `--color-cool-white`  
**Barre légale :** `--text-caption`, `--color-silver`, `opacity: 0.6`

---

## 23. Responsive

### Mobile First — Règles fondamentales

Le design mobile **n'est pas une réduction** du desktop. C'est une expérience distincte qui priorise :
- La lisibilité
- Les gestes tactiles
- La vitesse
- L'essentiel du contenu

### Breakpoints détaillés

#### Mobile (0–767px)
- `--text-hero` : 40px (voir `--text-hero-mobile`)
- Headlines alignées à gauche (pas centrées)
- Sections : padding 24px
- Cards : 1 colonne, pleine largeur
- Nav : burger menu
- Showcases : height: auto, scrollable
- Slides : pleine largeur, swipe
- CTAs : pleine largeur sur mobile

#### Tablet (768–1023px)
- `--text-hero` : 56px
- 2 colonnes pour cards
- Nav : peut rester horizontale si peu d'items
- Showcases : height 360px
- Padding : 48px

#### Laptop (1024–1279px)
- `--text-hero` : 64px
- Grille 12 colonnes active
- Showcases pleine taille

#### Desktop (1280px+)
- `--text-hero` : 80px
- Max-width active (1200px centré)
- Showcases 16:9

#### Wide (1440px+)
- Max-width : 1440px
- Showcase fullbleed possible

### Grille responsive

```css
.container {
  width: 100%;
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding-left: var(--grid-padding-mobile);
  padding-right: var(--grid-padding-mobile);
}
@media (min-width: 768px) {
  .container {
    padding-left: var(--grid-padding-tablet);
    padding-right: var(--grid-padding-tablet);
  }
}
@media (min-width: 1280px) {
  .container {
    padding-left: var(--grid-padding-desktop);
    padding-right: var(--grid-padding-desktop);
  }
}
```

---

## 24. Accessibility

### Contraste (WCAG AA minimum)

| Texte | Fond | Ratio | Validation |
|-------|------|-------|-----------|
| `#F2F4F6` | `#05101E` | 13.4:1 | AAA ✅ |
| `#A5ACB5` | `#05101E` | 5.8:1 | AA ✅ |
| `#359BD9` | `#05101E` | 4.6:1 | AA ✅ (large text) |
| `#FFFFFF` | `#359BD9` | 3.8:1 | AA (large/bold) ✅ |
| `#F2F4F6` | `#102740` | 9.2:1 | AAA ✅ |

**Vérifier systématiquement** avec WebAIM Contrast Checker avant tout ajout de couleur.

### Focus & Keyboard

- Tous les éléments interactifs : `focus-visible` défini (voir §18)
- Skip link : `<a href="#main-content" class="skip-link">Aller au contenu</a>`
- Ordre de tabulation logique
- Slides : navigation clavier `ArrowLeft` / `ArrowRight`, `Enter` pour sélectionner

### ARIA

```html
<!-- Navigation -->
<nav aria-label="Navigation principale">
<button aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu">

<!-- Slides -->
<div role="region" aria-label="Showcase CA-TECH" aria-roledescription="carousel">
  <div role="group" aria-roledescription="slide" aria-label="1 of 8">

<!-- Cards interactives -->
<article aria-labelledby="card-title-N">

<!-- Icônes décoratives -->
<svg aria-hidden="true" focusable="false">
```

### Tailles tactiles

- Boutons et liens : minimum `44px × 44px` de zone cliquable
- Nav items mobile : minimum `48px` de hauteur
- Dots slides : zone cliquable `32px × 32px` minimum

### Images

- `alt` texte descriptif pour toutes les images informatives
- `alt=""` pour images purement décoratives
- Pour les screenshots/interfaces : décrire brièvement le contenu

---

## 25. Do / Don't

### DO ✅

- Utiliser `#05101E` (Deep Navy) comme fond principal — jamais noir pur comme canvas
- Employer `#359BD9` uniquement pour les CTAs, accents, liens actifs, highlights
- Faire de grandes headlines avec Space Grotesk — elles sont la signature visuelle
- Utiliser les espaces négatifs intentionnellement — la respiration est du design
- Mélanger des radii différents selon les composants — pas de uniformité rigide
- Séparer les sections par changement de fond uniquement (pas de dividers)
- Utiliser JetBrains Mono pour les métriques, données, labels techniques — cela crée l'ancrage "tech"
- Animer avec intention — chaque animation doit servir la compréhension
- Vérifier `prefers-reduced-motion` systématiquement
- Tester les contrastes — minimum AA

### DON'T ❌

- Ne pas utiliser `#000000` comme fond de sections ou canvas principal
- Ne pas utiliser `#359BD9` pour des backgrounds pleine section
- Ne pas copier le design Apple — ni les boutons 980px pill en masse, ni le centrage systématique, ni SF Pro
- Ne pas ajouter des box-shadows superficielles (les élévations se font via contraste de fond)
- Ne pas utiliser des dégradés violet/rose/orange génériques "startup IA"
- Ne pas utiliser d'illustrations stock IA (cerveaux robotiques, réseaux neuronaux candy-colored)
- Ne pas center toutes les headlines sur desktop — certains layouts left-aligned sont plus puissants
- Ne pas animator en boucle du texte ou des titres
- Ne pas utiliser > 3 weights typographiques dans une même section
- Ne pas créer de cards pour absolument tout — les sections éditoriales sans card sont plus premium
- Ne pas mettre de `border` ou `<hr>` entre sections — changer le fond
- Ne pas utiliser SF Pro Display comme font principale

---

## 26. Implementation Rules

### Stack technologique recommandée

```
Framework  : React 19 + Vite
Animation  : Framer Motion
Style      : Tailwind CSS v4 + CSS custom properties
Fonts      : Google Fonts — Space Grotesk + Inter + JetBrains Mono
Icons      : Lucide React (stroke-based, cohérent)
Images     : WebP first, lazy loading
```

### CSS Custom Properties (fichier tokens.css)

```css
:root {
  /* ─── Colors ─── */
  --color-deep-navy:    #05101E;
  --color-navy:         #102740;
  --color-tech-blue:    #1A4066;
  --color-accent:       #359BD9;
  --color-accent-hover: #4AAEE0;
  --color-accent-dim:   #1E6A96;
  --color-silver:       #A5ACB5;
  --color-light-silver: #E0E0E3;
  --color-cool-white:   #F2F4F6;
  --color-white:        #FFFFFF;
  --color-success:      #22C55E;
  --color-warning:      #F59E0B;
  --color-error:        #EF4444;

  /* ─── Surfaces ─── */
  --surface-canvas:     #05101E;
  --surface-panel:      #102740;
  --surface-elevated:   #1A4066;
  --surface-overlay:    rgba(16, 39, 64, 0.90);
  --surface-frosted:    rgba(5, 16, 30, 0.80);
  --surface-glow:       rgba(53, 155, 217, 0.08);

  /* ─── Typography ─── */
  --font-display: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;
  --font-body:    'Inter', 'Helvetica Neue', Arial, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;

  /* ─── Type Scale ─── */
  --text-hero:        80px;
  --text-display:     64px;
  --text-display-md:  48px;
  --text-heading-xl:  40px;
  --text-heading:     32px;
  --text-heading-sm:  24px;
  --text-subheading:  20px;
  --text-body-lg:     18px;
  --text-body:        16px;
  --text-body-sm:     14px;
  --text-label:       13px;
  --text-caption:     12px;
  --text-overline:    11px;
  --text-mono-lg:     18px;
  --text-mono:        14px;
  --text-mono-sm:     13px;

  /* ─── Spacing ─── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  --space-40: 160px;

  /* ─── Border Radius ─── */
  --radius-none: 0px;
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-2xl:  32px;
  --radius-pill: 999px;

  /* ─── Borders ─── */
  --border-subtle: 1px solid rgba(165, 172, 181, 0.12);
  --border-default: 1px solid rgba(165, 172, 181, 0.20);
  --border-strong: 1px solid rgba(165, 172, 181, 0.35);
  --border-accent: 1px solid rgba(53, 155, 217, 0.40);
  --border-accent-strong: 1px solid #359BD9;

  /* ─── Layout ─── */
  --grid-max-width:       1200px;
  --grid-max-width-wide:  1440px;
  --grid-max-width-editorial: 960px;
  --grid-max-width-narrow: 720px;
  --grid-padding-mobile:  24px;
  --grid-padding-tablet:  48px;
  --grid-padding-desktop: 80px;

  /* ─── Animation ─── */
  --transition-fast:   0.18s ease;
  --transition-normal: 0.30s ease;
  --transition-medium: 0.50s ease;
  --transition-slow:   0.70s ease;

  /* ─── Navigation ─── */
  --nav-height: 64px;
  --nav-height-mobile: 56px;
}
```

### Tailwind v4 (@theme)

```css
@theme {
  --color-deep-navy:    #05101E;
  --color-navy:         #102740;
  --color-tech-blue:    #1A4066;
  --color-accent:       #359BD9;
  --color-accent-hover: #4AAEE0;
  --color-accent-dim:   #1E6A96;
  --color-silver:       #A5ACB5;
  --color-light-silver: #E0E0E3;
  --color-cool-white:   #F2F4F6;
  --color-white:        #FFFFFF;
  --color-success:      #22C55E;
  --color-warning:      #F59E0B;
  --color-error:        #EF4444;

  --font-display: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;
  --font-body:    'Inter', 'Helvetica Neue', Arial, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;

  --spacing-1:  4px;
  --spacing-2:  8px;
  --spacing-3:  12px;
  --spacing-4:  16px;
  --spacing-5:  20px;
  --spacing-6:  24px;
  --spacing-8:  32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  --spacing-32: 128px;
  --spacing-40: 160px;

  --radius-none: 0px;
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-2xl:  32px;
  --radius-pill: 999px;
}
```

### Checklist avant chaque composant

- [ ] Contrastes vérifiés (WebAIM)
- [ ] `focus-visible` défini
- [ ] `prefers-reduced-motion` pris en compte
- [ ] Alt text / aria définis
- [ ] Responsive testé mobile/tablet/desktop
- [ ] Tokens utilisés — pas de valeurs hardcodées
- [ ] Pas de `box-shadow` superficielle
- [ ] Pas de `#000000` comme fond
- [ ] Pas de font SF Pro
- [ ] Transitions correctes (Framer Motion ou CSS)

### Structure des fichiers recommandée

```
src/
  styles/
    tokens.css         ← toutes les CSS custom properties
    globals.css        ← reset, base styles, polices
  components/
    ui/                ← Button, Card, Badge, Input, Tag
    layout/            ← Nav, Footer, Container, Section
    sections/          ← Hero, Showcase, Slides, CTA, Features
    portfolio/         ← CaseStudy, ProjectCard, MetricStat
  pages/               ← Home, Services, Realisations, Contact...
  lib/
    motion.ts          ← variants Framer Motion exportés
    utils.ts
```