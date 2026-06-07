import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

if (process.env.NODE_ENV === "development") {
  process.loadEnvFile()
}

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["**/__integration-tests__/**/*.test.ts", "**/__integration-tests__/**/*.spec.ts"],
    setupFiles: ["./apps/api/src/__integration-tests__/setup.ts"],
    silent: "passed-only",
  },
})
