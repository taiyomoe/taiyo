import type { MediaSimilarityItem } from "@taiyomoe/db"
import { type DB, type Kysely, sql } from "@taiyomoe/db"
import { setImmediate as yieldToEventLoop } from "node:timers/promises"
import { generateSimilarities } from "./engine"
import { loadEngineInput } from "./load"

const WRITE_BATCH_SIZE = 500
const YIELD_EVERY = 50
const EVENT_RETENTION_DAYS = 180
const writeSimilarities = async (
  db: Kysely<DB>,
  batch: ReadonlyArray<[mediaId: string, items: MediaSimilarityItem[]]>,
) => {
  const result = await db
    .insertInto("mediaSimilarities")
    .values(batch.map(([mediaId, items]) => ({ mediaId, items: JSON.stringify(items) })))
    .onConflict((oc) =>
      oc
        .column("mediaId")
        .doUpdateSet((eb) => ({
          items: eb.ref("excluded.items"),
          computedAt: eb.ref("excluded.computedAt"),
        }))
        .where(sql<boolean>`"mediaSimilarities"."items" is distinct from excluded."items"`),
    )
    .executeTakeFirst()

  return Number(result.numInsertedOrUpdatedRows ?? 0)
}

export const refreshMediaSimilarities = async ({ db }: { db: Kysely<DB> }) => {
  const startedAt = performance.now()
  const input = await loadEngineInput(db)
  let batch: Array<[mediaId: string, items: MediaSimilarityItem[]]> = []
  let written = 0
  let computed = 0

  for (const entry of generateSimilarities(input)) {
    batch.push(entry)
    computed++

    if (computed % YIELD_EVERY === 0) {
      await yieldToEventLoop()
    }

    if (batch.length === WRITE_BATCH_SIZE) {
      written += await writeSimilarities(db, batch)
      batch = []
    }
  }

  if (batch.length > 0) {
    written += await writeSimilarities(db, batch)
  }

  const cutoff = sql<Date>`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - make_interval(days => ${EVENT_RETENTION_DAYS})`

  await Promise.all([
    db
      .deleteFrom("mediaSimilarities")
      .where(
        "mediaId",
        "not in",
        db.selectFrom("medias").select("id").where("deletedAt", "is", null),
      )
      .execute(),
    db.deleteFrom("recommendationImpressions").where("createdAt", "<", cutoff).execute(),
    db.deleteFrom("recommendationClicks").where("createdAt", "<", cutoff).execute(),
  ])

  return {
    medias: input.medias.length,
    interactions: input.interactions.length,
    written,
    durationMs: Math.round(performance.now() - startedAt),
  }
}
