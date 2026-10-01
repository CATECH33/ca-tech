# CA-TECH — Visual Asset Production System
> Midjourney · HyperFrames by HeyGen · Framer Motion

**Version :** 1.0  
**Outils de production :** Midjourney (images) · HyperFrames by HeyGen (vidéos) · Framer Motion (animations frontend)  
**Source de vérité :** Ce document + `DESIGN.md`  
**Prompts :** `docs/prompts/visuals/`

---

## DÉCOUVERTE CRITIQUE — Assets existants

> Avant toute production, l'inventaire révèle que de nombreux assets de qualité **existent déjà** dans le projet.

### Assets réutilisables immédiatement

| Asset | Chemin | Format | Poids | Action |
|-------|--------|--------|-------|--------|
| Hero vidéo MP4 | `public/hero-ca-tech.mp4` | MP4 | 2 MB | ✅ Réutiliser |
| Hero vidéo MP4 (v2) | `public/videos/hero-home.mp4.mp4` | MP4 | 2 MB | ✅ Réutiliser |
| Hero vidéo WebM | `public/videos/hero-home.webm.mp4` | WebM | **25 MB** | ⚠️ Recompresser |
| Loïc IA MP4 | `public/loic/loic-ia.mp4` | MP4 | 2 MB | ✅ Réutiliser |
| Automation hero | `public/automatisations/automatisation-hero.webp` | WebP | 103 K | ✅ Réutiliser |
| Automation MP4 | `public/automatisations/Automatisations.mp4` | MP4 | 1.8 MB | ✅ Réutiliser |
| Gmail icône | `public/automatisations/gmail.webp` | WebP | 25 K | ✅ Réutiliser |
| Slack icône | `public/automatisations/slack.webp` | WebP | 21 K | ✅ Réutiliser |
| WhatsApp icône | `public/automatisations/whatsapp.webp` | WebP | 32 K | ✅ Réutiliser |
| Google Calendar | `public/automatisations/google-calendar.webp` | WebP | 26 K | ✅ Réutiliser |
| Telegram icône | `public/automatisations/telegram.webp` | WebP | 23 K | ✅ Réutiliser |
| Collaborateur IA hero | `public/collaborateurs/collaborateur-ia-hero.webp` | WebP | 99 K | ✅ Réutiliser |
| Collaborateurs MP4 | `public/collaborateurs/Collaborateurs IA.mp4` | MP4 | 1.5 MB | ✅ Réutiliser |
| Commercial IA | `public/collaborateurs/commercial-ia.webp` | WebP | 61 K | ✅ Réutiliser |
| Comptable IA | `public/collaborateurs/comptable-ia.webp` | WebP | 252 K | ✅ Réutiliser |
| Juridique IA | `public/collaborateurs/juridique-ia.webp` | WebP | 194 K | ✅ Réutiliser |
| RH IA | `public/collaborateurs/rh-ia.webp` | WebP | 57 K | ✅ Réutiliser |
| SEO IA | `public/collaborateurs/seo-ia.webp` | WebP | 60 K | ✅ Réutiliser |
| Support IA | `public/collaborateurs/support-ia.webp` | WebP | 61 K | ✅ Réutiliser |

### Screenshots portfolio réels — À CONNECTER EN URGENCE

> Ces assets existent et sont de bonne qualité. Le problème est que `src/lib/constants.js` a `image: null` pour les 4 projets. **Aucune production nécessaire — juste un câblage.**

| Projet | Screenshots disponibles | Dimensions | Poids |
|--------|------------------------|-----------|-------|
| CA-TECH Manager | `dashboard.webp`, `clients.webp`, `home.webp` | 1400×875 | 65 K |
| CV Magic | `home.webp`, `cv-builder.webp` | 1400×672 | 45 K |
| Pasmal | `home.webp`, `dashboard.webp` | 1400×669 | 57 K |
| Pemous Money | `home.webp` | 1217×810 | 60 K |
| Branding | `logo1.webp`, `logo2.webp`, `flyer1.webp` | — | — |

**Action immédiate requise :** Mettre à jour `src/lib/constants.js` PORTFOLIO_PROJECTS avec les vrais chemins.

### Services images

| Asset | Chemin | État |
|-------|--------|------|
| Site vitrine | `public/services/site-vitrine.webp` | ✅ |
| E-commerce | `public/services/ecommerce.webp` | ✅ |
| Logo design | `public/services/logo-design.webp` | ✅ |
| Branding | `public/services/branding.webp` | ✅ |
| Flyer design | `public/services/flyer-design.webp` | ✅ |
| Landing page | `public/services/landing-page.webp` | ✅ |

---

## 01. INVENTAIRE COMPLET DES ASSETS

