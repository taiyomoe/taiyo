import * as stylex from "@stylexjs/stylex"
import { Bell, CheckAll } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link, Navigate, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"
import { range } from "remeda"
import { PagePagination } from "@/components/pagination/page-pagination"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"
import {
  notificationsQueryOptions,
  unreadNotificationCountQueryOptions,
  useMarkAllNotificationsRead,
} from "@/features/notifications/api/notifications"
import {
  NotificationItem,
  NotificationItemSkeleton,
} from "@/features/notifications/components/notification-item"
import { NOTIFICATIONS_PER_PAGE } from "@/features/notifications/lib/pagination"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/notifications")
const styles = stylex.create({
  page: {
    gap: "1.5rem",
    marginInline: "auto",
    paddingBlock: "2rem",
    paddingInline: { default: "1.25rem", [breakpoints.md]: "2rem" },
    display: "flex",
    flexDirection: "column",
    maxWidth: "48rem",
    width: "100%",
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  list: {
    padding: "0.375rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.125rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
})

export function NotificationsPage() {
  const { session } = routeApi.useRouteContext()
  const { page } = routeApi.useLoaderDeps()
  const unread = useQuery(unreadNotificationCountQueryOptions()).data ?? 0
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <AppShell user={session.user}>
      <div sx={styles.page}>
        <div sx={styles.header}>
          <h1 sx={styles.heading}>{m.notifications_title()}</h1>
          <Button
            disabled={unread === 0}
            onClick={() => {
              markAllRead.mutate(undefined)
            }}
            variant="outline"
          >
            <CheckAll />
            {m.notifications_mark_all_read()}
          </Button>
        </div>
        <Suspense fallback={<NotificationListSkeleton />}>
          <NotificationList page={page} />
        </Suspense>
      </div>
    </AppShell>
  )
}

function NotificationList({ page }: { page: number }) {
  const { data } = useSuspenseQuery(notificationsQueryOptions(page, NOTIFICATIONS_PER_PAGE))
  const navigate = useNavigate()
  const pageCount = Math.ceil(data.meta.total / NOTIFICATIONS_PER_PAGE)

  if (page > Math.max(pageCount, 1)) {
    return (
      <Navigate
        replace
        search={{ page: pageCount > 1 ? pageCount : undefined }}
        to="/notifications"
      />
    )
  }

  if (data.data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bell />
          </EmptyMedia>
          <EmptyTitle>{m.notifications_empty()}</EmptyTitle>
          <EmptyDescription>{m.notifications_empty_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div sx={styles.list}>
        {data.data.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
      <PagePagination
        renderLink={(target) => (
          <Link search={{ page: target === 1 ? undefined : target }} to="/notifications" />
        )}
        onJump={(target) => {
          void navigate({
            search: { page: target === 1 ? undefined : target },
            to: "/notifications",
          })
        }}
        page={page}
        pageCount={pageCount}
      />
    </>
  )
}

function NotificationListSkeleton() {
  return (
    <div sx={styles.list}>
      {range(0, 6).map((index) => (
        <NotificationItemSkeleton key={index} />
      ))}
    </div>
  )
}
