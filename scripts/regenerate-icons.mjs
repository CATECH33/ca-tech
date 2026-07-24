import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'assets', 'logos', 'logo-ca-tech.png');
const publicDir = join(root, 'public');

const pngTargets = [
  { name: 'favicon-16x16.png',        size: 16  },
  { name: 'favicon-32x32.png',        size: 32  },
  { name: 'apple-touch-icon.png',     size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

for (const { name, size } of pngTargets) {
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, name));
  console.log(`  ok  ${name} (${size}x${size})`);
}

await sharp(source)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 85 })
  .toFile(join(publicDir, 'android-chrome-512x512.webp'));
console.log(`  ok  android-chrome-512x512.webp (512x512)`);

const icoSizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  icoSizes.map((s) =>
    sharp(source)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer()
  )
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);

const entries = Buffer.alloc(16 * icoSizes.length);
let offset = 6 + entries.length;
const dataParts = [];
icoSizes.forEach((size, i) => {
  const buf = pngBuffers[i];
  const p = i * 16;
  entries.writeUInt8(size === 256 ? 0 : size, p);
  entries.writeUInt8(size === 256 ? 0 : size, p + 1);
  entries.writeUInt8(0, p + 2);
  entries.writeUInt8(0, p + 3);
  entries.writeUInt16LE(1, p + 4);
  entries.writeUInt16LE(32, p + 6);
  entries.writeUInt32LE(buf.length, p + 8);
  entries.writeUInt32LE(offset, p + 12);
  offset += buf.length;
  dataParts.push(buf);
});

const ico = Buffer.concat([header, entries, ...dataParts]);
writeFileSync(join(publicDir, 'favicon.ico'), ico);
console.log(`  ok  favicon.ico (16/32/48)`);
