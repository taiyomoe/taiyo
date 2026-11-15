import { createWebPushSender } from "@taiyomoe/queue"
import { createECDH, randomBytes } from "node:crypto"
import { createServer, type RequestListener, type Server } from "node:http"
import { afterEach, describe, expect, it } from "vitest"

const servers: Server[] = []
const listen = (handler: RequestListener) =>
  new Promise<string>((resolve) => {
    const server = createServer(handler)

    servers.push(server)
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()

      resolve(
        typeof address === "object" && address !== null ? `http://127.0.0.1:${address.port}` : "",
      )
    })
  })
const keyPair = () => {
  const ecdh = createECDH("prime256v1")

  ecdh.generateKeys()

  return { publicKey: ecdh.getPublicKey("base64url"), privateKey: ecdh.getPrivateKey("base64url") }
}
const target = (endpoint: string) => ({
  endpoint,
  p256dh: keyPair().publicKey,
  auth: randomBytes(16).toString("base64url"),
})
const message = { title: "t", body: "b", url: "/", icon: null, tag: "x" }
const sender = () => {
  const send = createWebPushSender({ subject: "mailto:push@example.com", ...keyPair() })

  if (send === null) {
    throw new Error("Expected a sender")
  }

  return send
}
const answer: RequestListener = (_, res) => {
  res.writeHead(201).end()
}
const drip: RequestListener = (_, res) => {
  res.writeHead(201)
  setInterval(() => {
    res.write(".")
  }, 1000)
}
const silent: RequestListener = () => {
  // Never answers.
}

describe("createWebPushSender", () => {
  afterEach(() => {
    for (const server of servers.splice(0)) {
      server.closeAllConnections()
      server.close()
    }
  })

  it("returns the push service status", async () => {
    const endpoint = await listen(answer)

    expect(await sender()(target(`${endpoint}/push`), message)).toBe(201)
  })

  it("does not wait for a response body that keeps coming", async () => {
    const endpoint = await listen(drip)
    const started = Date.now()

    expect(await sender()(target(`${endpoint}/drip`), message)).toBe(201)
    expect(Date.now() - started).toBeLessThan(2000)
  })

  it("gives up on an endpoint that never answers", async () => {
    const endpoint = await listen(silent)
    const started = Date.now()

    await expect(sender()(target(`${endpoint}/silent`), message)).rejects.toThrow("timeout")
    expect(Date.now() - started).toBeLessThan(8000)
  }, 15_000)
})
