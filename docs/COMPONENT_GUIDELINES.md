# Components — Cahier des charges détaillé
## CA-TECH · Bibliothèque de composants réutilisables · Version 1.0 · Juillet 2026

> Ce document spécifie chaque composant de l'interface CA-TECH : anatomie, variantes, états, dimensions, couleurs, animations, accessibilité et règles d'usage. Aucun composant ne doit être implémenté sans s'y référer.
>
> Documents de référence : `UX_UI_SPECIFICATION.md` · `STRATEGY.md`

---

## Table des matières

1. [Button](#1-button)
2. [Badge / Tag / Pill](#2-badge--tag--pill)
3. [Card](#3-card)
4. [Section Header](#4-section-header)
5. [Hero](#5-hero)
6. [Input](#6-input)
7. [Textarea](#7-textarea)
8. [Select](#8-select)
9. [Checkbox & Radio](#9-checkbox--radio)
10. [Progress Bar](#10-progress-bar)
11. [Stepper](#11-stepper)
12. [FAQ Accordion](#12-faq-accordion)
13. [Stat / Chiffre clé](#13-stat--chiffre-clé)
14. [Testimonial](#14-testimonial)
15. [Carousel](#15-carousel)
16. [Navigation Header](#16-navigation-header)
17. [Breadcrumb](#17-breadcrumb)
18. [Footer](#18-footer)
19. [Widget Loïc](#19-widget-loïc)
20. [Modal / Dialog](#20-modal--dialog)
21. [Toast / Notification](#21-toast--notification)
22. [Skeleton Screen](#22-skeleton-screen)
23. [Typing Indicator](#23-typing-indicator)
24. [Proof Bar](#24-proof-bar)
25. [Règles transversales](#25-règles-transversales)

---

## 1. Button

### Description

Élément d'action principal. Chaque page n'a qu'un seul `Button primary` visible au premier plan. Les autres actions utilisent des variantes secondaires ou des liens texte.

### Variantes

| Variante | Usage | Fond | Texte | Bordure |
|----------|-------|------|-------|---------|
| `primary` | CTA principal de page | `--color-primary` `#0066FF` | `#FFFFFF` | aucune |
| `secondary` | CTA alternatif | transparent | `--color-primary` | `2px solid --color-primary` |
| `ghost` | Action tertiaire, nav | transparent | `--color-gray-600` | aucune |
| `ghost-white` | Sur fond sombre | transparent | `rgba(255,255,255,0.85)` | `1px solid rgba(255,255,255,0.30)` |
| `white` | CTA sur fond gradient/sombre | `#FFFFFF` | `--color-primary-dark` | aucune |
| `danger` | Action destructive | `--color-error` `#EF4444` | `#FFFFFF` | aucune |

### Tailles

| Taille | Padding H×V | Font-size | Font-weight | Height min | Border-radius |
|--------|-------------|-----------|-------------|-----------|---------------|
| `sm` | `16px × 8px` | `14px` | `500` | `36px` | `--radius-sm` `6px` |
| `md` | `24px × 12px` | `16px` | `500` | `44px` | `--radius-md` `10px` |
| `lg` | `32px × 16px` | `18px` | `600` | `52px` | `--radius-md` `10px` |
| `xl` | `40px × 20px` | `20px` | `600` | `60px` | `--radius-md` `10px` |

> **Taille minimale tactile** : toujours `44px` de hauteur minimum, quelle que soit la taille déclarée (WCAG 2.5.5).

### Anatomie

```
┌────────────────────────────────────────┐
│  [Icône gauche 16px?]  Label  [Icône droite 16px?]  │
└────────────────────────────────────────┘
```

- Icône : optionnelle, `16px` pour `sm`/`md`, `18px` pour `lg`/`xl`
- Gap icône-label : `8px`
- Label : `white-space: nowrap` · texte centré
- Icônes Lucide uniquement · `aria-hidden="true"` sur l'icône

### États

| État | Transformation visuelle | Transition |
|------|------------------------|-----------|
| Repos | Style de base | — |
| Hover | `translateY(-1px)` · shadow intensifiée (`--shadow-blue` pour primary) | `150ms --ease-out` |
| Active/Pressed | `translateY(0)` · shadow réduite | `100ms` |
| Focus | `outline: 2px solid --color-primary; outline-offset: 3px` | `150ms` |
| Loading | Spinner remplace l'icône gauche · label grisé · `cursor: wait` | `150ms` |
| Disabled | `opacity: 0.4` · `cursor: not-allowed` · `pointer-events: none` | — |

**Spinner loading** : cercle `16px` · bordure `2px` · couleur héritée du texte · rotation `360deg` en `700ms` linéaire en boucle.

### Ombres par variante

| Variante | Repos | Hover |
|----------|-------|-------|
| `primary` | `0 2px 8px rgba(0,102,255,0.20)` | `0 4px 16px rgba(0,102,255,0.35)` |
| `white` | `0 2px 8px rgba(0,0,0,0.12)` | `0 4px 16px rgba(0,0,0,0.20)` |
| Autres | aucune | `0 2px 8px rgba(0,0,0,0.08)` |

### Règles d'usage

- `type="button"` explicite hors formulaire (évite les soumissions accidentelles)
- Si le bouton ne contient qu'une icône : `aria-label` descriptif obligatoire
- Jamais deux `Button primary` côte à côte
- Si deux actions côte à côte : `primary` + `ghost-white` OU `primary` + `secondary`
- Micro-copy sous les CTA de conversion : ligne `--text-sm` · `--color-gray-400` · centré

### Exemple de micro-copy

```
[Lancer mon Diagnostic IA →]
Gratuit · Sans engagement · Résultat en 10 min
```

---

## 2. Badge / Tag / Pill

### Description

Éléments de catégorisation, de statut ou d'accent visuel. Toujours accompagnés d'un texte lisible.

### Variantes

| Variante | Usage | Fond | Texte | Bordure |
|----------|-------|------|-------|---------|
| `pill-primary` | Sous-titre de section, catégorie | `--color-primary-light` `#E8F0FF` | `--color-primary` `#0066FF` | aucune |
| `pill-dark` | Sur fond sombre (sections hero) | `rgba(255,255,255,0.12)` | `rgba(255,255,255,0.90)` | `1px solid rgba(255,255,255,0.20)` |
| `tag-service` | Carte cas client, article blog | selon service (voir ci-dessous) | couleur service | aucune |
| `tag-gray` | Tag neutre | `--color-gray-100` | `--color-gray-600` | aucune |
| `badge-new` | Nouveauté produit | `--color-primary` | `#FFFFFF` | aucune |
| `badge-status` | Statut Loïc (en ligne) | `rgba(16,185,129,0.12)` | `#10B981` | aucune |
| `checkmark` | Liste de bénéfices | transparent | hérite | aucune |

**Couleurs par service** (tag-service) :

| Service | Fond | Texte |
|---------|------|-------|
| Intelligence Artificielle | `rgba(0,102,255,0.10)` | `--color-primary` |
| Automatisation | `rgba(245,158,11,0.10)` | `#D97706` |
| SEO | `rgba(16,185,129,0.10)` | `#059669` |
| Développement Web | `rgba(99,102,241,0.10)` | `#4F46E5` |
| Design & Identité | `rgba(236,72,153,0.10)` | `#DB2777` |

### Tailles

| Taille | Padding | Font-size | Border-radius |
|--------|---------|-----------|---------------|
| `sm` | `4px 10px` | `12px` | `--radius-full` |
| `md` | `6px 14px` | `14px` | `--radius-full` |

### Anatomie

```
[● ] Label           ← point coloré optionnel (statut en temps réel)
[Label]              ← tag simple
[✓ Bénéfice]         ← checkmark dans une liste
```

### Règles typographiques pill de section

```
SOUS-TITRE SECTION     ← uppercase · letter-spacing: 0.08em · --text-sm · weight 600
```
Toujours positionné **au-dessus** du H2 de la section, avec `margin-bottom: 12px`.

### Accessibilité

- `aria-label` si le sens dépend uniquement de la couleur
- Ne jamais utiliser un badge comme seul moyen de communiquer une information critique

---

## 3. Card

### Description

Conteneur réutilisable pour regrouper des informations liées. La carte entière est cliquable si elle contient un lien unique.

### Variantes

| Variante | Usage |
|----------|-------|
| `default` | Service, feature, article de blog |
| `highlight` | Carte premium mise en avant (pricing recommandé) |
| `horizontal` | Étude de cas, témoignage long |
| `stat` | Chiffre clé, KPI section |
| `agent` | Présentation d'un agent IA |
| `case-study` | Résultat client (KPI + secteur) |
| `blog` | Aperçu article de blog |

### Anatomie — Card `default`

```
┌──────────────────────────────────────────┐
│  [Icône 40px · --color-primary]          │  padding-bottom 16px
│  [Badge optionnel]                       │
│                                          │
│  Titre                                   │  --text-2xl · weight 600 · --color-gray-900
│                                          │  margin-top 12px
│  Description sur 2 à 3 lignes max.      │  --text-base · --color-gray-600 · line-height 1.6
│                                          │  margin-top 8px
│  Lien → texte d'action                   │  --text-base · --color-primary · weight 500
│                                          │  margin-top 16px
└──────────────────────────────────────────┘
```

- Fond : `--color-white`
- Bordure : `1px solid --color-gray-200` (seulement sur fond blanc — pas sur `--color-gray-50`)
- `--shadow-sm` · `--radius-lg` `16px` · `padding: 28px 28px`
- Hover : `--shadow-md` · `translateY(-4px)` · transition `250ms --ease-out`
- Flèche du lien : `translateX(4px)` au hover card

### Anatomie — Card `highlight`

```
┌──────────────────────────────────────────┐  ← border: 2px solid --color-primary
│  [Badge "Recommandé" · pill-primary]     │
│                                          │
│  Titre                                   │  --text-2xl · weight 700
│  Sous-titre                              │  --text-base · --color-gray-600
│                                          │
│  ✓ Bénéfice 1                           │
│  ✓ Bénéfice 2                           │
│  ✓ Bénéfice 3                           │
│                                          │
│  [Button primary lg · pleine largeur]    │
└──────────────────────────────────────────┘
```

- Fond : `--color-primary-light` `#E8F0FF`
- `--shadow-blue` · `--radius-lg`

### Anatomie — Card `case-study`

```
┌──────────────────────────────────────────┐
│  [Tag service]      [Secteur · --text-sm]│
│                                          │
│  Titre du projet                         │  --text-xl · weight 600
│                                          │
│  ┌──────────┬──────────┬──────────┐     │
│  │  +240%   │  -14h    │   ×3.4  │     │  --text-3xl · weight 800 · --color-primary
│  │  leads   │ /semaine │  trafic │     │  --text-sm · --color-gray-600
│  └──────────┴──────────┴──────────┘     │
│                                          │
│  Durée projet · [Lire l'étude de cas →] │  --text-sm · --color-gray-400
└──────────────────────────────────────────┘
```

- KPI séparés par `|` (`--color-gray-200`) · `gap: 24px`

### Anatomie — Card `blog`

```
┌──────────────────────────────────────────┐
│  [Image 16:9 · --radius-md en haut]     │
│                                          │
│  [Tag service]  [Temps de lecture]       │  padding: 20px 20px 24px
│                                          │
│  Titre de l'article                      │  --text-xl · weight 600 · 2 lignes max
│                                          │
│  Extrait sur 2 lignes…                   │  --text-sm · --color-gray-600
│                                          │
│  [Avatar auteur 24px]  Prénom · Date     │  --text-xs · --color-gray-400
└──────────────────────────────────────────┘
```

- Image : `aspect-ratio: 16/9` · `object-fit: cover` · `--radius-md` sur les coins haut uniquement
- `loading="lazy"` · `alt` descriptif

### Anatomie — Card `agent`

```
┌──────────────────────────────────────────┐
│  [Gradient --color-primary · 80px high]  │  en-tête coloré
│  [Icône agent 36px · blanc · centré]     │
│                                          │
│  Nom de l'agent                          │  --text-xl · weight 700
│  [Badge statut : ● Disponible]           │
│                                          │
│  Description courte                      │  --text-base · --color-gray-600
│                                          │
│  ✓ Capacité 1                           │
│  ✓ Capacité 2                           │
│  ✓ Capacité 3                           │
│                                          │
│  [Essayer l'agent →]   (Button primary)  │
└──────────────────────────────────────────┘
```

### Règles communes à toutes les cards

- La card entière est cliquable si elle n'a qu'un seul lien interne (`cursor: pointer`)
- `focus-within` : outline sur la card si un élément interne est focusé
- Jamais de lien imbriqué dans un lien
- `<article>` pour les cards blog et cas client · `<div>` pour les autres
- `alt` non vide sur toutes les images de cards

---

## 4. Section Header

### Description

Bloc réutilisable systématiquement placé en tête de chaque section majeure. Structure la hiérarchie visuelle de la page.

### Anatomie

```
[Pill badge]                          ← pill-primary · toujours en premier
[H2 — titre principal]                ← --text-4xl desktop / --text-3xl mobile · weight 700
[Paragraphe d'accroche optionnel]     ← --text-lg · --color-gray-600 · max-width 560px
```

### Variantes d'alignement

| Variante | Usage | Alignement |
|----------|-------|-----------|
| `centered` | Sections grille symétrique (stats, expertises, témoignages) | Centré |
| `left` | Sections avec contenu asymétrique (50/50, sidebar) | Gauche |
| `white-on-dark` | Sections sur fond sombre (hero Loïc, CTA final) | Centré · texte blanc |

### Espacement

- Pill → H2 : `margin-bottom: 12px`
- H2 → Paragraphe : `margin-bottom: 16px`
- Section Header → Premier élément de contenu : `margin-bottom: 48px` desktop / `32px` mobile

### Règles

- Pill : toujours `pill-primary` sur fond clair · `pill-dark` sur fond sombre
- H2 : jamais plus de 2 lignes (max-width `640px` sur variant centered)
- Paragraphe : jamais plus de 2 lignes (max-width `560px`)
- Ne jamais sauter la pill — elle donne le contexte SEO et visuel

---

## 5. Hero

### Description

Section d'accroche unique par page. Première impression. Doit communiquer la promesse principale en moins de 3 secondes.

### Variantes

| Variante | Usage | Fond |
|----------|-------|------|
| `homepage` | Homepage uniquement | `--gradient-primary` + glow |
| `service` | Pages service, pages ville | Blanc ou `--color-gray-50` |
| `dark` | Page Loïc, pages thématiques IA | `--color-primary-dark` |
| `minimal` | Blog, contact, à propos | Blanc · hauteur réduite |

### Anatomie — Hero `homepage`

```
┌──────────────────────────────────────────────────────────────┐
│  FOND : gradient-primary + glow radial gauche                │
│  PADDING : 160px haut desktop / 120px mobile                 │
│                                                              │
│  [Pill badge dark]                 [Illustration Loïc]       │
│  [H1 · --text-7xl · weight 900 · blanc]                     │
│  [Sous-titre · --text-xl · rgba(255,255,255,0.80)]          │
│  [Groupe CTA : Button white xl + Button ghost-white xl]      │
│  [Micro-copy · --text-sm · rgba(255,255,255,0.60)]          │
└──────────────────────────────────────────────────────────────┘
```

**Layout** : `display: grid; grid-template-columns: 55fr 45fr; gap: 64px` desktop · stack mobile.

### Anatomie — Hero `service`

```
┌──────────────────────────────────────────────────────────────┐
│  FOND : blanc · PADDING : 96px haut / 80px bas              │
│                                                              │
│  [Breadcrumb]                                                │
│  [Pill badge primary]                                        │
│  [H1 · --text-6xl · weight 800 · --color-gray-900]         │
│  [Sous-titre · --text-lg · --color-gray-600 · max-w 540px] │
│  [Button primary lg]                                         │
│                                                              │
│  [3 stats inline]                                            │
│  Stat 1  |  Stat 2  |  Stat 3                               │
└──────────────────────────────────────────────────────────────┘
```

**Stats inline** : `--text-2xl` weight `700` `--color-primary` · label `--text-sm` `--color-gray-600` · séparateurs `|` `--color-gray-200`.

### Anatomie — Hero `dark`

```
┌──────────────────────────────────────────────────────────────┐
│  FOND : --color-primary-dark + glow radial                  │
│  PADDING : 128px haut / 96px bas                            │
│                                                              │
│  [Pill badge dark]                                           │
│  [H1 · --text-6xl · weight 800 · blanc]                    │
│  [Sous-titre · --text-lg · rgba(255,255,255,0.80)]         │
│  [Button white lg]                                           │
│  [Micro-copy · rgba(255,255,255,0.55) · --text-sm]         │
└──────────────────────────────────────────────────────────────┘
```

### Anatomie — Hero `minimal`

```
┌──────────────────────────────────────────────────────────────┐
│  FOND : blanc · PADDING : 64px haut / 40px bas             │
│                                                              │
│  [Breadcrumb]                                                │
│  [H1 · --text-5xl · weight 800]                            │
│  [Sous-titre · --text-lg · --color-gray-600]               │
└──────────────────────────────────────────────────────────────┘
```

### Règles communes

- Un seul `<h1>` par page, dans le hero
- L'image hero (si présente) porte `fetchpriority="high"` + `loading="eager"`
- `width` et `height` définis sur toutes les images pour éviter le CLS
- Pas d'animation bloquante sur le hero (FCP prioritaire)

---

## 6. Input

### Description

Champ de saisie texte. Toujours accompagné d'un label visible — jamais placeholder seul.

### Anatomie

```
[Label]                          ← --text-sm · weight 500 · --color-gray-700 · margin-bottom 6px
[Input field]                    ← hauteur 44px · --text-base · --color-gray-900
[Message aide ou erreur]         ← --text-sm · margin-top 6px
```

### États

| État | Fond | Bordure | Ombre |
|------|------|---------|-------|
| Repos | `--color-gray-100` | `1px solid --color-gray-200` | aucune |
| Hover | `--color-gray-50` | `1px solid --color-gray-300` | aucune |
| Focus | `#FFFFFF` | `2px solid --color-primary` | `0 0 0 3px rgba(0,102,255,0.15)` |
| Rempli (valid) | `#FFFFFF` | `1px solid --color-gray-200` | aucune |
| Succès | `#FFFFFF` | `1px solid --color-success` | `0 0 0 3px rgba(16,185,129,0.12)` |
| Erreur | `#FFFFFF` | `2px solid --color-error` | `0 0 0 3px rgba(239,68,68,0.12)` |
| Disabled | `--color-gray-50` | `1px solid --color-gray-200` | aucune |

### Styles fixes

- Border-radius : `--radius-sm` `6px`
- Padding : `12px 16px`
- Hauteur : `44px` (minimum WCAG)
- Transition : `border-color, box-shadow 150ms --ease-out`
- Icône optionnelle gauche ou droite : `20px` · `--color-gray-400`
- Icône succès (droite) : `Check` Lucide · `--color-success`
- Icône erreur (droite) : `AlertCircle` Lucide · `--color-error`

### Message d'erreur

```
[⚠ Message d'erreur explicite et actionnable]
```
- `--text-sm` · `--color-error` · weight `500`
- Icône `AlertCircle` `14px` avant le texte
- `aria-describedby` liant le champ à son message
- `aria-invalid="true"` sur le champ en erreur
- Apparaît immédiatement sous le champ, pas dans une alerte globale

### Types et `inputmode`

| Usage | Type HTML | `inputmode` | `autocomplete` |
|-------|-----------|-------------|----------------|
| Email | `email` | `email` | `email` |
| Téléphone | `tel` | `tel` | `tel` |
| Prénom | `text` | `text` | `given-name` |
| Nom | `text` | `text` | `family-name` |
| Entreprise | `text` | `text` | `organization` |
| Numérique | `number` | `numeric` | — |

### Champs requis

- Marqueur visuel : astérisque rouge `*` après le label (`--color-error`) + `aria-required="true"` + `required`
- Jamais de marqueur sur les champs optionnels — indiquer "(optionnel)" en texte clair si ambigu

---

## 7. Textarea

### Description

Champ de saisie multi-lignes pour les messages et descriptions.

### Anatomie

```
[Label]
┌──────────────────────────────────────┐
│                                      │
│                                      │  hauteur min 120px · resize: vertical
│                                      │
└──────────────────────────────────────┘
[Compteur de caractères optionnel]         ← --text-xs · --color-gray-400 · aligné droite
[Message aide ou erreur]
```

### Styles

- Mêmes états que `Input`
- Padding : `12px 16px`
- `resize: vertical` uniquement (jamais `horizontal`)
- `line-height: 1.6`
- `min-height: 120px` · `max-height: 400px`
- Font : hérite de la page (Inter, --text-base) — ne pas utiliser la police monospace

---

## 8. Select

### Description

Remplacement du `<select>` natif (UX médiocre sur iOS). Composant custom avec accessibilité complète.

### Anatomie

```
[Label]
┌──────────────────────────────────────┐
│  Option sélectionnée          [▼]   │  ← chevron Lucide `ChevronDown`
└──────────────────────────────────────┘

[Dropdown ouvert]
┌──────────────────────────────────────┐
│  Option 1                            │  ← hover: fond --color-primary-light
│  Option 2                      [✓]  │  ← sélectionnée: check + --color-primary
│  Option 3                            │
└──────────────────────────────────────┘
```

### Comportement

- Ouverture : click sur le champ · `Enter`/`Space` au focus clavier
- Navigation : `↑` `↓` dans la liste · `Enter` pour sélectionner · `Escape` pour fermer
- Fermeture : clic extérieur · sélection · `Escape`
- Animation dropdown : `opacity 0→1` + `translateY(-4px→0)` en `150ms`

### Accessibilité

- `role="combobox"` sur le trigger
- `aria-haspopup="listbox"` + `aria-expanded`
- `role="listbox"` sur la liste · `role="option"` sur chaque item
- `aria-selected="true"` sur l'option active

### Alternative formulaire mobile

Sur les formulaires de diagnostic et devis, préférer des **boutons de choix visuels** (cards cliquables) au select pour les choix à options limitées (< 6 options). Le select est réservé aux listes longues (> 6 options).

---

## 9. Checkbox & Radio

### Description

Composants custom remplaçant les éléments natifs pour un rendu cohérent avec le design system.

### Anatomie Checkbox

```
[☐] Label texte              ← repos : bordure --color-gray-300 · fond --color-gray-100
[☑] Label texte              ← coché : fond --color-primary · check blanc
```

- Taille : `20px × 20px` · `--radius-sm`
- Gap label : `10px`
- Zone cliquable : `44px min` (label inclus)
- Transition : `background, border 150ms`

### Anatomie Radio

```
(○) Option A
(●) Option B    ← sélectionné : cercle interne --color-primary
(○) Option C
```

- Taille : `20px × 20px` · `--radius-full`
- Cercle interne : `10px` · `--color-primary`

### Variante Cards cliquables (formulaires)

Pour les formulaires multi-étapes (diagnostic IA, devis) :

```
┌────────────────┐  ┌────────────────┐
│  [Icône]       │  │  [Icône]       │
│  Label option  │  │  Label option  │  ← sélectionnée : bordure --color-primary 2px
│                │  │            [✓] │     fond --color-primary-light
└────────────────┘  └────────────────┘
```

- Fond repos : `--color-white` · bordure `1px solid --color-gray-200`
- Fond sélectionné : `--color-primary-light` · bordure `2px solid --color-primary`
- `--radius-md` · padding `16px 20px`
- Transition `150ms`

### Accessibilité

- `<input type="checkbox/radio">` natif visuellement masqué (`clip`, pas `display:none`)
- Styles appliqués via `+` ou `~` en CSS sur le sibling visuel
- Label toujours associé via `<label for>`
- Groupe radio : `role="radiogroup"` + `aria-labelledby`

---

## 10. Progress Bar

### Description

Indicateur de progression pour les formulaires multi-étapes. Toujours visible en haut du formulaire.

### Anatomie

```
Étape 2 sur 4
┌────────────────────────────────────────┐
│ ██████████████░░░░░░░░░░░░░░░░░░░░░░░ │  50%
└────────────────────────────────────────┘
```

### Styles

- Label "Étape X sur Y" : `--text-sm` · weight `500` · `--color-gray-600` · `margin-bottom: 8px`
- Barre conteneur : `height: 6px` · fond `--color-gray-200` · `--radius-full`
- Remplissage : fond `--color-primary` · `--radius-full` · `transition: width 400ms --ease-out`
- Pas de texte de pourcentage dans la barre (trop petit à lire)

### Accessibilité

```html
<div role="progressbar"
     aria-valuenow="2"
     aria-valuemin="1"
     aria-valuemax="4"
     aria-label="Étape 2 sur 4">
```

---

## 11. Stepper

### Description

Indicateur visuel des étapes d'un processus. Utilisé sur les pages service et dans les sections "Comment ça marche".

### Variantes

| Variante | Usage | Layout |
|----------|-------|--------|
| `horizontal` | Sections processus desktop | Horizontal, ligne de connexion |
| `vertical` | Mobile, formulaires | Vertical, ligne gauche |
| `numbered` | Processus sans icônes | Cercles numérotés uniquement |
| `icon` | Processus avec icônes Lucide | Cercles + icônes |

### Anatomie — Stepper `horizontal`

```
     ①──────────────②──────────────③──────────────④
     │              │              │              │
  [Icône]        [Icône]        [Icône]        [Icône]
  Titre 1        Titre 2        Titre 3        Titre 4
  Description    Description    Description    Description
  courte         courte         courte         courte
```

**Cercle numéroté**
- Taille : `48px × 48px` · `--radius-full`
- Repos (inactif) : fond `--color-gray-200` · texte `--color-gray-400`
- Actif : fond `--color-primary` · texte blanc
- Complété : fond `--color-success` · icône `Check` blanc

**Ligne de connexion**
- `height: 2px` · fond `--color-gray-200`
- Positionnée à `24px` du haut (centre du cercle)
- Largeur : occupe l'espace entre deux cercles

**Contenu sous le cercle**
- Icône : `28px` · `--color-primary` · `margin-top: 16px`
- Titre : `--text-xl` · weight `600` · `--color-gray-900` · `margin-top: 8px`
- Description : `--text-base` · `--color-gray-600` · `max-width: 180px` · `text-align: center`

### Anatomie — Stepper `vertical` (mobile)

```
①  Titre 1
│   Description courte
│
②  Titre 2
│   Description courte
│
③  Titre 3
    Description courte
```

- Ligne verticale à gauche : `width: 2px` · `--color-gray-200` · `margin-left: 23px`
- Cercle : `48px` · même styles que horizontal
- Titre et description : `margin-left: 64px`

### Animation

Entrée stagger `fadeUp` : délai `+100ms` par étape, déclenché à l'entrée dans le viewport.

---

## 12. FAQ Accordion

### Description

Liste de questions-réponses avec ouverture/fermeture. Génère des rich results Google (`FAQPage`).

### Anatomie

```
┌──────────────────────────────────────────────────────┐
│  Question — --text-lg · weight 600                [+]│  ← Lucide `Plus` 20px
│                                                      │
│  (Réponse masquée)                                   │
└──────────────────────────────────────────────────────┘
                    ↓ ouvert
┌──────────────────────────────────────────────────────┐
│  Question — --text-lg · weight 600                [×]│  ← Lucide `X` ou rotation 45°
│ ────────────────────────────────────────────────── │
│  Réponse complète sur plusieurs lignes.              │
│  --text-base · --color-gray-600 · line-height 1.7   │
│  padding: 16px 0 20px                               │
└──────────────────────────────────────────────────────┘
```

### Comportement

- **Exclusif** : un seul item ouvert à la fois. L'ouverture d'un item ferme le précédent.
- Animation ouverture : `max-height: 0 → max-height: calculée` + `opacity: 0 → 1` en `250ms --ease-out`
- Animation fermeture : `250ms --ease-in-out`
- Icône `+` : `rotate(0deg) → rotate(45deg)` à l'ouverture en `250ms`
- Séparateur entre items : `1px solid --color-gray-200`

### Styles

- Item : padding `20px 0` · pas de fond particulier
- Question au repos : `--color-gray-900` · hover `--color-primary`
- Transition couleur question : `150ms`
- `cursor: pointer` sur l'item entier

### Accessibilité

Deux implémentations acceptées :

**Option A — `<details>/<summary>` natif**
```html
<details>
  <summary>Question ?</summary>
  <p>Réponse.</p>
</details>
```

**Option B — ARIA pattern**
```html
<div>
  <button aria-expanded="false" aria-controls="faq-1-answer" id="faq-1-btn">
    Question ?
  </button>
  <div id="faq-1-answer" role="region" aria-labelledby="faq-1-btn" hidden>
    <p>Réponse.</p>
  </div>
</div>
```

### Schema.org FAQPage

Injecté en `<script type="application/ld+json">` :
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Réponse complète."
      }
    }
  ]
}
```

### Règles de contenu

- Minimum 6 questions par section FAQ · maximum 12
- Questions formulées comme le ferait un vrai utilisateur (recherche vocale)
- Réponses : 2 à 5 phrases max · concrètes · sans jargon

---

## 13. Stat / Chiffre clé

### Description

Mise en valeur d'un indicateur chiffré. Animé à l'entrée dans le viewport.

### Anatomie

```
┌────────────────────────────┐
│  [Icône 32px · primary]    │
│                            │
│  +240%                     │  ← valeur · --text-5xl · weight 800 · --color-primary
│  de leads générés          │  ← label ligne 1 · --text-base · --color-gray-600
│  en moyenne                │  ← label ligne 2 (optionnel)
└────────────────────────────┘
```

### Variante inline (dans hero service)

```
+240%          |          72h          |          +50
de leads       |    premier livrable   |     clients actifs
```
- Séparateurs `|` : `--color-gray-200` · hauteur `32px` · centré verticalement
- Layout : `flex row` · `gap: 32px`

### Animation countUp

- Déclenchée par `IntersectionObserver` au seuil `0.3`
- Durée : `1200ms` · `ease-out` (décélération vers la valeur finale)
- Valeurs décimales arrondies à 0 chiffre pendant l'animation, affichage de la valeur exacte à la fin
- Préfixes/suffixes (`+`, `%`, `×`) apparaissent directement (pas animés)
- `prefers-reduced-motion: reduce` → valeur finale affichée sans animation

### Accessibilité

- Valeur finale présente dans le DOM dès le rendu initial (pour les crawlers et lecteurs d'écran)
- L'animation countUp est une **sur-couche visuelle** — ne pas mettre `aria-live` (trop verbeux)
- Icône : `aria-hidden="true"` (décorative)

---

## 14. Testimonial

### Description

Citation client avec attribution nominative. Renforce la confiance et la preuve sociale.

### Anatomie

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  ❝                                                     │  guillemet décoratif · --text-7xl · --color-primary-light · opacity 0.6
│                                                        │
│  « Citation percutante et authentique,                 │  --text-xl · --color-gray-900 · font-style: italic · line-height 1.6
│    sur une, deux ou trois lignes maximum. »            │  max-width: 680px
│                                                        │
│  [Photo 48px]   Prénom Nom                             │  avatar · --radius-full · object-fit:cover
│                 Poste, Entreprise SAS                  │  --text-base · weight 600 · --color-gray-900
│  [★★★★★]       [LinkedIn ↗]                           │  --text-sm · --color-gray-600
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Styles

- Fond : `--color-gray-50` · `--radius-xl` · `padding: 40px 48px` desktop / `28px 24px` mobile
- Étoiles : `--color-primary` `★★★★★` · `--text-sm`
- Lien LinkedIn : `--text-sm` · `--color-primary` · `opacity: 0.7` · hover `opacity: 1`
- Photo auteur : `48px × 48px` · `--radius-full` · `border: 2px solid --color-white`

### Variante compacte (dans carousel)

Max-width `720px` · centré dans le container.

### Variante horizontale (hors carousel)

```
[Photo 64px]   [★★★★★]
Prénom Nom     « Citation courte sur une ligne »
Poste, Co.
```
Pour les sections avec 3 témoignages côte à côte.

---

## 15. Carousel

### Description

Composant de défilement horizontal pour témoignages, pricing cards ou galeries.

### Variantes

| Variante | Usage |
|----------|-------|
| `testimonials` | Section témoignages |
| `cards` | Pricing mobile, cas clients mobile |
| `images` | Galerie portfolio |

### Anatomie

```
[← Précédent]   [Contenu actif]   [Suivant →]

              ○ ● ○ ○ ○              ← dots indicateurs
```

### Comportement

| Action | Déclencheur |
|--------|------------|
| Slide suivant | Bouton `→` · swipe gauche · touche `→` · auto-advance |
| Slide précédent | Bouton `←` · swipe droit · touche `←` |
| Pause auto | Hover (desktop) · touch start (mobile) |
| Reprise auto | Mouse leave · touch end |
| Auto-advance | Toutes les `6000ms` (témoignages) |

### Transitions

- Témoignages : crossfade `opacity 0→1` en `400ms`
- Cards : `translateX` avec `overflow: hidden` en `300ms --ease-out`

### Boutons prev/next

- Taille : `44px × 44px` · `--radius-full`
- Fond : `--color-white` · `--shadow-md`
- Icônes : `ChevronLeft` / `ChevronRight` (Lucide) · `20px` · `--color-gray-600`
- Hover : fond `--color-gray-50` · icône `--color-gray-900`
- Masqués sur mobile si swipe disponible (ou repositionnés sous le contenu)

### Dots indicateurs

- Taille : `8px × 8px` · `--radius-full`
- Inactif : `--color-gray-300`
- Actif : `--color-primary` · largeur `24px` (pill) · transition `width 300ms`

### Accessibilité

```html
<section role="region" aria-label="Témoignages clients" aria-roledescription="carousel">
  <div aria-live="polite" aria-atomic="false">
    <!-- slide actif -->
  </div>
  <button aria-label="Témoignage précédent">←</button>
  <button aria-label="Témoignage suivant">→</button>
  <div role="tablist">
    <button role="tab" aria-selected="true" aria-label="Témoignage 1 sur 5"></button>
    ...
  </div>
</section>
```

---

## 16. Navigation Header

### Description

Barre de navigation principale. Sticky, adaptative au scroll, responsive.

### Anatomie desktop

```
┌────────────────────────────────────────────────────────────────┐
│  [Logo CA-TECH]   Services ▾   Loïc   Réalisations   Blog   [Diagnostic IA →]  │
└────────────────────────────────────────────────────────────────┘
```

- Hauteur : `72px`
- Layout : `display: flex; justify-content: space-between; align-items: center`
- Logo : `max-width: 130px` · SVG inline ou `<img>` avec `alt="CA-TECH"`

### Anatomie mobile

```
┌────────────────────────────────────┐
│  [Logo]                     [☰]   │
└────────────────────────────────────┘
```

- Hauteur : `60px`
- Bouton hamburger : `44px × 44px` · icône `Menu` (Lucide) `24px`

### États du header

| Scroll | Fond | Texte links | Ombre |
|--------|------|-------------|-------|
| Top (sur hero sombre) | `transparent` | `rgba(255,255,255,0.85)` | aucune |
| > 60px | `rgba(255,255,255,0.92)` + `backdrop-filter: blur(12px)` | `--color-gray-700` | `0 1px 0 rgba(0,0,0,0.08)` |

Transition : `background, backdrop-filter, box-shadow 200ms --ease-in-out`.

### Liens de navigation

- `--text-base` · weight `500` · `--color-gray-700`
- Hover : `--color-gray-900` · underline `2px solid --color-primary` slide in (width 0→100%)
- Page active : `--color-primary` · underline visible

### Dropdown "Services"

```
┌────────────────────────────────────────────────────┐
│  🤖 Intelligence Artificielle   ⚡ Automatisation  │
│  Agents IA, copilotes, RAG     Workflows, scripts  │
│                                                    │
│  📈 SEO                         💻 Dev Web         │
│  Audits, piliers, local        Sites, apps métier  │
│                                                    │
│  🎨 Design & Identité                              │
│  Logos, chartes, flyers                            │
└────────────────────────────────────────────────────┘
```

- Largeur : `520px` · `--shadow-lg` · `--radius-lg` · fond `--color-white`
- Padding : `24px` · grille 2 colonnes · `gap: 4px`
- Chaque item : `padding: 12px 16px` · `--radius-md` · hover fond `--color-gray-50`
- Item titre : `--text-base` · weight `600` · `--color-gray-900`
- Item desc : `--text-sm` · `--color-gray-500`
- Animation : `opacity 0→1` + `translateY(-8px→0)` en `200ms --ease-out`
- Déclenchement : `hover` ET `focus` sur le bouton "Services"

### Drawer mobile

- Largeur : `min(320px, 80vw)` · fond `--color-white` · `--shadow-lg`
- Animation : `translateX(100%→0)` en `300ms --ease-out`
- Overlay fond : `rgba(0,0,0,0.4)` · `opacity 0→1` en `300ms`
- Fermeture : bouton `×` · clic overlay · swipe droite · `Escape`
- Liens : hauteur `48px` min · `--text-lg` · weight `500` · padding `0 24px`
- Séparateurs : `1px solid --color-gray-100`
- CTA en bas : `Button primary lg` · `margin: 16px`
- Focus trap : actif tant que le drawer est ouvert

### Accessibilité header

```html
<header role="banner">
  <a href="/" aria-label="CA-TECH — Retour à l'accueil">
    [Logo]
  </a>
  <nav aria-label="Navigation principale">
    <button aria-haspopup="true" aria-expanded="false">
      Services
    </button>
    <!-- dropdown -->
    <a href="/loic">Loïc</a>
    ...
  </nav>
  <button aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu">
    [☰]
  </button>
  <nav id="mobile-menu" aria-label="Menu mobile" hidden>
    <!-- drawer -->
  </nav>
</header>
```

---

## 17. Breadcrumb

### Description

Fil d'Ariane présent sur toutes les pages sauf la homepage. Améliore l'orientation et le SEO.

### Anatomie

```
Accueil  /  Intelligence Artificielle  /  Conseil IA Paris
  ↑               ↑                            ↑
lien active    lien active              texte (non cliquable)
```

### Styles

- `--text-sm` · `--color-gray-400`
- Séparateur `/` : `margin: 0 8px` · `--color-gray-300`
- Liens : `--color-gray-500` · hover `--color-primary`
- Dernier item (page courante) : `--color-gray-900` · non cliquable · `aria-current="page"`
- Icône optionnelle : `Home` (Lucide) `14px` avant "Accueil"
- `margin-bottom: 24px` avant le H1

### Schema.org BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://ca-tech.fr/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Intelligence Artificielle",
      "item": "https://ca-tech.fr/intelligence-artificielle"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Conseil IA Paris"
    }
  ]
}
```

### Accessibilité

```html
<nav aria-label="Fil d'Ariane">
  <ol>
    <li><a href="/">Accueil</a></li>
    <li><a href="/intelligence-artificielle">Intelligence Artificielle</a></li>
    <li aria-current="page">Conseil IA Paris</li>
  </ol>
</nav>
```

---

## 18. Footer

### Description

Pied de page global présent sur toutes les pages. Fond sombre, liens clairs.

### Anatomie desktop (4 colonnes)

```
┌──────────────┬───────────────┬────────────┬──────────────┐
│ [Logo blanc] │ Expertises    │ Villes     │ Contact      │
│              │               │            │              │
│ Slogan       │ IA            │ Paris      │ Email        │
│              │ Automatisation│ Lyon       │ LinkedIn     │
│ Description  │ SEO           │ Dijon      │ Téléphone    │
│ courte 2-3   │ Dev Web       │ Troyes     │              │
│ lignes       │ Design        │            │ [LinkedIn →] │
└──────────────┴───────────────┴────────────┴──────────────┘
────────────────────────────────────────────────────────────
  © 2026 CA-TECH    Mentions légales    CGV    Confidentialité
```

### Anatomie mobile (stack vertical)

Logo + Slogan → Liens 2 colonnes → Légal → Copyright

### Styles

- Fond : `--color-gray-900` `#111827`
- Texte courant : `rgba(255,255,255,0.70)`
- Titres colonnes : `--text-sm` · uppercase · `letter-spacing: 0.08em` · `rgba(255,255,255,0.40)` · `margin-bottom: 16px`
- Liens : `--text-sm` · `rgba(255,255,255,0.70)` · hover `rgba(255,255,255,1)` · transition `150ms`
- Logo : version blanche SVG · `max-width: 110px`
- Slogan sous logo : `--text-sm` · `rgba(255,255,255,0.55)` · `margin-top: 12px` · `max-width: 200px`
- Séparateur barre inférieure : `1px solid rgba(255,255,255,0.08)` · `margin: 32px 0 24px`
- Copyright : `--text-xs` · `rgba(255,255,255,0.40)`
- Padding section : `64px 0 40px`

### Accessibilité

```html
<footer role="contentinfo">
  <nav aria-label="Navigation footer — Expertises">…</nav>
  <nav aria-label="Navigation footer — Villes">…</nav>
  <nav aria-label="Navigation footer — Contact">…</nav>
  <nav aria-label="Navigation légale">…</nav>
</footer>
```

---

## 19. Widget Loïc

### Description

Interface de chat persistante accessible sur toutes les pages. Point d'entrée conversationnel principal vers Loïc.

### Anatomie — État fermé

```
                     ┌──────────────────────┐
                     │   [Avatar / 💬 icon] │  56px · --radius-full
                     │   [Badge notif ●]    │  16px · fond --color-error · top-right
                     └──────────────────────┘
                     « Parler à Loïc »         ← tooltip hover desktop
```

- Position : `fixed bottom-24px right-24px` (au-dessus du cookie banner éventuel)
- Fond bouton : `--color-primary`
- Ombre : `--shadow-blue`
- Icône : `MessageCircle` (Lucide) `24px` · blanc

### Anatomie — État ouvert (desktop)

```
         ┌────────────────────────────────┐
         │ 🔵 Loïc — Consultant IA   [×] │  ← header · fond --color-primary · height 56px
         │ ────────────────────────────── │
         │                               │
         │  [Zone messages scrollable]   │  ← hauteur variable · max 360px
         │                               │
         │ ────────────────────────────── │
         │ [Input]                  [→] │  ← footer · height 56px
         └────────────────────────────────┘
```

- Largeur : `340px`
- Hauteur totale : `480px`
- Position : `fixed bottom-96px right-24px`
- Fond : `--color-white`
- `--shadow-lg` · `--radius-xl`
- Animation ouverture : `scale(0.85) translateY(16px) opacity(0)` → `scale(1) translateY(0) opacity(1)` en `250ms --ease-spring`

### Anatomie — État ouvert (mobile)

- `position: fixed; inset: 0` (plein écran)
- Z-index : plus élevé que le header
- Bouton fermer `×` : `44px` · `position: absolute top-16px right-16px`
- Animation : `translateY(100%) → translateY(0)` en `300ms --ease-out`

### Header du widget

- Fond : `--color-primary`
- Avatar Loïc : `32px` · `--radius-full`
- Nom : « Loïc — Consultant IA » · `--text-sm` · weight `600` · blanc
- Sous-texte : « ● En ligne · Répond en quelques secondes » · `--text-xs` · `rgba(255,255,255,0.75)`
- Bouton `×` : `24px` · blanc · hover `rgba(255,255,255,0.8)`

### Zone messages

- Scroll vertical uniquement
- Padding : `16px`
- Gap entre messages : `12px`
- Bulle Loïc : fond `--color-gray-100` · `--color-gray-900` · `--radius-lg` radius bas-gauche réduit · `max-width: 85%` · alignée gauche
- Bulle Utilisateur : fond `--color-primary` · blanc · `--radius-lg` radius bas-droit réduit · `max-width: 85%` · alignée droite
- Horodatage : `--text-xs` · `--color-gray-400` · centré entre groupes de messages

### Input

- Fond : `--color-gray-50` · bordure `1px solid --color-gray-200`
- Placeholder : « Écrivez votre message… »
- Bouton envoi : `Button primary sm` · icône `Send` · `aria-label="Envoyer"`
- `Enter` envoie · `Shift+Enter` retour à la ligne

### Comportement

- Ne s'ouvre **jamais** automatiquement (pas d'auto-popup)
- S'ouvre au clic sur le bouton flottant
- S'ouvre au clic sur les CTA "Démarrer avec Loïc" des pages
- Persiste entre navigations (pas de re-render)
- Badge rouge si Loïc a envoyé un message proactif non lu
- Focus trap actif quand ouvert · `Escape` ferme

### Accessibilité

```html
<div role="dialog"
     aria-modal="true"
     aria-label="Assistant Loïc — Consultant IA"
     aria-live="polite">
  <!-- contenu -->
</div>
<button aria-label="Ouvrir le chat avec Loïc"
        aria-expanded="false/true">
  <!-- bouton flottant -->
</button>
```

---

## 20. Modal / Dialog

### Description

Superposition plein écran pour les contenus qui nécessitent l'attention exclusive de l'utilisateur. Usage limité — préférer les pages dédiées.

### Usage autorisé

- Confirmation d'action critique (suppression, envoi définitif)
- Aperçu d'image ou vidéo en plein écran
- Formulaire court (< 3 champs) déclenchable depuis une card

### Anatomie

```
┌──── Overlay rgba(0,0,0,0.5) ────────────────────────────────┐
│                                                              │
│         ┌──────────────────────────────────┐               │
│         │  [Titre · --text-2xl · weight 700]│  [×]         │
│         │  ─────────────────────────────── │               │
│         │  [Contenu · max-height: 70vh]    │               │
│         │  [Scroll si nécessaire]          │               │
│         │  ─────────────────────────────── │               │
│         │  [Bouton annuler]  [Bouton CTA]  │               │
│         └──────────────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Styles

- Modal : `max-width: 560px` · `width: 90vw` · fond `--color-white` · `--radius-xl` · `--shadow-lg`
- Overlay : `rgba(0,0,0,0.50)` · `position: fixed; inset: 0`
- Animation : overlay `opacity 0→1` en `200ms` · modal `scale(0.95) opacity(0)` → `scale(1) opacity(1)` en `250ms --ease-out`
- Fermeture : bouton `×` · clic overlay · `Escape`

### Accessibilité

```html
<div role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title"
     aria-describedby="modal-desc">
  <h2 id="modal-title">Titre</h2>
  <p id="modal-desc">Description</p>
</div>
```

- Focus trap actif (tab reste dans la modal)
- Focus placé sur le premier élément focusable à l'ouverture
- Focus retourné à l'élément déclencheur à la fermeture
- `aria-hidden="true"` sur le contenu derrière la modal

---

## 21. Toast / Notification

### Description

Notification temporaire, non bloquante. Informe l'utilisateur d'un résultat d'action sans interrompre son flux.

### Variantes

| Variante | Usage | Couleur icône |
|----------|-------|--------------|
| `success` | Action réussie (formulaire envoyé, devis généré) | `--color-success` `#10B981` |
| `error` | Erreur inattendue (réseau, serveur) | `--color-error` `#EF4444` |
| `info` | Information neutre | `--color-primary` `#0066FF` |
| `warning` | Avertissement non bloquant | `--color-warning` `#F59E0B` |

### Anatomie

```
┌──────────────────────────────────────────┐
│  [●] Message clair et court        [×]  │
└──────────────────────────────────────────┘
```

- Position : `fixed top-24px right-24px` (ou `bottom-24px` si widget Loïc actif)
- Largeur : `max(320px, 90vw)`
- Fond : `--color-white` · bordure gauche `4px solid [couleur variante]` · `--shadow-lg` · `--radius-md`
- Icône : `CheckCircle` / `XCircle` / `Info` / `AlertTriangle` (Lucide) `20px`
- Message : `--text-base` · `--color-gray-900` · `max 2 lignes`
- Bouton `×` : `20px` · `--color-gray-400` · `aria-label="Fermer"`
- Durée auto-fermeture : `success/info` → `4000ms` · `error/warning` → reste jusqu'au clic

### Animation

- Entrée : `translateX(100%) → translateX(0)` + `opacity 0→1` en `300ms --ease-out`
- Sortie : `translateX(100%)` + `opacity 1→0` en `200ms`
- Stack si plusieurs toasts simultanés : `gap: 8px`

### Accessibilité

```html
<div role="alert" aria-live="assertive" aria-atomic="true">
  <!-- success/error : assertive -->
</div>
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- info/warning : polite -->
</div>
```

---

## 22. Skeleton Screen

### Description

Placeholder animé remplaçant les spinners pendant les chargements. Réduit la perception du temps d'attente.

### Principe

Le skeleton reproduit la **forme** du contenu attendu avec des blocs gris animés.

### Styles

- Fond : `--color-gray-100` · `--radius-sm`
- Animation : `background-position` de `-200% → 200%` en `1500ms` linéaire en boucle (shimmer effect)
  ```
  background: linear-gradient(90deg,
    --color-gray-100 25%,
    --color-gray-200 50%,
    --color-gray-100 75%
  );
  background-size: 200% 100%;
  ```
- `prefers-reduced-motion: reduce` → fond statique `--color-gray-100`, pas d'animation

### Skeletons par composant

**Card skeleton**
```
┌──────────────────────────────────────────┐
│  [████ 40px icône]                       │
│                                          │
│  [████████████ titre 24px]              │
│  [███████████████████████ 16px]         │
│  [████████████████ 16px]                │
│                                          │
│  [███████ lien 14px]                    │
└──────────────────────────────────────────┘
```

**Stat skeleton**
```
[████ icône]
[████████ valeur]
[██████████ label]
```

**Testimonial skeleton**
```
[█████████████████████████████ 20px]
[████████████████████ 20px]
[████████████ 20px]

[●● avatar] [█████ nom]   [████ poste]
```

**Blog article skeleton**
```
[████████████████████████████ image 16:9]
[█████ tag]
[████████████████████ titre]
[███████████████ extrait]
[● avatar] [████ date]
```

---

## 23. Typing Indicator

### Description

Animation signalant que Loïc est en train de rédiger une réponse. Utilisé dans le widget Loïc et la démo chat homepage.

### Anatomie

```
🤖 Loïc

   [● ● ●]
```

- 3 cercles `8px × 8px` · fond `--color-gray-400` · `--radius-full`
- Gap entre cercles : `4px`
- Conteneur : même style que les bulles Loïc (`--color-gray-100` · `--radius-lg`)
- Padding : `12px 16px`

### Animation

Chaque point effectue un `translateY(0 → -6px → 0)` en `600ms` avec `ease-in-out`, décalage de `200ms` entre chaque point :

| Point | Délai |
|-------|-------|
| Point 1 | `0ms` |
| Point 2 | `200ms` |
| Point 3 | `400ms` |

- Cycle : boucle infinie
- `prefers-reduced-motion` : opacité pulsante `0.4→1→0.4` à la place

---

## 24. Proof Bar

### Description

Bande de logos clients ou partenaires. Renforce la confiance par association.

### Anatomie

```
« Rejoignez les entreprises qui font confiance à CA-TECH »

[Logo 1]    [Logo 2]    [Logo 3]    [Logo 4]    [Logo 5]
```

### Styles

- Fond : hérite de la section parente (souvent `--color-primary-dark` sous le hero)
- Label : `--text-sm` · uppercase · `letter-spacing: 0.08em` · `rgba(255,255,255,0.50)` (sur fond sombre) / `--color-gray-400` (sur fond clair) · centré
- Séparateur haut : `1px solid rgba(255,255,255,0.10)` (sur fond sombre)
- Logos : version monochrome blanc (sur fond sombre) ou gris (sur fond clair) · hauteur fixe `28px` · `object-fit: contain` · `opacity: 0.60` · hover `opacity: 1` · `transition: opacity 150ms`
- Layout desktop : `flex row` · `gap: 48px` · `justify-content: center`
- Layout mobile : grille `3 colonnes` · `gap: 24px`
- Padding section : `32px 0`

### Fallback (si pas encore de clients)

Remplacer les logos par 3 stats inline :
```
+50 clients     ·     72h délai livraison     ·     Score 97 Lighthouse
```

### Accessibilité

- Chaque logo : `<img alt="[Nom entreprise]">` ou SVG avec `role="img" aria-label="[Nom]"`
- Section : `aria-label="Nos clients et partenaires"`

---

## 25. Règles transversales

### 25.1 Hiérarchie des composants

Un composant ne peut contenir un autre composant du même niveau. Hiérarchie autorisée :
```
Section → Section Header + [Cards | Stats | Carousel | Stepper | FAQ]
Card → Badge + Button + Stat (inline)
Modal → Form fields + Buttons
Widget Loïc → Input + Typing Indicator + Toast
```

### 25.2 Espacements internes standardisés

| Contexte | Espacement |
|----------|-----------|
| Padding card standard | `28px` |
| Padding card large (highlight, agent) | `36px 32px` |
| Padding section | `96px desktop / 64px mobile` |
| Gap entre cards grille | `24px desktop / 16px mobile` |
| Gap entre éléments dans une card | `8px` (micro) · `12px` (normal) · `16px` (large) |
| Marge H2 → contenu section | `48px desktop / 32px mobile` |

### 25.3 Animations — Récapitulatif global

| Type | Durée | Easing | Déclencheur |
|------|-------|--------|------------|
| Hover état | `150ms` | `ease-out` | `:hover` |
| Composant transition | `250ms` | `ease-out` | Interaction |
| Reveal scroll | `400ms` | `cubic-bezier(0.16,1,0.3,1)` | IntersectionObserver |
| Stagger | `+80ms` par item | même | IntersectionObserver |
| Modal/Drawer ouvrir | `250-300ms` | `ease-out` / spring | Click |
| CountUp | `1200ms` | `ease-out` | IntersectionObserver |
| Auto-carousel | `400ms` | `ease-in-out` | Timer 6s |

**Règle absolue** : `transform` et `opacity` uniquement. Jamais animer `width`, `height`, `top`, `left`, `padding`, `margin`.

### 25.4 Z-index scale

| Élément | Z-index |
|---------|---------|
| Contenu normal | `0 - 10` |
| Cards hover | `20` |
| Dropdown nav | `100` |
| Header sticky | `200` |
| Widget Loïc bouton | `300` |
| Widget Loïc ouvert | `400` |
| Drawer mobile | `500` |
| Modal overlay | `600` |
| Modal dialog | `700` |
| Toast notifications | `800` |

### 25.5 Iconographie — Règles d'usage

- **Bibliothèque unique** : Lucide Icons — ne jamais mélanger avec d'autres libraries
- Import à la demande uniquement (pas de bundle complet)
- Tailles standards : `16px` (inline) · `20px` (composant) · `24px` (nav) · `28-32px` (features)
- `aria-hidden="true"` sur toutes les icônes décoratives
- `aria-label` ou texte adjacent sur toutes les icônes fonctionnelles
- Couleur : `currentColor` par défaut · `--color-primary` pour les accents

### 25.6 Focus management

- Jamais `outline: none` sans alternative
- Style focus uniforme : `outline: 2px solid --color-primary; outline-offset: 3px`
- Sur fond sombre : `outline: 2px solid #FFFFFF; outline-offset: 3px`
- Focus visible sur **tous** les éléments interactifs : liens, boutons, inputs, selects, checkboxes, radios, accordéons, carousel controls, modal close buttons

### 25.7 Checklist de livraison d'un composant

Avant de considérer un composant terminé :

- [ ] Tous les états spécifiés implémentés (repos, hover, focus, active, loading, disabled, error)
- [ ] Focus visible conforme
- [ ] `prefers-reduced-motion` respecté
- [ ] Taille minimale tactile `44×44px` sur les éléments interactifs
- [ ] `aria-*` correctement renseignés
- [ ] Test navigation clavier réussi
- [ ] Test zoom 200% sans overflow
- [ ] Contraste texte vérifié (≥ 4.5:1)
- [ ] Animations sur `transform/opacity` uniquement
- [ ] Skeleton Screen disponible si le composant charge des données

---

*Document de référence — Bibliothèque de composants CA-TECH*
*Aligné sur `UX_UI_SPECIFICATION.md` et `HOMEPAGE_SPECIFICATION.md`*
*Version 1.0 — Juillet 2026 — En attente de validation avant implémentation*
