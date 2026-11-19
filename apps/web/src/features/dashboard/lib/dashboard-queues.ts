import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { LinkProps } from "@tanstack/react-router"
import type { ReactElement } from "react"
import { CheckCircle, FileEdit, Flag, UserCheck } from "@taiyomoe/ui/components/icons"
import type { MyOverview } from "@/features/dashboard/api/my-overview"
import { m } from "@/paraglide/messages"

/** The review queues of the dashboard, in the order of its sidebar. */
const DASHBOARD_QUEUES: ReadonlyArray<{
  key: keyof MyOverview["queues"]
  label: () => string
  icon: (props: IconProps) => ReactElement
  to: NonNullable<LinkProps["to"]>
}> = [
  {
    key: "chapters",
    label: m.dashboard_nav_chapter_reviews,
    icon: CheckCircle,
    to: "/dashboard/chapter-reviews",
  },
  { key: "pageReports", label: m.page_reports_title, icon: Flag, to: "/dashboard/page-reports" },
  {
    key: "groupRequests",
    label: m.dashboard_nav_ownership_requests,
    icon: UserCheck,
    to: "/dashboard/group-requests",
  },
  {
    key: "suggestions",
    label: m.dashboard_nav_review_suggestions,
    icon: FileEdit,
    to: "/dashboard/suggestions",
  },
  {
    key: "commentReports",
    label: m.comment_reports_title,
    icon: Flag,
    to: "/dashboard/comment-reports",
  },
  { key: "groupReports", label: m.reports_title, icon: Flag, to: "/dashboard/group-reports" },
  {
    key: "userReports",
    label: m.user_reports_title,
    icon: Flag,
    to: "/dashboard/user-reports",
  },
]

/** The queues the viewer can review, with their size. */
export const getVisibleQueues = (queues: MyOverview["queues"] | undefined) =>
  queues === undefined
    ? []
    : DASHBOARD_QUEUES.flatMap((queue) => {
        const count = queues[queue.key]

        return count === null ? [] : [{ ...queue, count }]
      })
