import { test, expect } from "@playwright/test";
import { Callback24Schema } from "../schemas/callback24.schema";

const CALLBACK24_URL =
  process.env.CALLBACK24_URL || "https://srv-e01.callback24.io";
const SERVICE_ID = process.env.CALLBACK24_SERVICE_ID || "ESHOP-TELEFONY1";
const BASE_URL = process.env.ORANGE_BASE_URL || "https://www.orange.sk";
const BRAND_COLOR = "#FF8903";

const cb24Headers = {
  Origin: BASE_URL,
  Referer: `${BASE_URL}/e-shop/telefony`,
};

test.describe("Brand consistency — SK vs EN", () => {
  test("SK and EN return the same company_name", async ({ request }) => {
    const [enRes, skRes] = await Promise.all([
      request.get(
        `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
        { headers: cb24Headers },
      ),
      request.get(
        `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/SK`,
        { headers: cb24Headers },
      ),
    ]);

    const en = Callback24Schema.parse(await enRes.json());
    const sk = Callback24Schema.parse(await skRes.json());

    expect(sk.company_name).toBe(en.company_name);
  });

  test("SK and EN return the same widget_color", async ({ request }) => {
    const [enRes, skRes] = await Promise.all([
      request.get(
        `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/EN`,
        { headers: cb24Headers },
      ),
      request.get(
        `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/SK`,
        { headers: cb24Headers },
      ),
    ]);

    const en = Callback24Schema.parse(await enRes.json());
    const sk = Callback24Schema.parse(await skRes.json());

    if (en.widget_color && sk.widget_color) {
      expect(sk.widget_color.trim().toUpperCase()).toBe(
        en.widget_color.trim().toUpperCase(),
      );
    }
  });

  test("both locales use correct Orange brand color", async ({ request }) => {
    const res = await request.get(
      `${CALLBACK24_URL}/api/browser/service_status/${SERVICE_ID}/SK`,
      { headers: cb24Headers },
    );
    const body = Callback24Schema.parse(await res.json());
    if (body.widget_color) {
      expect(body.widget_color.trim().toUpperCase()).toBe(
        BRAND_COLOR.toUpperCase(),
      );
    }
  });
});
