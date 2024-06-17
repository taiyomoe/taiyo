import type { StaticDecode } from "@sinclair/typebox"
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
import { t } from "elysia"
import { DEFAULT_MIME_TYPES } from "../utils/constants"

const stringifiedDateSchema = t
  .Transform(t.String())
  .Decode((v) => new Date(v))
  .Encode((v) => v.toISOString().split("T")[0]!)

export const createMediaSchema = t.Object({
  startDate: t.Optional(stringifiedDateSchema),
  endDate: t.Optional(stringifiedDateSchema),
  synopsis: t.String(),
  contentRating: t.Enum(ContentRating),
  oneShot: t.BooleanString(),
  type: t.Enum(MediaType),
  status: t.Enum(MediaStatus),
  source: t.Enum(MediaSource),
  demography: t.Enum(MediaDemography),
  countryOfOrigin: t.Enum(MediaCountryOfOrigin),
  flag: t.Enum(Flag),
  genres: t.Optional(t.Array(t.Enum(MediaGenres))),
  tags: t.Optional(
    t.Array(
      t.ObjectString({
        key: t.Union(TAG_KEYS.map((tag) => t.Literal(tag))),
        isSpoiler: t.BooleanString(),
      }),
    ),
  ),
  mainTitle: t.String({ minLength: 2 }),
  mdId: t.Optional(t.String({ format: "uuid" })),
  alId: t.Numeric({ minimum: 30000 }),
  malId: t.Optional(t.Numeric({ minimum: 1 })),
  cover: t.File({ maxSize: "10m", type: DEFAULT_MIME_TYPES }),
})

export const importMediaSchema = t.Object({
  mdId: t.String({ format: "uuid" }),
})

export type CreateMediaInput = StaticDecode<typeof createMediaSchema>
export type ImportMediaInput = StaticDecode<typeof importMediaSchema>
