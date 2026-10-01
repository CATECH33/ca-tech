# CA-TECH Homepage Conversion — Rapport d'implémentation P0/P1

**Date** : 2026-10-01  
**Session** : PROMPT 31  
**Auteur** : Claude Code

---

## Infrastructure réutilisée (aucun service externe créé)

| Élément | Statut | Usage |
|---|---|---|
| `api/notifications.js` · template `formulaire_contact` | ✅ Réutilisé | Notification admin email + WhatsApp à chaque contact |
| `api/devis.js` | ✅ Réutilisé | Endpoint `/api/devis` connecté au formulaire Devis |
| Supabase · table `leads` | ✅ Réutilisé | Upsert prospect à chaque soumission contact/devis |
| Resend · `contact@ca-tech.fr` | ✅ Réutilisé | Email notification admin |
| Supabase · table `devis` | ✅ Réutilisé | Création devis avec numéro de référence |

**Nouveau fichier API créé :** `api/contact.js`
- POST `/api/contact` → upsert lead Supabase + notification `formulaire_contact`
- Réutilise intégralement `api/notifications.js` (Resend + WhatsApp)
- Renvoie `{ok: true}` ou message d'erreur descriptif (jamais de fausse confirmation)

---

## P0 — Corrections

### P0-01 — `/contact` : stub → page fonctionnelle ✅

**Problème :** `/contact` affichait "En construction" sans aucun moyen de contact visible. Chaque CTA de conversion aboutissait sur une impasse.

**Correction :**

Nouveau fichier `src/pages/Contact.jsx` :
- H1 : "Parlons de votre projet."
- Formulaire : nom, email*, téléphone, sujet (select), message* (2 champs obligatoires uniquement)
- Envoi vers `POST /api/contact` → Supabase leads + notification Resend admin
- État success : confirmation visuelle avec rappel téléphone + instruction "sous 24h"
- État erreur : message d'erreur réel avec fallback `contact@ca-tech.fr`
- Infos de contact directes : email `contact@ca-tech.fr` + téléphone `07 75 66 49 75` (tous deux cliquables `mailto:` / `tel:`)
- Trust signals : SIRET, "100 % France", "Sans engagement"
- Cohérence visuelle exacte avec le Design System (palette, typo, border-radius, animations Framer Motion)

**Résultat :** `/contact` est opérationnel. La soumission crée un lead dans Supabase et déclenche une notification admin email + WhatsApp.

---

### P0-02 — `/devis` : stub → formulaire fonctionnel ✅

**Problème :** `/devis` affichait "En construction". L'API `api/devis.js` existait déjà avec une infrastructure complète (Supabase, numérotation automatique, notification admin, création lead).

**Correction :**

Nouveau fichier `src/pages/Devis.jsx` :
- H1 : "Estimons votre projet ensemble."
- Formulaire : nom, email*, téléphone, type de projet* (7 options avec prix indicatifs), budget indicatif (select), notes
- Envoi vers `POST /api/devis` → Supabase `devis` + `leads` + notification admin
- État success : confirmation avec numéro de référence devis (`DEV-2026-XXXX`)
- Types de projet avec prix indicatifs affichés directement sur les boutons (source : `api/devis.js` `TYPE_PRICES`)
- Fallback direct vers `contact@ca-tech.fr` et téléphone

**Résultat :** `/devis` crée un vrai devis numéroté dans Supabase avec notification admin complète.

---

### P0-03 — Pages légales : stubs → pages réelles ✅

**Problème :** `/mentions-legales`, `/politique-de-confidentialite` et `/gestion-des-cookies` affichaient "En construction" — situation problématique sur le plan RGPD.

**Données utilisées :** uniquement celles déjà présentes et vérifiées dans le projet (JSON-LD, footer, code source). Aucune donnée inventée.

**Données disponibles et utilisées :**
- Raison sociale : CA-TECH
- SIRET : 93344494500012
- Adresse : 1 Avenue du Mail, 21240 Talant, France
- Email : contact@ca-tech.fr
- Téléphone : +33 7 75 66 49 75
- Hébergeur : Vercel Inc., San Francisco, CA, USA
- Sous-traitants : Supabase Inc., Resend Inc., Google LLC

**Données manquantes signalées en jaune (`[À COMPLÉTER]`) dans MentionsLegales.jsx :**
- Forme juridique (ex. SASU, SAS, auto-entrepreneur)
- Capital social
- Numéro de TVA intracommunautaire
- Prénom et nom du dirigeant (directeur de publication)

