import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia, seedTitle } from "../helpers/seed"
import { test } from "../setup"

type ManagedChapter = { id: string; status: string; mediaTitle: string | null; number: number }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /chapters", () => {
  test("lists the chapters of every status matching the filters", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const mediaId = await seedMedia(services, userId)

    await seedTitle(services, { mediaId, creatorId: userId, title: "Qwzx Saga", isMainTitle: true })

    const pending = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 7,
      status: "PENDING",
    })
    const published = await seedChapter(services, { mediaId, uploaderId: userId, number: 8 })
    const all = await api<ManagedChapter[]>(app, `/chapters?search=qwzx`, { headers })
    const onlyPending = await api<ManagedChapter[]>(
      app,
      `/chapters?mediaId=${mediaId}&status=PENDING`,
      { headers },
    )

    if (!all.body.success || !onlyPending.body.success) {
      throw new Error(`Expected success: ${JSON.stringify([all.body, onlyPending.body])}`)
    }

    expect(all.body.data.map((chapter) => chapter.id)).toEqual([published, pending])
    expect(all.body.data[0]).toEqual(
      expect.objectContaining({ mediaTitle: "Qwzx Saga", number: 8 }),
    )
    expect(onlyPending.body.data.map((chapter) => chapter.id)).toEqual([pending])
    expect(onlyPending.body.meta).toEqual({ page: 1, perPage: 20, total: 1 })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/chapters"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await api(app, "/chapters", { headers }), 403, "FORBIDDEN")
  })

  test("rejects users without the required role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER_INTERN" })

    expectFailure(await api(app, "/chapters", { headers }), 403, "FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an unknown status", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(await api(app, "/chapters?status=LOST", { headers }), 422, "VALIDATION_ERROR")
  })
})
