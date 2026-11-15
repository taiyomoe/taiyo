import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID_A = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MEDIA_ID_B = "7a99da64-56e7-4bf6-8159-8db0d3b4f231"

type Summary = {
  id: string
  itemCount: number
  upvoteCount: number
  viewerVoted: boolean
  owner: { id: string }
}

describe("GET /lists", () => {
  test("ranks PUBLIC, non-empty lists by upvotes", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const { headers: voterHeaders } = await signInAs(services)
    const [low, high, hidden, empty] = await Promise.all(
      [
        { name: "Low", visibility: "PUBLIC" as const, upvoteCount: 1 },
        { name: "High", visibility: "PUBLIC" as const, upvoteCount: 5 },
        { name: "Hidden", visibility: "PRIVATE" as const, upvoteCount: 9 },
        { name: "Empty", visibility: "PUBLIC" as const, upvoteCount: 9 },
      ].map((values) =>
        services.db
          .insertInto("userLists")
          .values({ userId, ...values })
          .returning("id")
          .executeTakeFirstOrThrow(),
      ),
    )

    await services.db
      .insertInto("userListItems")
      .values(
        [low, high, hidden].flatMap((list) =>
          list === undefined
            ? []
            : [
                { listId: list.id, mediaId: SEEDED_MEDIA_ID_A, position: 0 },
                { listId: list.id, mediaId: SEEDED_MEDIA_ID_B, position: 1 },
              ],
        ),
      )
      .execute()

    const res = await api<Summary[]>(app, "/lists?perPage=100", { headers: voterHeaders })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const ids = res.body.data.map((list) => list.id)

    expect(ids.indexOf(high?.id ?? "")).toBeLessThan(ids.indexOf(low?.id ?? ""))
    expect(ids).not.toContain(hidden?.id)
    expect(ids).not.toContain(empty?.id)
    expect(res.body.data.find((list) => list.id === high?.id)).toMatchObject({
      itemCount: 2,
      upvoteCount: 5,
      viewerVoted: false,
      owner: { id: userId },
    })
  })
})

describe("GET /users/:id/lists", () => {
  test("shows only PUBLIC lists to other users", async ({ app, services }) => {
    const { headers: ownerHeaders, userId } = await signInAs(services)
    const { headers: otherHeaders } = await signInAs(services)

    await services.db
      .insertInto("userLists")
      .values([
        { userId, name: "Open", visibility: "PUBLIC" },
        { userId, name: "Secret", visibility: "PRIVATE" },
      ])
      .execute()

    const asOther = await api<Summary[]>(app, `/users/${userId}/lists`, { headers: otherHeaders })
    const asOwner = await api<Summary[]>(app, `/users/${userId}/lists`, { headers: ownerHeaders })
    const anonymous = await api<Summary[]>(app, `/users/${userId}/lists`)

    expect(asOther.body).toMatchObject({ data: [{ visibility: "PUBLIC" }], meta: { total: 1 } })
    expect(anonymous.body).toMatchObject({ meta: { total: 1 } })
    expect(asOwner.body).toMatchObject({ meta: { total: 2 } })
  })
})
