import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import type { Notification } from "@/features/notifications/api/notifications"
import { CommentLink } from "@/features/notifications/lib/notification-links"
import { sessionQueryOptions } from "@/lib/session"
import { notificationRowStyles as styles } from "./notification-row-styles"

/** Links to your profile, which the moderation team edited. */
function OwnProfileLink({
  onOpen,
  children,
  sx,
}: {
  onOpen: () => void
  children: ReactNode
  sx?: Sx
}) {
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })

  return (
    <Link
      {...stylex.props(styles.primary, sx)}
      data-primary=""
      onClick={onOpen}
      params={{ username: session?.user.username ?? "" }}
      to="/users/$username"
    >
      {children}
    </Link>
  )
}

/** The link to what a moderation notification is about, or null once it cannot be opened. */
const getModerationLink = (
  notification: Extract<
    Notification,
    { type: "LIST_MODERATED" | "PROFILE_MODERATED" | "REPORT_REVIEWED" }
  >,
  { onOpen, children, sx }: { onOpen: () => void; children: ReactNode; sx?: Sx },
) => {
  const props = { onClick: onOpen, "data-primary": "", ...stylex.props(styles.primary, sx) }

  if (notification.type === "PROFILE_MODERATED") {
    return (
      <OwnProfileLink onOpen={onOpen} sx={sx}>
        {children}
      </OwnProfileLink>
    )
  }

  if (notification.type === "LIST_MODERATED") {
    return notification.list.deleted ? null : (
      <Link {...props} params={{ listId: notification.list.id }} to="/lists/$listId">
        {children}
      </Link>
    )
  }

  const { report } = notification

  if (report.kind === "PAGE") {
    return report.chapter === null || report.chapter.deleted ? null : (
      <Link {...props} params={{ chapterId: report.chapter.id }} to="/chapters/$chapterId">
        {children}
      </Link>
    )
  }

  if (report.kind === "COMMENT") {
    return report.comment === null ||
      report.comment.deleted ||
      report.comment.target === null ? null : (
      <CommentLink
        commentId={report.comment.id}
        data-primary=""
        onClick={onOpen}
        sx={[styles.primary, sx]}
        target={report.comment.target}
      >
        {children}
      </CommentLink>
    )
  }

  if (report.kind === "GROUP") {
    return report.group === null || report.group.deleted ? null : (
      <Link {...props} params={{ groupId: report.group.id }} to="/groups/$groupId">
        {children}
      </Link>
    )
  }

  return report.user === null ? null : (
    <Link {...props} params={{ username: report.user.username }} to="/users/$username">
      {children}
    </Link>
  )
}

/** The link that opens the notification: it covers the whole row. */
export function PrimaryLink({
  notification,
  onOpen,
  onRead,
  onShowFollowers,
  children,
  sx,
}: {
  notification: Notification
  onOpen: () => void
  onRead?: () => void
  onShowFollowers?: (() => void) | undefined
  children: ReactNode
  sx?: Sx
}) {
  const props = { onClick: onOpen, ...stylex.props(styles.primary, sx) }
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })
  const username = session?.user.username

  if (
    notification.type === "LIST_MODERATED" ||
    notification.type === "PROFILE_MODERATED" ||
    notification.type === "REPORT_REVIEWED"
  ) {
    // Once what it was about is gone, opening it only marks it read.
    return (
      getModerationLink(notification, { onOpen, children, sx }) ?? (
        <button
          {...stylex.props(styles.primary, styles.primaryButton, sx)}
          data-primary=""
          onClick={onRead ?? onOpen}
          type="button"
        >
          {children}
        </button>
      )
    )
  }

  if (notification.type === "CHAPTER_PUBLISHED") {
    return (
      <Link
        {...props}
        data-primary=""
        params={{ chapterId: notification.chapter.id }}
        to="/chapters/$chapterId"
      >
        {children}
      </Link>
    )
  }

  if (notification.type === "FOLLOW") {
    const [follower] = notification.actors.latest

    if (notification.actors.count > 1 && onShowFollowers !== undefined) {
      return (
        <button
          {...stylex.props(styles.primary, styles.primaryButton, sx)}
          data-primary=""
          onClick={() => {
            onOpen()
            onShowFollowers()
          }}
          type="button"
        >
          {children}
        </button>
      )
    }

    return (
      <Link
        {...props}
        data-primary=""
        params={{ username: follower?.username ?? "" }}
        to="/users/$username"
      >
        {children}
      </Link>
    )
  }

  if (notification.type === "RANKING_REWARD") {
    return (
      <Link
        {...props}
        data-primary=""
        search={{ period: notification.ranking.period === "WEEK" ? "week" : "month" }}
        to="/rankings"
      >
        {children}
      </Link>
    )
  }

  if (notification.type === "ACHIEVEMENT_EARNED") {
    return (
      <Link
        {...props}
        data-primary=""
        params={{ username: username ?? "" }}
        search={{ tab: "achievements" }}
        to="/users/$username"
      >
        {children}
      </Link>
    )
  }

  return (
    <CommentLink
      commentId={notification.comment.id}
      data-primary=""
      onClick={onOpen}
      sx={[styles.primary, sx]}
      target={notification.comment.target}
    >
      {children}
    </CommentLink>
  )
}
