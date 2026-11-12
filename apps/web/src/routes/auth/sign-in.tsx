import { createFileRoute } from "@tanstack/react-router"
import { AuthScreen } from "@/features/auth/components/auth-screen"
import { AuthTabs } from "@/features/auth/components/auth-tabs"
import { SignInForm } from "@/features/auth/components/sign-in-form"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({ meta: [{ title: m.auth_sign_in_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthScreen>
      <AuthTabs type="sign-in" />
      <SignInForm />
    </AuthScreen>
  )
}
