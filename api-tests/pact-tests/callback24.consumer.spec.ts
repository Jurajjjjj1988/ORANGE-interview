/**
 * Consumer contract test for the Callback24 vendor API.
 *
 * Callback24 is a third-party service that provides callback widget
 * functionality on the Orange SK e-shop. This contract defines what
 * the e-shop expects from the vendor's service_status endpoint.
 *
 * If the vendor changes their response format, the contract breaks
 * and we catch it before it hits production — instead of finding out
 * when the widget stops working for customers.
 */
import { PactV4, MatchersV3 } from "@pact-foundation/pact";
import { resolve } from "path";

const { like, string, boolean, regex } = MatchersV3;

const provider = new PactV4({
  consumer: "OrangeEshopFrontend",
  provider: "Callback24VendorAPI",
  dir: resolve(__dirname, "../../pacts"),
});

const SERVICE_ID = "ESHOP-TELEFONY1";

describe("Callback24 — Consumer Contract", () => {
  it("returns service status with required fields", async () => {
    await provider
      .addInteraction()
      .given("service ESHOP-TELEFONY1 is registered and active")
      .uponReceiving("a request for service status")
      .withRequest(
        "GET",
        `/api/browser/service_status/${SERVICE_ID}/EN`,
        (builder) => {
          builder.headers({
            Origin: "https://www.orange.sk",
            Referer: "https://www.orange.sk/e-shop/telefony",
          });
        },
      )
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          status: boolean(true),
          mode: regex("ONLINE|OFFLINE", "ONLINE"),
          company_name: string("Orange Slovensko"),
        });
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(
          `${mockServer.url}/api/browser/service_status/${SERVICE_ID}/EN`,
          {
            headers: {
              Origin: "https://www.orange.sk",
              Referer: "https://www.orange.sk/e-shop/telefony",
            },
          },
        );

        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body).toHaveProperty("status");
        expect(body).toHaveProperty("mode");
        expect(body).toHaveProperty("company_name");
        expect(typeof body.status).toBe("boolean");
      });
  });

  it("returns consistent brand data for SK locale", async () => {
    await provider
      .addInteraction()
      .given("service ESHOP-TELEFONY1 is registered and active")
      .uponReceiving("a request for service status in SK locale")
      .withRequest(
        "GET",
        `/api/browser/service_status/${SERVICE_ID}/SK`,
        (builder) => {
          builder.headers({
            Origin: "https://www.orange.sk",
            Referer: "https://www.orange.sk/e-shop/telefony",
          });
        },
      )
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          status: boolean(true),
          mode: regex("ONLINE|OFFLINE", "ONLINE"),
          company_name: string("Orange Slovensko"),
        });
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(
          `${mockServer.url}/api/browser/service_status/${SERVICE_ID}/SK`,
          {
            headers: {
              Origin: "https://www.orange.sk",
              Referer: "https://www.orange.sk/e-shop/telefony",
            },
          },
        );

        const body = await res.json();
        expect(body.company_name).toBe("Orange Slovensko");
      });
  });

  it("handles invalid service ID gracefully", async () => {
    await provider
      .addInteraction()
      .given("service INVALID-999 does not exist")
      .uponReceiving("a request for non-existent service status")
      .withRequest(
        "GET",
        "/api/browser/service_status/INVALID-999/EN",
        (builder) => {
          builder.headers({
            Origin: "https://www.orange.sk",
            Referer: "https://www.orange.sk/e-shop/telefony",
          });
        },
      )
      .willRespondWith(404)
      .executeTest(async (mockServer) => {
        const res = await fetch(
          `${mockServer.url}/api/browser/service_status/INVALID-999/EN`,
          {
            headers: {
              Origin: "https://www.orange.sk",
              Referer: "https://www.orange.sk/e-shop/telefony",
            },
          },
        );

        // Vendor should not return 500 for unknown service
        expect(res.status).not.toBe(500);
      });
  });
});
