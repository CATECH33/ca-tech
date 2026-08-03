import { readFileSync, readdirSync } from 'node:fs'

const REPL = '�'
const files = readdirSync('.').filter(f => f.endsWith('.html'))

const tokens = new Map()

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  if (!src.includes(REPL)) continue

  // Match words that contain the replacement char, allowing letters/digits/apostrophe on both sides
  const re = /[\p{L}\p{N}''\-]*�[\p{L}\p{N}''\-�]*|\d+\s*�/gu
  const matches = src.match(re) || []
  for (const m of matches) {
    const cnt = tokens.get(m) || 0
    tokens.set(m, cnt + 1)
  }
}

const sorted = [...tokens.entries()].sort((a, b) => b[1] - a[1])
console.log('=== Unique corrupted tokens ===')
console.log('Total unique:', sorted.length)
console.log()
for (const [tok, cnt] of sorted) {
  console.log(`${cnt.toString().padStart(4)} × ${tok}`)
}
