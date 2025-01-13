import { useSession } from "@taiyomoe/auth/client"
import { useReaderStore } from "~/stores"
import { api } from "~/trpc/react"

export const useChapterProgression = () => {
  const { chapter } = useReaderStore()
  const { mutate } = api.users.updateProgression.useMutation()
  const { data: session } = useSession()

  const onPageUpdate = (newCurrentPageNumber: number) => {
    if (!session || !chapter) return

    const newCurrentPageId = chapter.pages[(newCurrentPageNumber ?? 0) - 1]?.id

    mutate({
      chapterId: chapter.id,
      pageId: newCurrentPageId,
      completed: newCurrentPageNumber === chapter.pages.length,
    })
  }

  const onNextChapter = () => {
    if (!session || !chapter) return

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
