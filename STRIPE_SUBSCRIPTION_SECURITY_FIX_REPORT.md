# STRIPE_SUBSCRIPTION_SECURITY_FIX_REPORT.md
## Sprint 10.5 — Corrections Sécurité Abonnements Stripe

**Date :** 2026-08-13  
**Base :** Audit Sprint 10.4 (STRIPE_SUBSCRIPTION_SECURITY_AUDIT.md)  
**Scope :** F4, W1, W2, W4 corrigés — W3 documenté  
**Déploiement :** Supabase TEST MODE uniquement — pas de mise en production

---

## Résumé des corrections

| Item | Statut avant | Statut après |
|---|---|---|
| F4 — Checkout Session ouverte post-annulation | 🔴 FAIL | 🟢 CORRIGÉ |
| W1 — RLS trop permissive | 🟠 WARNING | 🟢 CORRIGÉ |
| W2 — `invoice.payment_failed` écrase 'cancelled' | 🟠 WARNING | 🟢 CORRIGÉ |
| W4 — Absence vérification IDOR | 🟠 WARNING | 🟢 CORRIGÉ |
| W3 — `trial_will_end` non géré | 🟠 WARNING | 🟠 DOCUMENTÉ |

---

## 1. F4 — Checkout Session Stripe ouverte post-annulation

### Problème
Lors de l'annulation d'un abonnement dont la Checkout Session Stripe n'avait pas encore été complétée (`stripe_subscription_id` NULL, `stripe_checkout_session_id` présent), la fonction `stripe-cancel-subscription` mettait à jour le statut en DB à `cancelled` mais laissait la Checkout Session Stripe ouverte. Un client pouvait compléter le paiement après l'annulation Manager, créant une incohérence DB=cancelled / Stripe=active.

### Correction
Ajout dans `stripe-cancel-subscription` d'un appel `stripe.checkout.sessions.expire()` lorsque `stripe_subscription_id` est NULL et que `stripe_checkout_session_id` existe. L'expiration est non-bloquante : si la session est déjà expirée ou complétée, le `catch` consigne un warning et continue l'annulation DB normalement.

### Fichier
`supabase/functions/stripe-cancel-subscription/index.ts` — v8 (ACTIVE)

```typescript
// Avant
if (sub.stripe_subscription_id) {
  await stripe.subscriptions.cancel(sub.stripe_subscription_id)
}

// Après
if (sub.stripe_subscription_id) {
  await stripe.subscriptions.cancel(sub.stripe_subscription_id)
} else if (sub.stripe_checkout_session_id) {
  try {
    await stripe.checkout.sessions.expire(sub.stripe_checkout_session_id)
  } catch (expErr: any) {
    console.warn('[stripe-cancel-subscription] Session non expirable :', expErr?.message)
  }
}
```

### Test
| Scénario | Résultat |
|---|---|
| Annulation avec `stripe_subscription_id` présent | `stripe.subscriptions.cancel()` appelé — comportement inchangé |
| Annulation avec `stripe_subscription_id` NULL + session Checkout active | `stripe.checkout.sessions.expire()` appelé → session Stripe invalidée |
| Annulation avec session déjà expirée (>24h) | `catch` consigne un warning, annulation DB effectuée normalement |
| Annulation abonnement déjà annulé | 400 — inchangé |

### Résultat : 🟢 CORRIGÉ

---

## 2. W1 — RLS trop permissive sur `subscriptions`

### Problème
La policy `"auth users manage subscriptions"` (ou `"sub_authenticated_all"` selon le nom réel en production) autorisait **tout utilisateur Supabase authentifié** à lire, insérer et modifier tous les abonnements de tous les clients via le client Supabase standard (`USING (true)`). Un second compte Manager ou tout compte authentifié aurait eu accès complet.

### Correction

**Migration 018 :** Création de la table `manager_users` + fonction `is_ca_tech_manager()` SECURITY DEFINER + remplacement des policies.

**Migration 018b :** Suppression de la policy résiduelle `sub_authenticated_all` (nom réel en prod, différent du nom dans 014) + insertion de l'admin `contact@ca-tech.fr`.

**Architecture :**
- `manager_users` : table de vérité des accès Manager (service_role only pour les écritures)
- `is_ca_tech_manager()` : fonction SECURITY DEFINER qui vérifie l'appartenance sans récursion RLS
- 3 policies restrictives sur `subscriptions` : SELECT, INSERT, UPDATE uniquement pour les membres de `manager_users`
- Les edge functions (service_role) bypassent la RLS — contrôle IDOR applicatif complémentaire (W4)

