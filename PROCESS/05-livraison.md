# 05 — Livraison & Mise en Ligne

## Pré-requis
- Validation finale du client reçue (04-validation)
- Solde de la facture encaissé
- Nom de domaine et hébergement prêts
- Tous les accès nécessaires fournis par le client

## Mise en ligne — Sites web

### Procédure de déploiement
1. Backup complet du site existant (si migration/refonte)
2. Déploiement du code en production
3. Configuration du domaine et DNS
4. Activation du certificat SSL
5. Vérification complète post-déploiement
6. Configuration des redirections 301 (si migration)
7. Test de tous les formulaires en production
8. Vérification des emails transactionnels

### Checklist post-déploiement
- [ ] Site accessible sur le domaine final
- [ ] HTTPS actif et forcé (redirection HTTP → HTTPS)
- [ ] Toutes les pages chargent correctement
- [ ] Formulaires envoient les emails
- [ ] Images et médias affichés
- [ ] Responsive vérifié sur mobile réel
- [ ] Favicon visible dans l'onglet
- [ ] Vitesse de chargement correcte
- [ ] Aucune erreur console JavaScript

### Configuration analytics et SEO
- [ ] Google Analytics 4 installé et vérifié
- [ ] Google Search Console configurée
- [ ] Sitemap XML soumis
- [ ] robots.txt en production (indexation activée)
- [ ] Vérification Open Graph (test partage Facebook/LinkedIn)
- [ ] Bannière cookies RGPD fonctionnelle

### Remise des accès au client
- Identifiants hébergement
- Identifiants CMS / back-office
- Accès Google Analytics (email client ajouté)
- Accès Google Search Console
- Documentation des accès (document PDF sécurisé)

## Livraison — Design / Logo

### Dossier remis au client
```
[NomClient]-Livraison/
├── Logo/
│   ├── SVG/
│   ├── PNG/ (1x, 2x, 3x)
│   ├── PDF/ (CMYK print)
│   └── Favicon/
├── Charte-Graphique.pdf
├── Supports/ (flyers, cartes de visite, etc.)
└── Sources/ (fichiers éditables)
```

### Mode de remise
- Lien de téléchargement (Google Drive ou WeTransfer)
- Accès valide 30 jours
- Email récapitulatif avec le contenu du dossier

## Formation client

### Contenu
- Prise en main du back-office (ajouter/modifier du contenu)
- Gestion des images et médias
- Gestion des pages et menus
- Gestion des produits et commandes (e-commerce)
- Consultation des statistiques
- Bonnes pratiques sécurité (mots de passe, mises à jour)

### Format
- Visioconférence enregistrée (30-60 min)
- Guide PDF récapitulatif remis
- Enregistrement vidéo partagé après la session

## Email de livraison
- Confirmer la mise en ligne / remise des fichiers
- Résumer les accès transmis
- Rappeler la période de support inclus (30 jours)
- Remercier le client pour sa confiance
- Inviter à laisser un avis / témoignage
