import { SUPPORTED_LANGUAGES } from "@taiyomoe/db/constants"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { ChapterReviewsPage } from "@/features/uploads/components/chapter-reviews/chapter-reviews-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  language: z.enum(SUPPORTED_LANGUAGES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/chapter-reviews")({
  head: () => ({ meta: [{ title: m.review_chapters_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("chapter.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: ChapterReviewsPage,
})
