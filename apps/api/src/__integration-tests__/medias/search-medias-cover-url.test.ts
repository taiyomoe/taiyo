import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { waitForMeiliMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const TIMEOUT = 30_000

type MediaHit = {
  id: string
  mainCoverId: string | null
  mainCoverUrl: string | null
  mainCoverExtension?: unknown
}

describe("POST /medias/search cover URLs", () => {
  test(
    "returns a resolvable main cover url on every hit",
    async ({ app, services }) => {
      expect(await waitForMeiliMediaDoc(services, SEEDED_MEDIA_ID)).not.toBeNull()

      const res = await api<MediaHit[]>(app, "/medias/search", {
        method: "POST",
        headers: { "x-forwarded-for": `198.51.100.${randomUUID()}` },
        json: { perPage: 100 },
      })

      if (!res.body.success) {
        throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
      }

      const seeded = res.body.data.find((hit) => hit.id === SEEDED_MEDIA_ID)
      const { extension } = await services.db
        .selectFrom("covers")
        .select("extension")
        .where("mediaId", "=", SEEDED_MEDIA_ID)
        .where("isMainCover", "=", true)
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow()

      expect(seeded?.mainCoverUrl).toMatch(
        new RegExp(`/medias/${SEEDED_MEDIA_ID}/covers/${seeded?.mainCoverId}\\.${extension}$`),
      )

      for (const hit of res.body.data) {
        expect(hit).not.toHaveProperty("mainCoverExtension")
        expect(hit.mainCoverUrl).toContain(`/medias/${hit.id}/covers/${hit.mainCoverId}.`)
      }
    },
    TIMEOUT,
  )
})
