import { expect, test } from "@playwright/test"
import { stat } from "node:fs/promises"
import { newThrowawayUser } from "./helpers/throwaway-user"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`

test.describe("your data", () => {
  test("a reader asks for a copy of their data and downloads it", async ({ browser }) => {
    const { context } = await newThrowawayUser(browser)

    try {
      const page = await context.newPage()

      await page.goto("/settings?tab=privacy")
      await expect(page.getByRole("heading", { name: "Your data" })).toBeVisible()

      const request = page.getByRole("button", { name: "Request my data" })

      await request.dblclick()
      await expect(page.getByText("Preparing your archive")).toBeVisible()
      await expect(page.getByRole("alert")).toHaveCount(0)

      const exports = await context.request.get(`${API}/users/me/data-exports/latest`)

      expect(await exports.json()).toMatchObject({
        data: { latest: { status: expect.stringMatching(/^(PENDING|READY)$/) } },
      })

      await expect(page.getByRole("button", { name: "Download" })).toBeVisible({ timeout: 60_000 })
      await expect(page.getByText("You can ask for a new copy")).toBeVisible()
      await expect(page.getByRole("button", { name: "Request my data" })).toHaveCount(0)

      const downloading = page.waitForEvent("download")

      await page.getByRole("button", { name: "Download" }).click()

      const download = await downloading

      expect(download.suggestedFilename()).toMatch(/^taiyo-data-\d{4}-\d{2}-\d{2}\.zip$/)
      expect((await stat(await download.path())).size).toBeGreaterThan(0)

      await page.goto("/notifications?category=account")
      await expect(page.getByText("The copy of your data is ready.")).toBeVisible()
    } finally {
      await context.close()
    }
  })

  test("a second request on the same day is refused", async ({ browser }) => {
    const { context } = await newThrowawayUser(browser)

    try {
      const first = await context.request.post(`${API}/users/me/data-exports`)

      expect(first.status()).toBe(201)

      const second = await context.request.post(`${API}/users/me/data-exports`)

      expect(second.status()).toBe(409)

      const page = await context.newPage()

      await page.goto("/settings?tab=privacy")
      await expect(page.getByText("You can ask for a new copy")).toBeVisible({ timeout: 60_000 })
    } finally {
      await context.close()
    }
  })
})
