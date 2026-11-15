import { config } from "@taiyomoe/config"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia, seedStaff, seedTitle } from "../helpers/seed"
import { test } from "../setup"

type Suggestion = {
  id: string
  status: string
  fields: string[]
  conflicts: string[]
  acceptedFields: string[]
  changes: Record<string, unknown>
  base: Record<string, unknown>
  current: Record<string, unknown>
}

const setup = async (services: Services) => {
  const author = await signInAs(services)
  const reviewer = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, reviewer.userId)

  await seedTitle(services, {
    mediaId,
    creatorId: reviewer.userId,
    title: "Main",
    isMainTitle: true,
  })
  await services.db
    .updateTable("medias")
    .set({ synopsis: { en: "Old synopsis." } })
    .where("id", "=", mediaId)
    .execute()

  return { author, reviewer, mediaId }
}
const suggest = (
  app: Parameters<typeof api>[0],
  mediaId: string,
  headers: Record<string, string>,
  json: unknown,
) => api<{ id: string }>(app, `/medias/${mediaId}/suggestions`, { method: "POST", headers, json })
const getSuggestion = (
  app: Parameters<typeof api>[0],
  id: string,
  headers: Record<string, string>,
) => api<Suggestion>(app, `/media-suggestions/${id}`, { headers })
const idOf = (res: { body: { success: boolean; data?: { id: string } } }) => {
  if (!res.body.success || res.body.data === undefined) {
    throw new Error("Expected a created suggestion")
  }

  return res.body.data.id
}

describe("suggesting", () => {
  test("keeps only the fields that differ, with what they were", async ({ app, services }) => {
    const { author, mediaId } = await setup(services)
    const res = await suggest(app, mediaId, author.headers, {
      changes: {
        synopsis: { en: "New synopsis." },
        status: "RELEASING",
        tags: [{ key: "CRIME" }],
      },
      note: "From the publisher's site.",
    })
    const detail = await getSuggestion(app, idOf(res), author.headers)

    expect(res.status).toBe(201)
    expect(detail.body).toMatchObject({
      data: {
        status: "PENDING",
        fields: ["synopsis", "tags"],
        conflicts: [],
        changes: { synopsis: { en: "New synopsis." }, tags: [{ key: "CRIME", isSpoiler: false }] },
        base: { synopsis: { en: "Old synopsis." }, tags: [] },
        current: { synopsis: { en: "Old synopsis." }, tags: [] },
        note: "From the publisher's site.",
      },
    })
  })

  test("refuses a suggestion that changes nothing", async ({ app, services }) => {
    const { author, mediaId } = await setup(services)
    const res = await suggest(app, mediaId, author.headers, {
      changes: { synopsis: { en: "  Old synopsis.  " }, status: "RELEASING" },
    })

    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({ code: "MEDIA_SUGGESTION_EMPTY" })
  })

  test("allows one pending suggestion per media, which the author edits", async ({
    app,
    services,
  }) => {
    const { author, mediaId } = await setup(services)
    const first = await suggest(app, mediaId, author.headers, { changes: { type: "MANHWA" } })
    const second = await suggest(app, mediaId, author.headers, { changes: { type: "MANHUA" } })
    const edited = await api(app, `/media-suggestions/${idOf(first)}`, {
      method: "PATCH",
      headers: author.headers,
      json: { changes: { type: "MANHUA", source: "WEB_NOVEL" } },
    })
    const detail = await getSuggestion(app, idOf(first), author.headers)
    const edit = await api(app, `/medias/${mediaId}/edit`, { headers: author.headers })

    expect(second.status).toBe(409)
    expect(second.body).toMatchObject({
      code: "MEDIA_SUGGESTION_EXISTS",
      details: { suggestionId: idOf(first) },
    })
    expect(edited.status).toBe(200)
    expect(detail.body).toMatchObject({
      data: { fields: ["type", "source"], changes: { type: "MANHUA", source: "WEB_NOVEL" } },
    })
    expect(edit.body).toMatchObject({
      data: { suggestion: { id: idOf(first), changes: { type: "MANHUA", source: "WEB_NOVEL" } } },
    })
  })

  test("caps pending suggestions per user", async ({ app, services }) => {
    const { author, reviewer } = await setup(services)
    const mediaIds = await Promise.all(
      Array.from({ length: config.input.maxPendingSuggestions + 1 }, () =>
        seedMedia(services, reviewer.userId),
      ),
    )
    const [last, ...rest] = mediaIds

    await services.db
      .insertInto("mediaSuggestions")
      .values(
        rest.map((mediaId) => ({
          mediaId,
          authorId: author.userId,
          changes: { type: "MANHWA" as const },
          base: { type: "MANGA" as const },
        })),
      )
      .execute()

    const res = await suggest(app, last ?? "", author.headers, { changes: { type: "MANHWA" } })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ code: "MEDIA_SUGGESTION_LIMIT" })
  })

  test("is closed to signed-out and banned users", async ({ app, services }) => {
    const { mediaId } = await setup(services)
    const banned = await signInAs(services, { banned: true })
    const signedOut = await suggest(app, mediaId, {}, { changes: { type: "MANHWA" } })
    const bannedRes = await suggest(app, mediaId, banned.headers, { changes: { type: "MANHWA" } })

    expect([signedOut.status, bannedRes.status]).toEqual([401, 403])
  })

  test("only shows a suggestion to its author and reviewers", async ({ app, services }) => {
    const { author, mediaId } = await setup(services)
    const id = idOf(await suggest(app, mediaId, author.headers, { changes: { type: "MANHWA" } }))
    const statuses: Record<string, number> = {}

    for (const role of ["USER", "UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"] as const) {
      const { headers } = await signInAs(services, { role })

      statuses[role] = (await getSuggestion(app, id, headers)).status
    }

    expect(statuses).toEqual({
      USER: 404,
      UPLOADER_INTERN: 404,
      UPLOADER: 200,
      MODERATOR: 200,
      ADMIN: 200,
    })
  })

  test("only the author edits or withdraws, and only while pending", async ({ app, services }) => {
    const { author, reviewer, mediaId } = await setup(services)
    const id = idOf(await suggest(app, mediaId, author.headers, { changes: { type: "MANHWA" } }))
    const byReviewer = await api(app, `/media-suggestions/${id}/withdraw`, {
      method: "POST",
      headers: reviewer.headers,
    })
    const withdrawn = await api(app, `/media-suggestions/${id}/withdraw`, {
      method: "POST",
      headers: author.headers,
    })
    const again = await api(app, `/media-suggestions/${id}`, {
      method: "PATCH",
      headers: author.headers,
      json: { changes: { type: "MANHUA" } },
    })

    expect(byReviewer.status).toBe(403)
    expect(withdrawn.status).toBe(201)
    expect(again.status).toBe(409)
    expect(again.body).toMatchObject({ code: "MEDIA_SUGGESTION_NOT_PENDING" })
  })
})

