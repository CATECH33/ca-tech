# STRIPE_SUBSCRIPTION_FINAL_FIX_REPORT.md
## Sprint 10.6 — Corrections Critiques Finales (F1, F2, F3)

**Date :** 2026-08-13  
**Base :** Sprint 10.5 (STRIPE_SUBSCRIPTION_SECURITY_FIX_REPORT.md)  
**Scope :** F1, F2, F3 corrigés — 0 FAIL restant  
**Déploiement :** Supabase TEST MODE uniquement — pas de mise en production

---

## Résumé des corrections

| Item | Statut avant | Statut après |
|---|---|---|
| F1 — Montant fourni par le frontend | 🔴 FAIL | 🟢 CORRIGÉ |
| F2 — `invoice.payment_succeeded` sans idempotence | 🔴 FAIL | 🟢 CORRIGÉ |
| F3 — `ProtectedRoute` vide | 🔴 FAIL | 🟢 CORRIGÉ |

---

## 1. F1 — Montant Checkout fourni par le frontend

### Problème
`stripe-create-checkout` acceptait `amount_ttc`, `invoice_number` et `client_email` dans le corps de la requête frontend. Le montant était utilisé directement pour créer la Checkout Session Stripe (`unit_amount: Math.round(amount_ttc * 100)`). Un utilisateur pouvant modifier les headers ou le corps de la requête aurait pu payer n'importe quel montant à la place du montant réel de la facture.

### Correction
La fonction n'accepte plus qu'`invoice_id`. Tous les autres champs (montant, email client, numéro de facture) sont désormais lus directement depuis la base de données via le service role :

```typescript
// Avant — montant venant du frontend
const { invoice_id, invoice_number, amount_ttc, client_email } = await req.json()
// ...
unit_amount: Math.round(amount_ttc * 100)  // ← DANGER : valeur non vérifiée

// Après — montant calculé côté serveur
const { invoice_id } = await req.json()
const { data: inv } = await sb
  .from('invoices')
  .select('id, invoice_number, total, amount_paid, status, client_id, clients(id, email)')
  .eq('id', invoice_id).single()
const remaining = Number(inv.total) - Number(inv.amount_paid)
// ...
unit_amount: Math.round(remaining * 100)  // ← Montant DB uniquement
```

La durée d'expiration des sessions est également réduite de 30 à 7 jours (correction portée depuis Sprint 10.4).

### Fichiers modifiés
- `supabase/functions/stripe-create-checkout/index.ts` — v10 (ACTIVE)
- `manager/src/hooks/useFactures.ts` — `useCreateStripeCheckout()` : body réduit à `{ invoice_id }` uniquement

### Tests
| Scénario | Résultat attendu |
|---|---|
| Création Checkout avec `invoice_id` valide | 🟢 Montant = DB `total - amount_paid` |
| Facture déjà réglée (`remaining <= 0`) | 🟢 400 — Facture déjà réglée |
| `invoice_id` inexistant | 🟢 404 — Facture introuvable |
| Tentative de passer `amount_ttc` dans le body | 🟢 Ignoré — montant lu depuis DB |

### Résultat : 🟢 CORRIGÉ

---

## 2. F2 — `invoice.payment_succeeded` sans idempotence

