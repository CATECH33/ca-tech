# 01 — AUDIT COMPLET
## CA-TECH V2 — Audit Technique · UX · Contenu · SEO · Design
**Date :** 28 septembre 2026

---

## A. AUDIT TECHNIQUE

### Stack actuelle
| Élément | Valeur | État |
|---------|--------|------|
| Framework | React 19.2.7 | ✅ Moderne |
| Router | React Router DOM 7.18.1 | ✅ Stable |
| Bundler | Vite 8.1.5 | ✅ Moderne |
| TypeScript | Non — JSX majoritaire, quelques TSX | ⚠️ Incohérent |
| CSS | Custom CSS (main.css + per-page) | ⚠️ Non-centralisé |
| Tailwind | Absent | ℹ️ — |
| Font actuelle | Inter + Rajdhani | ❌ À changer |
| Backend | Vercel Functions + Supabase | ✅ Solide |
| Paiement | Stripe | ✅ OK |
| Emails | Resend | ✅ OK |
| Déploiement | Vercel | ✅ OK |
| PWA | Oui (service worker, manifest) | ✅ OK |
| Analytics | Axeptio CMP + Google Consent v2 | ✅ OK |

### Architecture de déploiement
Le projet est **hybride** :
- SPA React (routes `/`, `/services`, `/collaborateurs-ia`, etc.) rendu par `index.html`
- Pages HTML statiques pour le SEO local (`agence-web-dijon.html`, etc.)
- `build.sh` copie `dist/index.html` dans chaque fichier SPA route HTML
- `vercel.json` avec `cleanUrls: true` et `outputDirectory: "."`

**Problème :** cette architecture hybride est fragile. La gestion des routes SPA via `vite.config.js` custom plugin + copies HTML est non-standard et difficile à maintenir. Les pages statiques ne profitent pas du React Router.

**Recommandation Phase 2 :** Évaluer la migration vers Next.js App Router (SSG/SSR natif) ou SvelteKit pour unifier l'architecture. Si on reste sur Vite, normaliser la structure.

### Dette technique identifiée

1. **Inline styles massifs dans JSX** — Home.jsx utilise des centaines de `style={{ }}` inline. Impossible à thémiser, impossible à maintenir, aucune séparation des préoccupations.

2. **Aucun TypeScript cohérent** — Header.tsx existe mais Home.jsx, Services.jsx, etc. sont en JSX pur. Pas de types, pas de props typées.

3. **Animations JS manuelles** — Les animations hero sont codées en JS vanilla dans `useEffect` (querySelector, setTimeout, requestAnimationFrame). Fragile et non-portable.

4. **CSS éparpillé** — `css/main.css`, `src/pages/Services.css`, `src/components/Footer.css`, `local-seo.css` à la racine, etc. Aucune convention d'organisation.

5. **Pages HTML statiques orphelines** — Des dizaines de fichiers `.html` à la racine (`agence-web-dijon.html`, `auto-drive-ia-classement.html`, etc.) sans rapport avec le design system React.

6. **Fichiers de rapport à la racine** — `SPRINT_10_9_SECURITY_REPORT.md`, `MANAGER_V2_AUDIT_AND_MIGRATION_PLAN.md`, etc. Doivent être déplacés ou gitignorés.

7. **Rajdhani inutilisé visuellement** — Chargé dans les fonts mais son usage est anecdotique.

8. **Images non optimisées** — Présence de `.png` côté root (android-chrome-192x192.png = 58KB, apple-touch-icon.png = 52KB) alors que des `.webp` existent.

---

## B. AUDIT UX

### Proposition de valeur (Hero)
**Actuel :** "Agence Web & IA — les outils qui font grandir votre entreprise."  
**Problème :** Titre générique. Ne différencie pas. "Outils qui font grandir" est vague. La sous-ligne liste tous les services en un seul paragraphe ("Sites vitrines • E-commerce • Applications métier • CRM sur mesure • SaaS • Automatisations • Agents IA • SEO • Maintenance") — c'est une liste de services, pas une proposition de valeur.

**Impact :** Visiteur ne comprend pas en 3 secondes pourquoi CA-TECH plutôt qu'un autre.

**Recommandation :** Headline précis + une bénéfice unique + une preuve sociale immédiate.

---

### Navigation

| Problème | Impact | Recommandation |
|---------|--------|----------------|
| Logo-sub dit "Agence Web & Design" en contradiction avec le repositionnement | Moyen | Changer en "Cabinet Technologique" ou supprimer |
| Dropdown "Solutions" mélange des pages React SPA et des pages HTML statiques | Élevé | Unifier l'architecture ou clarifier les liens |
| "Devis" comme CTA principal dans la nav | Moyen | Préférer "Prendre contact" ou "Parler de mon projet" — moins transactionnel |
| Navigation desktop non sticky visible sur scroll | Faible | À conserver |
| Aucun indicateur de section active dans le dropdown | Faible | Améliorer l'état actif |

---

### Structure de la homepage

Analyse section par section :

