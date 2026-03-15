import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.orange.sk/');
  await page.getByRole('button', { name: 'Odsúhlasiť a zavrieť: Odsú' }).click();
  await page.getByRole('img', { name: 'callback_widget' }).click();
  await page.goto('https://www.orange.sk/e-shop/volania-a-pausaly/prehlad-pausalov');
  await page.getByRole('button', { name: 'Telefóny a zariadenia' }).click();
  await page.locator('#mm-dropdown-telefony').getByRole('link', { name: 'Telefóny', exact: true }).click();
  await page.locator('iframe[name="a-ts5fk2bj5e8y"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-ts5fk2bj5e8y"]').contentFrame().locator('[id="13"]').click();
  await page.locator('iframe[name="c-ts5fk2bj5e8y"]').contentFrame().locator('[id="9"]').click();
  await page.locator('iframe[name="c-ts5fk2bj5e8y"]').contentFrame().locator('[id="8"]').click();
  await page.locator('iframe[name="c-ts5fk2bj5e8y"]').contentFrame().locator('[id="12"]').click();
  await page.locator('iframe[name="c-ts5fk2bj5e8y"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  try {
    await page.getByRole('button', { name: 'Accept all' }).click({ timeout: 6000 });
  } catch {}
  await page.getByRole('link', { name: 'Orange: Pridajte sa k najlepš' }).click();
  await page.getByRole('link', { name: 'Pre biznis' }).click();
  await page.getByRole('button', { name: 'Odsúhlasiť a zavrieť: Odsú' }).click();
  await expect(page.locator('body')).toMatchAriaSnapshot(`- button "Sme online"`);
  await page.getByRole('button', { name: 'Sme online' }).click();
  await page.getByRole('textbox', { name: 'Meno', exact: true }).click();
  await page.getByRole('textbox', { name: 'Meno', exact: true }).fill('juraj kapusansky');
  await page.getByRole('textbox', { name: 'Tel. číslo' }).click();
  await page.getByRole('textbox', { name: 'Tel. číslo' }).fill('0917863834');
  await page.getByRole('button', { name: 'Odoslať', exact: true }).click();
  await page.getByRole('textbox', { name: 'Napíšte Vašu požiadavku 500' }).click();
  await page.getByRole('textbox', { name: 'Napíšte Vašu požiadavku 500' }).fill('Ahoj');
});
