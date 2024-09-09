import type { StaticDecode } from "@sinclair/typebox"
import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { t } from "elysia"
import { DEFAULT_MIME_TYPES } from "../utils/constants"

export enum UploadChapterState {
  PENDING,
  UPLOADING,
  UPLOADED,
}

const scansSchema = t
  .Transform(
    t.Optional(
      t.Union([
        t.String({ format: "uuid" }),
        t.Array(t.String({ format: "uuid" }), { uniqueItems: true }),
      ]),
    ),
  )
  .Decode((v) => (typeof v === "string" ? [v] : v))
  .Encode((v) => v)

export const uploadChapterSchema = t.Object({
  title: t.Optional(t.String()),
  number: t.Numeric({ minimum: 0 }),
  volume: t.Optional(t.Numeric({ minimum: 0 })),
  contentRating: t.Enum(ContentRating),
  flag: t.Enum(Flag),
  language: t.Enum(Languages),
  mediaId: t.String({ format: "uuid" }),
  scanIds: scansSchema,
  files: t.Files({ maxItems: 100, maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export const uploadChaptersSchema = t.Object({
  chapters: t.Array(t.Omit(uploadChapterSchema, ["mediaId"])),
  mediaId: t.String({ format: "uuid" }),
  concurrent: t.Numeric({ minimum: 1 }),
})

export type UploadChapterInput = StaticDecode<typeof uploadChapterSchema>
export type UploadChaptersInput = StaticDecode<typeof uploadChaptersSchema>
