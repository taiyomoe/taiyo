import { config } from "@taiyomoe/config"
import { describe, expect } from "vitest"
import { signInAs } from "./helpers/auth"
import { test } from "./setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
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

const zeros = (bytes: number) => {
  const chunk = new Uint8Array(1024 * 1024)
  let sent = 0

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= bytes) {
        controller.close()

        return
      }

      sent += chunk.length
      controller.enqueue(chunk)
    },
  })
}

describe("Multipart body limit", () => {
  test("refuses an oversized multipart body", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await app.request(`/medias/${SEEDED_MEDIA_ID}/covers`, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "multipart/form-data; boundary=x",
        "cf-connecting-ip": "192.0.2.12",
      },
      body: zeros(config.input.maxMultipartBodyBytes + 1024 * 1024),
      duplex: "half",
    })

    expect(res.status).toBe(413)
    expect(await res.json()).toMatchObject({ code: "PAYLOAD_TOO_LARGE" })
  })

  test("refuses a body over one image on a single-image route", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await app.request("/users/me/avatar", {
      method: "PUT",
      headers: {
        ...headers,
        "content-type": "multipart/form-data; boundary=x",
        "cf-connecting-ip": "192.0.2.14",
      },
      body: zeros(config.images.maxSizeBytes + 2 * 1024 * 1024),
      duplex: "half",
    })

    expect(res.status).toBe(422)
    expect(await res.json()).toMatchObject({ code: "IMAGE_TOO_LARGE" })
  })
})

const errorCode = async (res: Response) => {
  const body: unknown = await res.json()

  return typeof body === "object" && body !== null && "code" in body ? body.code : undefined
}

describe("JSON route bodies", () => {
  test("leaves a multipart body on a json route unread", async ({ app }) => {
    const asMultipart = await app.request("/medias/search", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=x",
        "cf-connecting-ip": "192.0.2.15",
      },
      body: zeros(2 * 1024 * 1024),
      duplex: "half",
    })
    const asEmptyJson = await app.request("/medias/search", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "192.0.2.16" },
      body: "{}",
    })

    expect(asMultipart.status).not.toBe(413)
    expect(asMultipart.status).toBe(asEmptyJson.status)
    expect(await errorCode(asMultipart)).toBe(await errorCode(asEmptyJson))
  })

  test("reads a json route's body only when it is sent as json", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const body = JSON.stringify({
      endpoint: "https://fcm.googleapis.com/fcm/send/body-limit",
      keys: { p256dh: "p256dh-key", auth: "auth-secret" },
    })
    const asText = await app.request("/users/me/push-subscriptions", {
      method: "PUT",
      headers: { ...headers, "content-type": "text/plain", "cf-connecting-ip": "192.0.2.13" },
      body,
    })

    expect(asText.status).toBe(422)
  })
})
