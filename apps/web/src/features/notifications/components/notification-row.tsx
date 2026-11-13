import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  BookOpenText,
  Check,
  Comment,
  Mail,
  Reply,
  ThumbsUp,
  Trash,
  UserAdd,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@taiyomoe/ui/components/ui/tooltip"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { LanguageFlag } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { useCreateReply } from "@/features/comments/api/comments"
import { CommentComposer } from "@/features/comments/components/comment-composer"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import {
  type Notification,
  useDeleteNotifications,
  useMarkNotificationRead,
  useSetNotificationsRead,
  useUpvoteFromNotification,
} from "@/features/notifications/api/notifications"
import { CommentLink } from "@/features/notifications/lib/notification-links"
import { notificationText } from "@/features/notifications/lib/notification-text"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type NotificationRowVariant = "popover" | "page"

const CHAPTER_NUMBER_COLOR = `color-mix(in srgb, ${colors.primary} 78%, ${colors.foreground})`
/** Text on the theme's background, then the tint behind icons. */
const KIND_COLORS = {
  CHAPTER_PUBLISHED: { text: CHAPTER_NUMBER_COLOR, tint: colors.primary },
  COMMENT_REPLY: { text: colors.infoForeground, tint: colors.info },
  COMMENT_LIKE: { text: colors.warningForeground, tint: colors.warning },
  FOLLOW: { text: colors.successForeground, tint: colors.success },
} as const
const styles = stylex.create({
  row: {
    gap: "0.875rem",
    paddingBlock: "0.875rem",
    paddingInline: "1rem",
    alignItems: "flex-start",
    backgroundColor: {
      default: "transparent",
      ":has([data-primary]:hover)": `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    },
    display: "flex",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":has([data-primary]:focus-visible)": "solid" },
    outlineWidth: 2,
    position: "relative",
    transitionDuration: "150ms",
    transitionProperty: "background-color",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  rowPage: {
    gap: { default: "0.75rem", [breakpoints.sm]: "1rem" },
    paddingBlock: "1rem",
    paddingInline: { default: "0.875rem", [breakpoints.sm]: "1.125rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "auto auto minmax(0, 1fr)",
      [breakpoints.sm]: "auto auto minmax(0, 1fr) auto",
    },
  },
  unread: {
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.primary} 7%, transparent)`,
      ":has([data-primary]:hover)": `color-mix(in srgb, ${colors.primary} 11%, transparent)`,
    },
  },
  selected: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 13%, transparent)`,
  },
  above: {
    position: "relative",
    zIndex: 1,
  },
  checkbox: {
    position: "relative",
    zIndex: 1,
    marginTop: "0.125rem",
  },
  cover: {
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    boxShadow: `0 1px 2px rgb(0 0 0 / 24%)`,
    flexShrink: 0,
    objectFit: "cover",
    height: "4.125rem",
    width: "2.75rem",
  },
  coverPage: {
    height: { default: "4.125rem", [breakpoints.sm]: "4.5rem" },
    width: { default: "2.75rem", [breakpoints.sm]: "3rem" },
  },
  avatar: {
    flexShrink: 0,
    height: "1.875rem",
    width: "1.875rem",
  },
  avatarPage: {
    height: "2.75rem",
    width: "2.75rem",
  },
  iconCircle: {
    borderRadius: radius.full,
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2rem",
    width: "2rem",
  },
  iconCirclePage: {
    height: "2.75rem",
    width: "2.75rem",
  },
  body: {
    flex: "1",
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.2,
    minWidth: 0,
  },
  labelTime: {
    display: { default: "inline", [breakpoints.sm]: "none" },
    marginLeft: "auto",
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    textDecoration: "none",
    color: colors.foreground,
    fontSize: "0.9375rem",
    fontWeight: 650,
    lineHeight: 1.3,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  titlePage: {
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontSize: "1rem",
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  primary: {
    outlineStyle: "none",
    "::after": {
      inset: 0,
      content: '""',
      position: "absolute",
    },
  },
  primaryButton: {
    font: "inherit",
    padding: 0,
    borderStyle: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    textAlign: "start",
  },
  readButton: {
    alignSelf: "center",
  },
  chapterLine: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    fontSize: "0.875rem",
    lineHeight: 1.35,
    minWidth: 0,
  },
  chapterNumber: {
    color: CHAPTER_NUMBER_COLOR,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  chapterTitle: {
    overflow: "hidden",
    color: colors.mutedForeground,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  meta: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    lineHeight: 1.35,
    minWidth: 0,
  },
  flag: {
    flexShrink: 0,
  },
  groups: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  separator: {
    flexShrink: 0,
    opacity: 0.6,
  },
  time: {
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  sentence: {
    overflow: "hidden",
    textDecoration: "none",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    color: colors.mutedForeground,
    display: "-webkit-box",
    fontSize: "0.875rem",
    lineHeight: 1.45,
    overflowWrap: "anywhere",
  },
  quote: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.5625rem",
    paddingInline: "0.75rem",
    backgroundColor: colors.well,
    color: colors.foreground,
    display: "block",
    fontSize: "0.875rem",
    lineHeight: 1.45,
    marginTop: "0.375rem",
  },
  quoteText: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    display: "-webkit-box",
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  quoteImage: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  actions: {
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    marginLeft: "-0.5rem",
    marginTop: "0.25rem",
  },
  replyAction: {
    color: CHAPTER_NUMBER_COLOR,
  },
  mutedAction: {
    color: colors.mutedForeground,
  },
  votedAction: {
    color: CHAPTER_NUMBER_COLOR,
  },
  actionsTime: {
    marginLeft: "auto",
  },
  composer: {
    position: "relative",
    zIndex: 1,
    marginTop: "0.5rem",
  },
  aside: {
    gap: "0.625rem",
    gridColumn: { default: "3", [breakpoints.sm]: "4" },
    gridRow: { default: "2", [breakpoints.sm]: "1" },
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "column",
  },
  asideTime: {
    display: { default: "none", [breakpoints.sm]: "inline" },
  },
  asideActions: {
    gap: "0.25rem",
    alignItems: "center",
    alignSelf: { default: "stretch", [breakpoints.sm]: "auto" },
    display: "flex",
    flexDirection: { default: "row", [breakpoints.sm]: "column" },
    justifyContent: { default: "flex-start", [breakpoints.sm]: null },
  },
  iconButtons: {
    gap: "0.125rem",
    display: { default: "none", [breakpoints.sm]: "flex" },
  },
  viewThread: {
    display: { default: "none", [breakpoints.sm]: "inline-flex" },
  },
  asideDesktopOnly: {
    display: { default: "none", [breakpoints.sm]: "flex" },
  },
  dot: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexShrink: 0,
    height: "0.4375rem",
    width: "0.4375rem",
  },
  dotHidden: {
    visibility: "hidden",
  },
  cornerDot: {
    marginTop: "0.4375rem",
  },
  skeletonLine: {
    height: "0.75rem",
    width: "70%",
  },
  skeletonShort: {
    height: "0.75rem",
    width: "40%",
  },
  kind: (color: string) => ({
    color,
  }),
  tint: (tint: string, color: string) => ({
    backgroundColor: `color-mix(in srgb, ${tint} 15%, transparent)`,
    color,
  }),
})

type RowProps = {
  notification: Notification
  viewerId: string
  variant: NotificationRowVariant
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  onNavigate?: () => void
  onShowFollowers?: () => void
}

function UnreadDot({ corner = false, hidden = false }: { corner?: boolean; hidden?: boolean }) {
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

function IconAction({
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

function KindLabel({ notification }: { notification: Notification }) {
  const { icon: Icon, label } = {
    CHAPTER_PUBLISHED: { icon: BookOpenText, label: m.notifications_label_chapter },
    COMMENT_REPLY: { icon: Comment, label: m.notifications_label_reply },
    COMMENT_LIKE: { icon: ThumbsUp, label: m.notifications_label_upvotes },
    FOLLOW: { icon: UserAdd, label: m.notifications_label_follow },
  }[notification.type]

  return (
    <span sx={[styles.label, styles.kind(KIND_COLORS[notification.type].text)]}>
      <Icon size={13} />
      {label()}
      {notification.readAt === null ? <UnreadDot /> : null}
      <TimeAgo compact date={notification.lastEventAt} sx={[styles.time, styles.labelTime]} />
    </span>
  )
}

function Thumbnail({ notification, page }: { notification: Notification; page: boolean }) {
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

  const Icon = notification.type === "FOLLOW" ? UserAdd : ThumbsUp

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

/** The link that opens the notification: it covers the whole row. */
function PrimaryLink({
  notification,
  onOpen,
  onShowFollowers,
  children,
  sx,
}: {
  notification: Notification
  onOpen: () => void
  onShowFollowers?: (() => void) | undefined
  children: ReactNode
  sx?: Sx
}) {
  const props = { onClick: onOpen, ...stylex.props(styles.primary, sx) }

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

function ChapterContent({
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

function ReplyActions({
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

function InlineReply({
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

function PageActions({ notification, onOpen }: { notification: Notification; onOpen: () => void }) {
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
  const onOpen = () => {
    if (unread) {
      markRead.mutate(notification.id)
    }

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
        {notification.type === "COMMENT_LIKE" && page ? (
          <span sx={styles.quote}>
            <span sx={styles.quoteText}>
              {notification.comment.excerpt === "" ? (
                <span sx={styles.quoteImage}>{m.notifications_comment_image()}</span>
              ) : (
                notification.comment.excerpt
              )}
            </span>
          </span>
        ) : null}
      </div>
      {page ? (
        <PageActions notification={notification} onOpen={onOpen} />
      ) : (
        <PopoverAside notification={notification} onOpen={onOpen} />
      )}
    </article>
  )
}

function PopoverAside({
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
