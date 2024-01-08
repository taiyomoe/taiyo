import { notFound } from "next/navigation"
import { BulkUpdateChapterScansForm } from "~/components/forms/chapters/bulk-update-scans/BulkUpdateChapterScansForm"
import { db } from "~/lib/server/db"
import { MediaChapterService } from "~/lib/services"

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
    include: { scans: { select: { id: true } } },
    where: { mediaId: params.mediaId, deletedAt: null },
    orderBy: { number: "asc" },
  })

  return (
    <BulkUpdateChapterScansForm
      chapters={chapters.map((c) => ({
        ...c,
        scanIds: c.scans.flatMap((s) => s.id),
      }))}
    />
  )
}
