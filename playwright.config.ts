import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 120000,
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
});
