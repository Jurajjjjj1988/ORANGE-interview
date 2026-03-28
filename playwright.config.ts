import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./api-tests/playwright/tests",
  timeout: 10000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.ORANGE_BASE_URL || "https://www.orange.sk",
  },
});
