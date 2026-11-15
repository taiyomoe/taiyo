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

describe("POST /groups/:id/transfer", () => {
  test("hands ownership to another member", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const { userId: memberId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: memberId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    const res = await api<{ groupId: string; fromUserId: string; toUserId: string }>(
      app,
      `/groups/${groupId}/transfer`,
      { method: "POST", headers, json: { toUserId: memberId } },
    )

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({ groupId, fromUserId: ownerId, toUserId: memberId })

    const rows = await services.db
      .selectFrom("groupMemberships")
      .select(["userId", "role"])
      .where("groupId", "=", groupId)
      .execute()

    expect(Object.fromEntries(rows.map((row) => [row.userId, row.role]))).toEqual({
      [ownerId]: "MEMBER",
      [memberId]: "OWNER",
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/groups/${randomUUID()}/transfer`, {
      method: "POST",
      json: { toUserId: randomUUID() },
    })

    expect(res.status).toBe(401)
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/groups/${randomUUID()}/transfer`, {
      method: "POST",
      headers,
      json: { toUserId: randomUUID() },
    })

    expect(res.status).toBe(403)
  })

  test("rejects a moderator who does not own the group with FORBIDDEN", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/transfer`, {
      method: "POST",
      headers,
      json: { toUserId: ownerId },
    })

    expect(res.status).toBe(403)
  })

  test("returns GROUP_MEMBER_NOT_FOUND when the target is not a member", async ({
    app,
    services,
  }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/transfer`, {
      method: "POST",
      headers,
      json: { toUserId: randomUUID() },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_MEMBER_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR when transferring to yourself", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId: ownerId, groupId, role: "OWNER", addedBy: ownerId })
      .execute()

    const res = await api(app, `/groups/${groupId}/transfer`, {
      method: "POST",
      headers,
      json: { toUserId: ownerId },
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns GROUP_NOT_FOUND for an unknown group", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/groups/${randomUUID()}/transfer`, {
      method: "POST",
      headers,
      json: { toUserId: randomUUID() },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })
})
