import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_GROUP_ID = "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1"

describe("PATCH /groups/:id", () => {
  test("updates a group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      headers,
      json: { description: "Updated description" },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("groups")
      .select(["description"])
      .where("id", "=", SEEDED_GROUP_ID)
      .executeTakeFirst()

    expect(row?.description).toBe("Updated description")
  })

  test("clears a nullable field with null", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    await services.db
      .updateTable("groups")
      .set({ website: "https://before.example.com" })
      .where("id", "=", SEEDED_GROUP_ID)
      .execute()

    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      headers,
      json: { website: null },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("groups")
      .select(["website"])
      .where("id", "=", SEEDED_GROUP_ID)
      .executeTakeFirst()

    expect(row?.website).toBeNull()
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      json: { description: "x" },
    })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR when body is empty", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      headers,
      json: {},
    })

    expect(res.status).toBe(422)
  })

  test("returns GROUP_NOT_FOUND for an unknown group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/00000000-0000-0000-0000-000000000000`, {
      method: "PATCH",
      headers,
      json: { description: "x" },
    })

    expect(res.status).toBe(404)
  })

  test("a USER who is a member of the group can update it", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("groupMemberships")
      .values({
        userId,
        groupId: SEEDED_GROUP_ID,
        role: "MEMBER",
        addedBy: userId,
      })
      .execute()

    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      headers,
      json: { description: "Updated by member" },
    })

    expect(res.status).toBe(200)
  })

  test("a USER who is not a member is FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      headers,
      json: { description: "x" },
    })

    expect(res.status).toBe(403)
  })
})
