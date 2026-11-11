import * as stylex from "@stylexjs/stylex"
import { Bell, CheckAll } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { ScrollArea } from "@taiyomoe/ui/components/ui/scroll-area"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { range } from "remeda"
import {
  type Notification,
  notificationsQueryOptions,
  unreadNotificationCountQueryOptions,
  useMarkAllNotificationsRead,
} from "@/features/notifications/api/notifications"
import {
  NotificationItem,
  NotificationItemSkeleton,
} from "@/features/notifications/components/notification-item"
import { m } from "@/paraglide/messages"

const PREVIEW_SIZE = 10
const styles = stylex.create({
  trigger: {
    position: "relative",
  },
  count: {
    borderColor: colors.background,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 2,
    paddingInline: "0.25rem",
    alignItems: "center",
    backgroundColor: colors.primary,
    boxSizing: "content-box",
    color: colors.primaryForeground,
    display: "flex",
    fontSize: "0.625rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    justifyContent: "center",
    lineHeight: 1,
    pointerEvents: "none",
    position: "absolute",
    height: "1rem",
    minWidth: "0.5rem",
    right: "-0.125rem",
    top: "-0.125rem",
  },
  popup: {
    padding: 0,
    width: "min(24rem, calc(100vw - 2rem))",
  },
  header: {
    gap: "0.5rem",
    paddingBlock: "0.625rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    paddingInlineEnd: "0.5rem",
    paddingInlineStart: "1rem",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  heading: {
    margin: 0,
    fontSize: "0.9375rem",
    fontWeight: 650,
  },
  list: {
    padding: "0.375rem",
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
  },
  scroll: {
    maxHeight: "min(28rem, 60vh)",
  },
  empty: {
    gap: "0.5rem",
    paddingBlock: "2.5rem",
    paddingInline: "1.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
    fontSize: "0.875rem",
    textAlign: "center",
  },
  emptyIcon: {
    opacity: 0.6,
    height: "1.75rem",
    width: "1.75rem",
  },
  footer: {
    padding: "0.375rem",
    display: "flex",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  footerLink: {
    flex: "1",
  },
})

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const unread = useQuery(unreadNotificationCountQueryOptions()).data ?? 0
  const list = useQuery({ ...notificationsQueryOptions(1, PREVIEW_SIZE), enabled: open })
  const markAllRead = useMarkAllNotificationsRead()
  const close = () => {
    setOpen(false)
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-label={
              unread === 0
                ? m.notifications_title()
                : m.notifications_title_unread({ count: unread })
            }
            size="icon"
            sx={styles.trigger}
            variant="ghost"
          />
        }
      >
        <Bell />
        {unread === 0 ? null : <span sx={styles.count}>{unread > 99 ? "99+" : unread}</span>}
      </PopoverTrigger>
      <PopoverPopup align="end" sideOffset={8} sx={styles.popup}>
        <div sx={styles.header}>
          <h2 sx={styles.heading}>{m.notifications_title()}</h2>
          <Button
            disabled={unread === 0}
            onClick={() => {
              markAllRead.mutate(undefined)
            }}
            size="sm"
            variant="ghost"
          >
            <CheckAll />
            {m.notifications_mark_all_read()}
          </Button>
        </div>
        <ScrollArea sx={styles.scroll}>
          <NotificationPreview notifications={list.data?.data} onNavigate={close} />
        </ScrollArea>
        <div sx={styles.footer}>
          <Button
            render={<Link onClick={close} to="/notifications" />}
            size="sm"
            sx={styles.footerLink}
            variant="ghost"
          >
            {m.notifications_see_all()}
          </Button>
        </div>
      </PopoverPopup>
    </Popover>
  )
}

function NotificationPreview({
  notifications,
  onNavigate,
}: {
  notifications: Notification[] | undefined
  onNavigate: () => void
}) {
  if (notifications === undefined) {
    return (
      <div sx={styles.list}>
        {range(0, 3).map((index) => (
          <NotificationItemSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div sx={styles.empty}>
        <Bell sx={styles.emptyIcon} />
        {m.notifications_empty()}
      </div>
    )
  }

  return (
    <div sx={styles.list}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}
