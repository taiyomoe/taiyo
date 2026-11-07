import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Cosmetics = {
  nameEffect: string | null
  nameEffects: Array<{ key: string; unlocked: boolean }>
  titles: Array<{ key: string; unlocked: boolean }>
}

describe("GET /users/me/cosmetics", () => {
  test("unlocks role cosmetics for the role only", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const user = await signInAs(services)
    const asAdmin = await api<Cosmetics>(app, "/users/me/cosmetics", { headers: admin.headers })
    const asUser = await api<Cosmetics>(app, "/users/me/cosmetics", { headers: user.headers })

    if (!asAdmin.body.success || !asUser.body.success) {
      throw new Error("Expected success")
    }

    const crimson = (body: Cosmetics) => body.nameEffects.find((item) => item.key === "crimson")

    expect(crimson(asAdmin.body.data)?.unlocked).toBe(true)
    expect(crimson(asUser.body.data)?.unlocked).toBe(false)
    expect(asUser.body.data.nameEffects.find((item) => item.key === "sunrise")?.unlocked).toBe(true)
    expect(asUser.body.data.nameEffects.find((item) => item.key === "gold")?.unlocked).toBe(false)
  })

  test("unlocks shop cosmetics the user owns", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userCosmetics")
      .values({ userId, kind: "NAME_EFFECT", key: "gold" })
      .execute()

    const res = await api<Cosmetics>(app, "/users/me/cosmetics", { headers })

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.nameEffects.find((item) => item.key === "gold")?.unlocked).toBe(true)
  })
})

describe("PATCH /users/me/cosmetics", () => {
  test("equips an unlocked effect and title", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers,
      json: { nameEffect: "crimson", title: "administrator" },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("users")
      .leftJoin("userProfiles", "userProfiles.userId", "users.id")
      .select(["users.nameEffect", "userProfiles.title"])
      .where("users.id", "=", userId)
      .executeTakeFirstOrThrow()

    expect(row).toEqual({ nameEffect: "crimson", title: "administrator" })
  })

  test("returns COSMETIC_LOCKED for a locked effect", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers,
      json: { nameEffect: "crimson" },
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("COSMETIC_LOCKED")
  })

  test("unequips with null", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers,
      json: { nameEffect: "sunrise" },
    })
    await api(app, "/users/me/cosmetics", { method: "PATCH", headers, json: { nameEffect: null } })

    const row = await services.db
      .selectFrom("users")
      .select("nameEffect")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()

    expect(row.nameEffect).toBeNull()
  })
})
