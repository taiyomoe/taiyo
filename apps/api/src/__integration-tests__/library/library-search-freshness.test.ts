import type { Hono } from "hono"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const TIMEOUT = 30_000

type MediaHit = { id: string; libraryCount: number; chapterCount: number }

const waitForLibraryCount = async (
  { meili, mediasIndex }: Services,
  mediaId: string,
  expected: number,
  { attempts = 100, intervalMs = 100 } = {},
) => {
  let last: number | undefined

  for (let i = 0; i < attempts; i++) {
    const doc = await meili
      .index<MediaHit>(mediasIndex)
      .getDocument(mediaId)
      .catch(() => null)

    last = doc?.libraryCount

    if (last === expected) {
      return
    }

    await new Promise<void>((r) => setTimeout(r, intervalMs))
  }

  throw new Error(`libraryCount for ${mediaId} settled at ${last}, expected ${expected}`)
}
const getSearchedLibraryCount = async (app: Hono, mediaId: string) => {
  const res = await api<MediaHit[]>(app, "/medias/search", {
    method: "POST",
    headers: { "x-forwarded-for": `198.51.100.${randomUUID()}` },
    json: { sort: [{ field: "libraryCount", direction: "desc" }], perPage: 100 },
  })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  const hit = res.body.data.find((h) => h.id === mediaId)

  if (!hit) {
    throw new Error(`${mediaId} is missing from the search results`)
  }

  return hit.libraryCount
}

describe("library writes keep libraryCount fresh in search", () => {
  test(
    "adding an entry raises the count and removing it lowers it again",
    async ({ app, services }) => {
      const { headers } = await signInAs(services)

      await waitForLibraryCount(services, SEEDED_MEDIA_ID, 0)

      expect(await getSearchedLibraryCount(app, SEEDED_MEDIA_ID)).toBe(0)

      const added = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
        method: "PUT",
        headers,
        json: { status: "READING" },
      })

      expect(added.status).toBe(200)

      await waitForLibraryCount(services, SEEDED_MEDIA_ID, 1)

      expect(await getSearchedLibraryCount(app, SEEDED_MEDIA_ID)).toBe(1)

      const removed = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
        method: "DELETE",
        headers,
      })

      expect(removed.status).toBe(200)

      await waitForLibraryCount(services, SEEDED_MEDIA_ID, 0)

      expect(await getSearchedLibraryCount(app, SEEDED_MEDIA_ID)).toBe(0)
    },
    TIMEOUT,
  )

  test(
    "moving an entry between buckets leaves the count unchanged",
    async ({ app, services }) => {
      const { headers } = await signInAs(services)

      await waitForLibraryCount(services, SEEDED_MEDIA_ID, 0)
      await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
        method: "PUT",
        headers,
        json: { status: "READING" },
      })
      await waitForLibraryCount(services, SEEDED_MEDIA_ID, 1)
      await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
        method: "PUT",
        headers,
        json: { status: "COMPLETED" },
      })
      await waitForLibraryCount(services, SEEDED_MEDIA_ID, 1)

      expect(await getSearchedLibraryCount(app, SEEDED_MEDIA_ID)).toBe(1)
    },
    TIMEOUT,
  )

  test(
    "a failed removal does not touch the count",
    async ({ app, services }) => {
      const { headers } = await signInAs(services)

      await waitForLibraryCount(services, SEEDED_MEDIA_ID, 0)

      const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
        method: "DELETE",
        headers,
      })

      expect(res.status).toBe(404)

      if (res.body.success) {
        throw new Error("Expected failure")
      }

      expect(res.body.code).toBe("LIBRARY_ENTRY_NOT_FOUND")
      expect(await getSearchedLibraryCount(app, SEEDED_MEDIA_ID)).toBe(0)
    },
    TIMEOUT,
  )
})
