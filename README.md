# Orange SK — Test Suite

Testy pre e-shop **orange.sk**. Repozitár pokrýva dve oblasti:

- **E2E testy** (Playwright) — nákupný flow od výberu telefónu po checkout
- **API testy** (Postman) — Genesys widget a Callback24 na `/e-shop/telefony`

---

## Štruktúra projektu

```
ORANGE-interview/
├── pages/
│   ├── HomePage.ts          # homepage, cookie banner
│   ├── PhonesPage.ts        # zoznam telefónov, filter, zoradenie
│   ├── ProductPage.ts       # detail produktu, overenie ceny
│   ├── CartPage.ts          # košík, výber SIM, pridanie služieb
│   └── CheckoutPage.ts      # pokladňa, osobné údaje, Selectize autocomplete
├── test.spec.ts
├── playwright.config.ts
├── api-tests/
│   ├── collections/
│   │   └── orange-sk-eshop.postman_collection.json
│   └── environments/
│       └── production.postman_environment.json
├── CHANGELOG.md
└── README.md
```

---

## E2E testy (Playwright)

### Inštalácia

```bash
git clone <repo-url>
cd ORANGE-interview
npm install
npx playwright install chromium
```

### Spustenie

```bash
npx playwright test                 # headless
npx playwright test --headed        # s prehliadačom
npx playwright test --trace on      # s trace pre debug
npx playwright show-report
```

### Scenár — Nákup iPhone 17 Pro Max

Pokrytý celý flow: homepage → akceptovanie cookies → stránka telefónov → zoradenie podľa ceny → výber paušálu → detail produktu → overenie ceny → košík → eSIM → doplnkové služby → checkout → osobné údaje.

### Page Object Model

```
test.spec.ts
  └── HomePage      → goto(), acceptCookies(), navigateToPhones()
  └── PhonesPage    → sortBy(), selectTariff(), clickPhone()
  └── ProductPage   → verifyLoaded(), verifyPrice(), addToCart()
  └── CartPage      → selectElectronicSIM(), addServices(), continue()
  └── CheckoutPage  → fillPersonalDetails(), submit()
```

Selektory a akcie sú zapuzdrené v triedach — `test.spec.ts` obsahuje len business logiku. Test dáta sú konštanty priamo v teste, nie v Page Objects.

### Timeouty (`playwright.config.ts`)

| | |
|---|---|
| Test celkovo | 120 000 ms |
| Každá akcia | 15 000 ms |
| Navigácia | 30 000 ms |

---

## API testy (Postman)

Endpointy boli zdokumentované z HAR zachytenia reálnej prevádzky — Swagger pre túto časť webu jednoducho neexistuje.

### Pokryté endpointy

| Endpoint | Popis |
|----------|-------|
| `GET /fileadmin/genesys/widget-config-prod.json` | konfigurácia Genesys widgetu |
| `GET /fileadmin/genesys/widgets-sk.i18n.json` | i18n preklady |
| `GET srv-e01.callback24.io/.../ESHOP-TELEFONY1/EN` | stav Callback24 služby |

Kolekcia má 8 requestov: `[SMOKE]` dostupnosť, `[FUNC+DATA]` obsah a formáty, `[PERF]` SLA limity, `[NEG]` chybové stavy.

### Spustenie cez Newman

```bash
npm install -g newman
newman run api-tests/collections/orange-sk-eshop.postman_collection.json \
  -e api-tests/environments/production.postman_environment.json
```

---

## Known issues

**Livewire filtre (E2E)** — zoradenie a výber paušálu triggerujú AJAX cez Livewire. Po každej zmene treba `waitForLoadState('networkidle')` + `waitForTimeout(2000)`, inak testy občas failujú na race condition.

**Selectize dropdowns (E2E)** — polia pre mesto a ulicu nie sú štandardné `<select>`. Funguje `.selectize-control input[type="text"]` + `type({ delay: 150 })` kvôli spoľahlivému triggrovaniu autocomplete.

**Cookie banner (E2E)** — text tlačidla sa líši podľa A/B testu, riešené cez `Promise.race()` s viacerými kandidátmi.

**Dynamické ceny (E2E)** — závisí od zvoleného paušálu, preto overujem len formát `/\d+\s*€/`.

**DEFECT CB24-001 (API)** — Callback24 vracia HTTP 200 pre neexistujúci service ID, ale pole `status` v odpovedi chýba namiesto `false`. Test to loguje ako `console.warn` a nepretrhne pipeline. Chyba je na strane vendora.

`POST /e-shop/livewire/update` nie je pokrytý — vyžaduje CSRF token zo živej session.

---

Juraj Kapušanský — QA Automation Engineer
