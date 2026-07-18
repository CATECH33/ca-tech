/* update-footer.js — remplace le contenu <footer> par footer.js dans toutes les pages */
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

let updated = 0, skipped = 0;

files.forEach(function (file) {
  const fpath = path.join(ROOT, file);
  let content = fs.readFileSync(fpath, 'utf8');

  const hasFooter = /<footer[\s>]/i.test(content);
  const hasFooterJs = content.includes('/footer.js');

  if (!hasFooter) {
    console.log('  SKIP (no <footer>):', file);
    skipped++;
    return;
  }

  if (hasFooterJs) {
    console.log('  ALREADY DONE:', file);
    skipped++;
    return;
  }

  /* Replace <footer>…</footer> with empty <footer></footer> */
  content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '<footer></footer>');

  /* Add footer.js before </body> */
  content = content.replace('</body>', '  <script src="/footer.js"></script>\n</body>');

  fs.writeFileSync(fpath, content, 'utf8');
  console.log('  UPDATED:', file);
  updated++;
});

console.log('\nDone. Updated:', updated, '— Skipped:', skipped);
