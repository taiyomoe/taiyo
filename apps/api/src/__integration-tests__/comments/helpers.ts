import type { Hono } from "hono"
import sharp from "sharp"
import type { CommentResponse } from "../../utils/comments"
import { api } from "../helpers/request"

export type RootComment = CommentResponse & { replies: CommentResponse[] }

export type CommentImage = {
  id: string
  url: string
  width: number
  height: number
  animated: boolean
}

export const expectSuccess = <T>(res: {
  status: number
  body: { success: true; data: T } | { success: false; code: string }
}) => {
  if (!res.body.success) {
    throw new Error(`Expected success, got ${res.status}: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}

export const postComment = async (
  app: Hono,
  headers: Record<string, string>,
  target: { type: string; id: string },
  content = "Hello there",
) =>
  expectSuccess(
    await api<CommentResponse>(app, "/comments", {
      method: "POST",
      headers,
      json: { targetType: target.type, targetId: target.id, content },
    }),
  )

export const postReply = async (
  app: Hono,
  headers: Record<string, string>,
  commentId: string,
  content = "A reply",
) =>
  expectSuccess(
    await api<CommentResponse>(app, `/comments/${commentId}/replies`, {
      method: "POST",
      headers,
      json: { content },
    }),
  )

export const listComments = async (
  app: Hono,
  target: { type: string; id: string },
  { headers, query = "" }: { headers?: Record<string, string>; query?: string } = {},
) => {
  const res = await api<RootComment[]>(
    app,
    `/comments?targetType=${target.type}&targetId=${target.id}${query}`,
    headers === undefined ? {} : { headers },
  )

  if (!res.body.success) {
    throw new Error(`Expected success, got ${res.status}: ${JSON.stringify(res.body)}`)
  }

  const meta = res.body.meta ?? {}

  return {
    data: res.body.data,
    meta: {
      nextCursor: typeof meta.nextCursor === "string" ? meta.nextCursor : null,
      total: typeof meta.total === "number" ? meta.total : -1,
    },
  }
}

const patterned = (seed: number) => {
  const size = 64
  const pixels = Buffer.alloc(size * size * 3)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const value = Math.floor(
        128 +
          127 * Math.sin((x * (seed + 2)) / 18 + seed) * Math.cos((y * (seed + 3)) / 21 + seed * 2),
      )
      const offset = (y * size + x) * 3

      pixels[offset] = value
      pixels[offset + 1] = 255 - value
      pixels[offset + 2] = (x + y + seed * 40) % 256
    }
  }

  return sharp(pixels, { raw: { width: size, height: size, channels: 3 } })
}

export const patternedImage = async (
  seed: number,
  format: "png" | "jpeg" = "png",
  name = `pattern-${seed}.${format}`,
) => {
  const buffer = await (
    format === "png" ? patterned(seed).png() : patterned(seed).jpeg()
  ).toBuffer()

  return new File([new Uint8Array(buffer)], name, { type: `image/${format}` })
}

export const animatedGif = async () => {
  const frames = await Promise.all([1, 2, 3].map((seed) => patterned(seed).png().toBuffer()))
  const buffer = await sharp(frames, { join: { animated: true } })
    .gif({ delay: [100, 100, 100], loop: 0 })
    .toBuffer()

  return new File([new Uint8Array(buffer)], "anim.gif", { type: "image/gif" })
}

export const uploadImage = async (app: Hono, headers: Record<string, string>, file: File) => {
  const form = new FormData()

  form.set("file", file)

  return api<CommentImage>(app, "/comment-images", { method: "POST", headers, form })
}
