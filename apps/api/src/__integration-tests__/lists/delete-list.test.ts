import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

describe("DELETE /lists/:id", () => {
  test("owner soft-deletes the list", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Bye" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, { method: "DELETE", headers })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userLists")
      .select(["deletedAt"])
      .where("id", "=", list.id)
      .executeTakeFirstOrThrow()

    expect(row.deletedAt).not.toBeNull()

    const getRes = await api(app, `/lists/${list.id}`, { headers })

    expect(getRes.status).toBe(404)
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
      method: "DELETE",
      headers: otherHeaders,
    })

    expect(res.status).toBe(403)
  })
})
