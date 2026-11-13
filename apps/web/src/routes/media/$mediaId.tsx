import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { getRichTextSummary } from "@/components/rich-text/rich-text-document"
import {
  CHAPTER_SORTS,
  mediaChapterFacetsQueryOptions,
  mediaChaptersQueryOptions,
} from "@/features/chapters/api/chapters"
import { commentsQueryOptions } from "@/features/comments/api/comments"
import { libraryEntryQueryOptions, readingProgressQueryOptions } from "@/features/media/api/library"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { MediaPage } from "@/features/media/components/media-page/media-page"
import { getMainTitle, getSynopsis } from "@/features/media/lib/media-labels"
import { CHAPTERS_PER_PAGE, MEDIA_TABS } from "@/features/media/lib/media-page"
import { pageOgMeta } from "@/features/og/lib/og-meta"
import { relatedMediasQueryOptions } from "@/features/recommendations/api/recommendations"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  tab: z.enum(MEDIA_TABS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
  sort: z.enum(CHAPTER_SORTS).optional().catch(undefined),
  lang: z
    .string()
    .regex(/^[a-z]{2}(?:_[a-z]{2})?$/)
    .optional()
    .catch(undefined),
  volume: z.string().trim().min(1).max(32).optional().catch(undefined),
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  unread: z.boolean().optional().catch(undefined),
  comment: z.uuid().optional().catch(undefined),
  coverVolume: z.string().trim().min(1).max(32).optional().catch(undefined),
  coverLang: z
    .string()
    .regex(/^[a-z]{2}(?:_[a-z]{2})?$/)
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute("/media/$mediaId")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params: { mediaId }, deps }) => {
    const contentRatings = getContentRatings(context.session)
    const filters = { contentRatings, language: deps.lang }
    const summary = context.queryClient
      .query(mediaQueryOptions(mediaId))
      .then((data) => ({
        title: getMainTitle(data.titles),
        synopsis: getRichTextSummary(getSynopsis(data.synopsis)),
      }))
      .catch(() => ({ title: null, synopsis: null }))
    const prefetch = Promise.all(
      [
        context.queryClient.query(mediaChapterFacetsQueryOptions(mediaId, filters)),
        ...((deps.tab ?? "chapters") === "chapters"
          ? [
              context.queryClient.query(
                mediaChaptersQueryOptions(mediaId, {
                  ...filters,
                  page: deps.page ?? 1,
                  perPage: CHAPTERS_PER_PAGE,
                  sort: deps.sort ?? "newest",
                  volume: deps.volume,
                  search: deps.q,
                  unread: context.session !== null && deps.unread === true,
                }),
              ),
            ]
          : []),
        ...(deps.tab === "related"
          ? [context.queryClient.query(relatedMediasQueryOptions(mediaId, contentRatings))]
          : []),
        ...(deps.tab === "comments"
          ? [
              context.queryClient.infiniteQuery(
                commentsQueryOptions({ type: "MEDIA", id: mediaId }, "newest"),
              ),
            ]
          : []),
        ...(context.session === null
          ? []
          : [
              context.queryClient.query(libraryEntryQueryOptions(mediaId)),
              context.queryClient.query(readingProgressQueryOptions(mediaId, contentRatings)),
            ]),
      ].map((query) => query.catch(noop)),
    )

    if (import.meta.env.SSR) {
      await prefetch
    }

    return summary
  },
  head: ({ loaderData, params }) => {
    const title = loaderData?.title ?? null

    return {
      meta: [
        {
          title: title === null ? m.media_meta_title_fallback() : m.media_meta_title({ title }),
        },
        ...pageOgMeta({
          kind: "media",
          id: params.mediaId,
          title,
          description: loaderData?.synopsis,
        }),
      ],
    }
  },
  component: MediaPage,
})
