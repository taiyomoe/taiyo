import { describe, expect } from "vitest"
import { app } from "../index"
import { test } from "./setup"

describe("POST /medias", () => {
  test("should exist", async () => {
    const res = await app.request("/medias", { method: "POST" })

    expect(res.body).toBeDefined()
    expect(res.status).not.toBe(404)
  })
})
