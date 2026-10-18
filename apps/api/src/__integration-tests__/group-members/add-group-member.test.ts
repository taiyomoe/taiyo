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

describe("POST /groups/:id/members", () => {
  test("an admin can add a member with permissions", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const { userId: creatorId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, creatorId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "MEMBER", permissions: ["EDIT_CHAPTERS", "UPLOAD_CHAPTERS"] },
    })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("groupMemberships")
      .selectAll()
      .where("groupId", "=", groupId)
      .where("userId", "=", targetId)
      .executeTakeFirst()

    expect(row?.role).toBe("MEMBER")
    expect(row?.permissions).toEqual(["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"])
  })

  test("an admin can add an owner", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const { userId: creatorId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, creatorId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "OWNER" },
    })

    expect(res.status).toBe(201)
  })

  test("owners, managers and staff below admin cannot add members directly", async ({
    app,
    services,
  }) => {
    const { headers: ownerHeaders, userId: ownerId } = await signInAs(services)
    const { headers: managerHeaders, userId: managerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        {
          userId: managerId,
          groupId,
          role: "MEMBER",
          permissions: ["MANAGE_MEMBERS"],
          addedBy: ownerId,
        },
      ])
      .execute()

    const staffHeaders = await Promise.all(
      (["MODERATOR", "UPLOADER", "UPLOADER_INTERN"] as const).map(
        async (role) => (await signInAs(services, { role })).headers,
      ),
    )

    for (const headers of [ownerHeaders, managerHeaders, ...staffHeaders]) {
      const res = await api(app, `/groups/${groupId}/members`, {
        method: "POST",
        headers,
        json: { userId: targetId, role: "MEMBER" },
      })

      expect(res.status).toBe(403)
    }
  })

  test("returns VALIDATION_ERROR for an unknown permission", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const groupId = await seedGroup(services, userId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: randomUUID(), role: "MEMBER", permissions: ["DELETE_GROUP"] },
    })

    expect(res.status).toBe(422)
  })

  test("returns NOT_FOUND for an unknown target user", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "ADMIN" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: randomUUID(), role: "MEMBER" },
    })

    expect(res.status).toBe(404)
  })

  test("returns GROUP_MEMBER_EXISTS when the user is already a member", async ({
    app,
    services,
  }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "ADMIN" })
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: ownerId, groupId, role: "OWNER", addedBy: ownerId },
        { userId: targetId, groupId, role: "MEMBER", addedBy: ownerId },
      ])
      .execute()

    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "MEMBER" },
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_MEMBER_EXISTS")
  })

  test("returns FORBIDDEN for a USER who is not an owner of the group", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services)
    const { userId: ownerId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "MEMBER" },
    })

    expect(res.status).toBe(403)
  })

  test("returns GROUP_NOT_FOUND for an unknown group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const { userId: targetId } = await signInAs(services)
    const res = await api(app, `/groups/${randomUUID()}/members`, {
      method: "POST",
      headers,
      json: { userId: targetId, role: "MEMBER" },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      json: { userId: randomUUID(), role: "MEMBER" },
    })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for a missing role", async ({ app, services }) => {
    const { headers, userId: ownerId } = await signInAs(services, { role: "ADMIN" })
    const groupId = await seedGroup(services, ownerId)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "POST",
      headers,
      json: { userId: randomUUID() },
    })

    expect(res.status).toBe(422)
  })
})
