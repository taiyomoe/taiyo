import { defineConfig, devices } from "@playwright/test"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

const rootEnv = resolve(import.meta.dirname, "../../.env")

if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv)
}

const root = resolve(import.meta.dirname, "../..")
const webPort = process.env.WEB_PORT ?? "3000"
const baseURL = `http://localhost:${webPort}`
const apiURL = `http://localhost:${process.env.API_PORT ?? "3002"}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 4,
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
  // CI tests the production build, which the workflow builds first: the dev server compiles
  // every module on its first request, which made each test wait on Vite.
  webServer:
    process.env.CI === undefined
      ? {
          command: "pnpm dev",
          cwd: root,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 300_000,
        }
      : [
          {
            command: "pnpm -F @taiyomoe/api -F @taiyomoe/worker --parallel start",
            cwd: root,
            url: `${apiURL}/health`,
            timeout: 120_000,
          },
          {
            command: `pnpm -F @taiyomoe/web exec vite preview --port ${webPort} --strictPort`,
            cwd: root,
            url: baseURL,
            timeout: 120_000,
          },
        ],
})
