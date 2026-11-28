import { type Page, expect, test } from "@playwright/test"
import { findEmail } from "./helpers/outbox"
import { newThrowawayUser } from "./helpers/throwaway-user"

const PASSWORD = "a-long-password"
const DELETE_LINK = /https?:\/\/\S+\/account\/delete\?token=[\w%-]+/
const hydrated = (page: Page, selector: string) =>
  page.waitForFunction(
    (root) =>
      Object.keys(document.querySelector(root) ?? {}).some((key) => key.startsWith("__react")),
    selector,
  )
const openLink = async (page: Page, link: URL) => {
  await page.goto(`${link.pathname}${link.search}`)
  await hydrated(page, "[data-auth-screen]")
}
const askForDeletion = async (page: Page, username: string, password?: string) => {
  await page.goto("/settings?tab=account")
  await hydrated(page, "header")
  await page.getByRole("heading", { name: "Delete account" }).scrollIntoViewIfNeeded()
  await page.getByRole("button", { name: "Delete my account" }).click()

  const dialog = page.getByRole("dialog")
  const confirm = dialog.getByRole("button", { name: "Email me the link" })

  await expect(dialog.getByText("Your comments show as deleted.")).toBeVisible()
  await dialog.getByLabel(`Type ${username} to confirm`).fill("someone-else")

  if (password === undefined) {
    await expect(dialog.getByLabel("Password", { exact: true })).toHaveCount(0)
  } else {
    await dialog.getByLabel("Password", { exact: true }).fill(password)
  }

  await expect(confirm).toBeDisabled()
  await dialog.getByLabel(`Type ${username} to confirm`).fill(username)
  await confirm.click()
  await expect(page.getByText("Check your email")).toBeVisible()
}

test.describe("delete my account", () => {
  test("a reader with a password deletes their account from the emailed link", async ({
    browser,
  }) => {
    const user = await newThrowawayUser(browser, { password: PASSWORD })

    try {
      const page = await user.context.newPage()

      await askForDeletion(page, user.username, PASSWORD)

      const { match } = await findEmail(user.email, DELETE_LINK)
      const link = new URL(match[0])

      await openLink(page, link)
      await expect(page.getByRole("heading", { name: "Delete your account?" })).toBeVisible()
      await expect(page.getByText(`You are signed in as ${user.username}.`)).toBeVisible()
      await page.getByRole("button", { name: "Delete my account" }).click()
      await expect(page).toHaveURL(/\/goodbye$/)
      await expect(page.getByRole("heading", { name: "Your account was deleted" })).toBeVisible()

      await page.goto("/settings")
      await expect(page).toHaveURL(/\/auth\/sign-in/)

      await page.goto(`${link.pathname}${link.search}`)
      await expect(page).toHaveURL(/\/auth\/sign-in/)
    } finally {
      await user.context.close()
    }
  })

  test("an account without a password confirms by email alone", async ({ browser }) => {
    const user = await newThrowawayUser(browser)

    try {
      const page = await user.context.newPage()

      await askForDeletion(page, user.username)

      const { match } = await findEmail(user.email, DELETE_LINK)
      const link = new URL(match[0])

      await openLink(page, link)
      await page.getByRole("button", { name: "Delete my account" }).click()
      await expect(page).toHaveURL(/\/goodbye$/)
    } finally {
      await user.context.close()
    }
  })

  test("a link opened by another account does nothing", async ({ browser }) => {
    const owner = await newThrowawayUser(browser)
    const other = await newThrowawayUser(browser)

    try {
      const page = await owner.context.newPage()

      await askForDeletion(page, owner.username)

      const { match } = await findEmail(owner.email, DELETE_LINK)
      const link = new URL(match[0])
      const otherPage = await other.context.newPage()

      await openLink(otherPage, link)
      await otherPage.getByRole("button", { name: "Delete my account" }).click()
      await expect(otherPage.getByText(/belongs to another account/)).toBeVisible()
      await page.goto("/settings?tab=account")
      await expect(page.getByRole("heading", { name: "Delete account" })).toBeVisible()
    } finally {
      await owner.context.close()
      await other.context.close()
    }
  })
})
