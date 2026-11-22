import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { api } from "@/lib/api"
import { toInternalPath } from "@/lib/internal-path"

const searchSchema = z.object({
  id: z.uuid().optional().catch(undefined),
  to: z.string().optional().catch(undefined),
})

// A push notification opens this route: it marks the notification read, then goes on to
// what the notification is about.
export const Route = createFileRoute("/notifications_/open")({
  validateSearch: searchSchema,
  beforeLoad: async ({ context, search, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    if (search.id !== undefined) {
      await api.users.me.notifications[":id"].read
        .$post({ param: { id: search.id } })
        .catch(() => undefined)
    }

    throw redirect({ href: toInternalPath(search.to, "/notifications") })
  },
})
