import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { chapterReaderQueryOptions } from "@/features/reader/api/reader"
import { ReaderPage } from "@/features/reader/components/reader-page"
import { chapterQueryOptions } from "@/features/uploads/api/submissions"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/chapters/$chapterId/")({
  validateSearch: searchSchema,
  shouldReload: false,
  loader: async ({ context, params: { chapterId } }) => {
    const chapter = context.queryClient.query(chapterQueryOptions(chapterId))
    const media = chapter.then((data) => context.queryClient.query(mediaQueryOptions(data.mediaId)))
    const prefetch = Promise.all([
      media,
      context.queryClient.query(
        chapterReaderQueryOptions(chapterId, getContentRatings(context.session)),
      ),
    ]).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }

    const title = await Promise.all([chapter, media])
      .then(([chapterData, mediaData]) =>
        m.reader_meta_title({
          chapter: getChapterLabel(chapterData),
          media: getMainTitle(mediaData.titles) ?? m.media_untitled(),
        }),
      )
      .catch(() => null)

    return { title }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ?? m.reader_meta_title_fallback() },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReaderPage,
})
