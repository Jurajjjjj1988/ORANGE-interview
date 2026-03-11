# Orange SK — E2E Test Suite

![Playwright](https://img.shields.io/badge/Playwright-1.x-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![CI](https://img.shields.io/badge/CI-GitHub_Actions_(planned)-2088FF?logo=github-actions&logoColor=white)

---

## O projekte / About

**SK:** Automatizované end-to-end testy pre e-shop [orange.sk](https://www.orange.sk).
Pokrývajú kompletný nákupný flow — od výberu telefónu až po vyplnenie osobných údajov v pokladni.

**EN:** Automated end-to-end tests for the [orange.sk](https://www.orange.sk) e-shop.
Covers the full purchase flow — from phone selection to personal details at checkout.

---

## Štruktúra projektu / Project Structure

```
CLAUDE/
├── pages/
│   ├── HomePage.ts        # Úvodná stránka, cookie banner
│   ├── PhonesPage.ts      # Zoznam telefónov, filter, zoradenie
│   ├── ProductPage.ts     # Detail produktu, overenie ceny
│   ├── CartPage.ts        # Košík, výber SIM, pridanie služieb
│   └── CheckoutPage.ts    # Pokladňa, osobné údaje, Selectize autocomplete
├── test.spec.ts           # Hlavný test scenár
├── playwright.config.ts   # Globálna konfigurácia timeoutov
├── CHANGELOG.md
└── README.md
```

---

## Inštalácia / Installation

```bash
# Klonovanie repozitára
git clone <repo-url>
cd CLAUDE

# Inštalácia závislostí
npm install

# Inštalácia Playwright browserov
npx playwright install chromium
```

---

## Spustenie testov / Running Tests

```bash
# Headless (CI)
npx playwright test

# Headed (vizuálne ladenie)
npx playwright test --headed

# Konkrétny súbor
npx playwright test test.spec.ts

# S trace pre debugging
npx playwright test --trace on

# HTML report
npx playwright show-report
```

---

## Test scenáre / Test Scenarios

### `test.spec.ts` — Nákup iPhone 17 Pro Max

| Krok | Popis |
|------|-------|
| 1 | Otvorenie homepage a akceptovanie cookie bannera |
| 2 | Overenie načítania homepage |
| 3 | Navigácia na stránku telefónov |
| 4 | Zoradenie podľa ceny zostupne |
| 5 | Výber paušálu (Veľký paušál) |
| 6 | Kliknutie na produkt iPhone 17 Pro Max |
| 7 | Overenie ceny na stránke produktu |
| 8 | Pridanie do košíka |
| 9 | Výber Elektronickej SIM |
| 10 | Pridanie doplnkových služieb |
| 11 | Prechod na checkout |
| 12 | Vyplnenie osobných údajov (meno, adresa, kontakt) |
| 13 | Odoslanie objednávky |

---

## Page Object Model

Každá stránka má samostatnú triedu v `/pages/`. Triedy zapuzdrujú selektory a akcie — test samotný obsahuje len business logiku.

```
Test (test.spec.ts)
  └── HomePage      → goto(), acceptCookies(), navigateToPhones()
  └── PhonesPage    → sortBy(), selectTariff(), clickPhone()
  └── ProductPage   → verifyLoaded(), verifyPrice(), addToCart()
  └── CartPage      → selectElectronicSIM(), addServices(), continue()
  └── CheckoutPage  → fillPersonalDetails(), submit()
```

---

## Konfigurácia / Configuration

`playwright.config.ts`:

```ts
timeout: 120000        // Celkový limit na test
actionTimeout: 15000   // Každá akcia (click, fill, waitFor)
navigationTimeout: 30000  // Navigácie a waitForLoadState
```

Test dáta sú definované ako konštanty v `test.spec.ts` — žiadne hardcoded hodnoty v Page Objects.

---

## Known Issues

### Livewire komponenty
Filtre (zoradenie, výber paušálu) sú Livewire komponenty — po zmene spúšťajú AJAX na vlastný endpoint (nie `/telefony`).
**Riešenie:** `waitForLoadState('networkidle')` + `waitForTimeout(2000)` po každej zmene.

### Selectize dropdowns
Autocomplete polia pre mesto a ulicu nie sú štandardné `<select>` elementy — Playwright ich nedokáže ovládať cez `getByRole('combobox')`.
**Riešenie:** `locator('.selectize-control').locator('input[type="text"]')` + `type({ delay: 150 })` pre spoľahlivé triggrovanie autocomplete.

### Cookie banner
Text tlačidla sa môže líšiť podľa A/B testu alebo jazykovej varianty.
**Riešenie:** `Promise.race()` s viacerými kandidátmi + `try/catch` fallback.

### Dynamické ceny
Ceny sa menia podľa zvoleného paušálu.
**Riešenie:** Overujeme len formát `/\d+\s*€/`, nikdy konkrétnu hodnotu.

---

## Autor / Author

**Juraj Kapušanský**
QA Automation Engineer

