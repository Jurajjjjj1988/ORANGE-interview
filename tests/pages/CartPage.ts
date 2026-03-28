import { Page, expect } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async verifyLoaded() {
    await expect(this.page).toHaveURL(/objednavka\/nastavenia/);
    await expect(this.page.getByRole('navigation', { name: 'krok' })).toBeVisible();
  }

  async selectElectronicSIM() {
    await this.page.getByRole('radio', { name: 'Elektronická SIM' }).check();
  }

  private async clickServiceButton(locator: ReturnType<Page['getByRole']>) {
    await locator.waitFor({ state: 'visible' });
    await expect(locator).toBeEnabled();
    await locator.click();
    await locator.waitFor({ state: 'detached' }).catch(() => {});
  }

  async addServices() {
    await this.page.getByRole('button', { name: 'Pridať služby' }).click();
    await expect(this.page.getByRole('heading', { name: 'Online ochrana' })).toBeVisible();

    const btn = () => this.page.getByRole('button', { name: 'Pridať službu' });

    await this.clickServiceButton(btn().first());
    await this.clickServiceButton(btn().first());
    await this.clickServiceButton(btn().nth(1));
    await this.clickServiceButton(
      this.page.getByLabel('Dátové balíky a služby').getByRole('button', { name: 'Pridať službu' })
    );
  }

  async continue() {
    await this.page.getByRole('link', { name: 'Pokračovať' }).click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.getByRole('navigation', { name: 'krok' })).toBeVisible();
  }
}
