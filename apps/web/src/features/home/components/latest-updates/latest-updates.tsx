import * as stylex from "@stylexjs/stylex"
import { ArrowRight } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { CatchBoundary, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { sceneFont } from "@/components/scene/scene.stylex"
import { LatestLayoutTabs } from "@/features/home/components/latest-updates/latest-layout-tabs"
import { LatestUpdatesContent } from "@/features/home/components/latest-updates/latest-updates-content"
import { LatestUpdatesSkeleton } from "@/features/home/components/latest-updates/latest-updates-skeleton"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

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
    fontSize: { default: "1.5rem", [breakpoints.md]: "1.875rem" },
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
  seeAll: {
    color: colors.mutedForeground,
  },
})

export function LatestUpdates() {
  const { latestUpdatesLayout } = useSettings()

  return (
    <section aria-labelledby="latest-updates" sx={styles.section}>
      <div sx={styles.header}>
        <h2 id="latest-updates" sx={styles.heading}>
          <span aria-hidden sx={styles.accent} />
          {m.home_latest_title()}
        </h2>
        <div sx={styles.actions}>
          <LatestLayoutTabs layout={latestUpdatesLayout} />
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
