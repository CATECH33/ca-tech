# 07 — DESIGN.MD IMPLEMENTATION RULES
## CA-TECH V2 — Adaptation du système Tomorro pour CA-TECH
**Date :** 28 septembre 2026

---

## Source

DESIGN.md à la racine décrit le système visuel Tomorro (plateforme contrats, dark botanical).
CA-TECH adapte les PRINCIPES, pas l'identité Tomorro.

---

## Correspondance de tokens

| Rôle DESIGN.MD | Token Tomorro | Valeur CA-TECH | Justification |
|----------------|--------------|----------------|---------------|
| Dark canvas principal | Forest Depths `#122314` | Deep Navy `#05101E` | Identité CA-TECH |
| Surface élevée dark | — | Navy `#102740` | palette CA-TECH |
| Light section | Pure White `#ffffff` | `#ffffff` | identique |
| Card on light | Bone White `#f2f5eb` | Cool White `#F2F4F6` | proche |
| Accent unique | Electric Sprout `#68ef3f` | Tech Blue `#359BD9` | identité CA-TECH |
| Text dark section | Pure White `#ffffff` | `#F2F4F6` | quasi-identique |
| Text secondaire dark | Pale Fern `#b7bda5` | Silver `#A5ACB5` | correspondance directe |
| Text muted dark | Lichen Sage `#7e8371` | Dim Silver `rgba(165,172,181,.55)` | rôle équivalent |
| Text on light | Onyx Olive `#30322a` | Dark Navy `#0D1F35` | text on light |
| Hairline dark | Moss Shadow border | `rgba(255,255,255,.08)` | identique rôle |
| Nav background | Onyx Olive 90% | Deep Navy 88% | identique rôle |

---

## Typographie adaptée

| Rôle DESIGN.MD | Font Tomorro | Font CA-TECH | Notes |
|----------------|-------------|-------------|-------|
| Display headlines | Ozik 700, lh 0.86-0.90 | IBM Plex Sans Condensed 700, lh 0.90 | condensed = stacking |
| UI / Body workhorse | Aeonik 400-700 | IBM Plex Sans 400-700 | même rôle |
| Editorial accent | Instrument Serif 400 | IBM Plex Serif 400 italic | même rôle |

**CRITIQUE** : line-height 0.88–0.92 sur les display est NON-NÉGOCIABLE.
C'est la signature du système — les letterforms se "stackent" comme des poutres.

### Tailles display CA-TECH

| Breakpoint | Font-size | Line-height |
|-----------|-----------|-------------|
| Mobile 375 | 44px | 0.92 |
| Tablet 768 | 60px | 0.90 |
| Desktop 1280 | 80px | 0.88 |
| Wide 1920 | 96px | 0.88 |

---

## Principes layout (DESIGN.MD §Layout)

1. **Max-width 1200px** — centré, full-bleed backgrounds
2. **Sections dark/light ALTERNENT** — jamais deux dark ou deux light consécutives
3. **Section gap 80–120px** — padding-block par section
4. **Hero full viewport height** — avec floating pill nav hovering 20-24px du haut
5. **Left-aligned copy, right-floated product mockup** sur sections dark features
6. **Centered headline** sur sections light (pas split)
7. **Séparateurs = changement de background**, pas de lignes explicites

---

## Navigation (pill flottante)

- Position: fixed, top: 20px, centré, width: calc(100% - 48px), max-width: 1200px
- Background: rgba(5,16,30,.88) avec backdrop-filter: blur(12px)
- Border-radius: 28px, border: 1px solid rgba(255,255,255,.08)
- Height: 56px
- Contenu: logo left | liens center | CTA right
- CTA primaire: pill Tech Blue, 28px radius
- Liens: IBM Plex Sans 500 14px, Silver color, hover → white

---

## Composants clés

### Floating Product Mockup Card
- Border-radius: 16px
- Box-shadow: `0 24px 60px rgba(0,0,0,.4), 0 4px 12px rgba(0,0,0,.2)`
- Rotation: ±3–6 degrés
- Stack: 2 cartes (front/back), back à 70% opacity
- Utiliser screenshots réels de `public/portfolio/`

### Atmospheric Orb (hero)
- Position: absolute, width: 600–800px, height: 600–800px
- Background: radial-gradient de accent/10% vers transparent
- filter: blur(80px)
- Opacity: 0.35
- Pointer-events: none

### Announcement Badge (hero)
- Thin border: `1px solid rgba(53,155,217,.35)`
- Border-radius: 9999px, padding: 6px 16px
- Texte: IBM Plex Sans 400 13px, Silver color
- Mot accent: Tech Blue

### CTA primaire (pill)
- Background: Tech Blue `#359BD9`
- Color: white
- Border-radius: 28px
- Padding: 12px 28px
- Font: IBM Plex Sans 600 14px

### CTA secondaire (ghost)
- Background: transparent
- Border: 1px solid rgba(255,255,255,.25)
- Color: white / Silver
- Border-radius: 28px
- Hover: border → white, color → white

---

## Règles absolues (DO NOT VIOLATE)

1. **Une seule couleur accent** — Tech Blue `#359BD9` uniquement. Pas de rouge, vert, orange.
2. **Pas de gradient entre sections** — coupure nette dark→light.
3. **Pas de shadows sur éléments plats** — elevation réservée aux mockups et pill nav.
4. **Line-height ≤ 0.92 sur display headlines** — jamais 1.0+ sur les titres hero.
5. **8px spacing base** — toutes les valeurs sont multiples de 8px.
6. **70% typo / 20% product mockup / 10% atmosphère**.
7. **Pas de photographies stock** — uniquement product UI + type + diagrammes techniques.
8. **IBM Plex Sans Condensed uniquement pour les headlines display (hero, section h2)**.
9. **IBM Plex Sans Normal pour tout le reste (nav, body, labels, buttons)**.
10. **prefers-reduced-motion: ABSOLU** — désactiver toutes les animations.

---

## Imagery par expertise

| Expertise | Visuel | Source |
|-----------|--------|--------|
| IA | Chat conversation mockup (CSS) | Composant custom |
| Automatisation | Workflow diagram avec logos tools | CSS + public/automatisations/ |
| Web & SaaS | Floating tilted product cards | public/portfolio/ca-tech-manager/ + cv-magic/ |
| Infrastructure | Architecture diagram CSS | Composant custom |
| Réalisations | Screenshots réels | public/portfolio/ |
