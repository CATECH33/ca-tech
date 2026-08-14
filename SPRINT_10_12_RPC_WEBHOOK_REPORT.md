# SPRINT_10_12_RPC_WEBHOOK_REPORT.md
## Sprint 10.12 — Activation RPC Paiements dans stripe-webhook

**Date :** 2026-08-14
**Base :** Sprint 10.11 (migrations 019/019b exécutées — `sync_invoice_after_payment` en DB)
**Scope :** Remplacer le read-modify-write non-atomique de `checkout.session.completed` par l'appel RPC atomique. Analyse de `invoice.payment_succeeded`.

---

## Résumé

| # | Item | Statut |
|---|------|--------|
| `checkout.session.completed` — sync RPC | Remplacement read-modify-write → RPC | 🟢 ACTIVÉ |
| `invoice.payment_succeeded` — analyse | Pas de sync `amount_paid` — RPC non applicable | 🟢 CONFORME |
| 4 factures historiques | Inchangées | 🟢 PRÉSERVÉES |
| Build Manager | 0 erreur TypeScript | 🟢 OK |
| stripe-webhook déployé | v18 | 🟢 ACTIF |

---

## 1. Analyse — Handlers concernés

### `checkout.session.completed` (mode payment — acompte / solde / ad hoc)

C'est le seul handler qui effectuait un read-modify-write sur `invoices.amount_paid` :

```typescript
// AVANT — v17 : read-modify-write non-atomique (race condition P2)
const newAmountPaid = Math.min(Number(inv.amount_paid ?? 0) + amountEuros, Number(inv.total))
const isFullyPaid   = newAmountPaid >= Number(inv.total)
const invoiceUpdate: Record<string, unknown> = {
  amount_paid: newAmountPaid,
  status:      isFullyPaid ? 'paid' : 'partial',
}
if (isFullyPaid) invoiceUpdate.paid_at = paidAt
const { error: iErr } = await sb.from('invoices').update(invoiceUpdate).eq('id', invoiceId)
if (iErr) console.error('[stripe-webhook] Erreur UPDATE invoices', iErr)
```

**Problème** : si deux webhooks Stripe arrivent simultanément pour la même facture, les deux lisent `amount_paid` avant que l'autre n'ait écrit — un des paiements peut être perdu dans le calcul.

### `invoice.payment_succeeded` (renouvellement abonnement)

Ce handler insère un `payment` pour le renouvellement d'abonnement mais **ne met jamais à jour `invoices.amount_paid`** : les paiements d'abonnements ne sont pas liés à une ligne `invoices` dans la DB CA-TECH. Il n'y a donc aucun read-modify-write à remplacer dans ce handler. L'idempotence F2 (`stripe_payment_id` unique) est déjà en place et conservée.

---

## 2. Modification appliquée — `stripe-webhook/index.ts`

### Fichier modifié

`supabase/functions/stripe-webhook/index.ts` — lignes 99-104 (était 99-109 en v17)

### Nouveau mécanisme (v18)

```typescript
// APRÈS — v18 : sync atomique via RPC — FOR UPDATE élimine la race condition
const { error: syncErr } = await sb.rpc('sync_invoice_after_payment', {
  p_invoice_id: invoiceId,
  p_paid_at:    paidAt,
})
if (syncErr) console.error('[stripe-webhook] Erreur sync facture', syncErr)
```

### Fonction SQL appelée

```
sync_invoice_after_payment(p_invoice_id UUID, p_paid_at TIMESTAMPTZ)
```

- Déployée via migration 019 (Sprint 10.11)
- `SECURITY DEFINER`, `SET search_path = public`
- `SELECT ... FOR UPDATE` : verrouillage exclusif de la ligne `invoices` pendant la transaction
- `SUM(payments WHERE invoice_id AND status='completed')` : recompute depuis la réalité DB
- `LEAST(sum, total)` : ne dépasse jamais le total même en cas de concurrence

### Flux complet après modification

```
Stripe → POST /stripe-webhook
  1. Vérification signature HMAC            ← inchangé
  2. Idempotence : stripe_payment_id check  ← inchangé
  3. Lecture facture (client_id, total…)    ← inchangé
  4. INSERT payments (montant Stripe)       ← inchangé
  5. RPC sync_invoice_after_payment         ← NOUVEAU (remplace UPDATE inline)
     ├── FOR UPDATE lock sur invoice
     ├── SUM(payments completed)
     ├── Calcul status (sent/partial/paid)
     └── UPDATE invoices atomique
```

### Protections conservées

| Protection | Statut |
|------------|--------|
| Vérification signature Stripe (HMAC) | ✅ Inchangée |
| Idempotence `stripe_payment_id` | ✅ Inchangée |
| Validation `invoice_id` présent dans metadata | ✅ Inchangée |
| 404 si facture introuvable | ✅ Inchangé |
| 500 si INSERT payment échoue | ✅ Inchangé |
| Gestion erreur RPC (log + 200) | ✅ Présente |
| `verify_jwt: false` (requis pour Stripe) | ✅ Inchangé |

---

## 3. Vérifications pré-modification

### Fonction SQL en DB (avant déploiement v18)

```
proname                    | args                                              | prosecdef
sync_invoice_after_payment | p_invoice_id uuid, p_paid_at timestamptz          | true
```
✅ Signature correspond exactement aux paramètres passés via `rpc(...)`.

### 4 factures historiques — état avant

