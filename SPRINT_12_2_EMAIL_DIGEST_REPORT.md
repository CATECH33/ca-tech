# SPRINT 12.2 — RAPPORT
## Digest Emails IA — Agrégateur + Compte rendu quotidien

**Date :** 2026-09-03
**Sprint :** 12.2
**Priorité :** 2 — Email Digest IA (collecte Gmail + classification Claude Haiku + page Manager)

---

## 1. FICHIERS MODIFIÉS / CRÉÉS

| Fichier | Nature | Description |
|---|---|---|
| `supabase/migrations/022_email_digest.sql` | Créé | Table `email_digest_items`, RLS, 5 index |
| `supabase/functions/email-digest-collect/index.ts` | Créé | Edge function : collecte Gmail toutes les 15 min, classification Claude Haiku |
| `supabase/functions/email-digest-send/index.ts` | Créé | Edge function : digest HTML par catégorie, envoi Gmail API, notification in-app |
| `manager/src/hooks/useEmailDigest.ts` | Créé | Hooks React : liste items, stats 30j, mutation "marquer traité" |
| `manager/src/pages/EmailDigest.tsx` | Créé | Page `/emails-digest` — KPIs, répartition, filtres, liste |
| `manager/src/App.tsx` | Modifié | Route `/emails-digest` lazy-loaded |
| `manager/src/components/layout/Sidebar.tsx` | Modifié | Entrée "Digest Emails IA" + icône Mail |
| `manager/src/components/layout/Breadcrumbs.tsx` | Modifié | Label `emails-digest` |

---

## 2. ARCHITECTURE

### 2.1 Edge Function `email-digest-collect`

| Aspect | Valeur |
|---|---|
| Déclencheur | pg_cron toutes les 15 min |
| Auth | `CRON_SECRET` via header `Authorization: Bearer` |
| verify_jwt | `false` (cron, pas de JWT user) |
| Source emails | Gmail API — `in:inbox after:<cutoff>` |
| Dé-duplication | `gmail_message_id UNIQUE` en base |
| Pré-filtre | Regex expéditeurs (noreply, newsletter…) + snippet "unsubscribe" |
| Classification | Claude Haiku — catégorie + résumé 2-3 phrases + action_needed + action_text |
| Catégories | Prospect / Client / Fournisseur / Administratif / Urgent |
| Fallback | Si Claude échoue → catégorie "Administratif", résumé = snippet brut |
| Anti rate-limit | 200 ms entre chaque email traité |
| Token Google | Auto-refresh via `google_integrations` (pattern existant) |

### 2.2 Edge Function `email-digest-send`

| Aspect | Valeur |
|---|---|
| Déclencheur | pg_cron 7h00 et 17h00 UTC |
| Auth | `CRON_SECRET` |
| Scope | Items où `reported = false`, ordonnés par catégorie + `received_at DESC` |
| Template HTML | Charte CA-TECH — #0066FF, #0A2540, responsive |
| Envoi | Gmail API — expéditeur = email du compte Google connecté |
| Post-traitement | `reported = true` sur tous les items envoyés, notification in-app |
| Condition | Si 0 item non reporté → retour `{sent: false, reason: "no unreported items"}` |

### 2.3 Table `email_digest_items`

| Colonne | Type | Note |
|---|---|---|
| `id` | UUID PK | |
| `gmail_message_id` | TEXT UNIQUE | dé-duplication |
| `from_addr` | TEXT | |
| `subject` | TEXT | nullable |
| `category` | TEXT CHECK | Prospect / Client / Fournisseur / Administratif / Urgent |
| `summary` | TEXT | 2-3 phrases Claude |
| `action_needed` | BOOLEAN | default false |
| `action_text` | TEXT | nullable |
| `received_at` | TIMESTAMPTZ | |
| `processed_at` | TIMESTAMPTZ | nullable |
| `gmail_link` | TEXT | `https://mail.google.com/mail/u/0/#inbox/<id>` |
| `is_processed` | BOOLEAN | default false — marqué par le manager |
| `reported` | BOOLEAN | default false — inclus dans digest envoyé |
| `created_at` | TIMESTAMPTZ | default NOW() |

### 2.4 Hooks React

