# WEB & SAAS — Briefs visuels
## CA-TECH V2 — Section Web & SaaS
**Date :** 28 septembre 2026
**Référence :** `09-VISUAL-STORYBOARD.md` — section Web & SaaS

---

## Décision : CSS ou image ?

**Les screenshots réels sont la priorité absolue.** Aucune image générée ne remplace un vrai produit livré.

Répartition par slide :
| Slide | Approche | Asset |
|-------|----------|-------|
| Idée | CSS pur | Wireframe blocks |
| Structure | CSS pur | Arbre typographique |
| Interface | Real asset + CSS | `ca-tech-manager/home.webp` |
| Produit | Real asset + CSS badge | `ca-tech-manager/dashboard.webp` |
| Expérience finale | Real assets × 3 | Stack de 3 screenshots |

Les prompts Midjourney ci-dessous sont des fallbacks si un screenshot est manquant ou de mauvaise qualité.

---

## Contraintes visuelles absolues (rappel DESIGN.md)

```
INTERDIT dans cette section :
- Device frames (MacBook, iPhone)
- Mockups de navigateur complets avec barre d'URL visible
- Images de mains tenant un écran
- Interfaces fictives non liées aux vrais produits CA-TECH

REQUIS :
- Section dark : fond #05101E
- Les screenshots flottent — pas de cadre
- Ombre prononcée : box-shadow: 0 24px 60px rgba(0,0,0,.4)
- Inclinaison légère : ±2–6deg (pas plus)
```

---

## Surface et structure

**Fond :** `#05101E` Deep Navy — section dark
**Split inversé :** 60% visuel (gauche) / 40% texte (droite) — inversion de IA pour créer un rythme
**Indicateur de progression :** Dots (5px) — actif = accent pill 16px, inactifs = accent 30%. Pas de numéros.

---

## Slide WEB — Idée

**Intent :** Montrer que le travail commence par la structure, pas l'esthétique.

**Visuel CSS :**
Wireframe simplifié — blocs gris représentant les zones d'une page. Fond `#102740`. Pas de couleur. Pas de contenu. Juste l'ossature.

```css
.web-wireframe {
  background: var(--canvas-1);   /* #102740 */
  border: 1px solid var(--border-dk);
  border-radius: var(--r-card);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.wf-block {
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  opacity: 0;
  animation: wf-appear 250ms ease-out forwards;
}

/* Navigation */
.wf-nav    { height: 12px; }
/* Hero */
.wf-hero   { height: 80px; }
/* Features — 3 colonnes */
.wf-cols   { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.wf-col    { height: 48px; }
/* Footer */
.wf-footer { height: 12px; margin-top: 4px; }

/* Stagger de haut en bas */
.wf-nav            { animation-delay: 0ms; }
.wf-hero           { animation-delay: 60ms; }
.wf-col:nth-child(1) { animation-delay: 120ms; }
.wf-col:nth-child(2) { animation-delay: 160ms; }
.wf-col:nth-child(3) { animation-delay: 200ms; }
.wf-footer         { animation-delay: 260ms; }

@keyframes wf-appear {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Motion :** Les blocs apparaissent de haut en bas, 60ms stagger. Aucune couleur d'accent.

---

## Slide WEB — Structure

**Intent :** La rigueur technique avant toute ligne de code visible.

**Visuel CSS :**
Arbre de composants React — style terminal, monospace.

```
App
├── Navigation
├── Hero
│   ├── Headline
│   └── CTAs
├── Features
│   └── Card × 3
└── Footer
```

```css
.web-tree {
  background: var(--canvas-1);
  border: 1px solid var(--border-dk);
  border-radius: var(--r-card);
  padding: 28px 36px;
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
}

.web-tree-line {
  display: block;
  color: var(--t-dark-2);
  opacity: 0;
  animation: tree-line 250ms ease-out forwards;
}

/* Les branches */
.web-tree-line .branch {
  color: rgba(255,255,255,0.15);
}

/* Le nom du composant */
.web-tree-line .component { color: var(--t-dark-1); }

