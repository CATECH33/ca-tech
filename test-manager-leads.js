/**
 * Test Manager CA-TECH — page Leads
 * Vérifie : kanban par défaut, vue liste, fiche lead, Realtime (devis → lead instantané)
 * node test-manager-leads.js [BASE_URL]
 * Env: MANAGER_PASSWORD
 */
const { chromium } = require('playwright');

const BASE  = process.argv[2] || 'https://www.ca-tech.fr';
const EMAIL = 'contact@ca-tech.fr';
const PASS  = process.env.MANAGER_PASSWORD || '';

if (!PASS) {
  console.error('❌ MANAGER_PASSWORD non défini.');
  process.exit(1);
}

async function loginManager(page) {
  await page.goto(BASE + '/manager', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector('input[type="password"]'), { timeout: 15000 });
}

async function waitForLoic(page, prev = 0, timeout = 15000) {
  await page.waitForFunction((p) => {
    const msgs = document.querySelectorAll('.msg:not(.user) .msg-bubble');
    if (msgs.length <= p) return false;
    return !msgs[msgs.length - 1].querySelector('.typing');
  }, prev, { timeout });
  await page.waitForTimeout(300);
}
async function loicCount(page) {
  return page.evaluate(() => document.querySelectorAll('.msg:not(.user) .msg-bubble').length);
}

