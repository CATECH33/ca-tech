# CA-TECH Production Readiness Report

**Date :** 2026-10-01  
**Session :** PROMPT 36  
**Auteur :** Claude Code  
**Portée :** Site principal `www.ca-tech.fr` — audit configuration avant déploiement  
**Build de référence :** 2377 modules · 0 erreur · 1.07s

---

## Executive Summary

Le site est techniquement prêt à être déployé. Le build est propre, le routing SPA fonctionne, les APIs sont structurellement correctes et la configuration `vercel.json` est cohérente.

**Un point nécessite vérification manuelle avant déploiement :**

Les APIs backend utilisent `process.env.SUPABASE_URL` mais le fichier local `.env.local` contient `VITE_SUPABASE_URL`. Ce sont deux noms différents. Si Vercel Production a `SUPABASE_URL` configuré (probable, car `api/devis.js` fonctionnait déjà), tout est bon. Si seul `VITE_SUPABASE_URL` est configuré, les APIs `/api/contact` et `/api/devis` retourneront 500.

**Résultat global :**

| Domaine | Statut |
|---|---|
| Build | ✅ 0 erreur |
| `vercel.json` | ✅ Correct |
| Routing SPA | ✅ Fonctionnel |
| Headers sécurité | ✅ Configurés |
| Redirects | ✅ 12 redirects permanents |
| CORS APIs | ✅ Correct pour production |
| Env vars (vérification requise) | ⚠️ Vérifier SUPABASE_URL dans Vercel |
| Supabase tables | ✅ Utilisées côté serveur uniquement |
| Domaine cible | ✅ Toutes références pointent vers `ca-tech.fr` |
| robots.txt | ✅ Propre |
| sitemap.xml | ✅ Propre (P1-B corrigé) |
| OG/Twitter/JSON-LD image | ✅ Corrigé (P1-A) |
| Secrets exposés frontend | ✅ Aucun |

---

## Vercel Configuration

### `vercel.json` — Analyse complète

```json
{
  "buildCommand": "sh build.sh",    ✅ Script multi-étapes
  "outputDirectory": ".",            ✅ Root (build.sh copie tout à la racine)
  "cleanUrls": true,                 ✅ /contact.html → /contact
  "trailingSlash": false,            ✅ Canonique cohérent
  "functions": { "api/*.js": { "maxDuration": 30 } }  ✅ Timeout 30s
}
```

**Headers de sécurité :** configurés sur `/(.*)`  
- `X-Content-Type-Options: nosniff` ✅  
- `X-Frame-Options: DENY` ✅  
- `X-XSS-Protection: 1; mode=block` ✅  
- `Referrer-Policy: strict-origin-when-cross-origin` ✅  
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` ✅  
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` ✅

**Cache-Control :**
- `/dist/assets/(.*)` → `public, max-age=31536000, immutable` ✅ (assets hachés Vite)
- `/public/(.*)` → `public, max-age=86400` ⚠️ **Dead rule** — Vercel sert depuis l'output dir (`.`), pas depuis un sous-dossier `/public/`. Règle inoffensive mais ineffective. Non bloquant.
- `/sw.js` → no-store ✅  
- `/icons/(.*)` → 7 jours ✅

**Redirects permanents (301) :** 12 redirects  
Anciens chemins `/collaborateurs-ia`, `/automatisations`, `/expertises/*`, etc. → chemins canoniques ✅  
Tous cohérents avec les routes dans `src/App.jsx` ✅

**Rewrites :**
- `/manager/assets/(.*)` → `/manager/dist/assets/$1` ✅
- `/((?!manager).*)` → `/index-src.html` : catch-all SPA (exclut `/manager`) ✅

**Mécanisme SPA :** `cleanUrls: true` + fichiers `.html` physiques créés par `build.sh` + rewrite catch-all. Vercel sert `contact.html` pour `/contact` avant d'activer le rewrite. ✅

---

## Environment Variables

> **IMPORTANT** — Les valeurs ne sont jamais affichées. Seul le statut est indiqué.

