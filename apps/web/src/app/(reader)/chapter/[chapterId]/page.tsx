import { notFound } from "next/navigation"
import { api } from "~/trpc/server"
import { PopulateAtoms } from "../../_components/PopulateAtoms"
import { MediaChapterPage } from "./_components/MediaChapterPage"

type Props = {
  params: Promise<{ chapterId: string }>
}

export default async function Page({ params }: Props) {
  const { chapterId } = await params
  const mediaChapter = await api.chapters.getById(chapterId)

  if (!mediaChapter) {
    return notFound()
  }

  return (
    <>
      <PopulateAtoms mediaChapter={mediaChapter} />
      <MediaChapterPage />
    </>
  )
}
