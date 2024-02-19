import { useSession } from "next-auth/react"
import { api } from "~/lib/trpc/client"
import { useReaderStore } from "~/stores"

export const useChapterProgression = () => {
  const { chapter } = useReaderStore()
  const { mutate } = api.history.updateProgression.useMutation()
  const { status } = useSession()

  const onPageUpdate = (newCurrentPageNumber: number) => {
    if (status !== "authenticated" || !chapter) return

    const newCurrentPageId = chapter.pages[(newCurrentPageNumber ?? 0) - 1]?.id

    mutate({
      chapterId: chapter.id,
      pageId: newCurrentPageId,
      completed: newCurrentPageNumber === chapter.pages.length,
    })
  }

  const onNextChapter = () => {
    if (status !== "authenticated" || !chapter) return

    mutate({
      chapterId: chapter.id,
      completed: true,
    })
  }

  return {
    onPageUpdate,
    onNextChapter,
  }
}
