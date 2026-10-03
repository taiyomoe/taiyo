import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_GROUP_ID = "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1"
const getUnownedGroup = async (services: { db: any; auth: any }, creatorId: string) => {
  const id = randomUUID()

  await services.db
    .insertInto("groups")
    .values({ id, name: `Group ${id}`, creatorId })
    .execute()

  return id
}

describe("POST /groups/:id/ownership-requests", () => {
  test("creates a pending ownership request", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const groupId = await getUnownedGroup(services, userId)
    const res = await api<{ id: string; status: string }>(
      app,
      `/groups/${groupId}/ownership-requests`,
      { method: "POST", headers, json: { message: "I run this group on Discord." } },
    )

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.status).toBe("PENDING")

    const row = await services.db
      .selectFrom("groupOwnershipRequests")
      .selectAll()
      .where("id", "=", res.body.data.id)
      .executeTakeFirst()

    expect(row?.userId).toBe(userId)
    expect(row?.groupId).toBe(groupId)
    expect(row?.message).toBe("I run this group on Discord.")
  })

  test("returns GROUP_NOT_FOUND for a missing group", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/groups/${randomUUID()}/ownership-requests`, {
      method: "POST",
      headers,
      json: {},
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })

  test("returns GROUP_ALREADY_OWNED when an OWNER membership exists", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const ownerId = randomUUID()
    const groupId = await getUnownedGroup(services, userId)

    await services.db
      .insertInto("users")
      .values({
        id: ownerId,
        name: "owner",
        email: `${ownerId}@test.local`,
        normalizedEmail: `${ownerId}@test.local`,
        emailVerified: true,
        username: `o${ownerId.slice(0, 8)}`,
        displayUsername: `o${ownerId.slice(0, 8)}`,
        role: "USER",
      })
      .execute()
    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: userId })
      .execute()

    const res = await api(app, `/groups/${groupId}/ownership-requests`, {
      method: "POST",
      headers,
      json: {},
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_ALREADY_OWNED")
  })

  test("returns OWNERSHIP_REQUEST_EXISTS for a duplicate pending request", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)
    const groupId = await getUnownedGroup(services, userId)

    await services.db
      .insertInto("groupOwnershipRequests")
      .values({ userId, groupId, message: null })
      .execute()

    const res = await api(app, `/groups/${groupId}/ownership-requests`, {
      method: "POST",
      headers,
      json: {},
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("OWNERSHIP_REQUEST_EXISTS")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}/ownership-requests`, {
      method: "POST",
      json: {},
    })

    expect(res.status).toBe(401)
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}/ownership-requests`, {
      method: "POST",
      headers,
      json: {},
    })

    expect(res.status).toBe(403)
  })

  test("returns VALIDATION_ERROR for an over-long message", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}/ownership-requests`, {
      method: "POST",
      headers,
      json: { message: "x".repeat(2001) },
    })

    expect(res.status).toBe(422)
  })
})
