import type { S3Client } from "@aws-sdk/client-s3"
import type { Chapter, DB, Kysely, Selectable } from "@taiyomoe/db"
import type { ChapterTarget, Permissions } from "@taiyomoe/permissions"
import { deleteChapterPages } from "../chapter-pages"

/** Why the caller cannot withdraw the chapter, or null when they can. */
export const getWithdrawalRefusal = (can: Permissions, target: ChapterTarget) => {
  if (!can("chapter.view", target)) {
    return "NOT_FOUND" as const
  }

  if (!can("chapter.withdraw", target)) {
    return target.status === "PENDING" || target.status === "UPLOADING"
      ? ("FORBIDDEN" as const)
      : ("NOT_PENDING" as const)
  }

  return null
}

/** Deletes the chapters, and their pages once the transaction commits. */
export const withdrawChapters = async (
  {
    db,
    s3,
    s3Bucket,
    afterCommit,
  }: {
    db: Kysely<DB>
    s3: S3Client
    s3Bucket: string
    afterCommit: (cb: () => Promise<void>) => void
  },
  deleterId: string,
  chapters: ReadonlyArray<Pick<Selectable<Chapter>, "id" | "mediaId" | "pages">>,
) => {
  if (chapters.length === 0) {
    return
  }

  await db
    .updateTable("chapters")
    .set({ deletedAt: new Date(), deleterId, pages: null })
    .where(
      "id",
      "in",
      chapters.map((chapter) => chapter.id),
    )
    .execute()

  afterCommit(async () => {
    for (const chapter of chapters) {
      await deleteChapterPages({ s3, s3Bucket }, chapter)
    }
  })
}