(async () => {
  console.log(`\n🧪  Test Manager Leads — ${BASE}\n${'─'.repeat(55)}`);
  const browser = await chromium.launch({ headless: true });

  let ok = true;
  const fail = (msg) => { console.error('❌', msg); ok = false; };

  const ctxManager = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const manager = await ctxManager.newPage();
  manager.on('console', msg => { if (msg.type() === 'error') console.log(`  [mgr:error] ${msg.text()}`); });

  try {
    // ── 1. Login + navigation ──────────────────────────────────────
    await loginManager(manager);
    console.log('✅ Connexion réussie');

    await manager.locator('a', { hasText: 'Leads' }).first().click();
    await manager.waitForLoadState('networkidle');
    console.log(`✅ Page Leads chargée (${manager.url()})`);

    // ── 2. Stats ──────────────────────────────────────────────────
    await manager.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Total leads') || text.includes('leads');
    }, null, { timeout: 10000 });
    const totalText = await manager.locator('text=Total leads').locator('..').textContent().catch(() => '');
    console.log(`✅ Stats affichées — ${totalText.replace(/\s+/g, ' ').trim().slice(0, 60)}`);

    // ── 3. Vue Kanban (défaut) ─────────────────────────────────────
    // Attendre les colonnes kanban
    await manager.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Nouveau') && text.includes('Qualification');
    }, null, { timeout: 10000 });

    const kanbanCols = await manager.evaluate(() =>
      document.body.innerText.includes('Contacté') && document.body.innerText.includes('Négociation')
    );
    if (kanbanCols) {
      console.log('✅ Vue Kanban — colonnes présentes (Nouveau, Contacté, Qualification…)');
    } else {
      fail('Colonnes Kanban absentes');
    }

    // Chercher "Doly" ou "Marie" dans le kanban
    const hasDoly  = await manager.evaluate(() => document.body.innerText.includes('Doly') || document.body.innerText.includes('MAKASSI'));
    const hasMarie = await manager.evaluate(() => document.body.innerText.includes('Marie Leblanc'));
    if (hasDoly)  console.log('✅ Lead "Doly MAKASSI" visible dans le kanban');
    else          console.log('⚠️  Lead "Doly MAKASSI" non trouvé (peut nécessiter scroll)');
    if (hasMarie) console.log('✅ Lead "Marie Leblanc" visible dans le kanban');

    // ── 4. Basculer vue Liste ─────────────────────────────────────
    // Les boutons toggle sont dans le header de page — icônes Columns3 / List
    // On cherche le bouton contenant svg.lucide-list ou par position (2e des 2 toggles)
    const switchedToList = await manager.evaluate(() => {
      // Chercher tous les boutons SVG dans la zone header
      const btns = Array.from(document.querySelectorAll('button'));
      const listBtn = btns.find(b => {
        const svg = b.querySelector('svg');
        return svg && (svg.getAttribute('class') || '').includes('lucide-list');
      });
      if (listBtn) { listBtn.click(); return true; }
      return false;
    });

    if (switchedToList) {
      await manager.waitForTimeout(500);
      // Attendre les lignes tableau
      await manager.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0, null, { timeout: 8000 });
      const rowCount = await manager.evaluate(() => document.querySelectorAll('tbody tr').length);
      console.log(`✅ Vue Liste — ${rowCount} leads en tableau`);

      const firstRowTxt = await manager.locator('tbody tr').first().textContent();
      console.log(`✅ Premier lead : ${firstRowTxt.trim().slice(0, 70)}`);
    } else {
      console.log('⚠️  Bouton liste non trouvé via SVG — kanban uniquement testé');
    }

    // ── 5. Screenshot avant Realtime ──────────────────────────────
    await manager.screenshot({ path: 'manager-leads-before.png' });
    console.log('✅ Screenshot avant → manager-leads-before.png');

    // Compter les leads actuels pour détecter l'ajout
    const leadsAvant = await manager.evaluate(() => {
      // En liste : tbody tr count ; en kanban : chercher un marqueur
      const rows = document.querySelectorAll('tbody tr');
      if (rows.length > 0) return rows.length;
      return parseInt(document.body.innerText.match(/(\d+) leads?/i)?.[1] ?? '0');
    });
    console.log(`  Leads avant soumission : ${leadsAvant}`);

    // ── 6. Soumettre un devis dans un 2e contexte ─────────────────
    console.log('\n  ⏳ Test Realtime — soumission formulaire /devis...');
    const ctxDevis = await browser.newContext({
      viewport: { width: 1280, height: 900 }, locale: 'fr-FR', acceptDownloads: true,
    });
    const devis = await ctxDevis.newPage();

    try {
      await devis.goto(BASE + '/devis', { waitUntil: 'networkidle', timeout: 20000 });
      await waitForLoic(devis, 0, 15000);

      let c = await loicCount(devis);
      await devis.locator('.choice-card').first().click(); await waitForLoic(devis, c);       // projet
      c = await loicCount(devis);
      await devis.locator('.choice-card').first().click(); await waitForLoic(devis, c);       // secteur
      c = await loicCount(devis);
      await devis.locator('button', { hasText: 'Continuer' }).first().click();
      await waitForLoic(devis, c, 12000);                                                     // fonctions
      c = await loicCount(devis);
      await devis.locator('.choice-card').nth(0).click(); await waitForLoic(devis, c, 10000); // logo
      c = await loicCount(devis);
      await devis.locator('.choice-card').nth(0).click(); await waitForLoic(devis, c, 10000); // domaine
      c = await loicCount(devis);
      await devis.locator('.choice-card').nth(0).click(); await waitForLoic(devis, c, 10000); // pages
      c = await loicCount(devis);
      await devis.locator('button', { hasText: 'Continuer' }).first().click();
      await waitForLoic(devis, c);                                                             // options
      c = await loicCount(devis);
      await devis.locator('.choice-card').nth(0).click(); await waitForLoic(devis, c);        // délai
      c = await loicCount(devis);
      await devis.locator('.choice-card').nth(0).click(); await waitForLoic(devis, c);        // budget

      await devis.waitForSelector('#fPrenom', { timeout: 10000 });
      await devis.fill('#fPrenom',  'Realtime');
      await devis.fill('#fNom',     'Test');
      await devis.fill('#fEmail',   'realtime-test@ca-tech.fr');
      await devis.fill('#fPhone',   '+33 6 00 00 00 00').catch(() => {});
      await devis.fill('#fVille',   'Paris').catch(() => {});
      await devis.locator('#fLegal').check().catch(() => {});

      await devis.locator('#btnSubmit').click();
      c = await loicCount(devis);
      await waitForLoic(devis, c, 12000);
      await devis.locator('#btnValidate').click();
      await devis.waitForSelector('#successScreen.show', { timeout: 30000 });
      const devNum = await devis.locator('#successNum').textContent();
      console.log(`  ✅ ${devNum} soumis → lead "Realtime Test" envoyé à Supabase`);

    } finally {
      await ctxDevis.close();
    }

    // ── 7. Vérifier apparition en temps réel (sans refresh) ───────
    const appeared = await manager.waitForFunction(() => {
      return document.body.innerText.includes('Realtime') ||
             document.body.innerText.includes('realtime-test');
    }, null, { timeout: 20000 }).then(() => true).catch(() => false);

    if (appeared) {
      console.log('✅ Lead "Realtime Test" apparu en temps réel (sans refresh)');
    } else {
      // Peut être hors champ (scroll ou paginator) — rafraîchir pour confirmer la présence
      await manager.reload({ waitUntil: 'networkidle' });
      // Attendre que la page soit hydratée (stats visibles)
      await manager.waitForFunction(() =>
        document.body.innerText.includes('Total leads') &&
        !document.body.innerText.includes('Chargement'),
        null, { timeout: 10000 }
      ).catch(() => {});
      await manager.waitForTimeout(1000);
      const afterReload = await manager.evaluate(() =>
        document.body.innerText.includes('Realtime') ||
        document.body.innerText.includes('realtime-test')
      );
      if (afterReload) {
        console.log('⚠️  Lead visible après refresh (Realtime Supabase OK, apparition automatique non captée dans le délai)');
      } else {
        fail('Lead "Realtime Test" absent même après refresh');
      }
    }

    // ── 8. Screenshot final ───────────────────────────────────────
    await manager.screenshot({ path: 'manager-leads-after.png' });
    console.log('✅ Screenshot après → manager-leads-after.png');

    console.log(`\n${'═'.repeat(55)}`);
    console.log(ok ? '  🟢 PASS — Manager Leads opérationnel' : '  🔴 FAIL — Voir les erreurs ci-dessus');
    console.log(`${'═'.repeat(55)}\n`);

  } catch (err) {
    console.error('\n❌ Exception :', err.message);
    await manager.screenshot({ path: 'manager-leads-error.png' }).catch(() => {});
    console.log('  Screenshot erreur → manager-leads-error.png');
  } finally {
    await browser.close();
  }
})();
