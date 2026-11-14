import { config } from "@taiyomoe/config"
import {
  DeleteObjectsCommand,
  getBannerKey,
  getCoverKey,
  PutObjectCommand,
  type S3Client,
} from "@taiyomoe/s3"
import sharp, { type Sharp } from "sharp"
import type { ImageCrop } from "./utils/image-crop"
import { withTranscodeSlot } from "./utils/transcode-slot"

export type ImageExtension = "gif" | "jpg"

export type ImageTarget =
  | { kind: "cover"; mediaId: string; id: string }
  | { kind: "banner"; mediaId: string; id: string }
  | { kind: "staff"; staffId: string }
  | { kind: "avatar"; userId: string }
  | { kind: "profileBanner"; userId: string }

export class ImageTooComplexError extends Error {
  constructor() {
    super("IMAGE_TOO_COMPLEX")
  }
}

const decodeLimits = { limitInputPixels: config.images.maxDecodedPixels } as const

export type ImageStoreDeps = {
  s3: S3Client
  s3Bucket: string
  afterCommit: (cb: () => Promise<void>) => void
  onRollback: (cb: () => Promise<void>) => void
}

const deleteKeys = async ({ s3, s3Bucket }: ImageStoreDeps, keys: string[]) => {
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: s3Bucket,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    }),
  )
}

type CropRequest = { area: ImageCrop; width: number; height: number }

/**
 * Turns the crop's fractions of the transformed image into a pixel rectangle,
 * clamped so rounding can never step outside the image.
 */
const toPixels = (area: ImageCrop, width: number, height: number) => {
  const left = Math.min(Math.max(Math.round(area.x * width), 0), width - 1)
  const top = Math.min(Math.max(Math.round(area.y * height), 0), height - 1)

  return {
    left,
    top,
    width: Math.max(Math.min(Math.round(area.width * width), width - left), 1),
    height: Math.max(Math.min(Math.round(area.height * height), height - top), 1),
  }
}
const mirror = (image: Sharp, area: ImageCrop) => image.flip(area.flipY).flop(area.flipX)
// Each stage is materialised so the next one sees the real dimensions: libvips
// rounds the bounding box of an arbitrary rotation its own way.
const cropStill = async (input: Buffer, { area, width, height }: CropRequest) => {
  const oriented = await mirror(sharp(input, decodeLimits).autoOrient(), area).png().toBuffer()
  const rotated = await sharp(oriented)
    .rotate(area.rotation, { background: "#000" })
    .png()
    .toBuffer({ resolveWithObject: true })

  return sharp(rotated.data)
    .extract(toPixels(area, rotated.info.width, rotated.info.height))
    .resize(width, height, { fit: "cover" })
}
const cropAnimated = async (input: Buffer, { area, width, height }: CropRequest) => {
  const metadata = await sharp(input, { ...decodeLimits, animated: true }).metadata()
  const rect = toPixels(area, metadata.width, metadata.pageHeight ?? metadata.height)

  if (!area.flipY) {
    return sharp(input, { ...decodeLimits, animated: true })
      .flop(area.flipX)
      .extract(rect)
      .resize(width, height, { fit: "cover" })
  }

  // libvips stores the frames as one tall strip, so flipping it vertically
  // would also play the animation backwards: flip each frame on its own.
  const frames = await Promise.all(
    Array.from({ length: metadata.pages ?? 1 }, (_, page) =>
      sharp(input, { ...decodeLimits, page })
        .flip()
        .flop(area.flipX)
        .extract(rect)
        .resize(width, height, { fit: "cover" })
        .png()
        .toBuffer(),
    ),
  )

  return sharp(frames, { join: { animated: true } }).gif({
    ...(metadata.delay === undefined ? {} : { delay: metadata.delay }),
    ...(metadata.loop === undefined ? {} : { loop: metadata.loop }),
  })
}

export const putImage = async (
  deps: ImageStoreDeps,
  target: ImageTarget,
  file: File,
  {
    replaces,
    crop,
  }: {
    replaces?: string | null
    crop?: { area: ImageCrop; width: number; height: number }
  } = {},
): Promise<{ key: string; extension: ImageExtension }> => {
  const input = Buffer.from(await file.arrayBuffer())
  const metadata = await sharp(input, { ...decodeLimits, animated: true }).metadata()
  const frames = metadata.format === "gif" ? (metadata.pages ?? 1) : 1
  const framePixels = metadata.width * (metadata.pageHeight ?? metadata.height)
  const outputPixels = crop === undefined ? framePixels : crop.width * crop.height

  // A few kilobytes of GIF can hold hundreds of frames, each decoded and re-encoded at the
  // output size: bound the work by its pixels, not by the upload's bytes.
  if (
    frames > config.images.maxFrames ||
    Math.max(framePixels, outputPixels) * frames > config.images.maxDecodedPixels
  ) {
    throw new ImageTooComplexError()
  }

  const { body, contentType, extension } = await withTranscodeSlot(async () =>
    metadata.format === "gif"
      ? {
          body: await (
            crop === undefined
              ? sharp(input, { ...decodeLimits, animated: true })
              : await cropAnimated(input, crop)
          )
            .gif()
            .toBuffer(),
          contentType: "image/gif",
          extension: "gif" as const,
        }
      : {
          body: await (
            crop === undefined ? sharp(input, decodeLimits).rotate() : await cropStill(input, crop)
          )
            .jpeg({ quality: config.images.quality })
            .toBuffer(),
          contentType: "image/jpeg",
          extension: "jpg" as const,
        },
  )
  let key: string

  if (target.kind === "staff") {
    key = `staffs/${target.staffId}/${crypto.randomUUID()}.${extension}`
  } else if (target.kind === "avatar") {
    key = `users/${target.userId}/avatars/${crypto.randomUUID()}.${extension}`
  } else if (target.kind === "profileBanner") {
    key = `users/${target.userId}/banners/${crypto.randomUUID()}.${extension}`
  } else if (target.kind === "cover") {
    key = getCoverKey(target.mediaId, `${target.id}.${extension}`)
  } else {
    key = getBannerKey(target.mediaId, `${target.id}.${extension}`)
  }

  await deps.s3.send(
    new PutObjectCommand({ Bucket: deps.s3Bucket, Key: key, Body: body, ContentType: contentType }),
  )

  deps.onRollback(() => deleteKeys(deps, [key]))

  if (replaces !== undefined && replaces !== null && replaces !== key) {
    deps.afterCommit(() => deleteKeys(deps, [replaces]))
  }

  return { key, extension }
}

/** Deletes a stored image once the surrounding transaction commits. */
export const removeImage = (deps: ImageStoreDeps, key: string) => {
  deps.afterCommit(() => deleteKeys(deps, [key]))
}
