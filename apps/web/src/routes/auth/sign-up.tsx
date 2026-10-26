import { createFileRoute } from "@tanstack/react-router"
import { AuthForm } from "@/features/auth/components/auth-form"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({ meta: [{ title: m.auth_sign_up_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthForm type="sign-up" />
}
