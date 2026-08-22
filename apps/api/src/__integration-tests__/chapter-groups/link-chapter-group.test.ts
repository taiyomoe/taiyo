import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"
// scansPROJECT — already linked to this chapter
const SEEDED_LINKED_GROUP_ID = "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1"

describe("POST /chapters/:id/groups", () => {
  test("links a fresh group to a chapter", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const groupId = randomUUID()

    await services.db
      .insertInto("groups")
      .values({ id: groupId, name: `Test Group ${groupId}`, creatorId: userId })
      .execute()

    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups`, {
      method: "POST",
      headers,
      json: { groupId },
    })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("chapterGroups")
      .selectAll()
      .where("chapterId", "=", SEEDED_CHAPTER_ID)
      .where("groupId", "=", groupId)
      .executeTakeFirst()

    expect(row).toBeDefined()
  })

  test("returns CHAPTER_GROUP_EXISTS for an already-linked group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups`, {
      method: "POST",
      headers,
      json: { groupId: SEEDED_LINKED_GROUP_ID },
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_GROUP_EXISTS")
  })

  test("returns GROUP_NOT_FOUND for a missing group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups`, {
      method: "POST",
      headers,
      json: { groupId: randomUUID() },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })

  test("returns CHAPTER_NOT_FOUND for a missing chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/chapters/00000000-0000-0000-0000-000000000000/groups`, {
      method: "POST",
      headers,
      json: { groupId: SEEDED_LINKED_GROUP_ID },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups`, {
      method: "POST",
      json: { groupId: SEEDED_LINKED_GROUP_ID },
    })

    expect(res.status).toBe(401)
  })

  test("a USER who is a member of a linked group can add another group", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("groupMemberships")
      .values({
        userId,
        groupId: SEEDED_LINKED_GROUP_ID,
        role: "MEMBER",
        addedBy: userId,
      })
      .execute()

    const newGroupId = randomUUID()

    await services.db
      .insertInto("groups")
      .values({ id: newGroupId, name: `Co-Group ${newGroupId}`, creatorId: userId })
      .execute()

    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups`, {
      method: "POST",
      headers,
      json: { groupId: newGroupId },
    })

    expect(res.status).toBe(201)
  })

  test("a USER who is not a member of any linked group is FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups`, {
      method: "POST",
      headers,
      json: { groupId: randomUUID() },
    })

    expect(res.status).toBe(403)
  })
})
