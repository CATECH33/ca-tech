# Livraison — CA-TECH

## Vue d'ensemble
Procédure de livraison finale au client après validation du projet.

## Pré-requis avant livraison
- Validation écrite du client (email ou document signé)
- Tous les tests passés (fonctionnels, responsive, performance)
- Score Lighthouse > 90 sur les 4 métriques
- Aucun lien cassé
- Contenu définitif intégré
- Solde facturé

## Livraison — Sites web

### Mise en ligne
1. Configurer le domaine et l'hébergement du client
2. Installer le certificat SSL (HTTPS)
3. Déployer le code en production
4. Configurer les DNS (A record, CNAME)
5. Vérifier le fonctionnement complet sur le domaine final
6. Configurer les redirections (301 si migration)
7. Soumettre le sitemap à Google Search Console
8. Vérifier l'indexation

### Checklist mise en ligne
- [ ] HTTPS actif et forcé
- [ ] Toutes les pages accessibles
- [ ] Formulaires fonctionnels (envoi d'emails testé)
- [ ] Images correctement chargées
- [ ] Responsive vérifié sur mobile réel
- [ ] Favicon en place
- [ ] Google Analytics / GA4 connecté
- [ ] Google Search Console configurée
- [ ] Sitemap XML soumis
- [ ] robots.txt vérifié
- [ ] Open Graph testé (partage sur réseaux sociaux)
- [ ] Mentions légales et politique de confidentialité présentes
- [ ] Cookies banner RGPD si nécessaire
- [ ] Sauvegardes automatiques configurées
- [ ] Emails transactionnels testés (si applicable)

### Fichiers remis au client
- Accès hébergement (identifiants)
- Accès back-office / CMS (si applicable)
- Accès Google Analytics et Search Console
- Documentation technique
- Guide d'utilisation du back-office

## Livraison — Design / Logo

### Dossier de livraison
```
NomClient-Livraison/
├── Logo/
│   ├── SVG/
│   │   ├── logo-principal.svg
│   │   ├── logo-monochrome-blanc.svg
│   │   └── logo-monochrome-noir.svg
│   ├── PNG/
│   │   ├── logo-principal@1x.png
│   │   ├── logo-principal@2x.png
│   │   ├── logo-principal@3x.png
│   │   └── ...
│   ├── PDF/
│   │   └── logo-print-cmyk.pdf
│   └── Favicon/
│       ├── favicon.ico
│       └── apple-touch-icon.png
├── Charte-Graphique/
│   └── charte-graphique.pdf
└── Sources/
    └── fichiers-source.fig (ou .ai)
```

### Checklist design
- [ ] Tous les formats exportés (SVG, PNG, PDF)
- [ ] Versions monochrome incluses
- [ ] Favicon fourni
- [ ] Charte graphique PDF complète
- [ ] Fichiers sources éditables remis
- [ ] Polices utilisées listées (avec liens de téléchargement)

## Formation client

### Contenu de la formation
- Navigation dans le back-office
- Ajout / modification de contenu (textes, images)
- Gestion des pages et menus
- Gestion des produits (e-commerce)
- Consultation des statistiques
- Bonnes pratiques de sécurité (mots de passe, mises à jour)

### Format
- Visioconférence enregistrée (30-60 min)
- Document PDF récapitulatif
- Vidéo tutoriel si demandé (supplément)

## Support post-livraison

### Inclus (30 jours)
- Corrections de bugs liés au développement
- Ajustements mineurs (textes, images)
- Assistance technique par email
- Réponse sous 24h ouvrées

### Non inclus (devis séparé)
- Nouvelles fonctionnalités
- Refonte de pages
- Ajout de contenu massif
- Formation supplémentaire

### Contrats de maintenance (optionnel)
| Formule | Contenu | Tarif indicatif |
|---------|---------|-----------------|
| Essentiel | Mises à jour + sauvegardes + monitoring | Sur devis |
| Confort | Essentiel + 2h modifications/mois | Sur devis |
| Premium | Confort + support prioritaire + SEO mensuel | Sur devis |

## Archivage
- Code source archivé sur Git (accès remis au client si demandé)
- Fichiers design archivés sur cloud CA-TECH pendant 2 ans
- Sauvegardes du site conservées 90 jours après livraison
