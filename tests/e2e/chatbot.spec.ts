import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/ChatPage';

const CHAT_USER = { name: 'Test User', phone: '0900123456' };

test.describe('Orange SK Biznis - Chatbot (Online chat)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.orange.sk/biznis', { waitUntil: 'load' });
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {}
    try {
      await page.getByRole('button', { name: /Odsúhlasiť a zavrieť/i }).click({ timeout: 6000 });
    } catch {}
  });

  test('chat widget sa otvorí a zobrazí správny nadpis', async ({ page }) => {
    const chatPage = new ChatPage(page);

    await test.step('Otvorenie chatu', async () => {
      await chatPage.openChat();
    });

    await test.step('Overenie nadpisu "Online chat"', async () => {
      await chatPage.verifyLoaded();
    });
  });

  test('pre-chat formulár je viditeľný po otvorení chatu', async ({ page }) => {
    const chatPage = new ChatPage(page);

    await test.step('Otvorenie chatu', async () => {
      await chatPage.openChat();
    });

    await test.step('Overenie viditeľnosti formulára', async () => {
      await chatPage.verifyPreChatFormVisible();
      await expect(page.locator('.cx-form-wrapper label').filter({ hasText: 'Meno' })).toBeVisible();
      await expect(page.locator('.cx-form-wrapper label').filter({ hasText: 'Tel. číslo' })).toBeVisible();
    });
  });

  test('vyplnenie formulára a otvorenie chatu', async ({ page }) => {
    const chatPage = new ChatPage(page);

    await test.step('Otvorenie chatu', async () => {
      await chatPage.openChat();
      await chatPage.verifyPreChatFormVisible();
    });

    await test.step('Vyplnenie mena a telefónu a odoslanie', async () => {
      await chatPage.fillPreChatForm(CHAT_USER.name, CHAT_USER.phone);
    });

    await test.step('Overenie, že chat input je dostupný', async () => {
      await expect(page.locator('.cx-message-input')).toBeVisible();
    });
  });

  test('odoslanie správy v chate', async ({ page }) => {
    const chatPage = new ChatPage(page);
    const msg = 'Dobrý deň, potrebujem informácie o firemných paušáloch.';

    await test.step('Otvorenie chatu a vyplnenie formulára', async () => {
      await chatPage.openChat();
      await chatPage.fillPreChatForm(CHAT_USER.name, CHAT_USER.phone);
    });

    await test.step('Odoslanie správy', async () => {
      await chatPage.sendMessage(msg);
    });

    await test.step('Overenie, že správa sa zobrazila', async () => {
      await chatPage.verifyMessageSent(msg);
    });
  });

  test('minimalizácia chat widgetu', async ({ page }) => {
    const chatPage = new ChatPage(page);

    await test.step('Otvorenie chatu', async () => {
      await chatPage.openChat();
    });

    await test.step('Minimalizácia widgetu', async () => {
      await chatPage.minimizeChat();
    });
  });

  test('zavretie chat widgetu', async ({ page }) => {
    const chatPage = new ChatPage(page);

    await test.step('Otvorenie chatu', async () => {
      await chatPage.openChat();
    });

    await test.step('Zatvorenie widgetu', async () => {
      await chatPage.closeChat();
    });
  });
});
