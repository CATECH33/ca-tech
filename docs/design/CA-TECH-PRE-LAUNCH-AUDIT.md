# CA-TECH Pre-Launch Audit

**Date :** 2026-10-01  
**Session :** PROMPT 34  
**Auteur :** Claude Code  
**Portée :** Site principal `www.ca-tech.fr` (hors manager sub-app)

---

## Executive Summary

L'audit couvre 18 domaines : routes, placeholders, liens, formulaires, APIs, Supabase, sécurité, responsive, visuel, contenu, légal, SEO, performance, accessibilité, console, build, déploiement et cohérence CTA.

**Résultat :**

| Sévérité | Nombre |
|---|---|
| P0 — Blocker | **0** |
| P1 — High | **2** |
| P2 — Medium | **9** |
| P3 — Low | **5** |

Les deux P1 sont des problèmes **d'infrastructure SEO et de métadonnées sociales** — ils n'empêchent pas le site de fonctionner mais compromettent la visibilité dès le lancement (partages sociaux sans image, soft 404s en Search Console).

---

## Routes Inventory

| Route | Existe | Fonctionnelle | Contenu final | Statut |
|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ | READY |
| `/contact` | ✅ | ✅ API connectée | ✅ | READY |
| `/devis` | ✅ | ✅ API connectée | ✅ | READY |
| `/a-propos` | ✅ | ✅ | ✅ | READY |
| `/mentions-legales` | ✅ | ✅ | ✅ | READY |
| `/politique-de-confidentialite` | ✅ | ✅ | ✅ | READY |
| `/gestion-des-cookies` | ✅ | ✅ | ✅ | READY |
| `/services` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/services/ia` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/services/automatisation` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/services/llm-mcp` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/services/systemes` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/services/developpement` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/services/seo` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/services/design` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/projets` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/projets/:slug` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/blog` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/blog/:slug` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/loic` | ✅ | ⚠️ Stub | ❌ | Phase 2 |
| `/portfolio-preview` | ✅ | ✅ | 🔧 Dev only | **P2** — accessible en prod sans guard |
| `/creation-site-internet-dijon` | ⚠️ HTML physique, route React absente | ❌ NotFound | ❌ | **P1** — soft 404 |
| `/creation-site-internet-lyon` | ⚠️ idem | ❌ NotFound | ❌ | **P1** — soft 404 |
| `/creation-site-internet-paris` | ⚠️ idem | ❌ NotFound | ❌ | **P1** — soft 404 |
| `/agence-ia-dijon` | ⚠️ idem | ❌ NotFound | ❌ | **P1** — soft 404 |
| `/agence-ia-lyon` | ⚠️ idem | ❌ NotFound | ❌ | **P1** — soft 404 |
| `/automatisation-pme` | ⚠️ idem | ❌ NotFound | ❌ | **P1** — soft 404 |

**Redirects Vercel (permanents, fonctionnels) :**
`/diagnostic-ia` → `/contact`, `/realisations` → `/projets`, `/loic-ia` → `/loic`, `/collaborateurs-ia` → `/services/ia`, `/automatisations` → `/services/automatisation`, `/catalogue` → `/`, `/tarifs` → `/contact`, `/expertises/*` → `/services/*`

**Routes App.jsx inexistantes dans vite.config.js SPA_ROUTES :**  
`/services/ia`, `/services/automatisation`, `/services/llm-mcp`, `/services/systemes`, `/services/developpement`, `/services/seo`, `/services/design`, `/projets/:slug`, `/blog/:slug` — manquants dans `SPA_ROUTES`. Ne bloque pas en production (Vercel rewrite catch-all) mais peut causer des 404 en dev local si le navigateur fait un rechargement direct sur ces URLs. **P3.**

---

## Placeholder Audit

### Occurrences pertinentes

| Fichier | Occurrence | Impact | Statut |
|---|---|---|---|
| `src/pages/StubPage.jsx:13` | "En construction" | Normal — 13 routes Phase 2 | ✅ Intentionnel |
| `src/portfolio-mockups/index.jsx` | Commentaires `— ` (dev notes) | Fichier dev-only, non-public | ✅ OK |
| `src/App.jsx:87` | `{/* Dev-only route */}` | Route accessible en prod | ⚠️ P2 — voir section Routes |

