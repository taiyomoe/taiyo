import { describe, expect } from "vitest"
import { test } from "./setup"

describe("GET /docs", () => {
  test("loads the reference from the api itself, under a nonce-based CSP", async ({ app }) => {
    const res = await app.request("/docs")
    const html = await res.text()
    const csp = res.headers.get("content-security-policy") ?? ""
    const nonce = /script-src 'nonce-([^']+)'/.exec(csp)?.[1]

    expect(res.status).toBe(200)
    expect(nonce).toBeDefined()
    expect(csp).toContain("connect-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(html).toContain(`<script src="/docs/scalar.js" nonce="${nonce}"></script>`)
    expect(html).not.toMatch(/<script[^>]+src="https?:/)
  })

  test("serves the bundled reference script", async ({ app }) => {
    const res = await app.request("/docs/scalar.js")

    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("text/javascript")
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(0)
  })
})
