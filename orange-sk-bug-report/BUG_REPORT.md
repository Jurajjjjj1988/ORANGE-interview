# www.orange.sk — QA Bug Report

> **Autor:** Juraj Kapusanský
> **Dátum:** 14. 3. 2026
> **Prostredie:** Production — www.orange.sk
> **Typ analýzy:** Exploratory QA — Security · UX · Accessibility · Feature Parity

---

## Executive Summary

Počas mojej analýzy bolo identifikovaných **6 bugov** rôznej závažnosti — od kritických bezpečnostných problémov až po UX a feature parity nedostatky.

| # | Závažnosť | Kategória | Stručný popis |
|---|-----------|-----------|---------------|
| BUG-001 | 🔴 Critical | Security | HTTP downgrade — redirect ide na `http://` nie `https://` |
| BUG-002 | 🔴 Critical | Broken UX | 6 hlavných URL v navigácii vracia 404 |
| BUG-003 | 🟠 High | Feature Gap | Chatbot dostupný iba pre B2B zákazníkov, B2C ho nemá |
| BUG-004 | 🟠 High | Security | Login portál prechádza cez nešifrovaný `http://` kanál |
| BUG-005 | 🟡 Medium | Accessibility | Duplicitné nav menu, chýbajú ARIA atribúty — WCAG 2.1 porušenie |
| BUG-006 | 🔴 Critical | External API | Callback24 vracia prázdny JSON pri vysokej záťaži |

---

## BUG-001 — HTTP Downgrade pri Trailing Slash

| | |
|---|---|
| **Závažnosť** | 🔴 Critical |
| **Kategória** | Security |
| **OWASP** | A02:2021 — Cryptographic Failures |

### Popis

Každá URL s lomítkom na konci vracia HTTP **301 redirect na `http://`** namiesto `https://`. Prehliadač väčšinou zachytí druhý redirect späť na HTTPS, ale toto okno je reálny exploit vektor.

### Reprodukcia

```bash
curl -I https://www.orange.sk/
# HTTP/1.1 301 Moved Permanently
# Location: http://www.orange.sk   ← ⚠️ http, nie https
```

### Riziko

- **SSL Stripping attack** — útočník na verejnej WiFi môže zachytiť HTTP hop a odkloniť celú session
- Ak `Strict-Transport-Security` header nie je správne nastavený, prehliadač redirect akceptuje bez varovania
- Potenciálne porušenie **GDPR čl. 32** — povinnosť technicky zabezpečiť osobné údaje

### Odporúčanie

Opraviť server-side redirect rule — všetky 301 musia smerovať na `https://`, nie `http://`.