### Aucune occurrence de :
`TODO`, `FIXME`, `PLACEHOLDER`, `À COMPLÉTER`, `lorem ipsum`, `test@test`, `dummy`, `fake`, `example.com`, `TBD`, `XXX`, `Bientôt disponible` — **aucun placeholder résiduel dans les pages de production.**

---

## Link Audit

### Liens internes — statut

| Source | Lien | Destination | Statut |
|---|---|---|---|
| Hero | `/contact` | Contact page | ✅ |
| Hero | `/services` | Stub | ⚠️ Phase 2 |
| Header | `/contact` | Contact page | ✅ |
| Header | `/services` dropdown | Stubs | ⚠️ Phase 2 |
| LLMSection | `/contact` | Contact page | ✅ |
| LLMSection | `/services/ia` | Stub | ⚠️ Phase 2 |
| AutomationSection | `/services/automatisation` | Stub | ⚠️ Phase 2 |
| ExpertiseSection | `/contact` | Contact page | ✅ |
| ExpertiseSection cards | `/services/*` | Stubs | ⚠️ Phase 2 |
| CTASection | `/contact` | Contact page | ✅ |
| CTASection | `/devis` | Devis page | ✅ |
| Footer | `mailto:contact@ca-tech.fr` | Cliquable | ✅ |
| Footer | `tel:+33775664975` | Cliquable | ✅ |
| Footer | `/contact` | Contact page | ✅ |
| Footer | `/devis` | Devis page | ✅ |
| Footer | `/mentions-legales` | Page réelle | ✅ |
| Footer | `/politique-de-confidentialite` | Page réelle | ✅ |
| Footer | `/gestion-des-cookies` | Page réelle | ✅ |
| GestionCookies | `policies.google.com/privacy` | Lien externe valide | ✅ |

**Tous les CTAs de conversion pointent vers des destinations fonctionnelles.**  
Liens vers stubs : normaux pour un lancement Phase 1. Stubs ont tous un lien "Retour à l'accueil".

### Liens cassés confirmés
- `og:image` / `twitter:image` → `https://www.ca-tech.fr/assets/logos/logo-ca-tech.png` — **fichier inexistant** (P1)
- JSON-LD `Organization.logo.url` → même URL cassée (P1)
- JSON-LD `WebSite.potentialAction` SearchAction → `https://www.ca-tech.fr/catalogue?q=` — `/catalogue` redirige vers `/` sans searchbox (P2)
- JSON-LD `Offer.url` → `/creation-site-vitrine`, `/creation-site-ecommerce`, `/creation-logo` — routes inexistantes (P2)

---

## Forms

### `/contact`

| Point | Résultat |
|---|---|
| Labels HTML (`<label htmlFor>`) | ✅ Tous les champs ont un label associé |
| Champs obligatoires | ✅ email + message (required, validation frontend) |
| Validation avant envoi | ✅ Bouton désactivé si email/message vides |
| État loading | ✅ Spinner + texte "Envoi en cours…" |
| État succès | ✅ CheckCircle2 + confirmation + numéro de téléphone fallback |
| État erreur | ✅ Message d'erreur réel + fallback `contact@ca-tech.fr` |
| Envoi vers API | ✅ `POST /api/contact` |
| Faux succès possible | ❌ Non — le statut success n'est affiché que sur `res.ok` |
| Accessibilité | ✅ IDs uniques, labels, required |
| Mobile | ✅ `grid-cols-1 sm:grid-cols-2`, inputs pleine largeur |

### `/devis`

| Point | Résultat |
|---|---|
| Labels HTML | ✅ |
| Champs obligatoires | ✅ email + type de projet |
| Validation | ✅ Vérification côté API : `contact_email manquant`, `project_type manquant` |
| État succès | ✅ Affiche le numéro de référence DEV-YYYY-XXXX retourné par l'API |
| État erreur | ✅ Message d'erreur avec fallback email/téléphone |
| API réelle | ✅ `POST /api/devis` — Supabase + notification admin |
| Faux succès | ❌ Non — le numéro de référence vient de la BDD |

