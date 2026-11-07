import * as stylex from "@stylexjs/stylex"
import { Reply, ThumbsUp } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { type Comment, useVoteComment } from "@/features/comments/api/comments"
import { CommentMenu } from "@/features/comments/components/comment-menu"
import { useCommentsContext } from "@/features/comments/lib/comments-context"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  actions: {
    gap: "0.25rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    marginInlineStart: "-0.5rem",
  },
  count: {
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
  voted: {
    color: colors.primary,
  },
  muted: {
    color: colors.mutedForeground,
  },
})

export function CommentActions({
  comment,
  onReply,
  onEdit,
}: {
  comment: Comment
  onReply: (() => void) | null
  onEdit: () => void
}) {
  const { viewer } = useCommentsContext()
  const vote = useVoteComment()
  const isAuthor = viewer !== null && comment.author?.id === viewer.id
  const voteLabel = comment.viewerVoted ? m.comments_unvote() : m.comments_vote()

  return (
    <div sx={styles.actions}>
      <Button
        aria-label={voteLabel}
        aria-pressed={comment.viewerVoted}
        disabled={viewer === null || isAuthor}
        onClick={() => {
          vote.mutate(
            { id: comment.id, voted: !comment.viewerVoted },
            {
              onError: (error) => {
                toastManager.add({ title: getErrorMessage(error), type: "error" })
              },
            },
          )
        }}
        size="xs"
        sx={comment.viewerVoted ? styles.voted : styles.muted}
        title={voteLabel}
        variant="ghost"
      >
        <ThumbsUp />
        {comment.upvoteCount > 0 ? <span sx={styles.count}>{comment.upvoteCount}</span> : null}
      </Button>
      {onReply === null ? null : (
        <Button onClick={onReply} size="xs" sx={styles.muted} variant="ghost">
          <Reply />
          {m.comments_reply()}
        </Button>
      )}
      <CommentMenu comment={comment} onEdit={onEdit} />
    </div>
  )
}
