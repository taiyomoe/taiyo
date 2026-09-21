import { config } from "@taiyomoe/config"
import type { DB } from "@taiyomoe/db"
import { DeleteObjectsCommand, type S3Client } from "@taiyomoe/s3"
import { sql, type Kysely } from "kysely"
import type { ChapterUploadManifest } from "./types"

export type ReaperDeps = { db: Kysely<DB>; s3: S3Client; s3Bucket: string }

/**
 * Cleans up the two staging-leak sources:
 *   1. sessions opened but never finalized  → Task stuck PENDING
 *   2. jobs that exhausted their retries     → Task FAILED (worker only deletes
 *      staging on SUCCESS, so failed jobs leave their staged originals behind)
 * Deletes the staged objects AND the Task rows once older than
 * config.images.staleUploadReapHours. Pure + injectable; pass `now` in tests.
 */
export const reapStaleChapterUploads = async (
  { db, s3, s3Bucket }: ReaperDeps,
  now = new Date(),
) => {
  const cutoff = new Date(now.getTime() - config.images.staleUploadReapHours * 60 * 60 * 1000)
  const stale = await db
    .selectFrom("tasks")
    .selectAll()
    .where("type", "=", "UPLOAD_CHAPTER")
    .where(
      sql<boolean>`(
        (status = 'PENDING' AND "createdAt" < ${cutoff}::timestamptz)
        OR (status = 'FAILED' AND "updatedAt" < ${cutoff}::timestamptz)
      )`,
    )
    .execute()

  if (stale.length === 0) {
    return { reaped: 0 }
  }

  const keys = stale.flatMap((t) =>
    (t.payload as ChapterUploadManifest).pages.map((p) => ({ Key: p.stagingKey })),
  )

  // DeleteObjects caps at 1000 keys/call; chunk. Deleting absent keys is a no-op.
  for (let i = 0; i < keys.length; i += 1000) {
    await s3
      .send(
        new DeleteObjectsCommand({
          Bucket: s3Bucket,
          Delete: { Objects: keys.slice(i, i + 1000) },
        }),
      )
      .catch(() => {
        // The lifecycle rule is the backstop; don't fail the reap on a delete hiccup.
      })
  }

  await db
    .deleteFrom("tasks")
    .where(
      "id",
      "in",
      stale.map((t) => t.id),
    )
    .execute()

  return { reaped: stale.length }
}
