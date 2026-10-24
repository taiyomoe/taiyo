import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedMembership } from "../helpers/seed"
import { test } from "../setup"

describe("group visibility", () => {
  test("member permissions are only visible to people who manage members", async ({
    app,
    services,
  }) => {
    const owner = await signInAs(services)
    const member = await signInAs(services)
    const manager = await signInAs(services)
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const groupId = await seedGroup(services, owner.userId, `Group ${randomUUID()}`)

    await seedMembership(services, { groupId, userId: owner.userId, role: "OWNER" })
    await seedMembership(services, {
      groupId,
      userId: member.userId,
      permissions: ["EDIT_CHAPTERS"],
    })
    await seedMembership(services, {
      groupId,
      userId: manager.userId,
      permissions: ["MANAGE_MEMBERS"],
    })

    const permissionsSeenBy = async (headers?: Record<string, string>) => {
      const res = await api<Array<{ userId: string; permissions: string[] | null }>>(
        app,
        `/groups/${groupId}/members`,
        headers === undefined ? {} : { headers },
      )

      if (!res.body.success) {
        throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
      }

      return res.body.data.find((item) => item.userId === member.userId)?.permissions
    }

    expect(await permissionsSeenBy()).toBeNull()
    expect(await permissionsSeenBy(member.headers)).toBeNull()
    expect(await permissionsSeenBy(moderator.headers)).toBeNull()
    expect(await permissionsSeenBy(owner.headers)).toEqual(["EDIT_CHAPTERS"])
    expect(await permissionsSeenBy(manager.headers)).toEqual(["EDIT_CHAPTERS"])
    expect(await permissionsSeenBy(admin.headers)).toEqual(["EDIT_CHAPTERS"])
  })

  test("my groups lists memberships with role, permissions and member count", async ({
    app,
    services,
  }) => {
    const user = await signInAs(services)
    const other = await signInAs(services)
    const owned = await seedGroup(services, user.userId, `A ${randomUUID()}`)
    const joined = await seedGroup(services, user.userId, `B ${randomUUID()}`)
    const deleted = await seedGroup(services, user.userId, `C ${randomUUID()}`)

    await seedMembership(services, { groupId: owned, userId: user.userId, role: "OWNER" })
    await seedMembership(services, { groupId: owned, userId: other.userId })
    await seedMembership(services, {
      groupId: joined,
      userId: user.userId,
      permissions: ["UPLOAD_CHAPTERS"],
    })
    await seedMembership(services, { groupId: deleted, userId: user.userId, role: "OWNER" })
    await services.db
      .updateTable("groups")
      .set({ deletedAt: new Date() })
      .where("id", "=", deleted)
      .execute()

    const res = await api<
      Array<{ group: { id: string }; role: string; permissions: string[]; memberCount: number }>
    >(app, "/users/me/groups", { headers: user.headers })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(
      res.body.data.map(({ group, role, permissions, memberCount }) => ({
        id: group.id,
        role,
        permissions,
        memberCount,
      })),
    ).toEqual([
      { id: owned, role: "OWNER", permissions: [], memberCount: 2 },
      { id: joined, role: "MEMBER", permissions: ["UPLOAD_CHAPTERS"], memberCount: 1 },
    ])
  })

  test("groups can be searched by name and say whether they are owned", async ({
    app,
    services,
  }) => {
    const user = await signInAs(services)
    const tag = randomUUID().slice(0, 8)
    const owned = await seedGroup(services, user.userId, `Owned ${tag}`)
    const free = await seedGroup(services, user.userId, `Free ${tag}`)

    await seedGroup(services, user.userId, `100% ${tag}x`)
    await seedMembership(services, { groupId: owned, userId: user.userId, role: "OWNER" })

    const res = await api<Array<{ id: string; owned: boolean }>>(
      app,
      `/groups?search=${encodeURIComponent(tag.toUpperCase())}`,
    )
    const percent = await api<unknown[]>(app, `/groups?search=${encodeURIComponent("%")}`)

    if (!res.body.success || !percent.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.filter((item) => item.id !== owned && item.id !== free)).toHaveLength(1)
    expect(res.body.data.find((item) => item.id === owned)?.owned).toBe(true)
    expect(res.body.data.find((item) => item.id === free)?.owned).toBe(false)
    expect(percent.body.data).toHaveLength(1)
  })

  test("the latest chapters can be filtered by group", async ({ app, services }) => {
    const user = await signInAs(services)
    const mediaId = await seedMedia(services, user.userId)
    const groupId = await seedGroup(services, user.userId, `G ${randomUUID()}`)
    const credited = await seedChapter(services, {
      mediaId,
      uploaderId: user.userId,
      number: 1,
      groupIds: [groupId],
    })

    await seedChapter(services, { mediaId, uploaderId: user.userId, number: 2 })

    const res = await api<Array<{ id: string }>>(app, `/chapters/latest?groupId=${groupId}`)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((item) => item.id)).toEqual([credited])
  })

  test("a group says whether it is owned", async ({ app, services }) => {
    const user = await signInAs(services)
    const groupId = await seedGroup(services, user.userId, `G ${randomUUID()}`)
    const before = await api<{ owned: boolean }>(app, `/groups/${groupId}`)

    await seedMembership(services, { groupId, userId: user.userId, role: "OWNER" })

    const after = await api<{ owned: boolean }>(app, `/groups/${groupId}`)

    expect(before.body).toMatchObject({ data: { owned: false } })
    expect(after.body).toMatchObject({ data: { owned: true } })
  })
})
