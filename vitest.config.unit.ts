import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.spec.ts"],
    silent: "passed-only",
  },
})
