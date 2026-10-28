import { db } from "@taiyomoe/db"
import { notFound } from "next/navigation"
import { BulkUpdateChaptersActionsTabs } from "./_components/bulk-update-chapters-actions-tabs"

type Props = {
  params: Promise<{ mediaId: string }>
}

export default async function Page(props: Props) {
  const params = await props.params
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
    <BulkUpdateChaptersActionsTabs
      chapters={chapters.map((c) => ({
        ...c,
        scanIds: c.scans.flatMap((s) => s.id),
      }))}
    />
  )
}
