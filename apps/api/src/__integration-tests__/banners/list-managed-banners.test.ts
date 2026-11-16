import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

type ManagedBanner = {
  id: string
  url: string
  contentRating: string
  media: { id: string; title: string | null; imageCount: number }
  uploader: { id: string }
}

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /banners", () => {
  test("lists the banners matching the filters, newest first", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const mediaId = await seedMedia(services, userId)
    const [older, newer, nsfw] = await services.db
      .insertInto("banners")
      .values([
        { mediaId, uploaderId: userId, createdAt: new Date("2026-01-01T00:00:00Z") },
        { mediaId, uploaderId: userId, createdAt: new Date("2026-02-01T00:00:00Z") },
        { mediaId, uploaderId: userId, contentRating: "NSFW" },
      ])
      .returning("id")
      .execute()
    const res = await api<ManagedBanner[]>(
      app,
      `/banners?mediaId=${mediaId}&contentRating=NORMAL`,
      { headers },
    )

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((banner) => banner.id)).toEqual([newer?.id, older?.id])
    expect(res.body.data.map((banner) => banner.id)).not.toContain(nsfw?.id)
    expect(res.body.data[0]?.contentRating).toBe("NORMAL")
    expect(res.body.data[0]?.media).toEqual({ id: mediaId, title: null, imageCount: 3 })
    expect(res.body.data[0]?.uploader.id).toBe(userId)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/banners"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await api(app, "/banners", { headers }), 403, "FORBIDDEN")
  })

  test("rejects users without the required role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })

    expectFailure(await api(app, "/banners", { headers }), 403, "FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an unknown content rating", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(
      await api(app, "/banners?contentRating=SPICY", { headers }),
      422,
      "VALIDATION_ERROR",
    )
  })
})