describe("reviewing", () => {
  test("lists pending suggestions oldest first and flags fields changed since", async ({
    app,
    services,
  }) => {
    const { author, reviewer, mediaId } = await setup(services)
    const other = await signInAs(services)
    const first = idOf(
      await suggest(app, mediaId, author.headers, {
        changes: { synopsis: { en: "Mine." }, type: "MANHWA" },
      }),
    )
    const second = idOf(await suggest(app, mediaId, other.headers, { changes: { type: "MANHUA" } }))

    await api(app, `/medias/${mediaId}`, {
      method: "PATCH",
      headers: reviewer.headers,
      json: { synopsis: { en: "Edited by staff." } },
    })

    const queue = await api<Suggestion[]>(app, "/media-suggestions", {
      headers: reviewer.headers,
    })

    expect(queue.body).toMatchObject({
      data: [
        { id: first, fields: ["synopsis", "type"], conflicts: ["synopsis"] },
        { id: second, fields: ["type"], conflicts: [] },
      ],
      meta: { total: 2 },
    })
  })

  test("is limited to uploaders, moderators and admins", async ({ app, services }) => {
    const statuses: Record<string, number> = {}

    for (const role of ["USER", "UPLOADER_INTERN", "UPLOADER", "MODERATOR", "ADMIN"] as const) {
      const { headers } = await signInAs(services, { role })

      statuses[role] = (await api(app, "/media-suggestions", { headers })).status
    }

    expect(statuses).toEqual({
      USER: 403,
      UPLOADER_INTERN: 403,
      UPLOADER: 200,
      MODERATOR: 200,
      ADMIN: 200,
    })
  })

  test("applies the accepted fields with the reviewer's adjustments", async ({ app, services }) => {
    const { author, mediaId } = await setup(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const staffId = await seedStaff(services, moderator.userId, "Writer")
    const id = idOf(
      await suggest(app, mediaId, author.headers, {
        changes: {
          type: "MANHWA",
          synopsis: { en: "Typo-ed synopsis." },
          titles: [
            { title: "Main", language: "en", isMainTitle: true },
            { title: "Alt", language: "en" },
          ],
          staffs: [{ staffId, role: "AUTHOR" }],
        },
      }),
    )
    const res = await api(app, `/media-suggestions/${id}/accept`, {
      method: "POST",
      headers: moderator.headers,
      json: {
        changes: {
          synopsis: { en: "Fixed synopsis." },
          titles: [
            { title: "Main", language: "en", isMainTitle: true },
            { title: "Alt", language: "en" },
          ],
          staffs: [{ staffId, role: "AUTHOR" }],
        },
        note: "Thanks!",
      },
    })
    const media = await services.db
      .selectFrom("medias")
      .select(["type", "synopsis"])
      .where("id", "=", mediaId)
      .executeTakeFirstOrThrow()
    const alt = await services.db
      .selectFrom("titles")
      .select("creatorId")
      .where("mediaId", "=", mediaId)
      .where("title", "=", "Alt")
      .executeTakeFirstOrThrow()
    const detail = await getSuggestion(app, id, author.headers)

    expect(res.status).toBe(201)
    expect(media).toEqual({ type: "MANGA", synopsis: { en: "Fixed synopsis." } })
    expect(alt.creatorId).toBe(author.userId)
    expect(detail.body).toMatchObject({
      data: {
        status: "ACCEPTED",
        acceptedFields: ["titles", "synopsis", "staffs"],
        conflicts: [],
        current: { staffs: [{ staffId, role: "AUTHOR", name: "Writer" }] },
      },
    })
  })

  test("only accepts fields the suggestion changes", async ({ app, services }) => {
    const { author, reviewer, mediaId } = await setup(services)
    const id = idOf(await suggest(app, mediaId, author.headers, { changes: { type: "MANHWA" } }))
    const res = await api(app, `/media-suggestions/${id}/accept`, {
      method: "POST",
      headers: reviewer.headers,
      json: { changes: { status: "FINISHED" } },
    })
    const empty = await api(app, `/media-suggestions/${id}/accept`, {
      method: "POST",
      headers: reviewer.headers,
      json: { changes: {} },
    })

    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({ code: "MEDIA_SUGGESTION_UNKNOWN_FIELDS" })
    expect(empty.status).toBe(422)
  })

  test("rejects with a note, once", async ({ app, services }) => {
    const { author, reviewer, mediaId } = await setup(services)
    const id = idOf(await suggest(app, mediaId, author.headers, { changes: { type: "MANHWA" } }))
    const noNote = await api(app, `/media-suggestions/${id}/reject`, {
      method: "POST",
      headers: reviewer.headers,
      json: { note: " " },
    })
    const rejected = await api(app, `/media-suggestions/${id}/reject`, {
      method: "POST",
      headers: reviewer.headers,
      json: { note: "Not a manhwa." },
    })
    const twice = await api(app, `/media-suggestions/${id}/accept`, {
      method: "POST",
      headers: reviewer.headers,
      json: { changes: { type: "MANHWA" } },
    })
    const mine = await api<Suggestion[]>(app, "/users/me/media-suggestions", {
      headers: author.headers,
    })

    expect(noNote.status).toBe(422)
    expect(rejected.status).toBe(201)
    expect(twice.status).toBe(409)
    expect(mine.body).toMatchObject({
      data: [{ id, status: "REJECTED", reviewerNote: "Not a manhwa." }],
    })
  })

  test("lets the author suggest again once reviewed", async ({ app, services }) => {
    const { author, reviewer, mediaId } = await setup(services)
    const id = idOf(await suggest(app, mediaId, author.headers, { changes: { type: "MANHWA" } }))

    await api(app, `/media-suggestions/${id}/reject`, {
      method: "POST",
      headers: reviewer.headers,
      json: { note: "No." },
    })

    const again = await suggest(app, mediaId, author.headers, { changes: { type: "MANHUA" } })

    expect(again.status).toBe(201)
  })
})
