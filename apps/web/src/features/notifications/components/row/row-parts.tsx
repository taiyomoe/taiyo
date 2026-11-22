import "@stylexjs/stylex"
import type { ReactNode } from "react"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@taiyomoe/ui/components/ui/tooltip"
import type { Notification } from "@/features/notifications/api/notifications"
import { TimeAgo } from "@/components/time/time-ago"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { m } from "@/paraglide/messages"
import { KINDS } from "./notification-kinds"
import { KIND_COLORS, notificationRowStyles as styles } from "./notification-row-styles"

export function UnreadDot({
  corner = false,
  hidden = false,
}: {
  corner?: boolean
  hidden?: boolean
}) {
  return hidden ? (
    <span aria-hidden sx={[styles.dot, corner && styles.cornerDot, styles.dotHidden]} />
  ) : (
    <span
      aria-label={m.notifications_unread()}
      role="img"
      sx={[styles.dot, corner && styles.cornerDot]}
    />
  )
}

export function IconAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            onClick={onClick}
            size="icon-sm"
            sx={[styles.above, styles.mutedAction]}
            variant="ghost"
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipPopup>{label}</TooltipPopup>
    </Tooltip>
  )
}

export function KindLabel({ notification }: { notification: Notification }) {
  const { icon: Icon, label } = KINDS[notification.type]

  return (
    <span sx={[styles.label, styles.kind(KIND_COLORS[notification.type].text)]}>
      <Icon size={13} />
      {label()}
      {notification.readAt === null ? <UnreadDot /> : null}
      <TimeAgo compact date={notification.lastEventAt} sx={[styles.time, styles.labelTime]} />
    </span>
  )
}

export function Thumbnail({ notification, page }: { notification: Notification; page: boolean }) {
  if (notification.type === "CHAPTER_PUBLISHED") {
    return notification.chapter.mediaCoverUrl === null ? (
      <span sx={[styles.cover, page && styles.coverPage]} />
    ) : (
      <img
        alt=""
        loading="lazy"
        src={notification.chapter.mediaCoverUrl}
        sx={[styles.cover, page && styles.coverPage]}
      />
    )
  }

  if (notification.type === "COMMENT_REPLY") {
    return (
      <PersonAvatar
        person={notification.comment.author}
        sx={[styles.avatar, page && styles.avatarPage]}
      />
    )
  }

  const Icon = KINDS[notification.type].icon

  return (
    <span
      sx={[
        styles.iconCircle,
        page && styles.iconCirclePage,
        styles.tint(KIND_COLORS[notification.type].tint, KIND_COLORS[notification.type].text),
      ]}
    >
      <Icon size={page ? 20 : 16} />
    </span>
  )
}
