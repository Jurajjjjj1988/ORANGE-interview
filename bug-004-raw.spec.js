const { test, expect } = require('@playwright/test');

test('BUG-004: Skúška bez automatického nasledovania redirectov', async ({ browser }) => {
  console.log('\n🔍 Raw HTTP analýza bez nasledovania redirectov\n');

  const context = await browser.newContext({
    ignoreHTTPSErrors: false
  });

  const page = await context.newPage();

  // Zachytávame RAW response
  page.on('response', response => {
    console.log(`${response.status()} ${response.request().method()} ${response.url()}`);

    if (response.status() >= 300 && response.status() < 400) {
      const location = response.headers()['location'];
      console.log(`   ➜ Location header: ${location}`);

      // KONTROLA: Ide redirect z HTTPS na HTTP?
      if (response.url().startsWith('https://') && location.startsWith('http://')) {
        console.log(`   🔴 BUG: HTTPS → HTTP downgrade!`);
      }
    }
  });

  try {
    // Ide priamo bez nasledovania
    const response = await page.goto('https://www.orange.sk/moj-orange/', {
      waitUntil: 'commit' // Zastaví sa hneď po response, bez čakania na ďalšie
    });

    console.log(`\n✅ Initial response: ${response.status()}`);
    console.log(`📄 Konečná URL po goto(): ${page.url()}`);

  } catch (error) {
    console.log(`⚠️ ${error.message}`);
  }

  await context.close();
});

test('BUG-004: Priama HTTP request bez nasledovania', async ({ page }) => {
  console.log('\n🔗 Priama cURL-like simulácia\n');

  const responses = [];

  page.on('response', res => {
    responses.push({
      status: res.status(),
      url: res.url(),
      location: res.headers()['location'] || 'N/A',
      method: res.request().method()
    });
  });

  try {
    // Disable automatic redirect following?
    const response = await page.goto('https://www.orange.sk/moj-orange/', {
      waitUntil: 'networkidle',
      referer: undefined
    });

    console.log('Všetky HTTP responses:');
    responses.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.status} ${r.method} ${r.url}`);
      if (r.location !== 'N/A') {
        console.log(`     Location: ${r.location}`);
      }
    });

  } catch (error) {
    console.log(`Chyba: ${error.message}`);
  }
});
