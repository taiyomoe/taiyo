import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia, seedTitle } from "../helpers/seed"
import { test } from "../setup"

type ManagedMedia = {
  id: string
  title: string | null
  chapterCount: number
  deletedAt: string | null
}

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}
const getData = <T>(res: ApiResult<T>) => {
  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body
}

describe("GET /medias", () => {
  test("lists medias matching the search with their published chapter count", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER_INTERN" })
    const mediaId = await seedMedia(services, userId)

    await seedTitle(services, {
      mediaId,
      creatorId: userId,
      title: "Zyxwv Chronicles",
      isMainTitle: true,
    })
    await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })
    await seedChapter(services, { mediaId, uploaderId: userId, number: 2, status: "PENDING" })

    const body = getData(await api<ManagedMedia[]>(app, "/medias?search=zyxwv", { headers }))

    expect(body.data).toEqual([
      expect.objectContaining({
        id: mediaId,
        title: "Zyxwv Chronicles",
        chapterCount: 1,
        deletedAt: null,
      }),
    ])
    expect(body.meta).toEqual({ page: 1, perPage: 20, total: 1 })
  })

  test("lists the deleted medias to admins", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date(), deleterId: userId })
      .where("id", "=", mediaId)
      .execute()

    const live = getData(await api<ManagedMedia[]>(app, "/medias?perPage=100", { headers }))
    const deleted = getData(await api<ManagedMedia[]>(app, "/medias?deleted=true", { headers }))

    expect(live.data.some((media) => media.id === mediaId)).toBe(false)
    expect(deleted.data.map((media) => media.id)).toContain(mediaId)
    expect(deleted.data.every((media) => media.deletedAt !== null)).toBe(true)
  })

  test("rejects listing the deleted medias without being an admin", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })

    expectFailure(await api(app, "/medias?deleted=true", { headers }), 403, "FORBIDDEN")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/medias"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await api(app, "/medias", { headers }), 403, "FORBIDDEN")
  })

  test("rejects users without the required role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })

    expectFailure(await api(app, "/medias", { headers }), 403, "FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an unknown type", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(await api(app, "/medias?type=COMIC", { headers }), 422, "VALIDATION_ERROR")
  })
})
