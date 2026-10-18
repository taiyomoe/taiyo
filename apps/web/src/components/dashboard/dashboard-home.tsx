import * as stylex from "@stylexjs/stylex"
import { DashboardIntro } from "@/components/dashboard/dashboard-intro"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    paddingInline: {
      default: "1.25rem",
      "@media (width >= 48rem)": "2rem",
    },
    paddingBottom: "3rem",
    paddingTop: "2rem",
  },
})

type DashboardHomeProps = {
  name: string
}

export function DashboardHome({ name }: DashboardHomeProps) {
  return (
    <div sx={styles.page}>
      <DashboardIntro name={name} subtitle={m.dashboard_personal_subtitle()} />
    </div>
  )
}
