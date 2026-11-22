import {
  type APIRequestContext,
  type BrowserContext,
  type Page,
  expect,
  test,
} from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { z } from "zod"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`
const KIND_LABEL_PREFIXES = {
  AVATAR_BORDER: "avatar_border_",
  NAME_EFFECT: "name_effect_",
  TITLE: "user_title_",
}
const KIND_TABS = {
  AVATAR_BORDER: "Avatar borders",
  NAME_EFFECT: "Name effects",
  TITLE: "Titles",
}
const LOOT_BOX_LABELS = {
  iron: "Iron Chest",
  gold: "Gold Chest",
  diamond: "Diamond Chest",
  mythic: "Mythic Chest",
}
const messages = z
  .record(z.string(), z.unknown())
  .parse(JSON.parse(readFileSync(resolve(import.meta.dirname, "../messages/en.json"), "utf8")))
const shopSchema = z.object({
  data: z.object({
    balance: z.number(),
    items: z.array(
      z.object({
        kind: z.enum(["AVATAR_BORDER", "NAME_EFFECT", "TITLE"]),
        key: z.string(),
        owned: z.boolean(),
        unlocked: z.boolean(),
        unlock: z.object({ type: z.string(), price: z.number().optional() }),
      }),
    ),
    lootBoxes: z.array(
      z.object({
        key: z.enum(["iron", "gold", "diamond", "mythic"]),
        price: z.number(),
        duplicateRefund: z.number(),
        owned: z.number(),
        total: z.number(),
      }),
    ),
  }),
})
const sessionSchema = z.object({ user: z.object({ id: z.string() }) })
const visit = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("header") ?? {}).some((key) => key.startsWith("__react")),
  )
}
const points = (amount: number) => amount.toLocaleString("en-US")
const getShop = async (request: APIRequestContext) => {
  const response = await request.get(`${API}/shop`)

  expect(response.ok()).toBe(true)

  return shopSchema.parse(await response.json()).data
}
const userIdOf = async (context: BrowserContext) => {
  const response = await context.request.get(`${API}/api/auth/get-session`)

  expect(response.ok()).toBe(true)

  return sessionSchema.parse(await response.json()).user.id
}
const fund = async (admin: Page, userId: string, balance: number, target: number) => {
  if (balance >= target) {
    return
  }

  const response = await admin.request.post(`${API}/users/points`, {
    data: { userIds: [userId], amount: target - balance },
  })

  expect(response.ok()).toBe(true)
}
const cosmeticLabel = (kind: keyof typeof KIND_LABEL_PREFIXES, key: string) => {
  const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  const label = messages[`${KIND_LABEL_PREFIXES[kind]}${snakeKey}`]

  if (typeof label !== "string") {
    throw new Error(`No English label for the ${kind} ${key}`)
  }

  return label
}

test.describe("shop", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ reducedMotion: "reduce" })

  test("a reader buys a cosmetic and the balance drops by its price", async ({ browser, page }) => {
    const reader = await browser.newContext({ storageState: "e2e/.auth/user.json" })

    try {
      const userId = await userIdOf(reader)
      const initial = await getShop(reader.request)
      const item = initial.items.find(
        (candidate) => candidate.unlock.type === "shop" && !candidate.unlocked,
      )
      const price = item?.unlock.price

      test.skip(
        item === undefined || price === undefined,
        "The user already owns every cosmetic that is for sale",
      )

      if (item === undefined || price === undefined) {
        return
      }

      await fund(page, userId, initial.balance, price)

      const before = await getShop(reader.request)
      const label = cosmeticLabel(item.kind, item.key)
      const shop = await reader.newPage()

      await visit(shop, "/shop")

      if (item.kind !== "AVATAR_BORDER") {
        await shop.getByRole("tab", { name: KIND_TABS[item.kind], exact: true }).click()
      }

      const card = shop
        .getByRole("article")
        .filter({ has: shop.getByRole("heading", { level: 3, name: label, exact: true }) })

      await card.getByRole("button", { name: "Buy", exact: true }).click()

      const dialog = shop.getByRole("dialog", { name: `Buy ${label}?` })

      await dialog.getByRole("button", { name: `Buy for ${points(price)} pts` }).click()

      await expect(shop.getByText(`${label} is yours`)).toBeVisible()
      await expect(dialog).toBeHidden()
      await expect(card.getByText("Owned", { exact: true })).toBeVisible()
      await expect(card.getByRole("button", { name: "Equip" })).toBeVisible()

      const after = await getShop(reader.request)

      expect(after.balance).toBe(before.balance - price)
      expect(
        after.items.find((candidate) => candidate.kind === item.kind && candidate.key === item.key)
          ?.owned,
      ).toBe(true)
    } finally {
      await reader.close()
    }
  })

  test("a reader opens a loot box and the result matches the API", async ({ browser, page }) => {
    const reader = await browser.newContext({ storageState: "e2e/.auth/user.json" })

    try {
      const userId = await userIdOf(reader)
      const initial = await getShop(reader.request)
      const box = initial.lootBoxes
        .filter((candidate) => candidate.owned < candidate.total)
        .sort((a, b) => a.price - b.price)[0]

      test.skip(box === undefined, "The user already owns everything every loot box can drop")

      if (box === undefined) {
        return
      }

      await fund(page, userId, initial.balance, box.price)

      const before = await getShop(reader.request)
      const label = LOOT_BOX_LABELS[box.key]
      const shop = await reader.newPage()

      await visit(shop, "/shop")

      const chest = shop
        .getByRole("radiogroup", { name: "Choose a chest" })
        .getByRole("radio", { name: new RegExp(`^${label}`) })

      await chest.click()

      await expect(chest).toBeChecked()

      await shop.getByRole("button", { name: "Open chest" }).click()

      const overlay = shop.getByRole("dialog", { name: `Opening ${label}` })

      await expect(overlay).toBeVisible()

      const balanceLine = overlay.getByText(/^[\d,]+ pts$/)

      await expect(balanceLine).toBeVisible()

      const duplicate = (await overlay.getByText(/^Duplicate · /).count()) > 0
      const expected = before.balance - box.price + (duplicate ? box.duplicateRefund : 0)

      await expect(balanceLine).toHaveText(`${points(expected)} pts`)

      if (duplicate) {
        await expect(
          overlay.getByText(`Duplicate · ${points(box.duplicateRefund)} pts refunded`),
        ).toBeVisible()
      }

      const after = await getShop(reader.request)

      expect(after.balance).toBe(expected)
      expect(after.lootBoxes.find((candidate) => candidate.key === box.key)?.owned).toBe(
        box.owned + (duplicate ? 0 : 1),
      )

      // The close button in the header has the same name, so this is the one in the footer.
      await overlay.getByRole("button", { name: "Done", exact: true }).last().click()

      await expect(overlay).toBeHidden()
    } finally {
      await reader.close()
    }
  })
})
