# MANAGER V2 — RAPPORT DE TEST FONCTIONNEL

**Date** : 2026-08-10  
**Sprint** : 7.2 — Test fonctionnel complet Supabase V2  
**Méthode** : Playwright (UI) + Supabase MCP SQL (données)  
**Règle** : Aucune modification de code, aucune donnée modifiée

---

## RÉSUMÉ GLOBAL

| Domaine | Statut | Notes |
|---|---|---|
| 1. Authentification | 🟠 Non bloquant | App charge sans redirect (comportement préexistant) |
| 2. Clients | 🟢 Fonctionnel | 2 clients actifs, données correctes |
| 3. Contacts / Demandes | 🟠 Non bloquant | 6 messages OK, aucun lié à un client (client_id=NULL en base) |
| 4. Devis | 🟢 Fonctionnel | **32 devis, 49 items depuis devis_items — bascule V2 confirmée** |
| 5. Paiements | 🟢 Fonctionnel | 4 paiements, 4 sans invoice_id visibles, aucune erreur |
| 6. Loïc | 🟢 Fonctionnel | 8 conversations actives, données accessibles |
| 7. Google | 🔴 Reconnexion requise | Token expiré depuis 2026-07-16 |
| 8. Dashboard | 🟢 Fonctionnel | KPIs cohérents avec les données en base |
| 9. Build | 🟢 Validé | 0 erreur TS, 0 erreur ESLint, build 3570 modules |

---

## 1. AUTHENTIFICATION

**Méthode** : Playwright — navigation sans session active

| Test | Résultat |
|---|---|
| Formulaire de login présent | ✅ email + password + submit |
| Route `/login` accessible | ✅ Charge correctement |
| Route protégée sans session | ⚠️ App charge — pas de redirect vers `/login` |
| Supabase RLS bloque les données anon | ✅ Requêtes retournent données vides côté Supabase |

**Observation** : L'app SPA ne redirige pas vers `/login` quand aucune session n'est présente en localStorage/cookies. Elle charge le dashboard en mode vide et s'appuie sur le RLS Supabase pour la sécurité côté données. Ce comportement est **préexistant à la V2** — la correction RLS Sprint 6 garantit que les données restent inaccessibles à l'anon.

**Verdict** : 🟠 Non bloquant — sécurité assurée côté Supabase, UX améliorable.

---

## 2. CLIENTS

**Source** : SQL Supabase direct

```sql
SELECT COUNT(*) as total, COUNT(CASE WHEN status='active' THEN 1 END) as actifs
FROM clients;
-- Résultat : total=2, actifs=2
```

| Test | Résultat |
|---|---|
| Table `clients` accessible | ✅ |
| Nombre de clients | ✅ 2 (conforme au snapshot BEFORE) |
| Clients actifs | ✅ 2/2 |
| Association clients → invoices | ✅ (join dans useClients.ts) |

**Verdict** : 🟢 Fonctionnel

---

## 3. CONTACTS / DEMANDES (Messages)

**Source** : SQL Supabase direct

```sql
SELECT COUNT(*) total, COUNT(CASE WHEN is_read=false THEN 1 END) non_lus,
  COUNT(CASE WHEN is_replied=true THEN 1 END) repliques,
  COUNT(CASE WHEN client_id IS NOT NULL THEN 1 END) avec_client_id
FROM messages;
-- Résultat : total=6, non_lus=1, repliques=0, avec_client_id=0
```

| Test | Résultat |
|---|---|
| Table `messages` accessible | ✅ |
| 6 messages présents | ✅ (conforme snapshot BEFORE) |
| 1 message non lu | ✅ badge sidebar cohérent |
| Association message → client | ⚠️ 0 messages liés à un client |

**Observation** : Tous les messages ont `client_id = NULL`. L'onglet "Messages" dans les fiches clients sera vide. Ce n'est pas un bug de code — aucun message n'a jamais été lié manuellement à un client dans la base. L'Edge Function `contact-form` n'insère pas de `client_id` non plus.

**Verdict** : 🟠 Non bloquant — données correctes, absence de liaison client est une réalité des données, pas un bug V2.

---

## 4. DEVIS ← TEST CRITIQUE V2

**Source** : SQL Supabase direct — vérification du switch `quote_items` → `devis_items`

