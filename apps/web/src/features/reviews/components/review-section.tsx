import * as stylex from "@stylexjs/stylex"
import {
  ClockArrowDown,
  SortAscending,
  SortDescending,
  ThumbsUp,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useDeferredValue, useRef, useState } from "react"
import { uniqueBy } from "remeda"
import type { OptionSet } from "@/components/fields/option-select"
import type { Session } from "@/lib/session"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { OptionSelect } from "@/components/fields/option-select"
import { CommentSkeleton } from "@/features/comments/components/comment-skeleton"
import { useLoadMoreOnScroll } from "@/features/comments/hooks/use-load-more-on-scroll"
import { libraryEntryQueryOptions } from "@/features/library/api/library"
import {
  mediaReviewsQueryOptions,
  myReviewQueryOptions,
  REVIEW_SORTS,
  type ReviewSort,
  reviewCountQueryOptions,
} from "@/features/reviews/api/reviews"
import { ReviewCard } from "@/features/reviews/components/review-card"
import { ReviewComposer } from "@/features/reviews/components/review-composer"
import { loadReviewDraft } from "@/features/reviews/lib/review-body"
import { useClientValue } from "@/hooks/use-client-value"
import { getErrorMessage } from "@/lib/errors"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const SORT_LABELS = {
  helpful: m.reviews_sort_helpful,
  newest: m.reviews_sort_newest,
  highest: m.reviews_sort_highest,
  lowest: m.reviews_sort_lowest,
} satisfies Record<ReviewSort, () => string>
const SORT_ICONS = {
  helpful: ThumbsUp,
  newest: ClockArrowDown,
  highest: SortDescending,
  lowest: SortAscending,
} satisfies Record<ReviewSort, OptionSet<ReviewSort>["fieldIcon"]>
const SORT_OPTIONS: OptionSet<ReviewSort> = {
  values: REVIEW_SORTS,
  label: (sort) => SORT_LABELS[sort](),
  icon: (sort) => SORT_ICONS[sort],
  fieldIcon: SortDescending,
}
const styles = stylex.create({
  root: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  title: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "baseline",
    color: colors.foreground,
    display: "flex",
    fontSize: "1.0625rem",
    fontWeight: 650,
  },
  count: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 500,
  },
  sort: {
    minWidth: "11rem",
  },
  prompt: {
    margin: 0,
    borderRadius: radius.xl,
    gap: "0.75rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.9375rem",
    justifyContent: "space-between",
  },
  promptText: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  promptNote: {
    fontSize: "0.8125rem",
  },
  link: {
    color: colors.foreground,
    fontWeight: 600,
  },
  list: {
    display: "flex",
    flexDirection: "column",
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

export function useReviewCount(mediaId: string) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)

  return useQuery(reviewCountQueryOptions(mediaId, contentRatings)).data
}

function MyReview({ mediaId, viewer }: { mediaId: string; viewer: Session["user"] }) {
  const entry = useQuery(libraryEntryQueryOptions(mediaId))
  const mine = useQuery(myReviewQueryOptions(mediaId))
  const hasDraft = useClientValue(() => loadReviewDraft(viewer.id, mediaId) !== null)
  const [opened, setEditing] = useState<boolean | null>(null)
  const editing = opened ?? hasDraft === true

  if (entry.data === undefined || mine.data === undefined) {
    return null
  }

  const review = mine.data

  if (editing && (review !== null || entry.data.score !== null)) {
    return (
      <ReviewComposer
        mediaId={mediaId}
        onDone={() => {
          setEditing(false)
        }}
        review={review}
        userId={viewer.id}
      />
    )
  }

  if (review !== null) {
    return (
      <ReviewCard
        label={m.reviews_yours()}
        onEdit={() => {
          setEditing(true)
        }}
        review={review}
      />
    )
  }

  if (entry.data.score === null) {
    return (
      <p sx={styles.prompt}>
        <span sx={styles.promptText}>
          {m.reviews_rate_first()}
          <span sx={styles.promptNote}>{m.reviews_public_notice()}</span>
        </span>
      </p>
    )
  }

  return (
    <div sx={styles.prompt}>
      <span sx={styles.promptText}>
        {m.reviews_write_prompt()}
        <span sx={styles.promptNote}>{m.reviews_public_notice()}</span>
      </span>
      <Button
        onClick={() => {
          setEditing(true)
        }}
      >
        {m.reviews_write()}
      </Button>
    </div>
  )
}

function ReviewList({
  mediaId,
  sort,
  mineId,
}: {
  mediaId: string
  sort: ReviewSort
  mineId: string | null
}) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const query = useInfiniteQuery(mediaReviewsQueryOptions(mediaId, sort, contentRatings))
  const sentinel = useRef<HTMLDivElement | null>(null)
  const reviews = uniqueBy(
    query.data?.pages.flatMap((page) => page.data) ?? [],
    (review) => review.id,
  )
  const others = reviews.filter((review) => review.id !== mineId)

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

  if (others.length === 0 && !query.hasNextPage) {
    return reviews.length === 0 ? <p sx={styles.empty}>{m.reviews_empty()}</p> : null
  }

  return (
    <div sx={styles.list}>
      {others.map((review) => (
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
    </div>
  )
}

export function ReviewSection({
  mediaId,
  viewer,
}: {
  mediaId: string
  viewer: Session["user"] | null
}) {
  const [sort, setSort] = useState<ReviewSort>("helpful")
  const total = useReviewCount(mediaId)
  const mine = useQuery({ ...myReviewQueryOptions(mediaId), enabled: viewer !== null })

  return (
    <section aria-label={m.reviews_title()} sx={styles.root}>
      <div sx={styles.header}>
        <h2 sx={styles.title}>
          {m.reviews_title()}
          {total === undefined || total === 0 ? null : <span sx={styles.count}>{total}</span>}
        </h2>
        <OptionSelect
          label={m.reviews_sort()}
          onChange={setSort}
          options={SORT_OPTIONS}
          size="sm"
          sx={styles.sort}
          value={sort}
        />
      </div>
      {viewer === null ? (
        <p sx={styles.prompt}>
          <span>
            <Link to="/auth/sign-in" {...stylex.props(styles.link)}>
              {m.comments_sign_in_link()}
            </Link>{" "}
            {m.reviews_sign_in()}
          </span>
        </p>
      ) : (
        <MyReview mediaId={mediaId} viewer={viewer} />
      )}
      <ReviewList mediaId={mediaId} mineId={mine.data?.id ?? null} sort={sort} />
    </section>
  )
}
