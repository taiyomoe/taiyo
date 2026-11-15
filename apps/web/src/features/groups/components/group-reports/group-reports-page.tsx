import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { GroupReport } from "@/features/groups/api/groups"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { requestCardStyles } from "@/features/groups/components/group-requests/request-card-styles"
import { RequestList } from "@/features/groups/components/group-requests/request-list"
import { Requester } from "@/features/groups/components/group-requests/requester"
import { GROUP_REPORT_REASON_LABELS } from "@/features/groups/lib/group-report-labels"
import { api } from "@/lib/api"
import { ensureSuccess, unwrapEnvelope } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const REPORTS_PER_PAGE = 50
const styles = stylex.create({
  actions: {
    gap: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
  },
})

export function GroupReportsPage() {
  const reports = useQuery({
    queryKey: ["group-reports", { page: 1 }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["group-reports"].$get(
          { query: { page: "1", perPage: String(REPORTS_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })

  return (
    <DashboardPage subtitle={m.reports_subtitle()} title={m.reports_title()}>
      <RequestList
        items={reports.data?.data}
        render={(report) => <ReportCard key={report.id} report={report} />}
      />
    </DashboardPage>
  )
}

function ReportCard({ report }: { report: GroupReport }) {
  const queryClient = useQueryClient()
  const review = useMutation({
    mutationFn: async (status: "RESOLVED" | "DISMISSED") =>
      ensureSuccess(
        await api["group-reports"][":id"].review.$post({
          param: { id: report.id },
          json: { status },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["group-reports"] }),
  })

  return (
    <li sx={requestCardStyles.card}>
      <div sx={requestCardStyles.top}>
        <Requester person={report.reporter} verb={m.reports_reported()} />
        <TimeAgo date={report.createdAt} sx={requestCardStyles.time} />
      </div>
      <div sx={requestCardStyles.target}>
        <GroupAvatar id={report.group.id} name={report.group.name} />
        <Link
          params={{ groupId: report.group.id }}
          {...stylex.props(requestCardStyles.targetName)}
          to="/groups/$groupId"
        >
          {report.group.name}
        </Link>
        <Badge variant="error">{GROUP_REPORT_REASON_LABELS[report.reason]()}</Badge>
      </div>
      {report.details === null ? null : <p sx={requestCardStyles.quote}>{report.details}</p>}
      <ErrorAlert message={review.isError ? getErrorMessage(review.error) : null} />
      <div sx={styles.actions}>
        <Button
          disabled={review.isPending}
          onClick={() => {
            review.mutate("DISMISSED")
          }}
          variant="outline"
        >
          {m.reports_dismiss()}
        </Button>
        <Button
          disabled={review.isPending}
          onClick={() => {
            review.mutate("RESOLVED")
          }}
        >
          {m.reports_resolve()}
        </Button>
      </div>
    </li>
  )
}
