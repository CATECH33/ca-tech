# MANAGER V2 — AUDIT CODE & CARTE DE MIGRATION

**Date** : 2026-08-10  
**Sprint** : 7 — Audit code (lecture seule)  
**Périmètre** : Tous les hooks React, pages, et Edge Functions  
**Règle** : AUCUNE MODIFICATION — audit uniquement

---

## RÉSUMÉ EXÉCUTIF

| Catégorie | Résultat |
|---|---|
| Hooks analysés | 19 |
| Edge Functions analysées | 3 + 4 sous-modules |
| **Bugs critiques** | **2** |
| **Fonctions manquantes** | **1** |
| Tables V2 actives correctement câblées | 12/12 |
| Tables obsolètes encore référencées dans le code | 9 |
| Nouvelles tables V2 non encore câblées | 5/5 |

---

## 1. BUGS CRITIQUES

### BUG 1 — `useClientDevis()` : mauvaise table (BLOQUANT)

**Fichier** : `src/hooks/useClients.ts`, ligne ~164  
**Symptôme** : L'onglet "Devis" dans les fiches clients est toujours vide  
**Cause** :

```typescript
// ACTUEL (erroné)
.from('quotes')                             // table vide (0 lignes)
.select('id, quote_number, total, status, created_at')
// puis : r.quote_number → toujours undefined

// ATTENDU
.from('devis')
.select('id, devis_number, total, status, created_at')
// puis : r.devis_number
```

**Impact** : Toutes les fiches clients affichent 0 devis, même pour les clients avec des devis réels.  
**Priorité** : CRITIQUE — à corriger en premier.

---

### BUG 2 — `useServiceStats()` : inclut `quote_items` (données partielles)

**Fichier** : `src/hooks/useServices.ts`, ligne 40–41  
**Symptôme** : Les statistiques de vente par service ne comptabilisent que les factures, pas les devis  
**Cause** :

```typescript
// ACTUEL (partiellement erroné)
supabase.from('quote_items').select('service_id, total_price')
// quote_items = 0 lignes → contribution toujours 0

// ATTENDU
supabase.from('devis_items').select('service_id, total')
// Note: colonne s'appelle 'total', pas 'total_price'
```

**Impact** : Les stats services sous-comptent le CA réel basé sur les devis.  
**Priorité** : HAUTE.

---

### ANOMALIE 3 — Edge Function `generate-reply` introuvable

**Fichier** : `src/hooks/useMessages.ts`, ligne 211  
**Symptôme** : Le bouton "Générer une réponse IA" provoque une erreur 404  
**Cause** :

```typescript
// useMessages.ts:211 appelle :
await fetch(`${SUPABASE_URL}/functions/v1/generate-reply`, ...)
// Mais la fonction n'existe pas dans supabase/functions/
```

**Fonctions déployées** : `contact-form`, `send-reply-email`, `loic-chat`  
**Manquant** : `generate-reply` (jamais créée ou supprimée sans mise à jour du frontend)  
**Priorité** : HAUTE — erreur 404 silencieuse côté UX.

---

## 2. TABLES V2 ACTIVES — ÉTAT DU CODE

Toutes les 12 tables V2 actives sont correctement référencées dans les hooks.

| Table | Hook(s) | Statut |
|---|---|---|
| `clients` | `useClients.ts` | ✅ |
| `leads` | `useLeads.ts` | ✅ (realtime ok) |
| `messages` | `useMessages.ts` | ✅ (realtime ok) |
| `devis` | `useDevis.ts` | ✅ (fallbacks vers anciens noms de colonnes) |
| `devis_items` | `useDevis.ts` | ✅ |
| `invoices` | `useFactures.ts`, `usePaiements.ts` | ✅ |
| `invoice_items` | `useFactures.ts` | ✅ |
| `payments` | `useFactures.ts`, `usePaiements.ts` | ✅ |
| `ai_conversations` | `useLoic.ts` | ✅ (realtime ok) |
| `google_integrations` | `useGoogleIntegration.ts` | ✅ (reconnexion OAuth nécessaire) |
| `notifications` | `useInAppNotifications.ts` | ✅ (realtime ok) |
| `notification_settings` | `useNotifications.ts` | ✅ |

### Détail : `useDevis.ts` — Fallbacks de compatibilité

```typescript
// mapRow() gère les deux noms de colonnes
numero: row.devis_number ?? row.quote_number,     // ← fallback ok ✅
lignes: (row.devis_items ?? row.quote_items ?? []) // ← fallback ok ✅
```

Ces fallbacks sont sûrs et peuvent être nettoyés une fois la V2 stabilisée.

