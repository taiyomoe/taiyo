import * as stylex from "@stylexjs/stylex"
import { ArrowRight, Bell, CheckAll, Settings } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { range } from "remeda"
import {
  NOTIFICATION_CATEGORIES,
  type Notification,
  type NotificationCategory,
  notificationCountsQueryOptions,
  notificationsQueryOptions,
  useMarkAllNotificationsRead,
} from "@/features/notifications/api/notifications"
import { NotificationEmpty } from "@/features/notifications/components/notification-empty"
import {
  NotificationRow,
  NotificationRowSkeleton,
} from "@/features/notifications/components/notification-row"
import { FollowListDialog } from "@/features/users/components/profile/dialogs/follow-list-dialog"
import { m } from "@/paraglide/messages"

const PREVIEW_SIZE = 10
const TAB_LABELS = {
  chapters: m.notifications_tab_chapters,
  replies: m.notifications_tab_replies,
  activity: m.notifications_tab_activity,
} satisfies Record<NotificationCategory, () => string>
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
    right: "0.125rem",
    top: "0.125rem",
  },
  popup: {
    padding: 0,
    width: "min(24rem, calc(100vw - 1rem))",
  },
  panel: {
    marginBlock: "-1rem",
    marginInline: "calc(-1 * var(--viewport-inline-padding))",
    display: "flex",
    flexDirection: "column",
    maxHeight: "min(40rem, calc(var(--available-height) - 0.5rem))",
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    paddingInlineEnd: "0.5rem",
    paddingInlineStart: "1rem",
    paddingTop: "0.875rem",
  },
  heading: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
  },
  tabs: {
    gap: 0,
    flexShrink: 0,
  },
  tabList: {
    gap: "0.25rem",
    paddingInline: "0.5rem",
    boxShadow: `inset 0 -1px 0 ${colors.border}`,
    justifyContent: "flex-start",
    scrollbarWidth: "none",
    overflowX: "auto",
    paddingBottom: { '[data-orientation="horizontal"]': "1px", default: null },
    paddingTop: { '[data-orientation="horizontal"]': "0.375rem", default: null },
    width: "100%",
  },
  tab: {
    backgroundColor: "transparent",
    color: {
      "[data-active]": colors.foreground,
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    flexGrow: 0,
    flexShrink: 0,
    fontSize: "0.9375rem",
    fontWeight: 600,
    height: "2.5rem",
  },
  tabCount: {
    borderRadius: radius.full,
    paddingInline: "0.3125rem",
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "inline-flex",
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    justifyContent: "center",
    lineHeight: 1,
    height: "1.125rem",
    minWidth: "1.125rem",
  },
  scroll: {
    flex: "1",
    overscrollBehavior: "contain",
    scrollbarWidth: "thin",
    minHeight: 0,
    overflowX: "hidden",
    overflowY: "auto",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    minHeight: "12rem",
  },
  footer: {
    gap: "0.5rem",
    paddingBlock: "0.5rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    justifyContent: "space-between",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  footerMuted: {
    color: colors.mutedForeground,
  },
  openInbox: {
    color: `color-mix(in srgb, ${colors.primary} 78%, ${colors.foreground})`,
  },
})

export function NotificationBell({ viewerId }: { viewerId: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<NotificationCategory | null>(null)
  const [followersOpen, setFollowersOpen] = useState(false)
  const counts = useQuery(notificationCountsQueryOptions()).data
  const unread = counts?.unread ?? 0
  const current =
    tab ??
    NOTIFICATION_CATEGORIES.find((category) => (counts?.categories[category] ?? 0) > 0) ??
    "chapters"
  const list = useQuery({
    ...notificationsQueryOptions({ page: 1, perPage: PREVIEW_SIZE, category: current }),
    enabled: open,
  })
  const markAllRead = useMarkAllNotificationsRead()
  const close = () => {
    setOpen(false)
  }

  return (
    <>
      <Popover
        onOpenChange={(next) => {
          setOpen(next)

          if (!next) {
            setTab(null)
          }
        }}
        open={open}
      >
        <PopoverTrigger
          render={
            <Button
              aria-label={
                unread === 0
                  ? m.notifications_title()
                  : m.notifications_title_unread({ count: unread })
              }
              size="icon-xl"
              sx={styles.trigger}
              variant="ghost"
            />
          }
        >
          <Bell />
          {unread === 0 ? null : <span sx={styles.count}>{unread > 99 ? "99+" : unread}</span>}
        </PopoverTrigger>
        <PopoverPopup align="end" sideOffset={8} sx={styles.popup}>
          <div sx={styles.panel}>
            <div sx={styles.header}>
              <h2 sx={styles.heading}>{m.notifications_inbox()}</h2>
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
            <Tabs
              onValueChange={(value: NotificationCategory) => {
                setTab(value)
              }}
              sx={styles.tabs}
              value={current}
            >
              <TabsList sx={styles.tabList} variant="underline">
                {NOTIFICATION_CATEGORIES.map((category) => {
                  const count = counts?.categories[category] ?? 0
                  const label = TAB_LABELS[category]()

                  return (
                    <TabsTab
                      aria-label={
                        count === 0 ? label : m.notifications_tab_unread({ label, count })
                      }
                      key={category}
                      sx={styles.tab}
                      value={category}
                    >
                      {label}
                      {count === 0 ? null : (
                        <span aria-hidden sx={styles.tabCount}>
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </TabsTab>
                  )
                })}
              </TabsList>
            </Tabs>
            <div sx={styles.scroll}>
              <div sx={styles.list}>
                <PreviewList
                  category={current}
                  notifications={
                    list.data === undefined || list.isPlaceholderData ? undefined : list.data.data
                  }
                  onNavigate={close}
                  onShowFollowers={() => {
                    close()
                    setFollowersOpen(true)
                  }}
                  viewerId={viewerId}
                />
              </div>
            </div>
            <div sx={styles.footer}>
              <Button
                render={<Link onClick={close} search={{ tab: "notifications" }} to="/settings" />}
                size="sm"
                sx={styles.footerMuted}
                variant="ghost"
              >
                <Settings />
                {m.notifications_settings()}
              </Button>
              <Button
                render={<Link onClick={close} search={{ category: current }} to="/notifications" />}
                size="sm"
                sx={styles.openInbox}
                variant="ghost"
              >
                {m.notifications_open_inbox()}
                <ArrowRight />
              </Button>
            </div>
          </div>
        </PopoverPopup>
      </Popover>
      <FollowListDialog
        direction={followersOpen ? "followers" : null}
        hiddenFor={null}
        onClose={() => {
          setFollowersOpen(false)
        }}
        userId={viewerId}
      />
    </>
  )
}

function PreviewList({
  category,
  notifications,
  viewerId,
  onNavigate,
  onShowFollowers,
}: {
  category: NotificationCategory
  notifications: Notification[] | undefined
  viewerId: string
  onNavigate: () => void
  onShowFollowers: () => void
}) {
  if (notifications === undefined) {
    return range(0, 3).map((index) => <NotificationRowSkeleton key={index} variant="popover" />)
  }

  if (notifications.length === 0) {
    return <NotificationEmpty category={category} compact />
  }

  return notifications.map((notification) => (
    <NotificationRow
      key={notification.id}
      notification={notification}
      onNavigate={onNavigate}
      onShowFollowers={onShowFollowers}
      variant="popover"
      viewerId={viewerId}
    />
  ))
}
