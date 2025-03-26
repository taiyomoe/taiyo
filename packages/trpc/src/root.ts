import { getFeaturedMediasHandler } from "./handlers/get-featured-medias-handler"
import { createTRPCRouter } from "./trpc"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  medias: {
    getFeaturedMedias: getFeaturedMediasHandler,
  },
})

export type AppRouter = typeof appRouter
