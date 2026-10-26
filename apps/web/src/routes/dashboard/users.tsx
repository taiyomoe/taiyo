import { ROLES } from "@taiyomoe/permissions"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { UsersPage } from "@/features/users/components/users/users-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  role: z.enum(ROLES).optional().catch(undefined),
  banned: z.boolean().optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/users")({
  head: () => ({ meta: [{ title: m.users_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("user.list")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: UsersPage,
})
