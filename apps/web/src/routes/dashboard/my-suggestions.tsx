import { MEDIA_SUGGESTION_STATUSES } from "@taiyomoe/db/constants"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { MySuggestionsPage } from "@/features/media-suggestions/components/my-suggestions-page"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  status: z.enum(MEDIA_SUGGESTION_STATUSES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/my-suggestions")({
  head: () => ({ meta: [{ title: m.my_suggestions_meta_title() }] }),
  validateSearch: searchSchema,
  component: MySuggestionsPage,
})
