import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, createFileRoute, getRouteApi } from "@tanstack/react-router"
import { Book } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, consts, font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { z } from "zod"

import { EmptyState } from "@/components/app/empty-state"
import { PagePagination } from "@/components/app/page-pagination"
import { ChapterList, ChapterRow } from "@/components/media/chapter-row"
import { MediaCover } from "@/components/media/media-cover"
import {
  contentRatingBadge,
  getMainCover,
  getMainTitle,
  getSynopsis,
  mediaDemographyLabel,
  mediaStatusLabel,
  mediaTypeLabel,
  staffRoleLabel,
} from "@/components/media/media-labels"
import { rethrowAsNotFound } from "@/lib/not-found"
import { mediaChaptersQueryOptions, mediaQueryOptions } from "@/lib/queries/medias"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const CHAPTERS_PER_PAGE = 50
const FIRST_PAGE = 1
const searchSchema = z.object({
  page: z.coerce.number().int().min(FIRST_PAGE).optional(),
})

export const Route = createFileRoute("/_app/titles/$mediaId")({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page } }) => ({ page }),
  context: ({ params: { mediaId }, deps: { page } }) => ({
    mediaQueryOptions: mediaQueryOptions(mediaId),
    chaptersQueryOptions: mediaChaptersQueryOptions(mediaId, {
      page: page ?? FIRST_PAGE,
      perPage: CHAPTERS_PER_PAGE,
    }),
  }),
  loader: async ({ context }) => {
    void context.queryClient.prefetchQuery(context.chaptersQueryOptions)

    const media = await context.queryClient
      .ensureQueryData(context.mediaQueryOptions)
      .catch(rethrowAsNotFound(["MEDIA_NOT_FOUND", "VALIDATION_ERROR"]))

    return { title: getMainTitle(media.titles) }
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: m.media_meta_title({ title: loaderData.title }) }] : [],
  }),
  notFoundComponent: MediaNotFound,
  component: MediaDetailPage,
})

const routeApi = getRouteApi("/_app/titles/$mediaId")
const styles = stylex.create({
  hero: {
    borderRadius: radius.xxxl,
    overflow: "hidden",
    backgroundColor: colors.well,
    position: "relative",
    height: { default: "10rem", [consts.sm]: "16rem" },
  },
  banner: {
    display: "block",
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
  bannerBlur: {
    filter: "blur(28px) saturate(1.2)",
    opacity: 0.55,
    transform: "scale(1.2)",
  },
  bannerShade: {
    inset: 0,
    backgroundImage: `linear-gradient(to bottom, transparent 30%, ${colors.background})`,
    position: "absolute",
  },
  identity: {
    gap: { default: "1.25rem", [consts.sm]: "2rem" },
    paddingInline: { default: "0.5rem", [consts.sm]: "2rem" },
    alignItems: "flex-end",
    display: "flex",
    position: "relative",
    marginTop: { default: "-4rem", [consts.sm]: "-7rem" },
  },
  cover: {
    flexShrink: 0,
    width: { default: "7.5rem", [consts.sm]: "12rem" },
  },
  titleBlock: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    paddingBottom: "0.5rem",
  },
  title: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: { default: text.xl, [consts.sm]: text.xxxl },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    textWrap: "balance",
  },
  badges: {
    gap: "0.375rem",
    display: "flex",
    flexWrap: "wrap",
  },
  credits: {
    margin: 0,
    color: colors.mutedForeground,
    columnGap: "1.25rem",
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
    rowGap: "0.25rem",
  },
  credit: {
    gap: "0.375rem",
    display: "flex",
  },
  creditName: {
    margin: 0,
    color: colors.foreground,
  },
  body: {
    gap: "3rem",
    paddingInline: { default: "0.5rem", [consts.sm]: "2rem" },
    display: "grid",
    gridTemplateColumns: { default: "1fr", "@media (width >= 64rem)": "minmax(0, 1fr) 2fr" },
    marginTop: "2.5rem",
  },
  aside: {
    gap: "1.5rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  synopsis: {
    margin: 0,
    color: colors.mutedForeground,
    lineHeight: 1.65,
    whiteSpace: "pre-line",
  },
  sectionHeading: {
    margin: 0,
    fontSize: text.lg,
    fontWeight: 600,
    marginBottom: "1rem",
  },
})

