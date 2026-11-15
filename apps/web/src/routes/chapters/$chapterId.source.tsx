import { noop } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { isNotFoundError } from "@/components/boundaries/not-found-page"
import { chapterGroupsQueryOptions } from "@/features/chapters/api/chapters"
import { ChapterNotFoundPage } from "@/features/chapters/components/chapter-not-found-page"
import { ChapterSourcePage } from "@/features/chapters/components/chapter-source/chapter-source-page"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { chapterQueryOptions } from "@/features/uploads/api/submissions"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/chapters/$chapterId/source")({
  loader: async ({ context, params: { chapterId } }) => {
    const chapter = context.queryClient.query(chapterQueryOptions(chapterId))
    const prefetch = Promise.all([
      chapter.then((data) => context.queryClient.query(mediaQueryOptions(data.mediaId))),
      context.queryClient.query(chapterGroupsQueryOptions(chapterId)),
    ]).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }

    await chapter.catch((error: unknown) => {
      if (isNotFoundError(error, "CHAPTER_NOT_FOUND")) {
        throw notFound()
      }
    })
  },
  head: () => ({ meta: [{ title: m.leave_meta_title() }] }),
  component: ChapterSourcePage,
  notFoundComponent: ChapterNotFoundPage,
})
