import type { DB } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import { DeleteObjectsCommand, type S3Client } from "@taiyomoe/s3"
import { sql, type Kysely } from "kysely"

export type CommentImageReaperDeps = { db: Kysely<DB>; s3: S3Client; s3Bucket: string }

export const reapOrphanCommentImages = async (
  { db, s3, s3Bucket }: CommentImageReaperDeps,
  now = new Date(),
) => {
  const cutoff = new Date(now.getTime() - config.comments.orphanImageHours * 60 * 60 * 1000)
  const orphans = await db
    .deleteFrom("commentImages as ci")
    .where(
      sql<boolean>`"ci"."createdAt" < (${cutoff.toISOString()}::timestamptz at time zone 'UTC')`,
    )
    .where((eb) =>
      eb.not(
        eb.or([
          eb.exists(
            eb
              .selectFrom("commentImageUsages as cu")
              .select("cu.imageId")
              .whereRef("cu.imageId", "=", "ci.id"),
          ),
          eb.exists(
            eb
              .selectFrom("commentImageFavorites as f")
              .select("f.imageId")
              .whereRef("f.imageId", "=", "ci.id"),
          ),
          eb.exists(
            eb
              .selectFrom("blockedCommentImages as b")
              .select("b.imageId")
              .whereRef("b.imageId", "=", "ci.id"),
          ),
        ]),
      ),
    )
    .returning(["ci.id", "ci.key", "ci.uploaderId", "ci.removedAt"])
    .execute()
  const keys = orphans
    .filter((image) => image.removedAt === null)
    .map((image) => ({ Key: image.key }))

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

  return orphans.map(({ id, uploaderId }) => ({ id, uploaderId }))
}
