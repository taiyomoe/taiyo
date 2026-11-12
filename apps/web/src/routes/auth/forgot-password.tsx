import { createFileRoute } from "@tanstack/react-router"
import { AuthScreen } from "@/features/auth/components/auth-screen"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({ meta: [{ title: m.auth_forgot_password_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthScreen>
      <ForgotPasswordForm />
    </AuthScreen>
  )
}
