import type { ReactNode } from "react"
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
import { noop, useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { ScheduleActions } from "@/components/chapters/schedule-actions"
import { DashboardPage, ListCard } from "@/components/dashboard/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { SubmissionRow } from "@/components/submissions/submission-row"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import {
  mySubmissionsQueryOptions,
  SUBMISSIONS_PER_PAGE,
  useInvalidateReview,
} from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/submissions")({
  head: () => ({ meta: [{ title: m.submissions_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient.query(mySubmissionsQueryOptions(page)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: function Submissions() {
    const { page } = Route.useLoaderDeps()
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
              {data.data.map((submission) => {
                let actions: ReactNode

                if (submission.status === "SCHEDULED" && submission.publishAt !== null) {
                  actions = (
                    <ScheduleActions
                      chapter={{
                        id: submission.id,
                        number: submission.number,
                        publishAt: submission.publishAt,
                      }}
                    />
                  )
                } else if (submission.status === "PENDING") {
                  actions = (
                    <Button
                      disabled={withdraw.isPending}
                      onClick={() => {
                        withdraw.mutate(submission.id)
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      {m.submission_withdraw()}
                    </Button>
                  )
                }

                return (
                  <SubmissionRow actions={actions} key={submission.id} submission={submission} />
                )
              })}
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
  },
})
