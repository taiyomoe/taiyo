import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { proxyToUmami } from "../umami-proxy"

const UPSTREAM = "http://umami.internal:3000"
const fetchMock = vi.fn<typeof fetch>()
const send = (headers: Record<string, string>, body = '{"type":"event"}') =>
  new Request("https://site.test/u/api/send", {
    method: "POST",
    headers: { "content-length": String(new TextEncoder().encode(body).length), ...headers },
    body,
  })

describe("proxyToUmami", () => {
  beforeEach(() => {
    vi.stubEnv("UMAMI_INTERNAL_URL", UPSTREAM)
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockResolvedValue(
      new Response('{"cache":"token"}', { headers: { "content-type": "application/json" } }),
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it("serves the tracker script from Umami's script.js", async () => {
    const response = await proxyToUmami(new Request("https://site.test/u/s.js"), "s.js")
    const [url, init] = fetchMock.mock.calls[0] ?? []

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600")
    expect(url).toEqual(new URL("/script.js", UPSTREAM))
    expect(init?.method).toBe("GET")
    expect(init?.body).toBeNull()
  })

  it("forwards the tracker's headers and the visitor's address, and nothing else", async () => {
    const response = await proxyToUmami(
      send({
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0",
        "x-umami-cache": "token",
        "cf-connecting-ip": "203.0.113.7",
        cookie: "session=secret",
        "true-client-ip": "198.51.100.1",
      }),
      "api/send",
    )
    const init = fetchMock.mock.calls[0]?.[1]
    const headers = Object.fromEntries(new Headers(init?.headers).entries())

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(await response.json()).toEqual({ cache: "token" })
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(new URL("/api/send", UPSTREAM))
    expect(headers).toEqual({
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0",
      "x-umami-cache": "token",
      "cf-connecting-ip": "203.0.113.7",
    })
  })

  it("relays no other path of Umami", async () => {
    const response = await proxyToUmami(
      new Request("https://site.test/u/api/auth/login"),
      "api/auth/login",
    )

    expect(response.status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("refuses a method the path does not take", async () => {
    const response = await proxyToUmami(new Request("https://site.test/u/api/send"), "api/send")

    expect(response.status).toBe(405)
    expect(response.headers.get("allow")).toBe("POST")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("refuses a body without a length or above the cap", async () => {
    const oversized = await proxyToUmami(send({}, "x".repeat(64_001)), "api/send")
    const unsized = await proxyToUmami(
      new Request("https://site.test/u/api/send", { method: "POST", body: "{}" }),
      "api/send",
    )

    expect(oversized.status).toBe(413)
    expect(unsized.status).toBe(413)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("answers 404 when Umami is not configured", async () => {
    vi.stubEnv("UMAMI_INTERNAL_URL", "")

    const response = await proxyToUmami(new Request("https://site.test/u/s.js"), "s.js")

    expect(response.status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("answers 502 when Umami cannot be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"))

    const response = await proxyToUmami(new Request("https://site.test/u/s.js"), "s.js")

    expect(response.status).toBe(502)
  })
})
