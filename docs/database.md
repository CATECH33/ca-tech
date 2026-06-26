# Base de données CA-TECH

## Stack recommandé
- **Base de données** : PostgreSQL (via Supabase)
- **ORM** : Prisma
- **Hébergement BDD** : Supabase / PlanetScale

---

## Tables principales

### `contacts`
Formulaires de contact et demandes de devis.

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| nom | VARCHAR(100) | Nom complet |
| email | VARCHAR(150) | Email |
| telephone | VARCHAR(20) | Téléphone (optionnel) |
| entreprise | VARCHAR(100) | Nom de l'entreprise (optionnel) |
| service | ENUM | Service souhaité |
| message | TEXT | Message / description projet |
| statut | ENUM | nouveau / en_cours / traité |
| created_at | TIMESTAMP | Date de création |

### `projets` (Portfolio)
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| titre | VARCHAR(100) | Nom du projet |
| type | ENUM | vitrine / ecommerce / app / logo / ia |
| description | TEXT | Description courte |
| technologies | TEXT[] | Stack utilisé |
| image_url | VARCHAR | URL visuel principal |
| lien | VARCHAR | URL du projet (si public) |
| ordre | INTEGER | Ordre d'affichage |
| actif | BOOLEAN | Afficher ou masquer |
| created_at | TIMESTAMP | Date |

### `articles` (Blog)
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| titre | VARCHAR(200) | Titre de l'article |
| slug | VARCHAR(200) | URL SEO-friendly |
| categorie | ENUM | web / ia / automatisation / conseils / actualites |
| contenu | TEXT | Corps de l'article (Markdown) |
| image_url | VARCHAR | Image de couverture |
| meta_description | VARCHAR(160) | Description SEO |
| publie | BOOLEAN | Brouillon ou publié |
| created_at | TIMESTAMP | Date de publication |

### `applications`
| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique |
| nom | VARCHAR(100) | Nom de l'app |
| slug | VARCHAR(100) | URL |
| description | TEXT | Description |
| statut | ENUM | dev / beta / disponible |
| lien | VARCHAR | URL de l'app |
| image_url | VARCHAR | Visuel |

---

## Environnements
- **Dev** : base locale (Docker ou Supabase local)
- **Staging** : Supabase projet staging
- **Production** : Supabase projet production

## Sécurité
- Variables d'environnement : `.env` (jamais committé)
- Row Level Security (RLS) activé sur Supabase
- Backups automatiques quotidiens