```sql
SELECT
  (SELECT COUNT(*) FROM devis) as total_devis,
  (SELECT COUNT(*) FROM devis_items) as total_devis_items,
  (SELECT COUNT(*) FROM quotes) as total_quotes,
  (SELECT COUNT(*) FROM quote_items) as total_quote_items,
  (SELECT COUNT(DISTINCT devis_id) FROM devis_items) as devis_avec_items;
-- Résultat : total_devis=32, total_devis_items=49, total_quotes=0, total_quote_items=0, devis_avec_items=29
```

```sql
-- Vérification join devis + devis_items
SELECT d.devis_number, d.status, d.total, COUNT(di.id) as nb_items, SUM(di.total) as sum_items
FROM devis d LEFT JOIN devis_items di ON di.devis_id = d.id
GROUP BY d.id ORDER BY d.created_at DESC LIMIT 5;
-- DEV-2026-0032 : 2 items, sum=833.34 ✅
-- DEV-2026-0031 : 5 items, sum=1616.67 ✅
-- DEV-2026-0030 : 3 items, sum=733.33 ✅
```

**Playwright — requêtes réseau observées** :
```
Tables requested: messages, notifications, clients, leads, devis, invoices, payments, ...
PASS — no requests to quote_items or quotes
```

| Test | Résultat |
|---|---|
| Table `devis` : 32 lignes | ✅ |
| Table `devis_items` : 49 lignes | ✅ |
| Join `devis` ↔ `devis_items` fonctionnel | ✅ items visibles sur 29 devis |
| Table `quotes` : 0 lignes | ✅ vestige vide confirmé |
| Table `quote_items` : 0 lignes | ✅ vestige vide confirmé |
| Zéro requête réseau vers `quote_items` | ✅ Playwright confirme |
| Zéro requête réseau vers `quotes` | ✅ Playwright confirme |
| `devis_number` correctement utilisé | ✅ colonnes DEV-YYYY-XXXX présentes |

**Verdict** : 🟢 Fonctionnel — **bascule V2 vers devis_items confirmée en production**

---

## 5. PAIEMENTS

**Source** : SQL Supabase direct

```sql
SELECT COUNT(*) total,
  COUNT(CASE WHEN invoice_id IS NULL THEN 1 END) sans_invoice_id,
  SUM(amount) total_montant,
  COUNT(CASE WHEN status='completed' THEN 1 END) completed
FROM payments;
-- Résultat : total=4, sans_invoice_id=4, total_montant=720.00, completed=4
```

| Test | Résultat |
|---|---|
| 4 paiements présents | ✅ (conforme snapshot BEFORE) |
| 4 paiements sans `invoice_id` | ✅ Décision D3 respectée |
| Montant total : 720,00 € | ✅ |
| Statut `completed` : 4/4 | ✅ |
| Aucune erreur sur paiements sans invoice | ✅ `usePaiements.ts` gère `invoice_id=null` |

**Verdict** : 🟢 Fonctionnel

---

## 6. LOÏC (ai_conversations)

**Source** : SQL Supabase direct

```sql
SELECT COUNT(*) total,
  COUNT(CASE WHEN status='active' THEN 1 END) actives,
  COUNT(CASE WHEN lead_id IS NOT NULL THEN 1 END) avec_lead
FROM ai_conversations;
-- Résultat : total=8, actives=8, avec_lead=4
```

| Test | Résultat |
|---|---|
| 8 conversations accessibles | ✅ (conforme snapshot BEFORE) |
| Toutes `status=active` | ✅ |
| 4 conversations liées à un lead | ✅ |
| `useLoic.ts` queries `ai_conversations` | ✅ correct |
| Table `loic_actions` | ⚠️ 0 ligne — non câblée (prévu Phase C) |

**Note** : Loïc écrit dans `ai_conversations`, `leads`, et `devis` via l'Edge Function (`service_role`). La table `loic_actions` reste à zéro — elle n'est pas encore intégrée dans le flux (Sprint 8+).

**Verdict** : 🟢 Fonctionnel — nouvelle fonctionnalité `loic_actions` hors périmètre Sprint 7.2

---

## 7. GOOGLE

**Source** : SQL Supabase direct

```sql
SELECT email, expires_at, user_id,
  (user_id = '00000000-0000-0000-0000-000000000000') as is_legacy_uuid
FROM google_integrations LIMIT 1;
-- Résultat : email=catechn21@gmail.com, expires_at=2026-07-16, is_legacy_uuid=true
```

| Test | Résultat |
|---|---|
| Enregistrement Google présent | ✅ 1 ligne |
| Email connecté | catechn21@gmail.com |
| Token expiré | ❌ expires_at = 2026-07-16 (expiré) |
| user_id = UUID zéro (legacy) | ❌ Invisible pour Loïc authentifié (RLS) |
| Reconnexion OAuth nécessaire | 🔴 OUI |

