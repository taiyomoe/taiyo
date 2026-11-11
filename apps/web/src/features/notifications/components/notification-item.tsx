import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { TimeAgo } from "@/components/time/time-ago"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import {
  type Notification,
  useMarkNotificationRead,
} from "@/features/notifications/api/notifications"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  item: {
    padding: "0.75rem",
    borderRadius: radius.lg,
    gap: "0.75rem",
    textDecoration: "none",
    alignItems: "flex-start",
    backgroundColor: { default: "transparent", ":hover": colors.accent },
    color: colors.foreground,
    display: "flex",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
    transitionDuration: "150ms",
    transitionProperty: "background-color",
  },
  unread: {
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.primary} 7%, transparent)`,
      ":hover": `color-mix(in srgb, ${colors.primary} 12%, ${colors.accent})`,
    },
  },
  cover: {
    borderRadius: radius.sm,
    backgroundColor: colors.muted,
    flexShrink: 0,
    objectFit: "cover",
    height: "3.5rem",
    width: "2.5rem",
  },
  avatar: {
    flexShrink: 0,
    height: "2.5rem",
    width: "2.5rem",
  },
  body: {
    flex: "1",
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.35,
    overflowWrap: "anywhere",
  },
  text: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  time: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  dot: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexShrink: 0,
    height: "0.5rem",
    marginTop: "0.375rem",
    width: "0.5rem",
  },
  skeletonLine: {
    height: "0.75rem",
    width: "70%",
  },
})

export function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: Notification
  onNavigate?: () => void
}) {
  const markRead = useMarkNotificationRead()
  const unread = notification.readAt === null
  const onClick = () => {
    if (unread) {
      markRead.mutate(notification.id)
    }

    onNavigate?.()
  }
  const content = (thumbnail: ReactNode, title: ReactNode, text: ReactNode) => (
    <>
      {thumbnail}
      <span sx={styles.body}>
        <span sx={styles.title}>{title}</span>
        <span sx={styles.text}>{text}</span>
        <TimeAgo date={notification.createdAt} sx={styles.time} />
      </span>
      {unread ? <span aria-label={m.notifications_unread()} role="img" sx={styles.dot} /> : null}
    </>
  )

  if (notification.type === "CHAPTER_PUBLISHED") {
    const { chapter } = notification
    const groups = chapter.groups.map((group) => group.name).join(", ")

    return (
      <Link
        onClick={onClick}
        params={{ chapterId: chapter.id }}
        to="/chapters/$chapterId"
        {...stylex.props(styles.item, unread && styles.unread)}
      >
        {content(
          chapter.mediaCoverUrl === null ? (
            <span sx={styles.cover} />
          ) : (
            <img alt="" loading="lazy" src={chapter.mediaCoverUrl} sx={styles.cover} />
          ),
          chapter.mediaTitle ?? m.notifications_untitled_media(),
          groups === ""
            ? m.notifications_new_chapter({ number: chapter.number })
            : m.notifications_new_chapter_by({ number: chapter.number, groups }),
        )}
      </Link>
    )
  }

  const { comment } = notification
  const linkProps = { onClick, ...stylex.props(styles.item, unread && styles.unread) }
  const body = content(
    <PersonAvatar person={comment.author} sx={styles.avatar} />,
    m.notifications_comment_reply({ name: comment.author.displayUsername }),
    comment.excerpt === "" ? m.notifications_reply_image() : comment.excerpt,
  )

  if (comment.target.type === "MEDIA") {
    return (
      <Link
        {...linkProps}
        params={{ mediaId: comment.target.id }}
        search={{ tab: "comments", comment: comment.id }}
        to="/media/$mediaId"
      >
        {body}
      </Link>
    )
  }

  if (comment.target.type === "CHAPTER") {
    return (
      <Link
        {...linkProps}
        params={{ chapterId: comment.target.id }}
        search={{ comment: comment.id }}
        to="/chapters/$chapterId"
      >
        {body}
      </Link>
    )
  }

  if (comment.target.type === "GROUP") {
    return (
      <Link
        {...linkProps}
        params={{ groupId: comment.target.id }}
        search={{ tab: "comments", comment: comment.id }}
        to="/groups/$groupId"
      >
        {body}
      </Link>
    )
  }

  return (
    <Link
      {...linkProps}
      params={{ username: comment.target.username ?? "" }}
      search={{ tab: "comments", comment: comment.id }}
      to="/users/$username"
    >
      {body}
    </Link>
  )
}

export function NotificationItemSkeleton() {
  return (
    <div sx={styles.item}>
      <Skeleton sx={styles.cover} />
      <span sx={styles.body}>
        <Skeleton sx={styles.skeletonLine} />
        <Skeleton sx={styles.skeletonLine} />
      </span>
    </div>
  )
}