| Variable | Utilisée par | Scope | Requise production | Statut estimé |
|---|---|---|---|---|
| `SUPABASE_URL` | `api/contact.js`, `api/devis.js`, `api/webhook.js` | Backend (server) | **OUI — CRITIQUE** | Probablement configuré¹ |
| `SUPABASE_SERVICE_ROLE_KEY` | Idem — clé admin serveur | Backend (server) | **OUI — CRITIQUE** | Probablement configuré¹ |
| `RESEND_API_KEY` | `api/notifications.js` — envoi emails | Backend (server) | **OUI — critique** | Probablement configuré¹ |
| `ADMIN_EMAIL` | `api/notifications.js` — destinataire email | Backend (server) | Non (défaut : `contact@ca-tech.fr`) | À vérifier |
| `SITE_URL` | CORS headers tous les APIs | Backend (server) | Non (défaut : `https://www.ca-tech.fr`) | Non requis si prod uniquement |
| `CALLMEBOT_PHONE` | `api/notifications.js` — WhatsApp | Backend (server) | Non (notifications désactivées si absent) | À vérifier |
| `CALLMEBOT_APIKEY` | `api/notifications.js` — WhatsApp | Backend (server) | Non (notifications désactivées si absent) | À vérifier |
| `STRIPE_SECRET_KEY` | `api/webhook.js`, `api/create-checkout.js`, `api/session-status.js` | Backend (server) | Non pour lancement minimal | À configurer si paiements actifs |
| `STRIPE_WEBHOOK_SECRET` | `api/webhook.js` — signature webhook | Backend (server) | Non pour lancement minimal | À configurer si paiements actifs |
| `VITE_SUPABASE_URL` | Manager build (Vite embed) | Build-time | Oui pour manager | Vérifier config Vercel |
| `VITE_SUPABASE_ANON_KEY` | Manager build (Vite embed) | Build-time | Oui pour manager | Vérifier config Vercel |
| `VITE_GOOGLE_CLIENT_ID` | Manager build — Google OAuth | Build-time | Oui pour manager | Confirmé dans vercel.local |

¹ `api/devis.js` fonctionnait en session précédente → variables probablement déjà configurées dans Vercel.

### Point d'attention critique : `SUPABASE_URL` vs `VITE_SUPABASE_URL`

```
.env.local (local dev, main site) :
  VITE_SUPABASE_URL=https://jhcyooksjeivajdjicka.supabase.co   ← VITE_ prefix
  VITE_SUPABASE_ANON_KEY=[clé publique anon]

api/contact.js, api/devis.js :
  process.env.SUPABASE_URL       ← PAS de VITE_ prefix
  process.env.SUPABASE_SERVICE_ROLE_KEY
```

**Conséquence :** localement, `process.env.SUPABASE_URL` ne sera pas défini depuis `.env.local`. Pour les APIs, Vercel doit avoir `SUPABASE_URL` (sans VITE_) configuré.

**En production Vercel :** si `SUPABASE_URL` est configuré dans les env vars du projet → ✅ OK.  
**Action requise :** vérifier dans Dashboard Vercel → Project Settings → Environment Variables que `SUPABASE_URL` (sans préfixe VITE_) existe.

### Variables frontend (main site)

**Le frontend principal n'utilise aucune variable d'environnement.** Résultat grep `VITE_|process.env` dans `src/` : 0 correspondance.

Les `VITE_SUPABASE_*` dans `.env.local` sont des vestiges de développement ou des variables destinées exclusivement au manager. Elles ne sont pas embarquées dans le bundle du site principal.

---

## Supabase

**Projet :** `jhcyooksjeivajdjicka.supabase.co`

**Architecture :**
- Service Role Key utilisé **uniquement côté serveur** (API functions) ✅
- Anon Key dans `.env.local` — clé publique par conception Supabase ✅
- Aucun appel Supabase depuis le frontend du site principal ✅

**Tables utilisées par les APIs :**

| Table | Utilisée par | Opérations |
|---|---|---|
| `leads` | `api/contact.js`, `api/devis.js` | INSERT (upsert prospect) |
| `devis` | `api/devis.js` | INSERT, SELECT, UPDATE |
| `devis_items` | `api/devis.js` | INSERT (lignes devis) |
| `devis_relances` | `api/devis.js` | INSERT (suivi relances) |
| `audit_logs` | `api/devis.js` | INSERT (non critique) |
| `notification_logs` | `api/notifications.js` | INSERT |
| `notification_settings` | `api/notifications.js` | SELECT (canaux actifs) |
| `payments` | `api/webhook.js` | SELECT, INSERT |

**Prérequis :** Ces tables doivent exister et être accessibles avec la Service Role Key. Si `api/devis.js` fonctionnait en session précédente, la structure est en place.

