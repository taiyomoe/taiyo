import { config } from "@taiyomoe/config"
import { createMiddleware } from "hono/factory"
import { filetypeinfo } from "magic-bytes.js"
import sharp from "sharp"

const VALID_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const

type ValidImageMime = (typeof VALID_IMAGE_MIMES)[number]

const MIME_TO_FORMAT: Record<ValidImageMime, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

/**
 * Middleware that validates and processes images from FormData.
 *
 * For each image found:
 * - Validates file size against the limit
 * - Validates magic bytes to confirm it's a real image
 * - Converts to JPEG (unless it's a GIF)
 * - Applies quality compression
 * - Removes all metadata
 *
 * The FormData is updated with the processed images in-place.
 */
export const checkImages = (maxSizeBytes: number = config.images.maxSizeBytes) =>
  createMiddleware(async (c, next) => {
    const contentType = c.req.header("content-type")

    if (!contentType?.includes("multipart/form-data")) {
      await next()

      return
    }

    const formData = await c.req.formData()

    for (const [key, value] of formData.entries()) {
      if (!(value instanceof File)) {
        continue
      }

      // Check if file might be an image based on mime type
      if (!value.type.startsWith("image/")) {
        continue
      }

      // Check file size
      if (value.size > maxSizeBytes) {
        return c.fail("IMAGE_TOO_LARGE", {
          path: key.split("."),
          maxSize: `${(maxSizeBytes / 1024 / 1024).toFixed(2)} MB`,
          actualSize: `${(value.size / 1024 / 1024).toFixed(2)} MB`,
        })
      }

      const buffer = Buffer.from(await value.arrayBuffer())

      // Validate image format via magic bytes
      const fileTypes = filetypeinfo(Array.from(buffer.subarray(0, 100)))
      const detectedType = fileTypes.find((ft) => ft.mime && VALID_IMAGE_MIMES.includes(ft.mime))

      if (!detectedType?.mime) {
        return c.fail("INVALID_IMAGE", {
          path: key.split("."),
          message: `Invalid image format detected. Allowed mime types are: ${VALID_IMAGE_MIMES.join(", ")}`,
          detectedMimeType: fileTypes[0]?.mime ?? "unknown",
        })
      }

      const detectedMime = detectedType.mime as ValidImageMime
      const detectedFormat = MIME_TO_FORMAT[detectedMime]

      // Process the image and strip all metadata
      const { processedBuffer, mimeType, extension } = await (async () => {
        if (detectedFormat === "gif") {
          // For GIFs, re-encode to strip metadata while preserving animation
          const processedBuffer = await sharp(buffer, { animated: true }).gif().toBuffer()

          return {
            processedBuffer,
            mimeType: "image/gif",
            extension: "gif",
          }
        }

        // Convert to JPEG with quality setting
        const processedBuffer = await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF orientation before stripping
          .jpeg({ quality: config.images.quality })
          .toBuffer()

        return {
          processedBuffer,
          mimeType: "image/jpeg",
          extension: "jpg",
        }
      })()

      // Create a new File with the processed image
      const originalName = value.name || "image"
      const baseName = originalName.replace(/\.[^/.]+$/, "")
      const processedFile = new File(
        [new Uint8Array(processedBuffer)],
        `${baseName}.${extension}`,
        { type: mimeType },
      )

      // Update formData with processed image
      formData.set(key, processedFile)
    }

    await next()
  })
