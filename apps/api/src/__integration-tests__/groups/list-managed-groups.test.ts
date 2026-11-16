import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedMembership } from "../helpers/seed"
import { test } from "../setup"

type ManagedGroup = {
  id: string
  name: string
  logoUrl: string | null
  memberCount: number
  chapterCount: number
  followerCount: number
  owner: { id: string; username: string } | null
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

describe("GET /groups/managed", () => {
  test("lists the groups matching the search, newest first, with their counts and owner", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const firstOwner = await signInAs(services)
    const secondOwner = await signInAs(services)
    const member = await signInAs(services)
    const older = await seedGroup(services, userId, "Zyxwv Older")
    const newer = await seedGroup(services, userId, "Zyxwv Newer")
    const mediaId = await seedMedia(services, userId)

    await services.db
      .updateTable("groups")
      .set({ createdAt: new Date("2020-01-01T00:00:00Z") })
      .where("id", "=", older)
      .execute()
    await seedMembership(services, { groupId: older, userId: firstOwner.userId, role: "OWNER" })
    await services.db
      .insertInto("groupMemberships")
      .values({
        groupId: older,
        userId: secondOwner.userId,
        role: "OWNER",
        addedBy: secondOwner.userId,
        createdAt: new Date(Date.now() + 60_000),
      })
      .execute()
    await seedMembership(services, { groupId: older, userId: member.userId })
    await seedChapter(services, { mediaId, uploaderId: userId, number: 1, groupIds: [older] })
    await seedChapter(services, { mediaId, uploaderId: userId, number: 2, groupIds: [older] })

    const deletedChapter = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 3,
      groupIds: [older],
    })

    await services.db
      .updateTable("chapters")
      .set({ deletedAt: new Date() })
      .where("id", "=", deletedChapter)
      .execute()
    await services.db
      .insertInto("groupFollows")
      .values([
        { groupId: older, userId: member.userId },
        { groupId: older, userId: firstOwner.userId },
      ])
      .execute()

    const body = getData(
      await api<ManagedGroup[]>(app, "/groups/managed?search=zyxwv", { headers }),
    )

    expect(body.data.map((group) => group.id)).toEqual([newer, older])
    expect(body.meta).toEqual({ page: 1, perPage: 20, total: 2 })
    expect(body.data[0]).toMatchObject({
      memberCount: 0,
      chapterCount: 0,
      followerCount: 0,
      owner: null,
    })
    expect(body.data[1]).toMatchObject({
      name: "Zyxwv Older",
      logoUrl: null,
      memberCount: 3,
      chapterCount: 2,
      followerCount: 2,
      owner: { id: firstOwner.userId },
    })
  })

  test("filters by ownership and paginates", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const owned = await seedGroup(services, userId, "Zyxwv Owned")
    const orphan = await seedGroup(services, userId, "Zyxwv Orphan")

    await seedMembership(services, { groupId: owned, userId, role: "OWNER" })

    const withOwner = getData(
      await api<ManagedGroup[]>(app, "/groups/managed?search=zyxwv&owned=true", { headers }),
    )
    const withoutOwner = getData(
      await api<ManagedGroup[]>(app, "/groups/managed?search=zyxwv&owned=false", { headers }),
    )

    expect(withOwner.data.map((group) => group.id)).toEqual([owned])
    expect(withoutOwner.data.map((group) => group.id)).toEqual([orphan])

    const paged = getData(
      await api<ManagedGroup[]>(app, "/groups/managed?search=zyxwv&perPage=1&page=2", { headers }),
    )

    expect(paged.data).toHaveLength(1)
    expect(paged.meta).toEqual({ page: 2, perPage: 1, total: 2 })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/groups/managed"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await api(app, "/groups/managed", { headers }), 403, "FORBIDDEN")
  })

  test("rejects group owners without the required role with FORBIDDEN", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER_INTERN" })
    const groupId = await seedGroup(services, userId, "Zyxwv Mine")

    await seedMembership(services, { groupId, userId, role: "OWNER" })

    expectFailure(await api(app, "/groups/managed", { headers }), 403, "FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an invalid ownership filter", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(
      await api(app, "/groups/managed?owned=maybe", { headers }),
      422,
      "VALIDATION_ERROR",
    )
  })
})
