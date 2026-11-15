import * as stylex from "@stylexjs/stylex"
import { Bookmark, Comment, Eye, Upload, UserAdd, Users } from "@taiyomoe/ui/components/icons"
import { containers } from "@taiyomoe/ui/styles/tokens.stylex"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { KpiTile } from "@/features/dashboard/components/overview/kpi-tile"
import { m } from "@/paraglide/messages"

const KPIS = [
  { key: "reads", label: m.dashboard_kpi_reads, icon: Eye },
  { key: "uniqueReaders", label: m.dashboard_kpi_unique_readers, icon: Users },
  { key: "libraryAdds", label: m.dashboard_kpi_library_adds, icon: Bookmark },
  { key: "chaptersUploaded", label: m.dashboard_kpi_chapters_uploaded, icon: Upload },
  { key: "newAccounts", label: m.dashboard_kpi_new_accounts, icon: UserAdd },
] as const
const styles = stylex.create({
  row: {
    gap: "1rem",
    display: "grid",
    gridColumnEnd: "-1",
    gridColumnStart: "1",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [containers.xl]: {
        default: "repeat(3, minmax(0, 1fr))",
        [containers["5xl"]]: "repeat(6, minmax(0, 1fr))",
      },
    },
  },
})

export function KpiTiles({
  overview,
  compare,
}: {
  overview: DashboardOverview | undefined
  compare: boolean
}) {
  return (
    <div sx={styles.row}>
      {KPIS.map(({ key, label, icon }) => (
        <KpiTile
          compare={compare}
          icon={icon}
          key={key}
          label={label()}
          metric={overview === undefined ? undefined : overview.metrics[key]}
        />
      ))}
      <KpiTile compare={compare} icon={Comment} label={m.dashboard_kpi_comments()} metric={null} />
    </div>
  )
}
