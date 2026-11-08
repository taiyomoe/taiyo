import { LOOT_BOXES, LOOT_BOX_POOL } from "@taiyomoe/db/loot-boxes"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Purchase = { item: { kind: string; key: string }; price: number; balance: number }
type Opening = {
  box: string
  item: { kind: string; key: string; rarity: string }
  duplicate: boolean
  refund: number
  balance: number
}
type Shop = {
  balance: number
  items: Array<{ kind: string; key: string; owned: boolean; unlocked: boolean }>
  lootBoxes: Array<{ key: string; price: number; odds: Array<{ chance: number }> }>
}

const fund = async ({ db }: Services, userId: string, points: number) => {
  await db
    .insertInto("userProfiles")
    .values({ userId, points })
    .onConflict((oc) => oc.column("userId").doUpdateSet({ points }))
    .execute()
}
const balanceOf = async ({ db }: Services, userId: string) => {
  const row = await db
    .selectFrom("userProfiles")
    .select("points")
    .where("userId", "=", userId)
    .executeTakeFirstOrThrow()

  return row.points
}
const ownedBy = ({ db }: Services, userId: string) =>
  db.selectFrom("userCosmetics").select(["kind", "key"]).where("userId", "=", userId).execute()
const buy = (app: Parameters<typeof api>[0], headers: Record<string, string>, json: unknown) =>
  api<Purchase>(app, "/shop/purchases", { method: "POST", headers, json })

describe("GET /shop", () => {
  test("lists the balance, items and boxes with odds that add up", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 1234)

    const res = await api<Shop>(app, "/shop", { headers })

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.balance).toBe(1234)
    expect(res.body.data.items.some((item) => item.kind === "AVATAR_BORDER")).toBe(true)

    for (const box of res.body.data.lootBoxes) {
      expect(box.odds.reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(1, 10)
    }
  })

  test("requires a session", async ({ app }) => {
    const res = await api(app, "/shop")

    expect(res.status).toBe(401)
  })
})

