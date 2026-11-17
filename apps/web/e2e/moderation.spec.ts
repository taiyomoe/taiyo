import { type APIRequestContext, type APIResponse, type Page, expect, test } from "@playwright/test"
import { z } from "zod"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`
// Sample users from the seed that no other spec relies on.
const REPORTED = {
  id: "6fd8e75e-21a8-4873-b7f4-c335231476c2",
  username: "zora_upton61",
  name: "Zora_Upton61",
}
const EDITED = {
  id: "05e826ac-ff7e-4b29-98fb-8e14508670fe",
  username: "yadira.jones",
  name: "Yadira.Jones",
  city: "East Louveniashire",
}
const visit = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("header") ?? {}).some((key) => key.startsWith("__react")),
  )
}
const rows = (page: Page) => page.locator("tbody").getByRole("row")
// The filters of the page, not the fields of a dialog that is still closing.
const choose = async (page: Page, field: string, option: string) => {
  await page.getByRole("main").getByRole("combobox", { name: field }).click()
  await page.getByRole("option", { name: option, exact: true }).click()
}
const createdId = async (response: APIResponse) =>
  z.object({ data: z.object({ id: z.string() }) }).parse(await response.json()).data.id
const createPublicList = async (request: APIRequestContext, name: string) =>
  createdId(await request.post(`${API}/users/me/lists`, { data: { name, visibility: "PUBLIC" } }))
const pendingReportsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      user: z.object({ id: z.string() }),
      reporter: z.object({ username: z.string() }),
    }),
  ),
})
// A reader has one pending report per profile, so an earlier attempt's report would block the form.
const dismissEarlierReports = async (page: Page) => {
  const { data } = pendingReportsSchema.parse(
    await (
      await page.request.get(`${API}/user-reports?status=PENDING&reason=IMPERSONATION&perPage=100`)
    ).json(),
  )
  const reportIds = data
    .filter((report) => report.user.id === REPORTED.id && report.reporter.username === "user")
    .map((report) => report.id)

  if (reportIds.length > 0) {
    await page.request.post(`${API}/user-reports/review`, {
      data: { reportIds, status: "DISMISSED" },
    })
  }
}
const restoreProfile = async ({ page }: { page: Page }) => {
  await page.request.patch(`${API}/users/${EDITED.id}/profile`, {
    data: { displayUsername: EDITED.name, city: EDITED.city },
  })
}

test.describe("moderation", () => {
  test.use({ storageState: "e2e/.auth/moderator.json" })

  test("a reader reports a profile, and a moderator resolves the report", async ({
    browser,
    page,
  }) => {
    const tag = Date.now().toString(36)
    const details = `Pretends to be a Taiyō moderator, ${tag}`
    const note = `Asked them to change their name, ${tag}`

    await dismissEarlierReports(page)

    const reader = await browser.newContext({ storageState: "e2e/.auth/user.json" })
    const profile = await reader.newPage()

    await visit(profile, `/users/${REPORTED.username}`)
    await profile.getByRole("button", { name: "Report", exact: true }).click()

    const form = profile.getByRole("dialog", { name: `Report ${REPORTED.name}` })

    await form.getByRole("radio", { name: "Pretends to be someone else" }).click()
    await form
      .getByRole("textbox", { name: "Anything that helps us look into it (optional)" })
      .fill(details)
    await form.getByRole("button", { name: "Send report" }).click()

    await expect(profile.getByText("Report sent")).toBeVisible()
    await expect(form).toBeHidden()

    await reader.close()
    await visit(page, "/dashboard/user-reports")
    await choose(page, "Reason", "Pretends to be someone else")

    await expect(page).toHaveURL(/[?&]reason=IMPERSONATION\b/)

    const report = rows(page).filter({ hasText: details })

    await expect(report).toHaveCount(1)

    await report.getByRole("button", { name: `Actions for ${REPORTED.name}` }).click()
    await page.getByRole("menuitem", { name: "Resolve" }).click()

    const dialog = page.getByRole("dialog", { name: `Resolve the report on ${REPORTED.name}?` })

    await dialog.getByRole("textbox", { name: "Internal note (optional)" }).fill(note)
    await dialog.getByRole("button", { name: "Resolve" }).click()

    await expect(dialog).toBeHidden()
    await expect(report).toHaveCount(0)

    await choose(page, "Status", "Resolved")

    await expect(page).toHaveURL(/[?&]status=RESOLVED\b/)
    await expect(report.filter({ hasText: "Resolved" }).filter({ hasText: note })).toHaveCount(1)
  })

  test.describe("lists", () => {
    const created: string[] = []

    test.afterEach(async ({ page }) => {
      await page.request.delete(`${API}/lists`, { data: { listIds: created.splice(0) } })
    })

    test("renames a public list and deletes another one from the lists table", async ({
      page,
      playwright,
    }) => {
      const tag = Date.now().toString(36)
      const kept = `E2E list ${tag}`
      const renamed = `E2E renamed list ${tag}`
      const doomed = `E2E doomed list ${tag}`
      const owner = await playwright.request.newContext({ storageState: "e2e/.auth/owner.json" })
      const keptId = await createPublicList(owner, kept)
      const doomedId = await createPublicList(owner, doomed)

      created.push(keptId, doomedId)
      await owner.dispose()
      await visit(page, "/dashboard/lists")
      await page.getByRole("searchbox", { name: "Search by list or owner" }).fill(tag)

      await expect(page).toHaveURL(new RegExp(`[?&]q=${tag}\\b`))
      await expect(rows(page)).toHaveCount(2)

      await page.getByRole("button", { name: `Actions for ${kept}`, exact: true }).click()
      await page.getByRole("menuitem", { name: "Edit" }).click()

      const editor = page.getByRole("dialog", { name: "Edit list" })

      await editor.getByRole("textbox", { name: "Name" }).fill(renamed)
      await editor.getByRole("button", { name: "Save changes" }).click()

      await expect(editor).toBeHidden()
      await expect(page.getByRole("link", { name: renamed, exact: true })).toBeVisible()
      await expect(page.getByRole("link", { name: kept, exact: true })).toHaveCount(0)

      await page.getByRole("button", { name: `Actions for ${doomed}`, exact: true }).click()
      await page.getByRole("menuitem", { name: "Delete" }).click()
      await page
        .getByRole("alertdialog", { name: `Delete ${doomed}?` })
        .getByRole("button", { name: "Delete" })
        .click()

      await expect(page.getByRole("link", { name: doomed, exact: true })).toHaveCount(0)
      await expect(rows(page)).toHaveCount(1)

      await visit(page, `/lists/${keptId}`)

      await expect(page.getByRole("heading", { level: 1, name: renamed })).toBeVisible()

      await visit(page, `/lists/${doomedId}`)

      await expect(page.getByText("List not found")).toBeVisible()
    })
  })

  test.describe("profiles", () => {
    test.beforeEach(restoreProfile)
    test.afterEach(restoreProfile)

    test("edits a user's profile from the users table, and the profile shows it", async ({
      page,
    }) => {
      const tag = Date.now().toString(36)
      const name = `Yadira Edited ${tag}`
      const city = `E2E City ${tag}`

      await visit(page, "/dashboard/users")
      await page.getByRole("searchbox", { name: "Search by username" }).fill(EDITED.username)

      await expect(page).toHaveURL(/[?&]q=yadira\.jones\b/)

      await page
        .getByRole("button", { name: `More actions for ${EDITED.name}`, exact: true })
        .click()
      await page.getByRole("menuitem", { name: "Edit profile" }).click()

      const dialog = page.getByRole("dialog", { name: `Edit ${EDITED.name}'s profile` })

      await dialog.getByRole("textbox", { name: "Display name" }).fill(name)
      await dialog.getByRole("textbox", { name: "City" }).fill(city)
      await dialog.getByRole("button", { name: "Save changes" }).click()

      await expect(dialog).toBeHidden()
      await expect(
        page.getByRole("button", { name: `More actions for ${name}`, exact: true }),
      ).toBeVisible()

      await visit(page, `/users/${EDITED.username}`)

      await expect(page.getByRole("heading", { level: 1, name })).toBeVisible()
      await expect(page.getByText(city, { exact: true }).first()).toBeVisible()
    })
  })
})
