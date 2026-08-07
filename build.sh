#!/bin/sh
set -e

# Build site principal
npm run build

# Build manager
cd manager
npm install
npm run build
cd ..

# Copie index-src.html (entry Vite) pour le SPA routing du site principal
for f in \
  index.html services.html loic.html collaborateurs-ia.html \
  automatisations.html realisations.html contact.html catalogue.html tarifs.html \
  politique-des-cookies.html \
  politique-cookies.html \
  creation-site-internet-dijon.html creation-site-internet-lyon.html \
  creation-site-internet-paris.html agence-ia-dijon.html agence-ia-lyon.html \
  automatisation-pme.html maintenance-informatique-pme.html; do
  cp dist/index-src.html $f
  # Vite transforme href="/site.webmanifest" en href="/dist/site.webmanifest" à cause du base:/dist/
  # Chrome Android utilise ce chemin pour vérifier l'installabilité — il doit pointer à la racine
  sed -i 's|href="/dist/site.webmanifest"|href="/site.webmanifest"|g' $f
done

# Copie des assets à la racine pour les chemins sans /dist/ prefix
for dir in collaborateurs services portfolio automatisations videos images; do
  [ -d "dist/$dir" ] && cp -r "dist/$dir" . || true
done

# PWA — expose les fichiers nécessaires à la racine (scope /)
cp dist/site.webmanifest site.webmanifest
cp dist/apple-touch-icon.png apple-touch-icon.png
cp -r dist/icons/ icons/
cp -r dist/logos/ logos/
