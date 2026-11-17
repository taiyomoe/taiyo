import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { StaffsPage } from "@/features/staffs/components/staffs-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.coerce.string().trim().min(1).max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/staffs")({
  head: () => ({ meta: [{ title: m.staffs_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("staff.update")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: StaffsPage,
})
