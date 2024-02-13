import { historyRouter } from "./routers/history.router"
import { libraryRouter } from "./routers/library.router"
import { mdRouter } from "./routers/md.router"
import { mediaChaptersRouter } from "./routers/mediaChapters.router"
import { mediaCoversRouter } from "./routers/mediaCovers.router"
import { mediaTitlesRouter } from "./routers/mediaTitles.router"
import { mediasRouter } from "./routers/medias.router"
import { scansRouter } from "./routers/scans.router"
import { uploadsRouter } from "./routers/uploads.router"
import { createTRPCRouter } from "./trpc"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  medias: mediasRouter,
  mediaCovers: mediaCoversRouter,
  mediaTitles: mediaTitlesRouter,
  mediaChapters: mediaChaptersRouter,
  history: historyRouter,
  libary: libraryRouter,
  scans: scansRouter,
  uploads: uploadsRouter,
  md: mdRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
