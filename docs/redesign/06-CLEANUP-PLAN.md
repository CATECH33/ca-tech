# 06 — CLEANUP PLAN
## CA-TECH V2 — Inventaire & Plan de nettoyage
**Date :** 28 septembre 2026

---

## Principe

NE PAS supprimer aveuglément.  
NE PAS supprimer avant que le remplaçant soit en production.  
Le nouveau site remplace progressivement l'ancien.

**Légende :**
- `KEEP` — Conserver tel quel, ne pas modifier
- `REFACTOR` — Conserver, à migrer ou réécrire en Phase 2–3
- `ARCHIVE` — Déplacer dans `/archive/` ou `.archive/`, garder disponible
- `DELETE-CANDIDATE` — Peut être supprimé une fois le remplaçant en prod

---

## A. Fichiers racine — Scripts JS

| Fichier | Taille | Décision | Raison |
|---------|--------|---------|--------|
| `footer.js` | 9KB | KEEP | Utilisé par les pages HTML statiques SEO |
| `nav.js` | 12KB | KEEP | Utilisé par les pages HTML statiques SEO |
| `loic-widget.js` | 30KB | KEEP | Widget actif, produit en production |
| `sw.js` | 3KB | KEEP | Service Worker PWA actif |
| `vite.config.js` | 1.5KB | KEEP | Build config |
| `build.sh` | 3KB | KEEP | Script de build Vercel |

---

## B. Fichiers racine — CSS

| Fichier | Taille | Décision | Raison |
|---------|--------|---------|--------|
| `local-seo.css` | 14KB | KEEP | Utilisé par les pages HTML statiques SEO |

---

## C. Fichiers racine — HTML SPA shells (8916 bytes)

Ces fichiers sont des copies de `dist/index.html` générées par `build.sh`. Ils permettent au SPA React de servir les routes en HTML statique sur Vercel.

| Fichier | Décision | Action Phase 02 |
|---------|---------|----------------|
| `automatisations.html` | REFACTOR | Mettre à jour quand `/expertises/automatisation` existe |
| `collaborateurs-ia.html` | REFACTOR | Mettre à jour quand `/expertises/ia` existe |
| `catalogue.html` | DELETE-CANDIDATE | Supprimer quand la route `/catalogue` est supprimée |
| `contact.html` | KEEP | Route SPA active |
| `loic.html` | KEEP | Route SPA active |
| `realisations.html` | KEEP | Route SPA active |
| `services.html` | REFACTOR | Ajouter redirect 301 → `/expertises/web-saas` |
| `tarifs.html` | KEEP | Route SPA active |
| `agence-ia-dijon.html` | KEEP | Route SEO locale |
| `agence-ia-lyon.html` | KEEP | Route SEO locale |
| `automatisation-pme.html` | KEEP | Route SEO locale |
| `creation-site-internet-dijon.html` | KEEP | Route SEO locale |
| `creation-site-internet-lyon.html` | KEEP | Route SEO locale |
| `creation-site-internet-paris.html` | KEEP | Route SEO locale |
| `maintenance-informatique-pme.html` | KEEP | Route SEO locale |
| `politique-cookies.html` | KEEP | Légal |
| `politique-des-cookies.html` | KEEP | Légal |

---

## D. Fichiers racine — Pages HTML statiques SEO (NE PAS TOUCHER)

Ces pages sont du capital SEO acquis. Elles ne doivent PAS être modifiées dans le cadre de la refonte V2.

### Pages SEO locales — Création sites web
```
agence-web-dijon.html      (27KB)   KEEP
agence-web-lyon.html       (26KB)   KEEP
agence-web-paris.html      (26KB)   KEEP
agence-web-troyes.html     (27KB)   KEEP
site-internet-dijon.html   (22KB)   KEEP
site-internet-lyon.html    (22KB)   KEEP
site-internet-paris.html   (26KB)   KEEP
site-internet-troyes.html  (21KB)   KEEP
creation-site-vitrine.html (30KB)   KEEP
creation-site-ecommerce.html (34KB) KEEP
creation-landing-page.html (26KB)   KEEP
creation-flyer.html        (20KB)   KEEP
creation-logo.html         (23KB)   KEEP
refonte-site-internet.html (27KB)   KEEP
maintenance-site-web.html  (28KB)   KEEP
identite-visuelle.html     (21KB)   KEEP
```

