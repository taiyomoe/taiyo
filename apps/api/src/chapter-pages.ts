import type { S3Client } from "@aws-sdk/client-s3"
import type { Chapter, Selectable } from "@taiyomoe/db"
import { DeleteObjectsCommand, getChapterPageKey } from "@taiyomoe/s3"

export const deleteChapterPages = async (
  { s3, s3Bucket }: { s3: S3Client; s3Bucket: string },
  chapter: Pick<Selectable<Chapter>, "id" | "mediaId" | "pages">,
) => {
  const keys = (chapter.pages ?? []).map((page) =>
    getChapterPageKey(chapter.mediaId, chapter.id, page.id),
  )

  for (let start = 0; start < keys.length; start += 1000) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: s3Bucket,
        Delete: { Objects: keys.slice(start, start + 1000).map((Key) => ({ Key })) },
      }),
    )
  }
}
