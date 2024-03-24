import { ContentRating, Flag } from "@taiyomoe/db"
import { type Static, t } from "elysia"
import { DEFAULT_MIME_TYPES } from "~/utils/constants"

export const UploadChapterInput = t.Object({
  title: t.Optional(t.String()),
  number: t.Numeric({ minimum: 0 }),
  volume: t.Optional(t.Numeric({ minimum: 0 })),
  contentRating: t.Enum(ContentRating),
  flag: t.Enum(Flag),
  mediaId: t.String({ format: "uuid" }),
  scanIds: t.Array(t.String({ format: "uuid" }), { uniqueItems: true }),
  files: t.Files({ maxItems: 100, maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export type UploadChapterInput = Static<typeof UploadChapterInput>