function MediaHero() {
  const { mediaQueryOptions } = routeApi.useRouteContext()
  const { data: media } = useSuspenseQuery(mediaQueryOptions)
  const title = getMainTitle(media.titles)
  const cover = getMainCover(media.covers)
  const banner = media.banners[0] ?? null
  const rating = contentRatingBadge(media.contentRating)

  return (
    <>
      <div sx={styles.hero}>
        {banner ? (
          <img alt={m.media_banner_alt({ title })} src={banner.url} sx={styles.banner} />
        ) : cover ? (
          <img alt="" aria-hidden src={cover.url} sx={[styles.banner, styles.bannerBlur]} />
        ) : null}
        <div sx={styles.bannerShade} />
      </div>
      <div sx={styles.identity}>
        <MediaCover
          alt={m.media_cover_alt({ title })}
          loading="eager"
          sx={styles.cover}
          url={cover?.url ?? null}
        />
        <div sx={styles.titleBlock}>
          <h1 sx={styles.title}>{title}</h1>
          <div sx={styles.badges}>
            <Badge variant="secondary">{mediaTypeLabel(media.type)}</Badge>
            <Badge variant="outline">{mediaStatusLabel(media.status)}</Badge>
            <Badge variant="outline">{mediaDemographyLabel(media.demography)}</Badge>
            {rating ? <Badge variant={rating.variant}>{rating.label}</Badge> : null}
          </div>
          {media.staffs.length > 0 ? (
            <dl sx={styles.credits}>
              {media.staffs.map((staff) => (
                <div key={`${staff.staffId}-${staff.role}`} sx={styles.credit}>
                  <dt>{staffRoleLabel(staff.role)}</dt>
                  <dd sx={styles.creditName}>{staff.name}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </>
  )
}

function MediaChapters() {
  const { mediaId } = routeApi.useParams()
  const { chaptersQueryOptions } = routeApi.useRouteContext()
  const { data } = useSuspenseQuery(chaptersQueryOptions)

  return (
    <section>
      <h2 sx={styles.sectionHeading}>{m.media_chapters_heading()}</h2>
      {data.data.length === 0 ? (
        <EmptyState
          description={m.media_no_chapters_description()}
          icon={<Book />}
          title={m.media_no_chapters_title()}
        />
      ) : (
        <>
          <ChapterList>
            {data.data.map((chapter) => (
              <ChapterRow chapter={chapter} key={chapter.id} mediaId={mediaId} />
            ))}
          </ChapterList>
          <PagePagination
            page={data.meta.page}
            perPage={data.meta.perPage}
            total={data.meta.total}
          />
        </>
      )}
    </section>
  )
}

function MediaAside() {
  const { mediaId } = routeApi.useParams()
  const { mediaQueryOptions, chaptersQueryOptions } = routeApi.useRouteContext()
  const { data: media } = useSuspenseQuery(mediaQueryOptions)
  const { data: chapters } = useSuspenseQuery(chaptersQueryOptions)
  const synopsis = getSynopsis(media.synopsis, getLocale())
  const first = chapters.meta.page === FIRST_PAGE ? chapters.data[0] : undefined

  return (
    <aside sx={styles.aside}>
      {first ? (
        <Button
          render={<Link params={{ mediaId, chapterId: first.id }} to="/read/$mediaId/$chapterId" />}
          size="lg"
        >
          <Book />
          {m.media_start_reading()}
        </Button>
      ) : null}
      <p sx={styles.synopsis}>{synopsis ?? m.media_synopsis_empty()}</p>
    </aside>
  )
}

function MediaDetailPage() {
  return (
    <>
      <MediaHero />
      <div sx={styles.body}>
        <MediaAside />
        <MediaChapters />
      </div>
    </>
  )
}

function MediaNotFound() {
  return (
    <EmptyState
      action={
        <Button render={<Link search={{}} to="/titles" />} variant="outline">
          {m.media_back_to_titles()}
        </Button>
      }
      description={m.media_not_found_description()}
      icon={<Book />}
      title={m.media_not_found_title()}
    />
  )
}
