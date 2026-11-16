import * as stylex from "@stylexjs/stylex"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { pageFrame } from "@/components/layout/page-frame"
import { AppShell } from "@/components/shell/app-shell"
import { libraryCountsQueryOptions } from "@/features/library/api/library"
import { LibraryShelf } from "@/features/library/components/library-shelf"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/library")
const styles = stylex.create({
  page: {
    gap: { default: "1.25rem", [breakpoints.md]: "1.75rem" },
    display: "flex",
    flexDirection: "column",
    paddingBottom: "4rem",
    paddingTop: { default: "1.5rem", [breakpoints.md]: "2.5rem" },
  },
  heading: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "2rem", [breakpoints.md]: "2.75rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
  },
  summary: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    fontVariantNumeric: "tabular-nums",
  },
})
const formatTotal = (total: number) =>
  total === 1
    ? m.profile_stats_library_total_one()
    : m.profile_stats_library_total({ count: total })

export function LibraryPage() {
  const { session } = routeApi.useRouteContext()
  const counts = useQuery(libraryCountsQueryOptions()).data

  return (
    <AppShell user={session.user}>
      <div sx={[pageFrame.frame, styles.page]}>
        <header sx={styles.heading}>
          <h1 sx={styles.title}>{m.library_title()}</h1>
          <p sx={styles.summary}>{counts === undefined ? " " : formatTotal(counts.total)}</p>
        </header>
        <LibraryShelf counts={counts} />
      </div>
    </AppShell>
  )
}
