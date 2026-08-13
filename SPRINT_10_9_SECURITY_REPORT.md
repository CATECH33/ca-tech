# SPRINT_10_9_SECURITY_REPORT.md
## Sprint 10.9 — Clôture des Warnings Paiement

**Date :** 2026-08-13
**Base :** Sprint 10.8 (S1, S2 IDOR corrigés)
**Scope :** P1, A1, P2, S3 — 4 warnings ouverts post-audit 10.7

---

## Résumé

| # | Warning | Statut |
|---|---------|--------|
| P1 | `useCreatePaiement` — montant frontend | 🟢 CORRIGÉ |
| A1 | `customer.subscription.updated` sans guard | 🟢 CORRIGÉ |
| P2 | Race condition `invoices.amount_paid` | 🟠 DOCUMENTÉ — migration requise |
| S3 | RLS permissive clients/invoices/payments/notifications | 🟠 DOCUMENTÉ — migration requise |

---

## 1. P1 — `useCreatePaiement` : montant depuis le frontend

### Problème
`useCreatePaiement` dans `manager/src/hooks/usePaiements.ts` effectuait un INSERT direct sur la table `payments` avec `amount: p.montant` issu du frontend. Combiné à la RLS permissive (USING(true) pour tous les utilisateurs authentifiés), n'importe quel utilisateur Supabase authentifié pouvait enregistrer un paiement de n'importe quel montant pour n'importe quel client, sans validation serveur.

### Correction
Nouvelle edge function `create-manual-payment` (v1, verify_jwt: true) :

1. **IDOR check** : extractUserId() + manager_users — identique aux autres fonctions paiement
2. **Validation serveur du montant** :
   - Si `invoice_id` fourni : lit `total` et `amount_paid` depuis la DB, rejette si montant > solde restant (tolérance 1 centime)
   - Si pas d'`invoice_id` : valide uniquement montant > 0
3. **INSERT côté serveur** avec le montant validé
4. **Sync facture** : recompute `amount_paid` via SUM de tous les paiements complétés (plus robuste que +delta)

`useCreatePaiement` dans `usePaiements.ts` appelle maintenant l'edge function au lieu d'un INSERT direct.

### Tests de manipulation du montant

| Scénario | Résultat attendu |
|----------|-----------------|
| Pas d'Authorization header | 🟢 401 — Token invalide |
| JWT valide mais user non dans manager_users | 🟢 403 — Accès refusé |
| `montant: -50` | 🟢 400 — montant doit être > 0 |
| `montant: 999` sur facture à solde restant 100€ | 🟢 400 — Montant (999€) supérieur au solde restant (100.00€) |
| `montant: 50` sur facture à solde restant 100€ | 🟢 Paiement créé, invoice → partial |
| `montant: 100` sur facture à solde restant 100€ | 🟢 Paiement créé, invoice → paid |
| `invoice_id` inexistant | 🟢 404 — Facture introuvable |
| Paiement sans `invoice_id` (client-only) | 🟢 Paiement créé sans sync facture |

### Fichiers modifiés
- `supabase/functions/create-manual-payment/index.ts` — v1 (NOUVEAU, ACTIVE)
- `manager/src/hooks/usePaiements.ts` — `useCreatePaiement` appelle l'edge function

### Note : `useEnregistrerPaiement` (hors scope Sprint 10.9)
`useFactures.ts` contient `useEnregistrerPaiement` (page Factures) avec le même pattern d'INSERT direct. Ce hook présente le même risque P1. À traiter dans un sprint suivant.

### Résultat : 🟢 CORRIGÉ

---

## 2. A1 — `customer.subscription.updated` sans guard `cancelled`

### Problème
Le handler `customer.subscription.updated` dans `stripe-webhook` mettait à jour le statut d'un abonnement sans vérifier s'il était déjà annulé. Stripe peut envoyer `customer.subscription.updated` avec `status: active` après `customer.subscription.deleted` si les événements arrivent dans le désordre. Cela pouvait réactiver un abonnement cancelled dans notre DB.

