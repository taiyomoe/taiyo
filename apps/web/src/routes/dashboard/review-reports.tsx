import { COMMENT_REPORT_REASONS } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { ReviewReportsPage } from "@/features/review-reports/components/review-reports-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).optional().catch(undefined),
  reason: z.enum(COMMENT_REPORT_REASONS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/review-reports")({
  head: () => ({ meta: [{ title: m.review_reports_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("mediaReview.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: ReviewReportsPage,
})
