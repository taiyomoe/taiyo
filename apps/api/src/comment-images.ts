import { config } from "@taiyomoe/config"
import { type DB, type Kysely, sql } from "@taiyomoe/db"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { filetypeinfo } from "magic-bytes.js"
import { createHash } from "node:crypto"
import sharp, { type Metadata } from "sharp"
import { withTranscodeSlot } from "./utils/transcode-slot"

const ACCEPTED_FORMATS = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "heif",
} as const

export const COMMENT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
] as const satisfies ReadonlyArray<keyof typeof ACCEPTED_FORMATS>

export class CommentImageError extends Error {
  readonly code: "INVALID_IMAGE" | "COMMENT_IMAGE_TOO_COMPLEX"

  constructor(code: "INVALID_IMAGE" | "COMMENT_IMAGE_TOO_COMPLEX") {
    super(code)
    this.code = code
  }
}

const differenceHash = async (input: Buffer) => {
  const pixels = await sharp(input, {
    page: 0,
    limitInputPixels: config.comments.maxImageDecodedPixels,
  })
    .greyscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer()
  let hash = 0n

  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const left = pixels[row * 9 + column] ?? 0
      const right = pixels[row * 9 + column + 1] ?? 0

      hash = (hash << 1n) | (left < right ? 1n : 0n)
    }
  }

  return BigInt.asIntN(64, hash).toString()
}

export const processCommentImage = (input: Buffer) =>
  withTranscodeSlot(async () => {
    const detected = filetypeinfo(Array.from(input.subarray(0, 100)))
      .map((type) => type.mime)
      .find(
        (mime): mime is keyof typeof ACCEPTED_FORMATS =>
          mime !== undefined && mime in ACCEPTED_FORMATS,
      )

    if (detected === undefined) {
      throw new CommentImageError("INVALID_IMAGE")
    }

    const limits = {
      limitInputPixels: config.comments.maxImageDecodedPixels,
      failOn: "error",
    } as const
    let metadata: Metadata

    try {
      metadata = await sharp(input, { ...limits, animated: true }).metadata()
    } catch {
      throw new CommentImageError("INVALID_IMAGE")
    }

    if (metadata.format !== ACCEPTED_FORMATS[detected]) {
      throw new CommentImageError("INVALID_IMAGE")
    }

    const frames = metadata.pages ?? 1
    const frameHeight = metadata.pageHeight ?? metadata.height

    if (
      metadata.width > config.comments.maxImageDimension ||
      frameHeight > config.comments.maxImageDimension ||
      frames > config.comments.maxImageFrames ||
      metadata.width * frameHeight * frames > config.comments.maxImageDecodedPixels
    ) {
      throw new CommentImageError("COMMENT_IMAGE_TOO_COMPLEX")
    }

    const animated = frames > 1
    const maxDimension = animated
      ? config.comments.maxAnimatedOutputDimension
      : config.comments.maxStillOutputDimension

    try {
      const pipeline = animated
        ? sharp(input, { ...limits, animated: true })
        : sharp(input, limits).autoOrient()
      const { data, info } = await pipeline
        .resize({
          width: maxDimension,
          height: maxDimension,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp(
          animated
            ? {
                quality: config.comments.animatedImageQuality,
                effort: 3,
                ...(metadata.loop === undefined ? {} : { loop: metadata.loop }),
                ...(metadata.delay === undefined ? {} : { delay: metadata.delay }),
              }
            : { quality: config.comments.imageQuality, effort: 4 },
        )
        .toBuffer({ resolveWithObject: true })

      return {
        body: data,
        width: info.width,
        height: info.pageHeight ?? info.height,
        animated,
        byteSize: data.byteLength,
        sha256: createHash("sha256").update(input).digest("hex"),
        dhash: await differenceHash(input),
      }
    } catch {
      throw new CommentImageError("INVALID_IMAGE")
    }
  })

export const isCommentImageBlocked = async (
  db: Kysely<DB>,
  {
    sha256,
    dhash,
    width,
    height,
  }: { sha256: string; dhash: string; width: number; height: number },
) => {
  const blocked = await db
    .selectFrom("blockedCommentImages")
    .select("id")
    .where((eb) =>
      eb.or([
        eb("sha256", "=", sha256),
        sql<boolean>`bit_count("dhash"::bit(64)) between 8 and 56
          and bit_count(("dhash" # ${dhash}::bigint)::bit(64)) <= ${config.comments.blockedImageHammingDistance}
          and abs(("width"::float8 / "height") / (${width}::float8 / ${height}) - 1) <= 0.05`,
      ]),
    )
    .limit(1)
    .executeTakeFirst()

  return blocked !== undefined
}

export const getCommentImageKey = (id: string) => `comment-images/${id}.webp`

export const toCommentImage = (row: {
  id: string
  key: string
  width: number
  height: number
  animated: boolean
  uploaderId: string
}) => ({
  id: row.id,
  url: getPublicImageUrl(row.key),
  width: row.width,
  height: row.height,
  animated: row.animated,
  uploaderId: row.uploaderId,
})
