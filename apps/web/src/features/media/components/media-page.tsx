import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense, useDeferredValue } from "react"
import type { Session } from "@/lib/session"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { mediaChapterFacetsQueryOptions } from "@/features/chapters/api/chapters"
import { type Media, mediaQueryOptions } from "@/features/media/api/medias"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { MediaChapters } from "@/features/media/components/media-chapters"
import { MediaInfo } from "@/features/media/components/media-info"
import { ReadingActions } from "@/features/media/components/media-sidebar"
import {
  MEDIA_STATUS_BADGES,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
  getAltTitles,
  getMainTitle,
  getMediaYears,
} from "@/features/media/lib/media-labels"
import { getPermissions } from "@/lib/permissions"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const MEDIA_TABS = ["info", "chapters"] as const

type MediaTab = (typeof MEDIA_TABS)[number]

const DESKTOP = "@media (width >= 64rem)"
const MAX_EYEBROW_TITLES = 3
const DISABLED_TABS = [
  { value: "covers", label: m.media_tab_covers },
  { value: "characters", label: m.media_tab_characters },
  { value: "related", label: m.media_tab_related },
  { value: "comments", label: m.media_tab_comments },
  { value: "banners", label: m.media_tab_banners },
  { value: "stats", label: m.media_tab_stats },
] as const
const routeApi = getRouteApi("/media/$mediaId")
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

type MediaPageProps = {
  mediaId: string
  user: Session["user"] | null
}

export function MediaPage({ mediaId, user }: MediaPageProps) {
  return (
    <AppShell user={user}>
      <Suspense fallback={<MediaPageSkeleton />}>
        <MediaPageContent
          canEdit={user !== null && getPermissions(user)("media.update")}
          mediaId={mediaId}
          user={user}
        />
      </Suspense>
    </AppShell>
  )
}

function MediaPageContent({
  mediaId,
  user,
  canEdit,
}: {
  mediaId: string
  user: Session["user"] | null
  canEdit: boolean
}) {
  const signedIn = user !== null
  const { data: media } = useSuspenseQuery(mediaQueryOptions(mediaId))
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const backdrop =
    media.banners.find((banner) => contentRatings.includes(banner.contentRating))?.url ??
    media.covers.find((cover) => cover.isMainCover)?.url ??
    null

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
              alt={getMainTitle(media.titles) ?? ""}
              priority="high"
              src={media.covers.find((cover) => cover.isMainCover)?.url ?? null}
              sx={styles.cover}
            />
          </div>
          <div sx={styles.actionsSlot}>
            <ReadingActions canEdit={canEdit} mediaId={mediaId} signedIn={signedIn} />
          </div>
        </aside>
        <div sx={styles.main}>
          <MediaHeader media={media} />
          <MediaTabs media={media} user={user} />
        </div>
      </div>
    </div>
  )
}

function MediaHeader({ media }: { media: Media }) {
  const title = getMainTitle(media.titles)
  const eyebrow = getAltTitles(media.titles)
    .filter((alt) => !alt.isAcronym)
    .slice(0, MAX_EYEBROW_TITLES)
    .map((alt) => alt.title)
  const years = getMediaYears(media)

  return (
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
  )
}

function MediaTabs({ media, user }: { media: Media; user: Session["user"] | null }) {
  const { tab = "chapters", lang } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const facets = useQuery(
    mediaChapterFacetsQueryOptions(media.id, { contentRatings, language: lang }),
  )

  return (
    <Tabs
      onValueChange={(value: MediaTab) => {
        void navigate({
          replace: true,
          resetScroll: false,
          search: (previous) => ({ ...previous, tab: value === "chapters" ? undefined : value }),
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
          {facets.data === undefined ? null : <span sx={styles.tabCount}>{facets.data.total}</span>}
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
        <MediaInfo media={media} />
      </TabsPanel>
      <TabsPanel value="chapters">
        <MediaChapters mediaId={media.id} user={user} />
      </TabsPanel>
    </Tabs>
  )
}

function MediaPageSkeleton() {
  return (
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
  )
}
