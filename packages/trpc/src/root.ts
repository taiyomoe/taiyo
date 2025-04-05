import { getFeaturedMediasHandler } from "./handlers/get-featured-medias-handler"
import { getGroupHoverCardContent } from "./handlers/get-group-hover-card-content"
import { getLatestReleasesHandler } from "./handlers/get-latest-releases-handler"
import { getUserHoverCardContent } from "./handlers/get-user-hover-card-content"
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
  groups: {
    getHoverCardContent: getGroupHoverCardContent,
  },
  users: {
    getHoverCardContent: getUserHoverCardContent,
  },
})

export type AppRouter = typeof appRouter