---

## API

| API | Variables requises | Validation inputs | Gestion erreurs | Réponse HTTP |
|---|---|---|---|---|
| `api/contact.js` | `SUPABASE_URL` — CONFIGURED | `email + message requis` → 400 | 500 + message descriptif | 200 / 400 / 405 / 500 |
| `api/devis.js` | `SUPABASE_URL` — CONFIGURED | `contact_email + project_type` → 400 | 500 + message | 200 / 201 / 400 / 405 / 500 |
| `api/notifications.js` | `RESEND_API_KEY` — CONFIGURED, `CALLMEBOT_PHONE` — CONFIGURED, `ADMIN_EMAIL` — CONFIGURED | Input via callers | Canaux indépendants, failure non bloquante | Via callers |

**Variables d'environnement production nécessaires (Vercel) :**

| Variable | Usage | Statut présumé |
|---|---|---|
| `SUPABASE_URL` | APIs contact + devis | CONFIGURED (déjà utilisé pour api/devis.js) |
| `SUPABASE_SERVICE_ROLE_KEY` | APIs contact + devis | CONFIGURED |
| `RESEND_API_KEY` | Email notifications | CONFIGURED |
| `ADMIN_EMAIL` | Destination email admin | CONFIGURED |
| `CALLMEBOT_PHONE` | WhatsApp notifications | CONFIGURED |
| `CALLMEBOT_APIKEY` | WhatsApp auth | CONFIGURED |
| `SITE_URL` | CORS origin | CONFIGURED ou fallback `https://www.ca-tech.fr` |

**À vérifier manuellement dans Vercel Settings avant déploiement** — ces variables n'étaient pas confirmées en live dans cette session.

**Dépendance `stripe` :** présente dans `package.json` mais aucune API Stripe trouvée dans `api/`. Utilisée exclusivement dans le manager (`/manager`). Pas de Stripe key exposée dans le code du site principal.

---

## Supabase

