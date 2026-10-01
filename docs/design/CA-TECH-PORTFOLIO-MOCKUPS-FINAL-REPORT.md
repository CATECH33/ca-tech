# CA-TECH Portfolio Mockups — Rapport final

**Date** : 2026-10-01  
**Session** : PROMPT 28 — QA visuel + Capture officielle  
**Auteur** : Claude Code

---

## Fichiers produits

### Assets WebP — `public/portfolio/`

| Fichier | Dimensions | Poids |
|---|---|---|
| `pf-01-ca-tech-manager.webp` | 1920 × 1080 | 59.7 KB |
| `pf-02-cv-magic.webp` | 1920 × 1080 | 63.0 KB |
| `pf-03-shopca.webp` | 1920 × 1080 | 55.8 KB |
| `pf-04-pemous-money.webp` | 1920 × 1080 | 55.5 KB |

Total : **234 KB** — 4 assets haute qualité.

### Captures PNG sources — `docs/design/assets/portfolio/`

| Fichier | Usage |
|---|---|
| `pf-01-ca-tech-manager-raw.png` | Source brute pour QA / retraitement |
| `pf-02-cv-magic-raw.png` | Source brute |
| `pf-03-shopca-raw.png` | Source brute |
| `pf-04-pemous-money-raw.png` | Source brute |
| `PF-01/qa-1920.png` — `PF-04/qa-1920.png` | Captures QA intermédiaires |

### Fichiers modifiés

| Fichier | Modification |
|---|---|
| `src/lib/constants.js` | `image: null` → chemins WebP (4 entrées PORTFOLIO_PROJECTS) |
| `src/App.jsx` | Route `/portfolio-preview` + import lazy (PROMPT 27) |
| `vite.config.js` | `/portfolio-preview` dans SPA_ROUTES (PROMPT 27) |
| `src/portfolio-mockups/*` | Nouveaux fichiers (PROMPT 27) |

---

## Résultat QA Phase 1 — Technique (1920×1080)

| Contrôle | PF-01 | PF-02 | PF-03 | PF-04 |
|---|---|---|---|---|
| Aucun overflow horizontal | ✅ | ✅ | ✅ | ✅ |
| Aucune scrollbar | ✅ | ✅ | ✅ | ✅ |
| Aucune erreur JS | ✅ | ✅ | ✅ | ✅ |
| Aucune icône cassée | ✅ | ✅ | ✅ | ✅ |
| Aucun texte coupé | ✅ | ✅ | ✅ | ✅ |
| Alignements corrects | ✅ | ✅ | ✅ | ✅ |
| Contraste suffisant | ✅ | ✅ | ✅ | ✅ |
| H1 présent | ✅ | ✅ | ✅ | ✅ |

---

## Résultat QA Phase 3 — Portfolio (lisibilité carte)

| Critère | PF-01 | PF-02 | PF-03 | PF-04 |
|---|---|---|---|---|
| Lisibilité immédiate | ✅ CRM kanban | ✅ Split CV | ✅ Marketplace | ✅ Finance |
| Hiérarchie visuelle | ✅ | ✅ | ✅ | ✅ |
| Densité raisonnable | ✅ | ✅ | ✅ | ✅ |
| Cohérence entre les 4 | ✅ Navy/bleu/argent | ✅ | ✅ | ✅ |
| Cohérence Design System CA-TECH | ✅ | ✅ | ✅ | ✅ |
| Impression premium | ✅ | ✅ | ✅ | ✅ |
| Aucun élément inutile | ✅ | ✅ | ✅ | ✅ |

---

## Corrections appliquées (Phase 3)

### Correction 1 — Masquage barre preview selector
**Constat** : La barre sélecteur `nav[portfolio-preview]` de 40px était visible en haut de chaque capture.  
**Action** : Masquage via `element.style.setProperty('display', 'none', 'important')` dans le contexte Playwright avant screenshot, sans modifier le code source.  
**Résultat** : Captures strictement 1920×1080, barre absente.

### Correction 2 — Suppression widgets externes
**Constat** : Axeptio (bannière cookies) et Loïc widget (script `/loic-widget.js`) s'injectent dans la page et créaient des overlays visibles sur PF-01 et PF-03.  
**Action** : Masquage via sélecteurs CSS dans Playwright (`[id*="axeptio"]`, `body > div[style*="fixed"]`, `iframe`, etc.) avant chaque screenshot.  
**Résultat** : Captures propres sans overlay parasite.

**Aucune modification du code source n'a été nécessaire pour ces corrections.**

---

## Résultat Playwright

```
Viewport : 1920 × 1080
PF-01 CA-TECH Manager → pf-01-ca-tech-manager-raw.png  ✅
PF-02 CV Magic        → pf-02-cv-magic-raw.png          ✅
PF-03 SHOPCA          → pf-03-shopca-raw.png             ✅
PF-04 Pemous Money    → pf-04-pemous-money-raw.png       ✅
Axeptio dismissed     : 1 fois (PF-03)
Loïc widget masked    : toutes captures
```

---

## Conversion WebP

```
Outil   : sharp (npm, installé)
Qualité : 88 (excellent visuel, poids maîtrisé)
Effort  : 4 (encodage standard)

pf-01-ca-tech-manager.webp : 59.7 KB
pf-02-cv-magic.webp        : 63.0 KB
pf-03-shopca.webp          : 55.8 KB
pf-04-pemous-money.webp    : 55.5 KB
Total                      : 234.0 KB
```

---

## Résultat Build

```
vite build
✓ 2372 modules transformed
✓ built in 1.38s
0 erreurs
2 warnings (préexistants — scripts externes sans type="module")
```

---

## Régression Homepage

| Contrôle | Résultat |
|---|---|
| H1 homepage | ✅ "L'intelligence qui transforme votre entreprise." |
| Header visible | ✅ |
| Footer visible | ✅ |
| Images portfolio dans la page | ✅ 5 img `src*="portfolio"` détectées |
| Images visibles | ✅ |
| Erreurs JS | ✅ 0 |
| Ressources 404 | ✅ 0 |
| Route `/portfolio-preview` | ✅ opérationnelle |

---

## Vérification section Portfolio

Confirmation visuelle (screenshot `regression-portfolio-section.png`) :

- Section **"Des interfaces qui convertissent. Des produits qui durent."** affichée
- Carte CA-TECH Manager : image CRM kanban visible ✅
- Carte CV Magic : image split-screen CV visible ✅
- Carte Pasmal : image marketplace SHOPCA visible ✅
- Carte Pemous Money : hors-frame à droite (carousel), chargée sans 404 ✅

---

## Note — Slot PF-03 / Pasmal

`constants.js` déclare le 3e projet sous `id: 'pasmal'`. Conformément aux instructions (PROMPT 28 §7 : "mettre à jour uniquement les références nécessaires"), seul le champ `image` a été mis à jour avec `/portfolio/pf-03-shopca.webp`. Les métadonnées (titre, description, slug) restent inchangées pour ne pas affecter les routes existantes.

---

## STATUS: READY FOR PRODUCTION
