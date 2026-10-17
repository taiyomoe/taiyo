import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

const searchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/(?![/\\])/)
    .max(2048)
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect ?? "/" })
    }
  },
})
