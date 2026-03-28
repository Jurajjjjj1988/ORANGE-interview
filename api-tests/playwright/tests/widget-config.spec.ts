import { test, expect } from "@playwright/test";
import { WidgetConfigSchema } from "../schemas/widget-config.schema";

test.describe("Widget config — schema and functional", () => {
  test("response matches Zod schema", async ({ request }) => {
    const res = await request.get("/fileadmin/genesys/widget-config-prod.json");
    const body = await res.json();
    expect(() => WidgetConfigSchema.parse(body)).not.toThrow();
  });

  test("webchatURL is a valid HTTPS URL", async ({ request }) => {
    const res = await request.get("/fileadmin/genesys/widget-config-prod.json");
    const body = WidgetConfigSchema.parse(await res.json());
    expect(body.webchatURL).toMatch(/^https:\/\/.+/);
  });

  test("alcs_ChatBot is 'true' or 'false' string", async ({ request }) => {
    const res = await request.get("/fileadmin/genesys/widget-config-prod.json");
    const body = WidgetConfigSchema.parse(await res.json());
    expect(["true", "false"]).toContain(body.userData.alcs_ChatBot);
  });

  test("statisticTimeout1 is a positive number if present", async ({
    request,
  }) => {
    const res = await request.get("/fileadmin/genesys/widget-config-prod.json");
    const body = WidgetConfigSchema.parse(await res.json());
    if (body.statisticTimeout1 !== undefined) {
      expect(body.statisticTimeout1).toBeGreaterThan(0);
    }
  });

  test("static file is served within CDN SLA (500ms)", async ({ request }) => {
    const start = Date.now();
    await request.get("/fileadmin/genesys/widget-config-prod.json");
    expect(Date.now() - start).toBeLessThan(500);
  });
});
