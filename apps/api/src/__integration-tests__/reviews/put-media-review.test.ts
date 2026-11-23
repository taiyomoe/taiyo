import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { BODY, failure, rate, SEEDED_MEDIA_ID, writeReview } from "./helpers"

describe("PUT /medias/:id/review", () => {
  test("writes a review with the author's score", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await rate(app, headers, 9)

    const res = await writeReview(app, headers, { containsSpoilers: true })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toMatchObject({
      mediaId: SEEDED_MEDIA_ID,
      body: BODY,
      containsSpoilers: true,
      helpfulCount: 0,
      score: 9,
      editedAt: null,
      author: { id: userId },
      viewer: { voted: false, canEdit: true, canDelete: true, canReport: false },
    })
  })

  test("needs a score first", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    expect(failure(await writeReview(app, headers))).toEqual({
      status: 409,
      code: "REVIEW_RATING_REQUIRED",
    })
  })

  test("replaces the review and marks it edited", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await rate(app, headers, 6)
    await writeReview(app, headers)

    const unchanged = await writeReview(app, headers)
    const res = await writeReview(app, headers, { body: `${BODY} Edited.` })

    if (!unchanged.body.success || !res.body.success) {
      throw new Error("Expected success")
    }

    expect(unchanged.body.data.editedAt).toBeNull()
    expect(res.body.data.body).toBe(`${BODY} Edited.`)
    expect(res.body.data.editedAt).not.toBeNull()
    expect(
      await services.db
        .selectFrom("mediaReviews")
        .select("id")
        .where("userId", "=", userId)
        .execute(),
    ).toHaveLength(1)
  })

  test("keeps plain text as typed and tidies whitespace", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const markup = `<script>alert(1)</script> <img src=x onerror=alert(1)> **bold** ${BODY}`

    await rate(app, headers, 7)

    const res = await writeReview(app, headers, {
      body: `  ${markup}  \r\n\r\n\r\n\r\nمراجعة رائعة 🎉\u0007 \n`,
    })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.body).toBe(`${markup}\n\nمراجعة رائعة 🎉`)
  })

  test.for([
    { name: "too short", body: "x".repeat(199) },
    { name: "padded with zero-width spaces", body: `${"x".repeat(150)}${"​".repeat(60)}` },
    { name: "only whitespace", body: " \n".repeat(300) },
    { name: "too long", body: "x".repeat(10_001) },
    { name: "too long in emoji", body: "🎉".repeat(10_001) },
    { name: "not a string", body: 42 },
  ])("refuses a body that is $name", async ({ body }, { app, services }) => {
    const { headers } = await signInAs(services)

    await rate(app, headers, 7)

    expect(failure(await writeReview(app, headers, { body }))).toEqual({
      status: 422,
      code: "VALIDATION_ERROR",
    })
  })

  test("counts an emoji as one character", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    await rate(app, headers, 7)

    expect((await writeReview(app, headers, { body: "🎉".repeat(10_000) })).status).toBe(200)
  })

  test("records the review in the audit log", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await rate(app, headers, 7)
    await writeReview(app, headers)

    const log = (await findAuditLogs(services, "review.SAVE")).find(
      (entry) => entry.actorId === userId,
    )

    expect(log?.targetId).toBe(SEEDED_MEDIA_ID)
  })

  test("hides a media outside your content ratings, and refuses a locked one", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)
    const nsfw = await seedMedia(services, userId, "NSFW")
    const locked = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ flag: "LOCKED" })
      .where("id", "=", locked)
      .execute()

    expect(failure(await writeReview(app, headers, {}, nsfw))).toEqual({
      status: 404,
      code: "MEDIA_NOT_FOUND",
    })
    expect(failure(await writeReview(app, headers, {}, locked))).toEqual({
      status: 451,
      code: "MEDIA_LOCKED",
    })
  })

  test("refuses signed-out and banned users", async ({ app, services }) => {
    const banned = await signInAs(services, { banned: true })

    expect((await writeReview(app, {})).status).toBe(401)
    expect((await writeReview(app, banned.headers)).status).toBe(403)
  })

  test("limits how often you write", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    await rate(app, headers, 7)

    for (let index = 0; index < 10; index++) {
      await writeReview(app, headers, { body: `${BODY} ${index}` })
    }

    expect((await writeReview(app, headers)).status).toBe(429)
  })
})

describe("DELETE /medias/:id/review", () => {
  test("deletes your review and keeps your score", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await rate(app, headers, 7)
    await writeReview(app, headers)

    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/review`, { method: "DELETE", headers })

    expect(res.status).toBe(200)
    expect(
      await services.db
        .selectFrom("mediaRatings")
        .select("score")
        .where("userId", "=", userId)
        .executeTakeFirst(),
    ).toEqual({ score: 7 })
    expect(
      failure(await api(app, `/medias/${SEEDED_MEDIA_ID}/review`, { method: "DELETE", headers })),
    ).toEqual({ status: 404, code: "REVIEW_NOT_FOUND" })
    expect((await writeReview(app, headers)).status).toBe(200)
  })
})

describe("GET /medias/:id/review", () => {
  test("returns your review, or null", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const empty = await api(app, `/medias/${SEEDED_MEDIA_ID}/review`, { headers })

    await rate(app, headers, 4)
    await writeReview(app, headers)

    const mine = await api<{ score: number } | null>(app, `/medias/${SEEDED_MEDIA_ID}/review`, {
      headers,
    })

    expect(empty.body).toMatchObject({ success: true, data: null })
    expect(mine.body).toMatchObject({ success: true, data: { score: 4 } })
    expect((await api(app, `/medias/${SEEDED_MEDIA_ID}/review`)).status).toBe(401)
  })
})

describe("DELETE /medias/:id/rating with a review", () => {
  test("keeps the score of a reviewed media unless the review goes too", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)

    await rate(app, headers, 8)
    await writeReview(app, headers)

    expect(
      failure(await api(app, `/medias/${SEEDED_MEDIA_ID}/rating`, { method: "DELETE", headers })),
    ).toEqual({ status: 409, code: "RATING_HAS_REVIEW" })

    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/rating?withReview=true`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)
    expect(
      await services.db
        .selectFrom("mediaReviews")
        .select("id")
        .where("userId", "=", userId)
        .where("deletedAt", "is", null)
        .execute(),
    ).toEqual([])
  })

  test("never leaves a review without its score when both race", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await rate(app, headers, 8)
    await Promise.all([
      writeReview(app, headers),
      api(app, `/medias/${SEEDED_MEDIA_ID}/rating`, { method: "DELETE", headers }),
    ])

    const [review, rating] = await Promise.all([
      services.db
        .selectFrom("mediaReviews")
        .select("id")
        .where("userId", "=", userId)
        .where("deletedAt", "is", null)
        .executeTakeFirst(),
      services.db
        .selectFrom("mediaRatings")
        .select("score")
        .where("userId", "=", userId)
        .executeTakeFirst(),
    ])

    expect(review === undefined || rating !== undefined).toBe(true)
  })
})
