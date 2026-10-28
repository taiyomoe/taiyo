// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { CheckCircle, FileEdit, UserCheck } from "@taiyomoe/ui/components/icons"
import type { MyOverview } from "@/features/dashboard/api/my-overview"
import { homeStyles } from "@/features/dashboard/components/home/home-styles"
import { QueueCard } from "@/features/dashboard/components/home/queue-card"
import { m } from "@/paraglide/messages"

export function HomeQueues({ queues }: { queues: MyOverview["queues"] | undefined }) {
  const visible =
    queues === undefined
      ? []
      : [
          {
            key: "chapters",
            count: queues.chapters,
            label: m.dashboard_nav_chapter_reviews(),
            icon: <CheckCircle />,
            to: "/dashboard/chapter-reviews" as const,
          },
          {
            key: "suggestions",
            count: queues.suggestions,
            label: m.dashboard_nav_review_suggestions(),
            icon: <FileEdit />,
            to: "/dashboard/suggestions" as const,
          },
          {
            key: "groups",
            count: queues.groupRequests,
            label: m.dashboard_nav_ownership_requests(),
            icon: <UserCheck />,
            to: "/dashboard/group-requests" as const,
          },
        ].flatMap((queue) => (queue.count === null ? [] : [{ ...queue, count: queue.count }]))

  if (visible.length === 0) {
    return null
  }

  return (
    <section sx={homeStyles.section}>
      <h2 sx={homeStyles.sectionTitle}>{m.home_overview_queues()}</h2>
      <div sx={homeStyles.grid}>
        {visible.map((queue) => (
          <QueueCard
            count={queue.count}
            icon={queue.icon}
            key={queue.key}
            label={queue.label}
            to={queue.to}
          />
        ))}
      </div>
    </section>
  )
}
