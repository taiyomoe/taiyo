import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import type { MediaChapter } from "@/features/chapters/api/chapters"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

type ChaptersPage = { data: MediaChapter[] }

type ChapterRef = Pick<MediaChapter, "id" | "number">

const isChaptersPage = (value: unknown): value is ChaptersPage =>
  typeof value === "object" && value !== null && "data" in value && Array.isArray(value.data)

function useReadMarkerCache(mediaId: string) {
  const queryClient = useQueryClient()
  const queryKey = ["medias", mediaId, "chapters"]

  return {
    patch: async (read: (chapter: MediaChapter) => boolean) => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueriesData({ queryKey })

      queryClient.setQueriesData({ queryKey }, (page) =>
        isChaptersPage(page)
          ? { ...page, data: page.data.map((chapter) => ({ ...chapter, read: read(chapter) })) }
          : page,
      )

      return previous
    },
    restore: (previous: Array<[QueryKey, unknown]> | undefined) => {
      for (const [key, data] of previous ?? []) {
        queryClient.setQueryData(key, data)
      }
    },
    refresh: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["progress", mediaId] }),
      ]),
  }
}

export function useSetChapterRead(mediaId: string) {
  const cache = useReadMarkerCache(mediaId)

  return useMutation({
    mutationFn: async ({ chapter, read }: { chapter: ChapterRef; read: boolean }) => {
      const endpoint = api.chapters[":id"].read
      const response = read
        ? await endpoint.$put({ param: { id: chapter.id } })
        : await endpoint.$delete({ param: { id: chapter.id } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: ({ chapter, read }) =>
      cache.patch((item) => (item.number === chapter.number ? read : item.read)),
    onError: (_error, _variables, previous) => {
      cache.restore(previous)
      toastManager.add({ title: m.media_read_marker_failed(), type: "error" })
    },
    onSettled: cache.refresh,
  })
}

export function useMarkMediaRead(mediaId: string) {
  const cache = useReadMarkerCache(mediaId)

  return useMutation({
    mutationFn: async () => unwrap(await api.medias[":id"].read.$put({ param: { id: mediaId } })),
    onMutate: () => cache.patch(() => true),
    onError: (_error, _variables, previous) => {
      cache.restore(previous)
    },
    onSettled: cache.refresh,
  })
}
