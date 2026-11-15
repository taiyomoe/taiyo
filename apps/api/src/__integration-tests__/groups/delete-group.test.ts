import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_GROUP_ID = "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1"

describe("DELETE /groups/:id", () => {
  test("soft-deletes a group", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("groups")
      .select(["deletedAt", "deleterId"])
      .where("id", "=", SEEDED_GROUP_ID)
      .executeTakeFirst()

    expect(row?.deletedAt).not.toBeNull()
    expect(row?.deleterId).toBe(userId)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, { method: "DELETE" })

    expect(res.status).toBe(401)
  })

  test("returns GROUP_NOT_FOUND for an unknown group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/00000000-0000-0000-0000-000000000000`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)
  })

  test("only admins can delete a group, not even its owner", async ({ app, services }) => {
    const { headers: ownerHeaders, userId } = await signInAs(services)

    await services.db
      .insertInto("groupMemberships")
      .values({
        userId,
        groupId: SEEDED_GROUP_ID,
        role: "OWNER",
        addedBy: userId,
      })
      .execute()

    const staffHeaders = await Promise.all(
      (["UPLOADER_INTERN", "UPLOADER", "MODERATOR"] as const).map(
        async (role) => (await signInAs(services, { role })).headers,
      ),
    )

    for (const headers of [ownerHeaders, ...staffHeaders]) {
      const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, { method: "DELETE", headers })

      expect(res.status).toBe(403)
    }

    const row = await services.db
      .selectFrom("groups")
      .select("deletedAt")
      .where("id", "=", SEEDED_GROUP_ID)
      .executeTakeFirstOrThrow()

    expect(row.deletedAt).toBeNull()
  })

  test("a USER who is not a member is FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(403)
  })
})
