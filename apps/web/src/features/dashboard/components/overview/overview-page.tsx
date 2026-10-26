import * as stylex from "@stylexjs/stylex"
import { useQuery } from "@tanstack/react-query"
import type { dashboardOverviewQueryOptions } from "@/features/dashboard/api/overview"
import type { DashboardRange } from "@/features/dashboard/lib/dashboard"
import type { Session } from "@/lib/session"
import { DashboardIntro } from "@/features/dashboard/components/dashboard-intro"
import { OverviewControls } from "@/features/dashboard/components/overview/overview-controls"
import { OverviewError } from "@/features/dashboard/components/overview/overview-error"
import { OverviewGrid } from "@/features/dashboard/components/overview/overview-grid"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    gap: "1.5rem",
    paddingInline: {
      default: "1.25rem",
      "@media (width >= 48rem)": "2rem",
    },
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "3rem",
    paddingTop: "2rem",
  },
})

type OverviewPageProps = {
  user: Session["user"]
  range: DashboardRange
  compare: boolean
  queryOptions: ReturnType<typeof dashboardOverviewQueryOptions>
}

export function OverviewPage({ user, range, compare, queryOptions }: OverviewPageProps) {
  const query = useQuery(queryOptions)
  const overview = query.data

  return (
    <div sx={styles.page}>
      <DashboardIntro name={user.name} subtitle={m.dashboard_overview_subtitle()} />
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
