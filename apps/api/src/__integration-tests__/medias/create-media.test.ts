import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { invalidImage, tinyPng } from "../helpers/fixtures"
import { api } from "../helpers/request"
import { waitForMeiliMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const getForm = async (overrides?: Partial<{ skipTitle: boolean }>) => {
  const form = new FormData()

  if (!overrides?.skipTitle) {
    form.append("titles.0.title", `Test ${randomUUID()}`)
    form.append("titles.0.language", "en")
    form.append("titles.0.main", "true")
    form.append("titles.0.priority", "1")
  }

  form.append("covers.0.file", await tinyPng())
  form.append("covers.0.language", "en")
  form.append("covers.0.contentRating", "NORMAL")
  form.append("covers.0.main", "true")

  form.append("contentRating", "NORMAL")
  form.append("type", "MANGA")
  form.append("status", "RELEASING")
  form.append("source", "ORIGINAL")
  form.append("demography", "SHOUNEN")
  form.append("countryOfOrigin", "JAPAN")

  return form
}

describe("POST /medias", () => {
  test("creates a media with cover (DB + S3 + Meili)", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = await getForm()
    const res = await api<{ id: string }>(app, "/medias", { method: "POST", headers, form })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const mediaId = res.body.data.id
    const media = await services.db
      .selectFrom("medias")
      .selectAll()
      .where("id", "=", mediaId)
      .executeTakeFirst()

    expect(media?.type).toBe("MANGA")

    const titles = await services.db
      .selectFrom("titles")
      .selectAll()
      .where("mediaId", "=", mediaId)
      .execute()

    expect(titles).toHaveLength(1)
    expect(titles[0]?.isMainTitle).toBe(true)

    const covers = await services.db
      .selectFrom("covers")
      .selectAll()
      .where("mediaId", "=", mediaId)
      .execute()

    expect(covers).toHaveLength(1)

    const s3Listing = await services.s3.send(
      new ListObjectsV2Command({
        Bucket: services.s3Bucket,
        Prefix: `medias/${mediaId}/covers/`,
      }),
    )

    expect(s3Listing.Contents).toHaveLength(1)

    const meiliDoc = await waitForMeiliMediaDoc(services, mediaId)

    expect(meiliDoc).not.toBeNull()
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const form = await getForm()
    const res = await api(app, "/medias", { method: "POST", form })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const form = await getForm()
    const res = await api(app, "/medias", { method: "POST", headers, form })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const form = await getForm()
    const res = await api(app, "/medias", { method: "POST", headers, form })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns VALIDATION_ERROR when titles are missing", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = await getForm({ skipTitle: true })
    const res = await api(app, "/medias", { method: "POST", headers, form })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns INVALID_IMAGE for a fake image file", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = await getForm()

    form.set("covers.0.file", invalidImage())

    const res = await api(app, "/medias", { method: "POST", headers, form })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("INVALID_IMAGE")
  })

  test("rolls back DB + S3 when staff is missing", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = await getForm()

    form.append("staffs.0.staffId", randomUUID())
    form.append("staffs.0.role", "AUTHOR")

    const countBefore = await services.db.selectFrom("medias").select("id").execute()
    const res = await api(app, "/medias", { method: "POST", headers, form })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("STAFF_NOT_FOUND")

    const countAfter = await services.db.selectFrom("medias").select("id").execute()

    expect(countAfter).toHaveLength(countBefore.length)

    const s3Listing = await services.s3.send(
      new ListObjectsV2Command({ Bucket: services.s3Bucket, Prefix: "medias/" }),
    )

    expect(s3Listing.Contents ?? []).toHaveLength(0)
  })
})
