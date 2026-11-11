import { type Page, expect, test } from "@playwright/test"

const TITLE = "Solo Leveling: Ragnarok"
const visit = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("header") ?? {}).some((key) => key.startsWith("__react")),
  )
}
const palette = (page: Page) => page.getByRole("dialog", { name: "Command palette" })
const openPalette = async (page: Page) => {
  await page.keyboard.press("ControlOrMeta+k")
  await expect(palette(page)).toBeVisible()
}
const search = async (page: Page, query: string) => {
  await palette(page).getByRole("combobox").fill(query)
}
const option = (page: Page, name: string | RegExp) =>
  palette(page).getByRole("option", { name }).first()
const openTitle = async (page: Page) => {
  await openPalette(page)
  await search(page, TITLE)
  await option(page, new RegExp(TITLE)).click()
  await expect(page).toHaveURL(/\/media\/[\da-f-]+/)
  await expect(page.getByRole("heading", { name: TITLE })).toBeVisible()
}

test.describe("command palette", () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, "/")
  })

  test("opens with the shortcut and closes with Escape", async ({ page }) => {
    await openPalette(page)
    await expect(option(page, "Latest updates")).toBeVisible()

    await page.keyboard.press("Escape")

    await expect(palette(page)).toBeHidden()
  })

  test("opens with the character typed into the navbar search", async ({ page }) => {
    await page.getByRole("button", { name: "Search" }).first().focus()
    await page.keyboard.press("g")

    await expect(palette(page).getByRole("combobox")).toHaveValue("g")
  })

  test("finds a title and opens it", async ({ page }) => {
    await openPalette(page)
    await search(page, TITLE)
    await expect(option(page, new RegExp(TITLE))).toBeVisible()

    await page.keyboard.press("Enter")

    await expect(page).toHaveURL(/\/media\/[\da-f-]+/)
    await expect(page.getByRole("heading", { name: TITLE })).toBeVisible()
  })

  test("names the alternative title a search matched", async ({ page }) => {
    await openPalette(page)
    await search(page, "Heavenly Solo Defender")

    await expect(option(page, /Dominate the World Only by Defense/)).toContainText(
      "Also known as Heavenly Solo Defender",
    )
  })

  test("previews the highlighted title", async ({ page }) => {
    await openPalette(page)
    await search(page, TITLE)
    await expect(option(page, new RegExp(TITLE))).toBeVisible()

    const preview = page.locator('[data-slot="palette-preview"]')

    await expect(preview).toContainText(TITLE)
    await expect(preview).toContainText("Synopsis")
  })

  test("shows no preview panel for a list of commands", async ({ page }) => {
    await openPalette(page)
    await search(page, TITLE)
    await expect(option(page, new RegExp(TITLE))).toBeVisible()
    await page.keyboard.press("Tab")
    await expect(option(page, "Copy link")).toBeVisible()

    await expect(page.locator('[data-slot="palette-preview"]')).toHaveCount(0)
  })

  test("does not preview a command next to recent titles", async ({ page }) => {
    await openTitle(page)
    await visit(page, "/")
    await openPalette(page)
    await option(page, "Latest updates").hover()

    await expect(page.locator('[data-slot="palette-preview"]')).toContainText(
      "Highlight a title, group or user to preview it",
    )
  })

  test("offers both upload commands on a title page", async ({ page }) => {
    await openTitle(page)
    await openPalette(page)
    await search(page, "upload chapter")

    await expect(option(page, `Upload chapter for ${TITLE}`)).toBeVisible()
    await expect(option(page, /^Upload chapter$/)).toBeVisible()
  })

  test("remembers opened titles", async ({ page }) => {
    await openTitle(page)
    await visit(page, "/")
    await openPalette(page)

    await expect(palette(page).getByText("Recent", { exact: true })).toBeVisible()
    await expect(option(page, new RegExp(TITLE))).toBeVisible()
  })

  test("opens actions with Tab and goes back with Backspace", async ({ page }) => {
    await openPalette(page)
    await search(page, TITLE)
    await expect(option(page, new RegExp(TITLE))).toBeVisible()

    await page.keyboard.press("Tab")

    const crumb = palette(page).getByRole("button", { name: TITLE })

    await expect(crumb).toBeVisible()
    await expect(option(page, "Copy link")).toBeVisible()

    await page.keyboard.press("Backspace")

    await expect(crumb).toBeHidden()
  })

  test("goes back when the crumb is clicked", async ({ page }) => {
    await openPalette(page)
    await search(page, TITLE)
    await expect(option(page, new RegExp(TITLE))).toBeVisible()
    await page.keyboard.press("Tab")

    await palette(page).getByRole("button", { name: TITLE }).click()

    await expect(palette(page).getByRole("combobox")).toHaveAttribute(
      "placeholder",
      /Search titles/,
    )
  })

  test("runs a command", async ({ page }) => {
    await openPalette(page)
    await search(page, "light theme")
    await option(page, "Use light theme").click()

    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/)

    await openPalette(page)
    await search(page, "dark theme")
    await option(page, "Use dark theme").click()

    await expect(page.locator("html")).toHaveClass(/\bdark\b/)
  })
})

test.describe("command palette on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test("opens full screen from the search icon", async ({ page }) => {
    await visit(page, "/")
    await page.getByRole("button", { name: "Search" }).last().tap()

    await expect(palette(page)).toBeVisible()
    await expect(palette(page)).toHaveCSS("border-radius", "0px")

    await palette(page).getByRole("button", { name: "Cancel" }).tap()

    await expect(palette(page)).toBeHidden()
  })
})
