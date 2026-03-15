const { test, expect } = require('@playwright/test');

test.describe('BUG-004: HTTP Downgrade na /moj-orange/', () => {

  test('❌ HTTPS redirect sa downgráduje na HTTP', async ({ page, context }) => {
    console.log('\n📍 Testovanie: https://www.orange.sk/moj-orange/ -> HTTP downgrade\n');

    // Zachytávame všetky requesty
    const requests = [];
    page.on('request', req => {
      requests.push({
        url: req.url(),
        method: req.method(),
        headers: req.headers()
      });
    });

    try {
      // Skúšame pristúpiť na HTTPS
      const response = await page.goto('https://www.orange.sk/moj-orange/', {
        waitUntil: 'networkidle'
      });

      console.log(`✅ Presmerovaný status: ${response.status()}`);
      console.log(`📄 Konečná URL: ${page.url()}`);

      // Kontrola, či nastal HTTP downgrade
      const finalUrl = page.url();
      const hasHttpDowngrade = finalUrl.startsWith('http://') && !finalUrl.startsWith('https://');

      if (hasHttpDowngrade) {
        console.log('🔴 ZISTENÝ BUG: HTTPS downgrade na HTTP!');
        console.log(`   URL prešla z HTTPS na: ${finalUrl}`);
      } else {
        console.log('✅ OK: Stránka zostala na HTTPS');
      }

      // Kontrola Set-Cookie headers
      console.log('\n📋 Cookies analýza:');
      const cookies = await context.cookies();
      cookies.forEach(cookie => {
        const secure = cookie.secure ? '✅' : '❌';
        const httpOnly = cookie.httpOnly ? '✅' : '❌';
        const sameSite = cookie.sameSite || 'none';
        console.log(`  Cookie: ${cookie.name}`);
        console.log(`    Secure: ${secure} | HttpOnly: ${httpOnly} | SameSite: ${sameSite}`);

        if (!cookie.secure) {
          console.log('    🔴 RIZIKO: Cookie bez Secure flagu!');
        }
      });

      // Kontrola redirect history
      console.log('\n🔗 Request históriu:');
      requests.slice(0, 5).forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url}`);
      });

    } catch (error) {
      console.error('⚠️ Chyba pri teste:', error.message);
    }
  });

  test('🔍 Kontrola HTTP vs HTTPS na /moj-orange/', async ({ browser }) => {
    console.log('\n🔍 Porovnanie HTTP vs HTTPS:\n');

    // Test HTTPS
    const contextHttps = await browser.newContext();
    const pageHttps = await contextHttps.newPage();
    const redirectsHttps = [];

    pageHttps.on('response', res => {
      if (res.status() >= 300 && res.status() < 400) {
        redirectsHttps.push({
          status: res.status(),
          location: res.headers()['location'],
          url: res.url()
        });
      }
    });

    try {
      await pageHttps.goto('https://www.orange.sk/moj-orange/', {
        timeout: 10000,
        waitUntil: 'networkidle'
      });

      console.log('HTTPS variant:');
      console.log(`  Konečná URL: ${pageHttps.url()}`);

      if (redirectsHttps.length > 0) {
        console.log('  Redirecty:');
        redirectsHttps.forEach((r, i) => {
          console.log(`    ${i + 1}. ${r.status} → ${r.location}`);
        });
      }
    } catch (e) {
      console.log(`  ⚠️ Chyba: ${e.message}`);
    }

    await contextHttps.close();
  });
});
