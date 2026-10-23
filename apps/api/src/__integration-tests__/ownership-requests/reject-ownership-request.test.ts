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
const seedRequest = async (
  services: Services,
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

  return row.id
}

describe("POST /ownership-requests/:id/reject", () => {
  test("rejects a pending request and stores the note", async ({ app, services }) => {
    const { headers, userId: reviewerId } = await signInAs(services, { role: "ADMIN" })
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
    const { headers } = await signInAs(services, { role: "ADMIN" })
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
    const { headers } = await signInAs(services, { role: "ADMIN" })
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

  test("only admins can reject requests", async ({ app, services }) => {
    const { userId: requesterId } = await signInAs(services)
    const groupId = await seedGroup(services, requesterId)
    const requestId = await seedRequest(services, { userId: requesterId, groupId })

    for (const role of ["MODERATOR", "UPLOADER", "UPLOADER_INTERN"] as const) {
      const { headers } = await signInAs(services, { role })
      const res = await api(app, `/ownership-requests/${requestId}/reject`, {
        method: "POST",
        headers,
        json: { note: "No." },
      })

      expect(res.status).toBe(403)
    }

    const request = await services.db
      .selectFrom("groupOwnershipRequests")
      .select("status")
      .where("id", "=", requestId)
      .executeTakeFirstOrThrow()
    const memberships = await services.db
      .selectFrom("groupMemberships")
      .select("userId")
      .where("groupId", "=", groupId)
      .execute()

    expect(request.status).toBe("PENDING")
    expect(memberships).toEqual([])
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
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/ownership-requests/${randomUUID()}/reject`, {
      method: "POST",
      headers,
      json: { note: "x".repeat(2001) },
    })

    expect(res.status).toBe(422)
  })

  test("concurrent approve and reject: exactly one wins", async ({ app, services }) => {
    const { headers, userId: reviewerId } = await signInAs(services, { role: "ADMIN" })
    const { userId: requesterId } = await signInAs(services)
    const groupId = await seedGroup(services, reviewerId)
    const requestId = await seedRequest(services, { userId: requesterId, groupId })
    const [approveRes, rejectRes] = await Promise.all([
      api(app, `/ownership-requests/${requestId}/approve`, { method: "POST", headers }),
      api(app, `/ownership-requests/${requestId}/reject`, { method: "POST", headers, json: {} }),
    ])
    const statuses = [approveRes.status, rejectRes.status].sort((a, b) => a - b)

    expect(statuses).toEqual([201, 409])

    const loser = approveRes.status === 409 ? approveRes : rejectRes

    if (loser.body.success) {
      throw new Error("Expected the losing transition to fail")
    }

    expect(loser.body.code).toBe("OWNERSHIP_REQUEST_NOT_PENDING")

    const request = await services.db
      .selectFrom("groupOwnershipRequests")
      .select("status")
      .where("id", "=", requestId)
      .executeTakeFirstOrThrow()
    const membership = await services.db
      .selectFrom("groupMemberships")
      .select("role")
      .where("groupId", "=", groupId)
      .where("userId", "=", requesterId)
      .executeTakeFirst()

    expect({ status: request.status, role: membership?.role }).toEqual(
      approveRes.status === 201
        ? { status: "APPROVED", role: "OWNER" }
        : { status: "REJECTED", role: undefined },
    )
  })
})
