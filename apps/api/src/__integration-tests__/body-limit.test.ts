import { config } from "@taiyomoe/config"
import { describe, expect } from "vitest"
import { test } from "./setup"

const oversized = JSON.stringify({ pad: "x".repeat(config.input.maxJsonBodyBytes) })

describe("JSON body limit", () => {
  test("refuses an oversized body before parsing it, on api and auth routes", async ({ app }) => {
    for (const path of ["/medias/search", "/api/auth/sign-in/email"]) {
      const res = await app.request(path, {
        method: "POST",
        headers: { "content-type": "application/json", "cf-connecting-ip": "192.0.2.10" },
        body: oversized,
      })

      expect(res.status).toBe(413)
      expect(await res.json()).toMatchObject({ code: "PAYLOAD_TOO_LARGE" })
    }
  })

  test("refuses an oversized body sent without a length", async ({ app }) => {
    const res = await app.request("/medias/search", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "192.0.2.11" },
      body: new Blob([oversized]).stream(),
      duplex: "half",
    })

    expect(res.status).toBe(413)
  })
})