### Pages SEO locales — E-commerce
```
site-ecommerce-dijon.html  (17KB)   KEEP
site-ecommerce-lyon.html   (17KB)   KEEP
site-ecommerce-paris.html  (22KB)   KEEP
site-ecommerce-troyes.html (18KB)   KEEP
```

### Pages SEO locales — Logo
```
logo-dijon.html   (18KB)   KEEP
logo-lyon.html    (17KB)   KEEP
logo-paris.html   (22KB)   KEEP
logo-troyes.html  (21KB)   KEEP
```

### Pages SEO — IA & Automatisation
```
agence-ia-dijon.html       (8KB)    KEEP
agence-ia-lyon.html        (8KB)    KEEP
automatisation-pme.html    (8KB)    KEEP
maintenance-informatique-pme.html   KEEP
auto-drive-ia-classement.html       KEEP
auto-forms-sheets-devis.html        KEEP
auto-gmail-calendar-slack.html      KEEP
auto-hubspot-slack-calendar.html    KEEP
auto-linkedin-apify-crm.html        KEEP
auto-outlook-teams-crm.html         KEEP
auto-stripe-facture-email.html      KEEP
auto-whatsapp-crm-email.html        KEEP
```

### Pages contenu SEO long
```
faq.html            (56KB)   KEEP
glossaire-ia.html   (45KB)   KEEP
blog.html           (18KB)   KEEP
```

### Pages légales
```
mentions-legales.html             (18KB)   KEEP
politique-de-confidentialite.html (25KB)   KEEP
gestion-des-cookies.html          (18KB)   KEEP
```

### Pages fonctionnelles
```
devis.html                (89KB)   KEEP — formulaire actif
commande-confirmation.html (10KB)  KEEP
offline.html               (1.6KB) KEEP — PWA
```

---

## E. Fichiers racine — Pages HTML à archiver ou refactoriser

Ces pages ont un contenu qui sera absorbé par la nouvelle architecture SPA.

| Fichier | Taille | Décision | Destination |
|---------|--------|---------|-------------|
| `solutions.html` | 82KB | ARCHIVE | Remplacé par les pages `/expertises/*` |
| `technologies.html` | 44KB | ARCHIVE | Contenu à extraire pour les pages expertise |
| `methodologie.html` | 38KB | ARCHIVE | Contenu → section méthode homepage |
| `cas-clients.html` | 47KB | REFACTOR | Données → `/realisations` SPA |

### Réalisations statiques → à intégrer dans /realisations

| Fichier | Décision | Action |
|---------|---------|--------|
| `realisation-ca-tech-manager.html` | REFACTOR | Transformer en données JSON pour le SPA |
| `realisation-cv-magic.html` | REFACTOR | Idem |
| `realisation-pasmal.html` | REFACTOR | Idem |
| `realisation-pemous-money.html` | REFACTOR | Idem |

---

## F. Rapports de sprint à la racine — ARCHIVE

Ces fichiers n'ont pas leur place à la racine du projet. Ils doivent être déplacés vers `docs/archive/`.

```
SPRINT_10_9_SECURITY_REPORT.md
SPRINT_10_10_REPORT.md
SPRINT_10_11_MIGRATION_REPORT.md
SPRINT_10_12_RPC_WEBHOOK_REPORT.md
SPRINT_11_2_NAVIGATION_REPORT.md
SPRINT_11_3_DASHBOARD_REPORT.md
SPRINT_11_4_CONTACTS_REPORT.md
SPRINT_11_4_CONTACTS_CLIENTS_REPORT.md
SPRINT_11_5_DEVIS_PAIEMENTS_REPORT.md
SPRINT_12_1_DOCUMENTS_SIGNES_REPORT.md
SPRINT_12_1_INVOICE_REMINDERS_REPORT.md
SPRINT_12_2_EMAIL_DIGEST_REPORT.md
SPRINT_12_3_ABONNEMENTS_STRIPE_REPORT.md
SPRINT_12_4_ANTI_CHURN_REPORT.md
SPRINT_12_5_WEEKLY_REPORT_REPORT.md
STRIPE_SUBSCRIPTION_FINAL_FIX_REPORT.md
STRIPE_SUBSCRIPTION_SECURITY_AUDIT.md
STRIPE_SUBSCRIPTION_SECURITY_FIX_REPORT.md
MANAGER_V2_AUDIT_AND_MIGRATION_PLAN.md
MANAGER_V2_FINAL_REPORT.md
CA_TECH_PAYMENT_PRODUCTION_READINESS_REPORT.md
```

