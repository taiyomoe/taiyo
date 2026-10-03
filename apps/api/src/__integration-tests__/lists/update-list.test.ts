import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

describe("PATCH /lists/:id", () => {
  test("owner updates name + visibility", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Old", visibility: "PRIVATE" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, {
      method: "PATCH",
      headers,
      json: { name: "New", visibility: "PUBLIC" },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userLists")
      .select(["name", "visibility"])
      .where("id", "=", list.id)
      .executeTakeFirstOrThrow()

    expect(row.name).toBe("New")
    expect(row.visibility).toBe("PUBLIC")
  })

  test("non-owner gets FORBIDDEN", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { headers: otherHeaders } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId: ownerId, name: "Mine" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, {
      method: "PATCH",
      headers: otherHeaders,
      json: { name: "Theirs" },
    })

    expect(res.status).toBe(403)
  })

  test("returns LIST_NOT_FOUND for an unknown id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/lists/${randomUUID()}`, {
      method: "PATCH",
      headers,
      json: { name: "X" },
    })

    expect(res.status).toBe(404)
  })

  test("returns VALIDATION_ERROR for empty body", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "X" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, {
      method: "PATCH",
      headers,
      json: {},
    })

    expect(res.status).toBe(422)
  })
})
