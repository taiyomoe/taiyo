import { notFound } from "next/navigation"

import { UpdateMediaChapterForm } from "~/components/forms/chapters/UpdateMediaChapterForm"
import { db } from "~/lib/server/db"

type Props = {
  params: { chapterId: string }
}

export default async function Page({ params }: Props) {
  const chapter = await db.mediaChapter.findFirst({
    include: { scans: true },
    where: { id: params.chapterId, deletedAt: null },
  })

  if (!chapter) {
    return notFound()
  }

  return <UpdateMediaChapterForm chapter={chapter} />
}
