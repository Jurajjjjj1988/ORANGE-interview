import { Page, expect } from '@playwright/test';

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  citySearch: string;
  citySelect: string;
  streetSearch: string;
  streetSelect: string;
  streetNumber: string;
}

export class CheckoutPage {
  constructor(private page: Page) {}

  async verifyLoaded() {
    await expect(this.page.getByRole('navigation', { name: 'krok' })).toBeVisible();
  }

  async continueFromSIMStep() {
    await this.page.getByRole('button', { name: 'Pokračovať' }).click();
    await expect(this.page.getByRole('group', { name: 'Ďalšie osobné údaje' })).toBeVisible();
  }

  async fillPersonalDetails(details: PersonalDetails) {
    await this.page.getByRole('textbox', { name: 'Meno' }).fill(details.firstName);
    await this.page.getByRole('textbox', { name: 'Priezvisko' }).fill(details.lastName);
    await this.page.getByRole('textbox', { name: 'Kontaktné telefónne číslo' }).fill(details.phone);
    await this.page.getByRole('textbox', { name: 'Kontaktný e-mail' }).fill(details.email);

    // Mesto autocomplete
    await this.page.locator('.selectize-control').first().locator('input[type="text"]').type(details.citySearch, { delay: 150 });
    await this.page.waitForSelector('.selectize-dropdown-content .option', { state: 'attached' });
    await this.page.locator(`.selectize-dropdown-content .option[data-value="${details.citySelect}"]`).click();

    // Ulica autocomplete
    await this.page.locator('.selectize-control').nth(1).locator('input[type="text"]').type(details.streetSearch, { delay: 150 });
    await this.page.waitForSelector('.selectize-dropdown-content .option', { state: 'attached' });
    await this.page.locator('.selectize-dropdown-content .option').first().click();

    // Číslo domu
    await this.page.locator('.selectize-input.items.not-full').click();
    await this.page.getByRole('textbox', { name: 'Číslo', exact: true }).fill(details.streetNumber);
    await this.page.locator('#mainAddress-number-field div')
      .filter({ hasText: new RegExp(`^${details.streetNumber}$`) })
      .click();

    await this.page.getByText('Som občan SR').click();
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Pokračovať' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
