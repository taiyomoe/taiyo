import * as stylex from "@stylexjs/stylex"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { layout } from "@/components/layout/layout.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { ResultListSkeleton } from "@/features/advanced-search/components/results/result-list"
import { RecentlyAddedPageContent } from "@/features/recently-added/components/recently-added-page-content"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/recently-added")
const styles = stylex.create({
  page: {
    gap: "1.5rem",
    paddingBlock: "2rem",
    paddingInline: layout.gutter,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  back: {
    color: colors.mutedForeground,
    marginInlineStart: { default: "-0.75rem", [breakpoints.sm]: "-0.6875rem" },
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
})

export function RecentlyAddedPage() {
  const { session } = routeApi.useRouteContext()
  const { page } = routeApi.useLoaderDeps()

  return (
    <AppShell user={session?.user ?? null}>
      <div sx={styles.page}>
        <div sx={styles.header}>
          <Button
            aria-label={m.recently_added_back()}
            render={<Link to="/" />}
            size="icon-xl"
            sx={styles.back}
            variant="ghost"
          >
            <ArrowLeft />
          </Button>
          <h1 sx={styles.heading}>{m.shell_nav_recently_added()}</h1>
        </div>
        <Suspense fallback={<ResultListSkeleton count={6} view="cards" />}>
          <RecentlyAddedPageContent page={page} />
        </Suspense>
      </div>
    </AppShell>
  )
}