### A. HERO

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| H-01 | `catech-hero-loop.mp4` | HeroSection | Vidéo loop | HyperFrames | MP4 H.264 | 16:9 | 1920×1080 | < 3 MB | CRITIQUE | À produire |
| H-02 | `catech-hero-poster.webp` | HeroSection | Image poster | Midjourney | WebP | 16:9 | 1920×1080 | < 150 KB | CRITIQUE | À produire |
| H-03 | `catech-hero-mobile.webp` | HeroSection mobile | Image | Midjourney | WebP | 9:16 | 768×1200 | < 100 KB | ÉLEVÉE | À produire |

### B. AI

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| AI-01 | `catech-ai-showcase-loic.webp` | AIShowcaseSection | Image éditoriale | Midjourney | WebP | 4:3 | 1200×900 | < 120 KB | CRITIQUE | À produire |
| AI-02 | `catech-ai-background.webp` | AIShowcaseSection bg | Image ambiance | Midjourney | WebP | 16:9 | 1440×810 | < 100 KB | ÉLEVÉE | À produire |
| AI-03 | `catech-ai-showcase.mp4` | AIShowcaseSection | Vidéo loop | HyperFrames | MP4 | 4:3 | 1200×900 | < 4 MB | ÉLEVÉE | À produire |
| AI-04 | `loic-ia.mp4` | AIShowcaseSection | Vidéo Loïc | Existant | MP4 | — | — | 2 MB | — | ✅ Existant |
| AI-05 | `collaborateur-ia-hero.webp` | AI section | Image hero | Existant | WebP | — | — | 99 K | — | ✅ Existant |
| AI-06 | `commercial-ia.webp` / etc. | Collaborateurs IA | Images chars | Existant | WebP | — | — | 57–252 K | — | ✅ Existant (×6) |

### C. AUTOMATION

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| AU-01 | `automatisation-hero.webp` | AutomationSection | Image hero | Existant | WebP | — | — | 103 K | — | ✅ Existant |
| AU-02 | `Automatisations.mp4` | AutomationSection | Vidéo | Existant | MP4 | — | — | 1.8 MB | — | ✅ Existant |
| AU-03 | Icônes outils | AutomationSection | Icônes WebP | Existant | WebP | 1:1 | — | 21–32 K | — | ✅ Existant (×5) |
| AU-04 | `catech-automation-flow.webp` | AutomationSection overlay | Image | Midjourney | WebP | 16:9 | 1200×675 | < 100 KB | FAIBLE | CSS suffisant |

### D. LLM

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| LLM-01 | `catech-llm-neural-bg.webp` | LLMSection | Background | Midjourney | WebP | 21:9 | 1920×600 | < 130 KB | ÉLEVÉE | À produire |
| LLM-02 | `catech-llm-neural-loop.mp4` | LLMSection | Vidéo loop | HyperFrames | MP4 | 21:9 | 1920×600 | < 3 MB | MOYENNE | À produire |
| LLM-03 | `catech-llm-poster.webp` | LLMSection fallback | Poster | = frame LLM-02 | WebP | 21:9 | 1920×600 | < 100 KB | ÉLEVÉE | Dériver de LLM-02 |

### E. MCP

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| MCP-01 | `catech-mcp-system.webp` | LLMSection bloc MCP | Illustration tech | Midjourney | WebP | 4:3 | 800×600 | < 80 KB | FAIBLE | CSS/texte suffisant |

### F. DIGITAL EXPERIENCE

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| DE-01 | `catech-project-ca-manager.webp` | DigitalExperiencesSection | Screenshot projet | Existant | WebP | 7:4 | 1400×875 | 65 K | — | ✅ Existant |
| DE-02 | `catech-project-cv-magic.webp` | DigitalExperiencesSection | Screenshot projet | Existant | WebP | ~2:1 | 1400×672 | 45 K | — | ✅ Existant |
| DE-03 | `catech-project-pasmal.webp` | DigitalExperiencesSection | Screenshot projet | Existant | WebP | ~2:1 | 1400×669 | 57 K | — | ✅ Existant |
| DE-04 | `catech-project-pemous-money.webp` | DigitalExperiencesSection | Screenshot projet | Existant | WebP | 3:2 | 1217×810 | 60 K | — | ✅ Existant |

### G. SAAS / SERVICES

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| SV-01–06 | Services images | Services pages (Phase 2) | Illustrations | Existant | WebP | — | — | — | — | ✅ Existant (×6) |
| SV-07 | `catech-saas-dashboard.webp` | SystemsSection | Dashboard SaaS | Midjourney | WebP | 16:9 | 1200×675 | < 100 KB | FAIBLE | CSS suffisant |

### H. INFRASTRUCTURE

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| INF-01 | `catech-infrastructure-bg.webp` | SystemsSection | Background | Midjourney | WebP | 16:9 | 1440×500 | < 80 KB | FAIBLE | CSS grille suffisante |

