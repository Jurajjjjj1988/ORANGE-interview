import type { Config } from "jest";

const config: Config = {
  testMatch: ["**/*.consumer.spec.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testTimeout: 30000,
};

export default config;
