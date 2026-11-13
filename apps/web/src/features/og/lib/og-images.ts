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
      length > MAX_BYTES ||
      !(response.headers.get("content-type") ?? "").startsWith("image/")
    ) {
      return null
    }

    const image: ImageSource = { src, data: new Uint8Array(await response.arrayBuffer()) }

    return image.data.byteLength <= MAX_BYTES && (await canDecode(image)) ? image : null
  } catch {
    return null
  }
}
