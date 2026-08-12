# STRIPE SECURITY FIX REPORT — Sprint 9.4

**Date** : 2026-08-12  
**Scope** : Correction des 2 FAIL identifiés dans STRIPE_FINAL_SECURITY_AUDIT.md  
**Règle** : Aucune donnée supprimée — aucune table supprimée — frontend non modifié

---

## 1. FAIL #1 — Race condition TOCTOU (double acompte / double solde)

### Problème original

`stripe-create-payment` utilisait un pattern SELECT-then-INSERT sans filet PostgreSQL. Deux requêtes simultanées pour le même `(devis_id, payment_type)` pouvaient toutes deux passer le SELECT avant que l'une n'ait inséré, créant deux factures pour le même devis.

### Correction en deux couches

**Couche 1 — Contrainte UNIQUE PostgreSQL (défense principale)**

Index UNIQUE partiel ajouté sur la table `invoices` :

```sql
CREATE UNIQUE INDEX invoices_devis_payment_type_key
  ON invoices (devis_id, payment_type)
  WHERE devis_id IS NOT NULL
    AND payment_type IN ('acompte', 'solde');
```

Garantie PostgreSQL atomique : même si deux transactions concurrent, une seule réussit — l'autre obtient l'erreur `23505 unique_violation`.

**Couche 2 — Gestion de l'erreur dans l'Edge Function (réponse propre)**

```typescript
if (invErr) {
  if ((invErr as any).code === '23505') {
    return json({ error: 'Un paiement de ce type est déjà en cours de génération pour ce devis' }, 409)
  }
  throw invErr
}
```

Le SELECT préalable reste en place comme **optimisation** (fast-fail avant la requête Stripe), mais la sécurité finale repose sur PostgreSQL.

---

## 2. Migration créée : `015_fix_race_condition_payments.sql`

**Fichier** : `supabase/migrations/015_fix_race_condition_payments.sql`

La migration inclut :

### Étape 1 — Vérification des doublons existants

```sql
DO $$
DECLARE doublon_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doublon_count FROM (
    SELECT devis_id, payment_type FROM invoices
    WHERE devis_id IS NOT NULL AND payment_type IN ('acompte', 'solde')
    GROUP BY devis_id, payment_type HAVING COUNT(*) > 1
  ) dupes;

  IF doublon_count > 0 THEN
    RAISE EXCEPTION 'MIGRATION ANNULÉE : % doublon(s) détecté(s)...', doublon_count;
  END IF;
END$$;
```

Si un doublon avait existé, la migration s'arrêtait avec un message précis. Aucune donnée ne serait supprimée automatiquement.

### Étape 2 — Contrainte UNIQUE partielle

```sql
CREATE UNIQUE INDEX IF NOT EXISTS invoices_devis_payment_type_key
  ON invoices (devis_id, payment_type)
  WHERE devis_id IS NOT NULL AND payment_type IN ('acompte', 'solde');
```

### Étape 3 — Index de performance (bonus — WARNING de l'audit)

```sql
CREATE INDEX IF NOT EXISTS idx_invoices_devis_id
  ON invoices (devis_id) WHERE devis_id IS NOT NULL;
```

---

## 3. Vérification des doublons avant migration

Résultat de la requête préalable :

```sql
SELECT devis_id, payment_type, COUNT(*) FROM invoices
WHERE devis_id IS NOT NULL AND payment_type IN ('acompte', 'solde')
GROUP BY devis_id, payment_type HAVING COUNT(*) > 1;
```

**Résultat : 0 doublon — migration autorisée et exécutée.**

---

## 4. Contrainte créée — Vérification en base

```sql
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'invoices'
  AND indexname IN ('invoices_devis_payment_type_key', 'idx_invoices_devis_id');
```

**Résultat confirmé :**

| Index | Définition |
|---|---|
| `invoices_devis_payment_type_key` | `CREATE UNIQUE INDEX … USING btree (devis_id, payment_type) WHERE ((devis_id IS NOT NULL) AND (payment_type = ANY (ARRAY['acompte'::text, 'solde'::text])))` |
| `idx_invoices_devis_id` | `CREATE INDEX … USING btree (devis_id) WHERE (devis_id IS NOT NULL)` |

