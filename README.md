# Orange SK — API Test Suite

API tests for orange.sk, focused on the Genesys chat widget and Callback24 vendor integration on `/e-shop/telefony`.

Endpoints were mapped from HAR traffic capture — no Swagger available for this part of the site.

## Structure

```
api-tests/
  playwright/          # code-based tests — schema validation + functional
    schemas/           # Zod schemas for response contracts
    tests/
  pact-tests/          # consumer-driven contract tests (Pact)
  postman/             # manual collection — useful for quick ad-hoc checks
    collections/
    environments/
pacts/                 # generated Pact contract JSON files (gitignored)
```

## Testing layers

Three testing approaches for the same endpoints — each catches different problems:

| Layer               | Tool             | What it catches                                    | When it runs                        |
| ------------------- | ---------------- | -------------------------------------------------- | ----------------------------------- |
| Contract tests      | Pact             | Breaking changes in API structure between services | On PR — fast, no live server needed |
| Schema + functional | Playwright + Zod | Runtime validation, SLA, business rules            | On PR + daily — hits live endpoints |
| Ad-hoc exploration  | Postman          | Quick manual checks during development             | Manual                              |

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` if you want to override the default endpoints.

## Running tests

```bash
# Pact contract tests (consumer side)
npm run test:pact

# Playwright API tests (runs in CI)
npm test

# Postman via Newman
npm run test:postman

# Everything
npm run test:all
```

## What's covered

**Pact Contract Tests (`api-tests/pact-tests/`)**

| File                             | What it tests                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `widget-config.consumer.spec.ts` | Widget config contract — required fields, HTTPS URL, response structure                                    |
| `callback24.consumer.spec.ts`    | Callback24 contract — service status fields, brand consistency across locales, invalid service ID handling |

**Playwright (`api-tests/playwright/tests/`)**

| File                        | What it tests                                     |
| --------------------------- | ------------------------------------------------- |
| `smoke.spec.ts`             | All 3 endpoints return 200 within SLA             |
| `widget-config.spec.ts`     | Zod schema, HTTPS URL, CDN response time          |
| `callback24.spec.ts`        | Schema, brand data, negative (invalid service ID) |
| `brand-consistency.spec.ts` | SK and EN locales return identical brand data     |

**Postman (`api-tests/postman/`)**

Same endpoints, 9 requests split into `[SMOKE]`, `[FUNC+DATA]`, `[PERF]`, `[NEG]` categories.

## Why both Pact and Zod?

Different tools for different problems. Zod validates at runtime against a live endpoint — it catches data issues in real responses. Pact validates at build time without a live server — it catches structural breaking changes before deployment. If the Callback24 vendor renames a field, Pact catches it on the PR. If the vendor returns an unexpected value in a valid field, Zod catches it at runtime.

## Known issues

**DEFECT CB24-001** — Callback24 returns HTTP 200 for a non-existent service ID but the `status` field is missing instead of being `false`. Vendor-side bug, documented in the negative test.

`POST /e-shop/livewire/update` is not covered — requires a CSRF token from a live session.

## CI

Runs on every push and PR. Scheduled daily at 07:00 on weekdays to catch overnight regressions.
