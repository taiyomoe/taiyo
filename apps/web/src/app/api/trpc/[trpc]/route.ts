import { appRouter, createTRPCContext } from "@taiyomoe/trpc"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { getSession } from "~/utils/get-session"
import { logger } from "~/utils/logger"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () =>
      createTRPCContext({ session: await getSession(), headers: req.headers }),
    onError: ({ error, path }) => {
      if (error.code !== "INTERNAL_SERVER_ERROR") {
        return
      }

      logger.error(`tRPC error on '${path}'`, error)
    },
  })

export { handler as GET, handler as POST }
