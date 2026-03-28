import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./api-tests/playwright/tests",
  timeout: 10000,
  reporter: "list",
  use: {
    baseURL: process.env.ORANGE_BASE_URL || "https://www.orange.sk",
  },
});
