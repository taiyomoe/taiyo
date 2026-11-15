import type { ImageSource } from "@takumi-rs/core"
import { canDecode } from "@/features/og/lib/og-renderer"

const MAX_BYTES = 8 * 1024 * 1024
const TIMEOUT_MS = 4000
const PRIVATE_HOST =
  /^(?:localhost|127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$|\[?f[cd])/i
/**
 * Only public https images are fetched in production: avatars can come from
 * an OAuth provider, so a URL here is not always one Taiyō produced, and the
 * server must not be talked into reaching its own network. Development keeps
 * the local object storage reachable.
 */
const isFetchable = (url: URL) =>
  import.meta.env.DEV
    ? url.protocol === "http:" || url.protocol === "https:"
    : url.protocol === "https:" && !PRIVATE_HOST.test(url.hostname)
/**
 * Reads a body up to `limit` bytes, or null past it: the response's length header can be absent
 * or describe a compressed body that decodes to far more.
 */
const readAtMost = async (body: ReadableStream<Uint8Array>, limit: number) => {
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  let next = await reader.read()

  while (!next.done) {
    size += next.value.byteLength

    if (size > limit) {
      await reader.cancel()

      return null
    }

    chunks.push(next.value)
    next = await reader.read()
  }

  const data = new Uint8Array(size)

  chunks.reduce((offset, chunk) => {
    data.set(chunk, offset)

    return offset + chunk.byteLength
  }, 0)

  return data
}

/**
 * Downloads an image for a card, or null when it is missing, slow, too large
 * not an image or one the renderer cannot read: a card always renders, with or
 * without its pictures.
 */
export const fetchOgImage = async (src: string | null | undefined) => {
  if (src === null || src === undefined || src === "" || !URL.canParse(src)) {
    return null
  }

  if (!isFetchable(new URL(src))) {
    return null
  }

  try {
    const response = await fetch(src, {
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const length = Number(response.headers.get("content-length") ?? 0)

    if (
      !response.ok ||
      response.body === null ||
      length > MAX_BYTES ||
      !(response.headers.get("content-type") ?? "").startsWith("image/")
    ) {
      return null
    }

    const data = await readAtMost(response.body, MAX_BYTES)

    if (data === null) {
      return null
    }

    const image: ImageSource = { src, data }

    return (await canDecode(image)) ? image : null
  } catch {
    return null
  }
}
