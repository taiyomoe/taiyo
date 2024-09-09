import type { StaticDecode } from "@sinclair/typebox"
import { ContentRating } from "@taiyomoe/db"
import { t } from "elysia"
import { DEFAULT_MIME_TYPES } from "../utils/constants"

export const uploadBannerSchema = t.Object({
  contentRating: t.Enum(ContentRating),
  mediaId: t.String({ format: "uuid" }),
  file: t.File({ maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export type UploadBannerInput = StaticDecode<typeof uploadBannerSchema>
