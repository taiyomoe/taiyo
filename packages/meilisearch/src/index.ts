import type {
  ChaptersIndexItem,
  MediasIndexItem,
  ScansIndexItem,
  UsersIndexItem,
} from "@taiyomoe/types"
import type { Meilisearch } from "meilisearch"
import { MeiliSearch } from "meilisearch"
import { env } from "../env"

const globalForMeilisearch = globalThis as unknown as {
  meilisearch: Meilisearch | undefined
}

export const meilisearch =
  globalForMeilisearch.meilisearch ??
  new MeiliSearch({
    host: env.NEXT_PUBLIC_MEILISEARCH_URL,
    apiKey: env.MEILISEARCH_ADMIN_KEY,
  })

export const meilisearchIndexes = {
  medias: meilisearch.index<MediasIndexItem>("medias"),
  scans: meilisearch.index<ScansIndexItem>("scans"),
  chapters: meilisearch.index<ChaptersIndexItem>("chapters"),
  users: meilisearch.index<UsersIndexItem>("users"),
}

if (process.env.NODE_ENV !== "production")
  globalForMeilisearch.meilisearch = meilisearch
