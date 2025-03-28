import { getFeaturedMediasHandler } from "./handlers/get-featured-medias-handler"
import { getLatestReleasesHandler } from "./handlers/get-latest-releases-handler"
import { createTRPCRouter } from "./trpc"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  medias: {
    getFeaturedMedias: getFeaturedMediasHandler,
    getLatestReleases: getLatestReleasesHandler,
  },
})

export type AppRouter = typeof appRouter
