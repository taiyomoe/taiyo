import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { pageReportsQueryOptions } from "@/features/page-reports/api/page-reports"
import { PageReportsPage } from "@/features/page-reports/components/page-reports-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/page-reports")({
  head: () => ({ meta: [{ title: m.page_reports_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("pageReport.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({
    status: search.status ?? ("OPEN" as const),
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps: { status, page } }) => {
    const prefetch = context.queryClient.query(pageReportsQueryOptions(status, page)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: PageReportsPage,
})