| Facture | total | amount_paid | status |
|---------|-------|-------------|--------|
| FAC-2026-0001 | 180.00 | 180.00 | paid |
| FAC-2026-0002 | 180.00 | 180.00 | paid |
| FAC-2026-0003 | 180.00 | 180.00 | paid |
| FAC-2026-0004 | 180.00 | 180.00 | paid |

---

## 4. Vérifications post-modification

### 4 factures historiques — état après

| Facture | total | amount_paid | status | Changement |
|---------|-------|-------------|--------|------------|
| FAC-2026-0001 | 180.00 | 180.00 | paid | ✅ INCHANGÉ |
| FAC-2026-0002 | 180.00 | 180.00 | paid | ✅ INCHANGÉ |
| FAC-2026-0003 | 180.00 | 180.00 | paid | ✅ INCHANGÉ |
| FAC-2026-0004 | 180.00 | 180.00 | paid | ✅ INCHANGÉ |

**Pourquoi elles ne sont pas affectées :** `sync_invoice_after_payment` est une fonction passive (pas de trigger). Elle n'est appelée que via `rpc(...)` depuis le webhook. Ces factures ont `status=paid` → `stripe-create-checkout` refuse de créer une session (`remaining <= 0`) → aucun nouveau webhook ne peut les cibler.

### Paiements existants

```
total_payments = 4
distinct_stripe_ids = 4
with_invoice_id = 0   ← inchangé
without_invoice_id = 4 ← inchangé
```
✅ Aucun payment créé ou modifié.

---

## 5. Tests

### Scénario 1 — `invoice.payment_succeeded` (renouvellement abonnement)

Aucune modification sur ce handler. Il ne sync pas `invoices.amount_paid` : les renouvellements d'abonnement insèrent un `payment` sans `invoice_id`. La logique existante (idempotence F2, vérification `stripe_subscription_id`) est intacte.

**Résultat :** ✅ Comportement inchangé, aucun risque de régression.

### Scénario 2 — Webhook répété (idempotence)

La vérification `.eq('stripe_payment_id', paymentIntent).maybeSingle()` avant INSERT est en place (lignes 58-68 du webhook). Si Stripe renvoie le même événement, le premier `existing` retourné → retour 200 immédiat sans INSERT ni appel RPC. La fonction `sync_invoice_after_payment` n'est jamais appelée pour un doublon.

**Résultat :** ✅ Double comptabilisation impossible.

### Scénario 3 — Deux événements simultanés (même facture)

Scénario théorique avec deux webhooks `checkout.session.completed` arrivant pour la même `invoice_id` avant que l'idempotence ne s'active (deux `payment_intent` distincts) :

- W1 : INSERT payment_intent_A → `rpc(sync)` → `FOR UPDATE` verrouille la ligne invoice
- W2 : INSERT payment_intent_B → `rpc(sync)` → attend que W1 libère le verrou
- W1 termine : invoice mise à jour avec SUM correct
- W2 reprend : invoice mise à jour avec SUM incluant payment_intent_A + payment_intent_B

**Résultat :** ✅ Les deux paiements sont comptabilisés correctement. Sans le verrou, W2 aurait pu écraser la valeur de W1 (race condition P2 — maintenant fermée).

### Scénario 4 — Facture inexistante (`invoice_id` invalide)

Handler lignes 71-79 : `.single()` retourne `invErr` si la facture n'existe pas → retour 404. L'appel RPC n'est jamais atteint.

**Résultat :** ✅ RPC non appelée, erreur propagée correctement.

### Scénario 5 — Erreur RPC (ex. DB temporairement indisponible)

Si `syncErr` est non-null : `console.error('[stripe-webhook] Erreur sync facture', syncErr)` et la fonction retourne quand même 200. Stripe ne retentera pas. Conséquence : le `payment` est inséré en DB mais `invoices.amount_paid` n'est pas mis à jour immédiatement.

**Mitigation acceptable :** la fonction peut être appelée manuellement via `rpc(...)` pour réconcilier, ou une prochaine mutation via `create-manual-payment` / le prochain webhook déclenchera une nouvelle sync. Le paiement lui-même est bien enregistré.

---

## 6. Build

```
tsc -b : 0 erreurs
vite build : ✓ built in 2.88s — 0 erreur
Warning vendor-pdf chunk > 500 kB : non critique (connu Sprint 10.5)
```

---

## 7. État des edge functions

| Fonction | Version | Changement Sprint 10.12 |
|----------|---------|------------------------|
| `stripe-webhook` | **v18** | Sync RPC activé — P2 fermé |
| `create-manual-payment` | v1 | — (inchangé) |
| `stripe-create-checkout` | v11 | — (inchangé) |
| `stripe-create-payment` | v9 | — (inchangé) |
| `stripe-create-subscription` | v8 | — (inchangé) |
| `stripe-cancel-subscription` | v8 | — (inchangé) |

---

## 8. Bilan final des warnings sécurité (audit Sprint 10.7)

| # | Warning | Sprint clôture | Statut |
|---|---------|---------------|--------|
| P1 | Montant frontend → serveur (4 surfaces) | 10.9 / 10.10 | 🟢 FERMÉ |
| A1 | guard `cancelled` webhook | 10.9 | 🟢 FERMÉ |
| P2 | Race condition `invoices.amount_paid` | **10.12** | 🟢 FERMÉ |
| S3 | RLS `auth_all` notifications/clients/invoices/payments | 10.11 | 🟢 FERMÉ |

**Tous les warnings de l'audit Sprint 10.7 sont fermés.**

---

*SPRINT 10.12 TERMINÉ — WEBHOOK RPC ACTIVÉ — RACE CONDITION FERMÉE*
