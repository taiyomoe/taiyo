import { auth } from "@taiyomoe/auth/server"
import { appRouter, createTRPCContext } from "@taiyomoe/trpc"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { logger } from "~/utils/logger"

const handler = auth((req) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        session: req.auth,
        headers: req.headers,
      }),
    onError({ error, path }) {
      if (error.code !== "INTERNAL_SERVER_ERROR") {
        return
      }

      logger.error(`tRPC error on '${path}'`, error)
    },
  }),
)

export { handler as GET, handler as POST }
