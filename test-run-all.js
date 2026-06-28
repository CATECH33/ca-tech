/**
 * Runner global CA-TECH — enchaîne toutes les suites de tests
 * node test-run-all.js [BASE_URL]
 *
 * Suites incluses (dans l'ordre) :
 *   1. test-all.js            — tests unitaires API (sans browser)
 *   2. test-site-principal.js — site public (Playwright)
 *   3. test-devis-live.js     — formulaire /devis conversationnel (Playwright)
 *   4. test-admin-dashboard.js — admin/dashboard (Playwright)
 *   5. test-admin-devis.js    — admin/devis (Playwright)
 *   6. test-admin-pages.js    — toutes les pages admin (Playwright)
 *   7. test-loic-ia.js        — pages Loïc IA (Playwright)
 *
 * test-payment.js est exclu (nécessite SUPABASE_SERVICE_ROLE_KEY + Stripe test).
 * Pour le lancer séparément : node test-payment.js
 */

const { spawnSync } = require('child_process');
const path = require('path');

const BASE = process.argv[2] || 'https://www.ca-tech.fr';
const DIR  = __dirname;

const SUITES = [
  { name: 'Unitaires API',          file: 'test-all.js',             args: []      },
  { name: 'Site principal',         file: 'test-site-principal.js',  args: [BASE]  },
  { name: 'Formulaire /devis',      file: 'test-devis-live.js',      args: [BASE]  },
  { name: 'Admin — Dashboard',      file: 'test-admin-dashboard.js', args: [BASE]  },
  { name: 'Admin — Devis',          file: 'test-admin-devis.js',     args: [BASE]  },
  { name: 'Admin — Pages',          file: 'test-admin-pages.js',     args: [BASE]  },
  { name: 'Loïc IA',               file: 'test-loic-ia.js',         args: [BASE]  },
];

const W = 62;
const SEP  = '═'.repeat(W);
const sep  = '─'.repeat(W);

function parseCounts(output) {
  // Format Playwright : "  ✅ 106  ❌ 0  ⚠️  0  🔍 5 probes"
  const pw = output.match(/✅\s+(\d+)\s+❌\s+(\d+)\s+⚠️\s+(\d+)/);
  if (pw) return { pass: +pw[1], fail: +pw[2], warn: +pw[3] };
  // Format test-all.js : "Résultats : 58 ✅  0 ❌"
  const ta = output.match(/(\d+)\s*✅\s+(\d+)\s*❌/);
  if (ta) return { pass: +ta[1], fail: +ta[2], warn: 0 };
  // Fallback : compter les lignes individuelles (évite de compter le footer)
  const lines = output.split('\n').filter(l => /^\s{2}[✅❌⚠️]/.test(l));
  return {
    pass:  lines.filter(l => l.trimStart().startsWith('✅')).length,
    fail:  lines.filter(l => l.trimStart().startsWith('❌')).length,
    warn:  lines.filter(l => l.trimStart().startsWith('⚠️')).length,
  };
}

console.log(`\n${SEP}`);
console.log(`  🚀 CA-TECH — Runner Global`);
console.log(`  Base : ${BASE}`);
console.log(`  Suites : ${SUITES.length}`);
console.log(SEP);

const summary = [];
let globalPass = 0, globalFail = 0, globalWarn = 0;
const startTotal = Date.now();

for (const suite of SUITES) {
  const start = Date.now();
  console.log(`\n${sep}`);
  console.log(`  ▶  ${suite.name}  (${suite.file})`);
  console.log(sep);

  const result = spawnSync('node', [path.join(DIR, suite.file), ...suite.args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: DIR,
    timeout: 300_000,
  });

  const output = (result.stdout || '') + (result.stderr || '');
  process.stdout.write(output);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const counts = parseCounts(output);
  const passed = result.status === 0;

  globalPass += counts.pass;
  globalFail += counts.fail;
  globalWarn += counts.warn;

  summary.push({
    name: suite.name,
    passed,
    elapsed,
    ...counts,
  });
}

const totalElapsed = ((Date.now() - startTotal) / 1000).toFixed(1);

console.log(`\n${SEP}`);
console.log(`  📊 BILAN GLOBAL — ${totalElapsed}s`);
console.log(SEP);

const colW = 26;
for (const s of summary) {
  const verdict = s.passed ? '🟢 PASS' : '🔴 FAIL';
  const name = s.name.padEnd(colW);
  const counts = `✅ ${String(s.pass).padStart(3)}  ❌ ${s.fail}  ⚠️  ${s.warn}`;
  console.log(`  ${verdict}  ${name}  ${counts}  (${s.elapsed}s)`);
}

console.log(sep);
const allPassed = summary.every(s => s.passed);
console.log(`  ✅ ${globalPass}  ❌ ${globalFail}  ⚠️  ${globalWarn}  — ${totalElapsed}s total`);
console.log(`  Verdict : ${allPassed ? '🟢 TOUT PASS' : '🔴 ÉCHECS DÉTECTÉS'}`);
console.log(SEP + '\n');

process.exit(allPassed ? 0 : 1);
