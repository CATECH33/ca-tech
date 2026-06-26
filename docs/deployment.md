# Déploiement CA-TECH

## Stack de déploiement
- **Hébergement** : Vercel
- **Repo** : GitHub (branche `main` = production)
- **Framework** : Next.js (recommandé) ou Astro
- **Domaine** : ca-tech.fr (à configurer sur Vercel)

---

## Workflow de déploiement

### Développement local
```bash
# Installer les dépendances
npm install

# Lancer en local
npm run dev

# Build de test
npm run build
```

### Mise en production
```
1. Push sur branche main (ou merge d'une PR)
2. Vercel détecte le push automatiquement
3. Build + déploiement automatique (~2 min)
4. URL de preview générée pour chaque PR
5. Déploiement en production sur merge main
```

---

## Configuration Vercel

### Variables d'environnement à configurer
Aller dans : Vercel Dashboard > Settings > Environment Variables

| Variable | Environnement |
|----------|---------------|
| SUPABASE_URL | Production + Preview |
| SUPABASE_ANON_KEY | Production + Preview |
| RESEND_API_KEY | Production |
| GA_MEASUREMENT_ID | Production |

### Domaine personnalisé
```
1. Vercel Dashboard > Domains
2. Ajouter : ca-tech.fr et www.ca-tech.fr
3. Configurer les DNS chez le registrar :
   - A record : @ → 76.76.21.21
   - CNAME : www → cname.vercel-dns.com
```

---

## Checklist avant mise en ligne

### Performance
- [ ] Score Lighthouse > 90 (Performance, SEO, Accessibilité)
- [ ] Images en format WebP
- [ ] Fonts optimisées (next/font)
- [ ] Pas de layout shift (CLS < 0.1)

### SEO
- [ ] Balises meta title + description sur chaque page
- [ ] Sitemap.xml généré et accessible
- [ ] Robots.txt configuré
- [ ] Google Search Console configuré
- [ ] Google Analytics 4 opérationnel

### Fonctionnel
- [ ] Formulaire de contact testé et emails reçus
- [ ] Toutes les pages accessibles (pas de 404)
- [ ] Navigation mobile fonctionnelle
- [ ] HTTPS actif (automatique sur Vercel)

### Légal
- [ ] Mentions légales complètes
- [ ] Politique de confidentialité (RGPD)
- [ ] CGV si vente en ligne
- [ ] Bannière cookies si analytiques

---

## Maintenance

### Mises à jour recommandées
- Dépendances npm : 1x/mois (`npm outdated`)
- Contenu blog : 1x/semaine minimum
- Portfolio : à chaque nouveau projet livré

### Monitoring
- Vercel Analytics : trafic et performances
- Google Search Console : positions SEO
- Uptime : UptimeRobot (alerte si site down)
