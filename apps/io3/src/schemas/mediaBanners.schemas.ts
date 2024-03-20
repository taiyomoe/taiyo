import { ContentRating } from "@taiyomoe/db"
import { type Static, t } from "elysia"
import { DEFAULT_MIME_TYPES } from "~/utils/constants"

export const CreateBannerInput = t.Object({
  contentRating: t.Enum(ContentRating),
  mediaId: t.String({ format: "uuid" }),
  file: t.File({ maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export type CreateBannerInput = Static<typeof CreateBannerInput>
