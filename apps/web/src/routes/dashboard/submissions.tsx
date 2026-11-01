import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { mySubmissionsQueryOptions } from "@/features/uploads/api/submissions"
import { SubmissionsPage } from "@/features/uploads/components/submissions/submissions-page"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/submissions")({
  head: () => ({ meta: [{ title: m.submissions_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient.query(mySubmissionsQueryOptions(page)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: SubmissionsPage,
})
