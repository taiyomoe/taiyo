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

describe("POST /groups/:id/members/:userId/promote", () => {
  test("promotes a MEMBER to OWNER", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: targetId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${targetId}/promote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("groupMemberships")
      .select("role")
      .where("groupId", "=", groupId)
      .where("userId", "=", targetId)
      .executeTakeFirst()

    expect(row?.role).toBe("OWNER")
  })

  test("managers, moderators and uploaders cannot promote", async ({ app, services }) => {
    const { headers: managerHeaders, userId: managerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, managerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        {
          userId: managerId,
          groupId,
          role: "MEMBER",
          permissions: [
            "MANAGE_MEMBERS",
            "UPLOAD_CHAPTERS",
            "EDIT_CHAPTERS",
            "DELETE_CHAPTERS",
            "EDIT_GROUP",
          ],
          addedBy: managerId,
        },
        { userId: targetId, groupId, role: "MEMBER", addedBy: managerId },
      ])
      .execute()

    const staffHeaders = await Promise.all(
      (["MODERATOR", "UPLOADER"] as const).map(
        async (role) => (await signInAs(services, { role })).headers,
      ),
    )

    for (const headers of [managerHeaders, ...staffHeaders]) {
      const res = await api(app, `/groups/${groupId}/members/${targetId}/promote`, {
        method: "POST",
        headers,
      })

      expect(res.status).toBe(403)
    }

    for (const userId of [managerId, targetId]) {
      const row = await services.db
        .selectFrom("groupMemberships")
        .select("role")
        .where("groupId", "=", groupId)
        .where("userId", "=", userId)
        .executeTakeFirstOrThrow()

      expect(row.role).toBe("MEMBER")
    }
  })

  test("returns GROUP_MEMBER_NOT_FOUND when the target has no membership", async ({
    app,
    services,
  }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "ADMIN" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members/${randomUUID()}/promote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_MEMBER_NOT_FOUND")
  })

  test("returns FORBIDDEN for a non-owner USER", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const { userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: targetId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${targetId}/promote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(403)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const groupId = await seedGroup(services, userId)
    const res = await api(app, `/groups/${groupId}/members/${randomUUID()}/promote`, {
      method: "POST",
    })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for a non-UUID userId", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "ADMIN" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members/not-a-uuid/promote`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(422)
  })
})