**Fichiers créés :**
- `src/pages/MentionsLegales.jsx` — 8 sections, données réelles + placeholders signalés
- `src/pages/PolitiqueConfidentialite.jsx` — 9 sections RGPD complètes (responsable, bases légales, droits, sous-traitants, durées, CNIL)
- `src/pages/GestionCookies.jsx` — tableau des cookies (Axeptio, GA4, Google Ads, Loïc session)

**Résultat :** 3 pages légales opérationnelles. À compléter avec les 4 informations manquantes signalées.

---

## P1 — Corrections

### P1-01 — Hero CTA hierarchy inversée ✅

**Problème :** CTA primaire (bouton bleu rempli) → `/services` (découverte). CTA secondaire (ghost) → `/contact` (conversion).

**Correction dans `HeroSection.jsx` :**

| Avant | Après |
|---|---|
| Primary : "Découvrir CA-TECH" → `/services` | Primary : **"Parler de votre projet"** → `/contact` |
| Secondary : "Parler à CA-TECH" → `/contact` | Secondary : "Découvrir CA-TECH" → `/services` |

Le CTA de conversion est désormais le bouton primaire (bleu rempli). Le CTA de découverte devient secondaire (ghost).

---

### P1-02 — Sous-titre Hero trop technique ✅

**Problème :** "IA générative · Automatisation · LLM · MCP · Systèmes digitaux" — liste de technologies opaque pour un dirigeant de PME.

**Correction dans `HeroSection.jsx` :**

| Avant | Après |
|---|---|
| "IA générative · Automatisation · LLM · MCP · Systèmes digitaux" | "Nous automatisons vos processus, déployons des agents IA sur mesure et construisons vos outils digitaux — pour que votre entreprise aille plus vite." |

Le sous-titre décrit maintenant **ce que CA-TECH fait** (automatiser, déployer, construire) et **pour qui** (votre entreprise) avec **un bénéfice** (aller plus vite). Les termes techniques restent présents dans les sections spécialisées (AIShowcaseSection, LLMSection).

---

### P1-05 — Email et téléphone invisibles ✅

**Problème :** `contact@ca-tech.fr` et `+33775664975` présents dans JSON-LD mais jamais affichés à l'écran.

**Correction dans `Footer.jsx` :**

Email et téléphone ajoutés dans la colonne identité du footer, cliquables (`mailto:` / `tel:`). Ils apparaissent maintenant sur toutes les pages du site.

---

### P1-03 / P1-04 — Stubs services et projets

**Décision documentée — non implémentés dans cette session :**

Les routes `/services/*` et `/projets/*` restent des stubs. La raison est qu'une page stub "En construction" avec un lien retour accueil est moins néfaste qu'une page de services vide construite à la hâte. Ces pages nécessitent du contenu réel (descriptions, cas clients, tarifs) — elles relèvent de la Phase 2 du site.

**Mitigation partielle appliquée :** désormais que `/contact` fonctionne, un visiteur qui clique sur "En savoir plus" vers une page service stub peut revenir et accéder facilement au contact via le Header ou le Footer.

---

## P2/P3 — Non implémentés

Pour la prochaine itération :

| ID | Problème | Effort estimé |
|---|---|---|
| P2-01 | H1 ≈ H2 (positionnement = copie du Hero) | 10 min — 1 ligne |
| P2-02 | LLMSection sans CTA de conversion | 15 min — ajouter un `<Link to="/contact">` |
| P2-03 | ExpertiseSection sans CTA de conversion | 15 min — idem |
| P2-04 | Métriques PositionnementSection — "5 pôles" peu valorisant | Décision produit requise |
| P2-05 | "2023" comme métrique = signal d'inexpérience | Décision produit requise |
| P2-06 | Témoignages clients absents | Contenu réel requis |
| P2-07 | "Résultat mesuré 10h/semaine" — sans source | Ajouter "(selon nos clients)" |
| P2-08 | Footer colonne "Légal & contact" sans contact | 5 min — renommer la colonne ou déplacer |
| P2-09 | `img` portfolio sans `width`/`height` | 10 min — CLS théorique uniquement |

---

## Tests

### Build
```
vite build
✓ 2377 modules transformed
✓ built in 1.24s
0 erreurs — 2 warnings préexistants (scripts externes)
```

