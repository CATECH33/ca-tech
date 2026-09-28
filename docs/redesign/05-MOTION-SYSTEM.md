# 05 — MOTION SYSTEM
## CA-TECH V2 — Système d'animation
**Date :** 28 septembre 2026

---

## Philosophie

Le motion de CA-TECH V2 est **architectural, pas décoratif**.

Chaque animation a un rôle précis :
1. **Révéler** — montrer que quelque chose existe
2. **Guider** — orienter l'attention vers l'essentiel
3. **Confirmer** — valider une interaction utilisateur

Ce qui n'entre pas dans ces 3 catégories n'anime pas.

---

## Principe directeur : Contrainte absolue

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

Ce bloc est non-négociable. Chaque animation doit fonctionner ou être neutralisée proprement avec `prefers-reduced-motion`.

---

## Propriétés animées (whitelist)

| Propriété | Usage | Pourquoi autorisée |
|-----------|-------|-------------------|
| `opacity` | Entrées, disparitions | 0 coût GPU, fluide |
| `transform: translateY()` | Entrées depuis le bas | Compositing layer |
| `transform: translateX()` | Entrées latérales | Idem |
| `transform: scale()` | Hover micro, très faible amplitude | Max 1.03 |
| `clip-path` | Reveal texte ou image | Léger, expressif |
| `color` | Transitions de teinte sur liens | Très léger |
| `border-color` | Hover sur cards/inputs | Léger |
| `background-color` | Hover sur boutons | Léger |

**Interdit :**
- `width`, `height`, `top`, `left`, `right`, `bottom` (reflow)
- `box-shadow` animé (reflow partiel)
- `filter` (blur, brightness, etc.) sauf contexte précis
- `font-size`, `letter-spacing` (reflow)

---

## Courbes d'animation

```css
:root {
  --ease-reveal:  cubic-bezier(0.16, 1, 0.30, 1);  /* Entrée rapide, sortie douce */
  --ease-hover:   cubic-bezier(0.25, 0, 0.00, 1);  /* Réponse immédiate */
  --ease-out:     cubic-bezier(0.00, 0, 0.58, 1);  /* Standard ease-out */
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Légère surtension — boutons seulement */
}
```

---

## Catalogue d'animations

### 1. Page Entrance (chargement initial)

**Déclencheur :** Montage du composant  
**Éléments :** Headline hero → Sous-titre → CTAs → Proof line  
**Propriétés :** `opacity: 0 → 1` + `translateY(16px → 0)`  
**Durée :** 500ms par élément  
**Stagger :** 100ms entre chaque élément  
**Courbe :** `--ease-reveal`

```css
.hero-headline {
  opacity: 0;
  transform: translateY(16px);
  animation: reveal-up 500ms var(--ease-reveal) 0ms forwards;
}
.hero-body {
  animation-delay: 100ms;
}
.hero-ctas {
  animation-delay: 200ms;
}
.hero-proof {
  animation-delay: 300ms;
}

@keyframes reveal-up {
  to { opacity: 1; transform: translateY(0); }
}
```

### 2. Scroll Reveal (sections)

**Déclencheur :** `IntersectionObserver` — threshold 0.1  
**Éléments :** Tous les éléments avec `.reveal`  
**Propriétés :** `opacity: 0 → 1` + `translateY(24px → 0)`  
**Durée :** 600ms  
**Courbe :** `--ease-reveal`

