import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Item = { key: string; unlocked: boolean; unlock: { type: string; achievement?: string } }
type Cosmetics = {
  nameEffect: string | null
  progress: Record<string, number>
  nameEffects: Item[]
  titles: Item[]
}

const earn = async ({ db }: Services, userId: string, key: string) => {
  await db.insertInto("userAchievements").values({ userId, key }).execute()
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

  test("unlocks achievement cosmetics for holders of the achievement only", async ({
    app,
    services,
  }) => {
    const holder = await signInAs(services)
    const other = await signInAs(services)

    await earn(services, holder.userId, "chaptersRead100")

    const asHolder = await api<Cosmetics>(app, "/users/me/cosmetics", { headers: holder.headers })
    const asOther = await api<Cosmetics>(app, "/users/me/cosmetics", { headers: other.headers })

    if (!asHolder.body.success || !asOther.body.success) {
      throw new Error("Expected success")
    }

    const bookworm = (body: Cosmetics) => body.titles.find((item) => item.key === "bookworm")

    expect(bookworm(asHolder.body.data)).toMatchObject({
      unlocked: true,
      unlock: { type: "achievement", achievement: "chaptersRead100" },
    })
    expect(bookworm(asOther.body.data)?.unlocked).toBe(false)
    expect(asHolder.body.data.nameEffects.find((item) => item.key === "ember")?.unlocked).toBe(true)
    expect(asHolder.body.data.titles.find((item) => item.key === "bingeReader")?.unlocked).toBe(
      false,
    )
    expect(asHolder.body.data.progress).toEqual({
      chaptersRead: 0,
      chaptersUploaded: 0,
      followers: 0,
      commentsWritten: 0,
    })
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

  test("equips a title unlocked by an achievement", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await earn(services, userId, "weeklyChampion")

    const res = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers,
      json: { title: "champion" },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userProfiles")
      .select("title")
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow()

    expect(row.title).toBe("champion")
  })

  test("returns COSMETIC_LOCKED for a title whose achievement you do not hold", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)

    await earn(services, userId, "weeklyPodium")

    const res = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers,
      json: { title: "monarch" },
    })

    expect(res.status).toBe(403)
    expect(!res.body.success && res.body.code).toBe("COSMETIC_LOCKED")
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
