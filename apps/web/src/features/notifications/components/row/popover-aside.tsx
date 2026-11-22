import "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Link } from "@tanstack/react-router"
import type { Notification } from "@/features/notifications/api/notifications"
import { TimeAgo } from "@/components/time/time-ago"
import { m } from "@/paraglide/messages"
import { notificationRowStyles as styles } from "./notification-row-styles"
import { UnreadDot } from "./row-parts"

/** The text of the upvoted or reported comment, while it is up. */
const getQuotedExcerpt = (notification: Notification) => {
  if (notification.type === "COMMENT_LIKE") {
    return notification.comment.excerpt
  }

  return notification.type === "REPORT_REVIEWED" && notification.report.kind === "COMMENT"
    ? (notification.report.comment?.excerpt ?? null)
    : null
}

export function CommentQuote({ notification }: { notification: Notification }) {
  const excerpt = getQuotedExcerpt(notification)

  return excerpt === null ? null : (
    <span sx={styles.quote}>
      <span sx={styles.quoteText}>
        {excerpt === "" ? (
          <span sx={styles.quoteImage}>{m.notifications_comment_image()}</span>
        ) : (
          excerpt
        )}
      </span>
    </span>
  )
}

export function PopoverAside({
  notification,
  onOpen,
}: {
  notification: Notification
  onOpen: () => void
}) {
  const unread = notification.readAt === null

  if (notification.type === "CHAPTER_PUBLISHED") {
    return (
      <Button
        aria-label={m.notifications_read_chapter_label({
          number: notification.chapter.number,
          title: notification.chapter.mediaTitle ?? m.notifications_untitled_media(),
        })}
        render={
          <Link
            onClick={onOpen}
            params={{ chapterId: notification.chapter.id }}
            to="/chapters/$chapterId"
          />
        }
        size="sm"
        sx={[styles.above, styles.readButton]}
        variant={unread ? "default" : "outline"}
      >
        {m.notifications_read_chapter()}
      </Button>
    )
  }

  if (notification.type === "COMMENT_REPLY") {
    return <UnreadDot corner hidden={!unread} />
  }

  return (
    <>
      <TimeAgo compact date={notification.lastEventAt} sx={styles.time} />
      <UnreadDot corner hidden={!unread} />
    </>
  )
}
