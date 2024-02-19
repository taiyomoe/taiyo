import { TRPCError } from "@trpc/server"
import type { tRPCInit } from "../trpc"

export const withAuth = (t: tRPCInit) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })
