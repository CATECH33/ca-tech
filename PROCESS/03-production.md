# 03 — Production

## Lancement

### Kick-off (Jour 1)
- Réunion de lancement avec le client (30-45 min)
- Présentation du planning détaillé
- Collecte des accès nécessaires (hébergement, domaine, CMS existant)
- Collecte du contenu client (textes, images, logo, charte)
- Définition du point de contact principal côté client
- Création de l'espace de suivi projet

### Setup technique
- Création du repo Git
- Mise en place de l'environnement de développement
- Configuration du serveur de staging
- Installation des outils et dépendances

## Phase Design

### Wireframes (Semaine 1)
- Création des wireframes basse fidélité pour chaque page
- Validation de la structure et de l'arborescence
- Retours client sous 3 jours ouvrés
- Ajustements si nécessaire

### Maquettes (Semaine 2)
- Création des maquettes haute fidélité desktop
- Déclinaison mobile
- Respect de la charte graphique client (ou création si incluse)
- Présentation au client en visio
- Tour 1 de révisions
- Tour 2 si nécessaire
- Validation finale des maquettes (accord écrit)

## Phase Développement

### Front-end (Semaine 3-4)
- Intégration HTML sémantique
- Styles CSS (mobile first)
- Composants réutilisables
- Animations et interactions
- Responsive design (tests continus)

### Back-end (si applicable, Semaine 4-5)
- Configuration CMS / base de données
- Formulaires et envoi d'emails
- Intégrations API
- E-commerce (produits, panier, paiement)
- Espace client / authentification

### Contenu (en parallèle)
- Intégration des textes définitifs
- Optimisation et compression des images
- Création des pages (si contenu fourni par le client)
- Rédaction SEO (si incluse dans le devis)

## Suivi pendant la production

### Points d'avancement
- Point hebdomadaire avec le client (15-30 min visio ou email)
- Accès au staging pour suivi en temps réel
- Compte-rendu écrit après chaque point

### Gestion des imprévus
- Toute demande hors périmètre → chiffrage complémentaire
- Retard côté client (contenu, retours) → planning décalé d'autant
- Bug bloquant découvert → correction prioritaire

### Livrables intermédiaires
- Wireframes validés → passage aux maquettes
- Maquettes validées → passage au développement
- Développement terminé → passage aux tests (04-validation)

## Bonnes pratiques internes
- Commit Git quotidien minimum
- Code review avant merge sur staging
- Nommage des fichiers cohérent
- Documentation du code complexe
- Sauvegarde quotidienne automatique
- Ne jamais travailler directement en production
