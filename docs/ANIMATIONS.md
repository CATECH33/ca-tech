# ANIMATIONS.md

> Référence unique pour les animations sur tout le site CA-TECH.
> Source associée : [`DESIGN_RULES.md`](DESIGN_RULES.md) · [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)

---

## Principes

1. **Une animation doit avoir une intention** — feedback utilisateur, guidage du regard, révélation de contenu. Jamais décorative sans raison.
2. **Naturelle avant tout** — inspiration Apple/Linear : easing organique, jamais linéaire, jamais mécanique.
3. **Sobriété** — 1 à 2 animations par section max. Une page qui bouge partout est une page qui bouge pour rien.
4. **Performance** — animer `transform` et `opacity` uniquement. Interdit : animer `width`, `height`, `top`, `left`, `margin`.
5. **Respect utilisateur** — toujours prévoir `@media (prefers-reduced-motion: reduce)`.

---

## Easings de référence

| Nom | Valeur | Usage |
|---|---|---|
| **Standard** | `cubic-bezier(.16, 1, .3, 1)` | Défaut pour 90 % des transitions. Fluide, distinctif. |
| **Entrée douce** | `cubic-bezier(.22, 1, .36, 1)` | Apparitions au scroll, révélations |
| **Sortie brève** | `cubic-bezier(.4, 0, .2, 1)` | Hover retour, fermeture modale |
| **Bounce léger** | `cubic-bezier(.34, 1.56, .64, 1)` | Icônes actives, badges, confirmation |

**❌ Bannis** : `linear`, `ease`, `ease-in-out` par défaut, tout easing avec plus de +20 % de rebond.

---

## Durées

| Contexte | Durée |
|---|---|
| Hover / focus | **150 – 200 ms** |
| Click / press feedback | **80 – 120 ms** |
| Transition d'état (accordion, tab) | **250 – 400 ms** |
| Reveal au scroll | **600 – 900 ms** |
| Animations ambiantes (float, halo) | **3 – 8 s** en boucle |

---

## Patterns validés

### 1. Reveal au scroll

```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity   .8s cubic-bezier(.22, 1, .36, 1),
    transform .8s cubic-bezier(.22, 1, .36, 1);
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

Déclencheur via `IntersectionObserver` (voir `src/hooks/use-scroll-reveal.js`).

### 2. Flottement ambiant

```css
@keyframes cai-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
.floating {
  animation: cai-float 6s ease-in-out infinite;
}
```

Décaler les `animation-delay` pour éviter la synchronicité (0s / 0.8s / 1.6s / 2.4s…).

### 3. Halo pulsé

```css
@keyframes cai-halo-pulse {
  0%   { transform: scale(.55); opacity: .55; }
  70%  { transform: scale(1.35); opacity: 0;  }
  100% { transform: scale(1.35); opacity: 0;  }
}
```

### 4. Hover magnétique (cards)

```css
.card {
  transition:
    transform   .25s cubic-bezier(.16, 1, .3, 1),
    box-shadow  .25s cubic-bezier(.16, 1, .3, 1);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 48px rgba(0, 102, 255, .14);
}
```

### 5. Particules le long d'un chemin (SVG)

```css
@keyframes cai-travel {
  0%   { offset-distance: 0%;   opacity: 0; }
  15%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
.particle {
  offset-path: path('M430 260 L130 180');
  animation: cai-travel 3s linear infinite;
}
```

---

## Accessibilité — obligatoire

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Interdits

- ❌ **`animation: fadeIn`** générique en boucle
- ❌ Animer `width`, `height`, `top`, `left`, `margin`, `padding` (repaint coûteux)
- ❌ Rebond mécanique type `bounce` Bootstrap
- ❌ Plus de 2 animations simultanées visibles dans le viewport
- ❌ Boucle infinie sans `prefers-reduced-motion`
- ❌ Duration linéaire sur une transition d'état
- ❌ `transition: all` (toujours nommer les propriétés)

---

## Checklist avant merge

- [ ] Easing est un des 4 easings de référence ?
- [ ] Durée dans la plage attendue ?
- [ ] Animation ciblée sur `transform` / `opacity` uniquement ?
- [ ] `prefers-reduced-motion` respecté ?
- [ ] Intention claire (feedback / guidage / révélation) ?
- [ ] Pas plus de 2 animations simultanées dans le viewport ?
