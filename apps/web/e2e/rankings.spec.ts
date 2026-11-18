import { type Page, expect, test } from "@playwright/test"
import { z } from "zod"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`
// A one-page chapter from the seed: finishing it earns credit two seconds after opening it.
const SHORT_CHAPTER = "057e6b22-e736-4161-95cc-4c1c676db804"
const groupsSchema = z.object({
  data: z.object({
    entries: z.array(z.object({ rank: z.number(), group: z.object({ name: z.string() }) })),
  }),
})
const standingSchema = z.object({
  data: z.object({ me: z.object({ rank: z.number() }).nullable() }),
})
const visit = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("header") ?? {}).some((key) => key.startsWith("__react")),
  )
}
const option = (page: Page, control: "Ranking type" | "Period", name: string) =>
  page.getByRole("radiogroup", { name: control }).getByRole("radio", { name })
const getStanding = async (page: Page) =>
  standingSchema.parse(await (await page.request.get(`${API}/rankings/readers?period=all`)).json())
    .data.me

test("ranks the groups of all time as the API does, and keeps the choice in the URL", async ({
  page,
}) => {
  const { entries } = groupsSchema.parse(
    await (await page.request.get(`${API}/rankings/groups?period=all`)).json(),
  ).data
  const names = entries.map(({ group }) => group.name)
  const rest = names.slice(3)

  await visit(page, "/rankings")
  await expect(option(page, "Ranking type", "Top readers")).toBeChecked()
  await expect(option(page, "Period", "This week")).toBeChecked()

  await option(page, "Ranking type", "Top groups").click()
  await option(page, "Period", "All time").click()

  await expect(page).toHaveURL(/\?category=groups&period=all$/)

  const board = page.getByRole("region", { name: "Top groups" })

  for (const name of names.slice(0, 3)) {
    await expect(board.getByRole("link", { name, exact: true }).first()).toBeVisible()
  }

  await expect(board.getByRole("listitem")).toHaveCount(rest.length)

  for (const [index, name] of rest.entries()) {
    await expect(board.getByRole("listitem").nth(index)).toContainText(name)
  }

  await page.reload()

  await expect(option(page, "Ranking type", "Top groups")).toBeChecked()
  await expect(option(page, "Period", "All time")).toBeChecked()
})

test.describe("a reader", () => {
  // No other spec reads with this account, so its standing only moves here.
  test.use({ storageState: "e2e/.auth/intern.json" })

  test("enters the readers ranking by finishing a chapter, and sees their standing", async ({
    page,
  }) => {
    const opened = page.waitForResponse((response) =>
      response.url().endsWith(`/chapters/${SHORT_CHAPTER}/open`),
    )

    await page.goto(`/chapters/${SHORT_CHAPTER}`)
    await opened

    // Credit accrues one page per two seconds from the opening: finish the chapter until it
    // counts. A run on a database where it already counted finds the reader ranked at once.
    await expect
      .poll(
        async () => {
          await page.request.patch(`${API}/chapters/${SHORT_CHAPTER}/history`, {
            data: { completed: true },
          })

          return getStanding(page)
        },
        { intervals: [1000], timeout: 20_000 },
      )
      .not.toBeNull()

    const me = await getStanding(page)

    await visit(page, "/rankings?period=all")

    // The board can be a few minutes old, but the reader's own standing is always live.
    const board = page.getByRole("region", { name: "Top readers" })

    await expect(option(page, "Period", "All time")).toBeChecked()
    await expect(board.getByText("You", { exact: true })).toBeVisible()
    await expect(board.getByText(`#${me?.rank}`, { exact: true })).toBeVisible()
  })
})
