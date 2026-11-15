import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { api } from "@/lib/api"

const searchSchema = z.object({
  id: z.uuid().optional().catch(undefined),
  to: z.string().optional().catch(undefined),
})
const isSafePath = (path: string | undefined): path is string =>
  path !== undefined && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")

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

    throw redirect({ href: isSafePath(search.to) ? search.to : "/notifications" })
  },
})