| Hook | Description |
|---|---|
| `useEmailDigestItems(filters)` | Liste paginée avec filtres : catégorie, is_processed, jours (1/7/30) |
| `useEmailDigestStats()` | KPIs agrégés 30j : total, today, actionCount, unprocessed, byCategory |
| `useMarkDigestItemProcessed()` | Mutation Supabase — `is_processed = true` |

### 2.5 Page `/emails-digest`

| Fonctionnalité | État |
|---|---|
| KPIs 4 cards (total 30j / aujourd'hui / actions requises / non traités) | ✅ |
| Répartition par catégorie (chips colorés, count) | ✅ |
| Filtre période : aujourd'hui / 7j / 30j | ✅ |
| Filtre catégorie : chips colorés (Urgent/Prospect/Client/Fournisseur/Administratif) | ✅ |
| Filtre statut : tous / non traités / traités | ✅ |
| Carte email : sujet, expéditeur, date, badge catégorie | ✅ |
| Résumé Claude (2-3 phrases) | ✅ |
| Bloc action requise (amber) | ✅ |
| Lien "Ouvrir dans Gmail" | ✅ |
| Bouton "Marquer traité" avec loader | ✅ |
| État vide avec message explicatif | ✅ |
| Responsive Mobile First | ✅ |
| Actualiser (refetch) | ✅ |

---

## 3. SÉCURITÉ

| Contrôle | État |
|---|---|
| RLS activée sur `email_digest_items` | ✅ |
| Lecture : `is_ca_tech_manager()` uniquement | ✅ |
| Écriture : service_role exclusivement (edge function bypass RLS) | ✅ |
| Update (is_processed) : manager authentifié + RLS UPDATE policy | ✅ |
| CRON_SECRET — jamais exposé côté client | ✅ |
| Tokens Google — stockés côté Supabase, non logués en clair | ✅ |
| Données emails — seulement métadonnées (from, subject, snippet) — pas le corps complet | ✅ |

---

## 4. TESTS

| Test | Résultat |
|---|---|
| TypeScript (`tsc -b`) | ✅ 0 erreur |
| Vite build | ✅ EXIT:0 — 3576 modules |
| Chunk `EmailDigest` | 9.75 kB (gzip: 2.92 kB) |
| Warning vendor-pdf | ⚠️ Connu — inchangé depuis Sprint 11 |

---

## 5. INTÉGRITÉ DES DONNÉES

| Contrôle | Résultat |
|---|---|
| Factures FAC-2026-0001 à 0004 | ✅ Intactes |
| Logique Stripe modifiée | ✅ 0 modification |
| Tables existantes modifiées | ✅ 0 |
| Données supprimées | ✅ 0 |
| Tables créées | 1 (`email_digest_items`) |
| Edge functions créées | 2 (`email-digest-collect`, `email-digest-send`) |

---

## 6. DÉPLOIEMENT — CHECKLIST

### Étape 1 — Migration
```bash
supabase db push
# Applique migrations 021 (invoice_reminders) et 022 (email_digest) si non encore fait
```

### Étape 2 — Edge Functions
```bash
supabase functions deploy email-digest-collect --no-verify-jwt
supabase functions deploy email-digest-send --no-verify-jwt
```

### Étape 3 — Secrets Supabase
Dans Dashboard → Project Settings → Edge Functions → Secrets, vérifier que ces clés existent :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CRON_SECRET` (générer : `openssl rand -hex 32`)

### Étape 4 — Crons (SQL Editor Supabase)
Décommenter et adapter les blocs CRON en fin de `022_email_digest.sql` :
- Collect : `*/15 * * * *`
- Send : `0 7,17 * * *`

---

## 7. SCÉNARIO DE TEST END-TO-END

1. Vérifier que Google est connecté (`/integrations`)
2. Déclencher manuellement `email-digest-collect` via curl avec le `CRON_SECRET`
3. Vérifier les lignes créées dans `email_digest_items` (SQL Editor ou page `/emails-digest`)
4. Déclencher manuellement `email-digest-send`
5. Vérifier réception email digest à l'adresse du compte Gmail connecté
6. Dans `/emails-digest` : filtrer par catégorie, marquer un item comme traité
7. Vérifier que `is_processed = true` en base

---

**SPRINT 12.2 TERMINÉ — BUILD VERT — PRÊT POUR DÉPLOIEMENT**
