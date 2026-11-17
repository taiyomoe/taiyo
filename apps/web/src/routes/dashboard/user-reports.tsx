import { USER_REPORT_REASONS } from "@taiyomoe/db/constants"
import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { userReportsQueryOptions } from "@/features/user-reports/api/user-reports"
import { UserReportsPage } from "@/features/user-reports/components/user-reports-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).optional().catch(undefined),
  reason: z.enum(USER_REPORT_REASONS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/user-reports")({
  head: () => ({ meta: [{ title: m.user_reports_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("userReport.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({
    status: search.status ?? ("PENDING" as const),
    reason: search.reason,
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps }) => {
    const prefetch = context.queryClient.query(userReportsQueryOptions(deps)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: UserReportsPage,
})
