import { SEARCH_INDEXES } from "./client"
import { initMediasIndex } from "./medias/init-medias-index"

export * from "./medias/sync-media"

export * from "./medias/media-search-schemas"
export const indexInitializers = [{ name: SEARCH_INDEXES.MEDIAS, init: initMediasIndex }]
