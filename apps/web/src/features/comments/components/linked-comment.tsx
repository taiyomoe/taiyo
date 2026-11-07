import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { commentContextQueryOptions } from "@/features/comments/api/comments"
import { CommentSkeleton } from "@/features/comments/components/comment-skeleton"
import { CommentThread } from "@/features/comments/components/comment-thread"
import { useCommentsContext } from "@/features/comments/lib/comments-context"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    paddingBottom: "1rem",
  },
  label: {
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  gone: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

export function LinkedComment({ commentId }: { commentId: string }) {
  const { target } = useCommentsContext()
  const query = useQuery(commentContextQueryOptions(commentId))
  const root = useRef<HTMLDivElement | null>(null)
  const loaded = query.isSuccess

  useEffect(() => {
    if (loaded) {
      root.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [loaded])

  if (query.isPending) {
    return <CommentSkeleton count={1} />
  }

  const belongs =
    query.isSuccess && query.data.target.type === target.type && query.data.target.id === target.id

  return (
    <div ref={root} sx={styles.root}>
      <span sx={styles.label}>{m.comments_linked()}</span>
      {belongs ? (
        <CommentThread highlightedId={commentId} root={query.data.comment} />
      ) : (
        <p sx={styles.gone}>{m.comments_linked_gone()}</p>
      )}
    </div>
  )
}
