import { SEARCH_INDEXES } from "./client"
import { initMediasIndex } from "./medias/init-medias-index"

export { getMeiliClient, SEARCH_INDEXES } from "./client"

export type { Meilisearch } from "meilisearch"

export * from "./medias/sync-media"

export * from "./medias/media-search-schemas"

export * from "./medias/search-medias"

export const indexInitializers = [{ name: SEARCH_INDEXES.MEDIAS, init: initMediasIndex }]
