import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

type ManagedCover = {
  id: string
  url: string
  isMainCover: boolean
  media: { id: string; title: string | null; imageCount: number }
}

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /covers", () => {
  test("lists the covers of a media with their media", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER_INTERN" })
    const res = await api<ManagedCover[]>(app, `/covers?mediaId=${SEEDED_MEDIA_ID}&perPage=100`, {
      headers,
    })
    const live = await services.db
      .selectFrom("covers")
      .select("id")
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .where("deletedAt", "is", null)
      .execute()

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((cover) => cover.id).sort()).toEqual(live.map((row) => row.id).sort())
    expect(res.body.data.filter((cover) => cover.isMainCover)).toHaveLength(1)

    for (const cover of res.body.data) {
      expect(cover.url).toContain(`/medias/${SEEDED_MEDIA_ID}/covers/${cover.id}.`)
      expect(cover.media).toEqual(
        expect.objectContaining({ id: SEEDED_MEDIA_ID, imageCount: live.length }),
      )
    }
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/covers"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await api(app, "/covers", { headers }), 403, "FORBIDDEN")
  })

  test("rejects users without the required role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })

    expectFailure(await api(app, "/covers", { headers }), 403, "FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an unknown language", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(await api(app, "/covers?language=xx", { headers }), 422, "VALIDATION_ERROR")
  })
})