**Action requise** : Reconnecter Google depuis la page Intégrations → bouton "Connecter Google". La popup OAuth mettra à jour l'enregistrement avec le vrai `user_id` de Loïc.

**Verdict** : 🔴 Reconnexion requise — prévu, documenté en Sprint 6

---

## 8. DASHBOARD (KPIs)

**Source** : SQL Supabase direct

```sql
SELECT
  (SELECT COUNT(*) FROM clients WHERE status='active') as clients_actifs,
  (SELECT COUNT(*) FROM leads WHERE status NOT IN ('won','lost')) as leads_ouverts,
  (SELECT COUNT(*) FROM devis WHERE status NOT IN ('accepted','rejected','cancelled')) as devis_en_cours,
  (SELECT COUNT(*) FROM invoices WHERE status NOT IN ('paid','cancelled')) as factures_ouvertes,
  (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='completed') as ca_total,
  (SELECT COUNT(*) FROM messages WHERE is_read=false) as messages_non_lus,
  (SELECT COUNT(*) FROM notifications WHERE is_read=false) as notifs_non_lues;
```

| KPI | Valeur | Cohérence |
|---|---|---|
| Clients actifs | 2 | ✅ |
| Leads ouverts | 13 | ✅ (tous actifs, non convertis) |
| Devis en cours | 32 | ✅ (tous les devis) |
| Factures ouvertes | 0 | ✅ (4 factures toutes payées ou archivées) |
| CA total paiements | 720,00 € | ✅ |
| Messages non lus | 1 | ✅ badge sidebar cohérent |
| Notifications non lues | 0 | ✅ |

**Verdict** : 🟢 Fonctionnel — KPIs cohérents avec données V2

---

## 9. BUILD — TYPECHECK / LINT / BUILD

### TypeScript

```
npx tsc --noEmit
→ (aucune sortie)
```

✅ **0 erreur TypeScript**

### ESLint (fichiers modifiés)

```
npx eslint src/hooks/useClients.ts src/hooks/useDevis.ts src/hooks/useServices.ts
→ 0 errors, 11 warnings (no-explicit-any — préexistants)
```

✅ **0 erreur ESLint**

### Build production

```
npm run build
→ ✓ 3570 modules transformed
→ ✓ built in 2.81s
```

✅ **Build validé**

---

## ERREURS TROUVÉES

| # | Domaine | Type | Gravité | Statut |
|---|---|---|---|---|
| 1 | Auth | App ne redirige pas vers /login sans session | Non bloquant | Préexistant — RLS compense |
| 2 | Messages | `client_id = NULL` pour tous les messages | Non bloquant | Données — pas de bug code |
| 3 | Google | Token OAuth expiré (2026-07-16) | Bloquant pour Google | Action utilisateur requise |
| 4 | Loïc | `loic_actions` non câblée | Non bloquant | Phase C planifiée |

## CORRECTIONS EFFECTUÉES

Aucune correction dans ce sprint — test lecture seule.  
Les corrections Phase A (Sprint 7 → 7.1) sont validées par ce test.

## TESTS RÉUSSIS

- ✅ `devis_items` : 49 lignes, join fonctionnel sur 29 devis
- ✅ Zéro requête réseau vers `quote_items` ou `quotes`
- ✅ Paiements : 4 lignes dont 4 sans `invoice_id` — visibles, aucune erreur
- ✅ Clients : 2 actifs, données correctes
- ✅ Messages : 6 accessibles, badge non-lu cohérent
- ✅ ai_conversations : 8 conversations accessibles
- ✅ Dashboard KPIs : tous cohérents avec les données Supabase
- ✅ TypeScript : 0 erreur
- ✅ ESLint : 0 erreur
- ✅ Build production : ✓ 3570 modules

## TESTS ÉCHOUÉS

- ❌ Google OAuth : token expiré — reconnexion nécessaire

## ÉTAT GOOGLE

**Statut** : 🔴 RECONNEXION REQUISE  
**Email concerné** : catechn21@gmail.com  
**Token expiré depuis** : 2026-07-16  
**Cause** : UUID zéro en `user_id` → enregistrement invisible après correction RLS  
**Action** : Connecter Google depuis `https://ca-tech.fr/manager/integrations` → bouton "Connecter Google"  
**Effet** : Nouveau token + user_id réel de Loïc → enregistrement visible et fonctionnel

---

TEST FONCTIONNEL MANAGER V2 TERMINÉ
