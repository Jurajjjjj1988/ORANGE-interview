import { test, expect } from "@playwright/test";
import { Callback24Schema } from "../schemas/callback24.schema";

const CALLBACK24_URL =
  process.env.CALLBACK24_URL || "https://srv-e01.callback24.io";
const SERVICE_ID = process.env.CALLBACK24_SERVICE_ID || "ESHOP-TELEFONY1";
const BASE_URL = process.env.ORANGE_BASE_URL || "https://www.orange.sk";
const BRAND_COLOR = "#FF8903";
const COMPANY_NAME = "Orange Slovensko";

const cb24Headers = {
  Origin: BASE_URL,
  Referer: `${BASE_URL}/e-shop/telefony`,
};

test.describe("Callback24 — schema and functional", () => {
  test("response matches Zod schema", async ({ request }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
      { headers: cb24Headers },
    );
    const body = await res.json();
    expect(() => Callback24Schema.parse(body)).not.toThrow();
  });

  test("mode is ONLINE or OFFLINE", async ({ request }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
      { headers: cb24Headers },
    );
    const body = Callback24Schema.parse(await res.json());
    expect(["ONLINE", "OFFLINE"]).toContain(body.mode);
  });

  test("company_name matches brand", async ({ request }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
      { headers: cb24Headers },
    );
    const body = Callback24Schema.parse(await res.json());
    expect(body.company_name).toBe(COMPANY_NAME);
  });

  test("widget_color matches brand hex if present", async ({ request }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
      { headers: cb24Headers },
    );
    const body = Callback24Schema.parse(await res.json());
    if (body.widget_color) {
      expect(body.widget_color.trim().toUpperCase()).toBe(
        BRAND_COLOR.toUpperCase(),
      );
    }
  });

  test("current_time is valid ISO 8601 if present", async ({ request }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
      { headers: cb24Headers },
    );
    const body = Callback24Schema.parse(await res.json());
    if (body.current_time) {
      expect(new Date(body.current_time).toString()).not.toBe("Invalid Date");
    }
  });

  test("responds within vendor SLA (1000ms)", async ({ request }) => {
    const start = Date.now();
    await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
      { headers: cb24Headers },
    );
    expect(Date.now() - start).toBeLessThan(1000);
  });
});

test.describe("Callback24 — negative", () => {
  test("invalid service ID does not return 500", async ({ request }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/NEEXISTUJUCI-SERVICE-999/EN`,
      { headers: cb24Headers },
    );
    expect(res.status()).not.toBe(500);
  });

  test("invalid service ID returns expected HTTP code", async ({ request }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/NEEXISTUJUCI-SERVICE-999/EN`,
      { headers: cb24Headers },
    );
    expect([200, 400, 404, 422]).toContain(res.status());
  });

  test("invalid service ID does not return Orange company data (DEFECT CB24-001)", async ({
    request,
  }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/NEEXISTUJUCI-SERVICE-999/EN`,
      { headers: cb24Headers },
    );
    if (res.status() === 200) {
      const body = (await res.json()) as Record<string, unknown>;
      // Known defect: returns 200 with missing status field instead of 404
      if (body.status !== undefined) {
        expect(body.status).toBe(false);
      }
      expect(body.company_name).not.toBe(COMPANY_NAME);
    }
  });
});
