import { auth } from "@taiyomoe/auth"
import { appRouter, createTRPCContext } from "@taiyomoe/trpc"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

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
      console.error(`>>> tRPC Error on '${path}'`, error)
    },
  }),
)

export { handler as GET, handler as POST }
