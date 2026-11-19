import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const setup = async (services: Services) => {
  const submitter = await signInAs(services)
  const mediaId = await seedMedia(services, submitter.userId)

  return {
    submitter,
    seed: (number: number, overrides: { status?: "PENDING" | "PUBLISHED" }) =>
      seedChapter(services, {
        mediaId,
        uploaderId: submitter.userId,
        number,
        status: "PENDING",
        pages: [{ id: randomUUID() }],
        ...overrides,
      }),
  }
}

describe("POST /chapters/withdraw", () => {
  test("requires a session", async ({ app }) => {
    const res = await api(app, "/chapters/withdraw", {
      method: "POST",
      json: { chapterIds: [randomUUID()] },
    })

    expect(res.status).toBe(401)
  })

  test("refuses banned users", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, "/chapters/withdraw", {
      method: "POST",
      headers,
      json: { chapterIds: [randomUUID()] },
    })

    expect(res.status).toBe(403)
  })

  test("validates the chapter IDs", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/chapters/withdraw", {
      method: "POST",
      headers,
      json: { chapterIds: [] },
    })

    expect(res.status).toBe(422)
  })

  test("withdraws your pending chapters and reports the rest", async ({ app, services }) => {
    const { submitter, seed } = await setup(services)
    const reviewer = await signInAs(services, { role: "UPLOADER" })
    const first = await seed(1, {})
    const second = await seed(2, {})
    const published = await seed(3, { status: "PUBLISHED" })
    const missing = randomUUID()
    const res = await api(app, "/chapters/withdraw", {
      method: "POST",
      headers: submitter.headers,
      json: { chapterIds: [first, second, published, missing] },
    })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      data: {
        done: [first, second],
        skipped: [
          { id: missing, reason: "NOT_FOUND" },
          { id: published, reason: "NOT_PENDING" },
        ],
      },
    })

    const rows = await services.db
      .selectFrom("chapters")
      .select((eb) => [
        "id",
        "deleterId",
        "pages",
        eb("deletedAt", "is not", null).$castTo<boolean>().as("deleted"),
      ])
      .where("id", "in", [first, second, published])
      .execute()

    expect(rows).toEqual(
      expect.arrayContaining([
        { id: first, deleted: true, deleterId: submitter.userId, pages: null },
        { id: second, deleted: true, deleterId: submitter.userId, pages: null },
        expect.objectContaining({ id: published, deleted: false }),
      ]),
    )

    const other = await seed(4, {})
    const byReviewer = await api(app, "/chapters/withdraw", {
      method: "POST",
      headers: reviewer.headers,
      json: { chapterIds: [other] },
    })

    expect(byReviewer.body).toMatchObject({
      data: { done: [], skipped: [{ id: other, reason: "FORBIDDEN" }] },
    })
  })

  test("hides the submissions of other users", async ({ app, services }) => {
    const { seed } = await setup(services)
    const stranger = await signInAs(services)
    const chapter = await seed(1, {})
    const res = await api(app, "/chapters/withdraw", {
      method: "POST",
      headers: stranger.headers,
      json: { chapterIds: [chapter] },
    })
    const row = await services.db
      .selectFrom("chapters")
      .select("deletedAt")
      .where("id", "=", chapter)
      .executeTakeFirstOrThrow()

    expect(res.body).toMatchObject({
      data: { done: [], skipped: [{ id: chapter, reason: "NOT_FOUND" }] },
    })
    expect(row.deletedAt).toBeNull()
  })
})
