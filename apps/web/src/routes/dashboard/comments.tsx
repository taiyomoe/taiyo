import { COMMENT_TARGET_TYPES } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { CommentsPage } from "@/features/comments/components/manage/comments-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  target: z.enum(COMMENT_TARGET_TYPES).optional().catch(undefined),
  author: z.uuid().optional().catch(undefined),
  deleted: z.boolean().optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/comments")({
  head: () => ({ meta: [{ title: m.comments_manage_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("comment.delete")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: CommentsPage,
})
