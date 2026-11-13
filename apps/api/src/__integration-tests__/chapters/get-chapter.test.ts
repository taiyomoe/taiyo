import type { Hono } from "hono"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { defined } from "../helpers/assert"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedHistory, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

type ChapterDetail = {
  id: string
  mediaId: string
  number: number
  language: string
  pages: Array<{ id: string; url: string }> | null
}

describe("GET /chapters/:id", () => {
  test("returns the chapter detail", async ({ app }) => {
    const res = await api<ChapterDetail>(app, `/chapters/${SEEDED_CHAPTER_ID}`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(SEEDED_CHAPTER_ID)
    expect(res.body.data.mediaId).toBe(SEEDED_MEDIA_ID)
  })

  test("returns a resolvable url for every page", async ({ app }) => {
    const res = await api<ChapterDetail>(app, `/chapters/${SEEDED_CHAPTER_ID}`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const { pages } = res.body.data

    expect(pages).not.toBeNull()

    const definedPages = defined(pages)

    expect(definedPages.length).toBeGreaterThan(0)

    for (const page of definedPages) {
      expect(page.url).toContain(
        `/medias/${SEEDED_MEDIA_ID}/chapters/${SEEDED_CHAPTER_ID}/${page.id}.jpg`,
      )
    }
  })

  test("returns CHAPTER_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/chapters/00000000-0000-0000-0000-000000000000`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/chapters/not-a-uuid`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})

const listHistoryChapterIds = async (app: Hono, headers: Record<string, string>) => {
  const res = await api<Array<{ chapterId: string }>>(app, "/users/me/history", { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.map((item) => item.chapterId)
}

describe("chapters of a deleted media", () => {
  test("are no longer readable, commentable or listed in history", async ({ app, services }) => {
    const reader = await signInAs(services)
    const uploader = await signInAs(services, { role: "UPLOADER" })
    const mediaId = await seedMedia(services, uploader.userId)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PUBLISHED",
      pages: [{ id: randomUUID() }],
    })

    await seedHistory(services, reader.userId, chapterId)

    expect((await api(app, `/chapters/${chapterId}`)).status).toBe(200)
    expect(await listHistoryChapterIds(app, reader.headers)).toContain(chapterId)

    const deleted = await api(app, `/medias/${mediaId}`, {
      method: "DELETE",
      headers: uploader.headers,
    })

    expect(deleted.status).toBe(200)

    for (const path of [
      `/chapters/${chapterId}`,
      `/chapters/${chapterId}/reader`,
      `/chapters/${chapterId}/groups`,
    ]) {
      const res = await api(app, path)

      expect(res.status).toBe(404)
    }

    const comments = await api(app, `/comments?targetType=CHAPTER&targetId=${chapterId}`)

    expect(comments.status).toBe(404)

    expect(await listHistoryChapterIds(app, reader.headers)).not.toContain(chapterId)
  })
})
