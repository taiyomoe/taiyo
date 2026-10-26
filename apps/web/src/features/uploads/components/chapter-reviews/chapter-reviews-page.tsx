import { CheckCircle } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { DashboardPage, ListCard } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  type ChapterSubmission,
  reviewQueueQueryOptions,
  SUBMISSIONS_PER_PAGE,
} from "@/features/uploads/api/submissions"
import { BulkReviewBar } from "@/features/uploads/components/chapter-reviews/bulk-review-bar"
import { ReviewDialog } from "@/features/uploads/components/chapter-reviews/review-dialog"
import { ReviewQueueRow } from "@/features/uploads/components/chapter-reviews/review-queue-row"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/chapter-reviews")

export function ChapterReviewsPage() {
  const { session } = routeApi.useRouteContext()
  const { page } = routeApi.useLoaderDeps()
  const { user } = session
  const { data } = useSuspenseQuery(reviewQueueQueryOptions(page))
  const can = usePermissions(user)
  const navigate = useNavigate({ from: "/dashboard/chapter-reviews" })
  const [reviewing, setReviewing] = useState<ChapterSubmission | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const pageIds = data.data.map((submission) => submission.id)
  const selection = selected.filter((id) => pageIds.includes(id))

  return (
    <DashboardPage subtitle={m.review_chapters_subtitle()} title={m.review_chapters_title()}>
      {data.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCircle />
            </EmptyMedia>
            <EmptyTitle>{m.review_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.review_chapters_empty()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <BulkReviewBar
            allSelected={selection.length === pageIds.length}
            onClear={() => {
              setSelected([])
            }}
            onToggleAll={(checked) => {
              setSelected(checked ? pageIds : [])
            }}
            selection={selection}
          />
          <ListCard>
            {data.data.map((submission) => (
              <ReviewQueueRow
                key={submission.id}
                onReview={() => {
                  setReviewing(submission)
                }}
                onSelect={(checked) => {
                  setSelected((current) =>
                    checked
                      ? [...current, submission.id]
                      : current.filter((id) => id !== submission.id),
                  )
                }}
                selected={selection.includes(submission.id)}
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
                to="/dashboard/chapter-reviews"
              />
            )}
          />
        </>
      )}
      <ReviewDialog
        can={can}
        onClose={() => {
          setReviewing(null)
        }}
        submission={reviewing}
      />
    </DashboardPage>
  )
}
