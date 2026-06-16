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

describe("GET /groups/:id/ownership-requests", () => {
  test("a moderator sees every request on the group", async ({ app, services }) => {
    const { headers, userId: modId } = await signInAs(services, { role: "MODERATOR" })
    const { userId: u1 } = await signInAs(services)
    const { userId: u2 } = await signInAs(services)
    const groupId = await seedGroup(services, modId)

    await services.db
      .insertInto("groupOwnershipRequests")
      .values([
        { userId: u1, groupId, message: null },
        { userId: u2, groupId, message: null },
      ])
      .execute()

    const res = await api<{ userId: string }[]>(app, `/groups/${groupId}/ownership-requests`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(2)
  })

  test("a regular user only sees their own request", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const { userId: otherId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)

    await services.db
      .insertInto("groupOwnershipRequests")
      .values([
        { userId, groupId, message: null },
        { userId: otherId, groupId, message: null },
      ])
      .execute()

    const res = await api<{ userId: string }[]>(app, `/groups/${groupId}/ownership-requests`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0]?.userId).toBe(userId)
  })

  test("returns GROUP_NOT_FOUND for a missing group", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/groups/${randomUUID()}/ownership-requests`, { headers })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const res = await api(app, `/groups/${groupId}/ownership-requests`)

    expect(res.status).toBe(401)
  })
})