describe("POST /shop/purchases", () => {
  test("buys a shop item at its catalog price", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 1000)

    const res = await buy(app, headers, { kind: "AVATAR_BORDER", key: "petals", price: 1 })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toMatchObject({ price: 500, balance: 500 })
    expect(await balanceOf(services, userId)).toBe(500)
    expect(await ownedBy(services, userId)).toEqual([{ kind: "AVATAR_BORDER", key: "petals" }])

    const ledger = await services.db
      .selectFrom("shopPurchases")
      .selectAll()
      .where("userId", "=", userId)
      .execute()

    expect(ledger).toHaveLength(1)
    expect(ledger[0]).toMatchObject({ type: "ITEM", price: 500, refund: 0 })
  })

  test("refuses without enough points and grants nothing", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 499)

    const res = await buy(app, headers, { kind: "AVATAR_BORDER", key: "petals" })

    expect(res.status).toBe(409)
    expect(!res.body.success && res.body.code).toBe("INSUFFICIENT_POINTS")
    expect(await balanceOf(services, userId)).toBe(499)
    expect(await ownedBy(services, userId)).toEqual([])
  })

  test("refuses users without a profile row", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const res = await buy(app, headers, { kind: "AVATAR_BORDER", key: "halo" })

    expect(res.status).toBe(409)
    expect(await ownedBy(services, userId)).toEqual([])
  })

  test("refuses items that are not sold directly", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 100_000)

    for (const json of [
      { kind: "AVATAR_BORDER", key: "eclipse" },
      { kind: "NAME_EFFECT", key: "crimson" },
      { kind: "TITLE", key: "bookworm" },
      { kind: "TITLE", key: "reader" },
    ]) {
      const res = await buy(app, headers, json)

      expect(res.status).toBe(409)
      expect(!res.body.success && res.body.code).toBe("NOT_FOR_SALE")
    }

    expect(await balanceOf(services, userId)).toBe(100_000)
  })

  test("rejects unknown and prototype keys", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 100_000)

    for (const key of ["nope", "__proto__", "constructor", "toString"]) {
      const res = await buy(app, headers, { kind: "AVATAR_BORDER", key })

      expect(res.status).toBe(404)
    }

    const badKind = await buy(app, headers, { kind: "BADGE", key: "halo" })

    expect(badKind.status).toBe(422)
    expect(await balanceOf(services, userId)).toBe(100_000)
  })

  test("refuses an item the user already owns", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 1000)
    await buy(app, headers, { kind: "AVATAR_BORDER", key: "halo" })

    const again = await buy(app, headers, { kind: "AVATAR_BORDER", key: "halo" })

    expect(again.status).toBe(409)
    expect(!again.body.success && again.body.code).toBe("ALREADY_OWNED")
    expect(await balanceOf(services, userId)).toBe(800)
  })

  test("charges once when the same purchase races", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 10_000)

    const results = await Promise.all(
      Array.from({ length: 6 }, () => buy(app, headers, { kind: "AVATAR_BORDER", key: "solar" })),
    )

    expect(results.filter((res) => res.status === 201)).toHaveLength(1)
    expect(await balanceOf(services, userId)).toBe(10_000 - 1800)
  })

  test("never overdraws when different purchases race", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 1000)

    const results = await Promise.all(
      (["petals", "tidal", "circuit"] as const).map((key) =>
        buy(app, headers, { kind: "AVATAR_BORDER", key }),
      ),
    )
    const succeeded = results.filter((res) => res.status === 201)

    expect(succeeded).toHaveLength(1)
    expect(await balanceOf(services, userId)).toBeGreaterThanOrEqual(0)
    expect(await ownedBy(services, userId)).toHaveLength(1)
  })

  test("refuses while an admin impersonates the user", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 1000)
    await services.db
      .updateTable("sessions")
      .set({ impersonatedBy: admin.userId })
      .where("userId", "=", userId)
      .execute()

    const res = await buy(app, headers, { kind: "AVATAR_BORDER", key: "halo" })

    expect(res.status).toBe(403)
    expect(!res.body.success && res.body.code).toBe("SHOP_IMPERSONATION")
    expect(await balanceOf(services, userId)).toBe(1000)
  })

  test("refuses banned users", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { banned: true })

    await fund(services, userId, 1000)

    const res = await buy(app, headers, { kind: "AVATAR_BORDER", key: "halo" })

    expect(res.status).toBe(403)
    expect(await balanceOf(services, userId)).toBe(1000)
  })

  test("records the purchase in the audit log", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 1000)
    await buy(app, headers, { kind: "AVATAR_BORDER", key: "halo" })

    const row = await services.db
      .selectFrom("auditLogs")
      .select(["action", "outcome"])
      .where("actorId", "=", userId)
      .where("action", "=", "shop.ITEM_PURCHASE")
      .executeTakeFirst()

    expect(row).toMatchObject({ outcome: "success" })
  })
})

