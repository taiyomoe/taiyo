import { once } from "node:events"
import { createServer, type Server, type ServerResponse } from "node:http"
import { gzipSync } from "node:zlib"
import { afterAll, beforeAll, describe, expect, test } from "vitest"
import { fetchOgImage } from "@/features/og/lib/og-images"

const MEBIBYTE = 1024 * 1024
const CHUNK = Buffer.alloc(64 * 1024)
const sent = new Map<string, number>()
let server: Server
let base = ""
/** Writes `total` bytes as fast as the client reads them, and records how many went out. */
const stream = async (res: ServerResponse, name: string, total: number) => {
  let written = 0

  res.on("close", () => {
    sent.set(name, written)
  })

  while (written < total && !res.destroyed) {
    written += CHUNK.byteLength

    if (!res.write(CHUNK)) {
      await Promise.race([once(res, "drain"), once(res, "close")])
    }
  }

  res.end()
}

describe("fetchOgImage", () => {
  beforeAll(async () => {
    server = createServer((req, res) => {
      if (req.url === "/chunked") {
        res.writeHead(200, { "content-type": "image/png" })
        void stream(res, "chunked", 32 * MEBIBYTE)

        return
      }

      const body = gzipSync(Buffer.alloc(32 * MEBIBYTE))

      res.writeHead(200, {
        "content-type": "image/png",
        "content-encoding": "gzip",
        "content-length": String(body.byteLength),
      })
      res.end(body)
    })
    server.listen(0, "127.0.0.1")
    await once(server, "listening")
    const address = server.address()

    if (address === null || typeof address === "string") {
      throw new Error("The test server has no port")
    }

    base = `http://127.0.0.1:${address.port}`
  })

  afterAll(() => {
    server.close()
  })

  test("stops reading a body with no length once it passes the size cap", async () => {
    expect(await fetchOgImage(`${base}/chunked`)).toBeNull()
    await expect.poll(() => sent.get("chunked")).toBeDefined()
    expect(sent.get("chunked")).toBeLessThan(16 * MEBIBYTE)
  })

  test("refuses a compressed body that decodes past the size cap", async () => {
    expect(await fetchOgImage(`${base}/gzip`)).toBeNull()
  })
})
