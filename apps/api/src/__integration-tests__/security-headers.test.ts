import { describe, expect } from "vitest"
import { test } from "./setup"

describe("Security headers", () => {
  test("response sets X-Content-Type-Options: nosniff", async ({ app }) => {
    const res = await app.request("/ping")

    expect(res.headers.get("x-content-type-options")).toBe("nosniff")
  })

  test("response sets X-Frame-Options to deny embedding", async ({ app }) => {
    const res = await app.request("/ping")
    const xFrame = res.headers.get("x-frame-options")?.toUpperCase()

    expect(xFrame === "DENY" || xFrame === "SAMEORIGIN").toBe(true)
  })

  test("response sets Strict-Transport-Security", async ({ app }) => {
    const res = await app.request("/ping")

    expect(res.headers.get("strict-transport-security")).toContain("max-age=")
  })

  test("no CORS headers when CORS_ALLOWED_ORIGINS is unset", async ({ app }) => {
    const res = await app.request("/ping", {
      method: "OPTIONS",
      headers: {
        Origin: "https://untrusted.example.com",
        "Access-Control-Request-Method": "GET",
      },
    })

    expect(res.headers.get("access-control-allow-origin")).toBeNull()
  })
})
