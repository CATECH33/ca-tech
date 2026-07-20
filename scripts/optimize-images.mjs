/**
 * CA-TECH — optimize-images.mjs
 * Convertit toutes les images lourdes de public/ en WebP optimisé.
 * Usage: node scripts/optimize-images.mjs
 * Prérequis: npm install --save-dev sharp
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PUBLIC = path.join(ROOT, 'public')

const QUALITY = 82          // WebP quality (80-85 = bon ratio taille/qualité)
const MIN_SIZE_KB = 100     // Optimiser toutes les images > 100 KB
const RESIZE_HERO = 1400    // Largeur max pour images héros (1400px suffit pour retina 700px)

function getAllImages(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getAllImages(full))
    } else if (/\.(png|jpe?g|webp|jpg\.png|webp\.png)$/i.test(entry.name)) {
      const stat = fs.statSync(full)
      results.push({ path: full, name: entry.name, kb: Math.round(stat.size / 1024) })
    }
  }
  return results
}

async function optimizeImage(file) {
  const ext = path.extname(file.name).toLowerCase()
  // Destination : même nom sans double extension, format .webp
  const basename = file.name
    .replace(/\.(jpg|jpeg)\.png$/i, '')
    .replace(/\.webp\.png$/i, '')
    .replace(/\.(png|jpe?g|webp)$/i, '')
  const outPath = path.join(path.dirname(file.path), basename + '.webp')

  // Skip si déjà optimisé (sortie plus récente que source)
  if (fs.existsSync(outPath) && outPath !== file.path) {
    const srcMtime = fs.statSync(file.path).mtimeMs
    const outMtime = fs.statSync(outPath).mtimeMs
    if (outMtime > srcMtime) {
      console.log(`  ⏭ déjà à jour: ${basename}.webp`)
      return
    }
  }

  // Lire en buffer pour libérer le handle de fichier immédiatement (Windows)
  const buffer = fs.readFileSync(file.path)
  const img = sharp(buffer)
  const meta = await img.metadata()

  // Redimensionner seulement si image > RESIZE_HERO px de large
  let pipeline = img
  if (meta.width && meta.width > RESIZE_HERO) {
    pipeline = pipeline.resize(RESIZE_HERO, null, { withoutEnlargement: true })
  }

  // Si source et destination sont identiques, utiliser un fichier temporaire
  const sameFile = path.resolve(outPath) === path.resolve(file.path)
  const writePath = sameFile ? outPath + '.tmp' : outPath
  await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(writePath)
  if (sameFile) {
    fs.unlinkSync(outPath)
    fs.renameSync(writePath, outPath)
  }

  const newStat = fs.statSync(outPath)
  const newKb = Math.round(newStat.size / 1024)
  const saving = Math.round((1 - newKb / file.kb) * 100)

  console.log(`  ✅ ${file.name} (${file.kb} KB) → ${basename}.webp (${newKb} KB) — ${saving}% économisé`)

  // Supprimer le fichier source si c'est un doublon ou mauvaise extension
  if (outPath !== file.path && /\.(jpg\.png|webp\.png|jpeg\.png)$/i.test(file.name)) {
    fs.unlinkSync(file.path)
    console.log(`     🗑 Source supprimée: ${file.name}`)
  }
}

async function main() {
  const images = getAllImages(PUBLIC).filter(f => f.kb >= MIN_SIZE_KB)
  console.log(`\n🖼  ${images.length} images à optimiser (> ${MIN_SIZE_KB} KB)\n`)

  let totalBefore = 0, totalAfter = 0
  for (const file of images) {
    totalBefore += file.kb
    await optimizeImage(file)
    if (fs.existsSync(file.path)) {
      totalAfter += Math.round(fs.statSync(file.path).size / 1024)
    }
  }

  const savedMb = ((totalBefore - totalAfter) / 1024).toFixed(1)
  console.log(`\n✨ Terminé — ${savedMb} MB économisés (${totalBefore} KB → ${totalAfter} KB)`)
}

main().catch(err => { console.error(err); process.exit(1) })
