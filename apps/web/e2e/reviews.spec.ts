import { type Page, expect, test } from "@playwright/test"
import { z } from "zod"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`
// A seeded title no other spec rates or reviews.
const MEDIA_ID = "6c38ee07-cab3-4cec-a6d2-75276fd156ab"
const reviewsSchema = z.object({
  data: z.array(z.object({ id: z.string(), body: z.string(), helpfulCount: z.number() })),
})
const visit = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("header") ?? {}).some((key) => key.startsWith("__react")),
  )
}
const listReviews = async (page: Page) =>
  reviewsSchema.parse(
    await (
      await page.request.get(
        `${API}/medias/${MEDIA_ID}/reviews?sort=newest&contentRating=NORMAL,SUGGESTIVE,NSFW,NSFL`,
      )
    ).json(),
  ).data

test.describe("reviewing a media", () => {
  test.use({ storageState: "e2e/.auth/moderator.json" })

  test.afterEach(async ({ playwright }) => {
    const author = await playwright.request.newContext({ storageState: "e2e/.auth/user.json" })

    await author.delete(`${API}/medias/${MEDIA_ID}/rating?withReview=true`)
    await author.dispose()
  })

  test("a reader rates and reviews, another finds it helpful and reports it, a moderator deletes it", async ({
    browser,
    page,
  }) => {
    const tag = Date.now().toString(36)
    const body = `Review ${tag}. ${"The slow start pays off once the second arc begins. ".repeat(5)}`
    const author = await browser.newContext({ storageState: "e2e/.auth/user.json" })
    const writer = await author.newPage()

    await author.request.delete(`${API}/medias/${MEDIA_ID}/rating?withReview=true`)
    await visit(writer, `/media/${MEDIA_ID}?tab=reviews`)
    await expect(writer.getByText("Score this title to write a review.")).toBeVisible()
    await expect(
      writer.getByText("Reviews are public: anyone can read them, with your name and score."),
    ).toBeVisible()

    const rated = writer.waitForResponse(
      (response) =>
        response.url().endsWith(`/medias/${MEDIA_ID}/rating`) &&
        response.request().method() === "PUT",
    )

    await writer
      .getByRole("radiogroup", { name: "Your score" })
      .getByRole("radio", { name: "8 out of 10", exact: true })
      .click()
    await rated
    await writer.getByRole("button", { name: "Write a review" }).click()

    const composer = writer.getByRole("textbox", { name: "Your review" })
    const publish = writer.getByRole("button", { name: "Publish review" })

    await composer.fill(body.slice(0, 150))
    await expect(writer.getByText(/^Characters to go: \d+$/)).toBeVisible()
    await expect(publish).toBeDisabled()
    await composer.fill(body)
    await writer.getByRole("checkbox", { name: "Contains spoilers" }).click()
    await publish.click()

    await expect(writer.getByText("Review published")).toBeVisible()

    const mine = writer.getByRole("article", { name: "Your review" })

    await expect(mine.getByText("This review contains spoilers.")).toBeVisible()

    await writer.getByRole("button", { name: "Clear your score" }).click()

    const clearDialog = writer.getByRole("alertdialog", { name: "Remove your review too?" })

    await expect(clearDialog).toBeVisible()
    await clearDialog.getByRole("button", { name: "Cancel" }).click()
    await expect(clearDialog).toBeHidden()
    await author.close()

    const reader = await browser.newContext({ storageState: "e2e/.auth/owner.json" })
    const voter = await reader.newPage()

    await visit(voter, `/media/${MEDIA_ID}?tab=reviews`)

    const collapsed = voter
      .getByRole("article")
      .filter({ hasText: "This review contains spoilers." })

    await expect(collapsed).toHaveCount(1)
    await collapsed.getByRole("button", { name: "Show review" }).click()

    const card = voter.getByRole("article").filter({ hasText: `Review ${tag}.` })

    await expect(card).toHaveCount(1)

    const helpful = card.getByRole("button", { name: /^Helpful/ })
    const voted = voter.waitForResponse((response) => response.url().endsWith("/vote"))

    await helpful.click()
    await voted
    await expect(helpful).toHaveAttribute("aria-pressed", "true")
    await expect(helpful).toContainText("1")
    expect(
      (await listReviews(voter)).find((review) => review.body.startsWith(`Review ${tag}.`)),
    ).toMatchObject({ helpfulCount: 1 })

    await card.getByRole("button", { name: "Review actions" }).click()
    await voter.getByRole("menuitem", { name: "Report" }).click()

    const report = voter.getByRole("dialog", { name: "Report this review" })

    await report
      .getByRole("textbox", { name: "Details (optional)" })
      .fill(`Spoils the ending, ${tag}`)
    await report.getByRole("button", { name: "Send report" }).click()
    await expect(voter.getByText("Thanks, the moderators will take a look.")).toBeVisible()
    await reader.close()

    await visit(page, "/dashboard/review-reports")

    const row = page
      .locator("tbody")
      .getByRole("row")
      .filter({ hasText: `Review ${tag}.` })

    await expect(row).toHaveCount(1)
    await row.getByRole("button", { name: /^Actions for / }).click()
    await page.getByRole("menuitem", { name: "Delete review" }).click()

    const confirm = page.getByRole("alertdialog", { name: "Delete this review?" })

    await confirm.getByRole("button", { name: "Delete review" }).click()
    await expect(confirm).toBeHidden()
    await expect(row).toHaveCount(0)
    expect(
      (await listReviews(page)).some((review) => review.body.startsWith(`Review ${tag}.`)),
    ).toBe(false)
  })
})
