import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { invalidImage, tinyPng } from "../helpers/fixtures"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const getForm = async () => {
  const form = new FormData()

  form.append("banners.0.file", await tinyPng())
  form.append("banners.0.contentRating", "NORMAL")

  return form
}

describe("POST /medias/:id/banners", () => {
  test("adds a banner (DB + S3)", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const bannersBefore = await services.db
      .selectFrom("banners")
      .select("id")
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .execute()
    const res = await api<{ ids: string[] }>(app, `/medias/${SEEDED_MEDIA_ID}/banners`, {
      method: "POST",
      headers,
      form: await getForm(),
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.ids).toHaveLength(1)
    const [bannerId] = res.body.data.ids
    const bannersAfter = await services.db
      .selectFrom("banners")
      .select("id")
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .execute()

    expect(bannersAfter).toHaveLength(bannersBefore.length + 1)

    const s3Listing = await services.s3.send(
      new ListObjectsV2Command({
        Bucket: services.s3Bucket,
        Prefix: `medias/${SEEDED_MEDIA_ID}/banners/${bannerId}`,
      }),
    )

    expect(s3Listing.Contents).toHaveLength(1)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/banners`, {
      method: "POST",
      form: await getForm(),
    })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/banners`, {
      method: "POST",
      headers,
      form: await getForm(),
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/banners`, {
      method: "POST",
      headers,
      form: await getForm(),
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns VALIDATION_ERROR when no banners are sent", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = new FormData()
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/banners`, {
      method: "POST",
      headers,
      form,
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/banners`, {
      method: "POST",
      headers,
      form: await getForm(),
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns INVALID_IMAGE for a fake image file", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = await getForm()

    form.set("banners.0.file", invalidImage())

    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/banners`, {
      method: "POST",
      headers,
      form,
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("INVALID_IMAGE")
  })
})
