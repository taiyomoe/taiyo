import * as stylex from "@stylexjs/stylex"
import { useQuery } from "@tanstack/react-query"
import type { dashboardOverviewQueryOptions } from "@/features/dashboard/api/overview"
import type { DashboardRange } from "@/features/dashboard/lib/dashboard"
import type { Session } from "@/lib/session"
import { layout } from "@/components/layout/layout.stylex"
import { DashboardIntro } from "@/features/dashboard/components/dashboard-intro"
import { OverviewControls } from "@/features/dashboard/components/overview/overview-controls"
import { OverviewError } from "@/features/dashboard/components/overview/overview-error"
import { OverviewGrid } from "@/features/dashboard/components/overview/overview-grid"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    gap: "1.5rem",
    paddingInline: layout.gutter,
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "3rem",
    paddingTop: "2rem",
  },
})

export function OverviewPage({
  user,
  range,
  compare,
  queryOptions,
}: {
  user: Session["user"]
  range: DashboardRange
  compare: boolean
  queryOptions: ReturnType<typeof dashboardOverviewQueryOptions>
}) {
  const query = useQuery(queryOptions)
  const overview = query.data

  return (
    <div sx={styles.page}>
      <DashboardIntro
        name={user.name}
        nameEffect={user.nameEffect}
        subtitle={m.dashboard_overview_subtitle()}
      />
      <OverviewControls compare={compare} range={range} />
      {query.isError && overview === undefined ? (
        <OverviewError
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : (
        <OverviewGrid
          compare={compare}
          overview={overview}
          range={range}
          stale={query.isPlaceholderData}
        />
      )}
    </div>
  )
}
