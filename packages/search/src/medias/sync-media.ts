import type { DB, Kysely } from "@taiyomoe/db"
import type { Meilisearch } from "meilisearch"
import { getMediaDocument } from "./get-media-document"

export const syncMedia = async (
  { db, meili, mediasIndex }: { db: Kysely<DB>; meili: Meilisearch; mediasIndex: string },
  mediaId: string,
) => {
  const doc = await getMediaDocument(db, mediaId)

  if (doc === null) {
    await meili.index(mediasIndex).deleteDocument(mediaId)

    return
  }

  await meili.index(mediasIndex).addDocuments([doc])
}
