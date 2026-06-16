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

describe("GET /groups/:id/members", () => {
  test("lists every member of the group with their role", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { userId: memberId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: memberId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    const res = await api<{ userId: string; role: string }[]>(app, `/groups/${groupId}/members`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(2)

    const roles = res.body.data.reduce<Record<string, string>>((acc, item) => {
      acc[item.userId] = item.role

      return acc
    }, {})

    expect(roles[ownerId]).toBe("OWNER")
    expect(roles[memberId]).toBe("MEMBER")
  })

  test("returns GROUP_NOT_FOUND for a missing group", async ({ app }) => {
    const res = await api(app, `/groups/${randomUUID()}/members`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app }) => {
    const res = await api(app, `/groups/not-a-uuid/members`)

    expect(res.status).toBe(422)
  })
})
