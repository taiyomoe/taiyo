import type { StaticDecode } from "@sinclair/typebox"
import { ContentRating, Languages } from "@taiyomoe/db"
import { t } from "elysia"
import { DEFAULT_MIME_TYPES } from "../utils/constants"

export const uploadCoverSchema = t.Object({
  volume: t.Optional(t.Numeric({ minimum: 1 })),
  contentRating: t.Enum(ContentRating),
  language: t.Enum(Languages),
  mediaId: t.String({ format: "uuid" }),
  file: t.File({ maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export const uploadCoversSchema = t.Object({
  covers: t.Array(t.Omit(uploadCoverSchema, ["mediaId"], {})),
})

export type UploadCoverInput = StaticDecode<typeof uploadCoverSchema>
export type UploadCoversInput = StaticDecode<typeof uploadCoversSchema>
