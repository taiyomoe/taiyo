import { defineConfig, devices } from "@playwright/test"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

const rootEnv = resolve(import.meta.dirname, "../../.env")

if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv)
}

const baseURL = `http://localhost:${process.env.WEB_PORT ?? "3000"}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI === undefined ? 4 : 2,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI === undefined ? 0 : 1,
  reporter: process.env.CI === undefined ? "list" : [["github"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    storageState: "e2e/.auth/admin.json",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: "pnpm dev",
    cwd: resolve(import.meta.dirname, "../.."),
    url: baseURL,
    reuseExistingServer: process.env.CI === undefined,
    timeout: 300_000,
  },
})
