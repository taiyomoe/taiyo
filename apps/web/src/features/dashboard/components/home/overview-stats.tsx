// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { homeStyles } from "@/features/dashboard/components/home/home-styles"
import { m } from "@/paraglide/messages"

type OverviewStatsProps = {
  counts: { pending: number; accepted: number; rejected: number }
  acceptedLabel: string
}

export function OverviewStats({ counts, acceptedLabel }: OverviewStatsProps) {
  return (
    <dl sx={homeStyles.stats}>
      {[
        { label: m.home_overview_pending(), value: counts.pending },
        { label: acceptedLabel, value: counts.accepted },
        { label: m.home_overview_rejected(), value: counts.rejected },
      ].map((stat) => (
        <div key={stat.label} sx={homeStyles.stat}>
          <dt sx={homeStyles.statLabel}>{stat.label}</dt>
          <dd sx={homeStyles.statValue}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  )
}
