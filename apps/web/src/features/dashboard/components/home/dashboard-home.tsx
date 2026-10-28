import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { myOverviewQueryOptions } from "@/features/dashboard/api/my-overview"
import { DashboardIntro } from "@/features/dashboard/components/dashboard-intro"
import { HomeOverview } from "@/features/dashboard/components/home/home-overview"
import { HomeQueues } from "@/features/dashboard/components/home/home-queues"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    gap: "2.5rem",
    paddingInline: {
      default: "1.25rem",
      [breakpoints.md]: "2rem",
    },
    display: "flex",
    flexDirection: "column",
    maxWidth: "76rem",
    paddingBottom: "3rem",
    paddingTop: "2rem",
  },
})

export function DashboardHome({ name }: { name: string }) {
  const { data } = useQuery(myOverviewQueryOptions)

  return (
    <div sx={styles.page}>
      <DashboardIntro name={name} subtitle={m.dashboard_personal_subtitle()} />
      <HomeQueues queues={data?.queues} />
      <HomeOverview data={data} />
    </div>
  )
}
