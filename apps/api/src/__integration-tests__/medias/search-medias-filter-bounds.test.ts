import { config } from "@taiyomoe/config"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

const search = (app: Parameters<typeof api>[0], filter: unknown) =>
  api(app, "/medias/search", {
    method: "POST",
    headers: { "x-forwarded-for": `203.0.113.${randomUUID()}` },
    json: { filter },
  })

describe("POST /medias/search filter bounds", () => {
  test("rejects an oversized filter array with a single issue", async ({ app }) => {
    const res = await search(app, { titleLanguages: { hasAll: Array(1000).fill("xx") } })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.details).toHaveLength(1)
  })

  test("caps the issues a 422 carries", async ({ app }) => {
    const res = await search(app, { titleLanguages: { hasAll: Array(100).fill("xx") } })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.details).toHaveLength(config.input.maxValidationIssues)
  })
})
