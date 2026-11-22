import { type Page, expect, test } from "@playwright/test"
import { z } from "zod"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`
const MEDIA_ID = "11616192-2351-4e1e-8d70-3bf7908b796c"
const ALL_CONTENT_RATINGS = "NORMAL,SUGGESTIVE,NSFW,NSFL"
// The worker decodes these with sharp, so they must be real PNGs.
const PAGES = [
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGM4ISeHFTEMLQkAkL9BAbKfPiIAAAAASUVORK5CYII=",
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGOQOyGHFTEMLQkAZj9BAeyMgMkAAAAASUVORK5CYII=",
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGOQkzuBFTEMLQkAO79BAXNTPmcAAAAASUVORK5CYII=",
].map((base64, index) => ({
  name: `${String(index + 1).padStart(3, "0")}.png`,
  mimeType: "image/png",
  buffer: Buffer.from(base64, "base64"),
}))
const chaptersSchema = z.object({
  data: z.array(z.object({ id: z.string(), number: z.number() })),
})
const visit = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("header") ?? {}).some((key) => key.startsWith("__react")),
  )
}
const chaptersNumbered = async (page: Page, path: string, number: number) => {
  const response = await page.request.get(`${API}${path}`)

  expect(response.ok()).toBe(true)

  return chaptersSchema
    .parse(await response.json())
    .data.filter((chapter) => chapter.number === number)
}

test.describe("chapter upload", () => {
  test.use({ storageState: "e2e/.auth/uploader.json" })

  let uploaded: number | null = null

  test.afterEach(async ({ page }) => {
    if (uploaded === null) {
      return
    }

    const number = uploaded

    uploaded = null

    const chapters = await chaptersNumbered(
      page,
      `/chapters?mediaId=${MEDIA_ID}&search=${number}&perPage=100`,
      number,
    ).catch(() => [])

    for (const chapter of chapters) {
      await page.request.delete(`${API}/chapters/${chapter.id}`).catch(() => undefined)
    }
  })

  test("an uploader uploads one chapter and it is published once processed", async ({ page }) => {
    test.setTimeout(150_000)

    const number = 10_000 + (Date.now() % 90_000)

    uploaded = number

    await visit(page, `/dashboard/upload?mediaId=${MEDIA_ID}`)

    await expect(page.getByRole("heading", { name: "Upload chapters", exact: true })).toBeVisible()

    await page.locator('input[type="file"][accept*="image/png"]').setInputFiles(PAGES)
    await page.getByRole("textbox", { name: "Number", exact: true }).fill(String(number))
    await page.getByRole("button", { name: "Upload chapters (1)" }).click()

    await expect(page.getByText(/^Upload started\./).first()).toBeVisible()

    await expect
      .poll(
        async () =>
          (
            await chaptersNumbered(
              page,
              `/medias/${MEDIA_ID}/chapters?search=${number}&contentRating=${ALL_CONTENT_RATINGS}&perPage=100`,
              number,
            )
          ).length,
        { timeout: 90_000 },
      )
      .toBe(1)
  })
})