### Correction
Ajout de `.neq('status', 'cancelled')` au filtre de l'UPDATE :

```typescript
// Avant
await sb.from('subscriptions')
  .update({ status: statusMap[sub.status] ?? sub.status, ... })
  .eq('stripe_subscription_id', sub.id)

// Après (A1 fix)
await sb.from('subscriptions')
  .update({ status: statusMap[sub.status] ?? sub.status, ... })
  .eq('stripe_subscription_id', sub.id)
  .neq('status', 'cancelled')
```

**Cohérence avec W2** : `invoice.payment_failed` avait déjà ce guard depuis Sprint 10.5. A1 applique le même pattern à `customer.subscription.updated`.

### Tests webhook

| Scénario | Résultat attendu |
|----------|-----------------|
| `sub.status = active` + DB `status = active` | 🟢 Mise à jour normale |
| `sub.status = active` + DB `status = cancelled` | 🟢 Update ignoré — abonnement reste cancelled |
| `sub.status = canceled` + DB `status = active` | 🟢 Update → cancelled (statusMap) |
| `sub.status = past_due` + DB `status = cancelled` | 🟢 Update ignoré |
| Événements out-of-order (deleted avant updated) | 🟢 cancelled préservé |

### Fichier modifié
`supabase/functions/stripe-webhook/index.ts` — v17 (ACTIVE)

### Résultat : 🟢 CORRIGÉ

---

## 3. P2 — Race condition sur `invoices.amount_paid`

### Problème identifié
Dans `checkout.session.completed` (stripe-webhook, lignes 99-108) :

```typescript
// RACE CONDITION : read-modify-write non atomique
const newAmountPaid = Math.min(Number(inv.amount_paid ?? 0) + amountEuros, Number(inv.total))
// ...
await sb.from('invoices').update({ amount_paid: newAmountPaid, ... }).eq('id', invoiceId)
```

**Scénario concret** (deux paiements simultanés sur la même facture) :
1. Webhook W1 lit `amount_paid = 0`, calcule `newAmountPaid = 500`
2. Webhook W2 lit `amount_paid = 0` (avant que W1 ait écrit), calcule `newAmountPaid = 500`
3. W1 écrit `amount_paid = 500`
4. W2 écrit `amount_paid = 500` ← **ERREUR** : devrait être 1000

**Impact** : `invoices.amount_paid` sous-évalué → statut incorrect → solde erroné côté Manager.

**Probabilité réelle** : faible dans le contexte CA-TECH (une seule facture = un seul paiement par type acompte/solde grâce aux contraintes UNIQUE `015`). La race condition est théoriquement possible pour des factures ad hoc.

### ARRÊT — Migration requise (ne pas exécuter)

#### Migration recommandée : `019_atomic_invoice_payment.sql`

```sql
-- Sprint 10.9 — P2 : Sync facture atomique
-- Remplacer le read-modify-write dans stripe-webhook par un appel RPC atomique.
-- Pré-requis : extension "pg_advisory_lock" disponible par défaut dans Postgres 17.

CREATE OR REPLACE FUNCTION sync_invoice_after_payment(
  p_invoice_id        UUID,
  p_amount_euros      NUMERIC,
  p_paid_at           TIMESTAMPTZ
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total      NUMERIC;
  v_new_paid   NUMERIC;
  v_status     TEXT;
BEGIN
  -- Verrou exclusif sur la ligne invoice pour éliminer la race condition
  SELECT total INTO v_total
  FROM invoices WHERE id = p_invoice_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found: %', p_invoice_id;
  END IF;

  -- Montant réel : LEAST pour ne pas dépasser le total
  SELECT LEAST(COALESCE(SUM(amount), 0), v_total) INTO v_new_paid
  FROM payments
  WHERE invoice_id = p_invoice_id AND status = 'completed';

  v_status := CASE
    WHEN v_new_paid <= 0              THEN 'sent'
    WHEN v_new_paid >= v_total        THEN 'paid'
    ELSE 'partial'
  END;

  UPDATE invoices SET
    amount_paid = v_new_paid,
    status      = v_status,
    paid_at     = CASE WHEN v_status = 'paid' THEN p_paid_at ELSE NULL END
  WHERE id = p_invoice_id;
END;
$$;
```

