# PROMPTS/

Bibliothèque de prompts réutilisables pour la génération assistée (IA image, IA texte, IA code) utilisée en production sur CA-TECH.

## Convention

- Un fichier `.md` par prompt.
- Nommage kebab-case, préfixé par le domaine : `img-hero-collaborateur-ia.md`, `copy-landing-seo-local.md`, `code-section-pricing.md`.
- En-tête obligatoire :

```markdown
---
domaine: image | copy | code
modele: gpt-4o | claude-4-sonnet | midjourney | flux-1.1-pro | ...
usage: ou-quand-utiliser
version: 1.0
---
```

## Catégories

| Préfixe | Domaine |
|---|---|
| `img-*` | Génération d'images (hero, illustrations, mockups) |
| `copy-*` | Copywriting (H1, sous-titres, CTA, meta description) |
| `seo-*` | Optimisation SEO (title, meta, alt) |
| `code-*` | Génération de code (sections HTML, animations SVG, snippets JS) |
| `brief-*` | Briefs client (audit, cahier des charges) |

## Règles

- Un prompt qui marche = un prompt qu'on garde et versionne.
- Toujours documenter le **modèle testé** et le **résultat obtenu**.
- Bannir les prompts génériques type « fais-moi un site web moderne » — chaque prompt doit être ancré dans le contexte CA-TECH (palette, ton, cibles).
