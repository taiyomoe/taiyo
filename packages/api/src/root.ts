import { authRouter } from "./router/auth";
import { mediasRouter } from "./router/medias";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  medias: mediasRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
