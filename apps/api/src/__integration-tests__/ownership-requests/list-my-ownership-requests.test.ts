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

describe("GET /ownership-requests/mine", () => {
  test("lists the caller's own requests only", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const { userId: otherId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const otherGroupId = await seedGroup(services, otherId)

    await services.db
      .insertInto("groupOwnershipRequests")
      .values([
        { userId, groupId, message: "mine" },
        { userId: otherId, groupId: otherGroupId, message: "someone else's" },
      ])
      .execute()

    const res = await api<{ message: string | null }[]>(app, `/ownership-requests/mine`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0]?.message).toBe("mine")
  })

  test("filters by status", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const otherGroupId = await seedGroup(services, userId)

    await services.db
      .insertInto("groupOwnershipRequests")
      .values([
        { userId, groupId, status: "PENDING", message: null },
        { userId, groupId: otherGroupId, status: "REJECTED", message: null },
      ])
      .execute()

    const res = await api<{ status: string }[]>(app, `/ownership-requests/mine?status=REJECTED`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0]?.status).toBe("REJECTED")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/ownership-requests/mine`)

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for an invalid status", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/ownership-requests/mine?status=NOT_A_STATUS`, { headers })

    expect(res.status).toBe(422)
  })
})
