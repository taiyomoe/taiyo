import { CHAPTER_STATUSES } from "@taiyomoe/db/constants"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { SubmissionsPage } from "@/features/uploads/components/submissions/submissions-page"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  status: z.enum(CHAPTER_STATUSES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/submissions")({
  head: () => ({ meta: [{ title: m.submissions_meta_title() }] }),
  validateSearch: searchSchema,
  component: SubmissionsPage,
})
