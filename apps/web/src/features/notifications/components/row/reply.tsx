import "@stylexjs/stylex"
import { Comment, Reply, ThumbsUp } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { TimeAgo } from "@/components/time/time-ago"
import { useCreateReply } from "@/features/comments/api/comments"
import { CommentComposer } from "@/features/comments/components/comment-composer"
import {
  type Notification,
  useMarkNotificationRead,
  useUpvoteFromNotification,
} from "@/features/notifications/api/notifications"
import { CommentLink } from "@/features/notifications/lib/notification-links"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import type { NotificationRowVariant } from "./notification-kinds"
import { notificationRowStyles as styles } from "./notification-row-styles"

export function ReplyActions({
  notification,
  variant,
  onOpen,
  onReply,
}: {
  notification: Extract<Notification, { type: "COMMENT_REPLY" }>
  variant: NotificationRowVariant
  onOpen: () => void
  onReply: () => void
}) {
  const upvote = useUpvoteFromNotification()
  const { comment } = notification

  return (
    <span sx={styles.actions}>
      <Button onClick={onReply} size="xs" sx={[styles.above, styles.replyAction]} variant="ghost">
        <Reply />
        {m.comments_reply()}
      </Button>
      <Button
        aria-pressed={comment.viewerVoted}
        onClick={() => {
          upvote(comment.id, !comment.viewerVoted)
        }}
        size="xs"
        sx={[styles.above, comment.viewerVoted ? styles.votedAction : styles.mutedAction]}
        variant="ghost"
      >
        <ThumbsUp />
        {comment.viewerVoted ? m.notifications_upvoted() : m.comments_vote()}
      </Button>
      {variant === "page" ? (
        <Button
          render={<CommentLink commentId={comment.id} onClick={onOpen} target={comment.target} />}
          size="xs"
          sx={[styles.above, styles.mutedAction, styles.viewThread]}
          variant="ghost"
        >
          <Comment />
          {m.notifications_view_thread()}
        </Button>
      ) : (
        <TimeAgo compact date={notification.lastEventAt} sx={[styles.time, styles.actionsTime]} />
      )}
    </span>
  )
}

export function InlineReply({
  notification,
  onDone,
}: {
  notification: Extract<Notification, { type: "COMMENT_REPLY" }>
  onDone: () => void
}) {
  const { comment } = notification
  const create = useCreateReply(comment.rootId)
  const markRead = useMarkNotificationRead()

  return (
    <div sx={styles.composer}>
      <CommentComposer
        autoFocus
        error={create.error === null ? null : getErrorMessage(create.error)}
        onCancel={onDone}
        onSubmit={async (content) => {
          await create.mutateAsync({ replyTo: comment.id, content })
          toastManager.add({ title: m.notifications_reply_posted(), type: "success" })

          if (notification.readAt === null) {
            markRead.mutate(notification.id)
          }

          onDone()
        }}
        pending={create.isPending}
        placeholder={m.notifications_reply_placeholder({
          name: comment.author.displayUsername,
        })}
        rows={2}
        submitLabel={m.comments_reply()}
      />
    </div>
  )
}
