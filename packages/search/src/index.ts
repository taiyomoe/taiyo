import type { DB, Kysely } from "@taiyomoe/db"
import type { Meilisearch } from "meilisearch"
import { SEARCH_INDEXES } from "./client"
import { initMediasIndex } from "./medias/init-medias-index"

export { getMeiliClient, SEARCH_INDEXES } from "./client"

export type { Meilisearch } from "meilisearch"

export * from "./medias/sync-media"

export * from "./medias/init-medias-index"

export * from "./medias/media-search-schemas"

export * from "./medias/search-medias"

export const indexInitializers = [
  {
    name: SEARCH_INDEXES.MEDIAS,
    init: (deps: { db: Kysely<DB>; meili: Meilisearch }) =>
      initMediasIndex({ ...deps, mediasIndex: SEARCH_INDEXES.MEDIAS }),
  },
]
