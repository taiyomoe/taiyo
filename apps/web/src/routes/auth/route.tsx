import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { isInternalPath } from "@/lib/internal-path"

const searchSchema = z.object({
  redirect: z.string().refine(isInternalPath).max(2048).optional().catch(undefined),
  error: z.string().max(100).optional().catch(undefined),
  provider: z.enum(["google", "discord"]).optional().catch(undefined),
})

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect ?? "/" })
    }
  },
})