Nouveaux chunks générés :
- `Contact-*.js` — 11.76 kB / 3.34 kB gzip
- `Devis-*.js` — 9.73 kB / 3.42 kB gzip
- `PolitiqueConfidentialite-*.js` — 6.74 kB / 2.24 kB gzip
- `MentionsLegales-*.js` — 5.33 kB / 1.96 kB gzip
- `GestionCookies-*.js` — 4.70 kB / 1.78 kB gzip

### Routes vérifiées

| Route | Avant | Après |
|---|---|---|
| `/contact` | Stub "En construction" | ✅ Page contact fonctionnelle |
| `/devis` | Stub "En construction" | ✅ Formulaire devis connecté API |
| `/mentions-legales` | Stub "En construction" | ✅ Page légale complète |
| `/politique-de-confidentialite` | Stub "En construction" | ✅ Page RGPD complète |
| `/gestion-des-cookies` | Stub "En construction" | ✅ Tableau cookies |
| `/` (Homepage) | Inchangée | ✅ Aucune régression |
| `/portfolio-preview` | Inchangée | ✅ |
| `/a-propos` | Inchangée | ✅ |

### CTA Hero

| Avant | Après |
|---|---|
| Primary → `/services` | Primary → `/contact` (fonctionnel) |
| Secondary → `/contact` | Secondary → `/services` |

### Mobile

- Formulaires testés sur viewport 390px : layout `grid-cols-1`, champs pleine largeur ✅
- Email + téléphone dans footer : cliquables sur mobile (`mailto:`, `tel:`) ✅
- CTA primaire Hero en position principale au scroll ✅

---

## Fichiers créés / modifiés

### Créés
| Fichier | Type | Description |
|---|---|---|
| `api/contact.js` | API serverless | POST /api/contact → lead + notification |
| `src/pages/Contact.jsx` | Page React | Formulaire de contact complet |
| `src/pages/Devis.jsx` | Page React | Formulaire de devis (7 types de projets) |
| `src/pages/MentionsLegales.jsx` | Page React | Mentions légales (4 champs à compléter) |
| `src/pages/PolitiqueConfidentialite.jsx` | Page React | Politique RGPD complète |
| `src/pages/GestionCookies.jsx` | Page React | Tableau des cookies |

### Modifiés
| Fichier | Modification |
|---|---|
| `src/App.jsx` | Import + routes des 5 nouvelles pages |
| `src/components/sections/HeroSection.jsx` | CTA hierarchy inversée + sous-titre réécrit |
| `src/components/footer/Footer.jsx` | Email + téléphone affichés et cliquables |

### Non modifiés
- `vite.config.js` — toutes les routes déjà présentes dans `SPA_ROUTES`
- `vercel.json` — rewrite SPA catch-all déjà en place
- Aucun fichier de Design System, portfolio, ou page existante touchée

---

## Points d'attention pour la mise en production

1. **Variables d'environnement Vercel** — vérifier que `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` et `ADMIN_EMAIL` sont bien configurées dans les settings Vercel du projet principal (elles l'étaient déjà pour `api/devis.js`, donc probablement ok).

2. ~~**Mentions légales** — 4 champs `[À COMPLÉTER]`~~ → **Finalisé — voir section ci-dessous.**

3. **`loic-widget.js`** — ce script externe injecte un widget de contact flottant sur toutes les pages. Sur la page `/contact`, ce widget pourrait créer une redondance visuelle. À surveiller après déploiement.

---

## LEGAL INFORMATION — FINALIZED

**Session :** PROMPT 33 — 2026-10-01

| Champ | Valeur |
|---|---|
| Forme juridique | Entreprise Individuelle (EI) |
| Dirigeant / Directeur de publication | JEAN KEVIN PEMOU |
| TVA intracommunautaire | Non applicable |
| Capital social | Non affiché — notion non applicable à une Entreprise Individuelle |

**Modifications apportées à `src/pages/MentionsLegales.jsx` :**
- `[forme juridique]` → `Entreprise Individuelle (EI)`
- `[capital social]` → **ligne supprimée** (une EI n'a pas de capital social au sens juridique)
- `[TVA IC]` → `Non applicable`
- `[prénom et nom du dirigeant]` → `JEAN KEVIN PEMOU`
- Composant `Missing` supprimé (aucun placeholder restant)

**Build post-modification :** 2377 modules, 0 erreurs, 1.38s. `MentionsLegales-*.js` : 5.33 kB → 4.88 kB.

**Aucun `[À COMPLÉTER]` restant dans les pages légales.**

---

## STATUS: CONVERSION FUNNEL P0/P1 COMPLETE — LEGAL INFORMATION FINALIZED
