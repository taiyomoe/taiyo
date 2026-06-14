import { describe, expect } from "vitest"
import packageJson from "../../package.json"
import { test } from "./setup"

describe("GET /ping", () => {
  test("should exist", async ({ app }) => {
    const res = await app.request("/ping")

    expect(res.body).toBeDefined()
    expect(res.status).not.toBe(404)
  })

  test("should return the correct status code", async ({ app }) => {
    const res = await app.request("/ping")

    expect(res.status).toBe(200)
  })

  test("should return the correct version", async ({ app }) => {
    const res = await app.request("/ping")

    expect(await res.json()).toEqual({ version: packageJson.version })
  })
})