### I. PORTFOLIO

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| PF-01 | `ca-tech-manager/dashboard.webp` | PortfolioSection | Screenshot | Existant | WebP | 7:4 | 1400×875 | 65 K | CRITIQUE | ✅ Existant — câbler |
| PF-02 | `cv-magic/home.webp` | PortfolioSection | Screenshot | Existant | WebP | ~2:1 | 1400×672 | 45 K | CRITIQUE | ✅ Existant — câbler |
| PF-03 | `pasmal/home.webp` | PortfolioSection | Screenshot | Existant | WebP | ~2:1 | 1400×669 | 57 K | CRITIQUE | ✅ Existant — câbler |
| PF-04 | `pemous-money/home.webp` | PortfolioSection | Screenshot | Existant | WebP | 3:2 | 1217×810 | 60 K | CRITIQUE | ✅ Existant — câbler |
| PF-05 | `catech-project-ca-manager-mockup.webp` | PortfolioSection device | Device mockup | Midjourney | WebP | 4:3 | 1200×900 | < 120 KB | MOYENNE | À produire si voulu |

### J. PROCESS

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| PR-01 | CSS timeline | ProcessSection | Animation CSS | Framer Motion | — | — | — | — | — | ✅ CSS suffisant |

### K. CTA

| # | Nom | Section | Type | Outil | Format | Ratio | Résolution | Poids cible | Priorité | Statut |
|---|-----|---------|------|-------|--------|-------|-----------|-------------|---------|--------|
| CTA-01 | `catech-cta-glow.webp` | CTASection | Background | Midjourney | WebP | 16:9 | 1920×600 | < 80 KB | FAIBLE | CSS gradient suffisant |

### L. FOOTER / LÉGAL

Aucun asset visuel nécessaire. CSS + SVG logo suffisants.

### M. SOCIAL / SEO

| # | Nom | Usage | Type | Outil | Format | Ratio | Résolution | Priorité | Statut |
|---|-----|-------|------|-------|--------|-------|-----------|---------|--------|
| SEO-01 | `og-image.webp` | Open Graph / Twitter Card | Image sociale | Midjourney | WebP/JPG | 2.4:1 | 1200×630 | CRITIQUE | À produire |
| SEO-02 | `og-image-services.webp` | OG pages services | Image sociale | Midjourney | WebP/JPG | 2.4:1 | 1200×630 | MOYENNE | Phase 2 |

---

## 02. MIDJOURNEY PRODUCTION SYSTEM

### Philosophie visuelle CA-TECH

```
REGISTRE    : Éditorial tech premium — entre Fast Company et Stripe
ATMOSPHÈRE  : Nuit technique froide — éclairages d'écran, profondeur de champ
PALETTE     : Deep Navy → Navy → Tech Blue / accent Light Tech Blue
INTERDIT    : Violet IA générique · Rose néon · Orange futuriste · Vert cyberpunk
              Gaming aesthetic · Stock photo corporate · Robots génériques
              Cerveaux holographiques · Personnes devant ordinateur (plan frontal)
```

### Master style suffix CA-TECH

Ajouter à la fin de **chaque prompt Midjourney** :

```
--style raw --v 7 --ar [RATIO]
cinematic editorial photography, deep navy background #05101E,
cold blue accent lighting #359BD9, premium tech aesthetic,
no people facing camera, no purple gradients, no neon,
no stock photography, no generic AI imagery,
depth of field, professional composition, 8K
```

### Palettes lumineuses

```
PRINCIPALE  : Cold 4500-5500K — éclairage écran professionnel
ACCENT      : #359BD9 bleu tech — reflets surfaces, halos d'écran
FOND        : #05101E → #102740 gradient progressif
CONTRE-JOUR : Contour bleu subtil sur personnages
INTERDIT    : Lumière chaude ambrée · Lumière plate diffuse · Flash frontal
```

### Ratios selon l'usage

| Usage | Paramètre MJ | Dimensions |
|-------|-------------|------------|
| Hero desktop | `--ar 16:9` | 1920×1080 |
| Hero mobile | `--ar 9:16` | 1080×1920 |
| Showcase section | `--ar 4:3` | 1200×900 |
| Background wide | `--ar 21:9` | 1920×600 |
| Open Graph | `--ar 1.91:1` | 1200×630 |
| Portrait personnage | `--ar 2:3` | 800×1200 |
| Card thumbnail | `--ar 3:2` | 900×600 |

---

## 03. CHARACTER SYSTEM

### Règle fondamentale

```
ZONE 1 — 80% des sections  → Aucun personnage. Technologie seule.
ZONE 2 — 15% des sections  → Personnage contextualisé, regard vers l'interface.
ZONE 3 — 5% (hero only)    → Scène narrative cinématographique.
```

### Personnages existants — Collaborateurs IA (réutilisables)

Les 6 personnages Midjourney dans `public/collaborateurs/` définissent déjà le style de référence CA-TECH pour les personnages IA. Tout nouveau personnage doit être **cohérent avec ce style**.