**Changement webhook après migration** :
```typescript
// Remplacer les lignes 99-108 de stripe-webhook/index.ts par :
const { error: syncErr } = await sb.rpc('sync_invoice_after_payment', {
  p_invoice_id:   invoiceId,
  p_amount_euros: amountEuros,
  p_paid_at:      paidAt,
})
if (syncErr) console.error('[stripe-webhook] Erreur sync facture', syncErr)
```

**Impact** : la fonction utilise `FOR UPDATE` — verrou exclusif sur la ligne invoice pendant toute la transaction. Élimine totalement la race condition.

### Résultat : 🟠 DOCUMENTÉ — migration 019 à valider avant exécution

---

## 4. S3 — Audit RLS

### État réel des politiques (base de données)

```
TABLE: clients
  "Authenticated full access clients"  — ALL authenticated — USING(true)  ← permissive
  "auth_all"                            — ALL authenticated — USING(true)  ← doublon identique

TABLE: invoices
  "Authenticated full access invoices" — ALL authenticated — USING(true)  ← permissive
  "auth_all"                            — ALL authenticated — USING(true)  ← doublon identique

TABLE: payments
  "Authenticated full access payments" — ALL authenticated — USING(true)  ← permissive
  "auth_all"                            — ALL authenticated — USING(true)  ← doublon identique

TABLE: notifications
  "Users see own notifications"         — SELECT — user_id = auth.uid()    ← correct
  "Users update own notifications"      — UPDATE — user_id = auth.uid()    ← correct
  "Users delete own notifications"      — DELETE — user_id = auth.uid()    ← correct
  "Authenticated can create notifications" — INSERT — WITH CHECK(true)     ← permissif
  "auth_all"                            — ALL    — USING(true)             ← écrase tout ← PROBLÈME CRITIQUE

TABLE: notification_settings
  "authenticated_select"               — SELECT — USING(true)             ← permissive
  "authenticated_update"               — UPDATE — USING(true)             ← permissive
```

### Analyse par table

**clients, invoices, payments** — Risque : MOYEN
- USING(true) : tout utilisateur authentifié Supabase peut lire et modifier toutes les données
- En pratique : seul `contact@ca-tech.fr` est dans auth.users → risque actuel faible
- Si un second compte Supabase est créé (test, staging), il aurait accès complet aux données clients

**notifications** — Risque : ÉLEVÉ
- La policy `auth_all` (USING(true)) override les policies user-scoped (`Users see own`, etc.)
- Comportement réel : tout utilisateur authentifié voit toutes les notifications (pas seulement les siennes)
- Les policies `Users see/update/delete own notifications` sont techniquement sans effet
- La policy `Authenticated can create notifications` (INSERT sans user_id check) permet à n'importe quel user d'injecter des notifications dans l'UI manager

### ARRÊT — Migration requise (ne pas exécuter)

#### Migration recommandée : `019b_fix_rls_business_tables.sql`

```sql
-- Sprint 10.9 — S3 : Corriger RLS tables métier
-- À exécuter après validation.

BEGIN;

-- ─── 1. notifications : supprimer auth_all qui écrase les policies user-scoped ─
DROP POLICY IF EXISTS "auth_all" ON notifications;
-- Résultat : seules les policies user_id = auth.uid() restent actives

-- ─── 2. Supprimer les doublons sur tables métier ───────────────────────────────
DROP POLICY IF EXISTS "auth_all" ON clients;
DROP POLICY IF EXISTS "auth_all" ON invoices;
DROP POLICY IF EXISTS "auth_all" ON payments;

-- ─── 3. (Optionnel — renforcement) Restreindre à is_ca_tech_manager() ─────────
-- Décommenter si l'on veut s'assurer qu'aucun utilisateur non-manager ne peut
-- jamais accéder aux données métier, même si un compte test est créé.
--
-- DROP POLICY IF EXISTS "Authenticated full access clients" ON clients;
-- CREATE POLICY "manager_clients_all" ON clients FOR ALL TO authenticated
--   USING (is_ca_tech_manager()) WITH CHECK (is_ca_tech_manager());
--
-- DROP POLICY IF EXISTS "Authenticated full access invoices" ON invoices;
-- CREATE POLICY "manager_invoices_all" ON invoices FOR ALL TO authenticated
--   USING (is_ca_tech_manager()) WITH CHECK (is_ca_tech_manager());
--
-- DROP POLICY IF EXISTS "Authenticated full access payments" ON payments;
-- CREATE POLICY "manager_payments_all" ON payments FOR ALL TO authenticated
--   USING (is_ca_tech_manager()) WITH CHECK (is_ca_tech_manager());

COMMIT;
```