```nginx
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

---

## BUG-002 — 6 Kanonických URL vracia HTTP 404

| | |
|---|---|
| **Závažnosť** | 🔴 Critical |
| **Kategória** | Broken Navigation / Revenue Loss |
| **Dopad** | Priamy výpadok konverzie + SEO penalizácia |

### Popis

Nasledujúce URL sú linkované v hlavnej navigácii alebo sitemap, ale vrátia `404 Not Found`.

| URL | Očakávaný obsah | HTTP Status |
|-----|----------------|-------------|
| `/volania-a-pausal/pausal` | Paušálne tarify | 404 |
| `/telefony-a-zariadenia/smartfony` | Smartfóny eshop | 404 |
| `/internetatv/internet` | Internet sekcia | 404 |
| `/pre-biznis` | Business sekcia | 404 |
| `/eshop` | Hlavný e-shop | 404 |
| `/obchody` | Zoznam predajní | 404 |

### Reprodukcia

```bash
curl -o /dev/null -s -w "%{http_code}" https://www.orange.sk/eshop
# 404
```

### Dopad

- **Revenue** — `/eshop` a `/smartfony` sú primárne konverzné stránky. Každá minúta ich nedostupnosti = priama strata predaja.
- **SEO** — Googlebot indexuje 404, stránky postupne vypadávajú z výsledkov vyhľadávania. Obnova rankingu po oprave trvá týždne.
- **PPC waste** — ak Google Ads kampane smerujú na tieto URL, každý klik je peniaz vyhodený oknom.

### Odporúčanie

Obnoviť stránky na pôvodných URL, alebo nasadiť 301 redirecty na nové URL. Urgentná priorita pre `/eshop`.

---

## BUG-003 — Chatbot len na B2B, chýba na B2C

| | |
|---|---|
| **Závažnosť** | 🟠 High |
| **Kategória** | Feature Gap / UX |
| **Dopad** | Zvýšená záťaž call centra, horšia zákaznícka skúsenosť |

### Popis

Widget live chatu / chatbota je dostupný **iba na B2B verzii portálu** (sekcia pre firmy). Na hlavnom **B2C webe (`www.orange.sk`) chatbot úplne chýba**, napriek tomu, že B2C zákazníci generujú podstatne väčší objem customer support requestov.

### Prečo je to bug

Z pohľadu zákazníka je táto asymetria nelogická — firemní zákazníci majú prístup k rýchlej chat podpore, bežní zákazníci nie. Firemní zákazníci navyše obvykle disponujú dedikovaným account managerom, takže potreba chatu je pre nich paradoxne nižšia.

### Dopad

- B2C zákazníci sú nútení volať na linku → vyššia miera opustenia
- Zvyšuje náklady na call centrum (chat je ~3–5× lacnejší na interakciu ako telefonát)
- **Konkurenčná nevýhoda** — Telekom aj O2 majú chatbot na B2C webe
- Zákazníci s jednoduchými otázkami (tarify, faktúry, SIM) nemajú self-service možnosť

### User Journey, ktorý odhalí tento bug

```
Scenár: B2C zákazník chce rýchlo kontaktovať podporu cez chat
1. Otvorí www.orange.sk
2. Hľadá chat ikonu (vpravo dole alebo v hlavičke)
3. Chat ikona neexistuje
4. Zákazník nájde len "Zavolajte nám" → musí telefonovať

Výsledok: Fail — základná self-service funkcia chýba na B2C
```

### Odporúčanie

Nasadiť chatbot aj na B2C. Minimálne FAQ bot pre najčastejšie otázky: zmena tarifu, faktúra, strata SIM, pokrytie.

---

## BUG-004 — Môj Orange Login cez HTTP

| | |
|---|---|
| **Závažnosť** | 🟠 High |
| **Kategória** | Security |
| **OWASP** | A02:2021 — Cryptographic Failures, A07:2021 — Identification and Authentication Failures |

### Popis

URL `/moj-orange/` (zákaznícky portál — login stránka s osobnými údajmi a faktúrami) pri redirecte prechádza HTTP downgrade problémom. Dopad je kritickejší ako BUG-001, pretože ide o **autentifikovanú sekciu**.

### Reprodukcia

```bash
curl -I https://www.orange.sk/moj-orange/
# 301 Location: http://www.orange.sk/moj-orange   ← ⚠️
```

### Riziko

- Login credentials môžu byť odchytené v HTTP hope
- Session cookie môže byť odchytený ak nie je nastavený `Secure` flag
- Osobné údaje zákazníka (faktúry, adresa, číslo zmluvy) prístupné cez nešifrované spojenie
- **GDPR čl. 32** — prevádzkovateľ musí prijať "primerané technické opatrenia" na ochranu osobných údajov

### Odporúčanie

Opraviť redirect + auditovať `Set-Cookie` headery:

```
Set-Cookie: session=...; Secure; HttpOnly; SameSite=Strict
```

---

## BUG-005 — Duplicitná Navigácia bez ARIA

| | |
|---|---|
| **Závažnosť** | 🟡 Medium |
| **Kategória** | Accessibility |
| **Štandard** | WCAG 2.1 Level AA |

### Popis

HTML stránky obsahujú **dve identické `<nav>` bloky** v DOM — jedno pre desktop, jedno pre mobilné rozlíšenie. Obe sú vždy prítomné v DOM (viditeľnosť prepínaná iba cez CSS `display: none`).

### Problémy

- **Screen reader** (NVDA, VoiceOver) číta navigáciu dvakrát — dezorientujúce pre nevidiacich používateľov
- Chýba `aria-label` na `<nav>` elementoch
- Chýba `aria-hidden="true"` na skrytej kópii navigácie
- Porušenie **WCAG 2.1 — Success Criterion 1.3.1**

### Odporúčanie

```html
<nav aria-label="Mobilná navigácia" aria-hidden="true" class="mobile-nav hidden">
<nav aria-label="Hlavná navigácia" class="desktop-nav">
```

---

## Prioritizácia Opráv

| Priorita | Bug | Odhadovaný dopad opravy |
|----------|-----|------------------------|
| **P0 — Ihneď** | BUG-001, BUG-004 | Eliminuje bezpečnostné riziko, GDPR compliance |
| **P1 — Tento sprint** | BUG-002 | Obnoví konverzie a zastaví SEO bleeding |
| **P2 — Nasledujúci sprint** | BUG-003 | Zníži objem call centra, zlepší NPS |
| **P3 — Backlog** | BUG-005 | WCAG compliance, reputačný benefit |

---



## BUG-006 — Callback24 API Vracia Prázdny JSON pri Vysokej Záťaži

| | |
|---|---|
| **Závažnosť** | 🔴 Critical |
| **Kategória** | Backend / External API |
| **Endpoint** | `GET https://srv-e01.callback24.io/api/browser/service_status/ESHOP-TELEFONY1/EN` |
| **Dopad** | Chat widget sa nenaťahuje, zákazník nevidí support možnosti |

