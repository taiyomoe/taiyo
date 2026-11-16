import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { AllGroupsPage } from "@/features/groups/components/all-groups/all-groups-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  unowned: z.boolean().optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/all-groups")({
  head: () => ({ meta: [{ title: m.all_groups_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("group.list")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: AllGroupsPage,
})
