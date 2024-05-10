import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { type Static, t } from "elysia"
import { DEFAULT_MIME_TYPES } from "../utils/constants"

export enum UploadChapterState {
  PENDING,
  UPLOADING,
  UPLOADED,
}

export const uploadChapterSchema = t.Object({
  title: t.Optional(t.String()),
  number: t.Numeric({ minimum: 0 }),
  volume: t.Optional(t.Numeric({ minimum: 0 })),
  contentRating: t.Enum(ContentRating),
  flag: t.Enum(Flag),
  language: t.Enum(Languages),
  mediaId: t.String({ format: "uuid" }),
  scanIds: t.Array(t.String({ format: "uuid" }), { uniqueItems: true }),
  files: t.Files({ maxItems: 100, maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export const uploadChaptersSchema = t.Object({
  chapters: t.Array(
    t.Intersect([
      t.Omit(uploadChapterSchema, ["mediaId"]),
      t.Object({ state: t.Enum(UploadChapterState) }),
    ]),
  ),
  mediaId: t.String({ format: "uuid" }),
  concurrent: t.Numeric({ minimum: 1 }),
})

export type UploadChapterInput = Static<typeof uploadChapterSchema>
export type UploadChaptersInput = Static<typeof uploadChaptersSchema>
