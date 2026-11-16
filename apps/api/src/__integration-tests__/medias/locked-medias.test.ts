import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { tinyPng } from "../helpers/fixtures"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const expectLocked = (res: ApiResult) => {
  expect(res.status).toBe(451)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe("MEDIA_LOCKED")
}
const seedLockedMedia = async (services: Services) => {
  const { headers, userId } = await signInAs(services, { role: "ADMIN" })
  const mediaId = await seedMedia(services, userId)
  const chapterId = await seedChapter(services, {
    mediaId,
    uploaderId: userId,
    number: 1,
    status: "PUBLISHED",
    pages: [{ id: randomUUID() }],
  })

  await services.db
    .updateTable("medias")
    .set({ flag: "LOCKED" })
    .where("id", "=", mediaId)
    .execute()

  return { headers, userId, mediaId, chapterId }
}

describe("PATCH /medias with a flag", () => {
  test("locks every media for a moderator", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const first = await seedMedia(services, userId)
    const second = await seedMedia(services, userId)
    const res = await api(app, "/medias", {
      method: "PATCH",
      headers,
      json: { mediaIds: [first, second], flag: "LOCKED" },
    })

    expect(res.status).toBe(200)

    const rows = await services.db
      .selectFrom("medias")
      .select("flag")
      .where("id", "in", [first, second])
      .execute()

    expect(rows).toEqual([{ flag: "LOCKED" }, { flag: "LOCKED" }])
  })

  test("rejects an uploader who sets the flag with FORBIDDEN", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const mediaId = await seedMedia(services, userId)
    const res = await api(app, "/medias", {
      method: "PATCH",
      headers,
      json: { mediaIds: [mediaId], flag: "LOCKED", status: "FINISHED" },
    })

    expect(res.status).toBe(403)

    const row = await services.db
      .selectFrom("medias")
      .select(["flag", "status"])
      .where("id", "=", mediaId)
      .executeTakeFirst()

    expect(row).toEqual({ flag: "OK", status: "RELEASING" })
  })
})

describe("a locked media", () => {
  test("refuses to list its chapters", async ({ app, services }) => {
    const { mediaId } = await seedLockedMedia(services)

    expectLocked(await api(app, `/medias/${mediaId}/chapters`))
    expectLocked(await api(app, `/medias/${mediaId}/chapters/facets?contentRating=NORMAL`))
    expectLocked(await api(app, `/medias/${mediaId}/chapter-numbers?language=en`))
  })

  test("refuses to serve its chapters, and names the media", async ({ app, services }) => {
    const { headers, mediaId, chapterId } = await seedLockedMedia(services)

    for (const path of [`/chapters/${chapterId}`, `/chapters/${chapterId}/reader`]) {
      const res = await api(app, path, { headers })

      expectLocked(res)
      expect(!res.body.success && res.body.details).toEqual({ mediaId })
    }
  })

  test("leaves its chapters out of the latest releases", async ({ app, services }) => {
    const { chapterId } = await seedLockedMedia(services)
    const res = await api<Array<{ id: string }>>(app, "/chapters/latest?perPage=100")

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data.map((row) => row.id)).not.toContain(chapterId)
  })

  test("refuses new chapters, covers and banners", async ({ app, services }) => {
    const { headers, mediaId } = await seedLockedMedia(services)
    const covers = new FormData()
    const banners = new FormData()

    covers.append("covers.0.file", await tinyPng())
    covers.append("covers.0.language", "en")
    covers.append("covers.0.contentRating", "NORMAL")
    banners.append("banners.0.file", await tinyPng())
    banners.append("banners.0.contentRating", "NORMAL")

    expectLocked(
      await api(app, `/medias/${mediaId}/chapters`, {
        method: "POST",
        headers,
        json: { number: 2, language: "en" },
      }),
    )
    expectLocked(
      await api(app, `/medias/${mediaId}/covers`, { method: "POST", headers, form: covers }),
    )
    expectLocked(
      await api(app, `/medias/${mediaId}/banners`, { method: "POST", headers, form: banners }),
    )
  })

  test("still lets staff edit the media and its chapters", async ({ app, services }) => {
    const { headers, mediaId, chapterId } = await seedLockedMedia(services)
    const chapter = await api(app, `/chapters/${chapterId}`, {
      method: "PATCH",
      headers,
      json: { title: "Renamed" },
    })
    const media = await api(app, "/medias", {
      method: "PATCH",
      headers,
      json: { mediaIds: [mediaId], status: "FINISHED" },
    })

    expect(chapter.status).toBe(200)
    expect(media.status).toBe(200)
  })

  test("keeps its pending chapters out of a bulk approval", async ({ app, services }) => {
    const { headers, userId, mediaId } = await seedLockedMedia(services)
    const pendingId = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 2,
      status: "PENDING",
      pages: [{ id: randomUUID() }],
    })
    const res = await api<{ approved: string[]; skipped: unknown[] }>(app, "/chapters/approve", {
      method: "POST",
      headers,
      json: { chapterIds: [pendingId] },
    })

    expect(res.body.success && res.body.data).toEqual({
      approved: [],
      skipped: [{ id: pendingId, reason: "MEDIA_LOCKED" }],
    })
  })
})
