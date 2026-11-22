import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { waitForMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const SEEDED_MEDIA_IDS = [
  "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  "7a99da64-56e7-4bf6-8159-8db0d3b4f231",
] as const
const TIMEOUT = 30_000

type MediaHit = { id: string; ratingCount: number; ratingAverage: number | null }

test.override({ search: true })

describe("POST /medias/search rating sort", () => {
  test(
    "ranks a widely well-rated media above one with a few perfect scores",
    async ({ app, services }) => {
      const [fewPerfect, manyGood] = SEEDED_MEDIA_IDS
      const raters = await Promise.all(Array.from({ length: 30 }, () => signInAs(services)))

      for (const [index, { headers }] of raters.entries()) {
        const [mediaId, score] = index < 2 ? [fewPerfect, 10] : [manyGood, 9]

        await api(app, `/medias/${mediaId}/rating`, { method: "PUT", headers, json: { score } })
      }

      await waitForMediaDoc(services, manyGood, (doc) => doc?.ratingCount === 28)
      await waitForMediaDoc(services, fewPerfect, (doc) => doc?.ratingCount === 2)

      const res = await api<MediaHit[]>(app, "/medias/search", {
        method: "POST",
        json: { perPage: 100, sort: [{ field: "rating", direction: "desc" }] },
      })

      if (!res.body.success) {
        throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
      }

      const ids = res.body.data.map((hit) => hit.id)

      expect(ids.indexOf(manyGood)).toBe(0)
      expect(ids.indexOf(fewPerfect)).toBe(1)
      expect(res.body.data[0]).toMatchObject({ ratingCount: 28, ratingAverage: 9 })
    },
    TIMEOUT,
  )
})
