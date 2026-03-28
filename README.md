# Orange SK — API Test Suite

API tests for orange.sk, focused on the Genesys chat widget and Callback24 vendor integration on `/e-shop/telefony`.

Endpoints were mapped from HAR traffic capture — no Swagger available for this part of the site.

## Structure

```
api-tests/
  playwright/          # code-based tests — schema validation + functional
    schemas/           # Zod schemas for response contracts
    tests/
  postman/             # manual collection — useful for quick ad-hoc checks
    collections/
    environments/
```

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` if you want to override the default endpoints.

## Running tests

```bash
# Playwright API tests (runs in CI)
npm test

# Postman via Newman
npm run test:postman
```

## What's covered

**Playwright (`api-tests/playwright/tests/`)**

| File                        | What it tests                                     |
| --------------------------- | ------------------------------------------------- |
| `smoke.spec.ts`             | All 3 endpoints return 200 within SLA             |
| `widget-config.spec.ts`     | Zod schema, HTTPS URL, CDN response time          |
| `callback24.spec.ts`        | Schema, brand data, negative (invalid service ID) |
| `brand-consistency.spec.ts` | SK and EN locales return identical brand data     |

**Postman (`api-tests/postman/`)**

Same endpoints, 9 requests split into `[SMOKE]`, `[FUNC+DATA]`, `[PERF]`, `[NEG]` categories.

## Known issues

**DEFECT CB24-001** — Callback24 returns HTTP 200 for a non-existent service ID but the `status` field is missing instead of being `false`. Vendor-side bug, documented in the negative test.

`POST /e-shop/livewire/update` is not covered — requires a CSRF token from a live session.

## CI

Runs on every push and PR. Scheduled daily at 07:00 on weekdays to catch overnight regressions.
