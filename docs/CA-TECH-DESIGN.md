# CA-TECH — Design System Officiel

> **Référence unique et faisant autorité** pour toute décision de design, développement frontend ou production d'assets visuels CA-TECH.
>
> Inspirations : Apple · Stripe · Vercel · Linear — en tant que **références**, pas comme modèles à copier.
> Linear en particulier est une référence de rigueur système, pas une identité à adopter. Nous construisons **CA-TECH × Linear**, pas CA-TECH = Linear.
>
> Version 1.0 — Septembre 2026 · Aligné sur `STRATEGY.md`, `DESIGN_SYSTEM.md`, `UX_UI_SPECIFICATION.md`

---

## Table des matières

1. [Philosophie visuelle](#1-philosophie-visuelle)
2. [Branding](#2-branding)
3. [Design Tokens](#3-design-tokens)
4. [Typographie](#4-typographie)
5. [Layout & Grille](#5-layout--grille)
6. [Composants](#6-composants)
7. [Collaborateurs IA — Langage visuel](#7-collaborateurs-ia--langage-visuel)
8. [Automatisations — Langage visuel](#8-automatisations--langage-visuel)
9. [Loïc — Règles visuelles](#9-loïc--règles-visuelles)
10. [Stratégie image](#10-stratégie-image)
11. [Motion & Animation](#11-motion--animation)
12. [Responsive](#12-responsive)
13. [Accessibilité](#13-accessibilité)
14. [Contraintes design de performance](#14-contraintes-design-de-performance)
15. [DO / DON'T](#15-do--dont)
16. [Table des conflits entre sources](#16-table-des-conflits-entre-sources)
17. [10 Principes fondamentaux](#17-10-principes-fondamentaux)
18. [Synthèse opérationnelle](#18-synthèse-opérationnelle)

---

## 1. Philosophie visuelle

### 1.1 Identité de marque

CA-TECH est un **cabinet de conseil IA-first**. Son slogan : *« L'IA au service de votre croissance »*. L'identité visuelle doit refléter trois attributs simultanément :

- **Confiance** — clarté, cohérence, solidité structurelle
- **Performance** — vitesse perçue, précision, résultats mesurables
- **Modernité sobre** — pas de superflu, chaque élément gagne sa place

### 1.2 Positionnement visuel

CA-TECH se positionne entre l'austérité d'un outil SaaS B2B (Vercel, Linear) et la chaleur d'une marque de conseil humaine. L'esthétique n'est **jamais décorative pour elle-même** — chaque décision visuelle sert la conversion ou la confiance.

### 1.3 Ce que CA-TECH n'est pas

- Pas une agence créative (pas de couleurs vives, d'illustrations illustratives, de gradients spectaculaires sans raison)
- Pas un outil enterprise froid (pas de gris uniform, de typographie minimaliste sans personnalité)
- Pas une startup générique (pas de violet, de vert "tech", de dégradés arc-en-ciel)

### 1.4 Synthèse des inspirations

| Source | Ce qu'on emprunte | Ce qu'on n'emprunte PAS |
|--------|------------------|------------------------|
| **Apple** | Espaces blancs généreux, hiérarchie typographique forte, perfectionnisme des détails | Les prix premium, le lifestyle pur |
| **Stripe** | Clarté technique, prose directe, typographie au service du contenu | La complexité des interfaces développeur |
| **Vercel** | Architecture de page, proof bar, CTAs directs, dark footer | L'esthétique full-dark, le ton ultra-technique |
| **Linear** | Rigueur système, tokens cohérents, micro-interactions précises, grille serrée | L'acid-lime (#ADFF2F ou équivalent), le dark-mode dominant, le ton "produit pour devs" |

> ⚠️ **Règle absolue** : L'acid-lime de Linear n'est **pas** une couleur CA-TECH et ne le deviendra jamais.

---

## 2. Branding

### 2.1 Logo

- Format primaire : SVG vectoriel
- Version couleur : icône bleue `#0066FF` + wordmark `#0A2540`
- Version fond sombre : tout blanc
- Version footer : SVG blanc · `max-width: 110px`
- Zone de protection : `1× hauteur du logo` sur chaque côté
- Jamais : étiré, pivotement, couleur hors palette, ombre portée, fond coloré non validé

### 2.2 Palette de couleurs

Voir §3.1 pour les tokens exacts. La palette exprime :

- **Bleu vif `#0066FF`** — énergie, action, confiance technologique
- **Bleu nuit `#0A2540`** — autorité, profondeur, sérieux
- **Blanc `#FFFFFF`** — respiration, clarté, espace
- **Gris structurés** — hiérarchie textuelle, séparateurs, états désactivés

### 2.3 Typographie de marque

Inter — unique police de marque. Voir §4 pour le système complet.

### 2.4 Éléments graphiques

- **Dot/Badge ●** — indicateur statut Loïc (pulsation bleue)
- **Badge pill** — labels de section (`✦ POURQUOI CA-TECH`)
- **Séparateurs fins** — `1px solid rgba(255,255,255,0.08)` sur fond sombre, `1px solid --color-gray-200` sur fond clair
- **Icônes Lucide** — exclusivement, stroke style, `currentColor`, `strokeWidth: 1.5`
- **Gradient primaire** — utilisé uniquement pour les sections CTA finales et éléments d'accent (`linear-gradient(135deg, #0066FF 0%, #0A2540 100%)`)

---

## 3. Design Tokens

> **Source de vérité unique.** Toute valeur non listée ici doit être refusée ou soumise à validation avant usage.

### 3.1 Couleurs

```css
/* Couleurs de marque */
--color-primary:        #0066FF;   /* Bleu CA-TECH — CTA, liens actifs, accents */
--color-primary-dark:   #0A2540;   /* Bleu nuit — fonds sombres, header scroll */
--color-primary-light:  #E8F0FF;   /* Bleu pâle — fonds de cards, badges, highlights */

/* Gris sémantiques */
--color-gray-50:        #F9FAFB;   /* Fond de section alternée */
--color-gray-100:       #F3F4F6;   /* Fond card subtle */
--color-gray-200:       #E5E7EB;   /* Bordures, séparateurs */
--color-gray-300:       #D1D5DB;   /* Bordures renforcées */
--color-gray-400:       #9CA3AF;   /* Texte désactivé, placeholder — JAMAIS texte informatif */
--color-gray-500:       #6B7280;   /* Texte secondaire léger */
--color-gray-600:       #4B5563;   /* Texte secondaire — ratio 7.6:1 sur blanc ✓ */
--color-gray-700:       #374151;   /* Texte corps */
--color-gray-800:       #1F2937;   /* Titres secondaires */
--color-gray-900:       #111827;   /* Footer, fonds sombres */

/* Sémantiques UI */
--color-success:        #10B981;   /* Validations, indicateurs positifs */
--color-warning:        #F59E0B;   /* Alertes, attention */
--color-error:          #EF4444;   /* Erreurs, badge notification Loïc */
--color-info:           #3B82F6;   /* Informations */

/* Texte */
--color-text-primary:   #0A0A0A;   /* Corps principal — ratio 21:1 sur blanc ✓ */
--color-text-secondary: #4B5563;   /* Sous-textes — ratio 7.6:1 ✓ */
--color-text-disabled:  #9CA3AF;   /* États désactivés uniquement */
```

**Ratios de contraste WCAG AA validés :**

| Combinaison | Ratio | AA (4.5:1) |
|-------------|-------|-----------|
| `#0A0A0A` sur `#FFFFFF` | 21:1 | ✓ |
| Blanc sur `#0066FF` | 5.1:1 | ✓ |
| Blanc sur `#0A2540` | 17:1 | ✓ |
| `#4B5563` sur `#FFFFFF` | 7.6:1 | ✓ |
| `#9CA3AF` sur `#FFFFFF` | 3.8:1 | ✗ — texte interdit |

### 3.2 Typographie (tokens d'échelle)

```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
--text-7xl:  4.5rem;    /* 72px */
```

### 3.3 Espacements

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
```

Sections desktop : `padding: 96px 0` (--space-24)
Sections mobile : `padding: 64px 0` (--space-16)

### 3.4 Rayons de bordure

```css
--radius-sm:   6px;    /* Tags, badges, inputs */
--radius-md:   10px;   /* Boutons, small cards */
--radius-lg:   16px;   /* Cards standards */
--radius-xl:   24px;   /* Cards hero, modales */
--radius-full: 9999px; /* Pills, avatars, indicateurs */
```

### 3.5 Bordures

```css
--border-width:     1px;
--border-color:     var(--color-gray-200);        /* #E5E7EB */
--border-color-dark: rgba(255, 255, 255, 0.08);   /* Fond sombre */
```

### 3.6 Ombres

```css
/* Ombres neutres */
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05);
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06);
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -2px rgba(0,0,0,0.05);
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(0,0,0,0.04);

/* Ombres bleues (accent CA-TECH) */
--shadow-blue-sm: 0 2px 8px rgba(0,102,255,0.20);
--shadow-blue-md: 0 4px 16px rgba(0,102,255,0.25);
--shadow-blue-lg: 0 8px 32px rgba(0,102,255,0.30);
```

### 3.7 Motion

```css
/* Durées */
--duration-instant: 100ms;
--duration-fast:    150ms;
--duration-normal:  250ms;
--duration-slow:    400ms;
--duration-slower:  600ms;

/* Courbes */
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);   /* Entrées — tout élément qui apparaît */
--ease-in:     cubic-bezier(0.4, 0, 1, 1);       /* Sorties — éléments qui disparaissent */
--ease-inout:  cubic-bezier(0.4, 0, 0.2, 1);     /* Transitions d'état */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Ouvertures widget, pop-ups */
```

### 3.8 Breakpoints

```css
/* Mobile-first — min-width uniquement */
--bp-sm:  640px;   /* Phablets */
--bp-md:  768px;   /* Tablettes portrait */
--bp-lg:  1024px;  /* Tablettes paysage / small laptop */
--bp-xl:  1280px;  /* Desktop standard */
--bp-2xl: 1536px;  /* Large desktop */
```

Usage en CSS :
```css
/* Base = mobile (375px) */
.element { font-size: var(--text-base); }

/* Tablette */
@media (min-width: 768px) { .element { font-size: var(--text-lg); } }

/* Desktop */
@media (min-width: 1024px) { .element { font-size: var(--text-xl); } }
```

---

## 4. Typographie

### 4.1 Police

**Inter** — unique police de marque. Importée depuis Google Fonts.

Poids autorisés **exclusivement** :
- `400` — corps de texte, descriptions
- `600` — sous-titres, labels, navigation
- `800` — titres de sections, H1, H2

> ⚠️ Aucun autre poids (100, 200, 300, 500, 700, 900) n'est autorisé. Évite des variations de graisses non systématiques.

Police secondaire : **JetBrains Mono** — uniquement pour les blocs de code, le blog technique, et les snippets. Jamais dans les interfaces produit.

### 4.2 Hiérarchie typographique

| Rôle | Token | Poids | Line-height | Letter-spacing |
|------|-------|-------|------------|----------------|
| H1 hero | `--text-7xl` → `--text-5xl` mobile | 800 | 1.1 | -0.03em |
| H1 page | `--text-5xl` → `--text-4xl` mobile | 800 | 1.1 | -0.02em |
| H2 section | `--text-4xl` → `--text-3xl` mobile | 800 | 1.15 | -0.02em |
| H3 sous-section | `--text-2xl` | 600 | 1.3 | -0.01em |
| H4 card title | `--text-xl` | 600 | 1.4 | 0 |
| Corps principal | `--text-base` → `--text-lg` | 400 | 1.7 | 0 |
| Corps lead | `--text-lg` → `--text-xl` | 400 | 1.6 | 0 |
| Caption / label | `--text-sm` | 400/600 | 1.5 | 0.01em |
| Micro-copy | `--text-xs` | 400 | 1.5 | 0.01em |
| Badge section | `--text-xs` | 600 | 1 | 0.10em uppercase |
| Navigation | `--text-sm` | 400/600 | 1 | 0 |
| CTA button | `--text-sm` → `--text-base` | 600 | 1 | 0 |

### 4.3 Règles typographiques

- **Longueur de ligne** : `max-width: 65ch` pour les blocs de texte courant
- **Hiérarchie H stricte** : H1 → H2 → H3, jamais de saut de niveau
- **Un seul H1 par page**, contenant le mot-clé principal
- **Minimum 14px** — jamais en dessous sur mobile (contrainte légale et UX)
- **Alignement** : texte courant left-align ; éléments centraux (badge, headline hero) centré uniquement si seul dans sa colonne
- **`color: #9CA3AF`** interdit pour tout texte informatif (ratio WCAG insuffisant)

---

## 5. Layout & Grille

### 5.1 Conteneur principal

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;    /* mobile */
}

@media (min-width: 768px) {
  .container { padding: 0 32px; }
}

@media (min-width: 1280px) {
  .container { padding: 0 48px; }
}
```

### 5.2 Grilles

| Usage | Colonnes | Gap |
|-------|---------|-----|
| Cards 3 colonnes (desktop) | `grid-template-columns: repeat(3, 1fr)` | 32px |
| Cards 2 colonnes (tablette) | `repeat(2, 1fr)` | 24px |
| Cards 1 colonne (mobile) | `1fr` | 20px |
| Hero split (texte + visuel) | `1fr 1fr` | 64px |
| Feature cards 4 col | `repeat(4, 1fr)` | 24px |
| Footer 4 col | `repeat(4, 1fr)` | 48px |

### 5.3 Sections

Chaque section de page suit ce pattern :

```html
<section aria-label="[Nom descriptif de la section]">
  <div class="container">
    <!-- Badge optionnel -->
    <span class="badge-section">✦ TITRE SECTION</span>

    <!-- Headline -->
    <h2>Titre de section</h2>
    <p class="section-lead">Sous-texte description</p>

    <!-- Contenu -->
    <!-- ... -->
  </div>
</section>
```

### 5.4 Padding de section

| Taille | Desktop | Mobile |
|--------|---------|--------|
| Standard | `96px 0` | `64px 0` |
| Hero | `140px 0 100px` | `100px 0 64px` |
| CTA final | `120px 0` | `80px 0` |
| Footer | `64px 0 40px` | `48px 0 32px` |

### 5.5 Z-index

```css
--z-base:     0;
--z-above:    10;
--z-dropdown: 100;
--z-header:   200;
--z-modal:    300;
--z-loic:     400;     /* Widget Loïc toujours au-dessus */
--z-toast:    500;
```

---

## 6. Composants

### 6.1 Header / Navigation

**Structure :**
```
[Logo CA-TECH] ... [Nav principale] ... [CTA "Diagnostic IA"]
```

**Comportement desktop :**
- Fond transparent au scroll 0 ; transition vers `backdrop-filter: blur(16px) saturate(180%)` + `background: rgba(255,255,255,0.90)` au-delà de 60px de scroll
- Hauteur : 72px
- Liens nav : `--text-sm` weight `400`, couleur `--color-gray-700`, hover `--color-primary` en `150ms`
- CTA header : `Button primary sm`
- Dropdown Expertises : `opacity 0→1` + `translateY(-6px→0)` en `200ms --ease-out`

**Comportement mobile :**
- Hamburger → drawer (volet) `role="dialog" aria-modal="true"`
- Fond drawer : blanc · ombre `--shadow-xl`
- Navigation en liste verticale · `--text-lg` weight `600`
- Fermeture : Escape + tap extérieur

**Dropdown menu :**
```
aria-haspopup="true"
aria-expanded="false/true"
```
Contenu : liens vers `/intelligence-artificielle`, `/automatisation`, `/seo`, `/developpement-web`, `/design-identite`

### 6.2 Footer

**Structure 4 colonnes (desktop) / 1 colonne (mobile) :**
- Fond : `--color-gray-900` (`#111827`)
- Padding : `64px 0 40px`
- Logo blanc · `max-width: 110px`
- Slogan : `--text-sm` · `rgba(255,255,255,0.50)` · `max-width: 190px`
- Titres colonnes : `--text-xs` uppercase · `letter-spacing: 0.10em` · `rgba(255,255,255,0.40)`
- Liens : `--text-sm` · `rgba(255,255,255,0.65)` · hover `rgba(255,255,255,1)` · `150ms`
- Séparateur bas : `1px solid rgba(255,255,255,0.08)`
- Copyright : `--text-xs` · `rgba(255,255,255,0.35)`
- Liens légaux : `--text-xs` · `rgba(255,255,255,0.45)` · hover `rgba(255,255,255,0.80)`

### 6.3 Boutons

| Variant | Usage | Fond | Texte | Bordure |
|---------|-------|------|-------|---------|
| `primary` | CTA principal de page | `--color-primary` | blanc | aucune |
| `secondary` | Action secondaire | transparent | `--color-primary` | `1px --color-primary` |
| `ghost` | Tertiary, minimal | transparent | `--color-gray-700` | aucune |
| `white` | Sur fond sombre/gradient | `#FFFFFF` | `--color-primary` | aucune |
| `dark` | Contexte dark | `--color-gray-900` | blanc | aucune |
| `danger` | Actions destructives | `--color-error` | blanc | aucune |

**Tailles :**
| Taille | Padding | Font | Radius |
|--------|---------|------|--------|
| `sm` | `8px 16px` | `--text-sm` | `--radius-md` |
| `md` | `12px 24px` | `--text-sm` | `--radius-md` |
| `lg` | `16px 32px` | `--text-base` | `--radius-md` |
| `xl` | `20px 48px` | `--text-base` | `--radius-md` |

**Micro-interactions bouton :**
```css
button:hover { transform: translateY(-1px); box-shadow: var(--shadow-blue-md); }
button:active { transform: translateY(0); box-shadow: var(--shadow-blue-sm); }
/* transition: all 150ms var(--ease-out) */
```

**États :**
- Focus : `outline: 2px solid --color-primary; outline-offset: 3px`
- Disabled : `opacity: 0.40; cursor: not-allowed`
- Loading : spinner intégré, texte masqué, largeur fixe (pas de layout shift)

### 6.4 Cards

**Card standard :**
```css
.card {
  background: #FFFFFF;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);   /* 16px */
  padding: 24px;
  transition: transform 250ms var(--ease-out), box-shadow 250ms var(--ease-out);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

**Card avec fond blue-light (accent) :**
```css
background: var(--color-primary-light);   /* #E8F0FF */
border-color: rgba(0,102,255,0.15);
```

**Icône dans card (hover) :**
```css
.card:hover .card-icon { transform: scale(1.10); }
/* transition: transform 150ms var(--ease-out) */
```

**Card collaborateur IA** : voir §7
**Card automatisation** : voir §8

### 6.5 Badges & Pills

**Badge section (intro de section) :**
```css
.badge-section {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
```

**Badge pill sombre (sur fond dark) :**
```css
.badge-pill-dark {
  background: rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.90);
  border: 1px solid rgba(255,255,255,0.20);
  /* mêmes dimensions que badge-section */
}
```

**Badge statut :**
```css
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}
/* Dot animé Loïc : pulsation 1500ms */
```

### 6.6 Formulaires

- Labels : visibles, `for`/`id` associés, `--text-sm` weight `600` `--color-gray-700`
- Inputs : `height: 44px`, `border: 1px solid --color-gray-300`, `--radius-sm`, `padding: 0 12px`
- Focus : `border-color: --color-primary`, `box-shadow: 0 0 0 3px rgba(0,102,255,0.15)`
- Erreur : `border-color: --color-error`, message sous le champ `--text-sm color: --color-error`
- Placeholder : `--color-gray-400` (exemption WCAG contrast)
- Multi-étapes : max 3 champs par écran, barre de progression `role="progressbar"`
- Bouton submit : `Button primary lg` · pleine largeur sur mobile
- Champs requis : `required` + `aria-required="true"` + astérisque visuel
- `autocomplete` renseigné : `name`, `email`, `tel`, `given-name`, `family-name`, `organization`

### 6.7 CTA Sections (Hero + Final)

**Hero CTA :**
```
[Button primary lg] Lancer mon Diagnostic IA →
[Button ghost lg]   Voir nos réalisations
```
Micro-copy sous : `Gratuit · Sans engagement · Résultat en 10 min`

**CTA Final (gradient) :**
```css
background:
  radial-gradient(ellipse 70% 80% at 60% 50%, rgba(0,102,255,0.25) 0%, transparent 65%),
  linear-gradient(135deg, #0066FF 0%, #0A2540 100%);
```
- Badge : `pill-dark` · `✦ PRÊT À DÉMARRER ?`
- H2 : `--text-5xl` desktop / `--text-4xl` mobile · weight `800` · blanc · `letter-spacing: -0.02em`
- Bouton : `Button white xl` · hover `translateY(-2px)` + ombre renforcée
- Lien secondaire : `Ou parler à Loïc maintenant →` · `rgba(255,255,255,0.70)` → blanc

### 6.8 Modales

```css
.modal-overlay {
  background: rgba(0,0,0,0.50);
  backdrop-filter: blur(4px);
}
.modal {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 560px;
  padding: 32px;
}
```
- `role="dialog"` + `aria-modal="true"` + `aria-label`
- Focus trap actif pendant l'ouverture
- Fermeture : Escape + clic overlay
- Animation ouverture : `scale(0.95→1)` + `opacity 0→1` en `250ms --ease-spring`

### 6.9 Accordion / FAQ

```css
/* Fermé */
.faq-question { font-size: var(--text-lg); font-weight: 600; color: var(--color-gray-900); }
.faq-icon { /* icône Plus Lucide, droit */ }

/* Ouvert */
.faq-question { color: var(--color-primary); }
.faq-icon { transform: rotate(45deg); /* 250ms */ }

/* Réponse */
.faq-answer { font-size: var(--text-base); color: var(--color-gray-600); line-height: 1.7; }
```
- Animation : `max-height 0→auto` + `opacity 0→1` en `250ms --ease-out`
- Comportement exclusif : un seul item ouvert à la fois
- Séparateurs : `1px solid --color-gray-200`
- `max-width: 760px` · centré

### 6.10 Tooltips

- Fond : `--color-gray-900`
- Texte : `--text-xs` blanc · `padding: 6px 10px` · `--radius-sm`
- Délai d'apparition : `300ms`
- Animation : `opacity 0→1` en `150ms`
- Toujours accessible via `aria-label` ou `title`

---

## 7. Collaborateurs IA — Langage visuel

### 7.1 Contexte

La page `/collaborateurs-ia` présente 6 agents IA personnifiés (Commercial IA, Support IA, RH IA, Juridique IA, SEO IA, Comptable IA). Le langage visuel doit évoquer la **collaboration humain-machine**, pas la robotique ou la science-fiction.

### 7.2 Hero section

- **Vidéo de fond** : `/collaborateurs/Collaborateurs IA.mp4` · `autoplay muted loop playsInline`
- **Poster** : `/collaborateurs/collaborateur-ia-hero.webp` · affiché pendant le chargement vidéo
- **Overlay** : dégradé vertical `rgba(10,37,64,0.60) → transparent` (protège la lisibilité du titre)
- Titre H1 : blanc · `--text-7xl` desktop · `letter-spacing: -0.03em`
- Scroll indicator animé

### 7.3 Cards collaborateurs

**Structure d'une card :**
```
[Image portrait — 280×320px WebP]
[Nom du collaborateur]     ← --text-2xl weight 800
[Rôle / Spécialité]        ← badge pill --color-primary-light
[Description courte]       ← --text-base --color-gray-600
[Liste de missions]        ← items avec CheckCircle icon
[Prix]                     ← "À partir de 290 €/mois — sans engagement"
[CTA primaire]             ← "Découvrir [nom]"
[CTA secondaire]           ← "Diagnostic IA"
```

**Styles des cards :**
```css
.cai-col-card {
  background: #FFFFFF;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);    /* 24px */
  overflow: hidden;
  transition: transform 300ms var(--ease-out), box-shadow 300ms;
}
.cai-col-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-blue-lg);
  border-color: rgba(0,102,255,0.20);
}
```

**Image portrait :**
- Format : WebP · dimensions 280×320px (ratio portrait 7:8)
- `object-fit: cover` · zone focale : visage centré dans le tiers supérieur
- Alt text : `"[Prénom], [Rôle] IA CA-TECH"`
- Fond fallback si image absente : `var(--color-primary-light)` avec initiale

**Prix :**
```css
.cai-col-price {
  font-size: 0.85rem;
  color: #6b7280;        /* --color-gray-500 */
  margin: 0 0 16px;
  letter-spacing: 0.01em;
}
.cai-col-price strong {
  color: var(--col-color, #0066FF);   /* Couleur propre à chaque collaborateur */
  font-weight: 600;
}
```

**Couleur propre (`--col-color`) :**
Chaque collaborateur dispose d'une couleur d'accent individuelle déclinée du bleu primaire. La couleur accent colore : badge de rôle, hover card, icône missions, texte prix.

### 7.4 Direction artistique des portraits

- **Style** : photos ou illustrations semi-réalistes — professionnelles, humaines, chaleureuses
- **Cadrage** : portrait 3/4, regard vers l'objectif ou légèrement de côté
- **Fond** : neutre (blanc, gris clair, ou léger bokeh) — pas de mise en scène trop chargée
- **Diversité** : représenter des genres, âges, et origines diverses
- **Cohérence** : même éclairage et palette de fond entre les 6 collaborateurs
- **Interdit** : gavel/marteau de justice (cliché juridique), robot, circuit imprimé en fond, dashboards en fond sur photo commerciale

### 7.5 Règle images — Unsplash vs local

**Problème identifié** : CollaborateursIA.jsx utilise des URLs Unsplash CDN alors que des fichiers WebP locaux existent dans `/public/collaborateurs/`. Cette incohérence crée :
- Dépendance réseau externe
- Images non optimisées pour les dimensions cibles
- Photos génériques sans cohérence artistique

**Règle** : toute nouvelle implémentation doit utiliser les fichiers locaux `/public/collaborateurs/[nom].webp`.

---

## 8. Automatisations — Langage visuel

### 8.1 Contexte

La page `/automatisations` présente 16 services d'automatisation organisés en grille. Le langage visuel doit évoquer les **flux**, la **connexion entre outils**, et la **transformation de processus métier**.

### 8.2 Hero section

- **Vidéo de fond** : `/automatisations/Automatisations.mp4`
- **Poster** : `/automatisations/automatisation-hero.webp`
- Même système que la page Collaborateurs IA (overlay + titre blanc)

> ⚠️ **BUG ACTUEL** : `automatisation-hero.webp` est utilisé à la fois comme poster vidéo (hero) ET comme image de la card "CRM intelligent". Ces deux usages doivent être séparés — la card CRM doit avoir sa propre image dédiée.

### 8.3 Cards de services

**Structure d'une card service :**
```
[Icône ou Image illustrative — 320×240px WebP]
[Nom du service]           ← --text-xl weight 600
[Description]              ← --text-sm --color-gray-600
[Badge catégorie]          ← pill primaire ou secondaire
[CTA]                      ← lien "En savoir plus" ou "Démarrer"
```

**Grille** : 4 colonnes desktop · 2 tablette · 1 mobile · gap 24px

**Icônes vs Images :**
- Services d'intégration d'outils (Gmail, Google Calendar, Slack…) : **icône SVG** inline de l'outil, pas de photo JPEG/WebP d'une icône
- Services métier (CRM, reporting, qualification…) : image WebP illustrative 320×240px (ratio 4:3)
- Format mixte autorisé dans la grille, cohérence par catégorie

> ⚠️ **PROBLÈME ACTUEL** : `gmail.webp` (150×165px, 25KB) et `google-calendar.webp` (155×150px, 26KB) sont des captures d'icône utilisées comme illustrations de card — format incorrect. Ces images doivent être remplacées par des SVG inline ou des illustrations dédiées.

### 8.4 Visualisation de workflow (si utilisée)

Pour les cards ou sections montrant un workflow étape-par-étape :

```
[Nœud A] ──────→ [Nœud B] ──────→ [Nœud C]
   ↑                                    ↓
[Trigger]                           [Résultat]
```

**Styles des nœuds :**
```css
.workflow-node {
  background: #FFFFFF;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  font-weight: 600;
}
.workflow-node.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
```

**Connecteurs :**
```css
.workflow-connector {
  width: 32px;
  height: 2px;
  background: var(--color-gray-300);
  position: relative;
}
.workflow-connector::after {
  content: '';
  position: absolute;
  right: -4px;
  top: -3px;
  border: 4px solid transparent;
  border-left: 6px solid var(--color-gray-300);
}
```

### 8.5 Stats section

Format des statistiques (type "14h gagnées par semaine") :
```css
.at-stat-val {
  font-size: var(--text-7xl);
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.03em;
  line-height: 1;
}
.at-stat-val em {
  font-size: var(--text-3xl);
  font-style: normal;
  color: var(--color-gray-400);
  margin-left: 4px;
}
.at-stat-label {
  font-size: var(--text-base);
  color: var(--color-gray-600);
  margin-top: 8px;
}
```

---

## 9. Loïc — Règles visuelles

> Cette section couvre **uniquement** les règles visuelles du widget Loïc. Le comportement conversationnel, le system prompt et la logique métier sont définis dans `supabase/functions/loic-chat/index.ts` et `STRATEGY.md §6`.

### 9.1 Widget flottant (état fermé)

```css
.loic-trigger {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: var(--z-loic);   /* 400 */

  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  box-shadow: var(--shadow-blue-lg);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: transform 150ms var(--ease-out), box-shadow 150ms;
}
.loic-trigger:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 40px rgba(0,102,255,0.40);
}
```

- Icône : `MessageCircle` Lucide · `24px` · blanc · `strokeWidth: 2`
- Tooltip hover desktop : `« Parler à Loïc »`

**Badge notification :**
```css
.loic-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: var(--color-error);
  border: 2px solid #FFFFFF;
  /* Visible uniquement si message non lu */
}
```

**Dot de statut (pulsation) :**
```css
.loic-dot {
  animation: pulse-loic 1500ms ease-in-out infinite;
}
@keyframes pulse-loic {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.6; }
}
@media (prefers-reduced-motion: reduce) {
  .loic-dot { animation: none; }
}
```

### 9.2 Widget ouvert (conversation)

```css
.loic-panel {
  position: fixed;
  bottom: 88px;   /* 24px + 56px bouton + 8px gap */
  right: 24px;
  z-index: var(--z-loic);

  width: 380px;       /* 340px sur mobile */
  height: 560px;      /* 480px sur mobile */
  max-height: calc(100vh - 120px);

  background: #FFFFFF;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);

  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**Animation ouverture :**
```css
.loic-panel {
  animation: loic-open 250ms var(--ease-spring) forwards;
}
@keyframes loic-open {
  from { opacity: 0; transform: scale(0.85) translateY(16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
```

**Header du panel :**
- Avatar Loïc : `40px` rond · fond `--color-primary` · initiale "L" ou photo
- Nom : `--text-base` weight `600` `--color-gray-900`
- Statut : badge `● En ligne` · dot vert animé
- Bouton fermeture : `X` Lucide `20px` · `--color-gray-400` · hover `--color-gray-700`

**Bulles de message :**
```css
/* Message utilisateur */
.msg-user {
  background: var(--color-primary);
  color: #FFFFFF;
  border-radius: 18px 18px 4px 18px;
  align-self: flex-end;
}

/* Message Loïc */
.msg-loic {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
  border-radius: 18px 18px 18px 4px;
  align-self: flex-start;
}
```

**Zone de saisie :**
- `height: 44px` minimum · `--radius-full` · `border: 1px solid --color-gray-200`
- Focus : `border-color: --color-primary`
- Bouton envoyer : `Send` Lucide · `--color-primary` · visible si texte non vide

**Règles comportementales (visuelles) :**
- Ne **jamais** s'ouvrir automatiquement (pas d'auto-pop après X secondes)
- Ne **jamais** bloquer le contenu principal sur mobile
- Sur mobile : panel pleine largeur + hauteur 70vh
- Focus trap actif pendant que le panel est ouvert

### 9.3 Présence sur le site

Le widget Loïc est présent sur **toutes les pages** du site. Position : `fixed bottom-right`, au-dessus du footer dans l'empilement z-index.

---

## 10. Stratégie image

### 10.1 Formats et usages

| Usage | Format | Taille max | Notes |
|-------|--------|-----------|-------|
| Photo hero | WebP | 200 Ko | + JPEG fallback · `fetchpriority="high"` |
| Photo portrait collaborateur | WebP | 80 Ko | 280×320px · `object-fit: cover` |
| Image card service (4:3) | WebP | 60 Ko | 320×240px minimum |
| Illustration IA / UI | SVG ou WebP | 150 Ko | SVG préféré si illustratif |
| Icône outil (Gmail, Slack…) | SVG inline | — | Jamais PNG/WebP d'une icône |
| Image blog | WebP | 120 Ko | |
| Image Open Graph | WebP | 150 Ko | 1200×630px |
| Logo client | SVG | — | Fond transparent |

### 10.2 Règles d'implémentation

```html
<!-- Image hero — chargement prioritaire -->
<img src="/hero.webp" width="1280" height="720"
     fetchpriority="high" decoding="sync"
     alt="[Description précise]">

<!-- Image hors hero — lazy loading -->
<img src="/card.webp" width="320" height="240"
     loading="lazy" decoding="async"
     alt="[Description précise]">

<!-- srcset pour les photos importantes -->
<img
  srcset="/hero-375.webp 375w, /hero-768.webp 768w, /hero-1280.webp 1280w"
  sizes="(max-width: 768px) 100vw, 50vw"
  src="/hero-1280.webp"
  width="1280" height="720"
  alt="...">
```

**Règles absolues :**
- `width` et `height` toujours renseignés → évite le CLS
- `loading="lazy"` sur toutes les images hors fold
- `alt` informatif sur toutes les images significatives ; `alt=""` sur les purement décoratives
- Format WebP avec fallback JPEG pour les navigateurs anciens

### 10.3 Alt text — Règles

- Décrire le **contenu et le contexte**, pas juste l'objet
  - ✗ `"photo"` / `"image"` / `"logo"`
  - ✓ `"Interface du tableau de bord CA-TECH montrant les métriques SEO"`
- Moins de 125 caractères
- Pas de préfixe `"Image de…"` ou `"Photo de…"`
- Icônes décoratives : `aria-hidden="true"` + `alt=""`

### 10.4 Problèmes actuels à corriger (Sprint 3B)

| Priorité | Fichier | Problème |
|----------|---------|---------|
| 🔴 | CollaborateursIA.jsx | 6 URLs Unsplash à remplacer par `/public/collaborateurs/[nom].webp` |
| 🔴 | Automatisations.jsx | `automatisation-hero.webp` utilisé double (hero + card CRM) |
| 🔴 | `gmail.webp` 150×165px | Icône utilisée comme illustration card — remplacer par SVG |
| 🔴 | `google-calendar.webp` 155×150px | Même problème |
| 🔴 | `photo-1551288049-bebda4e38f71` | Duplicate Unsplash sur Commercial IA et Reporting automatique |

### 10.5 Assets locaux existants

```
public/collaborateurs/
  collaborateur-ia-hero.webp   99KB  ← poster vidéo hero ✓
  commercial-ia.webp           61KB  ← utilisé ailleurs, PAS dans CollaborateursIA.jsx
  juridique-ia.webp            60KB  ← sous-utilisé
  rh-ia.webp                   57KB  ← utilisé Catalogue uniquement
  seo-ia.webp                  59KB  ← utilisé Catalogue, Home, Services
  support-ia.webp              60KB  ← utilisé Catalogue, Services
  Collaborateurs IA.mp4      1.55MB  ← vidéo hero ✓

public/automatisations/
  automatisation-hero.webp    102KB  ← poster hero (+ card CRM = bug)
  Automatisations.mp4        1.80MB  ← vidéo hero ✓
  commercial-ia.webp           6KB   ← non référencé dans la page
  gmail.webp                  25KB   ← icône utilisée incorrectement
  google-calendar.webp        26KB   ← icône utilisée incorrectement
  slack.webp                          ← non référencé
  telegram.webp                       ← non référencé
  whatsapp.webp                       ← non référencé
```

---

## 11. Motion & Animation

### 11.1 Principes

1. **Fonctionnel d'abord** — chaque animation aide à comprendre une transition d'état ou une hiérarchie
2. **Subtil** — rien ne distrait du contenu principal
3. **Rapide** — durées 150–400ms, jamais plus sur les interactions directes
4. **GPU uniquement** — `transform` et `opacity` exclusivement ; jamais `width`, `height`, `top`, `left`, `margin`
5. **Accessible** — toujours wrapped dans `@media (prefers-reduced-motion: no-preference)`

### 11.2 Catalogue de micro-interactions

| Élément | Trigger | Animation | Durée |
|---------|---------|-----------|-------|
| Bouton primary | hover | `translateY(-1px)` + shadow | 150ms |
| Bouton primary | click | `translateY(0)` + shadow réduite | 100ms |
| Card | hover | `translateY(-4px)` + `--shadow-md` | 250ms |
| Icône dans card | hover (via card) | `scale(1.10)` | 150ms |
| Lien nav | hover | underline slide gauche→droite | 200ms |
| Flèche CTA | hover (via lien) | `translateX(4px)` | 150ms |
| Dropdown | ouverture | `opacity 0→1` + `translateY(-6px→0)` | 200ms |
| Accordion FAQ | click | `max-height` + `opacity` + rotation icône `45deg` | 250ms |
| Badge carousel | changement | `width 8px→24px` (pill) | 300ms |
| Badge ● Loïc | passif | pulsation `scale(1→1.4→1)` | 1500ms boucle |
| Scroll reveal | IntersectionObserver | `fadeUp` : `opacity 0→1` + `translateY(20px→0)` | 400ms |
| Stagger cards | IntersectionObserver | délai `+80ms` à `+100ms` par enfant | 400ms |
| CountUp stats | IntersectionObserver | défilement numérique | 1200ms |
| Skip link | focus clavier | `translateY(-100%→0)` | 150ms |
| Widget Loïc ouverture | click | `scale(0.85→1)` + `opacity 0→1` + `translateY(16px→0)` | 250ms spring |
| Header transparent | scroll > 60px | backdrop blur + fond | 200ms |

### 11.3 Scroll reveal (pattern standard)

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

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

```js
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

### 11.4 Stagger (cards en grille)

```css
.card-grid .card:nth-child(1) { transition-delay: 0ms; }
.card-grid .card:nth-child(2) { transition-delay: 80ms; }
.card-grid .card:nth-child(3) { transition-delay: 160ms; }
.card-grid .card:nth-child(4) { transition-delay: 240ms; }
/* max 4 délais distincts pour éviter les trop longues attentes */
```

### 11.5 Règle `prefers-reduced-motion`

**Obligatoire sur toute animation CSS et JS.** Pattern standard :

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 12. Responsive

### 12.1 Philosophie

**Mobile-first** : toutes les règles CSS de base sont écrites pour `375px`. Les breakpoints `min-width` ajoutent progressivement.

Jamais : `max-width` media queries (sauf exception très ciblée). Jamais : styles desktop en base redéfinis pour mobile.

### 12.2 Breakpoints et comportements

| Breakpoint | Taille cible | Comportements clés |
|------------|-------------|-------------------|
| **Base (mobile)** | 375–639px | 1 colonne · nav drawer · CTAs pleine largeur · hero sans device frame · cards empilées |
| **sm** `640px` | Phablets | 2 colonnes pour items simples |
| **md** `768px` | Tablette portrait | 2 colonnes cards · stepper horizontal compact · proof bar 2×2 |
| **lg** `1024px` | Tablette paysage / laptop | Layout desktop de référence · hover states actifs · device frame visible |
| **xl** `1280px` | Desktop standard | Container centré `max-width: 1200px` · paddings augmentés |
| **2xl** `1536px` | Large desktop | Paddings XL · certains layouts peuvent passer en 4 colonnes |

### 12.3 Règles mobile prioritaires

- Navigation : **drawer uniquement** sur mobile (pas de nav horizontale scrollable)
- Hero device frame : `display: none` en dessous de `768px`
- Grilles cards : max 2 colonnes sur tablette, max 1 sur mobile (selon densité)
- Proof bar : `grid 2×2` sur mobile (pas 4 en ligne)
- Footer : 1 colonne · liens en 2 sous-colonnes · puis contact · puis légal
- Toutes zones cliquables : `min-height: 44px` et `min-width: 44px` (WCAG 2.5.5)
- Polices : jamais en dessous de `14px` (même micro-copy)
- Padding inline container : `24px` sur mobile

### 12.4 Adaptation typographique

| Classe | Mobile | Tablette `768px` | Desktop `1024px` |
|--------|--------|-----------------|-----------------|
| H1 hero | `--text-4xl` | `--text-5xl` | `--text-7xl` |
| H1 page | `--text-3xl` | `--text-4xl` | `--text-5xl` |
| H2 section | `--text-2xl` | `--text-3xl` | `--text-4xl` |
| Corps | `--text-base` | `--text-base` | `--text-lg` |
| Section padding | `64px 0` | `80px 0` | `96px 0` |

### 12.5 Touch targets

```css
/* Tous les éléments interactifs */
a, button, [role="button"], input, select, textarea {
  min-height: 44px;
  /* Pour les éléments visuellement plus petits, utiliser padding invisible */
}
```

---

## 13. Accessibilité

### 13.1 Niveau cible : WCAG 2.1 AA

L'accessibilité est une **contrainte de design**, pas une option post-livraison.

### 13.2 Contraste — Règles

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| `#0A0A0A` sur `#FFFFFF` | 21:1 | ✓ AA + AAA |
| Blanc sur `#0066FF` | 5.1:1 | ✓ AA |
| Blanc sur `#0A2540` | 17:1 | ✓ AA + AAA |
| `#4B5563` sur `#FFFFFF` | 7.6:1 | ✓ AA |
| `#9CA3AF` sur `#FFFFFF` | 3.8:1 | ✗ — texte interdit |

`--color-gray-400` : autorisé uniquement pour placeholders (exemptés WCAG) et éléments purement décoratifs.

### 13.3 Navigation clavier

- **Focus visible** : `outline: 2px solid var(--color-primary); outline-offset: 3px` sur **tous** les éléments interactifs. Jamais `outline: none` sans alternative.
- **Ordre de tabulation** : suit l'ordre visuel (DOM ordonné)
- **Skip link** : `<a href="#main-content" class="skip-link">Aller au contenu principal</a>` — visible au focus, positionné en premier dans le DOM
- **Focus trap** : actif dans modales, drawers, widget Loïc
- **Escape** : ferme toute modale, drawer, dropdown

### 13.4 Structure HTML sémantique

```html
<header>          <!-- Navigation principale -->
<main id="main-content">
  <section aria-label="[Nom descriptif]">
    <h1>         <!-- Un seul par page -->
    <h2>         <!-- Sections majeures -->
    <h3>         <!-- Sous-sections -->
  </section>
</main>
<footer role="contentinfo">
  <nav aria-label="Navigation footer — [Catégorie]">
  <address>      <!-- Coordonnées -->
</footer>
```

Hiérarchie H stricte : H1 → H2 → H3, **jamais de saut de niveau**.

### 13.5 ARIA patterns par composant

| Composant | Pattern ARIA |
|-----------|-------------|
| Header nav | `<nav aria-label="Navigation principale">` |
| Menu mobile | `role="dialog"` + `aria-modal="true"` + `aria-label` |
| Dropdown | `aria-haspopup="true"` + `aria-expanded="false/true"` |
| FAQ accordion | `<details>/<summary>` natif, ou `role="region"` + `aria-expanded` |
| Carousel | `aria-roledescription="carousel"` + prev/next avec labels explicites |
| Widget Loïc | `role="dialog"` + focus trap + `aria-label="Assistant Loïc"` |
| Progress bar | `role="progressbar"` + `aria-valuenow` + `aria-valuemax` |
| Tabs | `role="tablist"` + `role="tab"` + `aria-selected` |
| CountUp stats | Valeur finale dans le DOM dès le chargement (animation cosmétique) |
| Icône décorative | `aria-hidden="true"` |
| Icône fonctionnelle seule | `aria-label="[Action]"` sur le bouton parent |

### 13.6 Formulaires

- Labels visibles associés `for`/`id`
- Champs requis : `required` + `aria-required="true"` + astérisque visuel
- Erreurs : `aria-describedby`, sous le champ, rouge + icône ⚠
- `autocomplete` renseigné : `name`, `email`, `tel`, `given-name`, `family-name`, `organization`
- Pas de CAPTCHA visuel — Cloudflare Turnstile (invisible) si nécessaire

### 13.7 Préférences système

| Préférence | Comportement CA-TECH |
|-----------|---------------------|
| `prefers-reduced-motion: reduce` | Toutes animations désactivées / fade simple |
| `prefers-color-scheme: dark` | Non requis V1, tokens préparés pour V2 |
| `prefers-contrast: high` | Bordures renforcées, couleurs plus tranchées |
| Zoom 200% | Mise en page lisible, pas d'overflow, pas de texte tronqué |

### 13.8 Checklist de validation

Avant toute mise en ligne :
- [ ] axe DevTools — 0 violation critique
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Navigation clavier complète (Tab, Shift+Tab, Enter, Escape, flèches)
- [ ] VoiceOver (Mac/iOS) sur les 5 pages P0
- [ ] NVDA (Windows) sur les 5 pages P0
- [ ] Zoom 200% — aucun contenu tronqué

---

## 14. Contraintes design de performance

### 14.1 Core Web Vitals cibles

| Métrique | Mobile | Desktop |
|----------|--------|---------|
| **LCP** | < 2.5s | < 1.8s |
| **CLS** | < 0.1 | < 0.05 |
| **INP** | < 200ms | < 100ms |
| **FCP** | < 1.8s | < 1.2s |
| **TTFB** | < 600ms | < 400ms |

Scores Lighthouse cibles : Performance ≥ 90 · Accessibilité ≥ 95 · Bonnes pratiques ≥ 95 · SEO 100.

**Ces scores sont des exigences de livraison, pas des objectifs.**

### 14.2 Budget de poids de page

| Ressource | Limite |
|-----------|--------|
| HTML initial | < 30 Ko gzippé |
| CSS critique (inline) | < 14 Ko |
| CSS total | < 80 Ko |
| JavaScript bloquant | 0 Ko |
| JavaScript total (différé) | < 150 Ko |
| Images (page entière) | < 500 Ko |
| Polices | < 80 Ko (2 weights max par page) |
| **Total page** | **< 1 Mo** |

### 14.3 Décisions design impactant les CWV

| Décision | Impact |
|----------|--------|
| `width` + `height` définis sur toutes les images | CLS → 0 |
| Pas de `position: absolute` sans dimensions | CLS → 0 |
| Skeleton screens (pas spinners) | LCP perçu meilleur |
| `font-display: swap` + preload | LCP réduit |
| Animations sur `transform/opacity` uniquement | INP < 200ms garanti |
| Pas de script tiers bloquant dans `<head>` | LCP réduit |
| `loading="lazy"` hors fold | LCP réduit |
| `fetchpriority="high"` sur l'image hero | LCP réduit |

### 14.4 Polices — stratégie

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" as="font" href="inter-400.woff2" crossorigin>
<link rel="preload" as="font" href="inter-600.woff2" crossorigin>
<link rel="preload" as="font" href="inter-800.woff2" crossorigin>
```

- 3 poids maximum chargés : 400 / 600 / 800
- `font-display: swap`
- JetBrains Mono : chargé uniquement sur les pages qui l'utilisent

### 14.5 JavaScript — règles de performance

- **Zéro script bloquant** dans `<head>`
- Tous les scripts : `defer` ou `async`
- Widget Loïc : chargé après `DOMContentLoaded`
- GA4 : chargé après `load` event ou via `requestIdleCallback`
- Animations (`IntersectionObserver`) : natif, pas de librairie externe
- CountUp stats : librairie < 3 Ko, `defer`
- **Pas de jQuery, pas de Bootstrap**

### 14.6 Cache & CDN (Vercel)

- Assets avec hash : `Cache-Control: public, max-age=31536000, immutable`
- HTML : `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`

---

## 15. DO / DON'T

### 15.1 Typographie

| ✅ DO | ❌ DON'T |
|-------|---------|
| Inter en 3 poids : 400, 600, 800 | Utiliser d'autres poids Inter |
| Letter-spacing négatif sur les titres `-0.02em` | Étirer ou comprimer typographiquement |
| `line-height: 1.7` sur le corps | `line-height` inférieur à 1.5 sur le corps |
| Hiérarchie H1→H2→H3 stricte | Sauter des niveaux de titre |
| Minimum 14px en mobile | Police < 14px sur n'importe quel device |
| `color: #4B5563` pour le texte secondaire | `color: #9CA3AF` pour du texte informatif |

### 15.2 Couleurs

| ✅ DO | ❌ DON'T |
|-------|---------|
| `#0066FF` pour les CTA et liens actifs | Utiliser l'acid-lime de Linear |
| Bleu primaire sur fond blanc | Texte gris clair sur fond blanc (ratio insuffisant) |
| Gradient bleu uniquement pour les sections CTA finales | Gradient sur chaque section |
| Fonds alternés `--color-gray-50` | Backgrounds colorés non validés |
| Blanc `#FFFFFF` comme fond principal | Fond beige, crème ou gris très chaud |

### 15.3 Layout

| ✅ DO | ❌ DON'T |
|-------|---------|
| Sections respirantes `96px 0` desktop | Sections compressées < 48px |
| `max-width: 1200px` centré | Contenu pleine largeur écran (> 1200px) |
| Composition asymétrique quand possible | Tout centré, tout symétrique |
| Hiérarchie visuelle forte (1 élément dominant par section) | Plusieurs éléments de même poids |
| Espaces blancs généreux | Remplir chaque pixel de contenu |

### 15.4 Composants

| ✅ DO | ❌ DON'T |
|-------|---------|
| Un seul CTA primaire par page/section | 3+ CTA primaires en compétition |
| `Button white xl` sur fond gradient sombre | `Button primary` sur fond bleu (invisible) |
| Icônes Lucide stroke 1.5 | Icônes mixtes (Font Awesome + Lucide + …) |
| Cards avec hover subtle `-4px translate` | Hover cards trop dramatiques (zoom, glow excessif) |
| Skeleton screens pendant le chargement | Spinner global de page entière |

### 15.5 Images

| ✅ DO | ❌ DON'T |
|-------|---------|
| WebP pour toutes les photos | JPEG ou PNG non compressé |
| `width` + `height` toujours définis | Images sans dimensions (CLS) |
| Alt text descriptif et contextuel | `alt="image"` ou `alt="photo"` |
| SVG pour les icônes d'outils | JPEG/WebP d'une icône |
| Photos cohérentes (même éclairage) | Mix de styles photos non cohérents |

### 15.6 Motion

| ✅ DO | ❌ DON'T |
|-------|---------|
| `transform` + `opacity` uniquement | Animer `width`, `height`, `top`, `margin` |
| Durées 150–400ms | Animations > 600ms sur des interactions directes |
| `prefers-reduced-motion` respecté | Ignorer les préférences d'accessibilité motion |
| Animations fonctionnelles (feedback d'état) | Animations purement décoratives sans fonction |

### 15.7 Architecture générale

| ✅ DO | ❌ DON'T |
|-------|---------|
| Apple · Stripe · Vercel · Linear comme **références** | Copier directement un design system externe |
| Glassmorphism subtil et ciblé | Glassmorphism sur tous les éléments |
| Cohérence tokens (CSS custom properties) | Valeurs hardcodées hors tokens |
| Composants réutilisables | Duplication de styles dans chaque composant |
| Mobile-first CSS | Media queries `max-width` comme approche principale |

---

## 16. Table des conflits entre sources

> Sources consultées pour ce document :
> - `docs/DESIGN_SYSTEM.md` — tokens et composants
> - `docs/DESIGN_RULES.md` — règles DO/DON'T
> - `docs/UX_UI_SPECIFICATION.md` — spécifications pages et comportements
> - `docs/UX_UI_QUICKREF.md` — référence rapide
> - `docs/SITE_ARCHITECTURE.md` — architecture et SEO
> - `docs/HOMEPAGE_SPECIFICATION.md` — spécification homepage
> - `src/pages/CollaborateursIA.jsx` + `.css` — implémentation réelle
> - `src/pages/Automatisations.jsx` — implémentation réelle
> - `docs/LINEAR-DESIGN-REFERENCE.md` — **FICHIER ABSENT** (référencé mais non trouvé dans le repo)

| Conflit | Source A | Source B | Résolution |
|---------|----------|----------|-----------|
| **Radius bouton** | `DESIGN_SYSTEM.md` : `--radius-md (10px)` | Aucun conflit détecté | → `--radius-md` |
| **Padding section** | `DESIGN_SYSTEM.md` : `80px 0` | `UX_UI_SPECIFICATION.md` : `96px 0` | → `96px 0` (plus généreux, conforme Apple/Stripe) |
| **Max-width** | `DESIGN_SYSTEM.md` : `1200px` | `UX_UI_SPECIFICATION.md` : `1200px` | → `1200px` ✓ consensus |
| **Couleur texte secondaire** | `DESIGN_SYSTEM.md` : `--color-gray-600 (#4B5563)` | Implémentation JSX : `#6b7280 (gray-500)` | → `#4B5563` (ratio WCAG 7.6:1 vs 5.7:1) |
| **Transition cards** | `DESIGN_SYSTEM.md` : `250ms` | `HOMEPAGE_SPECIFICATION.md` : `250ms` | → `250ms` ✓ consensus |
| **Inter poids** | `DESIGN_SYSTEM.md` : 400/600/700/800 | Ce document : 400/600/800 seulement | → 400/600/800 (700 introduit une quasi-duplicate de 800) |
| **Font-size minimum** | `UX_UI_SPECIFICATION.md` : `14px` | `DESIGN_SYSTEM.md` : `--text-xs = 12px` | → 12px autorisé pour badges/labels uniquement, jamais pour corps |
| **Ombres bleues** | `DESIGN_SYSTEM.md` : définies | `DESIGN_RULES.md` : pas de mention explicite | → Autorisées avec parcimonie (CTA, hover primary uniquement) |
| **CollaborateursIA images** | Implémentation JSX : Unsplash CDN | Assets locaux présents dans `/public/collaborateurs/` | → Fichiers locaux à utiliser (Sprint 3B) |

---

## 17. 10 Principes fondamentaux

Ces 10 principes sont non-négociables. Ils gouvernent toute décision de design CA-TECH.

---

### Principe 1 — La clarté avant la beauté

Chaque élément doit d'abord être **compréhensible**, ensuite beau. Si une décision esthétique nuit à la clarté du message ou à la hiérarchie d'information, elle est refusée. Un design confus ne convertit pas, quelle que soit sa sophistication graphique.

---

### Principe 2 — Un CTA par contexte, pas plus

Chaque section de page, chaque écran mobile, chaque card complexe expose **un seul CTA primaire**. La concurrence entre plusieurs CTAs de même poids crée la paralysie décisionnelle. Les CTAs secondaires existent mais restent visuellement subalternesz (ghost, lien texte).

---

### Principe 3 — L'espace blanc est du contenu

L'espace vide n'est pas un manque — c'est ce qui donne de la valeur aux éléments présents. Les sections respirent à `96px` vertical desktop. Les cards ne sont jamais surchargées. L'espace crée la hiérarchie.

---

### Principe 4 — Mobile-first sans compromis

Le design de référence est `375px`. Toute contrainte résolue sur mobile est une contrainte résolue partout. Toute décision prise uniquement pour desktop devra être refaite pour mobile. Le code CSS est écrit base-mobile, enrichi par des media queries `min-width`.

---

### Principe 5 — Les tokens sont la loi

Aucune valeur de couleur, taille, espace, radius ou durée n'est hardcodée hors des tokens définis dans §3. Un `#0066FF` hardcodé dans un composant est un bug, pas un raccourci. Les tokens permettent la cohérence systémique et les futurs changements globaux en un point.

---

### Principe 6 — Performance = respect de l'utilisateur

LCP < 2.5s mobile n'est pas un objectif technique optionnel — c'est du respect pour le visiteur. Budget JS < 150Ko, images WebP avec dimensions définies, zéro animation sur propriétés layout : ces règles ne sont pas négociables en faveur d'une feature. La performance est un feature.

---

### Principe 7 — L'accessibilité est un prérequis

WCAG 2.1 AA n'est pas une checklist de conformité légale — c'est la définition d'un design professionnel. Focus visible, contraste 4.5:1 minimum, navigation clavier, ARIA patterns : ces exigences sont intégrées dès la conception, pas ajoutées après livraison.

---

### Principe 8 — Cohérence systémique > Créativité locale

Un composant cohérent avec le système vaut mieux qu'un composant brillant mais isolé. Avant de créer un nouveau composant, chercher s'il peut être exprimé avec les composants existants. Avant d'ajouter une couleur, chercher si un token existant convient. La créativité s'exprime dans la composition, pas dans la multiplication des exceptions.

---

### Principe 9 — Loïc est le cœur du produit

Loïc n'est pas un widget de chat. Il est la **preuve produit vivante** de ce que CA-TECH vend. Son widget est présent sur toutes les pages, toujours fonctionnel, jamais intrusif. Toute dégradation de l'expérience Loïc est une dégradation de la proposition de valeur de CA-TECH.

---

### Principe 10 — Le design sert la croissance

CA-TECH mesure chaque euro investi. Le design obéit à la même logique : chaque décision est arbitrée par son impact sur la conversion, la confiance, ou la rétention. Un design "beau mais inerte" est un échec. Les métriques (LCP, CLS, taux de conversion, Lighthouse) sont les juges objectifs du design.

---

## 18. Synthèse opérationnelle

### 18.1 Fichiers de référence par contexte

| Besoin | Fichier(s) à consulter |
|--------|----------------------|
| Tokens couleurs / espaces / typo | `docs/DESIGN_SYSTEM.md` §1-3 + §3 de ce document |
| Composants détaillés | `docs/DESIGN_SYSTEM.md` §4-15 + §6 de ce document |
| Règles DO/DON'T | `docs/DESIGN_RULES.md` + §15 de ce document |
| Architecture de page, SEO | `docs/SITE_ARCHITECTURE.md` |
| Spécification homepage complète | `docs/HOMEPAGE_SPECIFICATION.md` |
| Spécification UX complète (all pages) | `docs/UX_UI_SPECIFICATION.md` |
| Stratégie business, Loïc, roadmap | `STRATEGY.md` (§6 pour Loïc) |
| Collaborateurs IA (implémentation) | `src/pages/CollaborateursIA.jsx` + `.css` |
| Automatisations (implémentation) | `src/pages/Automatisations.jsx` |
| Loïc backend | `supabase/functions/loic-chat/index.ts` |

### 18.2 Checklist de livraison design

Avant toute PR de feature frontend :

**Performance :**
- [ ] `width` + `height` sur toutes les images
- [ ] `loading="lazy"` sur les images hors fold
- [ ] Pas de script bloquant dans `<head>`
- [ ] Animations sur `transform`/`opacity` uniquement
- [ ] Lighthouse Performance ≥ 90

**Accessibilité :**
- [ ] Focus visible sur tous les interactifs
- [ ] Hiérarchie H correcte
- [ ] Alt text sur les images informatives
- [ ] Ratio contraste ≥ 4.5:1 sur tout texte
- [ ] Lighthouse Accessibility ≥ 95

**Design System :**
- [ ] Aucune valeur hors tokens
- [ ] Police Inter 400/600/800 uniquement
- [ ] Breakpoints `min-width` uniquement
- [ ] Un seul CTA primaire par section

**Responsive :**
- [ ] Testé à 375px (iPhone SE)
- [ ] Testé à 768px (tablette)
- [ ] Touch targets ≥ 44×44px
- [ ] Pas de texte < 14px sur mobile

### 18.3 Prochaines actions identifiées (Sprint 3B)

| Priorité | Action | Impact |
|----------|--------|--------|
| 🔴 | Remplacer les 6 images Unsplash de CollaborateursIA.jsx par des assets locaux cohérents | Qualité visuelle + indépendance réseau |
| 🔴 | Créer une image dédiée pour la card "CRM intelligent" (séparer de hero.webp) | Cohérence visuelle |
| 🔴 | Remplacer `gmail.webp` et `google-calendar.webp` par des SVG inline | Format correct |
| 🔴 | Corriger le doublon Unsplash Commercial IA / Reporting automatique | Unicité visuelle |
| 🟠 | Unifier la direction artistique des 6 portraits collaborateurs | Cohérence de marque |

---

*CA-TECH Design System v1.0 — Septembre 2026*
*Sources : DESIGN_SYSTEM.md · DESIGN_RULES.md · UX_UI_SPECIFICATION.md · UX_UI_QUICKREF.md · SITE_ARCHITECTURE.md · HOMEPAGE_SPECIFICATION.md · CollaborateursIA.jsx · Automatisations.jsx*
*Note : docs/LINEAR-DESIGN-REFERENCE.md référencé dans les sources mais absent du repo au moment de la rédaction. Les références Linear ont été synthétisées depuis DESIGN_RULES.md et UX_UI_SPECIFICATION.md.*
