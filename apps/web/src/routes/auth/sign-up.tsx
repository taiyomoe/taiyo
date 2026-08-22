import { AuthForm } from "@/components/auth/auth-form"
import { m } from "@/paraglide/messages"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({ meta: [{ title: m.auth_sign_up_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthForm type="sign-up" />
}
