/**
 * Consumer contract test for the Genesys Widget Config endpoint.
 *
 * This test defines what the e-shop frontend expects from the widget config
 * static file. If the file structure changes (fields renamed, removed, or
 * types changed), the contract breaks and the PR is blocked.
 *
 * Complements the Zod schema tests in playwright/ — Zod validates at runtime,
 * Pact validates at build time across service boundaries.
 */
import { PactV4, MatchersV3 } from "@pact-foundation/pact";
import { resolve } from "path";

const { like, string, boolean } = MatchersV3;

const provider = new PactV4({
  consumer: "OrangeEshopFrontend",
  provider: "GenesysWidgetConfig",
  dir: resolve(__dirname, "../../pacts"),
});

describe("Widget Config — Consumer Contract", () => {
  it("returns widget configuration with required fields", async () => {
    await provider
      .addInteraction()
      .given("widget config file exists on CDN")
      .uponReceiving("a request for widget configuration")
      .withRequest("GET", "/fileadmin/genesys/widget-config-prod.json")
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          webchatURL: string("https://apps.mypurecloud.de/widgets/9.0/"),
          statisticURL1: string("https://analytics.orange.sk/collect"),
          userData: {
            alcs_ChatBot: string("true"),
          },
        });
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(
          `${mockServer.url}/fileadmin/genesys/widget-config-prod.json`,
        );

        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body).toHaveProperty("webchatURL");
        expect(body).toHaveProperty("userData");
        expect(body.userData).toHaveProperty("alcs_ChatBot");
      });
  });

  it("webchatURL uses HTTPS", async () => {
    await provider
      .addInteraction()
      .given("widget config file exists on CDN")
      .uponReceiving("a request to verify webchat URL protocol")
      .withRequest("GET", "/fileadmin/genesys/widget-config-prod.json")
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          webchatURL: string("https://apps.mypurecloud.de/widgets/9.0/"),
          statisticURL1: string("https://analytics.orange.sk/collect"),
          userData: {
            alcs_ChatBot: string("true"),
          },
        });
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(
          `${mockServer.url}/fileadmin/genesys/widget-config-prod.json`,
        );
        const body = await res.json();

        expect(body.webchatURL).toMatch(/^https:\/\//);
      });
  });
});