**Style de référence observé :**
- Fond profond (navy/sombre)
- Éclairage froid, directionnel
- Tenue professionnelle sobre
- Expression focus/compétence
- Mise en scène tech

### Catégories de personnages

#### CAR-A : Consultant / Expert CA-TECH
```
ARCHÉTYPE   : 35-45 ans, expertise digitale, ton confidentiel
VÊTEMENTS   : Col roulé navy/noir OU chemise épurée
CADRAGE     : Plan poitrine — buste jusqu'au menton
REGARD      : Légèrement de côté (vers interface imaginaire) ou vers l'objectif (portrait)
LUMIÈRE     : Principale = lumière froide screen light, contre-jour navy
EXPRESSION  : Sérieux, compétent, confiant — pas sourire publicitaire
DÉCOR       : Flou profond (bokeh) navy ou interface derrière
```

#### CAR-B : Utilisateur d'IA en action
```
ARCHÉTYPE   : 28-40 ans, entrepreneur ou directeur
VÊTEMENTS   : Business casual sombre
CADRAGE     : Plan de travail — mains + écran en profondeur
REGARD      : Vers l'écran (NE REGARDE PAS l'objectif)
LUMIÈRE     : Écran éclaire le profil — ombre douce de l'autre côté
DÉCOR       : Bureau tech, 1-2 écrans visibles avec données
```

#### CAR-C : Opérateur automatisation
```
ARCHÉTYPE   : 30-45 ans, ops/technique
VÊTEMENTS   : Casual tech — veste technique ou chemise
CADRAGE     : Plan taille — corps visible avec geste vers interface
REGARD      : Écran ou workflow visualisé
LUMIÈRE     : Multiple sources (plusieurs écrans = plusieurs lumières)
DÉCOR       : Multi-écrans, post-its techniques, espace focalisé
```

### Règles de cohérence inter-images

```
1. Toujours le même master style suffix
2. Même température de lumière (froide) entre les images
3. Fond toujours dans la gamme #05101E–#102740
4. Même niveau de rendu (--style raw --v 7)
5. Pas de mix entre réalisme photographique et illustration
```

---

## 04. AI SHOWCASE — Assets détaillés

### AI-01 : Showcase Loïc en contexte (PRIORITÉ CRITIQUE)

**Objectif :** Montrer Loïc IA en action dans un contexte professionnel crédible.  
**Concept :** Main de professionnel sur un bureau, interface de chat IA visible sur écran sombre, résultats affichés.

**Prompt :** `docs/prompts/visuals/02-AI/catech-ai-showcase-loic.md`

### AI-02 : Background section IA

**Objectif :** Ambiance visuelle pour la section AIShowcaseSection.  
**Concept :** Fond abstrait avec flux de données, particles, nodes connexion — sans personnage.

**Prompt :** `docs/prompts/visuals/02-AI/catech-ai-background.md`

### AI-03 : Vidéo showcase IA (HyperFrames)

**Objectif :** Loop animé montrant l'interface Loïc en action.  
**Durée :** 5-8s. Mouvement : léger dolly vers l'écran.

**Prompt :** `docs/prompts/visuals/10-VIDEO/catech-ai-loop.md`

---

## 05. AUTOMATION SHOWCASE — Assets détaillés

### AU-01–03 : Assets existants ✅

Les assets automation (`automatisation-hero.webp`, `Automatisations.mp4`, icônes outils) sont **directement réutilisables** dans `AutomationSection.jsx`. La section CSS animée est déjà fonctionnelle.

### AU-04 : Background optionnel (non bloquant)

CSS actuel satisfaisant. Midjourney seulement si une évolution de la section le demande.

---

## 06. LLM / MCP SHOWCASE — Assets détaillés

### LLM-01 : Neural background (PRIORITÉ ÉLEVÉE)

**Objectif :** Background pour LLMSection — visualisation abstraite d'un réseau neuronal.  
**Concept :** Points lumineux (nodes) connectés par lignes fines translucides, profondeur de champ, fond deep navy.

**Prompt :** `docs/prompts/visuals/04-LLM/catech-llm-neural-bg.md`

### LLM-02 : Neural loop MP4 (HyperFrames)

**Objectif :** Animer LLM-01 — les nodes pulsent et les connexions s'allument progressivement.  
**Durée :** 6s loop parfait.

**Prompt :** `docs/prompts/visuals/10-VIDEO/catech-llm-loop.md`

### MCP-01 : Système MCP (FAIBLE — CSS suffisant)

Section textuelle actuelle satisfaisante. Produire uniquement si la section évolue vers un showcase visuel.

---

## 07. DIGITAL EXPERIENCE — Assets détaillés

### DE-01–04 : Screenshots portfolio — CÂBLAGE REQUIS

