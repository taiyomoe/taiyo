import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useDeferredValue, useRef } from "react"
import { uniqueBy } from "remeda"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { CommentSkeleton } from "@/features/comments/components/comment-skeleton"
import { useLoadMoreOnScroll } from "@/features/comments/hooks/use-load-more-on-scroll"
import { userReviewsQueryOptions } from "@/features/reviews/api/reviews"
import { ReviewCard } from "@/features/reviews/components/review-card"
import { getErrorMessage } from "@/lib/errors"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  empty: {
    margin: 0,
    paddingBlock: "2rem",
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    textAlign: "center",
  },
  sentinel: {
    height: 1,
  },
  retry: {
    gap: "0.75rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    paddingTop: "1rem",
  },
})

/** The reviews a user wrote, newest first, each titled by its media. */
export function UserReviews({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const query = useInfiniteQuery(userReviewsQueryOptions(userId, contentRatings))
  const sentinel = useRef<HTMLDivElement | null>(null)
  const reviews = uniqueBy(
    query.data?.pages.flatMap((page) => page.data) ?? [],
    (review) => review.id,
  )

  useLoadMoreOnScroll(sentinel, {
    enabled: query.hasNextPage && !query.isFetchingNextPage && !query.isFetchNextPageError,
    onLoadMore: () => {
      void query.fetchNextPage()
    },
  })

  if (query.isPending) {
    return <CommentSkeleton />
  }

  if (query.data === undefined) {
    return <ErrorAlert message={getErrorMessage(query.error)} />
  }

  if (reviews.length === 0) {
    return (
      <p sx={styles.empty}>{isOwner ? m.reviews_profile_empty_own() : m.reviews_profile_empty()}</p>
    )
  }

  return (
    <section aria-label={m.reviews_title()} sx={styles.list}>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
      {query.isFetchingNextPage ? <CommentSkeleton count={2} /> : null}
      {query.isFetchNextPageError ? (
        <div sx={styles.retry}>
          <ErrorAlert message={getErrorMessage(query.error)} />
          <Button
            onClick={() => {
              void query.fetchNextPage()
            }}
            size="sm"
            variant="outline"
          >
            {m.comments_retry()}
          </Button>
        </div>
      ) : null}
      <div ref={sentinel} sx={styles.sentinel} />
    </section>
  )
}
