import * as stylex from "@stylexjs/stylex"
import { Bell } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { notificationCountsQueryOptions } from "@/features/notifications/api/notifications"
import { createLazyComponent } from "@/lib/lazy-component"
import { m } from "@/paraglide/messages"

// The inbox and the followers dialog only download once the bell is hovered or opened.
const loadInbox = () => import("@/features/notifications/components/notification-inbox")
const NotificationInbox = createLazyComponent(async () => (await loadInbox()).NotificationInbox)
const FollowListDialog = createLazyComponent(
  async () =>
    (await import("@/features/users/components/profile/dialogs/follow-list-dialog"))
      .FollowListDialog,
)
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
  fallback: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    height: "20rem",
  },
})

export function NotificationBell({ viewerId }: { viewerId: string }) {
  const [open, setOpen] = useState(false)
  const [followers, setFollowers] = useState<"unmounted" | "open" | "closed">("unmounted")
  const unread = useQuery(notificationCountsQueryOptions()).data?.unread ?? 0
  const preload = () => {
    void loadInbox()
  }
  const close = () => {
    setOpen(false)
  }
  const inboxFallback = (
    <div sx={styles.fallback}>
      <Spinner />
    </div>
  )

  return (
    <>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          onFocus={preload}
          onPointerEnter={preload}
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
          <Suspense fallback={inboxFallback}>
            <NotificationInbox
              fallback={inboxFallback}
              onClose={close}
              onShowFollowers={() => {
                close()
                setFollowers("open")
              }}
              viewerId={viewerId}
            />
          </Suspense>
        </PopoverPopup>
      </Popover>
      {followers === "unmounted" ? null : (
        <Suspense>
          <FollowListDialog
            retry={followers}
            direction={followers === "open" ? "followers" : null}
            hiddenFor={null}
            onClose={() => {
              setFollowers("closed")
            }}
            userId={viewerId}
          />
        </Suspense>
      )}
    </>
  )
}
