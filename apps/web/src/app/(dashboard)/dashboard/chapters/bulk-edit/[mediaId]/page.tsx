import { db } from "@taiyomoe/db"
import { notFound } from "next/navigation"
import { BulkUpdateChaptersActionsTabs } from "./_components/bulk-update-chapters-actions-tabs"

type Props = {
  params: Promise<{ mediaId: string }>
}

export default async function Page({ params }: Props) {
  const { mediaId } = await params
  const media = await db.media.findUnique({
    select: { id: true },
    where: { id: mediaId, deletedAt: null },
  })

  if (!media) {
    return notFound()
  }

  const chapters = await db.mediaChapter.findMany({
    include: { scans: { select: { id: true } } },
    where: { mediaId: mediaId, deletedAt: null },
    orderBy: { number: "asc" },
  })

  return (
    <BulkUpdateChaptersActionsTabs
      chapters={chapters.map((c) => ({
        ...c,
        scanIds: c.scans.flatMap((s) => s.id),
      }))}
    />
  )
}
