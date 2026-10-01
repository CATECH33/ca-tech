# CA-TECH Portfolio Mockups — Rapport de production

**Date** : 2026-10-01  
**Session** : PROMPT 27 — Production des 4 mockups UI Portfolio  
**Statut** : ✅ COMPLET — 4 mockups opérationnels sur `/portfolio-preview`

---

## Objective

Produire quatre interfaces produit réalistes et premium en React/CSS pour servir de base à la capture d'assets portfolio :

- PF-01 — CA-TECH Manager (CRM)
- PF-02 — CV Magic (IA CV builder)
- PF-03 — SHOPCA (marketplace)
- PF-04 — Pemou's Money (fintech)

Contraintes strictes : **aucun impact sur la homepage existante**, aucun code backend touché, aucune API réelle, aucun commit, aucun push.

---

## Architecture

### Dossier isolé

```
src/portfolio-mockups/
├── portfolioMockupData.js      ← données statiques (fixtures)
├── PortfolioMockupShell.jsx    ← tokens + primitives partagées
├── CATechManagerMockup.jsx     ← PF-01
├── CVMagicMockup.jsx           ← PF-02
├── ShopcaMockup.jsx            ← PF-03
├── PemousMoneyMockup.jsx       ← PF-04
└── index.jsx                   ← page de preview + sélecteur
```

### Route dev-only ajoutée

- `/portfolio-preview` — rendu sans Header/Footer du site
- Lazy-importée dans `App.jsx` via `const PortfolioPreview = lazy(() => import('./portfolio-mockups'))`
- Ajoutée dans `SPA_ROUTES` de `vite.config.js`

### Modifications apportées au code existant

| Fichier | Changement | Impact |
|---|---|---|
| `src/App.jsx` | Import lazy `PortfolioPreview` + route `/portfolio-preview` + `isPreview` guard | Minimal · 0 régression |
| `vite.config.js` | Ajout `/portfolio-preview` dans `SPA_ROUTES` | Dev server uniquement |

**Fichiers non modifiés :** Home.jsx, PortfolioSection.jsx, DigitalExperiencesSection.jsx, constants.js, Header, Footer, routing, Supabase, Stripe, APIs, DESIGN.md.

---

## Tokens de design (PortfolioMockupShell.jsx)

```js
T.colors.deepNavy    = '#05101E'
T.colors.navy        = '#102740'
T.colors.techBlue    = '#1A4066'
T.colors.accent      = '#359BD9'
T.colors.silver      = '#A5ACB5'
T.colors.coolWhite   = '#F2F4F6'
T.fonts.display      = '"Space Grotesk", sans-serif'
T.fonts.body         = '"Inter", sans-serif'
T.fonts.mono         = '"JetBrains Mono", monospace'
```

Exports communs : `MockupFrame`, `AppLayout`, `SidebarNav`, `Topbar`, `Card`, `Badge`, `SectionLabel`, `UserChip`, `IconBtn`.

---

## PF-01 CA-TECH Manager

**Fichier** : `src/portfolio-mockups/CATechManagerMockup.jsx`  
**ID de capture** : `#portfolio-mockup-pf01`

### Contenu

- Sidebar 196px : Dashboard / Clients / Leads / **Pipeline** (actif) / Tâches / Agenda / Facturation
- Topbar : titre "Pipeline commercial" + 3 KPIs (€124K / 28 / 34%) + boutons Search, Bell, "+ Nouveau deal" + avatar
- Kanban 5 colonnes : Qualification (4 cards) / Proposition (3) / Négociation (3) / Gagné (3) / Perdu (2)
- Deal cards : nom entreprise, montant (JetBrains Mono), badge état coloré, barre de probabilité, date

### QA visuel

| Viewport | Résultat |
|---|---|
| 1920×1080 | ✅ 5 colonnes kanban bien proportionnées, KPIs lisibles |
| 1440×900 | ✅ Layout stable, aucun overflow |
| 1024×768 | ✅ Colonnes resserrées mais lisibles |

---

## PF-02 CV Magic

**Fichier** : `src/portfolio-mockups/CVMagicMockup.jsx`  
**ID de capture** : `#portfolio-mockup-pf02`

### Contenu

