import { z } from "zod"
import { LIBRARY_STATUSES } from "@/features/library/lib/library-statuses"

export const LIBRARY_PER_PAGE = 24

export const LIBRARY_SORTS = ["read", "updated", "added", "released", "title", "score"] as const

export const librarySearchSchema = z.object({
  status: z.enum(LIBRARY_STATUSES).optional().catch(undefined),
  sort: z.enum(LIBRARY_SORTS).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})
