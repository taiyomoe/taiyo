import type { DB, Kysely } from "@taiyomoe/db"
import type { Meilisearch } from "meilisearch"
import { SEARCH_INDEXES } from "../client"
import { getMediaDocument } from "./get-media-document"

export const syncMedia = async (
  { db, meili }: { db: Kysely<DB>; meili: Meilisearch },
  mediaId: string,
) => {
  const doc = await getMediaDocument(db, mediaId)

  if (doc === null) {
    await meili.index(SEARCH_INDEXES.MEDIAS).deleteDocument(mediaId)

    return
  }

  await meili.index(SEARCH_INDEXES.MEDIAS).addDocuments([doc])
}
