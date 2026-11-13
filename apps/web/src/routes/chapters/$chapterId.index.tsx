import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { pageOgMeta } from "@/features/og/lib/og-meta"
import { chapterReaderQueryOptions } from "@/features/reader/api/reader"
import { ReaderPage } from "@/features/reader/components/reader-page"
import { chapterQueryOptions } from "@/features/uploads/api/submissions"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
  comment: z.uuid().optional().catch(undefined),
})

export const Route = createFileRoute("/chapters/$chapterId/")({
  validateSearch: searchSchema,
  shouldReload: false,
  loader: async ({ context, params: { chapterId }, location }) => {
    const chapter = context.queryClient.query(chapterQueryOptions(chapterId))
    const media = chapter.then((data) => context.queryClient.query(mediaQueryOptions(data.mediaId)))
    const reader = context.queryClient.query(
      chapterReaderQueryOptions(chapterId, getContentRatings(context.session)),
    )
    const prefetch = Promise.all([media, reader]).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }

    const chapterData = await chapter.catch(() => null)
    const mediaData = await media.catch(() => null)
    const history = import.meta.env.SSR ? await reader.then((data) => data.history, noop) : null
    const pages = chapterData?.pages ?? []
    const resumed =
      history === undefined || history === null || history.completed
        ? -1
        : pages.findIndex((page) => page.id === history.pageId)
    const requestedPage = searchSchema.parse(location.search).page
    const firstPage =
      requestedPage === undefined
        ? pages[Math.max(resumed, 0)]
        : pages[Math.min(requestedPage, pages.length) - 1]
    const labels =
      chapterData === null || mediaData === null
        ? null
        : {
            chapter: getChapterLabel(chapterData),
            media: getMainTitle(mediaData.titles) ?? m.media_untitled(),
          }

    return {
      title: labels === null ? null : m.reader_meta_title(labels),
      heading: labels === null ? null : `${labels.chapter} · ${labels.media}`,
      firstPageUrl: firstPage?.url ?? null,
    }
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: loaderData?.title ?? m.reader_meta_title_fallback() },
      { name: "robots", content: "noindex" },
      ...pageOgMeta({ kind: "chapters", id: params.chapterId, title: loaderData?.heading ?? null }),
    ],
    links:
      loaderData?.firstPageUrl === undefined || loaderData.firstPageUrl === null
        ? []
        : [{ rel: "preload", as: "image", href: loaderData.firstPageUrl, fetchPriority: "high" }],
  }),
  component: ReaderPage,
})
