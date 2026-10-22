import * as stylex from "@stylexjs/stylex"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { noop, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, Navigate, redirect, useNavigate } from "@tanstack/react-router"
import { Suspense, useDeferredValue, useState } from "react"
import { range } from "remeda"
import { z } from "zod"
import type { ContentRating } from "@/lib/settings"
import { ChapterList, ChapterListSkeleton } from "@/components/chapters/chapter-list"
import { CountryFlag } from "@/components/chapters/flags"
import { Cover, CoverSkeleton } from "@/components/media/cover"
import { PagePagination } from "@/components/pagination/page-pagination"
import { sceneFont } from "@/components/scene/scene.stylex"
import { ContentFilterEmpty } from "@/components/settings/content-filter"
import { AppShell } from "@/components/shell/app-shell"
import { api } from "@/lib/api"
import { unwrapEnvelope } from "@/lib/envelope"
import {
  type LatestChapter,
  type LatestMediaUpdate,
  latestMediaUpdatesQueryOptions,
} from "@/lib/queries/chapters"
import { getContentRatings, useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const FIRST_PAGE = 1
const LATEST_MEDIAS_PER_PAGE = 10
const MAX_PER_PAGE = 100
const searchSchema = z.object({
  page: z.coerce.number().int().min(FIRST_PAGE).max(100_000).optional().catch(undefined),
})
const styles = stylex.create({
  page: {
    gap: "1.5rem",
    paddingBlock: "2rem",
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2rem" },
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  back: {
    color: colors.mutedForeground,
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", "@media (width >= 48rem)": "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  cards: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})
const DESKTOP = "@media (width >= 48rem)"
const cardStyles = stylex.create({
  card: {
    padding: { [DESKTOP]: "0.875rem", default: "0.625rem" },
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "start",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    columnGap: { [DESKTOP]: "1.25rem", default: "0.875rem" },
    display: "grid",
    gridTemplateColumns: { [DESKTOP]: "7rem minmax(0, 1fr)", default: "4.5rem minmax(0, 1fr)" },
  },
  coverLink: {
    borderRadius: {
      [DESKTOP]: `calc(${radius.xl} - 0.875rem)`,
      default: `calc(${radius.xl} - 0.625rem)`,
    },
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: { [DESKTOP]: "sticky", default: "static" },
    top: "calc(var(--navbar-height) + 1rem)",
  },
  cover: {
    borderRadius: {
      [DESKTOP]: `calc(${radius.xl} - 0.875rem)`,
      default: `calc(${radius.xl} - 0.625rem)`,
    },
    width: "100%",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minWidth: 0,
    paddingBottom: "0.625rem",
  },
  title: {
    margin: 0,
    overflow: "hidden",
    color: {
      default: colors.foreground,
      ":has(> a:hover)": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontFamily: font.heading,
    fontSize: { [DESKTOP]: "1.125rem", default: "1rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    textOverflow: "ellipsis",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  titleLink: {
    borderRadius: radius.sm,
    color: "inherit",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "none",
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
    paddingRight: "0.125em",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "0.25rem",
  },
  skeletonTitle: {
    height: "1.125rem",
    width: "min(18rem, 70%)",
  },
})

export const Route = createFileRoute("/latest")({
  head: () => ({ meta: [{ title: m.latest_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in" })
    }

    return { session: context.session }
  },
  loaderDeps: ({ search: { page } }) => ({ page: page ?? FIRST_PAGE }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient
      .query(
        latestMediaUpdatesQueryOptions(
          getContentRatings(context.session),
          page,
          LATEST_MEDIAS_PER_PAGE,
        ),
      )
      .catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: function Latest() {
    const { session } = Route.useRouteContext()
    const { page } = Route.useLoaderDeps()

    return (
      <AppShell user={session.user}>
        <div sx={styles.page}>
          <div sx={styles.header}>
            <Button
              aria-label={m.latest_back()}
              render={<Link to="/" />}
              size="icon"
              sx={styles.back}
              variant="ghost"
            >
              <ArrowLeft />
            </Button>
            <h1 sx={styles.heading}>{m.home_latest_title()}</h1>
          </div>
          <Suspense
            fallback={
              <div sx={styles.cards}>
                {range(0, 4).map((index) => (
                  <div key={index} aria-hidden sx={cardStyles.card}>
                    <CoverSkeleton sx={cardStyles.cover} />
                    <div sx={cardStyles.body}>
                      <div sx={cardStyles.header}>
                        <Skeleton sx={cardStyles.skeletonTitle} />
                      </div>
                      <ChapterListSkeleton count={3} />
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <LatestPageContent page={page} />
          </Suspense>
        </div>
      </AppShell>
    )
  },
})

function LatestPageContent({ page }: { page: number }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data } = useSuspenseQuery(
    latestMediaUpdatesQueryOptions(contentRatings, page, LATEST_MEDIAS_PER_PAGE),
  )
  const navigate = useNavigate()
  const pageCount = Math.ceil(data.meta.total / LATEST_MEDIAS_PER_PAGE)

  if (page > Math.max(pageCount, 1)) {
    return (
      <Navigate replace search={{ page: pageCount > 1 ? pageCount : undefined }} to="/latest" />
    )
  }

  if (data.data.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.latest_empty_description()}
        title={m.latest_empty_title()}
      />
    )
  }

  return (
    <>
      <div sx={styles.cards}>
        {data.data.map((media) => (
          <LatestMediaCard key={media.id} contentRatings={contentRatings} media={media} />
        ))}
      </div>
      <PagePagination
        renderLink={(target) => (
          <Link search={{ page: target === 1 ? undefined : target }} to="/latest" />
        )}
        onJump={(target) => {
          void navigate({ search: { page: target === 1 ? undefined : target }, to: "/latest" })
        }}
        page={page}
        pageCount={pageCount}
      />
    </>
  )
}

type LatestMediaCardProps = {
  media: LatestMediaUpdate
  contentRatings: readonly ContentRating[]
}

function LatestMediaCard({ media, contentRatings }: LatestMediaCardProps) {
  const [expanded, setExpanded] = useState(false)
  const all = useQuery({
    queryKey: ["chapters", "latest", { mediaId: media.id, contentRatings }],
    queryFn: async ({ signal }) => {
      const loaded: LatestChapter[] = []

      for (let page = 1; ; page++) {
        const { data, meta } = await unwrapEnvelope(
          await api.chapters.latest.$get(
            {
              query: {
                contentRating: contentRatings.join(","),
                mediaId: media.id,
                page: String(page),
                perPage: String(MAX_PER_PAGE),
              },
            },
            { init: { signal } },
          ),
        )

        loaded.push(...data)

        if (loaded.length >= meta.total || data.length === 0) {
          return loaded
        }
      }
    },
    enabled: expanded,
  })
  const chapters = expanded && all.data !== undefined ? all.data : media.chapters
  const hasMore = media.chapterCount > media.chapters.length

  return (
    <article sx={cardStyles.card}>
      <Link
        aria-label={media.title ?? m.media_untitled()}
        params={{ mediaId: media.id }}
        tabIndex={-1}
        to="/media/$mediaId"
        {...stylex.props(cardStyles.coverLink)}
      >
        <Cover src={media.coverUrl} sx={cardStyles.cover} />
      </Link>
      <div sx={cardStyles.body}>
        <div sx={cardStyles.header}>
          <CountryFlag country={media.countryOfOrigin} />
          <h2 sx={cardStyles.title}>
            <Link
              params={{ mediaId: media.id }}
              to="/media/$mediaId"
              {...stylex.props(cardStyles.titleLink)}
            >
              {media.title ?? <span sx={cardStyles.untitled}>{m.media_untitled()}</span>}
            </Link>
          </h2>
        </div>
        <ChapterList chapters={chapters} />
        {hasMore ? (
          <div sx={cardStyles.footer}>
            <Button
              loading={expanded && all.isFetching && all.data === undefined}
              onClick={() => {
                setExpanded(!expanded)
              }}
              size="sm"
              variant="ghost"
            >
              {expanded && all.data !== undefined
                ? m.latest_show_less()
                : m.latest_show_all({ count: media.chapterCount })}
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}
