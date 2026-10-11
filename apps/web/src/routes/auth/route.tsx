import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/auth")({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: "/" })
    }
  },
})
