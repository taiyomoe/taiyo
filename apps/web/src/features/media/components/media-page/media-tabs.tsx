import * as stylex from "@stylexjs/stylex"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import type { Media } from "@/features/media/api/medias"
import type { MEDIA_TABS } from "@/features/media/lib/media-page"
import type { Session } from "@/lib/session"
import { mediaChapterFacetsQueryOptions } from "@/features/chapters/api/chapters"
import { MediaChapters } from "@/features/media/components/media-chapters/media-chapters"
import { MediaInfo } from "@/features/media/components/media-info/media-info"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

type MediaTab = (typeof MEDIA_TABS)[number]

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
})

type MediaTabsProps = {
  media: Media
  user: Session["user"] | null
}

export function MediaTabs({ media, user }: MediaTabsProps) {
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
