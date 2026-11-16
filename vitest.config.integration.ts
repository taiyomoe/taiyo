import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["**/__integration-tests__/**/*.test.ts", "**/__integration-tests__/**/*.spec.ts"],
    globalSetup: ["./apps/api/src/__integration-tests__/global-setup.ts"],
    setupFiles: ["./apps/api/src/__integration-tests__/setup.ts"],
    silent: "passed-only",
    // Files share their worker's modules: a file that changes global state must restore it.
    isolate: false,
    // Every test talks to real services, and image work in parallel files needs more than 5s.
    testTimeout: 15_000,
    // A file drops its databases at the end, which waits for a checkpoint that can be slow locally.
    hookTimeout: 300_000,
  },
})
