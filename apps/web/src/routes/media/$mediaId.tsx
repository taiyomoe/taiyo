import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import {
  CHAPTER_SORTS,
  mediaChapterFacetsQueryOptions,
  mediaChaptersQueryOptions,
} from "@/features/chapters/api/chapters"
import { libraryEntryQueryOptions, readingProgressQueryOptions } from "@/features/media/api/library"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { CHAPTERS_PER_PAGE } from "@/features/media/components/media-chapters"
import { MEDIA_TABS, MediaPage } from "@/features/media/components/media-page"
import { getMainTitle } from "@/features/media/lib/media-labels"
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

    const title = await media.then((data) => getMainTitle(data.titles)).catch(() => null)

    return { title }
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? null

    return {
      meta: [
        {
          title: title === null ? m.media_meta_title_fallback() : m.media_meta_title({ title }),
        },
      ],
    }
  },
  component: Media,
})

function Media() {
  const { session } = Route.useRouteContext()
  const { mediaId } = Route.useParams()

  return <MediaPage mediaId={mediaId} user={session?.user ?? null} />
}
