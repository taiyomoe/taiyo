import { noop } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import { isNotFoundError } from "@/components/boundaries/not-found-page"
import { getRichTextSummary } from "@/components/rich-text/rich-text-document"
import {
  CHAPTER_SORTS,
  mediaChapterFacetsQueryOptions,
  mediaChaptersQueryOptions,
} from "@/features/chapters/api/chapters"
import { commentsQueryOptions } from "@/features/comments/api/comments"
import { libraryEntryQueryOptions, readingProgressQueryOptions } from "@/features/media/api/library"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { MediaNotFoundPage } from "@/features/media/components/media-page/media-not-found-page"
import { MediaPage } from "@/features/media/components/media-page/media-page"
import { getMainTitle, getSynopsis } from "@/features/media/lib/media-labels"
import { CHAPTERS_PER_PAGE, MEDIA_TABS } from "@/features/media/lib/media-page"
import { pageOgMeta } from "@/features/og/lib/og-meta"
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
    const media = context.queryClient.query(mediaQueryOptions(mediaId))
    const prefetch = Promise.all(
      [
        media,
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

    return media
      .then((data) => ({
        title: getMainTitle(data.titles),
        synopsis: getRichTextSummary(getSynopsis(data.synopsis)),
      }))
      .catch((error: unknown) => {
        if (isNotFoundError(error, "MEDIA_NOT_FOUND")) {
          throw notFound()
        }

        return { title: null, synopsis: null }
      })
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
  notFoundComponent: MediaNotFoundPage,
})