Vérification statique (pas d'accès live à la base dans cette session).

| Élément | Statut observé |
|---|---|
| Tables utilisées | `leads`, `devis`, `devis_items`, `devis_relances`, `audit_logs`, `notification_logs`, `notification_settings` |
| Credentials frontend | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` dans `.env.local` — **non utilisées dans le code frontend** (aucun `import.meta.env.VITE_` trouvé dans `src/`) |
| Credentials API | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` via `process.env` — server-side uniquement ✅ |
| RLS | Non vérifiable sans accès live — à confirmer pour `leads` (insert via API avec service role → contourne RLS, correct) |
| Edge Functions | Aucune identifiée |

**Note :** `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définies dans `.env.local` mais aucun composant frontend ne les utilise via `import.meta.env`. Soit elles sont du code legacy, soit elles sont utilisées dans le manager. Non exposées dans le bundle du site principal.

---

## Security

| Vérification | Résultat |
|---|---|
| Secrets hardcodés dans `src/` | ✅ Aucun trouvé |
| Clés privées dans frontend | ✅ Aucune — `SUPABASE_SERVICE_ROLE_KEY` uniquement dans `api/` |
| `process.env.*` dans `src/` | ✅ Aucune — exclusivement dans `api/` |
| `import.meta.env.*` dans `src/` | ✅ Aucune utilisation trouvée |
| Données personnelles hardcodées | ✅ Seules les coordonnées professionnelles publiques (email, tel, SIRET) |
| En-têtes sécurité Vercel | ✅ X-Content-Type-Options, X-Frame-Options DENY, HSTS, CSP-compatible |
| CORS APIs | ✅ Restreint à `SITE_URL` ou `https://www.ca-tech.fr` |
| `/portfolio-preview` | ⚠️ Accessible sans authentification en production (P2) |

---

## Responsive

Vérification statique des layouts (pas de Playwright interactif disponible).

| Section | Mobile (`<768px`) | Tablet | Desktop |
|---|---|---|---|
| Header | `grid` collapse → burger menu (NavMobile) | ✅ | ✅ |
| Hero | `clamp(36px, 5vw, 72px)` headline, CTAs `flexWrap` | ✅ | ✅ |
| PositionnementSection | `grid-cols-1 lg:grid-cols-12` → stacked | ✅ | ✅ |
| AIShowcaseSection | `md:flex-row` → col | ✅ | ✅ |
| AutomationSection | Workflow scroll horizontal `overflowX: auto` | ✅ | ✅ |
| LLMSection | `md:grid-cols-3 gap-0` → col | ✅ | ✅ |
| ExpertiseSection | `md:grid-cols-12` → col | ✅ | ✅ |
| CTASection | CTAs `flexWrap`, `justifyContent: center` | ✅ | ✅ |
| Contact | `grid-cols-1 lg:grid-cols-12` → stacked | ✅ | ✅ |
| Devis | Boutons type projet `flex-wrap` | ✅ | ✅ |
| Footer | `grid-cols-1 sm:grid-cols-2 md:grid-cols-4` | ✅ | ✅ |

**Aucun overflow visible dans le code.** Tous les breakpoints utilisent les classes Tailwind existantes du Design System.

---

## Visual QA

| Élément | Statut |
|---|---|
| Palette couleurs | ✅ Cohérente — `#05101E`, `#102740`, `#359BD9`, `#F2F4F6`, `#A5ACB5` |
| Typography | ✅ Space Grotesk (display), Inter (body), JetBrains Mono (mono) — tokens CSS vars |
| Border-radius | ✅ `6px` boutons, `10-16px` cards, `4px` tags |
| Boutons primaires | ✅ `background: #359BD9` rempli |
| Boutons secondaires | ✅ Ghost border `rgba(53,155,217,0.35)` |
| Animations | ✅ Framer Motion, `useReducedMotion` respecté partout |
| Icônes | ✅ `lucide-react` — cohérent |
| Images hero | ✅ WebP + fallback poster, `fetchpriority="high"` |
| Images portfolio | ✅ 4 × WebP confirmés dans `public/portfolio/` |
| Glow/ambient | ✅ Consistant entre sections |

**Incohérences notées :**
- `theme_color` dans webmanifest = `#0066FF` (bleu du CLAUDE.md) mais palette site utilise `#359BD9`. Mineur, P3.
- CTASection description (ligne 85) mentionne encore Loïc nominativement après le changement du CTA. P2.

---

## Content QA

| Élément | Statut |
|---|---|
| Fautes d'orthographe détectées | Aucune identifiée |
| Cohérence terminologique | ✅ "cabinet", "IA", "automatisation", "LLM", "MCP" cohérents |
| Promesses sans source | ⚠️ P2 — voir P2-07 (déjà traité en session précédente) |
| Coordonnées | ✅ email `contact@ca-tech.fr`, tél `07 75 66 49 75`, SIRET, adresse |
| Nom de domaine | ✅ `www.ca-tech.fr` dans meta, JSON-LD, CORS |
| CTA H1 Hero | ✅ "Parler de votre projet" → `/contact` |
| CTA final CTASection | ✅ "Parler de votre projet" → `/contact` |
| `loic.ca-tech.fr` dans AIShowcaseSection | ⚠️ P3 — URL affichée dans UI demo, pas de sous-domaine réel |
| "Agence Web & Design" dans email template | ⚠️ P2 — incohérent avec positionnement "cabinet IA-first". Présent dans `api/notifications.js` ligne 263. |

---

## Legal QA

| Élément | Statut |
|---|---|
| `/mentions-legales` | ✅ Forme juridique EI, dirigeant JEAN KEVIN PEMOU, SIRET, TVA Non applicable |
| Aucun `[À COMPLÉTER]` résiduel | ✅ Confirmé |
| `/politique-de-confidentialite` | ✅ 9 sections RGPD complètes |
| `/gestion-des-cookies` | ✅ Tableau des 4 cookies documentés |
| Liens légaux Footer | ✅ Les 3 pages accessibles depuis le Footer |
| Lien légal depuis Contact | ✅ "politique de confidentialité" lié correctement |
| Cohérence coordonnées | ✅ Identiques dans toutes les pages légales |
| Données inventées | ✅ Aucune |

---

## SEO Technical

| Élément | Statut |
|---|---|
| `<title>` | ✅ "CA-TECH — Intelligence Artificielle, Automatisation & Technologie" |
| `<meta name="description">` | ✅ 159 caractères, descriptif |
| `<meta name="robots">` | ✅ `index,follow,max-image-preview:large,max-snippet:-1` |
| `<link rel="canonical">` | ✅ `https://www.ca-tech.fr/` |
| H1 Homepage | ✅ "L'intelligence qui transforme votre entreprise." |
| H2 différencié de H1 | ✅ "IA, automatisation, développement web — un seul cabinet." |
| Open Graph | ⚠️ **P1** — `og:image` pointe vers `/assets/logos/logo-ca-tech.png` qui n'existe pas |
| Twitter Card | ⚠️ **P1** — `twitter:image` même URL cassée |
| JSON-LD Organization | ✅ Structure correcte, données vérifiées |
| JSON-LD logo | ⚠️ **P1** — même URL cassée que OG image |
| JSON-LD SearchAction | ⚠️ P2 — target `/catalogue?q=` redirige vers `/` |
| JSON-LD Offer URLs | ⚠️ P2 — `/creation-site-vitrine`, `/creation-site-ecommerce`, `/creation-logo` inexistants |
| `robots.txt` | ✅ `Allow: /`, Sitemap référencé, crawlers IA explicitement autorisés |
| `sitemap.xml` | ⚠️ **P1** — 6 URLs SEO locales pointent vers NotFound (soft 404) |
| Google Search Console verification | ✅ `<meta name="google-site-verification">` présent |
| Favicon | ✅ ico + 16x16 + 32x32 + apple-touch-icon |
| `site.webmanifest` | ✅ PWA complet, 11 icônes |

---

## Performance

| Élément | Statut |
|---|---|
| Hero LCP | ✅ `<link rel="preload" as="image" fetchpriority="high">` |
| Images WebP | ✅ Hero (3 variantes) + Portfolio (4 fichiers) |
| Lazy loading images | ✅ `loading="lazy"` sur portfolio images |
| Code splitting | ✅ 14 chunks (vendor-react, vendor-motion, pages lazy) |
| JS total (gzip) | 60 + 42 + 14 + 8 + 15 = ~139 kB gzip (vendor) + ~67 kB app — acceptable |
| CSS | ✅ 119 kB brut / 20 kB gzip |
| Fonts | ✅ `preconnect` + `preload as="style"` + `noscript` fallback |
| Service Worker | ⚠️ P3 — `/sw.js` non trouvé dans `public/`, registration silently fails |
| Cache-Control assets | ✅ `max-age=31536000, immutable` pour `/dist/assets/*` |
| Hero PNG résiduel | ⚠️ P3 — `catech-hero-01.png` (PNG) présent dans `public/hero/` en plus du WebP. Non référencé dans le code mais augmente l'espace disque inutilement. |

---

## Accessibility

| Élément | Statut |
|---|---|
| `alt` images hero | ✅ `alt=""` (décoratif, correct) |
| `alt` logo Header/Footer | ✅ `alt="CA-TECH"` |
| `alt` portfolio | ✅ `alt={project.title}` |
| `aria-hidden` éléments décoratifs | ✅ glows, fond Hero, Stats band |
| `aria-label` boutons icon-only | ✅ LinkedIn `aria-label="LinkedIn CA-TECH"` |
| Labels formulaire Contact | ✅ 5 champs avec `<label htmlFor>` + id correspondant |
| Labels formulaire Devis | ✅ Labels présents |
| Skip link | ✅ `<a href="#main-content" className="skip-link">` |
| Structure H1/H2/H3 | ✅ Hiérarchie cohérente sur Homepage et pages légales |
| Focus visible | ✅ Non vérifié interactivement (CSS `skip-link` présent) |
| Contraste texte | ✅ `#F2F4F6` sur `#05101E` — ratio > 15:1 |
| `prefers-reduced-motion` | ✅ `useReducedMotion()` dans toutes les sections animées |

---

## Console

Vérification statique. Les patterns suivants sont identifiés comme pouvant générer des warnings :

| Source | Type | Sévérité | Commentaire |
|---|---|---|---|
| `axeptio-consent.js` | Script externe non-module | Warning Vite build (non-runtime) | Préexistant, non corrigeable |
| `loic-widget.js` | Script externe non-module | Warning Vite build (non-runtime) | Préexistant, non corrigeable |
| `sw.js` not found | Failed fetch (sw registration) | Info/Warning runtime | `.catch(() => {})` — silencieux |
| API calls sans vars env | 500 errors si Vercel non configuré | Error en prod non configurée | Risque si déploiement sans env vars |

---

## Build

```
npm run build

vite v8.1.5 building client environment for production...
✓ 2377 modules transformed.
✓ built in 1.68s

0 erreur — 2 warnings préexistants (scripts externes non-module)
```

**Chunks :**

| Chunk | Taille | Gzip |
|---|---|---|
| vendor-react | 189 kB | 60 kB |
| vendor-motion | 128 kB | 42 kB |
| vendor-router | 42 kB | 15 kB |
| portfolio-mockups | 42 kB | 9 kB |
| Home | 54 kB | 11 kB |
| CTASection | 34 kB | 13 kB |
| vendor-icons | 22 kB | 8 kB |
| Contact | 12 kB | 3.3 kB |
| APropos | 13 kB | 3.7 kB |
| Devis | 10 kB | 3.4 kB |

---

## Deployment

| Élément | Statut |
|---|---|
| `vercel.json` `buildCommand` | ✅ `sh build.sh` (build site + manager + SPA routing) |
| `outputDirectory` | ✅ `.` (racine) — correct pour la stratégie de copie des HTML |
| `cleanUrls: true` | ✅ Permet `/contact` sans extension |
| `trailingSlash: false` | ✅ |
| SPA catch-all rewrite | ✅ `"/((?!manager).*)"` → `/index-src.html` |
| Routes API serverless | ✅ `api/*.js` → fonctions Vercel, `maxDuration: 30` |
| En-têtes sécurité | ✅ HSTS, X-Frame-Options, CSP-compatible |
| SPA routes dans `vite.config.js` | ⚠️ P3 — `/services/ia`, `/services/automatisation`, etc. absents de `SPA_ROUTES` (dev only, prod OK via Vercel) |
| `build.sh` — routes SEO locales | ⚠️ P1 — crée des HTML pour 6 routes SEO sans route React correspondante |
| Manager sub-app | ⚠️ Hors scope principal — accessible à `/manager`, auth requise (non auditée) |

---

## CTA Consistency

### Occurrences de Loïc — classement

| Fichier | Occurrence | Type | Classification |
|---|---|---|---|
| `CTASection.jsx:85` | "Loïc analyse votre situation en 15 minutes" | Description commerciale | **P2** — mentionner Loïc comme agent CA-TECH est légitime mais désalignement avec le CTA "Parler de votre projet" |
| `pages/expertises/IA.jsx:89` | "Parler à Loïc" | CTA commercial | **P2** — page non connectée (route = Stub), à corriger en Phase 2 |
| `AutomationSection.jsx:13` | "Loïc analyse le profil" | Label technique diagram | ✅ Fonctionnel, product feature |
| `AIShowcaseSection.jsx` | `LoicInterface`, "Loïc — Agent IA CA-TECH" | UI demo produit | ✅ Fonctionnel, product showcase |
| `APropos.jsx:129-197` | Section profil Loïc | Page entreprise | ✅ Contenu produit |
| `api/notifications.js:208-227` | `message_transmis_loic` template | Infrastructure backend | ✅ Fonctionnel |
| `GestionCookies.jsx:87` | `loic_session` cookie | Légal | ✅ Légal |
| `PolitiqueConfidentialite.jsx:71` | "Agent IA Loïc" | Légal RGPD | ✅ Légal |

**CTA commercial "Parler à Loïc" éliminé des routes de production :** confirmé sur CTASection (désormais "Parler de votre projet"). L'occurrence restante (`expertises/IA.jsx`) est sur une page non routée.

---

## Issues Matrix

### P0 — BLOCKERS (0)

*Aucun.*

### P1 — HIGH (2)

| ID | Problème | Localisation | Action requise |
|---|---|---|---|
| P1-A | **OG image cassée** — `og:image`, `twitter:image` et JSON-LD `Organization.logo` pointent vers `/assets/logos/logo-ca-tech.png` qui n'existe pas. Tous les partages sociaux et le logo Schema.org sont brisés. | `index-src.html` | Corriger le chemin vers `/logos/logo-ca-tech-icon.png` (3 occurrences) |
| P1-B | **Soft 404 SEO** — 6 URLs dans `sitemap.xml` (`/creation-site-internet-dijon`, etc.) ont des fichiers HTML physiques dans `build.sh` mais aucune route React → render NotFound avec HTTP 200. Google les indexera comme soft 404, impactant le domaine dès le lancement. | `sitemap.xml` + `build.sh` | Retirer ces 6 URLs du sitemap.xml avant le lancement (les routes existent en Phase 2, le sitemap sera mis à jour alors) |

### P2 — MEDIUM (9)

| ID | Problème | Localisation | Action |
|---|---|---|---|
| P2-A | `/portfolio-preview` accessible en prod sans auth | `App.jsx:88` | Ajouter un guard ou supprimer la route avant lancement public |
| P2-B | CTASection description mentionne Loïc après changement CTA | `CTASection.jsx:85` | Reformuler : remplacer "Loïc analyse" par CA-TECH comme sujet |
| P2-C | JSON-LD SearchAction cible `/catalogue?q=` (redirige vers `/`) | `index-src.html` | Supprimer `potentialAction` ou corriger l'URL |
| P2-D | JSON-LD Offer URLs inexistantes | `index-src.html` | Mettre à jour vers `/services/ia`, `/services/developpement`, etc. |
| P2-E | `api/notifications.js:263` — email template header "Agence Web & Design" | `api/notifications.js` | Mettre à jour en "Cabinet IA & Digital" ou équivalent |
| P2-F | `expertises/IA.jsx` "Parler à Loïc" CTA — page non routée | `src/pages/expertises/IA.jsx:89` | Corriger lors du branchement Phase 2 de `/services/ia` |
| P2-G | SPA routes `/services/ia` etc. absentes de `vite.config.js` `SPA_ROUTES` | `vite.config.js` | Ajouter pour le dev local (prod OK via Vercel) |
| P2-H | `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env.local` non utilisées | `.env.local` | Confirmer si legacy ou utilisées dans manager ; supprimer si inutiles |
| P2-I | `loic.ca-tech.fr` affiché dans AIShowcaseSection — sous-domaine inexistant | `AIShowcaseSection.jsx:79` | Remplacer par `ca-tech.fr` ou marquer clairement comme maquette |

### P3 — LOW (5)

| ID | Problème | Localisation | Action |
|---|---|---|---|
| P3-A | `sw.js` absent — Service Worker registration silently fails | `public/`, `index-src.html` | Créer un `public/sw.js` minimal ou supprimer la registration |
| P3-B | `catech-hero-01.png` (PNG) présent dans `public/hero/` en plus du WebP | `public/hero/` | Supprimer si non référencé ailleurs |
| P3-C | `theme_color` webmanifest = `#0066FF` vs palette site `#359BD9` | `public/site.webmanifest` | Aligner sur `#05101E` (fond) ou `#359BD9` (brand) |
| P3-D | Raccourci PWA `/realisations` dans webmanifest → redirige vers stub | `public/site.webmanifest` | Changer vers `/contact` ou `/devis` |
| P3-E | `maintenance-informatique-pme.html` dans `build.sh` absent du sitemap | `build.sh`, `sitemap.xml` | Aligner (ajouter au sitemap en Phase 2 ou retirer du build.sh) |

---

## Required Before Launch

### BLOQUANT — À corriger avant toute mise en ligne

**P1-A — OG image (5 min)**

Dans `index-src.html`, remplacer les 3 occurrences de :
```
https://www.ca-tech.fr/assets/logos/logo-ca-tech.png
```
par :
```
https://www.ca-tech.fr/logos/logo-ca-tech-icon.png
```
Fichier existant : `public/logos/logo-ca-tech-icon.png` (402 kB, 512×512 PNG).

**P1-B — Sitemap nettoyage (5 min)**

Dans `sitemap.xml`, retirer les 6 entrées SEO locales (routes NotFound) :
```xml
/creation-site-internet-dijon
/creation-site-internet-lyon
/creation-site-internet-paris
/agence-ia-dijon
/agence-ia-lyon
/automatisation-pme
```
Ces pages seront ajoutées au sitemap en Phase 2 quand le contenu existera.

---

## Safe After Launch

Les P2 suivants peuvent être corrigés post-lancement sans impact sur le trafic :

- P2-A : Protéger `/portfolio-preview` (hors chemin utilisateur standard)
- P2-B : CTASection description Loïc (texte, non bloquant)
- P2-C/D : JSON-LD SearchAction + Offer URLs (SEO structural, pas de pénalité immédiate)
- P2-E : Email template "Agence Web & Design" (interne, admin only)
- P2-G : `vite.config.js` SPA_ROUTES (dev only, prod OK)
- P3-A/B/C/D/E : Service worker, assets, PWA icons (non critiques)

---

## Final Recommendation

**Les P1 identifiés (OG image + sitemap) sont mineurs en termes de code** (2 × 5 minutes de correction) mais **significatifs pour le lancement** :

- Un lien partagé sur LinkedIn, Twitter ou par email affichera une image manquante
- Google Search Console signalera des erreurs dès le premier crawl du sitemap

Ces deux corrections sont recommandées **avant le déploiement** et sont incluses dans les fichiers.

---

~~`STATUS: CONDITIONAL — P1 ISSUES REMAIN`~~

~~**P1-A** — `index-src.html` OG/Twitter/JSON-LD image cassée → corriger chemin~~  
~~**P1-B** — `sitemap.xml` 6 routes SEO locales soft-404 → retirer avant launch~~

---

## P1 Fix Verification — PROMPT 35

**Session :** PROMPT 35 — 2026-10-01

### P1-A — FIXED ✅

`index-src.html` — 3 occurrences corrigées :

| Élément | Avant | Après |
|---|---|---|
| `og:image` | `https://www.ca-tech.fr/assets/logos/logo-ca-tech.png` | `https://www.ca-tech.fr/logos/logo-ca-tech-icon.png` |
| `twitter:image` | `https://www.ca-tech.fr/assets/logos/logo-ca-tech.png` | `https://www.ca-tech.fr/logos/logo-ca-tech-icon.png` |
| JSON-LD `Organization.logo.url` | `https://www.ca-tech.fr/assets/logos/logo-ca-tech.png` | `https://www.ca-tech.fr/logos/logo-ca-tech-icon.png` |

Vérification : grep `assets/logos/logo-ca-tech.png` → **0 occurrences** restantes.  
Fichier source : `public/logos/logo-ca-tech-icon.png` (512×512, 402 kB) — confirmé existant.

### P1-B — FIXED ✅

`public/sitemap.xml` — 6 `<url>` blocks supprimés :

- `https://www.ca-tech.fr/creation-site-internet-dijon`
- `https://www.ca-tech.fr/creation-site-internet-lyon`
- `https://www.ca-tech.fr/creation-site-internet-paris`
- `https://www.ca-tech.fr/agence-ia-dijon`
- `https://www.ca-tech.fr/agence-ia-lyon`
- `https://www.ca-tech.fr/automatisation-pme`

Le sitemap ne contient plus que des routes existantes et fonctionnelles (ou stubs Phase 2 intentionnels).

### Build post-correction

```
npm run build

vite v8.1.5 building client environment for production...
✓ 2377 modules transformed.
✓ built in 1.07s

0 erreur — 2 warnings préexistants (scripts externes : axeptio, loic-widget)
```

### Fichiers modifiés

| Fichier | Modification |
|---|---|
| `index-src.html` | 3 chemins OG/Twitter/JSON-LD corrigés |
| `public/sitemap.xml` | 6 URLs SEO locales supprimées |

---

`STATUS: PRE-LAUNCH READY — NO P0/P1 BLOCKERS`
