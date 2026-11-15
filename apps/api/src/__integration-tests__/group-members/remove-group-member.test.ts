import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const seedGroup = async (services: Services, creatorId: string) => {
  const id = randomUUID()

  await services.db
    .insertInto("groups")
    .values({ id, name: `Group ${id}`, creatorId })
    .execute()

  return id
}

describe("DELETE /groups/:id/members/:userId", () => {
  test("an owner can remove a member", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: targetId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${targetId}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("groupMemberships")
      .selectAll()
      .where("groupId", "=", groupId)
      .where("userId", "=", targetId)
      .executeTakeFirst()

    expect(row).toBeUndefined()
  })

  test("returns GROUP_MEMBER_NOT_FOUND when the target has no membership", async ({
    app,
    services,
  }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "ADMIN" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members/${randomUUID()}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_MEMBER_NOT_FOUND")
  })

  test("an owner cannot remove themselves through this route", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${ownerId}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(403)
  })

  test("an owner cannot remove another owner", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const { userId: coOwnerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: coOwnerId, groupId, role: "OWNER", addedBy: ownerId },
      ])
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${coOwnerId}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(403)
  })

  test("an admin can remove the only owner", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const { userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${ownerId}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)
  })

  test("a manager can remove a member whose permissions they hold", async ({ app, services }) => {
    const { headers, userId: managerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const { userId: strongerId } = await signInAs(services)
    const groupId = await seedGroup(services, managerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        {
          userId: managerId,
          groupId,
          role: "MEMBER",
          permissions: ["MANAGE_MEMBERS", "EDIT_CHAPTERS"],
          addedBy: managerId,
        },
        {
          userId: targetId,
          groupId,
          role: "MEMBER",
          permissions: ["EDIT_CHAPTERS"],
          addedBy: managerId,
        },
        {
          userId: strongerId,
          groupId,
          role: "MEMBER",
          permissions: ["DELETE_CHAPTERS"],
          addedBy: managerId,
        },
      ])
      .execute()

    const removed = await api(app, `/groups/${groupId}/members/${targetId}`, {
      method: "DELETE",
      headers,
    })
    const refused = await api(app, `/groups/${groupId}/members/${strongerId}`, {
      method: "DELETE",
      headers,
    })

    expect(removed.status).toBe(200)
    expect(refused.status).toBe(403)
  })

  test("moderators and uploaders cannot remove members", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: targetId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    for (const role of ["MODERATOR", "UPLOADER"] as const) {
      const { headers } = await signInAs(services, { role })
      const res = await api(app, `/groups/${groupId}/members/${targetId}`, {
        method: "DELETE",
        headers,
      })

      expect(res.status).toBe(403)
    }
  })

  test("returns FORBIDDEN for a non-owner USER", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const { userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: targetId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${targetId}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(403)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const res = await api(app, `/groups/${groupId}/members/${randomUUID()}`, { method: "DELETE" })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for a non-UUID userId", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "ADMIN" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members/not-a-uuid`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(422)
  })
})
