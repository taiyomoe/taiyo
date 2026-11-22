import "@stylexjs/stylex"
import type { Notification } from "@/features/notifications/api/notifications"
import { LanguageFlag } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { m } from "@/paraglide/messages"
import type { NotificationRowVariant } from "./notification-kinds"
import { notificationRowStyles as styles } from "./notification-row-styles"
import { PrimaryLink } from "./primary-link"
import { UnreadDot } from "./row-parts"

export function ChapterContent({
  notification,
  variant,
  onOpen,
}: {
  notification: Extract<Notification, { type: "CHAPTER_PUBLISHED" }>
  variant: NotificationRowVariant
  onOpen: () => void
}) {
  const { chapter } = notification
  const title = chapter.mediaTitle ?? m.notifications_untitled_media()
  const groups = chapter.groups.map((group) => group.name).join(", ")

  return (
    <>
      <span sx={styles.titleLine}>
        {variant === "popover" && notification.readAt === null ? <UnreadDot /> : null}
        <PrimaryLink
          notification={notification}
          onOpen={onOpen}
          sx={[styles.title, variant === "page" && styles.titlePage]}
        >
          <span title={title}>{title}</span>
        </PrimaryLink>
      </span>
      <span sx={styles.chapterLine}>
        <span sx={styles.chapterNumber}>
          {m.notifications_chapter_number({ number: chapter.number })}
        </span>
        {chapter.title === null || chapter.title === "" ? null : (
          <span sx={styles.chapterTitle} title={chapter.title}>
            {chapter.title}
          </span>
        )}
      </span>
      <span sx={styles.meta}>
        <LanguageFlag language={chapter.language} sx={styles.flag} />
        {groups === "" ? null : (
          <span sx={styles.groups} title={groups}>
            {groups}
          </span>
        )}
        {variant === "popover" ? (
          <>
            <span aria-hidden sx={styles.separator}>
              ·
            </span>
            <TimeAgo compact date={notification.lastEventAt} sx={styles.time} />
          </>
        ) : null}
      </span>
    </>
  )
}
