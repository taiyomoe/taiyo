import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { AuthScreen } from "@/features/auth/components/auth-screen"
import { ConfirmAccountDeletion } from "@/features/settings/components/account/confirm-account-deletion"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  token: z.string().min(1).max(256).optional().catch(undefined),
})

export const Route = createFileRoute("/account/delete")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: m.account_delete_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  const { session } = Route.useRouteContext()

  return (
    <AuthScreen>
      <ConfirmAccountDeletion token={token} username={session?.user.username ?? ""} />
    </AuthScreen>
  )
}
