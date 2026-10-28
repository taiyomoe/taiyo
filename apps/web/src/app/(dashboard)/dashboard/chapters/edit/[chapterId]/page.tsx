import { db } from "@taiyomoe/db"
import { notFound } from "next/navigation"
import { UpdateChapterForm } from "~/components/forms/chapters/update/update-chapter-form"

type Props = {
  params: Promise<{ chapterId: string }>
}

export default async function Page(props: Props) {
  const params = await props.params
  const chapter = await db.mediaChapter.findFirst({
    include: { scans: true },
    where: { id: params.chapterId, deletedAt: null },
  })

  if (!chapter) {
    return notFound()
  }

  return <UpdateChapterForm chapter={chapter} />
}
