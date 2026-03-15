import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://www.orange.sk/');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoaded() {
    await expect(this.page.getByRole('link', { name: 'Domov je tu' })).toBeVisible();
  }

  async acceptCookies() {
    const candidates = [
      this.page.getByRole('button', { name: /Odsúhlasiť a zavrieť/i }),
      this.page.getByRole('button', { name: /Prijať všetky/i }),
      this.page.getByRole('button', { name: /Súhlasím/i }),
      this.page.getByRole('button', { name: /Accept/i }),
    ];

    try {
      const visible = await Promise.race(
        candidates.map(btn =>
          btn.waitFor({ state: 'visible', timeout: 8000 }).then(() => btn)
        )
      );
      await visible.click();
    } catch {
      // Cookie banner sa nezobrazil alebo bol už zatvorený
    }
  }

  async navigateToPhones() {
    await this.page.getByRole('main').getByRole('link', { name: 'Telefóny' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
