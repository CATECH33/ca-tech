#!/bin/sh
set -e

# Build site principal
npm run build

# Build manager
cd manager
npm install
npm run build
cd ..

# Copie index.html pour le SPA routing du site principal
for f in index.html services.html loic.html collaborateurs-ia.html automatisations.html realisations.html contact.html catalogue.html tarifs.html; do
  cp dist/index.html $f
done

# Copie index.html du manager pour le fallback
cp manager/dist/index.html manager/index.html
