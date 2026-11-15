import { config } from "@taiyomoe/config"
import { IMAGE_MIME_TYPES } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import { filetypeinfo } from "magic-bytes.js"
import { isImageMimeType } from "../utils/is-image-mime-type"

export const checkImages = (maxSizeBytes: number = config.images.maxSizeBytes) =>
  createMiddleware(async (c, next) => {
    const contentType = c.req.header("content-type")

    if (contentType?.includes("multipart/form-data") !== true) {
      return next()
    }

    const formData = await c.req.formData()

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

      const header = new Uint8Array(await value.slice(0, 100).arrayBuffer())
      const fileTypes = filetypeinfo(Array.from(header))
      const detectedMime = fileTypes.map((ft) => ft.mime).find(isImageMimeType)

      if (detectedMime === undefined) {
        return c.fail("INVALID_IMAGE", {
          path: key.split("."),
          message: `Invalid image format detected. Allowed mime types are: ${Object.keys(IMAGE_MIME_TYPES).join(", ")}`,
          detectedMimeType: fileTypes[0]?.mime ?? "unknown",
        })
      }
    }

    return next()
  })
