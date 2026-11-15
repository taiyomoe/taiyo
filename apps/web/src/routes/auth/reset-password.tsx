import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { AuthScreen } from "@/features/auth/components/auth-screen"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  token: z.string().min(1).max(256).optional().catch(undefined),
})

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: m.auth_reset_password_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()

  return (
    <AuthScreen>
      <ResetPasswordForm token={token} />
    </AuthScreen>
  )
}
