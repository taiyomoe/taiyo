import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { ChapterSourcePage } from "@/components/chapters/chapter-source-page"
import { chapterGroupsQueryOptions } from "@/lib/queries/chapters"
import { mediaQueryOptions } from "@/lib/queries/medias"
import { chapterQueryOptions } from "@/lib/queries/submissions"
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
  component: ChapterSource,
})

function ChapterSource() {
  const { session } = Route.useRouteContext()
  const { chapterId } = Route.useParams()

  return <ChapterSourcePage chapterId={chapterId} user={session?.user ?? null} />
}
