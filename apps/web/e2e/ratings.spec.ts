import { type Page, expect, test } from "@playwright/test"
import { z } from "zod"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`
const MEDIA_ID = "11616192-2351-4e1e-8d70-3bf7908b796c"
const statsSchema = z.object({
  data: z.object({ rating: z.object({ count: z.number(), average: z.number().nullable() }) }),
})
const entrySchema = z.object({ data: z.object({ score: z.number().nullable() }) })
const visit = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("header") ?? {}).some((key) => key.startsWith("__react")),
  )
}
const getRatingCount = async (page: Page) =>
  statsSchema.parse(
    await (await page.request.get(`${API}/medias/${MEDIA_ID}/stats?contentRating=NORMAL`)).json(),
  ).data.rating.count
const getMyScore = async (page: Page) =>
  entrySchema.parse(await (await page.request.get(`${API}/users/me/library/${MEDIA_ID}`)).json())
    .data.score
const star = (page: Page, score: number) =>
  page.getByRole("radiogroup", { name: "Your score" }).getByRole("radio", {
    name: `${score} out of 10`,
    exact: true,
  })
const ratingSaved = (page: Page, method: "PUT" | "DELETE") =>
  page.waitForResponse(
    (response) =>
      response.url().endsWith(`/medias/${MEDIA_ID}/rating`) &&
      response.request().method() === method,
  )

test.describe("rating a media", () => {
  test.describe.configure({ mode: "serial" })
  // No other spec rates with this account, so its score only moves here.
  test.use({ storageState: "e2e/.auth/owner.json" })
  test.beforeEach(async ({ page }) => {
    await page.request.delete(`${API}/medias/${MEDIA_ID}/rating`)
  })

  test("saves the last of several quick picks, counts it in the stats, and clears it", async ({
    page,
  }) => {
    const before = await getRatingCount(page)

    await visit(page, `/media/${MEDIA_ID}`)
    await expect(page.getByText("Not rated")).toBeVisible()

    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/medias/${MEDIA_ID}/rating`) &&
        response.request().postData() === JSON.stringify({ score: 9 }),
    )

    await star(page, 3).click()
    await star(page, 5).click()
    await star(page, 9).click()
    await saved

    await expect(star(page, 9)).toHaveAttribute("aria-checked", "true")
    expect(await getMyScore(page)).toBe(9)
    expect(await getRatingCount(page)).toBe(before + 1)

    await page.getByRole("tab", { name: "Stats" }).click()

    const stats = page.getByRole("tabpanel")

    await expect(
      stats
        .getByText(
          before + 1 === 1
            ? "1 rating"
            : `${new Intl.NumberFormat("en").format(before + 1)} ratings`,
        )
        .first(),
    ).toBeVisible()

    await page.reload()
    await expect(star(page, 9)).toHaveAttribute("aria-checked", "true")

    const cleared = ratingSaved(page, "DELETE")

    await page.getByRole("button", { name: "Clear your score" }).click()
    await cleared

    await expect(page.getByText("Not rated")).toBeVisible()
    expect(await getMyScore(page)).toBeNull()
    expect(await getRatingCount(page)).toBe(before)
  })

  test("keeps the saved score when saving fails", async ({ page }) => {
    await page.request.put(`${API}/medias/${MEDIA_ID}/rating`, { data: { score: 6 } })
    await visit(page, `/media/${MEDIA_ID}`)
    await expect(star(page, 6)).toHaveAttribute("aria-checked", "true")
    await page.route(`**/medias/${MEDIA_ID}/rating`, (route) =>
      route.fulfill({
        status: 503,
        json: { success: false, code: "SERVICE_UNAVAILABLE", message: "Unavailable" },
      }),
    )

    await star(page, 2).click()

    await expect(page.getByText("Couldn't save your score")).toBeVisible()
    await expect(star(page, 6)).toHaveAttribute("aria-checked", "true")
    expect(await getMyScore(page)).toBe(6)
  })
})
