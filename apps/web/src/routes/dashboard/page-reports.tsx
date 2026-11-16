import { PAGE_REPORT_REASONS, PAGE_REPORT_STATUSES } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { PageReportsPage } from "@/features/page-reports/components/page-reports-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  /** Open reports when left out, every status with `ALL`. */
  status: z
    .enum([...PAGE_REPORT_STATUSES, "ALL"])
    .optional()
    .catch(undefined),
  reason: z.enum(PAGE_REPORT_REASONS).optional().catch(undefined),
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
  component: PageReportsPage,
})
