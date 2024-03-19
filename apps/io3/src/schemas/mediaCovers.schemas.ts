import { ContentRating, Languages } from "@taiyomoe/db"
import { Static, t } from "elysia"
import { DEFAULT_MIME_TYPES } from "~/utils/constants"

export const CreateCoverInput = t.Object({
  volume: t.Optional(t.Numeric({ minimum: 1 })),
  isMainCover: t.BooleanString(),
  contentRating: t.Enum(ContentRating),
  language: t.Enum(Languages),
  mediaId: t.String({ format: "uuid" }),
  file: t.File({ maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export type CreateCoverInput = Static<typeof CreateCoverInput>