describe("POST /shop/loot-boxes/:box/open", () => {
  test("debits the box and grants a rolled item", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 1000)

    const res = await api<Opening>(app, "/shop/loot-boxes/iron/open", { method: "POST", headers })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    const { item, duplicate, refund, balance } = res.body.data

    expect(duplicate).toBe(false)
    expect(refund).toBe(0)
    expect(balance).toBe(1000 - LOOT_BOXES.iron.price)
    expect(LOOT_BOX_POOL.some((entry) => entry.kind === item.kind && entry.key === item.key)).toBe(
      true,
    )
    expect(await ownedBy(services, userId)).toEqual([{ kind: item.kind, key: item.key }])
  })

  test("refunds a duplicate", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const pool = LOOT_BOX_POOL.filter((item) => LOOT_BOXES.mythic.weights[item.rarity] > 0)
    const [spare, ...rest] = pool

    if (spare === undefined) {
      throw new Error("Expected a pool")
    }

    await services.db
      .insertInto("userCosmetics")
      .values(rest.map((item) => ({ userId, kind: item.kind, key: item.key })))
      .execute()
    await fund(services, userId, LOOT_BOXES.mythic.price * 40)

    let duplicates = 0

    for (let index = 0; index < 8; index += 1) {
      const res = await api<Opening>(app, "/shop/loot-boxes/mythic/open", {
        method: "POST",
        headers,
      })

      if (res.status === 409) {
        break
      }

      if (!res.body.success) {
        throw new Error("Expected success")
      }

      duplicates += res.body.data.duplicate ? 1 : 0
    }

    const ledger = await services.db
      .selectFrom("shopPurchases")
      .select(["price", "refund", "duplicate"])
      .where("userId", "=", userId)
      .execute()
    const spent = ledger.reduce((sum, row) => sum + row.price - row.refund, 0)

    expect(ledger.filter((row) => row.duplicate)).toHaveLength(duplicates)
    expect(
      ledger.every((row) => row.refund === (row.duplicate ? LOOT_BOXES.mythic.duplicateRefund : 0)),
    ).toBe(true)
    expect(await balanceOf(services, userId)).toBe(LOOT_BOXES.mythic.price * 40 - spent)
  })

  test("refuses a box whose whole pool is owned", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const pool = LOOT_BOX_POOL.filter((item) => LOOT_BOXES.mythic.weights[item.rarity] > 0)

    await services.db
      .insertInto("userCosmetics")
      .values(pool.map((item) => ({ userId, kind: item.kind, key: item.key })))
      .execute()
    await fund(services, userId, 10_000)

    const res = await api(app, "/shop/loot-boxes/mythic/open", { method: "POST", headers })

    expect(res.status).toBe(409)
    expect(!res.body.success && res.body.code).toBe("LOOT_BOX_EXHAUSTED")
    expect(await balanceOf(services, userId)).toBe(10_000)
  })

  test("refuses without enough points", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, LOOT_BOXES.gold.price - 1)

    const res = await api(app, "/shop/loot-boxes/gold/open", { method: "POST", headers })

    expect(res.status).toBe(409)
    expect(await balanceOf(services, userId)).toBe(LOOT_BOXES.gold.price - 1)
    expect(await ownedBy(services, userId)).toEqual([])
  })

  test("rejects an unknown box", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 10_000)

    const res = await api(app, "/shop/loot-boxes/__proto__/open", { method: "POST", headers })

    expect(res.status).toBe(422)
    expect(await balanceOf(services, userId)).toBe(10_000)
  })

  test("never overdraws when openings race", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, LOOT_BOXES.iron.price * 2)

    const results = await Promise.all(
      Array.from({ length: 6 }, () =>
        api(app, "/shop/loot-boxes/iron/open", { method: "POST", headers }),
      ),
    )

    expect(results.filter((res) => res.status === 201).length).toBeLessThanOrEqual(2)
    expect(await balanceOf(services, userId)).toBeGreaterThanOrEqual(0)
  })
})

describe("PATCH /users/me/cosmetics avatarBorder", () => {
  test("equips an owned border and refuses an unowned one", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await fund(services, userId, 1000)
    await buy(app, headers, { kind: "AVATAR_BORDER", key: "halo" })

    const equipped = await api<{ avatarBorder: string | null }>(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers,
      json: { avatarBorder: "halo" },
    })

    expect(equipped.status).toBe(200)
    expect(equipped.body.success && equipped.body.data.avatarBorder).toBe("halo")

    const locked = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers,
      json: { avatarBorder: "eclipse" },
    })

    expect(locked.status).toBe(403)

    const row = await services.db
      .selectFrom("users")
      .select("avatarBorder")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()

    expect(row.avatarBorder).toBe("halo")
  })
})
