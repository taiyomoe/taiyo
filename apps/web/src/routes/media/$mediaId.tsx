import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { ArrowRight, Book, Bookmark, Check } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import {
  Popover,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@taiyomoe/ui/components/ui/popover"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import {
  noop,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Suspense, useDeferredValue, useState } from "react"
import { z } from "zod"
import { useCurrentHref } from "@/components/auth/use-auth-redirect"
import { TimeAgo } from "@/components/chapters/chapter-meta"
import { CountryFlag, LanguageFlag, getLanguageName } from "@/components/chapters/flags"
import { Cover, CoverSkeleton } from "@/components/media/cover"
import { CHAPTERS_PER_PAGE, MediaChapters } from "@/components/media/media-chapters"
import {
  LIBRARY_STATUSES,
  LIBRARY_STATUS_LABELS,
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_SOURCE_LABELS,
  MEDIA_STATUS_BADGES,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
  getMainTitle,
  getMediaTags,
} from "@/components/media/media-labels"
import { sceneFont } from "@/components/scene/scene.stylex"
import { ContentRatingLabel } from "@/components/settings/content-rating-label"
import { AppShell } from "@/components/shell/app-shell"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import {
  CHAPTER_SORTS,
  mediaChapterFacetsQueryOptions,
  mediaChaptersQueryOptions,
} from "@/lib/queries/chapters"
import {
  type LibraryStatus,
  type ReadingProgress,
  libraryEntryQueryOptions,
  readingProgressQueryOptions,
} from "@/lib/queries/library"
import { mediaQueryOptions } from "@/lib/queries/medias"
import { type ContentRating, getContentRatings, useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const MEDIA_TABS = ["info", "chapters"] as const

type MediaTab = (typeof MEDIA_TABS)[number]

const DESKTOP = "@media (width >= 64rem)"
const WIDE = "@media (width >= 72rem)"
const MAX_EYEBROW_TITLES = 3
const SYNOPSIS_PREVIEW_LENGTH = 700
const DISABLED_TABS = [
  { value: "covers", label: m.media_tab_covers },
  { value: "characters", label: m.media_tab_characters },
  { value: "related", label: m.media_tab_related },
  { value: "comments", label: m.media_tab_comments },
  { value: "banners", label: m.media_tab_banners },
  { value: "stats", label: m.media_tab_stats },
] as const
const CONTENT_RATING_LABELS: Record<ContentRating, () => string> = {
  NORMAL: m.content_rating_normal,
  SUGGESTIVE: m.content_rating_suggestive,
  NSFW: m.content_rating_nsfw,
  NSFL: m.content_rating_nsfl,
}
const LINKS: Record<string, { label: string; href: (value: string) => string }> = {
  mangaDex: { label: "MangaDex", href: (id) => `https://mangadex.org/title/${id}` },
  anilist: { label: "AniList", href: (id) => `https://anilist.co/manga/${id}` },
  myAnimeList: { label: "MyAnimeList", href: (id) => `https://myanimelist.net/manga/${id}` },
  animePlanet: { label: "Anime-Planet", href: (url) => url },
  bookWalker: { label: "BookWalker", href: (url) => url },
  mangaUpdates: { label: "MangaUpdates", href: (url) => url },
  novelUpdates: { label: "NovelUpdates", href: (url) => url },
  kitsu: { label: "Kitsu", href: (url) => url },
  amazon: { label: "Amazon", href: (url) => url },
  eBookJapan: { label: "eBookJapan", href: (url) => url },
  raw: { label: m.media_link_raw(), href: (url) => url },
  officialENTranslation: { label: m.media_link_official({ language: "EN" }), href: (url) => url },
  officialFRTranslation: { label: m.media_link_official({ language: "FR" }), href: (url) => url },
  officialPTBRTranslation: {
    label: m.media_link_official({ language: "PT-BR" }),
    href: (url) => url,
  },
  cdJapan: { label: "CDJapan", href: (url) => url },
}
const styles = stylex.create({
  root: {
    isolation: "isolate",
    position: "relative",
  },
  backdrop: {
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
    zIndex: -1,
    height: { [DESKTOP]: "26rem", default: "18rem" },
    left: 0,
    right: 0,
    top: 0,
  },
  backdropImage: {
    filter: "blur(6px) saturate(120%)",
    objectFit: "cover",
    objectPosition: "50% 30%",
    opacity: 0.85,
    transform: "scale(1.06)",
    height: "100%",
    width: "100%",
  },
  shade: {
    inset: 0,
    backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, ${colors.background} 35%, transparent), color-mix(in srgb, ${colors.background} 70%, transparent) 55%, ${colors.background})`,
    position: "absolute",
  },
  layout: {
    gridTemplateAreas: {
      [DESKTOP]: '"aside main"',
      default: '"cover header" "actions actions" "tabs tabs"',
    },
    marginInline: "auto",
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2rem" },
    columnGap: { [DESKTOP]: "2.5rem", default: "1rem" },
    display: "grid",
    gridTemplateColumns: {
      [DESKTOP]: "16rem minmax(0, 1fr)",
      default: "7rem minmax(0, 1fr)",
    },
    rowGap: "1.5rem",
    maxWidth: "88rem",
    paddingBottom: "3rem",
    paddingTop: { [DESKTOP]: "5rem", default: "2rem" },
  },
  aside: {
    gap: "1.25rem",
    display: { [DESKTOP]: "flex", default: "contents" },
    flexDirection: "column",
    gridColumnEnd: "aside",
    gridColumnStart: "aside",
    gridRowEnd: "aside",
    gridRowStart: "aside",
  },
  coverSlot: {
    gridColumnEnd: "cover",
    gridColumnStart: "cover",
    gridRowEnd: "cover",
    gridRowStart: "cover",
  },
  cover: {
    borderRadius: radius.xl,
    boxShadow: shadows.overlay,
    width: "100%",
  },
  actionsSlot: {
    gridColumnEnd: "actions",
    gridColumnStart: "actions",
    gridRowEnd: "actions",
    gridRowStart: "actions",
  },
  main: {
    gap: "2rem",
    display: { [DESKTOP]: "flex", default: "contents" },
    flexDirection: "column",
    gridColumnEnd: "main",
    gridColumnStart: "main",
    gridRowEnd: "main",
    gridRowStart: "main",
    minWidth: 0,
  },
  header: {
    gap: { [DESKTOP]: "0.875rem", default: "0.5rem" },
    alignSelf: { [DESKTOP]: "stretch", default: "end" },
    display: "flex",
    flexDirection: "column",
    gridColumnEnd: "header",
    gridColumnStart: "header",
    gridRowEnd: "header",
    gridRowStart: "header",
    justifyContent: "flex-end",
    minHeight: { [DESKTOP]: "12rem", default: null },
    minWidth: 0,
  },
  eyebrow: {
    margin: 0,
    overflow: "hidden",
    color: `color-mix(in srgb, ${colors.foreground} 75%, transparent)`,
    display: { default: "none", "@media (width >= 40rem)": "block" },
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textOverflow: "ellipsis",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  title: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: { [DESKTOP]: 3, default: 4 },
    color: colors.foreground,
    display: "-webkit-box",
    fontFamily: sceneFont.display,
    fontSize: { [DESKTOP]: "3.25rem", default: "1.625rem", "@media (width >= 40rem)": "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    overflowWrap: "anywhere",
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  badges: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  years: {
    fontFamily: font.mono,
  },
  tabs: {
    gap: "1.5rem",
    gridColumnEnd: "tabs",
    gridColumnStart: "tabs",
    gridRowEnd: "tabs",
    gridRowStart: "tabs",
    minWidth: 0,
  },
  tabList: {
    scrollbarWidth: "none",
    maxWidth: "100%",
    overflowX: "auto",
  },
  tab: {
    flexShrink: 0,
  },
  soonTab: {
    display: { default: "none", "@media (width >= 40rem)": "flex" },
  },
  tabCount: {
    borderRadius: radius.full,
    paddingInline: "0.4375rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: "1.125rem",
    marginInlineStart: "0.375rem",
  },
  skeletonTitle: {
    height: { [DESKTOP]: "3rem", default: "1.75rem" },
    width: "min(28rem, 80%)",
  },
  skeletonBadges: {
    height: "1.5rem",
    width: "min(18rem, 60%)",
  },
})
const infoStyles = stylex.create({
  root: {
    gap: "2rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { [WIDE]: "minmax(0, 1fr) 20rem", default: "minmax(0, 1fr)" },
  },
  main: {
    gap: "2rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
  },
  synopsis: {
    gap: "0.875rem",
    color: `color-mix(in srgb, ${colors.foreground} 85%, transparent)`,
    display: "flex",
    flexDirection: "column",
    fontSize: "1rem",
    lineHeight: 1.7,
    maxWidth: "48rem",
  },
  synopsisCollapsed: {
    overflow: "hidden",
    maskImage: "linear-gradient(to bottom, black 55%, transparent)",
    maxHeight: "13.6em",
  },
  paragraph: {
    margin: 0,
    overflowWrap: "anywhere",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  tags: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  tag: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.3125rem",
    paddingInline: "0.75rem",
    backgroundColor: colors.chip,
    boxShadow: shadows.chip,
    color: colors.foreground,
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  genre: {
    fontWeight: 600,
  },
  spoiler: {
    borderStyle: "dashed",
    color: colors.mutedForeground,
  },
  card: {
    margin: 0,
    padding: "1.25rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    rowGap: "0.875rem",
  },
  term: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  value: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
    fontWeight: 600,
    justifyContent: "flex-end",
    textAlign: "end",
  },
  titles: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.9375rem",
    minWidth: 0,
  },
  titleText: {
    overflowWrap: "anywhere",
  },
  titleFlag: {
    flexShrink: 0,
  },
  links: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
})
const sidebarStyles = stylex.create({
  actions: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  cta: {
    width: "100%",
  },
  library: {
    justifyContent: "center",
    width: "100%",
  },
  libraryActive: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 12%, ${colors.card})`,
    color: `color-mix(in srgb, ${colors.primary} 80%, ${colors.foreground})`,
  },
  menu: {
    minWidth: "14rem",
  },
  card: {
    padding: "1rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  percent: {
    color: colors.primary,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
  detail: {
    margin: 0,
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  prompt: {
    gap: "0.5rem",
    paddingInline: "1rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "min(18rem, calc(100vw - 2rem))",
  },
  promptTitle: {
    margin: 0,
    color: colors.foreground,
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  promptText: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.5,
  },
  promptActions: {
    gap: "0.5rem",
    display: "flex",
    paddingTop: "0.375rem",
  },
  skeletonButton: {
    borderRadius: radius.full,
    height: "2.75rem",
  },
})
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
  component: function Media() {
    const { session } = Route.useRouteContext()
    const { mediaId } = Route.useParams()
    const user = session?.user ?? null

    return (
      <AppShell user={user}>
        <Suspense
          fallback={
            <div sx={styles.layout}>
              <aside aria-hidden sx={styles.aside}>
                <div sx={styles.coverSlot}>
                  <CoverSkeleton sx={styles.cover} />
                </div>
              </aside>
              <div sx={styles.main}>
                <div aria-hidden sx={styles.header}>
                  <Skeleton sx={styles.skeletonTitle} />
                  <Skeleton sx={styles.skeletonBadges} />
                </div>
              </div>
            </div>
          }
        >
          <MediaPageContent mediaId={mediaId} signedIn={user !== null} />
        </Suspense>
      </AppShell>
    )
  },
})

