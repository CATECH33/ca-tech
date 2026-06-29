# CA-TECH

[![Tests](https://github.com/CATECH33/ca-tech/actions/workflows/test.yml/badge.svg)](https://github.com/CATECH33/ca-tech/actions/workflows/test.yml)

Site web & back-office de CA-TECH — agence web & design (Paris · Lyon · Dijon · Troyes).

## Stack

- **Front** : HTML/CSS/JS vanilla, design system maison (dark theme, #0066FF)
- **API** : Vercel serverless functions (Node.js)
- **Base de données** : Supabase (PostgreSQL)
- **Paiements** : Stripe Checkout
- **Notifications** : Resend (email) + Telegram
- **IA** : Loïc — assistant conversationnel pour devis, leads, CRM

## Structure

```
/                   → site public (index.html, tarifs, FAQ, pages SEO locales…)
/devis              → formulaire de devis conversationnel (Loïc IA)
/admin/             → back-office CA-TECH Manager
/admin/loic-ia/     → tableau de bord Loïc IA
/api/               → serverless functions Vercel
```

## Tests

```bash
npm test                        # toutes les suites (~100s)
npm test -- https://staging.ca-tech.fr   # contre un autre environnement
npm run test:payment            # parcours paiement Stripe (nécessite SUPABASE_SERVICE_ROLE_KEY)
```

### Suites incluses dans `npm test`

| Suite | Fichier | Assertions |
|---|---|---|
| Unitaires API | `test-all.js` | 58 |
| Site principal | `test-site-principal.js` | 106 |
| Formulaire /devis | `test-devis-live.js` | 32 |
| Admin — Dashboard | `test-admin-dashboard.js` | 27 |
| Admin — Devis | `test-admin-devis.js` | 29 |
| Admin — Pages | `test-admin-pages.js` | 80 |
| Loïc IA | `test-loic-ia.js` | 66 |

**Total : 398 assertions · 🟢 TOUT PASS** — CI vérifié à chaque push

## Déploiement

Push sur `master` → déploiement automatique Vercel.

## Variables d'environnement (Vercel)

| Variable | Usage |
|---|---|
| `SUPABASE_URL` | URL projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `RESEND_API_KEY` | API Resend (emails) |
| `TELEGRAM_BOT_TOKEN` | Bot Telegram |
| `TELEGRAM_CHAT_ID` | Chat ID Telegram |
