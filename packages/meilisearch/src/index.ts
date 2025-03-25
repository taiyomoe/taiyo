import type {
  GroupsIndexItem,
  MediasIndexItem,
  UsersIndexItem,
} from "@taiyomoe/types"
import type { Meilisearch } from "meilisearch"
import { MeiliSearch } from "meilisearch"
import { env } from "./env"

const globalForMeilisearch = globalThis as unknown as {
  meilisearch: Meilisearch | undefined
}

export const rawMeilisearchClient =
  globalForMeilisearch.meilisearch ??
  new MeiliSearch({
    host: env.NEXT_PUBLIC_MEILISEARCH_URL,
    apiKey: env.MEILISEARCH_ADMIN_KEY,
  })

export const meilisearchClient = {
  medias: rawMeilisearchClient.index<MediasIndexItem>("medias"),
  groups: rawMeilisearchClient.index<GroupsIndexItem>("groups"),
  users: rawMeilisearchClient.index<UsersIndexItem>("users"),
}

if (process.env.NODE_ENV !== "production")
  globalForMeilisearch.meilisearch = rawMeilisearchClient