**Action :** Créer `docs/archive/` et y déplacer ces 21 fichiers. Ne pas supprimer — ils contiennent des décisions techniques importantes pour le Manager et le système de paiement.

**Ajouter à `.gitignore` :** Envisager d'ajouter `SPRINT_*.md` au `.gitignore` pour les futurs rapports.

---

## G. Composants SPA — décisions de nettoyage

| Fichier | Décision | Quand |
|---------|---------|-------|
| `src/pages/Catalogue.jsx` + `.css` | DELETE-CANDIDATE | Quand la route est supprimée de App.jsx |
| `src/pages/Services.jsx` + `.css` | DELETE-CANDIDATE | Quand les 4 pages Expertise existent |
| `src/pages/CollaborateursIA.jsx` + `.css` | ARCHIVE | Quand `/expertises/ia` est en prod |
| `src/pages/Automatisations.jsx` + `.css` | ARCHIVE | Quand `/expertises/automatisation` est en prod |
| `src/components/SeoContent.jsx` | REFACTOR | Restyler avec tokens V2 |
| `src/components/DetailDrawer.jsx` | ÉVALUER | Utile pour Réalisations ? Sinon supprimer |

---

## H. Données et assets

| Fichier | Décision | Note |
|---------|---------|------|
| `src/data/seoPages.js` | KEEP | Données SEO locales — ne pas modifier |
| `src/lib/seo.js` | KEEP | Utilitaires SEO |
| `src/lib/schema.js` | KEEP | Schema.org — enrichir si besoin |
| `src/lib/supabase.js` | KEEP | |
| `audit-lighthouse.json` | ARCHIVE → `docs/archive/` | Référence technique |
| `audit-report.json` | ARCHIVE → `docs/archive/` | Idem |
| `DESIGN (3).md` | ARCHIVE → `docs/references/` | Déjà analysé dans REFERO-REFERENCE.md |

---

## I. Récapitulatif par action

### À archiver immédiatement (sans attendre Phase 02)
- 21 rapports SPRINT_*.md / STRIPE_*.md / MANAGER_*.md → `docs/archive/`
- `audit-lighthouse.json`, `audit-report.json` → `docs/archive/`
- `DESIGN (3).md` → `docs/references/` (ou laisser à la racine, peu critique)

### À modifier quand le remplaçant est en prod
- `services.html` → ajouter redirect dans vercel.json
- `collaborateurs-ia.html` → ajouter redirect
- `automatisations.html` → ajouter redirect
- `src/pages/Catalogue.jsx` → supprimer
- `src/pages/Services.jsx` → archiver

### Ne jamais toucher
- Toutes les pages SEO locales listées en section D
- `devis.html`, `loic-widget.js`, `footer.js`, `nav.js`
- `src/lib/*`, `src/data/seoPages.js`

---

## J. Ordre recommandé pour le nettoyage

```
Étape 1 (avant Phase 02) :
  → Créer docs/archive/
  → Déplacer les 21 rapports
  → Déplacer les 2 audits JSON
  → Ajouter SPRINT_*.md au .gitignore

Étape 2 (en parallèle de Phase 02) :
  → Refactoriser les réalisations statiques en JSON

Étape 3 (après mise en prod des pages Expertise) :
  → Ajouter redirections 301 dans vercel.json
  → Mettre à jour les shells HTML concernés

Étape 4 (Phase 03 ou plus) :
  → Archiver solutions.html, technologies.html, methodologie.html
  → Supprimer Catalogue.jsx une fois la route retirée
```
