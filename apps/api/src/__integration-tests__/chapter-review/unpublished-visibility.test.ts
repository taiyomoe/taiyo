import { sql } from "@taiyomoe/db"
import { drainSearchOutbox } from "@taiyomoe/search"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia } from "../helpers/seed"
import { waitForMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const setup = async (services: Services) => {
  const submitter = await signInAs(services)
  const admin = await signInAs(services, { role: "ADMIN" })
  const mediaId = await seedMedia(services, admin.userId)
  const groupId = await seedGroup(services, admin.userId, `G ${randomUUID()}`)
  const published = await seedChapter(services, {
    mediaId,
    uploaderId: admin.userId,
    number: 1,
    language: "en",
    groupIds: [groupId],
  })
  const pending = await seedChapter(services, {
    mediaId,
    uploaderId: submitter.userId,
    number: 2,
    language: "fr",
    volume: "9",
    groupIds: [groupId],
    status: "PENDING",
    pages: [{ id: randomUUID() }],
  })
  const rejected = await seedChapter(services, {
    mediaId,
    uploaderId: submitter.userId,
    number: 3,
    language: "de",
    groupIds: [groupId],
    status: "REJECTED",
  })
  const uploading = await seedChapter(services, {
    mediaId,
    uploaderId: submitter.userId,
    number: 4,
    language: "it",
    groupIds: [groupId],
    status: "UPLOADING",
  })

  return { submitter, admin, mediaId, groupId, published, pending, rejected, uploading }
}
const idsIn = (body: unknown) => {
  const found: string[] = []
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item)
      }
    } else if (typeof value === "object" && value !== null) {
      for (const [key, inner] of Object.entries(value)) {
        if (key === "id" && typeof inner === "string") {
          found.push(inner)
        }

        visit(inner)
      }
    }
  }

  visit(body)

  return found
}

