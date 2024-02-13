import { notFound } from "next/navigation"
import { BulkUpdateChapterVolumesForm } from "~/components/forms/chapters/bulk-update-volumes/BulkUpdateChapterVolumesForm"
import { db } from "~/lib/server/db"

type Props = {
  params: { mediaId: string }
}

export default async function Page({ params }: Props) {
  const media = await db.media.findUnique({
    select: { id: true },
    where: { id: params.mediaId, deletedAt: null },
  })

  if (!media) {
    return notFound()
  }

  const chapters = await db.mediaChapter.findMany({
    where: { mediaId: params.mediaId, deletedAt: null },
    orderBy: { number: "asc" },
  })

  return <BulkUpdateChapterVolumesForm chapters={chapters} />
}
