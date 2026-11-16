import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedMembership, seedTitle } from "../helpers/seed"
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

  test("lists only the chapters of a member's groups and their own uploads", async ({
    app,
    services,
  }) => {
    const owner = await signInAs(services, { role: "ADMIN" })
    const { headers, userId } = await signInAs(services)
    const mediaId = await seedMedia(services, owner.userId)
    const mine = await seedGroup(services, owner.userId, "Mine Scans")
    const theirs = await seedGroup(services, owner.userId, "Other Scans")

    await seedMembership(services, { groupId: mine, userId, permissions: ["EDIT_CHAPTERS"] })

    const credited = await seedChapter(services, {
      mediaId,
      uploaderId: owner.userId,
      number: 1,
      groupIds: [mine],
    })
    const uploaded = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 2,
      status: "PENDING",
    })

    await seedChapter(services, {
      mediaId,
      uploaderId: owner.userId,
      number: 3,
      groupIds: [theirs],
    })

    const res = await api<ManagedChapter[]>(app, `/chapters?mediaId=${mediaId}`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((chapter) => chapter.id).sort()).toEqual([credited, uploaded].sort())
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/chapters"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await api(app, "/chapters", { headers }), 403, "FORBIDDEN")
  })

  test("rejects users without a role or a group chapter permission with FORBIDDEN", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER_INTERN" })

    expectFailure(await api(app, "/chapters", { headers }), 403, "FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an unknown status", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(await api(app, "/chapters?status=LOST", { headers }), 422, "VALIDATION_ERROR")
  })
})
