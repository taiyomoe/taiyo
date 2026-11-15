import type { Hono } from "hono"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { api } from "../helpers/request"
import { waitForMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MANGADEX_ID = "46e530ce-0766-4cbd-b005-5e6fb0ba5e71"
const UNKNOWN_MANGADEX_ID = "00000000-0000-4000-8000-000000000000"
const search = (app: Hono, links: unknown) =>
  api<Array<{ id: string }>>(app, "/medias/search", {
    method: "POST",
    headers: { "cf-connecting-ip": `192.0.2.${randomUUID()}` },
    json: { filter: { links } },
  })
// The seeded medias are indexed in the background, so wait for their link values to land.
const getIds = async (services: Services, app: Hono, links: unknown) => {
  await waitForMediaDoc(services, SEEDED_MEDIA_ID, (doc) => (doc?.linkValues.length ?? 0) > 0)

  const res = await search(app, links)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.map(({ id }) => id)
}

test.override({ search: true })

describe("POST /medias/search links filter", () => {
  test("finds a media by its MangaDex id", async ({ app, services }) => {
    expect(await getIds(services, app, { mangaDex: SEEDED_MANGADEX_ID })).toEqual([SEEDED_MEDIA_ID])
  })

  test("finds a media when any of the given ids matches", async ({ app, services }) => {
    const ids = await getIds(services, app, { mangaDex: UNKNOWN_MANGADEX_ID, anilist: 87178 })

    expect(ids).toEqual([SEEDED_MEDIA_ID])
  })

  test("returns no media when none carries the ids", async ({ app, services }) => {
    const ids = await getIds(services, app, {
      mangaDex: UNKNOWN_MANGADEX_ID,
      myAnimeList: 999_999_999,
    })

    expect(ids).toEqual([])
  })

  test("returns VALIDATION_ERROR for an invalid MangaDex id", async ({ app }) => {
    const res = await search(app, { mangaDex: "not-a-uuid" })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
