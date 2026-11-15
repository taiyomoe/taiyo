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

describe("GET /groups/:id/ownership-requests", () => {
  test("an admin sees every request on the group", async ({ app, services }) => {
    const { headers, userId: adminId } = await signInAs(services, { role: "ADMIN" })
    const { userId: u1 } = await signInAs(services)
    const { userId: u2 } = await signInAs(services)
    const groupId = await seedGroup(services, adminId)

    await services.db
      .insertInto("groupOwnershipRequests")
      .values([
        { userId: u1, groupId, message: null },
        { userId: u2, groupId, message: null },
      ])
      .execute()

    const res = await api<Array<{ userId: string }>>(app, `/groups/${groupId}/ownership-requests`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(2)
  })

  test("a moderator only sees their own requests", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const { userId: otherId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)

    await services.db
      .insertInto("groupOwnershipRequests")
      .values({ userId: otherId, groupId, message: null })
      .execute()

    const res = await api<Array<{ userId: string }>>(app, `/groups/${groupId}/ownership-requests`, {
      headers,
    })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual([])
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

    const res = await api<Array<{ userId: string }>>(app, `/groups/${groupId}/ownership-requests`, {
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
