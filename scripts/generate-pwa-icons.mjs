import sharp from 'sharp'
import { mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

const SVG_SRC = 'public/logos/logo-ca-tech-icon.svg'
const PNG_SRC = 'public/logos/logo-ca-tech-icon.png'
const OUT = 'public/icons'
const BG  = { r: 10, g: 37, b: 64, alpha: 1 } // #0A2540

mkdirSync(OUT, { recursive: true })

// Utilise le SVG si disponible (design plus propre pour les icônes)
// Sharp supporte SVG via librsvg
async function getSource(size) {
  try {
    const svg = readFileSync(SVG_SRC)
    return sharp(svg).resize(size, size, { fit: 'contain', background: BG })
  } catch {
    return sharp(PNG_SRC).resize(size, size, { fit: 'cover' })
  }
}

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512]

// Icônes standard — SVG centré sur fond navy
for (const size of SIZES) {
  const svg = readFileSync(SVG_SRC)
  const logoSize = Math.round(size * 0.82)

  const logo = await sharp(svg)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG }
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(join(OUT, `icon-${size}x${size}.png`))
  console.log(`✅ icon-${size}x${size}.png`)
}

// Icônes maskable (safe zone Android : logo à 72% pour garantir la zone sûre 80%)
for (const size of [192, 512]) {
  const svg = readFileSync(SVG_SRC)
  const inner = Math.round(size * 0.72)

  const logo = await sharp(svg)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG }
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(join(OUT, `icon-${size}x${size}-maskable.png`))
  console.log(`✅ icon-${size}x${size}-maskable.png (maskable)`)
}

// apple-touch-icon 180x180
{
  const svg = readFileSync(SVG_SRC)
  const inner = Math.round(180 * 0.82)
  const logo = await sharp(svg)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: BG }
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9, effort: 10 })
    .toFile('public/apple-touch-icon.png')
  console.log('✅ apple-touch-icon.png')
}

console.log('\n✅ Toutes les icônes générées.')