/* Stagger */
.web-tree-line:nth-child(1) { animation-delay: 0ms; }
.web-tree-line:nth-child(2) { animation-delay: 80ms; }
.web-tree-line:nth-child(3) { animation-delay: 160ms; }
.web-tree-line:nth-child(4) { animation-delay: 210ms; }
.web-tree-line:nth-child(5) { animation-delay: 260ms; }
.web-tree-line:nth-child(6) { animation-delay: 320ms; }
.web-tree-line:nth-child(7) { animation-delay: 370ms; }
.web-tree-line:nth-child(8) { animation-delay: 430ms; }

@keyframes tree-line {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

**Motion :** Branches se déploient de la racine vers les feuilles, 80ms stagger.

---

## Slide WEB — Interface

**Intent :** Le moment où le design prend vie — premier aperçu du produit réel.

**Visuel :** Real asset + CSS
- Carte desktop : `portfolio/ca-tech-manager/home.webp` — `rotate(-2deg)`, ombre `--shadow-mockup`
- Carte mobile derrière : CSS simplifié — `rotate(3deg)`, opacity 0.6

```css
.web-mockup-pair {
  position: relative;
  width: 100%;
  height: 340px;
}

/* Carte CSS mobile (fond) */
.web-card--mobile-bg {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 120px;
  height: 240px;
  background: var(--canvas-1);
  border: 1px solid var(--border-dk);
  border-radius: 16px;
  transform: rotate(3deg);
  opacity: 0.6;
  box-shadow: var(--shadow-mockup);
  z-index: 1;
}

/* Screenshot desktop (avant) */
.web-card--desktop {
  position: absolute;
  left: 0;
  top: 0;
  width: calc(100% - 60px);
  border-radius: var(--r-card);
  transform: rotate(-2deg);
  box-shadow: var(--shadow-mockup);
  z-index: 2;
  object-fit: cover;
}

/* Entrée */
.web-card--mobile-bg { animation: slide-from-right 500ms ease-out both; }
.web-card--desktop   { animation: slide-from-left  500ms ease-out both; }

@keyframes slide-from-right {
  from { opacity: 0; transform: rotate(3deg) translateX(40px); }
  to   { opacity: 0.6; transform: rotate(3deg) translateX(0); }
}

@keyframes slide-from-left {
  from { opacity: 0; transform: rotate(-2deg) translateX(-40px); }
  to   { opacity: 1; transform: rotate(-2deg) translateX(0); }
}
```

**Asset disponible :** `public/portfolio/ca-tech-manager/home.webp` ✓

**Motion :** Les deux éléments glissent depuis les côtés, s'installent avec rebond léger (ease-out avec légère overshoot).

---

## Slide WEB — Produit

**Intent :** La qualité mesurable — performance comme argument commercial.

**Visuel :** Real asset + CSS badge
- `portfolio/ca-tech-manager/dashboard.webp` — incliné `rotate(-1.5deg)`, ombre prononcée
- Badge Lighthouse typographique flottant sur la carte

```css
.web-product {
  position: relative;
}

.web-product-img {
  width: 100%;
  border-radius: var(--r-card);
  transform: rotate(-1.5deg);
  box-shadow: var(--shadow-mockup);
  animation: scale-in 400ms ease-out both;
}

.web-lighthouse-badge {
  position: absolute;
  top: 24px;
  right: -12px;
  background: var(--canvas);
  border: 1px solid var(--border-dk);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 3;
  animation: badge-appear 300ms 400ms ease-out both;
}

.lh-metric {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.lh-score {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--t-dark-1);
  line-height: 1;
  min-width: 2ch;
  text-align: right;
}

.lh-label {
  font-size: 11px;
  color: var(--t-dark-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@keyframes scale-in {
  from { opacity: 0; transform: rotate(-1.5deg) scale(0.92); }
  to   { opacity: 1; transform: rotate(-1.5deg) scale(1); }
}

@keyframes badge-appear {
  from { opacity: 0; transform: scale(0.85) translateX(8px); }
  to   { opacity: 1; transform: scale(1) translateX(0); }
}
```

**Contenu du badge :**
```
98   Performance
100  Accessibilité
100  SEO
```

**Asset disponible :** `public/portfolio/ca-tech-manager/dashboard.webp` ✓

**Motion :** La carte scale de 0.9 à 1.0. Le badge pulse doucement après son apparition.

---

## Slide WEB — Expérience finale

**Intent :** Fermeture de la section — vision globale du portfolio.

**Visuel :** Real assets × 3
Stack de 3 cartes avec les vrais projets — superposées, décalées.

```css
.web-stack {
  position: relative;
  height: 320px;
}

/* Fond */
.web-card--back-2 {
  position: absolute;
  width: 80%;
  left: 10%;
  top: 0;
  border-radius: var(--r-card);
  box-shadow: var(--shadow-mockup);
  transform: rotate(6deg) translateY(24px) translateX(16px);
  opacity: 0.45;
  z-index: 1;
  object-fit: cover;
}

/* Milieu */
.web-card--back {
  position: absolute;
  width: 88%;
  left: 6%;
  top: 0;
  border-radius: var(--r-card);
  box-shadow: var(--shadow-mockup);
  transform: rotate(3deg) translateY(12px);
  opacity: 0.7;
  z-index: 2;
  object-fit: cover;
}

/* Avant */
.web-card--front {
  position: absolute;
  width: 92%;
  left: 4%;
  top: 0;
  border-radius: var(--r-card);
  box-shadow: var(--shadow-mockup);
  transform: rotate(-2deg);
  opacity: 1;
  z-index: 3;
  object-fit: cover;
}
```

**Assets disponibles :**
- Fond : `public/portfolio/cv-magic/home.webp` ✓
- Milieu : `public/portfolio/ca-tech-manager/home.webp` ✓
- Avant : `public/portfolio/ca-tech-manager/dashboard.webp` ✓

**Motion :** Les cartes convergent depuis leurs positions initiales (éparpillées) vers la composition finale.

---

## Prompt Midjourney — Fallback uniquement

À n'utiliser que si un screenshot est inutilisable (résolution trop basse, contenu confidentiel).

**Fallback Interface (si home.webp indisponible) :**
```
dark minimal SaaS dashboard screenshot, deep navy #05101E background,
left sidebar with 5 menu items in silver, active item highlighted in tech blue,
main area: data table with 6 rows, header with search bar,
no bright colors except tech blue on active elements,
clean premium admin panel, Vercel/Linear dark style,
no device frame, just the screen content --ar 4:3 --style raw --v 6.1
```

**Fallback Produit (si dashboard.webp indisponible) :**
```
dark SaaS dashboard fragment, deep navy background,
5 metric cards in 2 rows, large display numbers in white,
silver secondary labels, tech blue #359BD9 accent on primary value,
card borders 1px rgba(255,255,255,0.08), 12px border radius,
no charts, no graphs, pure typography metrics,
Vercel analytics dark dashboard aesthetic --ar 16:9 --style raw --v 6.1
```

**Fallback Wireframe (si slide Idée insuffisante) :**
```
minimal UI wireframe, dark navy #102740 background,
layout grid: header bar, hero block, 3-column section,
all elements as semi-transparent rectangles rgba(255,255,255,0.06),
4px border radius, no fill colors, hairline borders,
architectural skeleton aesthetic, Figma wireframe on dark canvas,
no content, no icons, pure structure --ar 16:9 --style raw --v 6.1
```

---

## Notes de production

- Jamais de device frame visible (pas de MacBook, pas de navigateur Chrome complet)
- Les screenshots flottent sur le fond dark avec ombre `0 24px 60px rgba(0,0,0,.4)`
- Si le screenshot est trop clair pour flotter sur navy, ajouter `brightness(0.92)` en CSS filter
- Sur mobile : les cards sont affichées en séquence, centrées, full-width
- L'indicateur de progression (dots sans numéros) est positionné en bas du visuel droit
