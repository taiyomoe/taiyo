import "@stylexjs/stylex"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { useState } from "react"
import {
  type Notification,
  useMarkNotificationRead,
} from "@/features/notifications/api/notifications"
import { notificationText } from "@/features/notifications/lib/notification-text"
import { m } from "@/paraglide/messages"
import type { NotificationRowVariant } from "./row/notification-kinds"
import { ChapterContent } from "./row/chapter-content"
import { notificationRowStyles as styles } from "./row/notification-row-styles"
import { PageActions } from "./row/page-actions"
import { CommentQuote, PopoverAside } from "./row/popover-aside"
import { PrimaryLink } from "./row/primary-link"
import { InlineReply, ReplyActions } from "./row/reply"
import { Thumbnail, KindLabel } from "./row/row-parts"

type RowProps = {
  notification: Notification
  viewerId: string
  variant: NotificationRowVariant
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  onNavigate?: () => void
  onShowFollowers?: () => void
}

export function NotificationRow({
  notification,
  viewerId,
  variant,
  selected = false,
  onSelectedChange,
  onNavigate,
  onShowFollowers,
}: RowProps) {
  const markRead = useMarkNotificationRead()
  const [replying, setReplying] = useState(false)
  const unread = notification.readAt === null
  const page = variant === "page"
  const onRead = () => {
    if (unread) {
      markRead.mutate(notification.id)
    }
  }
  const onOpen = () => {
    onRead()
    onNavigate?.()
  }

  return (
    <article
      sx={[
        styles.row,
        page && styles.rowPage,
        unread && styles.unread,
        selected && styles.selected,
      ]}
    >
      {page ? (
        <Checkbox
          aria-label={m.notifications_select()}
          checked={selected}
          onCheckedChange={(checked) => {
            onSelectedChange?.(checked)
          }}
          sx={styles.checkbox}
        />
      ) : null}
      <Thumbnail notification={notification} page={page} />
      <div sx={styles.body}>
        {page ? <KindLabel notification={notification} /> : null}
        {notification.type === "CHAPTER_PUBLISHED" ? (
          <ChapterContent notification={notification} onOpen={onOpen} variant={variant} />
        ) : (
          <PrimaryLink
            notification={notification}
            onOpen={onOpen}
            onRead={onRead}
            onShowFollowers={onShowFollowers}
            sx={styles.sentence}
          >
            {notificationText(notification, viewerId)}
          </PrimaryLink>
        )}
        {notification.type === "COMMENT_REPLY" ? (
          <>
            <span sx={styles.quote}>
              <span sx={styles.quoteText}>
                {notification.comment.excerpt === "" ? (
                  <span sx={styles.quoteImage}>{m.notifications_reply_image()}</span>
                ) : (
                  notification.comment.excerpt
                )}
              </span>
            </span>
            <ReplyActions
              notification={notification}
              onOpen={onOpen}
              onReply={() => {
                setReplying(true)
              }}
              variant={variant}
            />
            {replying ? (
              <InlineReply
                notification={notification}
                onDone={() => {
                  setReplying(false)
                }}
              />
            ) : null}
          </>
        ) : null}
        {page ? <CommentQuote notification={notification} /> : null}
      </div>
      {page ? (
        <PageActions notification={notification} onOpen={onOpen} />
      ) : (
        <PopoverAside notification={notification} onOpen={onOpen} />
      )}
    </article>
  )
}

export function NotificationRowSkeleton({ variant }: { variant: NotificationRowVariant }) {
  const page = variant === "page"

  return (
    <div sx={[styles.row, page && styles.rowPage]}>
      {page ? <Skeleton sx={styles.checkbox} /> : null}
      <Skeleton sx={[styles.cover, page && styles.coverPage]} />
      <span sx={styles.body}>
        <Skeleton sx={styles.skeletonLine} />
        <Skeleton sx={styles.skeletonShort} />
      </span>
    </div>
  )
}
