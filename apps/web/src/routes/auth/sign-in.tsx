import { AuthForm } from "@/components/auth/auth-form"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/sign-in")({ component: RouteComponent })

function RouteComponent() {
  return <AuthForm type="sign-in" />
}
