# Workflow Site Web — CA-TECH

## Vue d'ensemble
Processus de développement pour sites vitrines, e-commerce et landing pages.

## Phases

### Phase 1 — Cadrage (Semaine 1)
- Analyse du brief client
- Définition de l'architecture du site (arborescence)
- Choix de la stack technique selon le besoin :
  - HTML/CSS/JS vanilla → sites simples, landing pages
  - WordPress → sites avec gestion de contenu client
  - Next.js + Tailwind → sites complexes, haute performance
  - Shopify / WooCommerce → e-commerce
- Rédaction des spécifications techniques
- Validation du périmètre avec le client

### Phase 2 — Design UI/UX (Semaine 2-3)
- Wireframes basse fidélité (structure des pages)
- Validation des wireframes
- Maquettes haute fidélité desktop + mobile
- Prototype interactif (navigation entre pages)
- Présentation au client
- Intégration des retours (1-2 tours)
- Validation finale des maquettes

### Phase 3 — Développement (Semaine 3-5)
- Setup du projet et environnement de développement
- Développement front-end :
  - Structure HTML sémantique
  - Styles CSS (mobile first)
  - Interactions JavaScript
  - Animations et transitions
- Développement back-end (si applicable) :
  - CMS / base de données
  - Formulaires et envoi d'emails
  - API et intégrations
- Intégration du contenu (textes, images, vidéos)
- Responsive testing (mobile, tablette, desktop)

### Phase 4 — Optimisation (Semaine 5)
- Performance :
  - Optimisation des images (WebP, lazy loading)
  - Minification CSS/JS
  - Audit Lighthouse (objectif > 90)
- SEO :
  - Balises meta complètes
  - Schema.org
  - Sitemap XML + robots.txt
  - Open Graph + Twitter Cards
- Accessibilité :
  - Tests WCAG AA
  - Navigation clavier
  - Contraste des couleurs
- Sécurité :
  - HTTPS
  - Headers de sécurité
  - Protection formulaires (honeypot, rate limiting)

### Phase 5 — Tests & Recette (Semaine 6)
- Tests cross-browser (Chrome, Firefox, Safari, Edge)
- Tests responsive sur vrais appareils
- Tests fonctionnels (formulaires, liens, navigation)
- Tests de charge (si site à fort trafic)
- Présentation au client
- Corrections et ajustements
- Validation finale

### Phase 6 — Mise en ligne (voir livraison.md)

## Environnements

| Environnement | Usage | URL type |
|---------------|-------|----------|
| Local | Développement | localhost:3000 |
| Staging | Tests et validation client | staging.client.com |
| Production | Site en ligne | www.client.com |

## Gestion de version
- Git pour tout le code source
- Branches : main (production), staging, develop
- Commits clairs et descriptifs
- Pull requests pour chaque fonctionnalité

## Conventions de code
- Indentation : 2 espaces
- Nommage CSS : BEM ou utility-first (Tailwind)
- Nommage JS : camelCase
- Commentaires pour logique complexe
- Code DRY (composants réutilisables)

## Délais standards

| Type de site | Délai |
|-------------|-------|
| Landing page | 1-2 semaines |
| Site vitrine (5-7 pages) | 3-5 semaines |
| Site vitrine + blog | 4-6 semaines |
| E-commerce (< 50 produits) | 5-8 semaines |
| E-commerce (> 50 produits) | 8-12 semaines |
| Application web sur mesure | 8-16 semaines |