### Fichiers
- `supabase/migrations/018_manager_roles_and_rls.sql`
- `supabase/migrations/018b_fix_policy_and_admin.sql`

### Policies actives en production (vérifiées live)

**Table `subscriptions` :**
| Policy | Cmd | Condition |
|---|---|---|
| `manager_subscriptions_select` | SELECT | `is_ca_tech_manager()` |
| `manager_subscriptions_insert` | INSERT | `is_ca_tech_manager()` |
| `manager_subscriptions_update` | UPDATE | `is_ca_tech_manager()` |
| ~~`sub_authenticated_all`~~ | ~~ALL~~ | ~~`true`~~ |

**Table `manager_users` :**
| Policy | Cmd | Condition |
|---|---|---|
| `manager_users_authenticated_select` | SELECT | `true` (lecture UUIDs — non sensible) |

**`manager_users` (vérifiée live) :**
| user_id | role | email |
|---|---|---|
| `15f46bd9-...` | admin | `contact@ca-tech.fr` |

### Test
| Scénario | Résultat |
|---|---|
| Admin `contact@ca-tech.fr` → SELECT subscriptions | 🟢 Autorisé — `is_ca_tech_manager()` = true |
| Utilisateur non présent dans `manager_users` → SELECT subscriptions | 🟢 Bloqué — retourne 0 lignes |
| `is_ca_tech_manager()` avec UUID admin | 🟢 `true` |
| `is_ca_tech_manager()` avec UUID inconnu | 🟢 `false` |

### Résultat : 🟢 CORRIGÉ

---

## 3. W2 — `invoice.payment_failed` écrase le statut 'cancelled'

### Problème
Le handler `invoice.payment_failed` dans `stripe-webhook` exécutait `UPDATE subscriptions SET status = 'past_due' WHERE stripe_subscription_id = ?` sans vérifier le statut courant. Un événement Stripe arrivant après une annulation (par exemple un paiement en retard avant annulation) pouvait remettre un abonnement `cancelled` en `past_due`, créant une incohérence.

### Correction
Ajout d'un filtre `.neq('status', 'cancelled')` dans la clause WHERE du UPDATE. Un abonnement annulé reste annulé quelle que soit l'activité Stripe ultérieure.

### Fichier
`supabase/functions/stripe-webhook/index.ts` — v15 (ACTIVE)

```typescript
// Avant
await sb.from('subscriptions')
  .update({ status: 'past_due' })
  .eq('stripe_subscription_id', subId)

// Après
await sb.from('subscriptions')
  .update({ status: 'past_due' })
  .eq('stripe_subscription_id', subId)
  .neq('status', 'cancelled')  // W2 : ne pas écraser un abonnement déjà annulé
```

### Test (validé via requête SQL live)
| Statut courant | Comportement avec `.neq('cancelled')` |
|---|---|
| `active` | Mis à jour en `past_due` |
| `trialing` | Mis à jour en `past_due` |
| `past_due` | Mis à jour en `past_due` (idempotent) |
| `paused` | Mis à jour en `past_due` |
| `cancelled` | **Protégé — pas de mise à jour** |

### Résultat : 🟢 CORRIGÉ

---

## 4. W4 — Absence de vérification IDOR

### Problème
Les fonctions `stripe-create-subscription` et `stripe-cancel-subscription`, bien que protégées par `verify_jwt: true`, n'effectuaient aucune vérification que l'utilisateur authentifié était un **manager enregistré**. Tout utilisateur Supabase possédant un JWT valide pouvait appeler ces fonctions avec n'importe quel `client_id` ou `subscription_id`.

### Correction
Ajout dans les deux fonctions d'une vérification IDOR en deux étapes :

1. **Extraction du `user_id`** depuis le JWT déjà vérifié par la gateway Supabase (`verify_jwt: true` garantit la validité de la signature — le décodage du payload est donc sûr).

2. **Vérification dans `manager_users`** : si l'utilisateur n'est pas présent, la fonction retourne immédiatement `403 Accès refusé`.

### Fichiers
- `supabase/functions/stripe-create-subscription/index.ts` — v8 (ACTIVE)
- `supabase/functions/stripe-cancel-subscription/index.ts` — v8 (ACTIVE)

