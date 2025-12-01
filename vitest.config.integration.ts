import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: [
      "**/__integration-tests__/**/*.test.ts",
      "**/__integration-tests__/**/*.spec.ts",
    ],
    setupFiles: ["./apps/api/src/__integration-tests__/setup.ts"],
    silent: "passed-only",
  },
})