### Attention : `useClientMessages()` — données nulles

```typescript
// useClients.ts
.from('messages').eq('client_id', clientId!)
```

En base : tous les 6 messages existants ont `client_id = NULL`.  
L'onglet "Messages" dans les fiches clients retourne toujours 0 résultats.  
**Ce n'est pas un bug de code** — les données ne sont pas liées.

---

## 3. NOUVELLES TABLES V2 — NON ENCORE CÂBLÉES

Aucune des 5 nouvelles tables V2 n'est encore référencée dans le frontend.

| Table V2 | Hook attendu | État |
|---|---|---|
| `loic_actions` | `useLoicActions.ts` (à créer) | ❌ Non câblée |
| `client_google_connections` | `useGoogleIntegration.ts` (à étendre) | ❌ Non câblée |
| `app_settings` | `useAppSettings.ts` (à créer) | ❌ Hook inexistant |
| `stripe_payment_links` | `useFactures.ts` (à étendre) | ❌ Non câblée |
| `subscriptions` | `useSubscriptions.ts` (à créer) | ❌ Non câblée |

**Note `app_settings`** : Le hook `useAppSettings.ts` n'existe pas encore. C'était l'objet de la décision de migration frontend au premier chargement — il reste à implémenter.

**Note `loic_actions`** : La fonction `loic-chat` n'écrit pas dans `loic_actions`. La table est vide et n'est pas encore intégrée dans le flux Loïc.

---

## 4. TABLES OBSOLÈTES ENCORE RÉFÉRENCÉES

### A. `quotes` — 2 références actives (BUG)

| Fichier | Ligne | Usage | Statut |
|---|---|---|---|
| `src/hooks/useClients.ts` | ~164 | `useClientDevis()` — requête principale | ❌ BUG CRITIQUE |
| `src/hooks/useServices.ts` | 40 | `useServiceStats()` — stats partielles | ⚠️ Données incomplètes |

### B. `quote_items` — 1 référence active (BUG)

| Fichier | Ligne | Usage | Statut |
|---|---|---|---|
| `src/hooks/useServices.ts` | 41 | `useServiceStats()` — toujours 0 | ❌ Retourne 0 |

### C. `notification_logs` — 2 références

| Fichier | Ligne | Usage | Statut |
|---|---|---|---|
| `src/hooks/useNotifications.ts` | 46 | `useNotifications()` — lecture logs | ⚠️ Table obsolète, non V2 |
| `supabase/functions/loic-chat/notifications/notificationService.ts` | 110 | INSERT logs | ⚠️ Écriture dans table obsolète |

La table `notification_logs` a 83 lignes et est conservée. L'UI affiche ces logs dans la page Notifications.  
**Impact V2** : Pas de blocage — la table est accessible. À migrer vers `notifications` V2 à terme.

### D. `services` — hook complet actif

| Fichier | Usage | Statut |
|---|---|---|
| `src/hooks/useServices.ts` | CRUD complet sur la table | ⚠️ Table hors périmètre V2 mais fonctionnelle |

La table `services` (9 lignes) est conservée intacte. Le module Catalogue utilise encore ce hook.

### E. `projects` — hook complet actif

| Fichier | Usage | Statut |
|---|---|---|
| `src/hooks/useProjets.ts` | CRUD complet sur la table | ⚠️ Table hors périmètre V2 mais fonctionnelle |
| `src/hooks/useClients.ts` | `useClientProjets()` — join | ⚠️ Idem |

La table `projects` (4 lignes) est conservée intacte.

### F. Modules Prospection — hooks complets actifs

| Hook | Table(s) | Statut |
|---|---|---|
| `useProspects.ts` | `prospects`, `prospect_contacts`, `prospect_activities` | ⚠️ Module supprimé côté UI mais hooks subsistent |
| `useCampagnes.ts` | `campaigns`, `campaign_steps`, `prospect_campaigns` | ⚠️ Idem |
| `useEmailDrafts.ts` | `email_drafts` | ⚠️ Idem |

Ces hooks correspondent au module Prospection supprimé de l'UI. Les données sont conservées en base mais les pages correspondantes ne sont plus accessibles. Les hooks sont du code mort.

### G. Autres tables obsolètes référencées

| Hook | Table | Statut |
|---|---|---|
| `useTickets.ts` | `tickets` | ⚠️ Table non V2, hors périmètre |
| `useAgenda.ts` | `appointments` | ⚠️ Table non V2 |
| `useTaches.ts` | `project_tasks` | ⚠️ Table non V2 |
| `useDocuments.ts` | `documents` | ⚠️ Table non V2 |
| `usePortfolio.ts` | `portfolio_projects` | ⚠️ Table non V2 |
| `useAudit.ts` | `audit_logs` | ⚠️ Table non V2 |

