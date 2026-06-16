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

describe("POST /groups/:id/leave", () => {
  test("removes the caller's own membership", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const { userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    const res = await api(app, `/groups/${groupId}/leave`, { method: "POST", headers })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("groupMemberships")
      .selectAll()
      .where("groupId", "=", groupId)
      .where("userId", "=", userId)
      .executeTakeFirst()

    expect(row).toBeUndefined()
  })

  test("returns GROUP_MEMBER_NOT_FOUND when caller has no membership", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services)
    const { userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/leave`, { method: "POST", headers })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_MEMBER_NOT_FOUND")
  })

  test("returns GROUP_LAST_OWNER when caller is the sole owner", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)

    await services.db
      .insertInto("groupMemberships")
      .values({ userId, groupId, role: "OWNER", addedBy: userId })
      .execute()

    const res = await api(app, `/groups/${groupId}/leave`, { method: "POST", headers })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_LAST_OWNER")
  })

  test("returns GROUP_NOT_FOUND for a missing group", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/groups/${randomUUID()}/leave`, { method: "POST", headers })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const res = await api(app, `/groups/${groupId}/leave`, { method: "POST" })

    expect(res.status).toBe(401)
  })
})