### Problème
Le handler `invoice.payment_succeeded` dans `stripe-webhook` insérait un paiement dans `payments` sans vérifier si ce `stripe_payment_id` était déjà enregistré. En cas de retry Stripe (comportement normal : Stripe retente jusqu'à 72h si le webhook ne retourne pas 200), chaque appel créait un nouveau paiement dupliqué. La contrainte UNIQUE `payments_stripe_payment_id_key` (migration 014) aurait provoqué une erreur 23505 côté Supabase et un 500 côté webhook → boucle de retry infinie.

### Correction
Ajout d'une vérification d'idempotence avant l'INSERT. Si le `stripe_payment_id` est déjà présent dans `payments`, la fonction retourne 200 immédiatement sans insérer.

```typescript
// F2 : idempotence — vérifier avant d'insérer
const stripePaymentId = typeof stripeInv.payment_intent === 'string' ? stripeInv.payment_intent : null
if (stripePaymentId) {
  const { data: existingPayment } = await sb
    .from('payments').select('id')
    .eq('stripe_payment_id', stripePaymentId).maybeSingle()
  if (existingPayment) {
    console.log('[stripe-webhook] invoice.payment_succeeded déjà traité, ignoré', stripePaymentId)
    return new Response('OK', { status: 200 })
  }
}
```

**Aucune migration SQL nécessaire** — le UNIQUE index `payments_stripe_payment_id_key WHERE stripe_payment_id IS NOT NULL` existe déjà depuis la migration 014 et sert de filet de sécurité DB en cas de race condition concurrente.

### Fichier modifié
`supabase/functions/stripe-webhook/index.ts` — v16 (ACTIVE)

### Tests
| Scénario | Résultat attendu |
|---|---|
| Premier webhook `invoice.payment_succeeded` | 🟢 Paiement inséré normalement |
| Retry Stripe (même `payment_intent`) | 🟢 200 OK immédiat — paiement non dupliqué |
| `payment_intent` NULL (cas rare) | 🟢 Vérification sautée — INSERT tenté (UNIQUE index protège) |

### Résultat : 🟢 CORRIGÉ

---

## 3. F3 — `ProtectedRoute` vide (Manager accessible sans authentification)

### Problème
`ProtectedRoute.tsx` retournait `<>{children}</>` inconditionnellement — n'importe qui pouvait accéder à toutes les pages Manager sans être connecté. La protection d'authentification était absente.

### Correction
Implémentation de la vérification d'authentification via `useAuth()` (hook de `AuthContext`) :

```typescript
// Avant
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>  // ← Aucune vérification
}

// Après
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />           // Attendre la résolution de session Supabase
  if (!user) return <Navigate to="/login" replace />  // Rediriger si non connecté
  return <>{children}</>
}
```

Le spinner évite le flash de contenu protégé pendant la vérification initiale de session (`loading` est `true` jusqu'à la résolution de `supabase.auth.getSession()`).

### Fichier modifié
`manager/src/components/auth/ProtectedRoute.tsx`

### Comportement
| Scénario | Résultat attendu |
|---|---|
| Utilisateur non connecté → accès `/` | 🟢 Redirigé vers `/login` |
| Utilisateur connecté → accès `/` | 🟢 Dashboard affiché |
| Chargement initial (session en cours de vérification) | 🟢 Spinner centré, pas de flash |
| Navigation vers routes publiques (`/login`, `/reset-password`) | 🟢 Accessibles sans auth |

### Résultat : 🟢 CORRIGÉ

---

## Build final

| Cible | Résultat |
|---|---|
| Site principal | 🟢 555ms — 0 erreur |
| Manager | 🟢 2.30s — 0 erreur TypeScript |
| Warning chunk size Manager (vendor-pdf) | 🟠 Non critique — connu depuis Sprint 10.5 |

---

## État des Edge Functions après Sprint 10.6

| Fonction | Version | verify_jwt | Corrections Sprint 10.6 |
|---|---|---|---|
| `stripe-create-checkout` | v10 | `true` | F1 montant DB uniquement |
| `stripe-webhook` | v16 | `false` | F2 idempotence invoice.payment_succeeded |
| `stripe-create-subscription` | v8 | `true` | — (inchangé) |
| `stripe-cancel-subscription` | v8 | `true` | — (inchangé) |

---

## Bilan global des sprints 10.4 → 10.6

| # | Problème | Sprint | Statut |
|---|---|---|---|
| F1 | `stripe-create-checkout` : montant frontend | 10.6 | 🟢 CORRIGÉ |
| F2 | `invoice.payment_succeeded` : pas d'idempotence | 10.6 | 🟢 CORRIGÉ |
| F3 | `ProtectedRoute` vide | 10.6 | 🟢 CORRIGÉ |
| F4 | Checkout Session ouverte post-annulation | 10.5 | 🟢 CORRIGÉ |
| W1 | RLS trop permissive sur `subscriptions` | 10.5 | 🟢 CORRIGÉ |
| W2 | `invoice.payment_failed` écrase 'cancelled' | 10.5 | 🟢 CORRIGÉ |
| W3 | `trial_will_end` non géré | 10.5 | 🟠 DOCUMENTÉ |
| W4 | Absence vérification IDOR | 10.5 | 🟢 CORRIGÉ |

**Verdict final : 🟢 0 FAIL — ABONNEMENTS PRÊTS POUR AUDIT PRODUCTION**

---

*SPRINT 10.6 TERMINÉ — TOUS LES FAIL CRITIQUES CORRIGÉS — AUCUN DÉPLOIEMENT PRODUCTION*
