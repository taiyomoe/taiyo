import { COMMENT_REPORT_REASONS, COMMENT_TARGET_TYPES } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { CommentReportsPage } from "@/features/comment-reports/components/comment-reports-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).optional().catch(undefined),
  reason: z.enum(COMMENT_REPORT_REASONS).optional().catch(undefined),
  target: z.enum(COMMENT_TARGET_TYPES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/comment-reports")({
  head: () => ({ meta: [{ title: m.comment_reports_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("comment.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: CommentReportsPage,
})
