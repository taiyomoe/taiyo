import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import {
  groupCreationRequestsQueryOptions,
  ownershipRequestsQueryOptions,
} from "@/features/groups/api/groups"
import { GroupRequestsPage } from "@/features/groups/components/group-requests/group-requests-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  type: z.enum(["creations"]).optional().catch(undefined),
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/group-requests")({
  head: () => ({ meta: [{ title: m.review_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("ownershipRequest.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({
    type: search.type ?? ("claims" as const),
    status: search.status ?? ("PENDING" as const),
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps: { type, status, page } }) => {
    const prefetch = (
      type === "claims"
        ? context.queryClient.query(ownershipRequestsQueryOptions({ status, page }))
        : context.queryClient.query(groupCreationRequestsQueryOptions({ status, page }))
    ).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: GroupRequestsPage,
})