Les 4 screenshots existent. Le seul travail requis est de mettre à jour `src/lib/constants.js` :

```javascript
// AVANT (actuel)
{ id: 'ca-tech-manager', image: null, ... }

// APRÈS (à faire)
{ id: 'ca-tech-manager', image: '/portfolio/ca-tech-manager/dashboard.webp', ... }
{ id: 'cv-magic',        image: '/portfolio/cv-magic/home.webp', ... }
{ id: 'pasmal',          image: '/portfolio/pasmal/home.webp', ... }
{ id: 'pemous-money',    image: '/portfolio/pemous-money/home.webp', ... }
```

---

## 08. PORTFOLIO STRATEGY

### Règle absolue

```
ORDRE DE PRIORITÉ :
  1. Vrais screenshots existants (utilisés en priorité)
  2. Compositions graphiques à partir de vrais screenshots
  3. Device mockups enrichis (screenshot dans MacBook/iPhone)
  4. Midjourney uniquement pour compléter l'environnement visuel
  JAMAIS : Faux produit présenté comme projet réel
```

### Inventaire par projet

#### CA-TECH Manager
- **Existants :** `dashboard.webp` (1400×875), `clients.webp`, `home.webp`
- **Status :** Complet — câbler dans constants.js
- **Optionnel :** Mockup MacBook Pro avec dashboard (Midjourney PF-05)

#### CV Magic
- **Existants :** `home.webp` (1400×672), `cv-builder.webp`
- **Status :** Complet — câbler dans constants.js
- **Manque :** Pas de mobile screenshot (optionnel Phase 2)

#### Pasmal
- **Existants :** `home.webp` (1400×669), `dashboard.webp`
- **Status :** Complet — câbler dans constants.js

#### Pemous Money
- **Existants :** `home.webp` (1217×810)
- **Status :** 1 screenshot suffisant — câbler dans constants.js
- **Optionnel :** `analytics.webp` et `dashboard.webp` mentionnés dans portfolio-assets.md mais absents du disque

---

## 09. HYPERFRAMES / HEYGEN — Vidéos à produire

### Règles générales vidéo

```
LOOP PARFAIT    → Début = fin, aucun cut visible
MUTED           → Toutes vidéos silencieuses (autoplay = muted requis)
AUTOPLAY        → Backgrounds décoratifs uniquement
DURÉE           → 4-8s pour loops, 5-12s pour séquences narratives
POSTER FRAME    → Toujours extraire frame 0 en WebP
REDUCED MOTION  → Poster seul si prefers-reduced-motion actif
```

### VID-01 : Hero Cinematic Loop (CRITIQUE)

```yaml
FICHIER     : public/videos/hero/catech-hero-loop.mp4
DURÉE       : 6s loop parfait
RATIO       : 16:9
RÉSOLUTION  : 1920×1080
POIDS CIBLE : < 3 MB
SCÈNE       : Particules lumineuses navy + accent bleu, profondeur infinie
MOUVEMENT   : CAM-FLOAT — micro-oscillation douce, imperceptible
PERSONNAGE  : Aucun
TEXTE       : Aucun
POSTER      : public/videos/hero/catech-hero-poster.webp
NOTES       : Doit pouvoir recevoir du texte par-dessus (overlay navbar + hero content)
```

### VID-02 : AI Showcase Loop (ÉLEVÉE)

```yaml
FICHIER     : public/videos/ai/catech-ai-showcase.mp4
DURÉE       : 5s loop
RATIO       : 4:3
RÉSOLUTION  : 1200×900
POIDS CIBLE : < 4 MB
SCÈNE       : Interface IA en action — texte qui apparaît progressivement, curseur
MOUVEMENT   : CAM-STATIC + animation UI interne (pas de mouvement caméra)
PERSONNAGE  : Main (optionnel, partiel, hors-cadre)
POSTER      : public/videos/ai/catech-ai-showcase-poster.webp
```

### VID-03 : LLM Neural Loop (MOYENNE)

```yaml
FICHIER     : public/videos/llm/catech-llm-neural.mp4
DURÉE       : 8s loop
RATIO       : 21:9
RÉSOLUTION  : 1920×600
POIDS CIBLE : < 3 MB
SCÈNE       : Nodes lumineux qui pulsent, connexions qui s'allument
MOUVEMENT   : Expansion douce depuis le centre
PERSONNAGE  : Aucun
POSTER      : public/videos/llm/catech-llm-poster.webp
```

### VID-04 : Process Sequence (FAIBLE — CSS suffisant)

CSS timeline animation actuelle satisfaisante. Produire uniquement si l'expérience narrative évolue vers une vidéo.

---

## 10. IMAGE + VIDEO PIPELINE

### Pipeline Image (Midjourney → Intégration)

