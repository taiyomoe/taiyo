import type { Meilisearch } from "meilisearch"
import { type DB, type Kysely, sql } from "@taiyomoe/db"
import { isNullish } from "radashi"
import { INDEXES_BATCH_SIZE } from "../utils/constants"
import { getMediaDocument } from "./get-media-document"

export type DrainSearchOutboxDeps = {
  db: Kysely<DB>
  meili: Meilisearch
  mediasIndex: string
}

type DrainResult = {
  synced: number
  removed: number
}

export const drainSearchOutbox = async (
  deps: DrainSearchOutboxDeps,
  { limit = INDEXES_BATCH_SIZE }: { limit?: number } = {},
): Promise<DrainResult> => {
  const result = { synced: 0, removed: 0 }
  let remaining = limit

  while (remaining > 0) {
    const size = Math.min(remaining, INDEXES_BATCH_SIZE)
    const batch = await deps.db.transaction().execute(async (trx) => {
      const claimed = await trx
        .selectFrom("searchOutbox")
        .select(["id", "mediaId"])
        .orderBy("id")
        .limit(size)
        .forUpdate()
        .skipLocked()
        .execute()

      if (claimed.length === 0) {
        return { claimed: 0, synced: 0, removed: 0 }
      }

      const mediaIds = Array.from(new Set(claimed.map((row) => row.mediaId))).sort()

      for (const mediaId of mediaIds) {
        await sql`SELECT pg_advisory_xact_lock(hashtextextended(${mediaId}, 0))`.execute(trx)
      }

      const documents = await Promise.all(mediaIds.map((mediaId) => getMediaDocument(trx, mediaId)))
      const upserts = documents.filter((doc) => !isNullish(doc))
      const removals = mediaIds.filter((_, i) => isNullish(documents[i]))
      const index = deps.meili.index(deps.mediasIndex)

      if (upserts.length > 0) {
        await index.addDocuments(upserts)
      }

      if (removals.length > 0) {
        await index.deleteDocuments(removals)
      }

      await trx
        .deleteFrom("searchOutbox")
        .where(
          "id",
          "in",
          claimed.map((row) => row.id),
        )
        .execute()

      return { claimed: claimed.length, synced: upserts.length, removed: removals.length }
    })

    result.synced += batch.synced
    result.removed += batch.removed
    remaining -= batch.claimed

    if (batch.claimed < size) {
      break
    }
  }

  return result
}
