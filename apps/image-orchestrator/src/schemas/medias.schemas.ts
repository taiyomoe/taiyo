import { TAG_KEYS } from "@taiyomoe/constants"
import {
  ContentRating,
  Flag,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaGenres,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@taiyomoe/db"
import { type Static, t } from "elysia"
import { DEFAULT_MIME_TYPES } from "../utils/constants"

export const createMediaSchema = t.Object({
  synopsis: t.String(),
  contentRating: t.Enum(ContentRating),
  oneShot: t.BooleanString(),
  type: t.Enum(MediaType),
  status: t.Enum(MediaStatus),
  source: t.Enum(MediaSource),
  demography: t.Enum(MediaDemography),
  countryOfOrigin: t.Enum(MediaCountryOfOrigin),
  flag: t.Enum(Flag),
  genres: t.Array(t.Enum(MediaGenres)),
  tags: t.Array(
    t.ObjectString({
      key: t.Union(TAG_KEYS.map((tag) => t.Literal(tag))),
      isSpoiler: t.BooleanString(),
    }),
  ),
  mainTitle: t.String({ minLength: 2 }),
  mdTracker: t.Optional(t.String({ format: "uuid" })),
  alTracker: t.Optional(t.Numeric({ minimum: 30000 })),
  malTracker: t.Optional(t.Numeric({ minimum: 1 })),
  cover: t.File({ maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export const importMediaSchema = t.Object({
  mdId: t.String({ format: "uuid" }),
})

export type CreateMediaInput = Static<typeof createMediaSchema>
export type ImportMediaInput = Static<typeof importMediaSchema>
