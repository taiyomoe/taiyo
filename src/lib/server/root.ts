import { historyRouter } from "./routers/history.router";
import { mediaChaptersRouter } from "./routers/mediaChapters.router";
import { mediasRouter } from "./routers/medias.router";
import { scansRouter } from "./routers/scans.router";
import { uploadsRouter } from "./routers/uploads.router";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  medias: mediasRouter,
  mediaChapters: mediaChaptersRouter,
  history: historyRouter,
  scans: scansRouter,
  uploads: uploadsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
