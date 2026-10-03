import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

describe("GET /users/me/lists", () => {
  test("returns the user's lists", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list1 = await services.db
      .insertInto("userLists")
      .values({ userId, name: "A" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const list2 = await services.db
      .insertInto("userLists")
      .values({ userId, name: "B" })
      .returning("id")
      .executeTakeFirstOrThrow()

    await services.db
      .insertInto("userListItems")
      .values({ listId: list1.id, mediaId: SEEDED_MEDIA_ID, position: 0 })
      .execute()

    const res = await api<{ id: string; itemCount: number }[]>(app, `/users/me/lists`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(2)

    const list1Row = res.body.data.find((l) => l.id === list1.id)
    const list2Row = res.body.data.find((l) => l.id === list2.id)

    expect(list1Row?.itemCount).toBe(1)
    expect(list2Row?.itemCount).toBe(0)
  })

  test("excludes soft-deleted lists", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db.insertInto("userLists").values({ userId, name: "Live" }).execute()
    await services.db
      .insertInto("userLists")
      .values({ userId, name: "Gone", deletedAt: new Date() })
      .execute()

    const res = await api<unknown[]>(app, `/users/me/lists`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(1)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/lists`)

    expect(res.status).toBe(401)
  })
})