```
1. CONCEPT
   └── Définir section, usage, rôle narratif

2. PROMPT
   └── docs/prompts/visuals/[catégorie]/[nom].md
   └── Toujours inclure master style suffix CA-TECH

3. MIDJOURNEY
   └── Générer 4 variations (--q 2)
   └── Upscale la meilleure (U1–U4)
   └── Variation si nécessaire (V1–V4)

4. SÉLECTION
   └── Checklist validation §15 avant validation

5. RETOUCHE / CROP
   └── Ajustement colorimétrique si warm cast présent
   └── Crop vers ratio cible
   └── Nettoyer artefacts éventuels

6. EXPORT
   └── PNG source conservé dans dossier de travail (non commité)
   └── Conversion WebP 85% → outil : Squoosh / cwebp
   └── Conversion AVIF 80% si poids > 200 KB

7. OPTIMISATION
   └── Vérifier poids < seuil cible
   └── Redimensionner si surdimensionné
   └── Générer version mobile si nécessaire (--ar 9:16)

8. NOMMAGE + PLACEMENT
   └── Convention : catech-[section]-[descriptif]-[variant].webp
   └── Placement : public/visuals/[catégorie]/

9. INTÉGRATION FRONTEND
   └── Composant <picture> avec srcset + WebP + AVIF
   └── Alt text descriptif
   └── loading="lazy" (sauf above-the-fold)
   └── Test responsive
   └── Test reduced motion

10. ASSET FINAL ✅
```

### Pipeline Vidéo (HyperFrames → Intégration)

```
1. CONCEPT
   └── Durée, ratio, mouvement caméra, scène

2. IMAGE SOURCE
   └── Soit image Midjourney existante
   └── Soit screenshot/asset CA-TECH existant

3. HYPERFRAMES
   └── Importer image source
   └── Configurer mouvement (CAM-FLOAT / CAM-PUSH / etc.)
   └── Durée + ratio + résolution
   └── Générer

4. ANIMATION
   └── Vérifier loop parfait
   └── Vérifier absence d'artefacts
   └── Vérifier cohérence palette

5. EXPORT
   └── MP4 H.264 (fallback universel)
   └── WebM AV1 si taille réduite souhaitée

6. OPTIMISATION
   └── Vérifier poids < seuil
   └── Recompresser si nécessaire : ffmpeg -crf 23

7. POSTER
   └── Extraire frame 0 : ffmpeg -ss 0 -frames:v 1 poster.png
   └── Convertir en WebP

8. INTÉGRATION
   └── Composant CAVideo (useReducedMotion)
   └── <source> MP4 + WebM
   └── poster= attribut
   └── autoPlay muted loop playsInline
   └── Test reduced motion (poster affiché)

9. ASSET FINAL ✅
```

---

## 11. NAMING CONVENTION

### Règle générale

```
catech-[section]-[descriptif]-[variant].[ext]
```

- `catech-` : préfixe obligatoire sur tous les assets CA-TECH
- `[section]` : hero | ai | automation | llm | mcp | digital | infra | process | portfolio | cta | og
- `[descriptif]` : nom court descriptif kebab-case
- `[variant]` : 01, 02 / main / bg / poster / mobile / loop (si multiple)
- `[ext]` : `.webp` / `.avif` / `.mp4` / `.webm`

### Exemples

```
catech-hero-loop.mp4
catech-hero-poster.webp
catech-hero-mobile.webp
catech-ai-showcase-loic.webp
catech-ai-showcase-bg.webp
catech-ai-showcase.mp4
catech-llm-neural-bg.webp
catech-llm-neural-loop.mp4
catech-mcp-system.webp
catech-process-timeline.webp
catech-project-ca-manager.webp
catech-project-cv-magic.webp
catech-og-home.jpg
catech-og-services.jpg
```

### Assets portfolio (exception — convention existante conservée)

Les screenshots portfolio conservent leur convention actuelle : `public/portfolio/[projet]/[vue].webp`

---

## 12. STRUCTURE DES DOSSIERS

### Analyse de l'existant

La structure actuelle `public/` est déjà organisée par thème métier (`automatisations/`, `collaborateurs/`, `portfolio/`, `loic/`, `services/`). Cette logique est conservée et étendue.

### Structure cible

```
public/
├── visuals/               ← NOUVEAU — assets produits pour le nouveau site
│   ├── hero/              ← Hero section assets
│   ├── ai/                ← AI Showcase assets
│   ├── llm/               ← LLM/MCP section assets
│   ├── cta/               ← CTA section assets
│   └── og/                ← Open Graph / Social images
│
├── videos/                ← EXISTANT — vidéos de fond et loops
│   ├── hero/              ← Hero cinematic loops
│   ├── ai/                ← AI showcase loops
│   └── llm/               ← LLM neural loops
│
├── portfolio/             ← EXISTANT — screenshots projets (ne pas toucher)
│   ├── ca-tech-manager/
│   ├── cv-magic/
│   ├── pasmal/
│   ├── pemous-money/
│   └── branding/
│
├── automatisations/       ← EXISTANT — automation assets (ne pas toucher)
├── collaborateurs/        ← EXISTANT — AI collaborator images (ne pas toucher)
├── loic/                  ← EXISTANT — Loïc videos (ne pas toucher)
├── services/              ← EXISTANT — services page images (ne pas toucher)
└── logos/                 ← EXISTANT — logos SVG/PNG
```

