import { Meilisearch } from "meilisearch"
import { env } from "./env"

declare global {
  var meilisearch: Meilisearch | undefined
}

export const meiliClient =
  globalThis.meilisearch ??
  new Meilisearch({
    host: env.MEILISEARCH_HOST,
    apiKey: env.MEILISEARCH_API_KEY,
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.meilisearch = meiliClient
}

export const SEARCH_INDEXES = {
  MEDIAS: "medias",
} as const
