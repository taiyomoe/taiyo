import { instantMeiliSearch } from "@meilisearch/instant-meilisearch"
import type { SearchedMedia } from "@taiyomoe/types"
import instantsearch from "instantsearch.js"
import { env } from "~/lib/env.mjs"

const { searchClient } = instantMeiliSearch(
  env.NEXT_PUBLIC_MEILISEARCH_URL,
  env.NEXT_PUBLIC_MEILISEARCH_PUBLIC_KEY,
)

export const meiliClient = instantsearch<SearchedMedia>({
  searchClient,
  indexName: "medias",
})

meiliClient.start()