> **Règle :** Les dossiers existants ne sont pas renommés ni déplacés — les URLs sont indexées. Seuls des dossiers `public/visuals/` et sous-dossiers `public/videos/hero|ai|llm/` sont créés au besoin.

---

## 13. PERFORMANCE WEB

### Formats selon l'usage

| Format | Usage | Priorité |
|--------|-------|---------|
| WebP 85% | Toutes les images (standard) | Principal |
| AVIF 80% | Images > 200 KB (gains 30-40% vs WebP) | Optionnel |
| MP4 H.264 | Toutes les vidéos (fallback universel) | Obligatoire |
| WebM AV1 | Vidéos modernes (gains 20-30% vs H.264) | Recommandé |
| SVG | Logos, icônes, illustrations vectorielles | Obligatoire |
| JPG | Uniquement Open Graph (compatibilité maximale) | OG seulement |

### Seuils de poids cibles

| Type | Seuil max | Note |
|------|-----------|------|
| Image hero desktop | 150 KB | Au-dessus du fold — prioritaire |
| Image showcase | 120 KB | |
| Image background | 100 KB | |
| Image card / thumbnail | 60 KB | |
| Open Graph | 100 KB | JPG acceptable |
| Vidéo loop (< 8s) | 3 MB | MP4 H.264 |
| Vidéo showcase (< 12s) | 5 MB | |

### Implémentation `<picture>` responsive

```jsx
<picture>
  <source
    media="(min-width: 1280px)"
    srcSet="/visuals/hero/catech-hero-main.avif"
    type="image/avif"
  />
  <source
    media="(min-width: 1280px)"
    srcSet="/visuals/hero/catech-hero-main.webp"
    type="image/webp"
  />
  <source
    srcSet="/visuals/hero/catech-hero-mobile.webp"
    type="image/webp"
  />
  <img
    src="/visuals/hero/catech-hero-mobile.webp"
    alt=""
    loading="eager"
    decoding="async"
    fetchpriority="high"
    width="1920"
    height="1080"
  />
</picture>
```

### Stratégie de chargement

```
above-the-fold   → loading="eager" + fetchpriority="high" + preload link
below-the-fold   → loading="lazy" + decoding="async"
vidéo hero       → preload="metadata" (pas "auto")
vidéo off-screen → preload="none" + Intersection Observer pour déclencher
```

### Preload hero dans `<head>`

```html
<link rel="preload" as="image"
  href="/visuals/hero/catech-hero-poster.webp"
  type="image/webp"
  fetchpriority="high"
/>
```

### Compression vidéo (ffmpeg)

```bash
# Recompresser hero-home.webm.mp4 (actuellement 25 MB → < 3 MB cible)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow \
  -profile:v high -level 4.0 -movflags +faststart \
  -an output.mp4

# Extraire poster frame
ffmpeg -ss 0.5 -i input.mp4 -frames:v 1 -q:v 2 poster.jpg
cwebp -q 85 poster.jpg -o poster.webp
```

---

## 14. REDUCED MOTION

### Règle CA-TECH

Si `prefers-reduced-motion: reduce` est actif :

```
Vidéos décoratives    → Remplacées par poster image (aucune vidéo)
Animations CSS loop   → Arrêtées (animation: none)
Scroll parallax       → Désactivé
Framer Motion         → Variants {} (pas d'animation)
Transitions UI        → Conservées si < 200ms et fonctionnelles
```

### Composant vidéo avec fallback

```jsx
function CAVideo({ src, poster, alt = '' }) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return (
      <img
        src={poster}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )
  }

  return (
    <video
      src={src}
      poster={poster}
      autoPlay muted loop playsInline
      preload="metadata"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
```

### Poster frame obligatoire

Chaque vidéo doit avoir un `.webp` poster au même chemin (nom identique, extension différente) :
```
public/videos/hero/catech-hero-loop.mp4     ← vidéo
public/videos/hero/catech-hero-poster.webp  ← poster fallback
```

---

## 15. CHECKLIST QA ASSET

