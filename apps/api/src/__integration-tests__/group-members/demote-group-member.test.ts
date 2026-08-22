import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const seedGroup = async (services: { db: any }, creatorId: string) => {
  const id = randomUUID()

  await services.db
    .insertInto("groups")
    .values({ id, name: `Group ${id}`, creatorId })
    .execute()

  return id
}

describe("POST /groups/:id/members/:userId/demote", () => {
  test("demotes an OWNER to MEMBER when other owners remain", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: targetId, groupId, role: "OWNER", addedBy: ownerId },
      ])
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${targetId}/demote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("groupMemberships")
      .select("role")
      .where("groupId", "=", groupId)
      .where("userId", "=", targetId)
      .executeTakeFirst()

    expect(row?.role).toBe("MEMBER")
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
    const { headers, userId: ownerId } = await signInAs(services, { role: "MODERATOR" })
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
