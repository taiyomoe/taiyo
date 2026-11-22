import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { failure, type Review, reviewer } from "./helpers"

type Page = { data: Review[]; meta: { nextCursor: string | null; total: number | null } }

const list = async (
  app: Parameters<typeof api>[0],
  path: string,
  headers: Record<string, string> = {},
) => {
  const res = await api<Review[]>(app, path, { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  const { meta } = res.body

  return {
    data: res.body.data,
    meta: {
      nextCursor: typeof meta?.nextCursor === "string" ? meta.nextCursor : null,
      total: typeof meta?.total === "number" ? meta.total : null,
    },
  } satisfies Page
}
const readAll = async (app: Parameters<typeof api>[0], path: string) => {
  const ids: string[] = []
  let cursor: string | null = null

  do {
    const separator = path.includes("?") ? "&" : "?"
    const page: Page = await list(
      app,
      `${path}${separator}limit=2${cursor === null ? "" : `&cursor=${cursor}`}`,
    )

    ids.push(...page.data.map((review) => review.id))
    cursor = page.meta.nextCursor
  } while (cursor !== null)

  return ids
}

describe("GET /medias/:id/reviews", () => {
  test("orders reviews by each sort, the same across pages", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const scores = [6, 9, 3, 9, 1]
    const writers: Array<Awaited<ReturnType<typeof reviewer>>> = []

    for (const score of scores) {
      writers.push(await reviewer(app, services, { score, mediaId }))
    }

    const byId = (index: number) => writers[index]?.review.id

    for (const [index, writer] of writers.entries()) {
      await services.db
        .updateTable("mediaReviews")
        .set({ createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)) })
        .where("id", "=", writer.review.id)
        .execute()
    }

    const voter = await signInAs(services)

    await api(app, `/reviews/${byId(2)}/vote`, { method: "PUT", headers: voter.headers })

    expect(await readAll(app, `/medias/${mediaId}/reviews?sort=newest`)).toEqual(
      [4, 3, 2, 1, 0].map(byId),
    )
    expect(await readAll(app, `/medias/${mediaId}/reviews?sort=highest`)).toEqual(
      [3, 1, 0, 2, 4].map(byId),
    )
    expect(await readAll(app, `/medias/${mediaId}/reviews?sort=lowest`)).toEqual(
      [4, 2, 0, 3, 1].map(byId),
    )
    expect(await readAll(app, `/medias/${mediaId}/reviews`)).toEqual([2, 4, 3, 1, 0].map(byId))
    expect((await list(app, `/medias/${mediaId}/reviews`)).meta.total).toBe(5)
  })

  test("leaves out deleted reviews and banned authors", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const kept = await reviewer(app, services, { mediaId })
    const deleted = await reviewer(app, services, { mediaId })
    const banned = await reviewer(app, services, { mediaId })

    await api(app, `/medias/${mediaId}/review`, { method: "DELETE", headers: deleted.headers })
    await services.db
      .updateTable("users")
      .set({ banned: true })
      .where("id", "=", banned.userId)
      .execute()

    const page = await list(app, `/medias/${mediaId}/reviews`)

    expect(page.data.map((review) => review.id)).toEqual([kept.review.id])
    expect(page.meta.total).toBe(1)
  })

  test("tells each viewer what they can do", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const author = await reviewer(app, services, { mediaId })
    const reader = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const viewerOf = async (headers: Record<string, string>) =>
      (await list(app, `/medias/${mediaId}/reviews`, headers)).data[0]?.viewer

    expect(await viewerOf({})).toBeNull()
    expect(await viewerOf(author.headers)).toEqual({
      voted: false,
      canEdit: true,
      canDelete: true,
      canReport: false,
    })
    expect(await viewerOf(reader.headers)).toEqual({
      voted: false,
      canEdit: false,
      canDelete: false,
      canReport: true,
    })
    expect(await viewerOf(moderator.headers)).toMatchObject({ canDelete: true, canReport: true })
  })

  test("hides the reviews of a media outside the content ratings", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId, "NSFW")

    expect(failure(await api(app, `/medias/${mediaId}/reviews`))).toEqual({
      status: 404,
      code: "MEDIA_NOT_FOUND",
    })
    expect((await api(app, `/medias/${mediaId}/reviews?contentRating=NSFW`)).status).toBe(200)
  })
})

describe("GET /users/:id/reviews", () => {
  test("lists a user's reviews newest first, without hidden medias", async ({ app, services }) => {
    const author = await signInAs(services)
    const [first, deleted, nsfw, last] = [
      await seedMedia(services, author.userId),
      await seedMedia(services, author.userId),
      await seedMedia(services, author.userId, "NSFW"),
      await seedMedia(services, author.userId),
    ]

    for (const mediaId of [first, deleted, nsfw, last]) {
      await services.db
        .updateTable("users")
        .set({ settings: { contentRating: ["NORMAL", "NSFW"] } })
        .where("id", "=", author.userId)
        .execute()
      await api(app, `/medias/${mediaId}/rating`, {
        method: "PUT",
        headers: author.headers,
        json: { score: 7 },
      })
      await api(app, `/medias/${mediaId}/review`, {
        method: "PUT",
        headers: author.headers,
        json: { body: "Worth the time. ".repeat(14) },
      })
    }

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", deleted)
      .execute()

    const page = await list(app, `/users/${author.userId}/reviews`)

    expect(page.data.map((review) => review.mediaId)).toEqual([last, first])
    expect(page.data[0]).toMatchObject({ media: { title: null, coverUrl: null } })
  })
})
