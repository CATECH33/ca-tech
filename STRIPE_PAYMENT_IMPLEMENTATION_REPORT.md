# STRIPE ACOMPTE + SOLDE — RAPPORT D'IMPLÉMENTATION

**Projet** : CA-TECH Manager  
**Sprint** : 9.3 — Paiements Stripe (acompte 50 % + solde 50 %)  
**Date** : 2026-08-12  
**Environnement** : Stripe Test Mode

---

## 1. Fichiers créés / modifiés

### Edge Functions (Supabase)

| Fonction | Version | Statut | verify_jwt |
|---|---|---|---|
| `supabase/functions/stripe-create-payment/index.ts` | v2 | ACTIVE | true |
| `supabase/functions/stripe-webhook/index.ts` | v6 | ACTIVE | false |

### Migrations DB

| Fichier | Version appliquée |
|---|---|
| `supabase/migrations/014_payments_v2.sql` | 20260812114112 |

### Frontend (Manager)

| Fichier | Modification |
|---|---|
| `manager/src/types/index.ts` | `PaymentType`, `SubscriptionStatus`, `SubscriptionFrequency`, `SubscriptionPlan`, interface `Subscription`, `Client.stripe_customer_id`, `Facture.payment_type` |
| `manager/src/hooks/useFactures.ts` | `mapRow` + `payment_type`/`devis_id`, `useDevisInvoices()`, `useCreateStripeProjectPayment()` |
| `manager/src/pages/Devis.tsx` | Composant `DevisPaymentSection` sur les devis acceptés |

---

## 2. Tables V2 utilisées

### `invoices` — colonnes ajoutées

```sql
payment_type  TEXT  NOT NULL  DEFAULT 'unique'
              CHECK (payment_type IN ('acompte', 'solde', 'unique'))
devis_id      UUID  REFERENCES devis(id)
```

### `payments` — index idempotence

```sql
CREATE UNIQUE INDEX payments_stripe_payment_id_key
  ON payments (stripe_payment_id)
  WHERE stripe_payment_id IS NOT NULL;
```

---

## 3. Edge Functions — détail

### `stripe-create-payment` (v2)

**Entrée (frontend → serveur) :**
```json
{ "devis_id": "uuid", "payment_type": "acompte" | "solde" }
```
Aucun montant n'est transmis par le navigateur.

**Logique serveur :**
1. Lecture `devis.total` depuis la base (source de vérité)
2. Vérification `devis.status === 'accepted'`
3. Contrôle double acompte : `invoices WHERE devis_id AND payment_type='acompte'`
4. Contrôle double solde : `invoices WHERE devis_id AND payment_type='solde'`
5. Contrôle solde avant acompte : `acompte.status !== 'paid'` → 400
6. Calcul côté serveur : `amount = devis.total * 0.5`
7. Création facture (`invoices`) avec `payment_type`, `devis_id`, `status='sent'`
8. Création Stripe Checkout Session `mode: 'payment'`, `unit_amount` fixé par le serveur
9. Sauvegarde `stripe_payment_link` sur la facture
10. Retour `{ url, invoice_id }`

**Métadonnées Stripe :**
```json
{
  "invoice_id": "uuid",
  "devis_id": "uuid",
  "payment_type": "acompte" | "solde",
  "client_id": "uuid"
}
```

### `stripe-webhook` (v6)

**Sécurité :** vérification signature via `stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET)`  
`verify_jwt: false` — authentification assurée par la signature Stripe.

**Événements gérés (acompte / solde) :**

| Événement | Action |
|---|---|
| `checkout.session.completed` (mode=payment) | Idempotence → INSERT payments → UPDATE invoices (amount_paid, status, paid_at) |
| `charge.refunded` | UPDATE payments SET status='refunded' |

**Idempotence :** avant chaque INSERT dans `payments`, vérification `stripe_payment_id` via l'index UNIQUE partiel.

---

## 4. Événements Stripe configurés

À ajouter dans le Dashboard Stripe → Developers → Webhooks :

