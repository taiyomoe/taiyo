import { AuthForm } from "@/components/auth/auth-form"
import { m } from "@/paraglide/messages"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({ meta: [{ title: m.auth_sign_in_meta_title() }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthForm type="sign-in" />
}
