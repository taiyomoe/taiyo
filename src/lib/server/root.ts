import { mediaChaptersRouter } from "./routers/mediaChapters";
import { mediasRouter } from "./routers/medias";
import { tagsRouter } from "./routers/tags";
import { usersRouter } from "./routers/users";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: usersRouter,
  tags: tagsRouter,
  medias: mediasRouter,
  mediaChapters: mediaChaptersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
