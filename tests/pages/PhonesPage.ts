import { Page, expect } from '@playwright/test';

export class PhonesPage {
  constructor(private page: Page) {}

  async verifyLoaded() {
    await expect(this.page).toHaveURL(/telefon/i);
  }

  async sortBy(option: string) {
    await this.page.locator('#order').selectOption(option);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async selectTariff(tariffId: string) {
    await this.page.getByLabel('Vybrať paušál').selectOption(tariffId);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async clickPhone(name: string) {
    await this.page.waitForTimeout(2000);
    const link = this.page.locator('a', { hasText: name }).first();
    await link.waitFor({ state: 'visible' });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await this.page.waitForLoadState('networkidle');
  }
}
