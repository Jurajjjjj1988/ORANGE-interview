import { test } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { PhonesPage } from './pages/PhonesPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage, PersonalDetails } from './pages/CheckoutPage';

// --- Test data ---
const CUSTOMER: PersonalDetails = {
  firstName: 'Ján',
  lastName: 'Testovací',
  phone: '0901234567',
  email: 'jan.testovaci@mailinator.com',
  citySearch: 'Bratislava',
  citySelect: 'Bratislava',
  streetSearch: 'Hlavná',
  streetSelect: 'Hlavná',
  streetNumber: '1',
};

const TARIFF_ID = '13092700'; // Veľký paušál
const PHONE_NAME = 'iPhone 17 Pro Max';

// --- Cookie hook ---
test.beforeEach(async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.acceptCookies();
});

// --- Test ---
test('Orange SK - nákup iPhone 17 Pro Max do košíka', async ({ page }) => {
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
    await phonesPage.selectTariff(TARIFF_ID);
  });

  await test.step(`Výber produktu: ${PHONE_NAME}`, async () => {
    await phonesPage.clickPhone(PHONE_NAME);
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
    await checkoutPage.fillPersonalDetails(CUSTOMER);
    await checkoutPage.submit();
  });
});