```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 600ms var(--ease-reveal), transform 600ms var(--ease-reveal);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Stagger pour groupes :** `d1` (100ms), `d2` (200ms), `d3` (300ms) — identique à l'actuel.

### 3. Text Reveal (titres éditoriaux)

**Déclencheur :** `IntersectionObserver` sur les headlines serif  
**Effet :** `clip-path: inset(0 100% 0 0) → inset(0 0% 0 0)` — révèle le texte depuis la gauche  
**Durée :** 700ms  
**Courbe :** `--ease-reveal`  
**Applicabilité :** Headlines display et heading, jamais body text

```css
.text-reveal {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 700ms var(--ease-reveal);
}
.text-reveal.visible {
  clip-path: inset(0 0% 0 0);
}
```

### 4. Image Reveal

**Déclencheur :** `IntersectionObserver`  
**Effet :** `clip-path: inset(0 0 100% 0) → inset(0 0 0% 0)` + zoom léger depuis 1.05 → 1  
**Durée :** 800ms  
**Courbe :** `--ease-reveal`

```css
.image-reveal {
  overflow: hidden;
}
.image-reveal img {
  transform: scale(1.05);
  clip-path: inset(0 0 100% 0);
  transition:
    clip-path 800ms var(--ease-reveal),
    transform 800ms var(--ease-reveal);
}
.image-reveal.visible img {
  transform: scale(1);
  clip-path: inset(0 0 0% 0);
}
```

### 5. Hover — Cards / WorkCards

**Déclencheur :** `:hover`  
**Propriétés :**
- `border-color: var(--border-default) → var(--border-active)`
- `transform: translateY(-3px)` — amplitude faible, premium
**Durée :** 200ms  
**Courbe :** `--ease-hover`

```css
.work-card {
  border: 1px solid var(--border-default);
  transform: translateY(0);
  transition:
    border-color 200ms var(--ease-hover),
    transform 200ms var(--ease-hover);
}
.work-card:hover {
  border-color: var(--border-active);
  transform: translateY(-3px);
}
```

**Règle :** Pas de box-shadow sur hover. La bordure Tech Blue suffit.

### 6. Hover — Boutons

**Déclencheur :** `:hover`  
**Propriétés :** `transform: translateY(-1px)` + légère variation background  
**Durée :** 150ms  
**Courbe :** `--ease-spring` (micro surtension)  

```css
.btn {
  transition: transform 150ms var(--ease-spring), background-color 150ms ease;
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
```

### 7. Navigation — Dropdown Reveal

**Déclencheur :** Hover ou focus sur le trigger  
**Propriétés :** `opacity: 0 → 1` + `translateY(-8px → 0)`  
**Durée :** 180ms  
**Courbe :** `--ease-reveal`

### 8. Navigation — Transition de page

React Router v7 ne fournit pas de page transition natif. Options :

**Option A (recommandée) :** `View Transitions API` + `startViewTransition`
```js
// Wrapper le navigate() dans startViewTransition
document.startViewTransition(() => navigate(href))
```
Transition : cross-fade 200ms. Fallback : aucune animation.

**Option B :** Framer Motion `AnimatePresence` — plus lourd mais plus contrôlé.

### 9. CTA Micro-interaction

**Déclencheur :** Focus + Hover sur le CTA principal  
**Effet :** Légère pulsation de la bordure Tech Blue (`--border-active`)  
**Implémentation :** CSS `@keyframes` avec `box-shadow: 0 0 0 2px var(--tech-blue)` qui apparaît sur `:focus-visible` uniquement.

---

## Durées de référence

| Contexte | Durée | Raison |
|---------|-------|--------|
| Micro-interactions (hover btn) | 100–150ms | Réponse immédiate |
| Transitions UI (dropdown) | 150–200ms | Fluide sans traîner |
| Reveals scroll (elements) | 500–600ms | Perceptible mais sobre |
| Reveals scroll (images) | 700–900ms | Légèrement plus lent pour les visuels |
| Transitions de page | 200ms | Court pour éviter l'attente |

---

## Ce qui n'anime PAS

- Texte body — jamais animé au scroll (trop distrayant)
- Navigation principale — transition de couleur uniquement sur le lien actif
- Logos — statiques
- Statistiques — pas de count-up (à supprimer avec les stats non sourcées)
- Fond de page — jamais de gradient animé, jamais de particules
- Icônes — rotation, spin, bounce : interdits

---

## Bibliothèque d'animation

**Pas de bibliothèque externe** (Framer Motion, GSAP, etc.) en Phase 2.

Tout en CSS + JS vanilla via `IntersectionObserver` et `requestAnimationFrame`.  
Raison : zéro dépendance supplémentaire, bundle minimal, pleinement contrôlable.

**Exception :** Si les transitions de page avec `View Transitions API` ne suffisent pas, Framer Motion peut être ajouté en Phase 3 uniquement.

---

## Checklist d'implémentation

- [ ] `prefers-reduced-motion` respecté sur tous les composants
- [ ] Aucune animation sur `width`, `height`, propriétés de layout
- [ ] `IntersectionObserver` avec `unobserve` après trigger (performance)
- [ ] Stagger max : 3 niveaux (`d1`, `d2`, `d3`) — jamais plus
- [ ] Amplitude `translateY` max : 24px pour les reveals, 3px pour les hovers
- [ ] Amplitude `scale` max : 1.03 (micro, hover uniquement)
- [ ] Durée max visible à l'utilisateur : 900ms
- [ ] Aucune animation permanente (loop, spin, pulse continu)
