import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"
import { failure, reviewer } from "./helpers"

type Vote = { helpfulCount: number; viewerVoted: boolean }

describe("PUT and DELETE /reviews/:id/vote", () => {
  test("marks a review as helpful once, and takes it back", async ({ app, services }) => {
    const { review } = await reviewer(app, services)
    const { headers } = await signInAs(services)
    const vote = (method: "PUT" | "DELETE") =>
      api<Vote>(app, `/reviews/${review.id}/vote`, { method, headers })

    expect((await vote("PUT")).body).toMatchObject({ data: { helpfulCount: 1, viewerVoted: true } })
    expect((await vote("PUT")).body).toMatchObject({ data: { helpfulCount: 1 } })
    expect((await vote("DELETE")).body).toMatchObject({
      data: { helpfulCount: 0, viewerVoted: false },
    })
    expect((await vote("DELETE")).body).toMatchObject({ data: { helpfulCount: 0 } })
  })

  test("counts twenty parallel votes exactly", async ({ app, services }) => {
    const { review } = await reviewer(app, services)
    const voters = await Promise.all(Array.from({ length: 20 }, () => signInAs(services)))

    await Promise.all(
      voters.map(({ headers }) =>
        api(app, `/reviews/${review.id}/vote`, { method: "PUT", headers }),
      ),
    )

    const row = await services.db
      .selectFrom("mediaReviews")
      .select("helpfulCount")
      .where("id", "=", review.id)
      .executeTakeFirstOrThrow()

    expect(row.helpfulCount).toBe(20)
  })

  test("refuses a vote on your own review or a deleted one", async ({ app, services }) => {
    const author = await reviewer(app, services)

    expect(
      failure(
        await api(app, `/reviews/${author.review.id}/vote`, {
          method: "PUT",
          headers: author.headers,
        }),
      ),
    ).toEqual({ status: 403, code: "REVIEW_SELF_VOTE" })

    await api(app, `/medias/${author.review.mediaId}/review`, {
      method: "DELETE",
      headers: author.headers,
    })

    const { headers } = await signInAs(services)

    expect(
      failure(await api(app, `/reviews/${author.review.id}/vote`, { method: "PUT", headers })),
    ).toEqual({ status: 404, code: "REVIEW_NOT_FOUND" })
  })
})
