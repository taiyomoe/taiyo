import * as stylex from "@stylexjs/stylex"
import { ArrowRight, Grid, List, Rows } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import {
  Tooltip,
  TooltipPopup,
  TooltipPrimitive,
  TooltipTrigger,
} from "@taiyomoe/ui/components/ui/tooltip"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CatchBoundary, Link } from "@tanstack/react-router"
import { Suspense, useDeferredValue } from "react"
import {
  LatestCompact,
  LatestCompactSkeleton,
  LatestGrid,
  LatestGridSkeleton,
  LatestList,
  LatestListSkeleton,
} from "@/components/home/latest-update-layouts"
import { sceneFont } from "@/components/scene/scene.stylex"
import { ContentFilterEmpty } from "@/components/settings/content-filter"
import { latestChaptersQueryOptions } from "@/lib/queries/chapters"
import { type LatestUpdatesLayout, useSettings, useUpdateSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const LATEST_UPDATES_PER_PAGE = 12

const LAYOUTS = [
  { value: "LIST", label: m.home_latest_layout_list, icon: List },
  { value: "GRID", label: m.home_latest_layout_grid, icon: Grid },
  { value: "COMPACT", label: m.home_latest_layout_compact, icon: Rows },
] as const satisfies Array<{ value: LatestUpdatesLayout; label: () => string; icon: unknown }>
const styles = stylex.create({
  section: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  heading: {
    margin: 0,
    gap: "0.75rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontFamily: sceneFont.display,
    fontSize: { default: "1.5rem", "@media (width >= 48rem)": "1.875rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  accent: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexShrink: 0,
    height: "0.1875rem",
    width: "1.25rem",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  tab: {
    paddingInline: "0.625rem",
  },
  seeAll: {
    color: colors.mutedForeground,
  },
})
const layoutTooltip = TooltipPrimitive.createHandle<string>()
const isLayout = (value: unknown): value is LatestUpdatesLayout =>
  LAYOUTS.some((layout) => layout.value === value)

export function LatestUpdates() {
  const { latestUpdatesLayout } = useSettings()
  const updateSettings = useUpdateSettings()

  return (
    <section aria-labelledby="latest-updates" sx={styles.section}>
      <div sx={styles.header}>
        <h2 id="latest-updates" sx={styles.heading}>
          <span aria-hidden sx={styles.accent} />
          {m.home_latest_title()}
        </h2>
        <div sx={styles.actions}>
          <Tabs
            onValueChange={(value) => {
              if (isLayout(value)) {
                updateSettings.mutate({ latestUpdatesLayout: value })
              }
            }}
            value={latestUpdatesLayout}
          >
            <TabsList aria-label={m.home_latest_layout()}>
              {LAYOUTS.map(({ value, label, icon: Icon }) => (
                <TooltipTrigger
                  key={value}
                  delay={300}
                  handle={layoutTooltip}
                  payload={label()}
                  render={<TabsTab aria-label={label()} sx={styles.tab} value={value} />}
                >
                  <Icon size={18} />
                </TooltipTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tooltip handle={layoutTooltip}>
            {({ payload }) => (
              <TooltipPopup arrow side="top">
                {payload}
              </TooltipPopup>
            )}
          </Tooltip>
          <Button render={<Link to="/latest" />} size="sm" sx={styles.seeAll} variant="ghost">
            {m.home_latest_see_all()}
            <ArrowRight />
          </Button>
        </div>
      </div>
      <CatchBoundary errorComponent={() => null} getResetKey={() => "latest"}>
        <Suspense fallback={<LatestUpdatesSkeleton layout={latestUpdatesLayout} />}>
          <LatestUpdatesContent layout={latestUpdatesLayout} />
        </Suspense>
      </CatchBoundary>
    </section>
  )
}

function LatestUpdatesContent({ layout }: { layout: LatestUpdatesLayout }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: chapters } = useSuspenseQuery(
    latestChaptersQueryOptions(contentRatings, LATEST_UPDATES_PER_PAGE),
  )

  if (chapters.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.latest_empty_description()}
        title={m.latest_empty_title()}
      />
    )
  }

  if (layout === "GRID") {
    return <LatestGrid chapters={chapters} />
  }

  return layout === "COMPACT" ? (
    <LatestCompact chapters={chapters} />
  ) : (
    <LatestList chapters={chapters} />
  )
}

function LatestUpdatesSkeleton({ layout }: { layout: LatestUpdatesLayout }) {
  if (layout === "GRID") {
    return <LatestGridSkeleton count={LATEST_UPDATES_PER_PAGE} />
  }

  return layout === "COMPACT" ? (
    <LatestCompactSkeleton count={LATEST_UPDATES_PER_PAGE} />
  ) : (
    <LatestListSkeleton count={LATEST_UPDATES_PER_PAGE} />
  )
}
