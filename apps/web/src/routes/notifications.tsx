import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { notificationsQueryOptions } from "@/features/notifications/api/notifications"
import { NotificationsPage } from "@/features/notifications/components/notifications-page"
import { NOTIFICATIONS_PER_PAGE } from "@/features/notifications/lib/pagination"
import { m } from "@/paraglide/messages"

const FIRST_PAGE = 1
const searchSchema = z.object({
  page: z.coerce.number().int().min(FIRST_PAGE).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: m.notifications_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    return { session: context.session }
  },
  loaderDeps: ({ search: { page } }) => ({ page: page ?? FIRST_PAGE }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient
      .query(notificationsQueryOptions(page, NOTIFICATIONS_PER_PAGE))
      .catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: NotificationsPage,
})