```
PALETTE
  [ ] Fond dominant : #05101E ou #102740
  [ ] Aucune couleur criarde (violet, rose, orange vif, vert cyberpunk)
  [ ] Accent #359BD9 cohérent si présent
  [ ] Pas de blanc dominant sur fond sombre

STYLE
  [ ] Semi-réaliste / cinématographique (pas cartoon)
  [ ] Aucun cliché IA (cerveau robotique, circuits verts, hologrammes)
  [ ] Pas de stock photo corporate
  [ ] Composition premium — pas centré-banal
  [ ] Lumière dirigée et sourcée

PERSONNAGE (si présent)
  [ ] Pas de sourire publicitaire
  [ ] Vêtements sobres et foncés
  [ ] Regard vers interface (sauf portrait justifié)
  [ ] Pas de gros plan de visage sauf portrait
  [ ] Cohérent avec le style collaborateurs existants

TECHNIQUE
  [ ] Format WebP (+ AVIF si > 200 KB)
  [ ] Poids respecte seuils §13
  [ ] Dimensions correctes
  [ ] Poster extrait si vidéo
  [ ] Alt text rédigé (descriptif) ou alt="" (décoratif)
  [ ] loading="lazy" (sauf above-the-fold)

INTÉGRATION
  [ ] Contraste texte maintenu si texte par-dessus (min 4.5:1)
  [ ] Responsive testé mobile/tablet/desktop
  [ ] Reduced motion : poster affiché si vidéo
  [ ] Aucun débordement ou recadrage non voulu
  [ ] Performance : LCP < 2.5s après intégration
```

---

## RÉSUMÉ FINAL

### Totaux

| Catégorie | Total | Existants | À produire MJ | À produire HF | CSS suffisant |
|-----------|-------|-----------|---------------|---------------|---------------|
| Hero | 3 | 0 | 2 | 1 | 0 |
| AI | 6 | 2 | 2 | 1 | 1 (CSS chat) |
| Automation | 4 | 3 | 0 | 0 | 1 |
| LLM | 3 | 0 | 1 | 1 | 1 (poster dérivé) |
| MCP | 1 | 0 | 0 | 0 | 1 |
| Digital Exp. | 4 | 4 | 0 | 0 | 0 |
| SaaS/Services | 7 | 6 | 0 | 0 | 1 |
| Infrastructure | 1 | 0 | 0 | 0 | 1 |
| Portfolio | 5 | 4 | 1 | 0 | 0 |
| Process | 1 | 0 | 0 | 0 | 1 |
| CTA | 1 | 0 | 0 | 0 | 1 |
| Social/SEO | 2 | 0 | 1 | 0 | 1 |
| **TOTAL** | **38** | **19** | **7** | **3** | **9** |

### Assets critiques homepage V1

| Priorité | Asset | Action | Blocking |
|----------|-------|--------|---------|
| 🔴 URGENT | PF-01–04 : screenshots portfolio | Câbler constants.js | Carousel vide |
| 🔴 CRITIQUE | H-01 : hero loop MP4 | Produire HyperFrames | Hero section |
| 🔴 CRITIQUE | H-02 : hero poster | Produire Midjourney | Fallback hero |
| 🟠 ÉLEVÉE | AI-01 : showcase Loïc | Produire Midjourney | AI section |
| 🟠 ÉLEVÉE | LLM-01 : neural background | Produire Midjourney | LLM section |
| 🟡 MOYENNE | SEO-01 : OG image | Produire Midjourney | Partage social |
| 🟡 MOYENNE | AI-03 : vidéo showcase | Produire HyperFrames | AI section enrichie |
| 🟢 FAIBLE | LLM-02 : neural loop | Produire HyperFrames | CSS suffit en attendant |

### Assets pouvant rester en CSS

- SystemsSection : grille technique CSS ✅
- ProcessSection : timeline CSS animée ✅
- CTASection : gradient CSS ✅
- AutomationSection : nœuds CSS animés ✅ (enrichir plus tard avec vrais visuels)
- MCP block : texte + tags ✅

### Vrais assets existants à réutiliser

- **Portfolio** : 9 screenshots (4 projets × 2-3 vues + branding)
- **Automation** : hero image + MP4 + 5 icônes outils
- **Collaborateurs IA** : hero + 6 personnages IA + MP4
- **Loïc** : loic-ia.mp4
- **Hero video** : hero-ca-tech.mp4 (qualité à valider)
- **Services** : 6 images services

### Prompts créés

- `docs/prompts/visuals/01-HERO/catech-hero-main.md`
- `docs/prompts/visuals/01-HERO/catech-hero-poster.md`
- `docs/prompts/visuals/02-AI/catech-ai-showcase-loic.md`
- `docs/prompts/visuals/02-AI/catech-ai-background.md`
- `docs/prompts/visuals/04-LLM/catech-llm-neural-bg.md`
- `docs/prompts/visuals/09-PORTFOLIO/catech-project-mockup.md`
- `docs/prompts/visuals/09-PORTFOLIO/catech-og-home.md`
- `docs/prompts/visuals/10-VIDEO/catech-hero-loop.md`
- `docs/prompts/visuals/10-VIDEO/catech-ai-loop.md`
- `docs/prompts/visuals/10-VIDEO/catech-llm-loop.md`
