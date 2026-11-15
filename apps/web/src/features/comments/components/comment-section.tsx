import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { uniqueBy } from "remeda"
import type { CommentTarget } from "@/features/comments/lib/comment-target"
import type { Session } from "@/lib/session"
import { ErrorAlert } from "@/components/feedback/error-alert"
import {
  COMMENT_SORTS,
  type CommentSort,
  commentContextQueryOptions,
  commentsQueryOptions,
} from "@/features/comments/api/comments"
import { CommentSkeleton } from "@/features/comments/components/comment-skeleton"
import { CommentThread } from "@/features/comments/components/comment-thread"
import { LinkedComment } from "@/features/comments/components/linked-comment"
import { NewComment } from "@/features/comments/components/new-comment"
import { useCommentCount } from "@/features/comments/hooks/use-comment-count"
import { useLoadMoreOnScroll } from "@/features/comments/hooks/use-load-more-on-scroll"
import { CommentsContext } from "@/features/comments/lib/comments-context"
import { getErrorMessage } from "@/lib/errors"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const SORT_LABELS = {
  newest: m.comments_sort_newest,
  oldest: m.comments_sort_oldest,
  top: m.comments_sort_top,
} satisfies Record<CommentSort, () => string>
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
const useCommentList = (target: CommentTarget, sort: CommentSort) =>
  useInfiniteQuery(commentsQueryOptions(target, sort))

function CommentList({
  query,
  excludeId,
}: {
  query: ReturnType<typeof useCommentList>
  excludeId: string | null
}) {
  const sentinel = useRef<HTMLDivElement | null>(null)
  const roots = uniqueBy(query.data?.pages.flatMap((page) => page.data) ?? [], (root) => root.id)

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

  if (roots.length === 0) {
    return <p sx={styles.empty}>{m.comments_empty()}</p>
  }

  return (
    <div sx={styles.list}>
      {roots
        .filter((root) => root.id !== excludeId)
        .map((root) => (
          <CommentThread key={root.id} root={root} />
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

export function CommentSection({
  target,
  viewer,
  getPermalink,
  linkedCommentId = null,
  title = m.comments_title(),
}: {
  target: CommentTarget
  viewer: Session["user"] | null
  getPermalink: (commentId: string) => string
  linkedCommentId?: string | null
  title?: string
}) {
  const [sort, setSort] = useState<CommentSort>("newest")
  const can = usePermissions(viewer)
  const list = useCommentList(target, sort)
  const total = useCommentCount(target)
  const linked = useQuery({
    ...commentContextQueryOptions(linkedCommentId ?? ""),
    enabled: linkedCommentId !== null,
  })

  return (
    <CommentsContext
      value={{
        target,
        viewer,
        canReview: can("comment.review"),
        canRemoveImages: can("comment.removeImage"),
        getPermalink,
      }}
    >
      <section aria-label={title} sx={styles.root}>
        <div sx={styles.header}>
          <h2 sx={styles.title}>
            {title}
            {total === undefined || total === 0 ? null : <span sx={styles.count}>{total}</span>}
          </h2>
          <SegmentedControl
            aria-label={m.comments_sort()}
            onValueChange={(next: unknown) => {
              const selected = COMMENT_SORTS.find((value) => value === next)

              if (selected !== undefined) {
                setSort(selected)
              }
            }}
            value={sort}
          >
            {COMMENT_SORTS.map((value) => (
              <SegmentedControlItem key={value} size="sm" value={value}>
                {SORT_LABELS[value]()}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
        <NewComment target={target} viewer={viewer} />
        {linkedCommentId === null ? null : <LinkedComment commentId={linkedCommentId} />}
        <CommentList excludeId={linked.data?.comment.id ?? null} query={list} />
      </section>
    </CommentsContext>
  )
}
