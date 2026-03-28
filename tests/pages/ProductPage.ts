import { Page, expect } from '@playwright/test';

export class ProductPage {
  constructor(private page: Page) {}

  async verifyLoaded() {
    await expect(this.page.getByRole('navigation', { name: 'Omrvinková navigácia' })).toBeVisible();
    await expect(this.page.locator('h1')).toBeVisible();
  }

  async verifyPrice() {
    const price = this.page.locator('[data-content="oneTimeFeeSum"]');
    await expect(price).toBeVisible();
    await expect(price).toContainText(/€/);
  }

  async addToCart() {
    await this.page.getByRole('link', { name: 'Pridať do košíka' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