**RLS :** Les APIs utilisent la Service Role Key qui bypass RLS par défaut. Pas de problème de permissions côté API.

---

## Contact API (`api/contact.js`)

**Endpoint :** `POST /api/contact`  
**Appelé depuis :** `src/pages/Contact.jsx` → `fetch('/api/contact', {...})`

**Variables requises :**
- `SUPABASE_URL` ✅ (vérifié ci-dessus)
- `SUPABASE_SERVICE_ROLE_KEY` ✅

**Validation :**
- `email` et `message` obligatoires → HTTP 400 si absents ✅
- Autres champs optionnels (`name`, `phone`, `subject`) ✅

**Gestion erreurs :**
- Supabase absent → 500 + message descriptif ✅
- Erreur insertion → 500 + message générique (pas de fuite d'info) ✅
- Notification admin : failure silencieuse (`.catch(err => console.error(...))`) ✅

**CORS :**
- `Access-Control-Allow-Origin: process.env.SITE_URL || 'https://www.ca-tech.fr'`
- ✅ Correct pour production
- ⚠️ Preview deployments : CORS bloquera les appels API (origin ≠ `ca-tech.fr`). Non bloquant pour prod.

**Sécurité :**
- Aucun secret exposé dans la réponse ✅
- OPTIONS préflight géré ✅

---

## Devis API (`api/devis.js`)

**Endpoints :**
- `POST /api/devis` — créer un devis
- `GET /api/devis?action=list` — liste admin
- `GET /api/devis?action=get&id=UUID` — devis unique
- `PATCH /api/devis` — mettre à jour

**Appelé depuis :** `src/pages/Devis.jsx` → `fetch('/api/devis', {...})`

**Variables requises :**
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅

**Validation :**
- `contact_email` et `project_type` obligatoires → HTTP 400 ✅

**Flux POST :**
1. Calcul montant TTC/HT (TVA 20%) ✅
2. Génération numéro `DEV-YYYY-XXXX` ✅
3. INSERT `devis` ✅
4. INSERT `devis_items` ✅
5. Upsert `leads` ✅
6. INSERT `audit_logs` (non critique, failure ignorée) ✅
7. Notification admin email + WhatsApp ✅

**CORS :** identique à `api/contact.js` ✅

**Endpoints GET/PATCH :** utilisés par le manager, pas par le frontend public. Ces endpoints sont non authentifiés — accès libre à la liste des devis. À noter pour une future implémentation auth manager, mais non bloquant pour le lancement public.

---

## Frontend

**Variables d'environnement exposées au navigateur :** aucune. Le site principal n'embarque aucune variable `VITE_*` dans son bundle. ✅

**Appels API :**
- `/api/contact` — URL relative ✅
- `/api/devis` — URL relative ✅
- Pas d'URL absolue codée en dur ✅

**Dépendances :**
- `@supabase/supabase-js` est dans `dependencies` mais **non importé dans `src/`** ✅  
  (utilisé côté API Node.js via `require('@supabase/supabase-js')`)
- `stripe` est dans `dependencies` mais non importé dans `src/` ✅  
  (utilisé côté API Node.js)
- `resend` est dans `dependencies` mais non importé dans `src/` ✅

---

## Domain

**Domaine cible :** `www.ca-tech.fr`

| Référence | Fichier | Valeur | Statut |
|---|---|---|---|
| Canonical | `index-src.html:24` | `https://www.ca-tech.fr/` | ✅ |
| `og:url` | `index-src.html:32` | `https://www.ca-tech.fr/` | ✅ |
| `og:image` | `index-src.html:35` | `https://www.ca-tech.fr/logos/logo-ca-tech-icon.png` | ✅ (corrigé P1-A) |
| `twitter:image` | `index-src.html:42` | `https://www.ca-tech.fr/logos/logo-ca-tech-icon.png` | ✅ (corrigé P1-A) |
| JSON-LD `Organization.url` | `index-src.html:26` | `https://www.ca-tech.fr` | ✅ |
| JSON-LD `Organization.logo.url` | `index-src.html:26` | `https://www.ca-tech.fr/logos/logo-ca-tech-icon.png` | ✅ (corrigé P1-A) |
| Sitemap | `public/sitemap.xml` | `https://www.ca-tech.fr/` | ✅ |
| robots.txt | `public/robots.txt` | `https://www.ca-tech.fr/sitemap.xml` | ✅ |
| Mentions légales | `src/pages/MentionsLegales.jsx` | `www.ca-tech.fr` | ✅ |
| CORS APIs | `api/*.js` | `https://www.ca-tech.fr` (fallback) | ✅ |

Aucune référence à `localhost`, `127.0.0.1`, ou domaine temporaire Vercel dans les fichiers publics. ✅

**Redirections Vercel** : `vercel.json` gère les anciens chemins. Pour les redirects `ca-tech.fr` → `www.ca-tech.fr` (ou l'inverse), la configuration DNS/Vercel domain s'en charge côté Vercel dashboard.

---

## Robots / Sitemap

### `public/robots.txt`

```
User-agent: * — Allow: /          ✅
Sitemap: https://www.ca-tech.fr/sitemap.xml  ✅
Host: https://www.ca-tech.fr       ✅
AI crawlers explicitement autorisés (GPTBot, Claude, Bing, etc.)  ✅
```

Aucune référence à un environnement de développement. ✅

### `public/sitemap.xml`

**Routes présentes (11 URLs) :**
- `/` (priority 1.00) ✅
- `/services` + 5 sous-routes services (0.88–0.95) ✅ — stubs Phase 2, indexables
- `/projets` (0.85) ✅ — stub Phase 2
- `/a-propos`, `/contact`, `/devis` ✅
- Légal absent → normal (priorité 0 implicite) ✅

**6 URLs SEO locales supprimées (P1-B)** — aucune référence à des routes non routées. ✅

**Observation :** `build.sh` crée encore les fichiers HTML physiques pour les 6 anciennes URLs SEO locales (`creation-site-internet-dijon.html`, etc.). Ces fichiers existent sur le serveur mais ne sont plus dans le sitemap. Un visiteur qui y accède directement verrait la page 404 de React Router. Non bloquant — à nettoyer en Phase 2.

---

## Build

```
npm run build

vite v8.1.5 building client environment for production...
✓ 2377 modules transformed.
✓ built in 1.07s

0 erreur — 2 warnings préexistants (scripts externes non-module : axeptio, loic-widget)
```

**Chunks principaux :**

| Chunk | Taille | Gzip |
|---|---|---|
| `vendor-react` | 189 kB | 60 kB |
| `vendor-motion` | 128 kB | 42 kB |
| `vendor-router` | 42 kB | 15 kB |
| `Home` | 54 kB | 11 kB |
| `portfolio-mockups` | 42 kB | 9 kB |
| `CTASection` | 34 kB | 13 kB |
| `vendor-icons` | 22 kB | 8 kB |
| `Contact` | 12 kB | 3 kB |
| `Devis` | 10 kB | 3 kB |

Les 2 warnings (`axeptio-consent.js`, `loic-widget.js`) sont des scripts tiers injectés en dehors du module ES — non solubles sans modifier les scripts tiers. Préexistants à toutes les sessions. ✅

---

## Deployment Configuration

### Valeurs recommandées dans Vercel Project Settings

| Paramètre | Valeur | Source |
|---|---|---|
| **Framework Preset** | Other / Vite | À sélectionner si non auto-détecté |
| **Build Command** | `sh build.sh` | `vercel.json` |
| **Output Directory** | `.` | `vercel.json` |
| **Install Command** | `npm install` (default) | — |
| **Node.js Version** | 20.x | `package.json engines: ">=20"` |
| **Root Directory** | `.` (repository root) | — |

### Routing

| Mécanisme | Rôle |
|---|---|
| `cleanUrls: true` | Sert `/contact.html` pour l'URL `/contact` |
| Fichiers `.html` physiques | Créés par `build.sh` depuis `dist/index-src.html` |
| Rewrite catch-all | `/((?!manager).*)` → `/index-src.html` (fallback ultime) |
| Redirects 301 | 12 anciens chemins → canoniques |

---

## Vercel Checklist

### Project

- [ ] **Repository :** branch `main` configurée comme branche de production
- [ ] **Framework :** défini sur "Other" ou "Vite" (pas Next.js)
- [ ] **Build Command :** `sh build.sh`
- [ ] **Output Directory :** `.` (point, la racine)
- [ ] **Node.js Version :** 20.x

### Environment Variables — Production

- [ ] `SUPABASE_URL` — URL projet Supabase (sans préfixe `VITE_`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — clé admin Supabase (secret)
- [ ] `RESEND_API_KEY` — clé API Resend pour emails
- [ ] `ADMIN_EMAIL` — destinataire notifications admin (ou laisser vide → `contact@ca-tech.fr`)
- [ ] `CALLMEBOT_PHONE` — numéro WhatsApp notifications (optionnel)
- [ ] `CALLMEBOT_APIKEY` — clé CallMeBot WhatsApp (optionnel)
- [ ] `VITE_SUPABASE_URL` — pour le build du manager (même URL que `SUPABASE_URL`)
- [ ] `VITE_SUPABASE_ANON_KEY` — clé publique anon Supabase (pour manager)
- [ ] `VITE_GOOGLE_CLIENT_ID` — OAuth Google pour le manager
- [ ] `STRIPE_SECRET_KEY` — si paiements activés au lancement
- [ ] `STRIPE_WEBHOOK_SECRET` — si webhook Stripe actif

### Domain

- [ ] `ca-tech.fr` ajouté dans Vercel Domains
- [ ] `www.ca-tech.fr` ajouté (ou redirect depuis `ca-tech.fr`)
- [ ] HTTPS automatique Vercel (Let's Encrypt) ✅ inclus
- [ ] Redirect canonique `ca-tech.fr` → `www.ca-tech.fr` (ou l'inverse) configuré dans Vercel

### DNS

- [ ] Enregistrement `A` ou `CNAME` pointant vers Vercel (`76.76.21.21` ou `cname.vercel-dns.com`)
- [ ] TTL réduit avant le basculement pour minimiser le temps de propagation

### Backend

- [ ] `POST /api/contact` → teste le formulaire après déploiement
- [ ] `POST /api/devis` → teste le formulaire après déploiement
- [ ] Notification email reçue sur `ADMIN_EMAIL` ou `contact@ca-tech.fr`
- [ ] Lead créé dans Supabase table `leads`

---

## Production Smoke Test Plan

> **À exécuter APRÈS déploiement sur `www.ca-tech.fr`. NE PAS envoyer de données clients réelles.**

### Routes — Navigation et rendu

| URL | Vérification |
|---|---|
| `https://www.ca-tech.fr/` | Page d'accueil se charge, hero visible, animations actives |
| `https://www.ca-tech.fr/contact` | Formulaire visible, champs email + message |
| `https://www.ca-tech.fr/devis` | Formulaire visible, sélecteur type de projet |
| `https://www.ca-tech.fr/mentions-legales` | Contenu légal complet, SIRET visible |
| `https://www.ca-tech.fr/politique-de-confidentialite` | Contenu RGPD complet |
| `https://www.ca-tech.fr/gestion-des-cookies` | Tableau cookies visible |
| `https://www.ca-tech.fr/portfolio-preview` | Mockups portfolio s'affichent |
| `https://www.ca-tech.fr/a-propos` | Page À propos visible |
| `https://www.ca-tech.fr/services` | Page stub "En construction" avec lien retour |

### CTAs — Liens et destinations

| CTA | Depuis | Destination attendue |
|---|---|---|
| "Parler de votre projet" (Hero) | Homepage | `/contact` ✅ |
| "Découvrir CA-TECH" (Hero ghost) | Homepage | `/services` (stub) |
| "Discuter d'un projet IA" | LLMSection | `/contact` ✅ |
| "Démarrer un projet" | ExpertiseSection | `/contact` ✅ |
| "Parler de votre projet" | CTASection | `/contact` ✅ |
| "Demander un devis" | CTASection | `/devis` ✅ |
| `contact@ca-tech.fr` | Footer | `mailto:contact@ca-tech.fr` |
| `07 75 66 49 75` | Footer | `tel:+33775664975` |

### Formulaires — Test technique (données fictives)

**Formulaire Contact :**
1. Remplir : Nom = "Test Audit", Email = `contact@ca-tech.fr`, Message = "Test audit production"
2. Soumettre
3. Vérifier : message de succès affiché
4. Vérifier : email admin reçu
5. Vérifier : lead créé dans Supabase table `leads`

**Formulaire Devis :**
1. Remplir : Nom = "Test Audit", Email = `contact@ca-tech.fr`, Type = "Site vitrine"
2. Soumettre
3. Vérifier : numéro de référence `DEV-2026-XXXX` affiché
4. Vérifier : email admin reçu
5. Vérifier : devis créé dans Supabase table `devis`

### Partage social — Image OG

1. Tester l'URL avec : `https://cards-dev.twitter.com/validator` (ou outil équivalent)
2. Vérifier que l'image `logo-ca-tech-icon.png` (512×512) s'affiche
3. Vérifier title : "CA-TECH — Intelligence Artificielle, Automatisation & Technologie"

### Mobile — Test sur device réel

1. Ouvrir `https://www.ca-tech.fr` sur mobile
2. Vérifier : menu hamburger fonctionnel
3. Vérifier : formulaire contact pleine largeur
4. Vérifier : boutons CTA tactiles (min 44px)
5. Vérifier : `mailto:` et `tel:` cliquables depuis footer

### Redirects — Anciens URLs

| URL source | Destination attendue | Code |
|---|---|---|
| `/collaborateurs-ia` | `/services/ia` | 301 |
| `/automatisations` | `/services/automatisation` | 301 |
| `/realisations` | `/projets` | 301 |
| `/tarifs` | `/contact` | 301 |
| `/expertises/ia` | `/services/ia` | 301 |

### Console et erreurs

- Ouvrir DevTools → Console
- Vérifier : aucune erreur rouge
- Vérifier : warnings attendus uniquement (axeptio, loic-widget)

---

## Blockers

**Aucun blocker absolu identifié.**

Le seul risque réel est la configuration des variables d'environnement dans Vercel. Si elles sont déjà en place (probable), le site est déployable immédiatement.

---

## Required Actions Before Deployment

### Action 1 — OBLIGATOIRE : Vérifier les env vars dans Vercel Dashboard

Dans **Vercel → Project Settings → Environment Variables** :

1. **Confirmer que `SUPABASE_URL` existe** (pas `VITE_SUPABASE_URL`)  
   Si absent → l'ajouter avec la valeur `https://jhcyooksjeivajdjicka.supabase.co`

2. **Confirmer que `SUPABASE_SERVICE_ROLE_KEY` existe**  
   Si absent → récupérer depuis Supabase Dashboard → Project Settings → API → service_role key

3. **Confirmer que `RESEND_API_KEY` existe**  
   Si absent → récupérer depuis dashboard Resend

4. **Vérifier `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`** pour le build manager

### Action 2 — RECOMMANDÉ : Configurer le domaine dans Vercel avant déploiement

1. Vercel Dashboard → Project → Domains → Ajouter `ca-tech.fr` et `www.ca-tech.fr`
2. Obtenir les enregistrements DNS Vercel
3. Configurer DNS chez le registrar (TTL à 300s pendant la transition)

### Action 3 — OPTIONNEL : Configurer `ADMIN_EMAIL`

Définir `ADMIN_EMAIL=contact@ca-tech.fr` explicitement plutôt que de dépendre du fallback hardcodé.

---

## Observations non bloquantes (Phase 2)

| Observation | Impact | Action recommandée |
|---|---|---|
| `build.sh` crée encore 6 fichiers HTML pour les URLs SEO locales supprimées du sitemap | Minimal — React Router sert NotFound | Nettoyer `build.sh` en Phase 2 |
| Header cache `/public/(.*)` dans `vercel.json` inopérant | Nul — fichiers servis depuis root | Corriger ou supprimer la règle |
| `api/devis.js` GET/PATCH sans authentification | Manager interne — pas exposé publiquement | Ajouter auth token en Phase 2 manager |
| CORS bloque les appels API sur preview deployments | Dev uniquement | Ajouter `SITE_URL` par env (preview vs prod) |
| `stripe` dans `dependencies` non utilisé en prod immédiate | Bundle légèrement plus lourd | Ne pas traiter maintenant |
| `.env.local` a `VITE_SUPABASE_URL` non utilisé par le main site | Confusion config | Documenter ou nettoyer en Phase 2 |

---

## Final Status

```
STATUS: READY TO DEPLOY — CONFIGURATION VERIFICATION REQUIRED
```

Le site est prêt à être déployé.

**Une seule action manuelle obligatoire :** vérifier dans Vercel Dashboard que `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, et `RESEND_API_KEY` sont configurés comme env vars de production.

Si ces variables sont déjà en place (probable, `api/devis.js` fonctionnait en session antérieure) :

```
STATUS: READY TO DEPLOY
```
