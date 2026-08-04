import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join } from 'path'

const SRC = 'public/logos/logo-ca-tech-icon.png'
const OUT = 'public/icons'
const BG  = { r: 10, g: 37, b: 64, alpha: 1 } // #0A2540

mkdirSync(OUT, { recursive: true })

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512]

// Icônes standard
for (const size of SIZES) {
  await sharp(SRC)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, `icon-${size}x${size}.png`))
  console.log(`✅ icon-${size}x${size}.png`)
}

// Icônes maskable (safe zone : logo à 80% + 10% padding)
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.78)

  const logoResized = await sharp(SRC)
    .resize(inner, inner, { fit: 'cover' })
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG }
  })
    .composite([{ input: logoResized, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, `icon-${size}x${size}-maskable.png`))
  console.log(`✅ icon-${size}x${size}-maskable.png (maskable)`)
}

// apple-touch-icon 180x180 mis à jour
await sharp(SRC)
  .resize(180, 180, { fit: 'cover' })
  .png({ compressionLevel: 9 })
  .toFile('public/apple-touch-icon.png')
console.log('✅ apple-touch-icon.png (180x180)')

console.log('\n✅ Toutes les icônes générées dans', OUT)
