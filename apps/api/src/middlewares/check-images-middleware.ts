import { config } from "@taiyomoe/config"
import { IMAGE_MIME_TYPES } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import { filetypeinfo } from "magic-bytes.js"
import sharp from "sharp"
import { isImageMimeType } from "../utils/is-image-mime-type"

// Walks a dot-separated FormData key (e.g. "covers.0.file") into the nested
// object that validateFormData built and replaces the leaf. We need this
// because handlers read processed files from `c.var.formData`, not from the
// underlying FormData object; without this write the original (unprocessed)
// File ref persists and the route uploads raw user bytes.
const setByPath = (root: unknown, key: string, value: File) => {
  const segments = key.split(".")
  const leaf = segments.pop()
  let cur = root

  for (const segment of segments) {
    if (cur === null || typeof cur !== "object") {
      return
    }

    cur = Reflect.get(cur, segment)
  }

  if (leaf !== undefined && cur !== null && typeof cur === "object") {
    Reflect.set(cur, leaf, value)
  }
}

export const checkImages = (maxSizeBytes: number = config.images.maxSizeBytes) =>
  createMiddleware(async (c, next) => {
    const contentType = c.req.header("content-type")

    if (contentType?.includes("multipart/form-data") !== true) {
      return next()
    }

    const formData = await c.req.formData()
    const validated: unknown = c.get("formData")

    for (const [key, value] of formData.entries()) {
      if (!(value instanceof File)) {
        continue
      }

      if (!value.type.startsWith("image/")) {
        continue
      }

      if (value.size > maxSizeBytes) {
        return c.fail("IMAGE_TOO_LARGE", {
          path: key.split("."),
          maxSize: `${(maxSizeBytes / 1024 / 1024).toFixed(2)} MB`,
          actualSize: `${(value.size / 1024 / 1024).toFixed(2)} MB`,
        })
      }

      const buffer = Buffer.from(await value.arrayBuffer())
      const fileTypes = filetypeinfo(Array.from(buffer.subarray(0, 100)))
      const detectedMime = fileTypes.map((ft) => ft.mime).find(isImageMimeType)

      if (detectedMime === undefined) {
        return c.fail("INVALID_IMAGE", {
          path: key.split("."),
          message: `Invalid image format detected. Allowed mime types are: ${Object.keys(IMAGE_MIME_TYPES).join(", ")}`,
          detectedMimeType: fileTypes[0]?.mime ?? "unknown",
        })
      }

      const detectedFormat = IMAGE_MIME_TYPES[detectedMime]
      const { processedBuffer, mimeType, extension } = await (async () => {
        if (detectedFormat === "gif") {
          const gifBuffer = await sharp(buffer, { animated: true }).gif().toBuffer()

          return {
            processedBuffer: gifBuffer,
            mimeType: "image/gif",
            extension: "gif",
          }
        }

        const jpegBuffer = await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF orientation before stripping
          .jpeg({ quality: config.images.quality })
          .toBuffer()

        return {
          processedBuffer: jpegBuffer,
          mimeType: "image/jpeg",
          extension: "jpg",
        }
      })()
      const originalName = value.name || "image"
      const baseName = originalName.replace(/\.[^/.]+$/, "")
      const processedFile = new File(
        [new Uint8Array(processedBuffer)],
        `${baseName}.${extension}`,
        { type: mimeType },
      )

      formData.set(key, processedFile)
      setByPath(validated, key, processedFile)
    }

    return next()
  })