function MediaPageContent({ mediaId, signedIn }: { mediaId: string; signedIn: boolean }) {
  const { data: media } = useSuspenseQuery(mediaQueryOptions(mediaId))
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { tab = "chapters", lang } = Route.useSearch()
  const navigate = Route.useNavigate()
  const facets = useQuery(
    mediaChapterFacetsQueryOptions(media.id, { contentRatings, language: lang }),
  )
  const backdrop =
    media.banners.find((banner) => contentRatings.includes(banner.contentRating))?.url ??
    media.covers.find((cover) => cover.isMainCover)?.url ??
    null
  const title = getMainTitle(media.titles)
  const altTitles = media.titles
    .filter((candidate) => !candidate.isMainTitle)
    .sort((a, b) => a.priority - b.priority || Number(a.isAcronym) - Number(b.isAcronym))
  const eyebrow = altTitles
    .filter((alt) => !alt.isAcronym)
    .slice(0, MAX_EYEBROW_TITLES)
    .map((alt) => alt.title)
  let years: string | null = null

  if (media.startDate !== null) {
    const start = new Date(media.startDate).getUTCFullYear()
    const end = media.endDate === null ? null : new Date(media.endDate).getUTCFullYear()

    if (end === null) {
      years = media.status === "RELEASING" ? m.media_years_ongoing({ start }) : String(start)
    } else {
      years = end === start ? String(start) : m.media_years({ start, end })
    }
  }

  const synopsis = (
    (
      media.synopsis[getLocale()] ??
      media.synopsis.en ??
      Object.values(media.synopsis).find((value) => value !== undefined)
    )?.split(/\n\s*(?:-{3,}|_{3,}|\*{3,})\s*\n/)[0] ?? ""
  )
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[*_`#>~]+/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((paragraph) => paragraph !== "")
  const tags = getMediaTags(media.tags)
  const links = Object.entries(media.links).flatMap(([key, value]) => {
    const link = LINKS[key]

    return link === undefined ? [] : [{ key, label: link.label, href: link.href(String(value)) }]
  })
  const authors = media.staffs.filter((staff) => staff.role === "AUTHOR")
  const artists = media.staffs.filter((staff) => staff.role === "ARTIST")

  return (
    <div sx={styles.root}>
      <div aria-hidden sx={styles.backdrop}>
        {backdrop === null ? null : (
          <img alt="" decoding="async" draggable={false} src={backdrop} sx={styles.backdropImage} />
        )}
        <div sx={styles.shade} />
      </div>
      <div sx={styles.layout}>
        <aside sx={styles.aside}>
          <div sx={styles.coverSlot}>
            <Cover
              alt={title ?? ""}
              priority="high"
              src={media.covers.find((cover) => cover.isMainCover)?.url ?? null}
              sx={styles.cover}
            />
          </div>
          <div sx={styles.actionsSlot}>
            {signedIn ? <SignedInActions mediaId={mediaId} /> : <SignedOutActions />}
          </div>
        </aside>
        <div sx={styles.main}>
          <header sx={styles.header}>
            {eyebrow.length === 0 ? null : <p sx={styles.eyebrow}>{eyebrow.join(" · ")}</p>}
            <h1 sx={styles.title} title={title ?? undefined}>
              {title ?? <span sx={styles.untitled}>{m.media_untitled()}</span>}
            </h1>
            <div sx={styles.badges}>
              <Badge size="lg" variant="outline">
                {MEDIA_TYPE_LABELS[media.type]()}
              </Badge>
              <Badge size="lg" variant={MEDIA_STATUS_BADGES[media.status]}>
                {MEDIA_STATUS_LABELS[media.status]()}
              </Badge>
              {years === null ? null : (
                <Badge size="lg" sx={styles.years} variant="secondary">
                  {years}
                </Badge>
              )}
            </div>
          </header>
          <Tabs
            onValueChange={(value: MediaTab) => {
              void navigate({
                replace: true,
                resetScroll: false,
                search: (previous) => ({
                  ...previous,
                  tab: value === "chapters" ? undefined : value,
                }),
              })
            }}
            sx={styles.tabs}
            value={tab}
          >
            <TabsList sx={styles.tabList} variant="underline">
              <TabsTab sx={styles.tab} value="info">
                {m.media_tab_information()}
              </TabsTab>
              <TabsTab sx={styles.tab} value="chapters">
                {m.media_tab_chapters()}
                {facets.data === undefined ? null : (
                  <span sx={styles.tabCount}>{facets.data.total}</span>
                )}
              </TabsTab>
              {DISABLED_TABS.map(({ value, label }) => (
                <TabsTab
                  key={value}
                  disabled
                  sx={[styles.tab, styles.soonTab]}
                  title={m.media_tab_soon()}
                  value={value}
                >
                  {label()}
                </TabsTab>
              ))}
            </TabsList>
            <TabsPanel value="info">
              <div sx={infoStyles.root}>
                <div sx={infoStyles.main}>
                  <Section title={m.media_info_synopsis()}>
                    {synopsis.length === 0 ? (
                      <p sx={infoStyles.muted}>{m.media_info_no_synopsis()}</p>
                    ) : (
                      <Synopsis paragraphs={synopsis} />
                    )}
                  </Section>
                  {tags.length === 0 ? null : (
                    <Section title={m.media_info_tags()}>
                      <TagList tags={tags} />
                    </Section>
                  )}
                  {altTitles.length === 0 ? null : (
                    <Section title={m.media_info_titles()}>
                      <ul sx={infoStyles.titles}>
                        {altTitles.map((altTitle) => (
                          <li key={altTitle.id} sx={infoStyles.title}>
                            <span
                              sx={infoStyles.titleFlag}
                              title={getLanguageName(altTitle.language)}
                            >
                              <LanguageFlag language={altTitle.language} />
                            </span>
                            <span sx={infoStyles.titleText}>{altTitle.title}</span>
                          </li>
                        ))}
                      </ul>
                    </Section>
                  )}
                  {links.length === 0 ? null : (
                    <Section title={m.media_info_links()}>
                      <div sx={infoStyles.links}>
                        {links.map((link) => (
                          <Button
                            key={link.key}
                            render={
                              <a href={link.href} rel="noreferrer noopener" target="_blank" />
                            }
                            size="sm"
                            variant="outline"
                          >
                            {link.label}
                            <ArrowRight />
                          </Button>
                        ))}
                      </div>
                    </Section>
                  )}
                </div>
                <dl sx={infoStyles.card}>
                  <Detail term={m.media_info_type()}>{MEDIA_TYPE_LABELS[media.type]()}</Detail>
                  <Detail term={m.media_info_status()}>
                    {MEDIA_STATUS_LABELS[media.status]()}
                  </Detail>
                  {years === null ? null : <Detail term={m.media_info_published()}>{years}</Detail>}
                  {authors.length === 0 ? null : (
                    <Detail term={m.media_info_authors()}>
                      {authors.map((staff) => staff.name).join(", ")}
                    </Detail>
                  )}
                  {artists.length === 0 ? null : (
                    <Detail term={m.media_info_artists()}>
                      {artists.map((staff) => staff.name).join(", ")}
                    </Detail>
                  )}
                  <Detail term={m.media_info_demography()}>
                    {MEDIA_DEMOGRAPHY_LABELS[media.demography]()}
                  </Detail>
                  <Detail term={m.media_info_source()}>
                    {MEDIA_SOURCE_LABELS[media.source]()}
                  </Detail>
                  <Detail term={m.media_info_country()}>
                    <CountryFlag country={media.countryOfOrigin} />
                    {MEDIA_COUNTRY_LABELS[media.countryOfOrigin]()}
                  </Detail>
                  <Detail term={m.media_info_content_rating()}>
                    <ContentRatingLabel
                      label={CONTENT_RATING_LABELS[media.contentRating]()}
                      rating={media.contentRating}
                    />
                  </Detail>
                </dl>
              </div>
            </TabsPanel>
            <TabsPanel value="chapters">
              <MediaChapters mediaId={media.id} signedIn={signedIn} />
            </TabsPanel>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function Synopsis({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const long = paragraphs.join(" ").length > SYNOPSIS_PREVIEW_LENGTH

  return (
    <>
      <div sx={[infoStyles.synopsis, long && !expanded && infoStyles.synopsisCollapsed]}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} sx={infoStyles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
      {long ? (
        <div>
          <Button
            onClick={() => {
              setExpanded(!expanded)
            }}
            size="sm"
            variant="ghost"
          >
            {expanded ? m.media_info_show_less() : m.media_info_show_more()}
          </Button>
        </div>
      ) : null}
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section sx={infoStyles.section}>
      <h3 sx={infoStyles.heading}>{title}</h3>
      {children}
    </section>
  )
}

function TagList({ tags }: { tags: ReturnType<typeof getMediaTags> }) {
  const [showSpoilers, setShowSpoilers] = useState(false)
  const spoilers = tags.filter((tag) => tag.isSpoiler).length
  const visible = tags
    .filter((tag) => showSpoilers || !tag.isSpoiler)
    .sort((a, b) => Number(b.isGenre) - Number(a.isGenre))

  return (
    <ul sx={infoStyles.tags}>
      {visible.map((tag) => (
        <li key={tag.key}>
          <span
            sx={[
              infoStyles.tag,
              tag.isGenre && infoStyles.genre,
              tag.isSpoiler && infoStyles.spoiler,
            ]}
          >
            {tag.name}
          </span>
        </li>
      ))}
      {spoilers === 0 ? null : (
        <li>
          <Button
            onClick={() => {
              setShowSpoilers(!showSpoilers)
            }}
            size="xs"
            variant="ghost"
          >
            {showSpoilers
              ? m.media_info_hide_spoilers()
              : m.media_info_show_spoilers({ count: spoilers })}
          </Button>
        </li>
      )}
    </ul>
  )
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt sx={infoStyles.term}>{term}</dt>
      <dd sx={infoStyles.value}>{children}</dd>
    </>
  )
}

function SignedOutActions() {
  const href = useCurrentHref()

  return (
    <div sx={sidebarStyles.actions}>
      <ReadButton progress={null} />
      <Popover>
        <PopoverTrigger render={<Button sx={sidebarStyles.library} variant="outline" />}>
          <Bookmark />
          {m.media_library_add()}
        </PopoverTrigger>
        <PopoverPopup align="center" arrow side="bottom">
          <div sx={sidebarStyles.prompt}>
            <PopoverTitle sx={sidebarStyles.promptTitle}>{m.media_sign_in_title()}</PopoverTitle>
            <PopoverDescription sx={sidebarStyles.promptText}>
              {m.media_sign_in_description()}
            </PopoverDescription>
            <div sx={sidebarStyles.promptActions}>
              <Button render={<Link search={{ redirect: href }} to="/auth/sign-in" />} size="sm">
                {m.auth_sign_in()}
              </Button>
              <Button
                render={<Link search={{ redirect: href }} to="/auth/sign-up" />}
                size="sm"
                variant="outline"
              >
                {m.auth_sign_up()}
              </Button>
            </div>
          </div>
        </PopoverPopup>
      </Popover>
    </div>
  )
}

function SignedInActions({ mediaId }: { mediaId: string }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const progress = useQuery(readingProgressQueryOptions(mediaId, contentRatings))
  const entry = useQuery(libraryEntryQueryOptions(mediaId))
  const percent =
    progress.data === undefined || progress.data.totalCount === 0
      ? 0
      : Math.round((progress.data.readCount / progress.data.totalCount) * 100)

  return (
    <div sx={sidebarStyles.actions}>
      {progress.data === undefined ? (
        <Skeleton sx={sidebarStyles.skeletonButton} />
      ) : (
        <ReadButton progress={progress.data} />
      )}
      {entry.data === undefined ? (
        <Skeleton sx={sidebarStyles.skeletonButton} />
      ) : (
        <LibraryButton mediaId={mediaId} status={entry.data?.status ?? null} />
      )}
      {progress.data === undefined || progress.data.lastRead === null ? null : (
        <section aria-label={m.media_progress_title()} sx={sidebarStyles.card}>
          <div sx={sidebarStyles.cardHeader}>
            <span sx={sidebarStyles.cardLabel}>{m.media_progress_title()}</span>
            <span sx={sidebarStyles.percent}>{percent}%</span>
          </div>
          <Progress aria-label={m.media_progress_title()} value={percent} />
          <p sx={sidebarStyles.detail}>
            {m.media_progress_detail({
              read: progress.data.readCount,
              total: progress.data.totalCount,
            })}
          </p>
          <p sx={sidebarStyles.detail}>
            {m.media_progress_last({ number: progress.data.lastRead.number })}
            <span aria-hidden>·</span>
            <TimeAgo date={progress.data.lastRead.readAt} />
          </p>
        </section>
      )}
    </div>
  )
}

function ReadButton({ progress }: { progress: ReadingProgress | null }) {
  const next = progress?.next ?? null
  let label = m.media_start_reading()

  if ((progress?.lastRead ?? null) !== null) {
    label = next === null ? m.media_caught_up() : m.media_continue({ number: next.number })
  }

  return (
    <span title={m.media_reader_soon()}>
      <Button disabled size="lg" sx={sidebarStyles.cta}>
        <Book />
        {label}
      </Button>
    </span>
  )
}

function LibraryButton({ mediaId, status }: { mediaId: string; status: LibraryStatus | null }) {
  const queryClient = useQueryClient()
  const { queryKey } = libraryEntryQueryOptions(mediaId)
  const setStatus = useMutation({
    mutationFn: async (nextStatus: LibraryStatus | null) => {
      if (nextStatus === null) {
        const response = await api.users.me.library[":mediaId"].$delete({ param: { mediaId } })

        return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
      }

      const response = await api.users.me.library[":mediaId"].$put({
        param: { mediaId },
        json: { status: nextStatus },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: async (nextStatus) => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData(queryKey)
      const now = new Date().toISOString()

      queryClient.setQueryData(
        queryKey,
        nextStatus === null
          ? null
          : {
              mediaId,
              status: nextStatus,
              createdAt: previous?.createdAt ?? now,
              updatedAt: now,
            },
      )

      return { previous }
    },
    onError: (_error, _status, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            sx={[sidebarStyles.library, status !== null && sidebarStyles.libraryActive]}
            variant={status === null ? "outline" : "secondary"}
          />
        }
      >
        {status === null ? <Bookmark /> : <Check />}
        {status === null ? m.media_library_add() : LIBRARY_STATUS_LABELS[status]()}
      </MenuTrigger>
      <MenuPopup align="center" sx={sidebarStyles.menu}>
        <MenuRadioGroup
          onValueChange={(value: LibraryStatus) => {
            setStatus.mutate(value)
          }}
          value={status}
        >
          {LIBRARY_STATUSES.map((value) => (
            <MenuRadioItem key={value} value={value}>
              {LIBRARY_STATUS_LABELS[value]()}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        {status === null ? null : (
          <>
            <MenuSeparator />
            <MenuItem
              onClick={() => {
                setStatus.mutate(null)
              }}
              variant="destructive"
            >
              {m.media_library_remove()}
            </MenuItem>
          </>
        )}
      </MenuPopup>
    </Menu>
  )
}
