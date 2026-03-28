import { test, expect } from "@playwright/test";

const CALLBACK24_URL =
  process.env.CALLBACK24_URL || "https://srv-e01.callback24.io";
const SERVICE_ID = process.env.CALLBACK24_SERVICE_ID || "ESHOP-TELEFONY1";
const BASE_URL = process.env.ORANGE_BASE_URL || "https://www.orange.sk";
const SLA_MS = 2000;

test.describe("Smoke — availability", () => {
  test("widget config responds 200 within SLA", async ({ request }) => {
    const start = Date.now();
    const res = await request.get("/fileadmin/genesys/widget-config-prod.json");
    expect(res.status()).toBe(200);
    expect(Date.now() - start).toBeLessThan(SLA_MS);
  });

  test("i18n translations respond 200 within SLA", async ({ request }) => {
    const start = Date.now();
    const res = await request.get("/fileadmin/genesys/widgets-sk.i18n.json");
    expect(res.status()).toBe(200);
    expect(Date.now() - start).toBeLessThan(SLA_MS);
  });

  test("Callback24 vendor responds 200 within SLA", async ({ request }) => {
    const start = Date.now();
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
      { headers: { Origin: BASE_URL, Referer: `${BASE_URL}/e-shop/telefony` } },
    );
    expect(res.status()).toBe(200);
    expect(Date.now() - start).toBeLessThan(SLA_MS);
  });
});
