import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  retries: 1,
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
    viewport: { width: 1280, height: 900 },
  },
});
