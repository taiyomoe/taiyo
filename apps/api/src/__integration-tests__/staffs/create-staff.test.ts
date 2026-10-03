import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { invalidImage, tinyPng } from "../helpers/fixtures"
import { api } from "../helpers/request"
import { test } from "../setup"

const getForm = (overrides?: { withFile?: boolean; skipName?: boolean }) => {
  const form = new FormData()

  if (!overrides?.skipName) {
    form.append("name", `Test Staff ${crypto.randomUUID()}`)
  }

  form.append("bio.en", "An English bio")
  form.append("links.twitter", "https://x.com/example")

  return form
}

describe("POST /staffs", () => {
  test("creates a staff (DB only)", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = getForm()
    const res = await api<{ id: string }>(app, `/staffs`, { method: "POST", headers, form })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const row = await services.db
      .selectFrom("staffs")
      .selectAll()
      .where("id", "=", res.body.data.id)
      .executeTakeFirst()

    expect(row?.name).toMatch(/^Test Staff/)
    expect(row?.bio).toEqual({ en: "An English bio" })
    expect(row?.links).toEqual({ twitter: "https://x.com/example" })
    expect(row?.image).toBeNull()
  })

  test("creates a staff with an image (DB + S3)", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = getForm()

    form.append("file", await tinyPng())

    const res = await api<{ id: string }>(app, `/staffs`, { method: "POST", headers, form })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const staffId = res.body.data.id
    const row = await services.db
      .selectFrom("staffs")
      .select(["image"])
      .where("id", "=", staffId)
      .executeTakeFirst()

    expect(row?.image).toMatch(new RegExp(`^staffs/${staffId}/image\\.`))

    const s3Listing = await services.s3.send(
      new ListObjectsV2Command({
        Bucket: services.s3Bucket,
        Prefix: `staffs/${staffId}/`,
      }),
    )

    expect(s3Listing.Contents).toHaveLength(1)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/staffs`, { method: "POST", form: getForm() })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/staffs`, { method: "POST", headers, form: getForm() })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/staffs`, { method: "POST", headers, form: getForm() })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns VALIDATION_ERROR when name is missing", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/staffs`, {
      method: "POST",
      headers,
      form: getForm({ skipName: true }),
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns INVALID_IMAGE for a fake image file", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = getForm()

    form.append("file", invalidImage())

    const res = await api(app, `/staffs`, { method: "POST", headers, form })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("INVALID_IMAGE")
  })
})
