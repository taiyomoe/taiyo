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

  test("an owner and a member with EDIT_GROUP can update it", async ({ app, services }) => {
    const owner = await signInAs(services)
    const editor = await signInAs(services)

    await services.db
      .insertInto("groupMemberships")
      .values([
        { userId: owner.userId, groupId: SEEDED_GROUP_ID, role: "OWNER", addedBy: owner.userId },
        {
          userId: editor.userId,
          groupId: SEEDED_GROUP_ID,
          role: "MEMBER",
          permissions: ["EDIT_GROUP"],
          addedBy: owner.userId,
        },
      ])
      .execute()

    for (const { headers } of [owner, editor]) {
      const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
        method: "PATCH",
        headers,
        json: { description: "Updated by the group" },
      })

      expect(res.status).toBe(200)
    }
  })

  test("a member without EDIT_GROUP is FORBIDDEN", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("groupMemberships")
      .values({
        userId,
        groupId: SEEDED_GROUP_ID,
        role: "MEMBER",
        permissions: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS", "DELETE_CHAPTERS", "MANAGE_MEMBERS"],
        addedBy: userId,
      })
      .execute()

    const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
      method: "PATCH",
      headers,
      json: { description: "x" },
    })

    expect(res.status).toBe(403)
  })

  test("uploaders and moderators can update any group, interns cannot", async ({
    app,
    services,
  }) => {
    for (const [role, status] of [
      ["UPLOADER", 200],
      ["MODERATOR", 200],
      ["UPLOADER_INTERN", 403],
    ] as const) {
      const { headers } = await signInAs(services, { role })
      const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, {
        method: "PATCH",
        headers,
        json: { description: `By ${role}` },
      })

      expect(res.status).toBe(status)
    }
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

describe("PATCH /groups/:id links", () => {
  test("only accepts http(s) links, Discord codes and emails", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const script = ["javascript", "alert(1)"].join(":")

    for (const json of [
      { website: script },
      { x: "data:text/html,hi" },
      { discord: script },
      { email: "not-an-email" },
      { youtube: "ftp://example.com" },
    ]) {
      const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, { method: "PATCH", headers, json })

      expect({ json, status: res.status }).toEqual({ json, status: 422 })
    }

    for (const json of [
      { website: "https://example.com" },
      { discord: "yWvfgM7" },
      { discord: "https://discord.gg/abc" },
      { email: "team@example.com" },
      { website: "" },
    ]) {
      const res = await api(app, `/groups/${SEEDED_GROUP_ID}`, { method: "PATCH", headers, json })

      expect({ json, status: res.status }).toEqual({ json, status: 200 })
    }

    const row = await services.db
      .selectFrom("groups")
      .select("website")
      .where("id", "=", SEEDED_GROUP_ID)
      .executeTakeFirstOrThrow()

    expect(row.website).toBeNull()
  })
})
