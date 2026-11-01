import * as stylex from "@stylexjs/stylex"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"
import {
  LatestPageContent,
  LatestPageContentSkeleton,
} from "@/features/latest/components/latest-page-content"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/latest")
const styles = stylex.create({
  page: {
    gap: "1.5rem",
    paddingBlock: "2rem",
    paddingInline: { default: "1.25rem", [breakpoints.md]: "2rem" },
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
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
})

export function LatestPage() {
  const { session } = routeApi.useRouteContext()
  const { page } = routeApi.useLoaderDeps()

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
        <Suspense fallback={<LatestPageContentSkeleton />}>
          <LatestPageContent page={page} />
        </Suspense>
      </div>
    </AppShell>
  )
}
