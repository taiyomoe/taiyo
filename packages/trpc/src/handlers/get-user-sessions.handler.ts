import { auth } from "@taiyomoe/auth/server"
import { protectedProcedure } from "../trpc"

export const getUserSessionsHandler = protectedProcedure
  .meta({ resource: "usersSettings", action: "update" })
  .query(async ({ ctx }) => {
    const result = await auth.api.listSessions({ headers: ctx.headers })

    console.log("result", result)

    return result
  })
