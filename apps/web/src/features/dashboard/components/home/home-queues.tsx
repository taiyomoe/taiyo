// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { MyOverview } from "@/features/dashboard/api/my-overview"
import { homeStyles } from "@/features/dashboard/components/home/home-styles"
import { QueueCard } from "@/features/dashboard/components/home/queue-card"
import { getVisibleQueues } from "@/features/dashboard/lib/dashboard-queues"
import { m } from "@/paraglide/messages"

export function HomeQueues({ queues }: { queues: MyOverview["queues"] | undefined }) {
  const visible = getVisibleQueues(queues)

  if (visible.length === 0) {
    return null
  }

  return (
    <section sx={homeStyles.section}>
      <h2 sx={homeStyles.sectionTitle}>{m.home_overview_queues()}</h2>
      <div sx={homeStyles.grid}>
        {visible.map(({ key, count, icon: Icon, label, to }) => (
          <QueueCard count={count} icon={<Icon />} key={key} label={label()} to={to} />
        ))}
      </div>
    </section>
  )
}
