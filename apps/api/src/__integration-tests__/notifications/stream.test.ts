import { describe, expect } from "vitest"
import { postComment, postReply } from "../comments/helpers"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"
import { setupMedia } from "./helpers"

const decoder = new TextDecoder()
const readUntil = async (reader: ReadableStreamDefaultReader<Uint8Array>, text: string) => {
  let received = ""

  while (!received.includes(text)) {
    const { value, done } = await reader.read()

    if (done) {
      throw new Error(`Stream ended before "${text}": ${received}`)
    }

    received += decoder.decode(value)
  }

  return received
}

describe("GET /users/me/notifications/stream", () => {
  test("sends a change event when the user's notifications change", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const stranger = await signInAs(services)
    const res = await app.request("/users/me/notifications/stream", { headers })

    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("text/event-stream")

    const reader = res.body?.getReader()

    if (reader === undefined) {
      throw new Error("Expected a stream body")
    }

    await readUntil(reader, "event: ready")
    await services.notificationEvents.publish([stranger.userId])
    await services.notificationEvents.publish([userId])

    const received = await readUntil(reader, "event: change")

    expect(received.match(/event: change/g)).toHaveLength(1)

    await reader.cancel()
  })

  test("rejects unauthenticated requests", async ({ app }) => {
    expect((await api(app, "/users/me/notifications/stream")).status).toBe(401)
  })
})

describe("notification change events", () => {
  test("a reply signals its parent's author once the reply is saved", async ({ app, services }) => {
    const { mediaId } = await setupMedia(services)
    const author = await signInAs(services)
    const replier = await signInAs(services)
    const signals: string[] = []

    services.notificationEvents.subscribe(author.userId, () => {
      signals.push("author")
    })

    const root = await postComment(app, author.headers, { type: "MEDIA", id: mediaId })

    await postReply(app, author.headers, root.id)

    expect(signals).toEqual([])

    await postReply(app, replier.headers, root.id)

    expect(signals).toEqual(["author"])
  })

  test("reading notifications signals the reader's other tabs", async ({ app, services }) => {
    const { mediaId } = await setupMedia(services)
    const author = await signInAs(services)
    const replier = await signInAs(services)
    const root = await postComment(app, author.headers, { type: "MEDIA", id: mediaId })
    const signals: string[] = []

    await postReply(app, replier.headers, root.id)
    services.notificationEvents.subscribe(author.userId, () => {
      signals.push("author")
    })

    await api(app, "/users/me/notifications/read-all", { method: "POST", headers: author.headers })
    await api(app, "/users/me/notifications/read-all", { method: "POST", headers: author.headers })

    expect(signals).toEqual(["author"])
  })
})
