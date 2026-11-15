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

describe("POST /groups/:id/members/:userId/demote", () => {
  test("an owner can step down when other owners remain", async ({ app, services }) => {
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

    const res = await api(app, `/groups/${groupId}/members/${ownerId}/demote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("groupMemberships")
      .select("role")
      .where("groupId", "=", groupId)
      .where("userId", "=", ownerId)
      .executeTakeFirst()

    expect(row?.role).toBe("MEMBER")
  })

  test("an owner cannot demote another owner", async ({ app, services }) => {
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

    const res = await api(app, `/groups/${groupId}/members/${coOwnerId}/demote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(403)
  })

  test("an admin can demote any owner", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const { userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${ownerId}/demote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(201)
  })

  test("returns GROUP_LAST_OWNER when target is the only owner", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${ownerId}/demote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_LAST_OWNER")
  })

  test("returns GROUP_MEMBER_NOT_FOUND when target has no membership", async ({
    app,
    services,
  }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "ADMIN" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members/${randomUUID()}/demote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_MEMBER_NOT_FOUND")
  })

  test("returns FORBIDDEN for a non-owner USER", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const { userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${ownerId}/demote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(403)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const res = await api(app, `/groups/${groupId}/members/${randomUUID()}/demote`, {
      method: "POST",
    })

    expect(res.status).toBe(401)
  })
})