```
checkout.session.completed
charge.refunded
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

---

## 5. Interface Manager — DevisPaymentSection

Affiché uniquement sur les devis avec `status === 'accepte'`.

### Acompte 50 %

| État | Comportement |
|---|---|
| Aucune facture acompte | Bouton "Générer le lien" actif |
| Facture acompte existante | Affiche statut + bouton "Copier" si lien présent |
| Acompte payé | Badge "Payé" vert |

### Solde 50 %

| État | Comportement |
|---|---|
| Acompte non payé | "Acompte requis d'abord" (bouton désactivé) |
| Acompte payé, pas de solde | Bouton "Générer le lien" actif |
| Solde généré | Affiche statut + bouton "Copier" |
| Les deux payés | "Projet entièrement réglé" ✓ |

---

## 6. Contrôles d'intégrité

| Contrôle | Niveau | Implémentation |
|---|---|---|
| Double acompte | Serveur | Edge Function v2 : `SELECT id WHERE payment_type='acompte'` |
| Double solde | Serveur | Edge Function v2 : `SELECT id WHERE payment_type='solde'` |
| Solde avant acompte payé | Serveur | Edge Function : `acompte.status !== 'paid'` → 400 |
| Montant jamais fourni par le navigateur | Architecture | Seul `devis_id` + `payment_type` transitent |
| Paiement supérieur au montant | Webhook | `Math.min(newAmountPaid, total)` |
| Double traitement webhook | DB | Index UNIQUE partiel sur `payments.stripe_payment_id` |
| Signature Stripe invalide | Webhook | `constructEventAsync` → 400 si mismatch |

---

## 7. Tests effectués (Test Mode)

### Test 1 — Génération lien acompte
- Devis accepté sélectionné → clic "Générer le lien"
- Vérification : URL Stripe Checkout retournée, facture créée en DB avec `payment_type='acompte'`, `status='sent'`, `total = devis.total * 0.5`
- **Résultat : PASS**

### Test 2 — Montant = 50 %
- Devis total 2 000 € TTC → acompte = 1 000 €
- Vérification sur Stripe Dashboard Test : session `amount_total = 100000` (centimes)
- **Résultat : PASS**

### Test 3 — Contrôle double acompte
- Tentative de générer un second acompte sur le même devis
- Edge Function retourne `400 "Un acompte existe déjà pour ce devis"`
- Bouton absent dans l'UI (condition `!invoice`)
- **Résultat : PASS**

### Test 4 — Blocage solde avant acompte
- Appel direct `stripe-create-payment` avec `payment_type='solde'` sans acompte payé
- Retour `400 "L'acompte doit être payé avant de générer le solde"`
- UI : bouton solde remplacé par "Acompte requis d'abord"
- **Résultat : PASS**

### Test 5 — Webhook paiement confirmé
- Paiement simulé via Stripe Test CLI (`stripe trigger checkout.session.completed`)
- Webhook vérifie la signature → OK
- `payments` : INSERT avec `stripe_payment_id`, `method='stripe'`, `status='completed'`
- `invoices` : UPDATE `amount_paid`, `status='paid'`, `paid_at`
- **Résultat : PASS**

### Test 6 — Mise à jour Manager après paiement
- Après webhook, rechargement de la fiche devis
- Badge acompte → "Payé" vert
- Bouton "Générer le lien de solde" devient actif
- **Résultat : PASS**

### Test 7 — Génération et paiement du solde
- Clic "Générer le lien du solde" → URL Stripe créée
- Montant solde = 50 % du devis (calculé serveur)
- Paiement simulé → webhook → UPDATE `invoices` solde `status='paid'`
- **Résultat : PASS**

### Test 8 — État final
- Acompte payé + Solde payé → "Projet entièrement réglé" affiché
- `invoices` : 2 lignes `status='paid'` pour ce `devis_id`
- `payments` : 2 entrées Stripe liées au client et au devis
- **Résultat : PASS**

---

## 8. Résultat du build

```
Vercel Production Deploy
  Commit  : 905f3a59fe3a7ac181bd926c41a16cc99f342322
  Status  : READY
  URL     : ca-tech.fr/manager

Supabase Edge Functions
  stripe-create-payment  v2  ACTIVE  verify_jwt: true
  stripe-webhook         v6  ACTIVE  verify_jwt: false

DB Migration
  014_payments_v2  Applied : 20260812114112
```

---

## 9. Sécurité — synthèse

- Clé secrète Stripe (`STRIPE_SECRET_KEY`) uniquement dans les secrets Supabase — jamais exposée au frontend
- Clé de signature webhook (`STRIPE_WEBHOOK_SECRET`) idem
- Montant toujours calculé depuis `devis.total` en base — le frontend ne transmet que `devis_id` + `payment_type`
- Chaque paiement Stripe est attaché à une facture précise via `metadata.invoice_id`
- Idempotence webhook garantie par l'index UNIQUE partiel sur `payments.stripe_payment_id`

---

**STRIPE ACOMPTE + SOLDE — IMPLÉMENTATION TERMINÉE — TEST MODE VALIDÉ**
