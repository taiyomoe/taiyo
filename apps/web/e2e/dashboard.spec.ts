import { type APIRequestContext, type APIResponse, type Page, expect, test } from "@playwright/test"
import { z } from "zod"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`
// Sample users from the seed that no other spec relies on.
const ROLE_TARGETS = [
  { id: "318e2400-8d73-4e9d-927d-eeacada2a708", name: "Abdullah.Quitzon" },
  { id: "be1e6661-4ba4-478f-a264-707997e898ad", name: "Abdullah.Kuhn3" },
]
const INVITEES = [
  { username: "alaina.dickinson22", name: "Alaina.Dickinson22" },
  { username: "alaina.purdy", name: "Alaina.Purdy" },
]
const visit = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("header") ?? {}).some((key) => key.startsWith("__react")),
  )
}
const rows = (page: Page) => page.locator("tbody").getByRole("row")
const rowOf = (page: Page, name: string) =>
  rows(page).filter({ has: page.getByRole("checkbox", { name: `Select ${name}`, exact: true }) })
const select = async (page: Page, name: string) => {
  await page.getByRole("checkbox", { name: `Select ${name}`, exact: true }).check()
}
const bulkBar = (page: Page) => page.getByRole("toolbar", { name: "Bulk actions" })
// The filters of the page, not the fields of a dialog that is still closing.
const choose = async (page: Page, field: string, option: string) => {
  await page.getByRole("main").getByRole("combobox", { name: field }).click()
  await page.getByRole("option", { name: option, exact: true }).click()
}
const createdId = async (response: APIResponse) =>
  z.object({ data: z.object({ id: z.string() }) }).parse(await response.json()).data.id
const createGroup = async (request: APIRequestContext, name: string) =>
  createdId(await request.post(`${API}/groups`, { data: { name } }))
const resetRoles = async ({ page }: { page: Page }) => {
  await page.request.patch(`${API}/users/role`, {
    data: { userIds: ROLE_TARGETS.map(({ id }) => id), role: "USER" },
  })
}

test.describe("dashboard tables", () => {
  test("narrows, pages through and selects the catalog's media", async ({ page }) => {
    await visit(page, "/dashboard/medias")

    const firstRow = rows(page).first().getByRole("checkbox")

    await expect(firstRow).toBeVisible()

    const firstOfPageOne = (await firstRow.getAttribute("aria-label")) ?? ""

    await page.getByRole("link", { name: "Go to the next page" }).click()

    await expect(page).toHaveURL(/[?&]page=2\b/)
    await expect(page.getByRole("link", { name: "Page 2", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await expect(page.getByRole("checkbox", { name: firstOfPageOne, exact: true })).toHaveCount(0)

    await choose(page, "Type", "Manhwa")

    await expect(page).toHaveURL(/[?&]type=MANHWA\b/)
    await expect(page).not.toHaveURL(/[?&]page=/)
    await expect(rows(page).filter({ hasNotText: "Manhwa" })).toHaveCount(0)
    await expect(rows(page).first()).toContainText("Manhwa")

    await page.getByRole("searchbox", { name: "Search by title" }).fill("husband")

    await expect(page).toHaveURL(/[?&]q=husband\b/)
    await expect(rows(page).filter({ hasNotText: /husband/i })).toHaveCount(0)
    await expect(rows(page).first()).toContainText(/husband/i)

    await rows(page).nth(0).getByRole("checkbox").check()
    await rows(page).nth(1).getByRole("checkbox").check()

    await expect(bulkBar(page)).toContainText("Selected: 2")

    await bulkBar(page).getByRole("button", { name: "Edit" }).click()

    const dialog = page.getByRole("dialog", { name: "Edit 2 media" })

    await expect(dialog).toBeVisible()

    await dialog.getByRole("button", { name: "Cancel" }).click()

    await expect(dialog).toBeHidden()

    const shown = await rows(page).count()

    await page.getByRole("checkbox", { name: "Select every row on this page" }).check()

    await expect(bulkBar(page)).toContainText(`Selected: ${shown}`)

    await bulkBar(page).getByRole("button", { name: "Clear selection" }).click()

    await expect(bulkBar(page)).toBeHidden()
  })

  test("resolves the selected group reports, which leave the queue", async ({
    page,
    playwright,
  }) => {
    const tag = Date.now().toString(36)
    const groups = [`E2E reported ${tag} A`, `E2E reported ${tag} B`]
    const reporter = await playwright.request.newContext({ storageState: "e2e/.auth/user.json" })

    for (const name of groups) {
      const groupId = await createGroup(page.request, name)

      await createdId(
        await reporter.post(`${API}/groups/${groupId}/reports`, {
          data: { reason: "IMPERSONATION", details: `Uses our logo and name, ${tag}` },
        }),
      )
    }

    await reporter.dispose()
    await visit(page, "/dashboard/group-reports")
    await choose(page, "Reason", "Impersonating another group")

    await expect(page).toHaveURL(/[?&]reason=IMPERSONATION\b/)

    const reported = rows(page).filter({ hasText: tag })

    await expect(reported).toHaveCount(groups.length)

    for (const name of groups) {
      await select(page, name)
    }

    await expect(bulkBar(page)).toContainText("Selected: 2")

    await bulkBar(page).getByRole("button", { name: "Resolve" }).click()

    const dialog = page.getByRole("dialog", { name: "Resolve 2 reports?" })
    const note = `Both groups renamed, ${tag}`

    await dialog.getByRole("textbox", { name: "Internal note (optional)" }).fill(note)
    await dialog.getByRole("button", { name: "Resolve" }).click()

    await expect(dialog).toBeHidden()
    await expect(reported).toHaveCount(0)
    await expect(bulkBar(page)).toBeHidden()

    await choose(page, "Status", "Resolved")

    await expect(page).toHaveURL(/[?&]status=RESOLVED\b/)
    await expect(reported.filter({ hasText: "Resolved" }).filter({ hasText: note })).toHaveCount(
      groups.length,
    )
  })

  test.describe("users", () => {
    test.beforeEach(resetRoles)
    test.afterEach(resetRoles)

    test("changes the role of the selected users", async ({ page }) => {
      await visit(page, "/dashboard/users")
      await page.getByRole("searchbox", { name: "Search by username" }).fill("abdullah")

      await expect(page).toHaveURL(/[?&]q=abdullah\b/)

      for (const { name } of ROLE_TARGETS) {
        await expect(
          rowOf(page, name).getByRole("cell", { name: "User", exact: true }),
        ).toBeVisible()
        await select(page, name)
      }

      await expect(bulkBar(page)).toContainText("Selected: 2")

      await bulkBar(page).getByRole("button", { name: "Role" }).click()

      const dialog = page.getByRole("dialog", { name: "Change the role of 2 users" })

      await dialog.getByRole("combobox", { name: "Role" }).click()
      await page.getByRole("option", { name: "Uploader", exact: true }).click()
      await dialog.getByRole("button", { name: "Apply" }).click()

      await expect(dialog).toBeHidden()
      await expect(bulkBar(page)).toBeHidden()

      for (const { name } of ROLE_TARGETS) {
        await expect(
          rowOf(page, name).getByRole("cell", { name: "Uploader", exact: true }),
        ).toBeVisible()
      }

      await choose(page, "Role", "Uploader")

      await expect(page).toHaveURL(/[?&]role=UPLOADER\b/)
      await expect(rows(page).filter({ hasNotText: "Uploader" })).toHaveCount(0)

      for (const { name } of ROLE_TARGETS) {
        await expect(rowOf(page, name)).toBeVisible()
      }
    })
  })

  test("cancels a group's selected invitations, and the activity log records it", async ({
    page,
  }) => {
    const name = `E2E invitations ${Date.now().toString(36)}`
    const groupId = await createGroup(page.request, name)

    await visit(page, `/dashboard/groups/${groupId}`)

    await expect(page.getByRole("tab", { name: "Members" })).toHaveAttribute(
      "aria-selected",
      "true",
    )

    await page.getByRole("tab", { name: "Invitations" }).click()

    await expect(page).toHaveURL(/[?&]tab=invitations\b/)

    const panel = page.getByRole("tabpanel", { name: "Invitations" })

    for (const { username } of INVITEES) {
      await panel.getByRole("textbox", { name: "Username" }).fill(username)
      await panel.getByRole("button", { name: "Send invitation" }).click()

      await expect(panel.getByText(`Invitation sent to ${username}.`)).toBeVisible()
    }

    await visit(page, `/dashboard/groups/${groupId}?tab=invitations`)

    await expect(page.getByRole("tab", { name: "Invitations" })).toHaveAttribute(
      "aria-selected",
      "true",
    )

    for (const invitee of INVITEES) {
      await select(page, invitee.name)
    }

    await expect(bulkBar(page)).toContainText("Selected: 2")

    await bulkBar(page).getByRole("button", { name: "Cancel invitation" }).click()
    await page
      .getByRole("alertdialog", { name: "Cancel 2 invitations?" })
      .getByRole("button", { name: "Cancel invitation" })
      .click()

    await expect(panel.getByText("No pending invitations")).toBeVisible()
    await expect(bulkBar(page)).toBeHidden()

    await visit(
      page,
      `/dashboard/activity-log?${new URLSearchParams({ q: `target.id: "${groupId}"` })}`,
    )

    const entry = rows(page).filter({ hasText: "group.invitation.CANCEL_MANY" })

    await expect(entry).toContainText("Test Admin")
    await expect(entry).toContainText(name)
  })
})
