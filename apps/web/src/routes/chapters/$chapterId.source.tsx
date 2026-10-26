import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { chapterGroupsQueryOptions } from "@/features/chapters/api/chapters"
import { ChapterSourcePage } from "@/features/chapters/components/chapter-source/chapter-source-page"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { chapterQueryOptions } from "@/features/uploads/api/submissions"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/chapters/$chapterId/source")({
  loader: async ({ context, params: { chapterId } }) => {
    const prefetch = Promise.all([
      context.queryClient
        .query(chapterQueryOptions(chapterId))
        .then((chapter) => context.queryClient.query(mediaQueryOptions(chapter.mediaId))),
      context.queryClient.query(chapterGroupsQueryOptions(chapterId)),
    ]).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  head: () => ({ meta: [{ title: m.leave_meta_title() }] }),
  component: ChapterSourcePage,
})
