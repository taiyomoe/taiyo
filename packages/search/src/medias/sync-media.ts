import type { DB, Kysely } from "@taiyomoe/db"
import { meiliClient, SEARCH_INDEXES } from "../client"
import { getMediaDocument } from "./get-media-document"

export const syncMedia = async (db: Kysely<DB>, mediaId: string) => {
  const doc = await getMediaDocument(db, mediaId)

  if (doc === null) {
    await meiliClient.index(SEARCH_INDEXES.MEDIAS).deleteDocument(mediaId)

    return
  }

  await meiliClient.index(SEARCH_INDEXES.MEDIAS).addDocuments([doc])
}
