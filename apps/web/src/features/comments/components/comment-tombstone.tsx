import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Comment } from "@/features/comments/api/comments"
import { CommentMenu } from "@/features/comments/components/comment-menu"
import { commentStyles } from "@/features/comments/components/comment-styles"
import { useCommentsContext } from "@/features/comments/lib/comments-context"
import { m } from "@/paraglide/messages"

const MESSAGES = {
  AUTHOR: m.comments_removed_author,
  PAGE_OWNER: m.comments_removed_owner,
  MODERATOR: m.comments_removed_moderator,
  ACCOUNT_DELETED: m.comments_removed_account,
  HIDDEN: m.comments_removed_hidden,
} satisfies Record<NonNullable<Comment["removal"]>, () => string>
const styles = stylex.create({
  placeholder: {
    borderColor: colors.border,
    borderRadius: "50%",
    borderStyle: "dashed",
    borderWidth: 1,
  },
  message: {
    margin: 0,
    color: colors.mutedForeground,
    flexGrow: 1,
    fontSize: "0.875rem",
    fontStyle: "italic",
    lineHeight: 1.6,
    paddingTop: "0.5rem",
  },
})

export function CommentTombstone({ comment }: { comment: Comment }) {
  const { canReview } = useCommentsContext()

  return (
    <div sx={commentStyles.item}>
      <span aria-hidden sx={[commentStyles.avatar, styles.placeholder]} />
      <p sx={styles.message}>{comment.removal === null ? null : MESSAGES[comment.removal]()}</p>
      {canReview ? <CommentMenu comment={comment} onEdit={() => undefined} /> : null}
    </div>
  )
}
