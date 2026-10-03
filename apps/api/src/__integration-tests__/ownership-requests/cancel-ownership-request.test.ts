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

describe("DELETE /ownership-requests/:id", () => {
  test("cancels the requester's own pending request", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const requestId = await seedRequest(services, { userId, groupId })
    const res = await api(app, `/ownership-requests/${requestId}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("groupOwnershipRequests")
      .select("status")
      .where("id", "=", requestId)
      .executeTakeFirst()

    expect(row?.status).toBe("CANCELLED")
  })

  test("returns OWNERSHIP_REQUEST_NOT_FOUND for an unknown id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/ownership-requests/${randomUUID()}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("OWNERSHIP_REQUEST_NOT_FOUND")
  })

  test("rejects when caller is not the requester (FORBIDDEN)", async ({ app, services }) => {
    const { userId: requesterId } = await signInAs(services)
    const { headers: otherHeaders } = await signInAs(services)
    const groupId = await seedGroup(services, requesterId)
    const requestId = await seedRequest(services, { userId: requesterId, groupId })
    const res = await api(app, `/ownership-requests/${requestId}`, {
      method: "DELETE",
      headers: otherHeaders,
    })

    expect(res.status).toBe(403)
  })

  test("returns OWNERSHIP_REQUEST_NOT_PENDING when the request is already closed", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const requestId = await seedRequest(services, { userId, groupId, status: "REJECTED" })
    const res = await api(app, `/ownership-requests/${requestId}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("OWNERSHIP_REQUEST_NOT_PENDING")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/ownership-requests/${randomUUID()}`, { method: "DELETE" })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/ownership-requests/not-a-uuid`, { method: "DELETE", headers })

    expect(res.status).toBe(422)
  })
})
