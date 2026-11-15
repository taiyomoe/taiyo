import { createFileRoute } from "@tanstack/react-router"
import { AuthScreen } from "@/features/auth/components/auth-screen"
import { AuthTabs } from "@/features/auth/components/auth-tabs"
import { SignUpForm } from "@/features/auth/components/sign-up-form"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({ meta: [{ title: m.auth_sign_up_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthScreen>
      <AuthTabs type="sign-up" />
      <SignUpForm />
    </AuthScreen>
  )
}
