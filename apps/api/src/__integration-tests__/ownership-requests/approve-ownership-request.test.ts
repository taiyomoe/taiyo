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
const seedRequest = async (
  services: { db: any },
  opts: {
    userId: string
    groupId: string
    status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  },
) => {
  const row = await services.db
    .insertInto("groupOwnershipRequests")
    .values({
      userId: opts.userId,
      groupId: opts.groupId,
      status: opts.status,
      message: null,
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  return row.id as string
}

describe("POST /ownership-requests/:id/approve", () => {
  test("grants OWNER membership and approves the request", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId: requesterId } = await signInAs(services)
    const groupId = await seedGroup(services, requesterId)
    const requestId = await seedRequest(services, { userId: requesterId, groupId })
    const res = await api(app, `/ownership-requests/${requestId}/approve`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(201)

    const request = await services.db
      .selectFrom("groupOwnershipRequests")
      .selectAll()
      .where("id", "=", requestId)
      .executeTakeFirst()
    const membership = await services.db
      .selectFrom("groupMemberships")
      .selectAll()
      .where("groupId", "=", groupId)
      .where("userId", "=", requesterId)
      .executeTakeFirst()

    expect(request?.status).toBe("APPROVED")
    expect(membership?.role).toBe("OWNER")
  })

  test("auto-cancels other pending requests on the same group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId: winnerId } = await signInAs(services)
    const { userId: loserId } = await signInAs(services)
    const groupId = await seedGroup(services, winnerId)
    const winnerRequestId = await seedRequest(services, { userId: winnerId, groupId })
    const loserRequestId = await seedRequest(services, { userId: loserId, groupId })

    await api(app, `/ownership-requests/${winnerRequestId}/approve`, {
      method: "POST",
      headers,
    })

    const loser = await services.db
      .selectFrom("groupOwnershipRequests")
      .select("status")
      .where("id", "=", loserRequestId)
      .executeTakeFirst()

    expect(loser?.status).toBe("CANCELLED")
  })

  test("returns OWNERSHIP_REQUEST_NOT_FOUND for an unknown id", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, `/ownership-requests/${randomUUID()}/approve`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("OWNERSHIP_REQUEST_NOT_FOUND")
  })

  test("returns OWNERSHIP_REQUEST_NOT_PENDING when the request is closed", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId: requesterId } = await signInAs(services)
    const groupId = await seedGroup(services, requesterId)
    const requestId = await seedRequest(services, {
      userId: requesterId,
      groupId,
      status: "REJECTED",
    })
    const res = await api(app, `/ownership-requests/${requestId}/approve`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("OWNERSHIP_REQUEST_NOT_PENDING")
  })

  test("returns GROUP_ALREADY_OWNED when an OWNER already exists", async ({ app, services }) => {
    const { headers, userId: modId } = await signInAs(services, { role: "MODERATOR" })
    const { userId: existingOwnerId } = await signInAs(services)
    const { userId: requesterId } = await signInAs(services)
    const groupId = await seedGroup(services, modId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: existingOwnerId, groupId, role: "OWNER", addedBy: modId })
      .execute()

    const requestId = await seedRequest(services, { userId: requesterId, groupId })
    const res = await api(app, `/ownership-requests/${requestId}/approve`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_ALREADY_OWNED")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/ownership-requests/${randomUUID()}/approve`, { method: "POST" })

    expect(res.status).toBe(401)
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/ownership-requests/${randomUUID()}/approve`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(403)
  })
})
