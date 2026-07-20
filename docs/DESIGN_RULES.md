# DESIGN_RULES.md

> Le document le plus important.

Ces règles s'appliquent à **tout** le site CA-TECH — homepage, landings, pages solutions, tunnels. Toute exception doit être justifiée et validée.

---

## ❌ INTERDIT

- **Glassmorphism excessif** — pas de flous partout, effet fatigué et daté
- **Bleu/Violet IA** — banni, cliché "site IA" de 2023
- **Hero générique** — pas de titre + sous-titre + 2 boutons centrés sans identité
- **Icônes géantes** — pas d'icônes 80px+ posées au milieu d'une carte
- **Grosses ombres** — pas de `box-shadow: 0 30px 60px` visible à 3 mètres
- **Cards identiques** — jamais 3–4 cartes qui répètent exactement la même structure
- **Dégradés partout** — un dégradé par section max, pas sur chaque bouton/titre/card
- **Animations fade** — pas de `fadeIn` générique en boucle, sans intention
- **Boutons ronds 999px** — pas de pilules Bootstrap, on veut du 8–14px
- **Sections copiées Lovable** — aucun template no-code reconnaissable
- **Layout centré partout** — sortir de la colonne centrée, éviter l'axe unique

---

## ✅ OBLIGATOIRE

- **Beaucoup d'espace** — padding généreux, respiration verticale forte
- **Images immersives** — plein cadre, pas de vignettes timides
- **Grands titres** — `clamp(2.5rem, 6vw, 5rem)`, hiérarchie visible sans lire
- **Asymétrie** — casser la symétrie, décaler les grilles, jouer l'imprévu
- **Composition éditoriale** — pensée comme un magazine, pas comme un dashboard
- **Transitions fluides** — `cubic-bezier(.16,1,.3,1)`, pas de linear
- **Animations naturelles** — respiration, flottement, jamais de rebond mécanique
- **Hiérarchie très forte** — H1 ≫ H2 ≫ H3 ≫ body, contraste de tailles franc
- **Micro interactions** — hover, focus, cursor, chaque geste renvoie un signal
- **Sections différentes** — chaque section a sa propre identité visuelle
- **Design Premium** — Apple, Stripe, Vercel, Linear comme référence, pas Bootstrap

---

## Référence

Inspirations validées : **Apple · Stripe · Vercel · Linear**
Anti-références : templates Lovable, thèmes Bootstrap, kits UI génériques.
