import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

type ManagedFeatured = {
  id: string
  title: string | null
  coverUrl: string | null
  bannerUrl: string | null
  deletedAt: string | null
}

describe("GET /medias/featured/managed", () => {
  test("lists every featured media in position order, deleted and adult ones included", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const adult = await seedMedia(services, userId, "NSFL")
    const deleted = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", deleted)
      .execute()
    await services.db
      .insertInto("featuredMedias")
      .values([
        { mediaId: adult, position: 1000 },
        { mediaId: deleted, position: 1001 },
      ])
      .execute()

    const seeded = await services.db
      .selectFrom("featuredMedias")
      .select("mediaId")
      .orderBy("position", "asc")
      .execute()
    const res = await api<ManagedFeatured[]>(app, "/medias/featured/managed", { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((media) => media.id)).toEqual(seeded.map((row) => row.mediaId))
    expect(res.body.data.find((media) => media.id === deleted)?.deletedAt).toEqual(
      expect.any(String),
    )
  })

  test("rejects anonymous callers", async ({ app }) => {
    const res = await api(app, "/medias/featured/managed")

    expect(res.status).toBe(401)
  })

  test("rejects moderators", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/medias/featured/managed", { headers })

    expect(res.status).toBe(403)
  })
})
