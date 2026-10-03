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

describe("POST /ownership-requests/:id/reject", () => {
  test("rejects a pending request and stores the note", async ({ app, services }) => {
    const { headers, userId: reviewerId } = await signInAs(services, { role: "MODERATOR" })
    const { userId: requesterId } = await signInAs(services)
    const groupId = await seedGroup(services, requesterId)
    const requestId = await seedRequest(services, { userId: requesterId, groupId })
    const res = await api(app, `/ownership-requests/${requestId}/reject`, {
      method: "POST",
      headers,
      json: { note: "Not enough activity yet." },
    })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("groupOwnershipRequests")
      .selectAll()
      .where("id", "=", requestId)
      .executeTakeFirst()

    expect(row?.status).toBe("REJECTED")
    expect(row?.reviewerId).toBe(reviewerId)
    expect(row?.reviewerNote).toBe("Not enough activity yet.")
  })

  test("returns OWNERSHIP_REQUEST_NOT_FOUND for an unknown id", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, `/ownership-requests/${randomUUID()}/reject`, {
      method: "POST",
      headers,
      json: {},
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("OWNERSHIP_REQUEST_NOT_FOUND")
  })

  test("returns OWNERSHIP_REQUEST_NOT_PENDING for a closed request", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId: requesterId } = await signInAs(services)
    const groupId = await seedGroup(services, requesterId)
    const requestId = await seedRequest(services, {
      userId: requesterId,
      groupId,
      status: "APPROVED",
    })
    const res = await api(app, `/ownership-requests/${requestId}/reject`, {
      method: "POST",
      headers,
      json: {},
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("OWNERSHIP_REQUEST_NOT_PENDING")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/ownership-requests/${randomUUID()}/reject`, {
      method: "POST",
      json: {},
    })

    expect(res.status).toBe(401)
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/ownership-requests/${randomUUID()}/reject`, {
      method: "POST",
      headers,
      json: {},
    })

    expect(res.status).toBe(403)
  })

  test("returns VALIDATION_ERROR for an over-long note", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, `/ownership-requests/${randomUUID()}/reject`, {
      method: "POST",
      headers,
      json: { note: "x".repeat(2001) },
    })

    expect(res.status).toBe(422)
  })
})