| N° | Section | Problème | Sévérité |
|----|---------|---------|---------|
| 1 | Hero | Trop générique, liste de services en subtitle | ❗ Critique |
| 2 | Nos expertises | 6 cards identiques en grille — trop répétitif | ❗ Élevé |
| 3 | Pourquoi CA-TECH (stats) | Statistiques sans source : 200+, 98%, +250%, 24h/24 | ❗ Critique |
| 4 | Solutions IA | Deux cartes images avec overlays — acceptable mais générique | ⚠️ Moyen |
| 5 | Études de cas | Chiffres invérifiables (73% tickets, 180% satisfaction) | ❗ Critique |
| 6 | Méthode | Bonne section mais noyée après trop de répétitions | ⚠️ Moyen |
| 7 | Comparatif | Tableau "nous vs agence vs freelance" — vu partout | ❗ Élevé |
| 8 | Prose IA-first | Contenu intéressant mais long et non différencié | ⚠️ Moyen |
| 9 | FAQ | Bonne mais trop longue (10 Q) | ⚠️ Faible |
| 10 | CTA final | Répète mot pour mot le hero | ⚠️ Moyen |

**Résumé UX Homepage :** Structure exactement identique à 80% des sites SaaS/agences générés. Aucune surprise, aucune personnalité. Le contenu intéressant (la méthode, la prose) est noyé dans des grilles de cards répétitives.

---

### Friction et conversion

- Le CTA principal "Créer mon projet →" renvoie vers `/devis` (un formulaire HTML statique). Rupture d'expérience avec le SPA React.
- "Planifier un rendez-vous" renvoie vers `/contact` mais le bouton est moins visible (ghost).
- Pas de preuve sociale crédible visible dès le hero (témoignage réel, client nommé).
- "Gratuit · Sans engagement · Premier livrable en 72h" répété 3 fois sur la page.

---

### Responsive

Le CSS utilise un container max 1200px avec des breakpoints. Pas de problèmes rédhibitoires observés côté structure. L'utilisation intensive des inline styles en `%` et `rem` est Mobile First en apparence mais difficile à auditer sans rendu réel.

---

## C. AUDIT CONTENU

### Titres génériques à remplacer

| Titre actuel | Problème | Alternative recommandée |
|-------------|---------|------------------------|
| "Des solutions pour chaque défi digital" | Vague | Supprimer — le titre de section doit être spécifique |
| "Des résultats mesurables, pas des promesses" | Cliché | Reformuler avec une preuve réelle |
| "Nos solutions IA qui travaillent pour vous" | Generic AI | Supprimer "pour vous" — nommer ce que l'IA fait concrètement |
| "Des résultats réels, vérifiables" | Paradoxal si les chiffres sont inventés | Citer des clients réels ou supprimer les KPIs non sourcés |
| "Parlons de votre projet." | Générique | Préciser le contexte |

### Statistiques non sourcées (critique)

Ces chiffres sont présentés comme vérifiables mais ne le sont pas :
- `200+` projets réalisés
- `98%` clients satisfaits (NPS)
- `+250%` ROI moyen sur missions IA
- `+180%` satisfaction client (étude de cas)
- `-73%` tickets humains (étude de cas)
- `14h récupérées par semaine en moyenne`
- `×4 ROI en 3 mois`
- `×3.4 trafic organique en 6 mois`

**Recommandation :** Soit sourcer avec un client nommé ("Projet X — e-commerce mode, Juillet 2026"), soit supprimer. Les chiffres inventés réduisent la crédibilité plutôt que de la renforcer.

### Jargon et répétitions

- "IA-first" utilisé 8+ fois sans jamais être défini clairement dans une phrase
- "sur mesure" : 11 occurrences sur la homepage seule
- "Premier livrable en 72h" : 4 occurrences
- "Sans engagement" : 5 occurrences
- "Gratuit" : 4 occurrences

**Recommandation :** Choisir 1 à 2 répétitions stratégiques maximum par élément de différenciation.

### Textes manquants

- Pas de contenu "À propos" dans la navigation principale
- Pas de page Méthode accessible depuis la nav
- Pas de témoignages clients nommés (prénom, entreprise, secteur)
- Les "études de cas" sont des cas fictifs sans client nommé

---

## D. AUDIT SEO

### Tags et structure

| Élément | État | Problème |
|---------|------|---------|
| `<title>` | "CA-TECH — Agence Web & IA · Sites, CRM, SaaS" | Trop long (75 chars), mélange de services hétérogènes |
| `<meta description>` | 155 chars, correcte | Légèrement formulaïque |
| `<h1>` | "Agence Web & IA — les outils qui font grandir votre entreprise." | Trop générique |
| Structure H2-H3 | Utilise des `aria-labelledby` avec ID — correct | ✅ |
| Schema.org | Organization + Website + WebPage + FAQ + ItemList | ✅ Très complet |
| Open Graph | Présent complet | ✅ |
| Twitter Cards | Présent | ✅ |
| Canonical | Présent | ✅ |
| Robots | `index,follow,max-image-preview:large,max-snippet:-1` | ✅ |
| Sitemap | Présent (`sitemap.xml`) | ✅ |

### Problèmes SEO

