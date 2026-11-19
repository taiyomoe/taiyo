import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { ManagedListsPage } from "@/features/lists/components/manage/managed-lists-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/lists")({
  head: () => ({ meta: [{ title: m.lists_manage_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("list.moderate")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: ManagedListsPage,
})
