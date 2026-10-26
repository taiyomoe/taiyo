import { config } from "@taiyomoe/config"
import {
  DeleteObjectsCommand,
  getBannerKey,
  getCoverKey,
  PutObjectCommand,
  type S3Client,
} from "@taiyomoe/s3"
import sharp from "sharp"

export type ImageExtension = "gif" | "jpg"

export type ImageTarget =
  | { kind: "cover"; mediaId: string; id: string }
  | { kind: "banner"; mediaId: string; id: string }
  | { kind: "staff"; staffId: string }

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

export const putImage = async (
  deps: ImageStoreDeps,
  target: ImageTarget,
  file: File,
  { replaces }: { replaces?: string | null } = {},
): Promise<{ key: string; extension: ImageExtension }> => {
  const input = Buffer.from(await file.arrayBuffer())
  const { format } = await sharp(input).metadata()
  const { body, contentType, extension } =
    format === "gif"
      ? {
          body: await sharp(input, { animated: true }).gif().toBuffer(),
          contentType: "image/gif",
          extension: "gif" as const,
        }
      : {
          body: await sharp(input).rotate().jpeg({ quality: config.images.quality }).toBuffer(),
          contentType: "image/jpeg",
          extension: "jpg" as const,
        }
  let key: string

  if (target.kind === "staff") {
    key = `staffs/${target.staffId}/${crypto.randomUUID()}.${extension}`
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
