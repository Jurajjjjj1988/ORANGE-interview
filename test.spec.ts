import { test } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { PhonesPage } from './pages/PhonesPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CUSTOMERS, PHONES, TARIFFS } from './data/testData';

test.describe('Orange SK - nákupný flow', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.acceptCookies();
  });

  test('nákup iPhone 17 Pro Max do košíka', async ({ page }) => {
    const homePage = new HomePage(page);
    const phonesPage = new PhonesPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step('Overenie homepage', async () => {
      await homePage.verifyLoaded();
    });

    await test.step('Navigácia na stránku telefónov', async () => {
      await homePage.navigateToPhones();
      await phonesPage.verifyLoaded();
    });

    await test.step('Zoradenie podľa ceny (zostupne) a výber paušálu', async () => {
      await phonesPage.sortBy('price_desc');
      await phonesPage.selectTariff(TARIFFS.VELKY_PAUSAL);
    });

    await test.step(`Výber produktu: ${PHONES.IPHONE_17_PRO_MAX}`, async () => {
      await phonesPage.clickPhone(PHONES.IPHONE_17_PRO_MAX);
      await productPage.verifyLoaded();
      await productPage.verifyPrice();
    });

    await test.step('Pridanie do košíka', async () => {
      await productPage.addToCart();
      await cartPage.verifyLoaded();
    });

    await test.step('Výber Elektronickej SIM a pridanie služieb', async () => {
      await cartPage.selectElectronicSIM();
      await cartPage.addServices();
      await cartPage.continue();
    });

    await test.step('Prechod na osobné údaje', async () => {
      await checkoutPage.verifyLoaded();
      await checkoutPage.continueFromSIMStep();
    });

    await test.step('Vyplnenie osobných údajov', async () => {
      await checkoutPage.fillPersonalDetails(CUSTOMERS.DEFAULT);
      await checkoutPage.submit();
    });
  });
});