1. **Pages SEO locales dupliquées** — `agence-ia-dijon.html` et `agence-ia-lyon.html` font 8KB chacune (suspicion de contenu vide ou template placeholder).

2. **URLs statiques vs SPA** — Google crawle les pages HTML statiques avec des layouts différents du SPA React. Risque de contenu dupliqué ou incohérent.

3. **Pages manquantes par rapport à l'architecture cible** — Il n'existe pas de pages `/intelligence-artificielle`, `/automatisation`, `/infrastructure-it` dédiées.

4. **`devis.html` fait 90KB** — Page probablement très lourde. À vérifier si elle est indexée et si sa performance est acceptable.

5. **Aucune page "À propos"** dans la navigation actuelle — manque de contenu E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness).

6. **Blog non lié en navigation** — `blog.html` existe mais n'est pas accessible depuis la nav principale.

---

## E. AUDIT DESIGN

### Palette actuelle vs cible

| Token actuel | Valeur | Statut | Token cible |
|-------------|--------|--------|-------------|
| `--color-primary` | `#0066FF` | ❌ Remplacer | `--tech-blue: #359BD9` |
| `--color-primary-dark` | `#0A2540` | ⚠️ Garder en référence | `--navy: #102740` |
| `--color-white` | `#FFFFFF` | ✅ Garder | — |
| `--color-gray-*` | Échelle standard | ⚠️ Retravailler | Silvers spécifiques |
| `--color-success` | `#10B981` | ⚠️ À conserver pour statuts | — |

**Diagnostic :** Le bleu `#0066FF` est trop saturé, trop "startup tech". Le `#0A2540` est pertinent mais sous-utilisé. Le nouveau système doit s'appuyer sur le Deep Navy `#05101E` comme base principale.

### Typographie actuelle vs cible

| Actuel | Cible | Action |
|--------|-------|--------|
| Inter (body) | IBM Plex Sans | Remplacer |
| Rajdhani (headings?) | IBM Plex Serif | Remplacer |
| Hiérarchie dense | Hiérarchie éditoriale légère | Retravailler toute la scale |

### Composants — Décision Keep / Refine / Replace / Remove

| Composant | Décision | Raison |
|-----------|---------|--------|
| Header/Nav | REFINE | Structure correcte, identité à retravailler |
| Bouton primary | REPLACE | Couleur, radius, typographie |
| Bouton secondary | REPLACE | Idem |
| Cards expertise (grille 6) | REPLACE | Structure trop répétitive, images génériques |
| Proof stats (200+, 98%...) | REMOVE | Statistiques non sourcées — anti-crédibilité |
| Comparatif tableau | REMOVE | Anti-pattern générique |
| Case study cards | REFINE | Concept valide, chiffres à sourcer |
| Hero (layout) | REPLACE | Architecture éditoriale nécessaire |
| Section SeoContent | REFINE | Utile pour SEO, à restyler |
| Footer | REFINE | Structure ok, design à moderniser |
| PWA Install Banner | KEEP | Technique ok |
| Hero Video component | KEEP/REFINE | Concept intéressant |
| Pill badges | REFINE | Style à retravailler |
| FAQ accordion | KEEP | Fonctionnel, à restyler |

### Spacing & Radius actuels

- `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`, `--radius-xl: 24px`, `--radius-full: 9999px`
- Cards avec `borderRadius: 16-20px` — trop arrondi pour le positionnement premium cible
- **Recommandation :** Radius max 8px pour les surfaces (cards, panels), 4px pour les inputs, full pill uniquement pour les tags/badges

### Shadows

- Utilisation de `box-shadow` sur tous les hovers — contraire à l'esthétique visée
- **Recommandation :** Supprimer les shadows. Hiérarchie par borders et espacement.

---

## F. RÉSUMÉ CRITIQUE

### Les 5 problèmes les plus urgents

1. **Statistiques invérifiables** — Elles dégradent la crédibilité. Un prospect sophistiqué (PME de 20+ salariés, DSI) les identifie immédiatement comme inventées.

2. **Design générique SaaS** — Le site ressemble à 500 autres sites d'agences IA. Il n'y a aucune signature visuelle identifiable.

3. **Positionnement flou** — "Agence Web & Design" dans le logo, "Agence Web & IA" dans le H1, "Cabinet de conseil IA-first" dans le Schema.org — trois messages différents sur la même page.

4. **Typographie sans personnalité** — Inter est la police par défaut de tout l'écosystème SaaS. Elle est neutre, pas premium.

5. **Inline styles incontrôlables** — 300+ lignes de `style={{ }}` dans Home.jsx rendent toute modification de thème pratiquement impossible.

### Opportunités

1. Le contenu SEO technique (schema.org, meta, sitemap, structure H) est solide — à préserver et enrichir.
2. La méthode en 4 étapes est différenciante si elle est présentée correctement.
3. Loïc (l'agent IA) est un asset produit unique — il doit être mis en avant comme démo vivante.
4. L'infrastructure Supabase + Stripe est robuste — elle supporte des fonctionnalités avancées.
5. Le portfolio de réalisations existe (`realisation-ca-tech-manager.html`, etc.) — il doit entrer dans le SPA React.