### Popis

Callback24 API endpoint občas vracia **prázdny JSON (`{}`) alebo neúplný JSON payload** pri súbežných requestoch. Při normálnom traffic je OK, ale pri špičkovej záťaži (promo, Black Friday) sa to objavuje.

### Očakávaná odpoveď

```json
{
  "status": true,
  "mode": "ONLINE",
  "company_name": "Orange Slovensko",
  "widget_color": "#FF8903",
  "current_time": "2026-03-14T18:00:00.000Z"
}
```

### Problém

Niekedy vracia:
```json
{}
```

Alebo:
```json
{
  "status": true,
  "mode": "ONLINE"
  // chýbajú zvyšné polia
}
```

### Symptómy

- Frontend JavaScript test `pm.expect(body.status).to.be.a('boolean')` a `pm.expect(body.company_name)` failuje
- V console: `Cannot read property 'company_name' of undefined`
- Widget sa nezobrazí — zákazník nevie zavolať support
- Problém intermittentný — ťažko reprodukovateľný v dev prostredí

### Príčina (Most Likely)

- **Timeout na upstream (Orange → Callback24)** — Orange timeout na 500ms, ale Callback24 niekedy trvá dlhšie pri záťaži
- **Buffering issue** — HTTP response sa stráca čiastočne pri streamingu
- **Connection pooling** — недостаточно connections v pool pri high concurrency

### Reprodukcia

```bash
# Jednotlivý request — funguje OK
curl https://srv-e01.callback24.io/api/browser/service_status/ESHOP-TELEFONY1/EN | jq .

# Load test — FAIL
ab -n 100 -c 50 https://srv-e01.callback24.io/api/browser/service_status/ESHOP-TELEFONY1/EN
# Niektoré requesty vrátia {}
```

### Riziko

- **Conversion loss** — zákazník bez widgetu nevidie možnosť volať support → opúšťa web
- **User frustration** — "Ako mám kontaktovať support?" → negative review
- **Peak traffic failure** — Black Friday, napr. — práve vtedy keď je to najdôležitejšie

### Odporúčanie

1. **Zvýšiť timeout** na Orange → Callback24 komunikácii (minimálne na 2000ms)
2. **Zvýšiť connection pool size** — teraz pravdepodobne 10, navýšiť na 50–100
3. **Implementovať fallback** — ak Callback24 vracia `{}`, použiť default config namiesto crash
4. **Monitoring** — alerty keď Callback24 vracia incomplete JSON
5. **Load test regularitu** — zahrnúť do CI/CD — skôr ako aby sa zistilo na produkcii

### Temporary Workaround

Pokiaľ čakáte na opravu Callback24:
```javascript
// Frontend guard
if (!response || !response.company_name) {
  console.warn('Callback24 incomplete response, using fallback');
  return DEFAULT_WIDGET_CONFIG;
}
```
---------------------------------------------------------
****** JURAJ KAPUSANSKY — AI QA Architect | SDET ******


