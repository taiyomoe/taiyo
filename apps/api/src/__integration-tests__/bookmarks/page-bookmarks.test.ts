import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { type ApiResult, api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type Bookmark = { chapterId: string; pageId: string; page: number; url: string; mediaId: string }

const dataOf = <TData>(res: ApiResult<TData>) => {
  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
const seedPages = async (services: Services) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)
  const pages = [{ id: randomUUID() }, { id: randomUUID() }, { id: randomUUID() }]
  const chapterId = await seedChapter(services, { mediaId, uploaderId, number: 1, pages })
  const otherMediaId = await seedMedia(services, uploaderId)
  const otherPages = [{ id: randomUUID() }]
  const otherChapterId = await seedChapter(services, {
    mediaId: otherMediaId,
    uploaderId,
    number: 1,
    pages: otherPages,
  })

  return { mediaId, chapterId, pages, otherChapterId, otherPages }
}

describe("page bookmarks", () => {
  test("bookmarks a page once and lists it with its position and image", async ({
    app,
    services,
  }) => {
    const { mediaId, chapterId, pages } = await seedPages(services)
    const { headers } = await signInAs(services)
    const pageId = pages[1]?.id ?? ""

    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await api(app, `/chapters/${chapterId}/bookmarks/${pageId}`, {
        method: "PUT",
        headers,
      })

      expect(res.status).toBe(200)
    }

    const bookmarks = dataOf(
      await api<Bookmark[]>(app, `/users/me/bookmarks?mediaId=${mediaId}`, { headers }),
    )

    expect(bookmarks).toHaveLength(1)
    expect(bookmarks[0]).toMatchObject({ chapterId, pageId, page: 2, mediaId })
    expect(bookmarks[0]?.url).toContain(`/chapters/${chapterId}/${pageId}.jpg`)
  })

  test("filters by media and removes bookmarks", async ({ app, services }) => {
    const { mediaId, chapterId, pages, otherChapterId, otherPages } = await seedPages(services)
    const { headers } = await signInAs(services)
    const pageId = pages[0]?.id ?? ""

    await api(app, `/chapters/${chapterId}/bookmarks/${pageId}`, { method: "PUT", headers })
    await api(app, `/chapters/${otherChapterId}/bookmarks/${otherPages[0]?.id ?? ""}`, {
      method: "PUT",
      headers,
    })

    expect(dataOf(await api<Bookmark[]>(app, "/users/me/bookmarks", { headers }))).toHaveLength(2)

    await api(app, `/chapters/${chapterId}/bookmarks/${pageId}`, { method: "DELETE", headers })

    expect(
      dataOf(await api<Bookmark[]>(app, `/users/me/bookmarks?mediaId=${mediaId}`, { headers })),
    ).toEqual([])
  })

  test("hides bookmarks on pages removed from the chapter", async ({ app, services }) => {
    const { chapterId, pages } = await seedPages(services)
    const { headers } = await signInAs(services)

    await api(app, `/chapters/${chapterId}/bookmarks/${pages[2]?.id ?? ""}`, {
      method: "PUT",
      headers,
    })
    await services.db
      .updateTable("chapters")
      .set({ pages: pages.slice(0, 2) })
      .where("id", "=", chapterId)
      .execute()

    expect(dataOf(await api<Bookmark[]>(app, "/users/me/bookmarks", { headers }))).toEqual([])
  })

  test("rejects a page that isn't in the chapter", async ({ app, services }) => {
    const { chapterId } = await seedPages(services)
    const { headers } = await signInAs(services)
    const res = await api(app, `/chapters/${chapterId}/bookmarks/${randomUUID()}`, {
      method: "PUT",
      headers,
    })

    expect(res.status).toBe(404)
    expect(!res.body.success && res.body.code).toBe("PAGE_NOT_FOUND")
  })

  test("requires a signed-in user", async ({ app, services }) => {
    const { chapterId, pages } = await seedPages(services)
    const res = await api(app, `/chapters/${chapterId}/bookmarks/${pages[0]?.id ?? ""}`, {
      method: "PUT",
    })

    expect(res.status).toBe(401)
  })
})