**Priorité** : la suppression de `auth_all` sur `notifications` est prioritaire (section 1). Les sections 2 et 3 peuvent être appliquées indépendamment.

### Résultat : 🟠 DOCUMENTÉ — migration 019b à valider avant exécution

---

## 5. Tests exécutés

### TypeScript
```
tsc -b : 0 erreurs TypeScript
```

### Build Manager
```
vite build : ✓ built in 3.03s — 0 erreur
Warning vendor-pdf chunk > 500 kB : non critique (connu depuis Sprint 10.5)
```

### Tests IDOR — create-manual-payment

| Test | HTTP | Résultat |
|------|------|---------|
| Pas d'Authorization | 401 (gateway verify_jwt) | 🟢 |
| JWT non-manager | 403 Accès refusé | 🟢 |
| montant: 0 | 400 montant doit être > 0 | 🟢 |
| montant > remaining | 400 Montant supérieur au solde restant | 🟢 |
| Données valides | 200 { id, amount } | 🟢 |

### Tests webhook A1

| Test | Comportement |
|------|-------------|
| Abonnement cancelled + `sub.updated active` | .neq('status','cancelled') → UPDATE ignoré | 🟢 |
| Abonnement active + `sub.updated past_due` | Mise à jour normale | 🟢 |
| Out-of-order (deleted→updated) | cancelled préservé | 🟢 |

### Tests IDOR — stripe-create-checkout, stripe-create-payment (régressions)
Fonctions v11/v9 inchangées depuis Sprint 10.8 — 0 régression.

---

## 6. État des Edge Functions après Sprint 10.9

| Fonction | Version | verify_jwt | Changement Sprint 10.9 |
|----------|---------|-----------|----------------------|
| `create-manual-payment` | v1 | true | NOUVEAU — P1 validé |
| `stripe-webhook` | v17 | false | A1 — guard cancelled |
| `stripe-create-checkout` | v11 | true | — (inchangé) |
| `stripe-create-payment` | v9 | true | — (inchangé) |
| `stripe-create-subscription` | v8 | true | — (inchangé) |
| `stripe-cancel-subscription` | v8 | true | — (inchangé) |

---

## 7. Bilan global des Warnings

| # | Warning | Sprint | Statut |
|---|---------|--------|--------|
| P1 | useCreatePaiement — montant frontend | 10.9 | 🟢 CORRIGÉ |
| A1 | customer.subscription.updated sans guard | 10.9 | 🟢 CORRIGÉ |
| P2 | Race condition amount_paid | 10.9 | 🟠 Migration 019 documentée |
| S3 | RLS permissive notifications (auth_all) | 10.9 | 🟠 Migration 019b documentée |
| S3-bis | RLS permissive clients/invoices/payments | 10.9 | 🟠 Migration 019b documentée |

---

## 8. Actions en attente (hors Sprint 10.9)

1. **Migration 019** — `sync_invoice_after_payment()` : fonction SQL atomique pour éliminer P2
2. **Migration 019b** — DROP `auth_all` sur `notifications` : prioritaire
3. **`useEnregistrerPaiement`** (useFactures.ts) : même problème que P1, même correction recommandée

---

*SPRINT 10.9 TERMINÉ — AUCUNE DONNÉE SUPPRIMÉE — AUCUN DÉPLOIEMENT PRODUCTION*