---

## 5. Gestion de l'erreur — Couverture des scénarios

| Scénario | Couche 1 (SELECT) | Couche 2 (PostgreSQL 23505) | Réponse client |
|---|---|---|---|
| Requête normale, premier appel | Passe | N/A | `200 { url, invoice_id }` |
| Deuxième appel séquentiel (acompte existe) | Bloqué → `400` | N/A | `400 "Un acompte existe déjà"` |
| Deux requêtes simultanées (TOCTOU) | L'une passe, l'autre passe | La seconde INSERT → `23505` | `409 "Déjà en cours de génération"` |
| Erreur DB autre | Passe | Relevée | `500` |

---

## 6. Edge Function mise à jour

**Fichier** : `supabase/functions/stripe-create-payment/index.ts`  
**Version déployée** : v3 (ACTIVE)  
**Seule modification** : bloc `if (invErr)` — gestion code `23505`

---

## 7. FAIL #2 — Subscriptions : analyse et document

Conformément aux instructions du sprint, le FAIL #2 a été **analysé uniquement — aucune modification effectuée**.

**Document créé** : `SUBSCRIPTIONS_SCHEMA_COMPATIBILITY.md`

### Résumé des incompatibilités identifiées

| Colonne V2 | État en DB | Erreur attendue |
|---|---|---|
| `name` | Colonne `offre` | `42703` — FAIL INSERT |
| `amount` | Colonne `montant` | `42703` — FAIL INSERT |
| `frequency` | Colonne `frequence`, valeurs `mensuel`/`annuel` | `42703` / `23514` — FAIL INSERT |
| `status: 'trialing'` | Non autorisé par CHECK | `23514` — FAIL INSERT |
| `status: 'past_due'`, `'paused'` | Non autorisés par CHECK | `23514` — FAIL UPDATE webhook |
| `devis_id` | Absente | `42703` — FAIL INSERT |
| `stripe_checkout_session_id` | Absente | `42703` / no-op silencieux |
| `current_period_start` | Absente | `42703` — FAIL UPDATE webhook |
| `current_period_end` | Absente | `42703` — FAIL UPDATE webhook |
| `cancelled_at` | Absente | `42703` — FAIL UPDATE annulation |

Une migration `016_subscriptions_v2_align.sql` est documentée dans `SUBSCRIPTIONS_SCHEMA_COMPATIBILITY.md` §6, prête à être appliquée lors du sprint abonnements.

---

## 8. Tests

### TypeScript — typecheck

```
$ npx tsc --noEmit
(aucune sortie = 0 erreur)
```

**Résultat : 0 erreur TypeScript**

### Build

```
$ npm run build
✓ built in 2.10s
```

**Résultat : build réussi**

Chunks > 500 kB : avertissement Vite pre-existant (vendor-pdf, vendor-charts) — non lié à ce sprint.

### Vérification contrainte UNIQUE en base

Tentative de doublon simulée par logique :
- Si deux INSERT simultanés `(devis_id=X, payment_type='acompte')` arrivent, PostgreSQL garantit qu'un seul réussit via l'index UNIQUE partiel `invoices_devis_payment_type_key`
- Le second reçoit `ERROR 23505: duplicate key value violates unique constraint "invoices_devis_payment_type_key"`
- L'Edge Function intercepte ce code et retourne `409`

---

## 9. Fichiers créés / modifiés

| Fichier | Action | Description |
|---|---|---|
| `supabase/migrations/015_fix_race_condition_payments.sql` | Créé | Migration UNIQUE index + index perf |
| `supabase/functions/stripe-create-payment/index.ts` | Modifié | Gestion erreur `23505` → retour `409` |
| `SUBSCRIPTIONS_SCHEMA_COMPATIBILITY.md` | Créé | Analyse complète incompatibilités subscriptions |
| `STRIPE_SECURITY_FIX_REPORT.md` | Créé | Ce rapport |

**Edge Function déployée** : `stripe-create-payment` v3 — ACTIVE

---

**FAIL #1 CORRIGÉ — FAIL #2 ANALYSÉ — AUCUNE DONNÉE SUPPRIMÉE**
