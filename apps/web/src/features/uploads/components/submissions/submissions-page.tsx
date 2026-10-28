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
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router"
import { DashboardPage, ListCard } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  mySubmissionsQueryOptions,
  SUBMISSIONS_PER_PAGE,
  useInvalidateReview,
} from "@/features/uploads/api/submissions"
import { MySubmissionRow } from "@/features/uploads/components/submissions/my-submission-row"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/submissions")

export function SubmissionsPage() {
  const { page } = routeApi.useLoaderDeps()
  const { data } = useSuspenseQuery(mySubmissionsQueryOptions(page))
  const invalidate = useInvalidateReview()
  const withdraw = useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api.chapters[":id"].withdraw.$post({ param: { id } })),
    onSuccess: invalidate,
  })
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
              <MySubmissionRow
                key={submission.id}
                onWithdraw={() => {
                  withdraw.mutate(submission.id)
                }}
                submission={submission}
                withdrawing={withdraw.isPending}
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
