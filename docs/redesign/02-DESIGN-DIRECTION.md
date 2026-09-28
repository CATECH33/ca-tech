# 02 — DESIGN DIRECTION
## CA-TECH V2 — Direction Artistique & Design System
**Date :** 28 septembre 2026

---

## Intention globale

CA-TECH V2 doit incarner **PREMIUM · ÉDITORIAL · TECHNOLOGIQUE · HUMAIN · FRANÇAIS · PRÉCIS · CONFIANT**.

Ce n'est pas un dark mode pour faire "moderne". C'est une posture de fond profond (Deep Navy #05101E) qui communique sérieux, nuit, profondeur, maîtrise — comme un bureau de direction en fin de journée. La typographie fait le travail que les décorations ne doivent pas faire.

---

## Direction artistique

### Univers visuel cible

**Ton :** Cabinet conseil / Magazine technologique / Éditeur de luxe technique  
**Contraste :** Pas blanc sur noir. Navy profond sur lequel le Technical Blue et le blanc respirent.  
**Texture :** Grilles fines, bordures hairline, pas de surfaces lourdes.  
**Photographie :** Vraie équipe, vrais projets, vrais écrans. Jamais d'illustrations abstraites.  
**Iconographie :** Linéaire, fine, technique. Pas d'emojis, pas d'icônes rondes cartoonesques.

### Ce que le site doit ressentir

Quand un prospect ouvre CA-TECH V2, il doit ressentir :
> "Ces gens savent ce qu'ils font. Le site prouve qu'ils ont du goût, de la méthode, et qu'ils prennent mon activité au sérieux."

Il ne doit PAS ressentir :
> "Encore un template d'agence digitale généré par IA."

---

## Palette de couleurs

### Couleurs de base

| Token | Valeur | Rôle |
|-------|--------|------|
| `--deep-navy` | `#05101E` | Fond principal — toile de fond sombre et profonde |
| `--navy` | `#102740` | Surfaces élevées, cards, nav |
| `--technical-blue` | `#1A4066` | Fond de sections secondaires, borders actives |
| `--tech-blue` | `#359BD9` | Accent principal — CTA, liens, emphasis |
| `--silver` | `#A5ACB5` | Corps de texte secondaire, labels |
| `--light-silver` | `#E0E0E3` | Corps de texte principal sur fond sombre |
| `--cool-white` | `#F2F4F6` | Texte haute importance, titres |

### Couleurs fonctionnelles

| Token | Valeur | Rôle |
|-------|--------|------|
| `--surface-0` | `#05101E` | Page canvas |
| `--surface-1` | `#102740` | Cards, panels |
| `--surface-2` | `#1A4066` | Cards élevées, hovers |
| `--border-default` | `rgba(255,255,255,0.08)` | Bordures subtiles sur fond sombre |
| `--border-active` | `rgba(53,155,217,0.35)` | Bordures actives / focus |
| `--text-primary` | `#F2F4F6` | Titres, corps important |
| `--text-secondary` | `#A5ACB5` | Texte secondaire, captions |
| `--text-accent` | `#359BD9` | Liens, emphasis, accents |

### Couleurs sémantiques

| Token | Valeur | Rôle |
|-------|--------|------|
| `--success` | `#10B981` | États positifs (conserver) |
| `--warning` | `#F59E0B` | Alertes (conserver) |
| `--error` | `#EF4444` | Erreurs (conserver) |

### Règle d'usage de l'accent

Le `--tech-blue: #359BD9` est l'unique couleur chromatique vive de l'interface.
- ✅ Liens, CTAs, états actifs, emphasis inline, icônes d'action
- ✅ Un mot par titre en italic Tech Blue (signature typographique)
- ❌ Backgrounds larges, sections entières
- ❌ Plusieurs accents différents par page

---

## Typographie

### Famille principale

| Rôle | Famille | Poids | Usage |
|------|---------|-------|-------|
| Display | IBM Plex Serif | 300 | Hero headlines, titres de section |
| Heading | IBM Plex Serif | 300–400 | H2, H3 éditoriaux |
| Body | IBM Plex Sans | 300–400 | Corps de texte |
| UI | IBM Plex Sans | 400–500 | Nav, boutons, labels, badges |
| Caption | IBM Plex Sans | 300 | Captions, sous-titres techniques |

**Rajdhani : supprimé.**  
**Inter : remplacé par IBM Plex Sans.**

### Scale typographique

| Token | Taille | Poids | Famille | Rôle |
|-------|--------|-------|---------|------|
| `--text-display` | 56–72px | 300 | Serif | Hero principal |
| `--text-heading` | 40–48px | 300 | Serif | Titres de sections |
| `--text-heading-sm` | 28–32px | 400 | Serif | H3, sous-titres |
| `--text-subheading` | 20–24px | 500 | Sans | Labels de sections, eyebrows |
| `--text-body-lg` | 17–18px | 400 | Sans | Corps de texte long |
| `--text-body` | 15–16px | 400 | Sans | Corps standard |
| `--text-ui` | 14px | 500 | Sans | Boutons, nav |
| `--text-caption` | 11–12px | 300–400 | Sans | Captions, métadonnées |

### Ligne de conduite typographique

1. **Les titres sont en Serif poids 300** — jamais en gras, jamais en Sans
2. **Un mot ou une courte phrase par titre est en italic Tech Blue** — signature CA-TECH
3. **Line-height des display : 1.05–1.10** — serré, éditorial
4. **Letter-spacing des titres : -0.02em à -0.03em** — resserré
5. **Largeur de colonne texte : 60–65 caractères max** — jamais full-width
6. **Texte justifié : interdit** — alignement gauche exclusivement

---

## Espacement & Layout

### Grille

- Container max : **1280px**
- Gutters : **40px desktop / 24px mobile**
- Colonnes : **12** (CSS Grid natif)
- Breakpoints : `480px` / `768px` / `1024px` / `1280px`

### Rythme vertical

| Token | Valeur | Usage |
|-------|--------|-------|
| `--space-section` | `120–160px` | Entre sections majeures |
| `--space-component` | `64–80px` | Entre composants dans une section |
| `--space-element` | `24–32px` | Entre éléments (heading → body) |
| `--space-tight` | `12–16px` | Entre éléments liés (label → valeur) |

---

## Radius & Borders

| Élément | Radius |
|---------|--------|
| Cards / Panels | `4px` à `8px` max |
| Inputs / Forms | `4px` |
| Badges / Tags | `2px` (quasi-carré, technique) |
| Boutons CTA | `4px–6px` (pas de pilule) |
| Images | `0` (bords francs, éditorial) |

**Règle :** Plus le composant est important/large, plus le radius est faible. Le premium vient de la précision, pas de la rondeur.

---

## Ombres & Élévation

**Pas de shadows decoratives.** La hiérarchie est créée par :
1. La couleur des surfaces (surface-0 < surface-1 < surface-2)
2. Les bordures hairline (`border: 1px solid var(--border-default)`)
3. L'espacement

**Exception unique :** `box-shadow: 0 0 0 1px var(--border-active)` pour les états focus/hover actifs — jamais de shadow diffuse.

---

## Imagerie

### Règles

- **Vraies captures d'écran** des produits livrés (Manager, Loïc, projets clients)
- **Photos équipe** : naturelles, en contexte de travail
- **Aucune illustration abstraite** : pas de cerveaux IA, hologrammes, réseaux de neurones
- **Format :** WebP exclusive, fallback PNG, lazy loading systématique
- **Traitement :** photos en couleur naturelle, pas de filtres teal-orange, pas de vignettage

### Ratio par contexte

| Contexte | Ratio |
|---------|-------|
| Hero | 16:9 ou pleine hauteur viewport |
| Case study featured | 16:9 |
| Case study thumbnail | 4:3 |
| Portrait équipe | 1:1 |
| Logo/icône | 1:1 |

---

## Tonalité des CTAs

| Situation | CTA | Ton |
|-----------|-----|-----|
| CTA principal hero | "Parler de votre projet" | Direct, non-transactionnel |
| CTA secondaire hero | "Voir nos réalisations" | Preuve avant engagement |
| CTA de section | "En savoir plus" | Sobre, pas de flèche systématique |
| CTA final page | "Démarrer un diagnostic" | Acte précis, gratuit |
| Nav CTA | "Démarrer" | Court, sec |

**Règle :** Pas de "→" systématique. Pas de "Découvrir" générique. L'action doit être précise.

---

## Modes clair/sombre

**V2 est dark-first.** Un mode clair peut être prévu en Phase 3 mais n'est pas dans le scope immédiat. La charte s'applique en mode sombre.

---

## Résumé — Identité visuelle en une phrase

> CA-TECH V2 est un espace de nuit profonde (`#05101E`) où la lumière technique (`#359BD9`) guide le regard, et où la typographie sérif-light porte la crédibilité sans en avoir besoin.
