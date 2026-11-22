import "@stylexjs/stylex"
import { BookOpenText, Check, Mail, Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { Link } from "@tanstack/react-router"
import { TimeAgo } from "@/components/time/time-ago"
import {
  type Notification,
  useDeleteNotifications,
  useSetNotificationsRead,
} from "@/features/notifications/api/notifications"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { notificationRowStyles as styles } from "./notification-row-styles"
import { IconAction } from "./row-parts"

export function PageActions({
  notification,
  onOpen,
}: {
  notification: Notification
  onOpen: () => void
}) {
  const setRead = useSetNotificationsRead()
  const remove = useDeleteNotifications()
  const unread = notification.readAt === null

  return (
    <span sx={[styles.aside, notification.type !== "CHAPTER_PUBLISHED" && styles.asideDesktopOnly]}>
      <TimeAgo compact date={notification.lastEventAt} sx={[styles.time, styles.asideTime]} />
      <span sx={styles.asideActions}>
        {notification.type === "CHAPTER_PUBLISHED" ? (
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
            sx={styles.above}
            variant={unread ? "default" : "outline"}
          >
            <BookOpenText />
            {m.notifications_read_chapter()}
          </Button>
        ) : null}
        <span sx={styles.iconButtons}>
          {unread ? (
            <IconAction
              label={m.notifications_mark_read()}
              onClick={() => {
                setRead.mutate({ ids: [notification.id], read: true })
              }}
            >
              <Check />
            </IconAction>
          ) : (
            <IconAction
              label={m.notifications_mark_unread()}
              onClick={() => {
                setRead.mutate({ ids: [notification.id], read: false })
              }}
            >
              <Mail />
            </IconAction>
          )}
          <IconAction
            label={m.notifications_delete()}
            onClick={() => {
              remove.mutate([notification.id], {
                onSuccess: () => {
                  toastManager.add({ title: m.notifications_deleted_one(), type: "success" })
                },
                onError: (error) => {
                  toastManager.add({ title: getErrorMessage(error), type: "error" })
                },
              })
            }}
          >
            <Trash />
          </IconAction>
        </span>
      </span>
    </span>
  )
}
