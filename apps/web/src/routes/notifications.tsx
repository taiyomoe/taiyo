import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { notificationsQueryOptions } from "@/features/notifications/api/notifications"
import { NotificationsPage } from "@/features/notifications/components/notifications-page"
import {
  NOTIFICATIONS_PER_PAGE,
  notificationsSearchSchema,
} from "@/features/notifications/lib/pagination"
import { m } from "@/paraglide/messages"

const FIRST_PAGE = 1

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: m.notifications_meta_title() }] }),
  validateSearch: notificationsSearchSchema,
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    return { session: context.session }
  },
  loaderDeps: ({ search: { page, category, unread, q } }) => ({
    page: page ?? FIRST_PAGE,
    category,
    unread,
    q,
  }),
  loader: async ({ context, deps }) => {
    const prefetch = context.queryClient
      .query(notificationsQueryOptions({ ...deps, perPage: NOTIFICATIONS_PER_PAGE }))
      .catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: NotificationsPage,
})
