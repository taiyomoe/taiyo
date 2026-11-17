import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

describe("PUT /medias/featured", () => {
  test("replaces the featured medias and their order", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const first = await seedMedia(services, userId)
    const second = await seedMedia(services, userId)
    const res = await api<{ mediaIds: string[] }>(app, "/medias/featured", {
      method: "PUT",
      headers,
      json: { mediaIds: [second, first] },
    })

    expect(res.status).toBe(200)

    const rows = await services.db
      .selectFrom("featuredMedias")
      .select(["mediaId", "position"])
      .orderBy("position", "asc")
      .execute()

    expect(rows).toEqual([
      { mediaId: second, position: 1 },
      { mediaId: first, position: 2 },
    ])
  })

  test("features none with an empty list", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/medias/featured", {
      method: "PUT",
      headers,
      json: { mediaIds: [] },
    })

    expect(res.status).toBe(200)

    const rows = await services.db.selectFrom("featuredMedias").select("mediaId").execute()

    expect(rows).toEqual([])
  })

  test("fails without changes when a media is missing or deleted", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const deleted = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", deleted)
      .execute()

    const before = await services.db.selectFrom("featuredMedias").select("mediaId").execute()

    for (const mediaIds of [[randomUUID()], [deleted]]) {
      const res = await api(app, "/medias/featured", { method: "PUT", headers, json: { mediaIds } })

      expect(res.status).toBe(404)

      if (res.body.success) {
        throw new Error("Expected failure")
      }

      expect(res.body.code).toBe("MEDIA_NOT_FOUND")
    }

    const after = await services.db.selectFrom("featuredMedias").select("mediaId").execute()

    expect(after).toEqual(before)
  })

  test("rejects a media listed twice", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const media = await seedMedia(services, userId)
    const res = await api(app, "/medias/featured", {
      method: "PUT",
      headers,
      json: { mediaIds: [media, media] },
    })

    expect(res.status).toBe(422)
  })

  test("rejects anonymous callers and non-admins", async ({ app, services }) => {
    const anonymous = await api(app, "/medias/featured", { method: "PUT", json: { mediaIds: [] } })
    const { headers } = await signInAs(services, { role: "UPLOADER" })
    const uploader = await api(app, "/medias/featured", {
      method: "PUT",
      headers,
      json: { mediaIds: [] },
    })
    const banned = await signInAs(services, { role: "ADMIN", banned: true })
    const bannedAdmin = await api(app, "/medias/featured", {
      method: "PUT",
      headers: banned.headers,
      json: { mediaIds: [] },
    })

    expect(anonymous.status).toBe(401)
    expect(uploader.status).toBe(403)
    expect(bannedAdmin.status).toBe(403)
  })
})
