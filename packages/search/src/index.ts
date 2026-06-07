import { SEARCH_INDEXES } from "./client"
import { initMediasIndex } from "./medias/init-medias-index"

export { SEARCH_INDEXES, meiliClient } from "./client"

export * from "./medias/sync-media"

export * from "./medias/media-search-schemas"

export * from "./medias/search-medias"

export const indexInitializers = [{ name: SEARCH_INDEXES.MEDIAS, init: initMediasIndex }]
