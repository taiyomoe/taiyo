import { instantMeiliSearch } from "@meilisearch/instant-meilisearch"
import { env } from "~/env"

const { searchClient } = instantMeiliSearch(
  env.NEXT_PUBLIC_MEILISEARCH_URL,
  env.NEXT_PUBLIC_MEILISEARCH_PUBLIC_KEY,
)

export const meiliClient = searchClient
