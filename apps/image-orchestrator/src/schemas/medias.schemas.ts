import {
  ContentRating,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaGenres,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@taiyomoe/db"
import { type Static, t } from "elysia"
import { TAG_KEYS } from "../../../../packages/constants/src/tags"
import { DEFAULT_MIME_TYPES } from "../utils/constants"

export const CreateMediaInput = t.Object({
  synopsis: t.String(),
  contentRating: t.Enum(ContentRating),
  oneShot: t.BooleanString(),
  type: t.Enum(MediaType),
  status: t.Enum(MediaStatus),
  source: t.Enum(MediaSource),
  demography: t.Enum(MediaDemography),
  countryOfOrigin: t.Enum(MediaCountryOfOrigin),
  genres: t.Array(t.Enum(MediaGenres)),
  tags: t.Array(
    t.ObjectString({
      key: t.Union(TAG_KEYS.map((tag) => t.Literal(tag))),
      isSpoiler: t.BooleanString(),
    }),
  ),
  mainTitle: t.String({ minLength: 2 }),
  mdId: t.Optional(t.String({ format: "uuid" })),
  alId: t.Optional(t.Numeric({ minimum: 30000 })),
  malId: t.Optional(t.Numeric({ minimum: 1 })),
  cover: t.File({ maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export const ImportMediaInput = t.Object({
  mdId: t.String({ format: "uuid" }),
})

export type CreateMediaInput = Static<typeof CreateMediaInput>
export type ImportMediaInput = Static<typeof ImportMediaInput>
