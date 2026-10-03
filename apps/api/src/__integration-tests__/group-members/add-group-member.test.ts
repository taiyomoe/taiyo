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

describe("POST /groups/:id/members", () => {
  test("an owner can add a new MEMBER", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "MEMBER" },
    })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("groupMemberships")
      .selectAll()
      .where("groupId", "=", groupId)
      .where("userId", "=", targetId)
      .executeTakeFirst()

    expect(row?.role).toBe("MEMBER")
  })

  test("a moderator can add a member without being an owner", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "OWNER" },
    })

    expect(res.status).toBe(201)
  })

  test("returns NOT_FOUND for an unknown target user", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "MODERATOR" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: randomUUID(), role: "MEMBER" },
    })

    expect(res.status).toBe(404)
  })

  test("returns GROUP_MEMBER_EXISTS when the user is already a member", async ({
    app,
    services,
  }) => {
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

    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "MEMBER" },
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_MEMBER_EXISTS")
  })

  test("returns FORBIDDEN for a USER who is not an owner of the group", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services)
    const { userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "MEMBER" },
    })

    expect(res.status).toBe(403)
  })

  test("returns GROUP_NOT_FOUND for an unknown group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId: targetId } = await signInAs(services)
    const res = await api(app, `/groups/${randomUUID()}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "MEMBER" },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      json: { userId: randomUUID(), role: "MEMBER" },
    })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for a missing role", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "MODERATOR" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: randomUUID() },
    })

    expect(res.status).toBe(422)
  })
})
