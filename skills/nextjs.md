# Next.js Skill — CA-TECH

## Objectif
Développer des applications web modernes, rapides et scalables avec Next.js.

## Quand utiliser Next.js

- Sites à forte performance (SSR/SSG)
- Applications web complexes
- Sites e-commerce sur mesure
- Dashboards et portails clients
- Sites avec contenu dynamique et SEO critique

## Stack CA-TECH

- **Framework** : Next.js 14+ (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **UI** : shadcn/ui ou Radix UI
- **Base de données** : Supabase / PostgreSQL / Prisma
- **Auth** : NextAuth.js ou Clerk
- **Déploiement** : Vercel (recommandé) ou Docker
- **CMS** : Sanity / Strapi / Contentful (headless)

## Architecture

### App Router (recommandé)
- `app/` directory avec layouts imbriqués
- Server Components par défaut
- Client Components uniquement quand nécessaire (interactivité)
- Route handlers pour API (`app/api/`)
- Loading UI et error boundaries

### Rendering
- **SSG** (Static Site Generation) : pages statiques, blog, marketing
- **SSR** (Server-Side Rendering) : contenu dynamique, personnalisé
- **ISR** (Incremental Static Regeneration) : mix statique + frais
- **CSR** (Client-Side Rendering) : dashboards, interactivité pure

## Performance

- Images optimisées avec `next/image`
- Fonts optimisées avec `next/font`
- Code splitting automatique
- Prefetching des liens
- Edge Runtime pour API rapides
- Cache headers configurés

## SEO

- Metadata API (`generateMetadata`)
- Sitemap dynamique (`sitemap.ts`)
- robots.txt (`robots.ts`)
- Open Graph images dynamiques
- JSON-LD structuré

## Bonnes pratiques

- Variables d'environnement séparées (`.env.local`, `.env.production`)
- Validation avec Zod
- Error handling global
- Tests (Jest + React Testing Library)
- CI/CD avec GitHub Actions
- Monitoring (Vercel Analytics, Sentry)

## Livrables

- Code source TypeScript propre et documenté
- README avec instructions de déploiement
- Variables d'environnement documentées
- Pipeline CI/CD configuré
- Site déployé et fonctionnel
