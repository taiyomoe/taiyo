/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import type { Session } from "@taiyomoe/auth"
import { cacheClient } from "@taiyomoe/cache"
import { db } from "@taiyomoe/db"
import { initLogger, logsClient } from "@taiyomoe/logs"
import { meilisearchClient } from "@taiyomoe/meilisearch"
import {
  BaseCoversService,
  BaseTitlesService,
  BaseTrackersService,
  BaseUsersService,
} from "@taiyomoe/services"
import type { Actions, Resources } from "@taiyomoe/types"
import { umamiClient } from "@taiyomoe/umami"
import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"
import { withAuth } from "./middlewares/withAuth"
import { withPermissions } from "./middlewares/withPermissions"
import { LibrariesService } from "./services/libraries.trpc-service"
import { MediasService } from "./services/medias.trpc-service"

type Meta = {
  resource?: Resources
  action?: Actions
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  session: Session | null
  headers: Headers
}) => ({
  db,
  meilisearch: meilisearchClient,
  cache: cacheClient,
  logs: logsClient,
  logger: initLogger("taiyo"),
  umami: umamiClient,
  services: {
    users: BaseUsersService,
    libraries: LibrariesService,
    medias: MediasService,
    trackers: BaseTrackersService,
    covers: BaseCoversService,
    titles: BaseTitlesService,
  },
  ...opts,
})

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<Meta>()
  .create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => ({
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }),
  })

export type tRPCInit = typeof t

/**
 * Reusable middlewares
 */
export const authMiddleware = withAuth(t)
const permissionsMiddleware = withPermissions()

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path, ctx }) => {
  const start = Date.now()

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const end = Date.now()

  ctx.logger.debug(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(permissionsMiddleware)
