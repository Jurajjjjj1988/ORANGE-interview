import { Page, expect } from '@playwright/test';

export class ChatPage {
  constructor(private page: Page) {}

  async openChat() {
    await this.page.getByRole('button', { name: 'Sme online' }).click();
    await this.page.locator('.cx-titlebar').waitFor({ state: 'visible', timeout: 10000 });
  }

  async verifyLoaded() {
    await expect(this.page.locator('.cx-title')).toContainText('Online chat');
    await expect(this.page.locator('.cx-titlebar')).toBeVisible();
  }

  async fillPreChatForm(name: string, phone: string) {
    await this.page.getByRole('textbox', { name: 'Meno', exact: true }).fill(name);
    await this.page.getByRole('textbox', { name: 'Tel. číslo' }).fill(phone);
    await this.page.getByRole('button', { name: 'Odoslať', exact: true }).click();
    await this.page.getByRole('textbox', { name: 'Napíšte Vašu požiadavku 500' }).waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyPreChatFormVisible() {
    await expect(this.page.getByRole('textbox', { name: 'Meno', exact: true })).toBeVisible();
    await expect(this.page.getByRole('textbox', { name: 'Tel. číslo' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Odoslať', exact: true })).toBeVisible();
  }

  async sendMessage(message: string) {
    const textarea = this.page.getByRole('textbox', { name: 'Napíšte Vašu požiadavku 500' });
    await textarea.fill(message);
    await textarea.press('Enter');
  }

  async verifyMessageSent(message: string) {
    const sentMsg = this.page.locator('.cx-transcript .cx-message').filter({ hasText: message });
    await expect(sentMsg.first()).toBeVisible({ timeout: 10000 });
  }

  async waitForBotReply(timeout = 20000) {
    // Wait for an agent/bot message in transcript
    const botMsg = this.page.locator('.cx-transcript .cx-message.cx-them, .cx-transcript .cx-participant-label');
    await botMsg.first().waitFor({ state: 'visible', timeout });
  }

  async minimizeChat() {
    // Use Genesys Bus API to avoid triggering page navigation
    await this.page.evaluate(() => {
      (window as any).CXBus?.command('WebChat.minimize');
    });
    await expect(this.page.locator('.cx-body')).not.toBeVisible({ timeout: 5000 });
  }

  async closeChat() {
    // Use Genesys Bus API to avoid triggering page navigation
    await this.page.evaluate(() => {
      (window as any).CXBus?.command('WebChat.close');
    });
    // Confirm dialog "Naozaj chcete ukončiť..." — click Áno if it appears
    const confirmBtn = this.page.locator('button.cx-close-confirm, button.cx-end-confirm');
    try {
      await confirmBtn.first().waitFor({ state: 'visible', timeout: 3000 });
      await confirmBtn.first().click();
    } catch {}
  }
}