describe("unpublished chapters", () => {
  test("never show up in public chapter lists", async ({ app, services }) => {
    const { submitter, mediaId, groupId, published, pending, rejected, uploading } =
      await setup(services)
    const viewers = [
      undefined,
      submitter.headers,
      (await signInAs(services, { role: "MODERATOR" })).headers,
      (await signInAs(services, { role: "UPLOADER" })).headers,
    ]
    const paths = [
      "/chapters/latest?perPage=100",
      `/chapters/latest?groupId=${groupId}`,
      `/chapters/latest?mediaId=${mediaId}`,
      "/chapters/latest/medias?perPage=100",
      `/medias/${mediaId}/chapters?perPage=100`,
      `/medias/${mediaId}/chapters?perPage=100&language=fr`,
    ]

    for (const headers of viewers) {
      for (const path of paths) {
        const res = await api(app, path, headers === undefined ? {} : { headers })

        expect(res.status).toBe(200)

        const ids = idsIn(res.body)

        expect({
          path,
          leaked: ids.filter((id) => id === pending || id === rejected || id === uploading),
        }).toEqual({
          path,
          leaked: [],
        })

        expect({ path, found: ids.includes(published) }).toEqual({
          path,
          found: !path.includes("language=fr"),
        })
      }
    }
  })

  test("are left out of chapter counts and facets", async ({ app, services }) => {
    const { mediaId } = await setup(services)
    const list = await api<unknown[]>(app, `/medias/${mediaId}/chapters`)
    const facets = await api<{
      total: number
      languages: Array<{ language: string }>
      volumes: Array<{ volume: string | null }>
    }>(app, `/medias/${mediaId}/chapters/facets`)

    expect(list.body).toMatchObject({ meta: { total: 1 } })

    if (!facets.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(facets.body)}`)
    }

    expect(facets.body.data.total).toBe(1)
    expect(facets.body.data.languages.map((row) => row.language)).toEqual(["en"])
    expect(facets.body.data.volumes.map((row) => row.volume)).toEqual([null])
  })

  test("are left out of the search index until published", async ({ services }) => {
    const { userId } = await signInAs(services)
    const chapterIds = await Promise.all(
      (
        [
          { number: 9999, language: "zu", status: "PENDING" },
          { number: 9998, language: "xh", status: "UPLOADING" },
        ] as const
      ).map((chapter) =>
        seedChapter(services, { mediaId: SEEDED_MEDIA_ID, uploaderId: userId, ...chapter }),
      ),
    )

    await drainSearchOutbox(services)

    const hidden = await waitForMediaDoc(services, SEEDED_MEDIA_ID, (doc) => doc !== null)

    expect(hidden?.chapterLanguages).not.toContain("zu")
    expect(hidden?.chapterLanguages).not.toContain("xh")

    await services.db
      .updateTable("chapters")
      .set({ status: "PUBLISHED" })
      .where("id", "in", chapterIds)
      .execute()
    await drainSearchOutbox(services)

    const shown = await waitForMediaDoc(
      services,
      SEEDED_MEDIA_ID,
      (doc) => doc?.chapterLanguages.includes("zu") === true,
    )

    expect(shown?.chapterLanguages).toEqual(expect.arrayContaining(["zu", "xh"]))
  }, 30_000)

  test("are left out of the feed and reading progress", async ({ app, services }) => {
    const { submitter, mediaId, pending, rejected, uploading } = await setup(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: submitter.userId, mediaId, status: "READING" })
      .execute()

    for (const path of ["/users/me/feed?perPage=100", `/users/me/progress/${mediaId}`]) {
      const res = await api(app, path, { headers: submitter.headers })
      const ids = idsIn(res.body)

      expect(res.status).toBe(200)
      expect(ids).not.toContain(pending)
      expect(ids).not.toContain(rejected)
      expect(ids).not.toContain(uploading)
    }
  })

  test("can only be read by their submitter and reviewers", async ({ app, services }) => {
    const { submitter, admin, pending, rejected, uploading } = await setup(services)
    const uploader = await signInAs(services, { role: "UPLOADER" })
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const intern = await signInAs(services, { role: "UPLOADER_INTERN" })
    const stranger = await signInAs(services)

    for (const chapterId of [pending, rejected, uploading]) {
      for (const path of [`/chapters/${chapterId}`, `/chapters/${chapterId}/groups`]) {
        for (const headers of [undefined, stranger.headers, moderator.headers, intern.headers]) {
          const res = await api(app, path, headers === undefined ? {} : { headers })

          expect({ path, status: res.status }).toEqual({ path, status: 404 })
        }

        for (const headers of [submitter.headers, uploader.headers, admin.headers]) {
          const res = await api(app, path, { headers })

          expect({ path, status: res.status }).toEqual({ path, status: 200 })
        }
      }
    }
  })

  test("cannot be opened or tracked in the reading history", async ({ app, services }) => {
    const { submitter, pending } = await setup(services)
    const open = await api(app, `/chapters/${pending}/open`, {
      method: "POST",
      headers: submitter.headers,
    })
    const track = await api(app, `/chapters/${pending}/history`, {
      method: "PATCH",
      headers: submitter.headers,
      json: { lastPage: 1, totalPages: 1 },
    })

    expect(open.status).toBe(404)
    expect([404, 422]).toContain(track.status)
  })

  test("do not count as uploads in the dashboard", async ({ app, services }) => {
    const { admin, published, pending, rejected } = await setup(services)

    await services.db
      .updateTable("chapters")
      .set({ createdAt: sql<Date>`now() at time zone 'UTC' - interval '1 hour'` })
      .where("id", "in", [published, pending, rejected])
      .execute()

    const res = await api<{ metrics: { chaptersUploaded: { total: number } } }>(
      app,
      "/dashboard/overview?range=7d",
      { headers: admin.headers },
    )
    const countSince = async (statuses: Array<"PENDING" | "PUBLISHED" | "REJECTED">) => {
      const row = await services.db
        .selectFrom("chapters")
        .select(services.db.fn.countAll<string>().as("count"))
        .where("deletedAt", "is", null)
        .where("status", "in", statuses)
        .where("createdAt", ">=", sql<Date>`now() at time zone 'UTC' - interval '6 days'`)
        .where("createdAt", "<", sql<Date>`now() at time zone 'UTC'`)
        .executeTakeFirstOrThrow()

      return Number(row.count)
    }

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const total = res.body.data.metrics.chaptersUploaded.total

    expect(total).toBe(await countSince(["PUBLISHED"]))
    expect(await countSince(["PUBLISHED", "PENDING", "REJECTED"])).toBe(total + 2)
  })
})