- Sidebar : Dashboard / **Mon CV** (actif) / Analyse / Modèles / Export
- Topbar : titre "Mon CV" + badge "Score 92/100" + Export button + avatar
- Split-screen 52/48 :
  - Gauche (fond clair #F8F9FA) : CV professionnel — Alexandre Martin, Consultant IA & Infrastructure, 2 expériences, 8 compétences, formation
  - Droite (fond navy) : ring SVG score 92/100 + 4 barres (Impact/Lisibilité/Mots-clés/Structure) + 3 recommandations + bouton "Améliorer mon CV"

### QA visuel

| Viewport | Résultat |
|---|---|
| 1920×1080 | ✅ Split propre, CV lisible, analyse complète |
| 1440×900 | ✅ Pas de débordement |

---

## PF-03 SHOPCA

**Fichier** : `src/portfolio-mockups/ShopcaMockup.jsx`  
**ID de capture** : `#portfolio-mockup-pf03`

### Contenu

- Header full-width : logo SHOPCA (CA en bleu) + searchbar + favoris + panier (badge 3) + avatar
- Barre catégories : Tous (actif) / Maison / Tech / Mode / Services
- Sidebar filtres 200px : Prix / Note / Disponibilité avec checkboxes
- Grille 4 colonnes × 2 lignes : 8 produits (Studio Lamp / Oak Chair / Minimal Watch / Desk System / Ceramic Vase / Leather Bag / Notebook Set / Table Fan)
- Images produits CSS (shapes neutres avec gradient discret)

### Note dev-environment

La bannière Axeptio (`axeptio-consent.js`) du site CA-TECH s'affiche au premier accès (script global dans `index-src.html`). À gérer lors de la capture Playwright finale (dismiss avant screenshot ou stocker le consent).

### QA visuel

| Viewport | Résultat |
|---|---|
| 1920×1080 | ✅ Grille 4×2 complète, tous produits visibles |
| 1440×900 | ✅ Layout stable |

---

## PF-04 PEMOU'S MONEY

**Fichier** : `src/portfolio-mockups/PemousMoneyMockup.jsx`  
**ID de capture** : `#portfolio-mockup-pf04`

### Contenu

- Sidebar : **Vue générale** (actif) / Comptes / Transactions / Investissements / Budgets
- Topbar : "Vue financière" + 3 métriques (Rendement 12,4% / Volatilité 6,2% / Sharpe 1,84) + actions
- Balance header card : **€84 520,40** + badge "+8,4 %" + boutons Investir/Virement
- Chart performance (60%) : SVG bezier 12 mois avec area fill gradient bleu, labels mois, dot actif
- Allocation (40%) : barre stacked 3 segments + légende + valeurs estimées en euros
- Transactions table : 5 lignes avec icône +/- colorée, libellé, date, montant

### QA visuel

| Viewport | Résultat |
|---|---|
| 1920×1080 | ✅ Dashboard complet, chart SVG propre, transactions visibles |
| 1440×900 | ✅ Mise en page stable |

---

## Responsive QA

| Test | 1920×1080 | 1440×900 | 1024×768 |
|---|---|---|---|
| PF-01 Kanban visible | ✅ | ✅ | ✅ |
| PF-02 Split-screen | ✅ | ✅ | ✅ |
| PF-03 Grille produits | ✅ | ✅ | ✅ |
| PF-04 Chart finance | ✅ | ✅ | ✅ |
| Aucun overflow | ✅ | ✅ | ✅ |
| Aucun élément cassé | ✅ | ✅ | ✅ |

---

## Accessibilité

Appliqué sur les 4 mockups malgré le statut "mockup" :

- `<h1>` pour le titre de page dans chaque topbar
- `<article>` pour les deal cards (PF-01)
- `aria-label` sur `<nav>` sidebar et preview selector
- `aria-current="page"` sur l'item de nav actif
- `aria-label` sur boutons icône (IconBtn)
- `aria-hidden="true"` sur toutes les icônes décoratives
- `role="img"` + `aria-label` sur le SVG chart (PF-04)
- `<table>` sémantique pour les transactions (PF-04)
- `aria-label` sur les checkboxes filtres (PF-03)

---

## Build

```
✓ built in 1.79s
portfolio-mockups-BkLpj267.js : 42.19 kB / 9.02 kB gzip
0 erreurs · 2 warnings (scripts externes non-module — préexistants)
```

---

## Audit couleurs

Aucune couleur interdite détectée dans les mockups :

| Couleur | Présence |
|---|---|
| `#000000` noir pur | ✗ Absent |
| Purple / violet | ✗ Absent |
| Magenta / pink | ✗ Absent |
| Orange | ✗ Absent |
| Green néon | ✗ Absent (seul `#4ADE80` désaturé pour "Gagné" — acceptable) |
| Cyan néon | ✗ Absent |

---

## Homepage — aucun impact

```
h1 : L'intelligence qui transforme votre entreprise.  ✅
Header visible sur /              ✅
Footer visible sur /              ✅
Header absent sur /portfolio-preview  ✅
Footer absent sur /portfolio-preview  ✅
```

---

## Remaining Work

1. **Capture officielle** : Lancer Playwright à 1920×1080, dismisser la bannière Axeptio avant screenshot, sauvegarder dans `docs/design/assets/portfolio/PF-0X/`
2. **Optimisation** : Convertir PNG → WebP via sharp (qualité 90)
3. **Intégration** : Déposer dans `public/portfolio/`, mettre à jour `PORTFOLIO_PROJECTS` dans `src/lib/constants.js`
4. **Mise à jour** : Retirer `/portfolio-preview` de `SPA_ROUTES` et la route `App.jsx` après intégration (ou garder pour évolutions futures)

---

*Rapport produit par Claude Code — Session PROMPT 27*  
*Aucune modification du site CA-TECH principal. Aucun backend touché. Aucun commit créé.*
