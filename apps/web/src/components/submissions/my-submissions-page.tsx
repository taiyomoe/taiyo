import { CloudUpload } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { ScheduleActions } from "@/components/chapters/schedule-actions"
import { DashboardPage, ListCard } from "@/components/dashboard/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { SubmissionRow } from "@/components/submissions/submission-row"
import {
  type ChapterSubmission,
  mySubmissionsQueryOptions,
  SUBMISSIONS_PER_PAGE,
  useWithdrawChapter,
} from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

export function MySubmissionsPage({ page }: { page: number }) {
  const { data } = useSuspenseQuery(mySubmissionsQueryOptions(page))
  const withdraw = useWithdrawChapter()
  const submissionActions = ({ id, number, status, publishAt }: ChapterSubmission) => {
    if (status === "SCHEDULED" && publishAt !== null) {
      return <ScheduleActions chapter={{ id, number, publishAt }} />
    }

    return status === "PENDING" ? (
      <Button
        disabled={withdraw.isPending}
        onClick={() => {
          withdraw.mutate(id)
        }}
        size="sm"
        variant="ghost"
      >
        {m.submission_withdraw()}
      </Button>
    ) : undefined
  }
  const navigate = useNavigate({ from: "/dashboard/submissions" })

  return (
    <DashboardPage
      actions={
        <Button render={<Link to="/dashboard/upload" />}>
          <CloudUpload />
          {m.dashboard_nav_upload()}
        </Button>
      }
      subtitle={m.submissions_subtitle()}
      title={m.submissions_title()}
    >
      {data.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CloudUpload />
            </EmptyMedia>
            <EmptyTitle>{m.submissions_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.submissions_empty_description()}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to="/dashboard/upload" />} variant="outline">
              {m.dashboard_nav_upload()}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <ListCard>
            {data.data.map((submission) => (
              <SubmissionRow
                actions={submissionActions(submission)}
                key={submission.id}
                submission={submission}
              />
            ))}
          </ListCard>
          <PagePagination
            onJump={(target) => {
              void navigate({ search: { page: target === 1 ? undefined : target } })
            }}
            page={page}
            pageCount={Math.ceil(data.meta.total / SUBMISSIONS_PER_PAGE)}
            renderLink={(target) => (
              <Link
                search={{ page: target === 1 ? undefined : target }}
                to="/dashboard/submissions"
              />
            )}
          />
        </>
      )}
    </DashboardPage>
  )
}
