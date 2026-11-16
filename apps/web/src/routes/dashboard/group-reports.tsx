import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { groupReportsQueryOptions } from "@/features/groups/api/groups"
import { GroupReportsPage } from "@/features/groups/components/group-reports/group-reports-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).optional().catch(undefined),
  reason: z.enum(["IMPERSONATION", "STOLEN_WORK", "SPAM", "OTHER"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/group-reports")({
  head: () => ({ meta: [{ title: m.reports_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("groupReport.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({
    status: search.status ?? ("PENDING" as const),
    reason: search.reason,
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps }) => {
    const prefetch = context.queryClient.query(groupReportsQueryOptions(deps)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: GroupReportsPage,
})