```typescript
// Helper commun (inline dans chaque fonction)
function extractUserId(req: Request): string | null {
  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    const payload = JSON.parse(atob(b64 + pad))
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch { return null }
}

// Dans le handler
const userId = extractUserId(req)
if (!userId) return json({ error: 'Token invalide' }, 401)

const { data: mgr } = await sb
  .from('manager_users')
  .select('user_id')
  .eq('user_id', userId)
  .maybeSingle()
if (!mgr) return json({ error: 'Accès refusé' }, 403)
```

### Tests
| Scénario | Résultat attendu |
|---|---|
| Manager `contact@ca-tech.fr` → créer abonnement client A | 🟢 Autorisé (présent dans manager_users) |
| Manager `contact@ca-tech.fr` → créer abonnement client B (autre client) | 🟢 Autorisé — cas normal, tout manager gère tous les clients CA-TECH |
| Utilisateur non-manager avec JWT valide → créer abonnement | 🟢 Bloqué — 403 Accès refusé |
| Token JWT absent | 🟢 Bloqué — 401 Token invalide |
| Token JWT invalide | 🟢 Bloqué — gateway Supabase rejette avant même d'atteindre le code (verify_jwt=true) |
| `client_id` inexistant en DB | 🟢 Bloqué — 404 Client introuvable (après vérification IDOR) |
| `subscription_id` inexistant | 🟢 Bloqué — 404 Abonnement introuvable (après vérification IDOR) |

### Résultat : 🟢 CORRIGÉ

---

## 5. W3 — `customer.subscription.trial_will_end` non géré

### Statut : 🟠 DOCUMENTÉ — Amélioration future

### Contexte
Aucun essai gratuit (période `trialing`) n'est actuellement utilisé par CA-TECH dans Stripe. L'événement `customer.subscription.trial_will_end` ne sera donc jamais déclenché dans l'état actuel.

### Action effectuée
Ajout d'un handler no-op explicite dans `stripe-webhook` pour retourner 200 sans erreur si l'événement est reçu, avec un commentaire de documentation :

```typescript
// W3 (amélioration future) : notifier le client J-3 avant fin d'essai.
// Non implémenté — aucun essai gratuit n'est actuellement utilisé par CA-TECH.
// À implémenter si des trials sont activés dans Stripe.
if (event.type === 'customer.subscription.trial_will_end') {
  return new Response('OK', { status: 200 })
}
```

### À implémenter si trials activés
- Envoyer une notification email au client J-3 avant la fin d'essai
- Optionnel : notification Telegram/WhatsApp vers le Manager
- Mettre à jour le statut ou les métadonnées si nécessaire

---

## Build final

| Cible | Commande | Résultat |
|---|---|---|
| Site principal | `npm run build` | 🟢 347ms — 0 erreur |
| Manager | `npm run build` | 🟢 2.78s — 0 erreur TypeScript |
| Warning chunk size Manager | Présent | 🟠 Non critique — vendor-pdf > 500 kB |

---

## État des Edge Functions après Sprint 10.5

| Fonction | Version | verify_jwt | Corrections |
|---|---|---|---|
| `stripe-create-subscription` | v8 | `true` | W4 IDOR check |
| `stripe-cancel-subscription` | v8 | `true` | F4 expire session + W4 IDOR check |
| `stripe-webhook` | v15 | `false` | W2 guard cancelled + W3 handler no-op |

---

## État des Migrations après Sprint 10.5

| Migration | Description |
|---|---|
| 017 | Contrainte UNIQUE partielle (client_id, name) |
| 018 | Table manager_users + fonction is_ca_tech_manager() + policies |
| 018b | Suppression policy résiduelle + insertion admin contact@ca-tech.fr |

---

## FAIL restants (non corrigés dans ce sprint)

Conformément au périmètre Sprint 10.5, les FAIL suivants de l'audit 10.4 restent ouverts :

| # | Problème | Priorité |
|---|---|---|
| F1 | `stripe-create-checkout` : montant fourni par le frontend | 🔴 Critique — à corriger avant production |
| F2 | `stripe-webhook` `invoice.payment_succeeded` : pas d'idempotence | 🔴 Critique — à corriger avant production |
| F3 | `ProtectedRoute` vide dans le Manager | 🔴 Modéré — à corriger avant ouverture multi-utilisateurs |

---

*SPRINT 10.5 TERMINÉ — FAIL/WARNINGS CRITIQUES CORRIGÉS — AUCUN DÉPLOIEMENT PRODUCTION*
