# Intégrations CA-TECH

## Formulaire de contact
- **Service** : Resend ou EmailJS
- **Rôle** : Envoyer les demandes de devis par email
- **Config** : Variable d'environnement `RESEND_API_KEY`

## Analytiques
- **Service** : Google Analytics 4
- **Rôle** : Suivi du trafic, conversions, comportement visiteurs
- **Config** : Variable `GA_MEASUREMENT_ID`

## SEO & Search Console
- **Service** : Google Search Console
- **Rôle** : Suivi des positions, indexation, erreurs crawl
- **Action** : Soumettre sitemap.xml après mise en ligne

## Hébergement & Déploiement
- **Service** : Vercel
- **Rôle** : Déploiement automatique depuis GitHub
- **Config** : Projet connecté au repo GitHub CA-TECH

## Base de données
- **Service** : Supabase
- **Rôle** : Stockage contacts, projets, articles, applications
- **Config** : Variables `SUPABASE_URL` + `SUPABASE_ANON_KEY`

## CMS (optionnel, Phase 2)
- **Service** : Sanity.io ou Notion API
- **Rôle** : Gestion du contenu blog sans code
- **Config** : Variable `SANITY_PROJECT_ID`

## Paiement (Phase 4+)
- **Service** : Stripe
- **Rôle** : Paiement en ligne pour services et formations
- **Config** : Variables `STRIPE_PUBLIC_KEY` + `STRIPE_SECRET_KEY`

## Calendrier / Réservation (Phase 4)
- **Service** : Cal.com (open source) ou Calendly
- **Rôle** : Prise de rendez-vous en ligne
- **Config** : Intégration iframe ou API

## IA (Phase 3+)
- **Service** : OpenAI API / Anthropic API
- **Rôle** : Fonctionnalités IA dans les applications
- **Config** : Variables `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`

---

## Variables d'environnement (.env)

```env
# Base de données
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Email
RESEND_API_KEY=

# Analytiques
GA_MEASUREMENT_ID=

# IA
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Paiement
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

> ⚠️ Ne jamais committer le fichier `.env`. Ajouter au `.gitignore`.
