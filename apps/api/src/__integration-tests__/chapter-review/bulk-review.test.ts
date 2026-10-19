import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const setup = async (services: Services) => {
  const reviewer = await signInAs(services, { role: "UPLOADER" })
  const submitter = await signInAs(services)
  const mediaId = await seedMedia(services, reviewer.userId)
  const seed = (
    number: number,
    overrides: Parameters<typeof seedChapter>[1] extends infer T ? Partial<T> : never,
  ) =>
    seedChapter(services, {
      mediaId,
      uploaderId: submitter.userId,
      number,
      status: "PENDING",
      pages: [{ id: randomUUID() }],
      ...overrides,
    })

  return { reviewer, submitter, mediaId, seed }
}
const statusesOf = ({ db }: Services, ids: string[]) =>
  db
    .selectFrom("chapters")
    .select(["id", "status", "reviewerId", "rejectionReason", "pages"])
    .where("id", "in", ids)
    .execute()

describe("bulk review", () => {
  test("approves every reviewable chapter and reports the rest", async ({ app, services }) => {
    const { reviewer, seed } = await setup(services)
    const first = await seed(1, {})
    const second = await seed(2, {})
    const unprocessed = await seed(3, { pages: null })
    const published = await seed(4, { status: "PUBLISHED" })
    const missing = randomUUID()
    const res = await api(app, "/chapters/approve", {
      method: "POST",
      headers: reviewer.headers,
      json: { chapterIds: [first, second, unprocessed, published, missing] },
    })
    const rows = await statusesOf(services, [first, second, unprocessed])

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      data: {
        approved: [first, second],
        skipped: [
          { id: unprocessed, reason: "PAGES_MISSING" },
          { id: published, reason: "NOT_PENDING" },
          { id: missing, reason: "NOT_FOUND" },
        ],
      },
    })
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: first, status: "PUBLISHED", reviewerId: reviewer.userId }),
        expect.objectContaining({ id: second, status: "PUBLISHED" }),
        expect.objectContaining({ id: unprocessed, status: "PENDING" }),
      ]),
    )
  })

  test("rejects with one reason and drops the pages", async ({ app, services }) => {
    const { reviewer, seed } = await setup(services)
    const first = await seed(1, {})
    const second = await seed(2, {})
    const noReason = await api(app, "/chapters/reject", {
      method: "POST",
      headers: reviewer.headers,
      json: { chapterIds: [first], reason: " " },
    })
    const res = await api(app, "/chapters/reject", {
      method: "POST",
      headers: reviewer.headers,
      json: { chapterIds: [first, second], reason: "Low quality scans." },
    })
    const rows = await statusesOf(services, [first, second])

    expect(noReason.status).toBe(422)
    expect(res.body).toMatchObject({ data: { rejected: [first, second], skipped: [] } })
    expect(
      rows.map(({ status, rejectionReason, pages }) => ({ status, rejectionReason, pages })),
    ).toEqual([
      { status: "REJECTED", rejectionReason: "Low quality scans.", pages: null },
      { status: "REJECTED", rejectionReason: "Low quality scans.", pages: null },
    ])
  })

  test("is limited to reviewers", async ({ app, services }) => {
    const { submitter, seed } = await setup(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const chapter = await seed(1, {})

    for (const headers of [submitter.headers, moderator.headers]) {
      const res = await api(app, "/chapters/approve", {
        method: "POST",
        headers,
        json: { chapterIds: [chapter] },
      })

      expect(res.status).toBe(403)
    }
  })
})

describe("GET /medias/:id/chapter-numbers", () => {
  test("lists published numbers in one language", async ({ app, services }) => {
    const { reviewer, mediaId, seed } = await setup(services)

    await seed(2, { status: "PUBLISHED", uploaderId: reviewer.userId })
    await seed(1, { status: "PUBLISHED", uploaderId: reviewer.userId })
    await seed(1.5, { status: "PUBLISHED", uploaderId: reviewer.userId, language: "fr" })
    await seed(3, {})

    const res = await api(app, `/medias/${mediaId}/chapter-numbers?language=en`)

    expect(res.body).toMatchObject({ data: [1, 2] })
  })
})

describe("uploading chapters", () => {
  test("their uploader can withdraw them, nobody else", async ({ app, services }) => {
    const { reviewer, seed } = await setup(services)
    const chapter = await seed(1, { status: "UPLOADING", uploaderId: reviewer.userId, pages: null })
    const stranger = await signInAs(services)
    const byStranger = await api(app, `/chapters/${chapter}/withdraw`, {
      method: "POST",
      headers: stranger.headers,
    })
    const byUploader = await api(app, `/chapters/${chapter}/withdraw`, {
      method: "POST",
      headers: reviewer.headers,
    })

    expect(byStranger.status).toBe(404)
    expect(byUploader.status).toBe(201)
  })
})
