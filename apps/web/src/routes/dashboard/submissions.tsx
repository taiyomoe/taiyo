import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { MySubmissionsPage } from "@/components/submissions/my-submissions-page"
import { mySubmissionsQueryOptions } from "@/lib/queries/submissions"
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
  component: Submissions,
})

function Submissions() {
  const { page } = Route.useLoaderDeps()

  return <MySubmissionsPage page={page} />
}