---

## 5. EDGE FUNCTIONS — ANALYSE COMPLÈTE

### `contact-form/index.ts`

| Critère | Résultat |
|---|---|
| Clé utilisée | `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS) |
| Écrit dans | `messages` |
| Lit depuis | — |
| Statut V2 | ✅ Entièrement compatible |

**Note** : `MANAGER_URL` est défini sur `https://manager.ca-tech.fr` (ancienne URL). L'URL correcte est `https://ca-tech.fr/manager`. Variable d'env à corriger dans Supabase.

---

### `send-reply-email/index.ts`

| Critère | Résultat |
|---|---|
| Clé utilisée | Aucune (pas d'accès Supabase) |
| Écrit dans | — |
| Envoie email via | Resend → Brevo (fallback) |
| Statut V2 | ✅ Entièrement compatible |

---

### `loic-chat/index.ts`

| Critère | Résultat |
|---|---|
| Clé utilisée | `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS) |
| Écrit dans | `ai_conversations`, `leads`, `devis` |
| Via notificationService | `notification_logs` (obsolète) |
| Statut V2 | ✅ Compatible — ⚠️ 1 anomalie |

**Anomalie — Génération des numéros de devis (risque de collision)** :

```typescript
// loic-chat/index.ts:193-194
const { count: devisCount } = await supabase
  .from('devis').select('*', { count: 'exact', head: true })
devisNumber = `DEV-${year}-${String((devisCount ?? 0) + 1).padStart(4, '0')}`
// ↑ COUNT(*) + 1 peut collisionner si le Manager crée un devis simultanément
```

Le Manager (`useDevis.ts`) utilise `MAX(last_number) + 1` (plus sûr).  
Sous usage normal (1 utilisateur), risque quasi nul. Sous usage concurrent, collision possible.

**Anomalie — `loic_actions` non câblée** :  
La table `loic_actions` est vide et n'est jamais alimentée par `loic-chat`. Les actions de Loïc (create_lead, show_quote, etc.) ne sont pas tracées en base.

---

### `loic-chat/notifications/notificationService.ts`

Écrit 3 logs dans `notification_logs` à chaque notification :  
`email` + `telegram` + `whatsapp` → INSERT groupé.  
Fonctionne mais écrit dans une table obsolète (hors périmètre V2).

---

## 6. MAPPING COMPLET ANCIEN → V2

| Ancien | V2 | Action code requise |
|---|---|---|
| `quotes` | `devis` | Corriger `useClientDevis()` |
| `quote_items` | `devis_items` | Corriger `useServiceStats()` |
| `r.quote_number` | `r.devis_number` | Corriger dans `useClientDevis()` |
| `total_price` (quote_items) | `total` (devis_items) | Corriger dans `useServiceStats()` |
| `notification_logs` | `notifications` | Migration future (non bloquante) |
| `google_integrations` (UUID 0) | Reconnexion OAuth | Action utilisateur, pas code |

---

## 7. ORDRE RECOMMANDÉ DE MODIFICATIONS

### Phase A — Bugs bloquants (à faire immédiatement)

1. **`useClients.ts` — `useClientDevis()`**  
   Changer `.from('quotes')` → `.from('devis')`  
   Changer `r.quote_number` → `r.devis_number`  
   Changer `select('id, quote_number, ...)` → `select('id, devis_number, total, status, created_at')`

2. **`useServices.ts` — `useServiceStats()`**  
   Changer `.from('quote_items')` → `.from('devis_items')`  
   Changer `total_price` → `total` dans la sélection

### Phase B — Fonction manquante (priorité haute)

3. **Créer Edge Function `generate-reply`**  
   Appelée par `useMessages.ts:211` mais inexistante  
   Alternative : supprimer l'appel si la fonctionnalité n'est pas souhaitée

### Phase C — Nouvelles tables V2 (priorité normale, post-stabilisation)

4. **Créer `useAppSettings.ts`**  
   Doit migrer `localStorage` → table `app_settings` au premier chargement  
   Clé attendue : `{ key: string, value: jsonb }` par utilisateur

5. **Câbler `loic_actions`** dans `loic-chat/index.ts`  
   Tracer chaque action Loïc (create_lead, show_quote, etc.) dans la table

6. **Câbler `client_google_connections`** dans `useGoogleIntegration.ts`  
   À la reconnexion OAuth, insérer dans `client_google_connections` en plus de `google_integrations`

7. **Câbler `stripe_payment_links`** dans `useFactures.ts`  
   Le champ `stripe_payment_link` est déjà stocké dans `invoices` — la table `stripe_payment_links` est le registre central dédié

8. **Câbler `subscriptions`**  
   Nécessite la mise en place du flux Stripe → hook `useSubscriptions.ts` à créer

### Phase D — Nettoyage (priorité basse, après validation)

9. **Supprimer les hooks morts du module Prospection**  
   `useProspects.ts`, `useCampagnes.ts`, `useEmailDrafts.ts` (+ `useApify.ts`, `useRecommendations.ts`)

10. **Migrer `notification_logs` → `notifications`** dans `notificationService.ts`

11. **Supprimer les fallbacks `quote_number`/`quote_items`** dans `useDevis.ts` (une fois tous les devis confirmés en V2)

12. **Corriger `MANAGER_URL`** dans `contact-form/index.ts`  
    `https://manager.ca-tech.fr` → `https://ca-tech.fr/manager`

---

## 8. RISQUES

| Risque | Impact | Probabilité | Mitigation |
|---|---|---|---|
| Collision numéros devis (loic-chat vs Manager) | Devis en double avec même numéro | Faible | Utiliser MAX+1 cohérent dans loic-chat |
| `generate-reply` 404 | Erreur silencieuse UX | Certaine | Créer la fonction ou désactiver le bouton |
| `useClientDevis()` queries `quotes` | Fiches clients vides (Devis) | Certaine (déjà en prod) | Fix Phase A |
| `useClientMessages()` retourne 0 | Fiches clients vides (Messages) | Certaine | Données non liées — problème base + code |
| Reconnexion Google OAuth | Intégrations Google hors-service | Certaine | Action utilisateur planifiée |
| `app_settings` pas câblée | Paramètres app perdus à chaque session | Selon usage | Phase C — créer `useAppSettings.ts` |

---

## 9. POINTS BLOQUANTS

1. **`generate-reply` introuvable** — L'Edge Function `generate-reply` est appelée par `useMessages.ts` mais n'existe pas dans `supabase/functions/`. Le bouton "Générer une réponse IA" dans la page Messages provoque un 404. Décision requise : créer la fonction ou retirer le bouton.

2. **`useAppSettings.ts` inexistant** — La table `app_settings` est créée mais le hook front-end censé l'alimenter n'existe pas. La migration localStorage → Supabase pour les paramètres n'a pas encore été implémentée.

3. **Reconnexion Google OAuth** — Le token Google stocké dans `google_integrations` correspond à l'UUID zéro (`00000000-0000-0000-0000-000000000000`). Après la correction RLS, Loïc ne peut plus voir cet enregistrement. La reconnexion doit être effectuée manuellement depuis la page Intégrations → "Connecter Google".

---

## 10. RÉCAPITULATIF PAR FICHIER

| Fichier | Tables V2 | Tables obsolètes | Bugs | Action |
|---|---|---|---|---|
| `useClients.ts` | `clients`, `invoices` | `quotes`, `projects`, `tickets` | ✅ `useClientDevis` queries `quotes` | Phase A |
| `useDevis.ts` | `devis`, `devis_items` | — | ⚠️ Fallbacks à nettoyer | Phase D |
| `useFactures.ts` | `invoices`, `invoice_items`, `payments` | — | — | ✅ Rien |
| `useLeads.ts` | `leads`, `clients` | — | — | ✅ Rien |
| `useLoic.ts` | `ai_conversations` | — | — | ✅ Rien |
| `useMessages.ts` | `messages` | — | ✅ `generate-reply` 404 | Phase B |
| `useNotifications.ts` | `notification_settings` | `notification_logs` | — | Phase D |
| `useInAppNotifications.ts` | `notifications` | — | — | ✅ Rien |
| `usePaiements.ts` | `payments`, `invoices` | — | — | ✅ Rien |
| `useServices.ts` | `services` | `quote_items` | ✅ `useServiceStats` queries `quote_items` | Phase A |
| `useGoogleIntegration.ts` | `google_integrations` | — | — | Phase C |
| `useProjets.ts` | — | `projects` | — | ⚠️ Table hors V2 |
| `loic-chat/index.ts` | `ai_conversations`, `leads`, `devis` | `notification_logs` | ⚠️ Collision numéros | Phase C |
| `contact-form/index.ts` | `messages` | — | ⚠️ MANAGER_URL erroné | Phase D |
| `send-reply-email/index.ts` | — | — | — | ✅ Rien |

---

MANAGER V2 — AUDIT CODE TERMINÉ — AUCUNE MODIFICATION EFFECTUÉE
