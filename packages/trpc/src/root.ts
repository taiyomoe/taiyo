import { chaptersRouter } from "./routers/chapters.router"
import { coversRouter } from "./routers/covers.router"
import { historiesRouter } from "./routers/histories.router"
import { librariesRouter } from "./routers/libraries.router"
import { mediasRouter } from "./routers/medias.router"
import { scansRouter } from "./routers/scans.router"
import { titlesRouter } from "./routers/titles.router"
import { usersRouter } from "./routers/users.router"
import { createTRPCRouter } from "./trpc"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  medias: mediasRouter,
  covers: coversRouter,
  titles: titlesRouter,
  chapters: chaptersRouter,
  histories: historiesRouter,
  libraries: librariesRouter,
  scans: scansRouter,
  users: usersRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
