import { describe, expect, test } from "vitest"
import { createMangaDexClient, MangaDexDownloadTooLargeError } from "../client"

const URL = "https://uploads.mangadex.org/data/hash/1.png"
const clientFor = (respond: () => Response) => {
  let calls = 0
  const client = createMangaDexClient({
    fetch: () => {
      calls++

      return Promise.resolve(respond())
    },
    sleep: () => Promise.resolve(),
  })

  return { client, calls: () => calls }
}

describe("download", () => {
  test("returns a body under the limit", async () => {
    const { client } = clientFor(() => new Response(new Uint8Array(10)))

    expect((await client.download(URL, { maxBytes: 10 })).byteLength).toBe(10)
  })

  test("refuses a declared length over the limit without retrying", async () => {
    const { client, calls } = clientFor(
      () => new Response(new Uint8Array(11), { headers: { "Content-Length": "11" } }),
    )

    await expect(client.download(URL, { maxBytes: 10 })).rejects.toBeInstanceOf(
      MangaDexDownloadTooLargeError,
    )
    expect(calls()).toBe(1)
  })

  test("refuses a streamed body that grows over the limit", async () => {
    const stream = () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(6))
          controller.enqueue(new Uint8Array(6))
          controller.close()
        },
      })
    const { client } = clientFor(() => new Response(stream()))

    await expect(client.download(URL, { maxBytes: 10 })).rejects.toBeInstanceOf(
      MangaDexDownloadTooLargeError,
    )
  })
})
