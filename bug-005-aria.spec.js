const { test, expect } = require('@playwright/test');

test.describe('BUG-005: Duplicitná navigácia bez ARIA', () => {

  test('🔍 Analýza <nav> elementov a ARIA atribútov', async ({ page }) => {
    console.log('\n📍 Testovanie: Duplicitná navigácia na /moj-orange/\n');

    try {
      await page.goto('https://www.orange.sk/moj-orange/', {
        waitUntil: 'networkidle'
      });

      // Vyhľadanie všetkých <nav> elementov
      const navElements = await page.locator('nav').all();
      console.log(`📊 Nájdených <nav> elementov: ${navElements.length}`);

      if (navElements.length > 1) {
        console.log('🔴 BUG: Viacero <nav> elementov!');
      }

      for (let i = 0; i < navElements.length; i++) {
        const nav = navElements[i];
        const ariaLabel = await nav.getAttribute('aria-label');
        const ariaHidden = await nav.getAttribute('aria-hidden');
        const display = await nav.evaluate(el => window.getComputedStyle(el).display);
        const innerHTML = await nav.innerHTML();
        const contentPreview = innerHTML.substring(0, 100).replace(/\n/g, ' ');

        console.log(`\n✏️ NAV #${i + 1}:`);
        console.log(`  aria-label: ${ariaLabel || '❌ CHÝBA'}`);
        console.log(`  aria-hidden: ${ariaHidden || '❌ CHÝBA'}`);
        console.log(`  display: ${display}`);
        console.log(`  preview: ${contentPreview}...`);

        if (!ariaLabel && !ariaHidden) {
          console.log(`  🔴 RIZIKO: Bez ARIA atribútov - screen reader si všimne duplikát`);
        }
      }

      // Kontrola duplikátnosti HTML
      console.log('\n🔄 Kontrola duplikátnosti:');
      const navHTMLs = await Promise.all(
        navElements.map(nav => nav.innerHTML())
      );

      const firstNavHTML = navHTMLs[0];
      let duplicateCount = 0;

      navHTMLs.forEach((html, idx) => {
        if (html === firstNavHTML) {
          duplicateCount++;
          if (idx > 0) {
            console.log(`  🔴 NAV #${idx + 1} je identický s NAV #1`);
          }
        }
      });

      if (duplicateCount > 1) {
        console.log(`\n⚠️ NÁJDENÉ: ${duplicateCount} identických <nav> elementov`);
      }

    } catch (error) {
      console.error('⚠️ Chyba pri teste:', error.message);
    }
  });

  test('🎙️ Screen reader simulácia - zistenie duplikátov', async ({ page }) => {
    console.log('\n🎙️ Simulácia screen readeru...\n');

    try {
      await page.goto('https://www.orange.sk/moj-orange/', {
        waitUntil: 'networkidle'
      });

      // Simulácia čítania navigačného prvku
      const navCount = await page.locator('nav').count();
      const navs = await page.locator('nav').all();

      console.log(`📢 Screen reader by si všimol: "${navCount} navegačných prvkov"`);

      for (let i = 0; i < navs.length; i++) {
        const nav = navs[i];

        // Čítame text obsahu
        const textContent = await nav.textContent();
        const textPreview = textContent.substring(0, 50).replace(/\s+/g, ' ');

        // Čítame všetky role
        const role = await nav.getAttribute('role') || 'navigation (implicitná role)';

        console.log(`\n  🔹 Element ${i + 1}: <nav role="${role}">`);
        console.log(`     Obsah: "${textPreview}..."`);
        console.log(`     Viditeľný: ${await nav.isVisible() ? '✅' : '❌ SKRYTÝ'}`);
      }

      // WCAG 2.1 SC 1.3.1 - Info and Relationships
      console.log('\n📋 WCAG 2.1 Kontrola SC 1.3.1:');
      if (navCount > 1) {
        const ariaLabeled = await Promise.all(
          navs.map(nav => nav.getAttribute('aria-label'))
        );

        const hasProperLabels = ariaLabeled.every(label => label !== null);

        if (!hasProperLabels) {
          console.log('  🔴 PORUŠENIE: Duplicitné <nav> bez unique aria-label');
          console.log('  👉 Riešenie: Pridať aria-label na obe navigácie');
          console.log('     Príklad:');
          console.log('       <nav aria-label="Hlavné menu"> ... </nav>');
          console.log('       <nav aria-label="Mobilné menu" aria-hidden="true"> ... </nav>');
        }
      }

    } catch (error) {
      console.error('⚠️ Chyba:', error.message);
    }
  });
});
