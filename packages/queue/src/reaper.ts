import type { DB } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import { DeleteObjectsCommand, type S3Client } from "@taiyomoe/s3"
import { sql, type Kysely } from "kysely"
import { chapterUploadManifestSchema } from "./types"

export type ReaperDeps = { db: Kysely<DB>; s3: S3Client; s3Bucket: string }

export const reapStaleChapterUploads = async (
  { db, s3, s3Bucket }: ReaperDeps,
  now = new Date(),
) => {
  const cutoff = new Date(now.getTime() - config.images.staleUploadReapHours * 60 * 60 * 1000)
  const abandoned = await db
    .updateTable("chapters")
    .set({ deletedAt: sql<Date>`CURRENT_TIMESTAMP`, deleterId: sql.ref("uploaderId") })
    .where("status", "in", ["UPLOADING", "PENDING"])
    .where("pages", "is", null)
    .where("isExternal", "=", false)
    .where("deletedAt", "is", null)
    .where(sql<boolean>`"createdAt" < ${cutoff}::timestamptz`)
    .returning("id")
    .execute()
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
    return { reaped: 0, abandoned: abandoned.length }
  }

  const keys = stale.flatMap((t) =>
    chapterUploadManifestSchema.parse(t.payload).pages.map((p) => ({ Key: p.stagingKey })),
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
      .catch(() => {})
  }

  await db
    .deleteFrom("tasks")
    .where(
      "id",
      "in",
      stale.map((t) => t.id),
    )
    .execute()

  return { reaped: stale.length, abandoned: abandoned.length }
}
