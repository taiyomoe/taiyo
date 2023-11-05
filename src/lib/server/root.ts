import { mediaChaptersRouter } from "./routers/mediaChapters";
import { mediasRouter } from "./routers/medias";
import { scansRouter } from "./routers/scans.router";
import { tagsRouter } from "./routers/tags";
import { uploadsRouter } from "./routers/uploads.router";
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
  scans: scansRouter,
  uploads: uploadsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
