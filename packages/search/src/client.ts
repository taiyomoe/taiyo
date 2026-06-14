import { Meilisearch } from "meilisearch"
import { env } from "./env"

export const getMeiliClient = () =>
  new Meilisearch({
    host: env.MEILISEARCH_HOST,
    apiKey: env.MEILISEARCH_API_KEY,
  })

export const SEARCH_INDEXES = {
  MEDIAS: "medias",
} as const
