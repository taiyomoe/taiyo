import type { Hono } from "hono"
import { drainSearchOutbox } from "@taiyomoe/search"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia, seedTitle } from "../helpers/seed"
import { waitForMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const TIMEOUT = 30_000
const seedSearchableMedia = async (
  services: Services,
  creatorId: string,
  contentRating: "NORMAL" | "NSFW",
  title: string,
) => {
  const mediaId = await seedMedia(services, creatorId, contentRating)

  await seedTitle(services, { mediaId, creatorId, title, isMainTitle: true })
  await services.db
    .insertInto("covers")
    .values({ mediaId, uploaderId: creatorId, language: "en", isMainCover: true })
    .execute()

  return mediaId
}
const seedPair = async (services: Services) => {
  const { userId } = await signInAs(services)
  const word = `rating${randomUUID().slice(0, 8)}`
  const normalId = await seedSearchableMedia(services, userId, "NORMAL", `${word} normal`)
  const nsfwId = await seedSearchableMedia(services, userId, "NSFW", `${word} nsfw`)

  await drainSearchOutbox(services)
  await Promise.all(
    [normalId, nsfwId].map((id) => waitForMediaDoc(services, id, (doc) => doc !== null)),
  )

  return { word, normalId, nsfwId }
}
const search = async (
  app: Hono,
  json: Record<string, unknown>,
  headers: Record<string, string> = {},
) => {
  const res = await api<Array<{ id: string }>>(app, "/medias/search", {
    method: "POST",
    headers: { "cf-connecting-ip": `203.0.113.${randomUUID()}`, ...headers },
    json,
  })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.map((hit) => hit.id)
}

test.override({ search: true })

describe("POST /medias/search content ratings", () => {
  test(
    "limits signed-out searches to the default ratings",
    async ({ app, services }) => {
      const { word, normalId, nsfwId } = await seedPair(services)
      const ids = await search(app, { q: word })

      expect(ids).toContain(normalId)
      expect(ids).not.toContain(nsfwId)
    },
    TIMEOUT,
  )

  test(
    "limits signed-in searches to the ratings of the user's settings",
    async ({ app, services }) => {
      const { word, normalId, nsfwId } = await seedPair(services)
      const { headers } = await signInAs(services)
      const settings = await api(app, "/users/me/settings", {
        method: "PATCH",
        headers,
        json: { contentRating: ["NSFW"] },
      })

      expect(settings.status).toBe(200)

      const ids = await search(app, { q: word }, headers)

      expect(ids).toContain(nsfwId)
      expect(ids).not.toContain(normalId)
    },
    TIMEOUT,
  )

  test(
    "honours an explicit rating filter",
    async ({ app, services }) => {
      const { word, normalId, nsfwId } = await seedPair(services)
      const ids = await search(app, { q: word, filter: { contentRating: { in: ["NSFW"] } } })

      expect(ids).toContain(nsfwId)
      expect(ids).not.toContain(normalId)
    },
    TIMEOUT,
  )
})
