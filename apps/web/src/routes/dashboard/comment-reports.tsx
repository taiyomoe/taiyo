import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { commentReportsQueryOptions } from "@/features/comment-reports/api/comment-reports"
import { CommentReportsPage } from "@/features/comment-reports/components/comment-reports-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]).optional().catch(undefined),
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
  loaderDeps: ({ search }) => ({
    status: search.status ?? ("OPEN" as const),
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps: { status, page } }) => {
    const prefetch = context.queryClient.query(commentReportsQueryOptions(status, page)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: CommentReportsPage,
})
